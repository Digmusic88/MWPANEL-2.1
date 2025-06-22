import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EnrollmentService } from '../enrollment.service';
import { BulkEnrollmentRowDto, BulkImportResult, BulkImportError, BulkImportWarning } from '../dto/bulk-import.dto';
import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';
import { User } from '../../users/entities/user.entity';
import { Student } from '../../students/entities/student.entity';
import { EducationalLevel } from '../../students/entities/educational-level.entity';
import { Course } from '../../students/entities/course.entity';
import * as XLSX from 'xlsx';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class BulkImportService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(EducationalLevel)
    private educationalLevelsRepository: Repository<EducationalLevel>,
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    private dataSource: DataSource,
    private enrollmentService: EnrollmentService,
  ) {}

  async processBulkImport(file: any): Promise<BulkImportResult> {
    const result: BulkImportResult = {
      totalRows: 0,
      successfulImports: 0,
      failedImports: 0,
      errors: [],
      warnings: [],
      importedStudents: [],
    };

    try {
      // Parse file based on extension
      const data = await this.parseFile(file);
      result.totalRows = data.length;

      // Pre-validate educational levels and courses
      const educationalLevels = await this.educationalLevelsRepository.find();
      const courses = await this.coursesRepository.find({ relations: ['educationalLevel'] });

      // Process each row
      for (let i = 0; i < data.length; i++) {
        const rowNumber = i + 2; // +2 because Excel rows start at 1 and we have header
        const rowData = data[i];

        try {
          // Transform and validate row data
          const enrollmentRow = await this.validateAndTransformRow(rowData, rowNumber, educationalLevels, courses);
          
          if (!enrollmentRow) {
            result.failedImports++;
            continue;
          }

          // Convert to enrollment DTO format
          const enrollmentDto = this.convertToEnrollmentDto(enrollmentRow);

          // Process enrollment through existing service
          const enrollmentResult = await this.enrollmentService.processEnrollment(enrollmentDto);

          // Record successful import
          result.successfulImports++;
          result.importedStudents.push({
            rowNumber,
            studentName: `${enrollmentRow.studentFirstName} ${enrollmentRow.studentLastName}`,
            enrollmentNumber: enrollmentResult.student.enrollmentNumber,
            familyId: enrollmentResult.family.id,
          });

        } catch (error) {
          result.failedImports++;
          result.errors.push({
            rowNumber,
            message: error.message || 'Error desconocido durante el procesamiento',
            originalData: rowData,
          });
        }
      }

      return result;

    } catch (error) {
      throw new BadRequestException(`Error procesando archivo: ${error.message}`);
    }
  }

  private async parseFile(file: any): Promise<any[]> {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with headers
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      blankrows: false
    });

    if (data.length < 2) {
      throw new BadRequestException('El archivo debe contener al menos una fila de datos además de la cabecera');
    }

    // Get headers and data rows
    const headers = data[0] as string[];
    const rows = data.slice(1);

    // Convert to object format
    return rows.map(row => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[this.normalizeColumnName(header)] = row[index] || '';
      });
      return obj;
    });
  }

  private normalizeColumnName(columnName: string): string {
    // Normalize column names to match our DTO properties
    const columnMap: { [key: string]: string } = {
      // Student fields
      'nombre del estudiante': 'studentFirstName',
      'apellidos del estudiante': 'studentLastName',
      'email del estudiante': 'studentEmail',
      'contraseña del estudiante': 'studentPassword',
      'fecha de nacimiento del estudiante': 'studentBirthDate',
      'dni/nie del estudiante': 'studentDocumentNumber',
      'teléfono del estudiante': 'studentPhone',
      'número de matrícula': 'enrollmentNumber',
      'nivel educativo': 'educationalLevelId',
      'curso': 'courseId',
      
      // Primary contact fields
      'nombre del contacto principal': 'primaryFirstName',
      'apellidos del contacto principal': 'primaryLastName',
      'email del contacto principal': 'primaryEmail',
      'contraseña del contacto principal': 'primaryPassword',
      'teléfono del contacto principal': 'primaryPhone',
      'dni/nie del contacto principal': 'primaryDocumentNumber',
      'fecha de nacimiento del contacto principal': 'primaryDateOfBirth',
      'dirección del contacto principal': 'primaryAddress',
      'ocupación del contacto principal': 'primaryOccupation',
      'relación con el estudiante (principal)': 'relationshipToPrimary',
      
      // Secondary contact fields
      '¿tiene contacto secundario?': 'hasSecondaryContact',
      'nombre del contacto secundario': 'secondaryFirstName',
      'apellidos del contacto secundario': 'secondaryLastName',
      'email del contacto secundario': 'secondaryEmail',
      'contraseña del contacto secundario': 'secondaryPassword',
      'teléfono del contacto secundario': 'secondaryPhone',
      'dni/nie del contacto secundario': 'secondaryDocumentNumber',
      'fecha de nacimiento del contacto secundario': 'secondaryDateOfBirth',
      'dirección del contacto secundario': 'secondaryAddress',
      'ocupación del contacto secundario': 'secondaryOccupation',
      'relación con el estudiante (secundario)': 'relationshipToSecondary',
    };

    const normalizedKey = columnName.toLowerCase().trim();
    return columnMap[normalizedKey] || columnName.replace(/\s+/g, '');
  }

  private async validateAndTransformRow(
    rowData: any, 
    rowNumber: number, 
    educationalLevels: EducationalLevel[], 
    courses: Course[]
  ): Promise<BulkEnrollmentRowDto | null> {
    
    // Transform educational level name to ID
    if (rowData.educationalLevelId && typeof rowData.educationalLevelId === 'string') {
      const level = educationalLevels.find(l => 
        l.name.toLowerCase() === rowData.educationalLevelId.toLowerCase()
      );
      if (level) {
        rowData.educationalLevelId = level.id;
      } else {
        throw new Error(`Nivel educativo no encontrado: ${rowData.educationalLevelId}`);
      }
    }

    // Transform course name to ID
    if (rowData.courseId && typeof rowData.courseId === 'string') {
      const course = courses.find(c => 
        c.name.toLowerCase() === rowData.courseId.toLowerCase()
      );
      if (course) {
        rowData.courseId = course.id;
      } else {
        throw new Error(`Curso no encontrado: ${rowData.courseId}`);
      }
    }

    // Handle boolean conversion for hasSecondaryContact
    if (rowData.hasSecondaryContact) {
      const value = String(rowData.hasSecondaryContact).toLowerCase();
      rowData.hasSecondaryContact = ['sí', 'si', 'yes', 'true', '1'].includes(value);
    }

    // Create DTO instance and validate
    const enrollmentRow = plainToClass(BulkEnrollmentRowDto, rowData);
    const errors = await validate(enrollmentRow);

    if (errors.length > 0) {
      const errorMessages = errors.map(error => 
        Object.values(error.constraints || {}).join(', ')
      ).join('; ');
      throw new Error(`Errores de validación: ${errorMessages}`);
    }

    return enrollmentRow;
  }

  private convertToEnrollmentDto(rowData: BulkEnrollmentRowDto): CreateEnrollmentDto {
    return {
      student: {
        firstName: rowData.studentFirstName,
        lastName: rowData.studentLastName,
        email: rowData.studentEmail,
        password: rowData.studentPassword,
        birthDate: rowData.studentBirthDate,
        documentNumber: rowData.studentDocumentNumber,
        phone: rowData.studentPhone,
        enrollmentNumber: rowData.enrollmentNumber,
        educationalLevelId: rowData.educationalLevelId,
        courseId: rowData.courseId,
        classGroupIds: [],
      },
      family: {
        primaryContact: {
          firstName: rowData.primaryFirstName,
          lastName: rowData.primaryLastName,
          email: rowData.primaryEmail,
          password: rowData.primaryPassword,
          phone: rowData.primaryPhone,
          documentNumber: rowData.primaryDocumentNumber,
          dateOfBirth: rowData.primaryDateOfBirth,
          address: rowData.primaryAddress,
          occupation: rowData.primaryOccupation,
        },
        ...(rowData.hasSecondaryContact && rowData.secondaryEmail && {
          secondaryContact: {
            firstName: rowData.secondaryFirstName!,
            lastName: rowData.secondaryLastName!,
            email: rowData.secondaryEmail,
            password: rowData.secondaryPassword!,
            phone: rowData.secondaryPhone!,
            documentNumber: rowData.secondaryDocumentNumber,
            dateOfBirth: rowData.secondaryDateOfBirth,
            address: rowData.secondaryAddress,
            occupation: rowData.secondaryOccupation,
          },
        }),
        relationship: rowData.relationshipToPrimary,
      },
    } as CreateEnrollmentDto;
  }

  async generateTemplate(): Promise<Buffer> {
    const headers = [
      'Nombre del Estudiante',
      'Apellidos del Estudiante', 
      'Email del Estudiante',
      'Contraseña del Estudiante',
      'Fecha de Nacimiento del Estudiante',
      'DNI/NIE del Estudiante',
      'Teléfono del Estudiante',
      'Número de Matrícula',
      'Nivel Educativo',
      'Curso',
      'Nombre del Contacto Principal',
      'Apellidos del Contacto Principal',
      'Email del Contacto Principal',
      'Contraseña del Contacto Principal',
      'Teléfono del Contacto Principal',
      'DNI/NIE del Contacto Principal',
      'Fecha de Nacimiento del Contacto Principal',
      'Dirección del Contacto Principal',
      'Ocupación del Contacto Principal',
      'Relación con el Estudiante (Principal)',
      '¿Tiene Contacto Secundario?',
      'Nombre del Contacto Secundario',
      'Apellidos del Contacto Secundario',
      'Email del Contacto Secundario',
      'Contraseña del Contacto Secundario',
      'Teléfono del Contacto Secundario',
      'DNI/NIE del Contacto Secundario',
      'Fecha de Nacimiento del Contacto Secundario',
      'Dirección del Contacto Secundario',
      'Ocupación del Contacto Secundario',
      'Relación con el Estudiante (Secundario)',
    ];

    const exampleRow = [
      'Juan Carlos',
      'Pérez González',
      'juan.perez@ejemplo.com',
      'password123',
      '2010-05-15',
      '12345678A',
      '666123456',
      '', // Auto-generated if empty
      'Educación Primaria',
      '1º Primaria',
      'María',
      'González López',
      'maria.gonzalez@ejemplo.com',
      'password123',
      '666987654',
      '87654321B',
      '1985-03-20',
      'Calle Mayor 123, Madrid',
      'Enfermera',
      'mother',
      'Sí',
      'Carlos',
      'Pérez Martín',
      'carlos.perez@ejemplo.com',
      'password123',
      '666555444',
      '11223344C',
      '1982-08-10',
      'Calle Mayor 123, Madrid',
      'Ingeniero',
      'father',
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
    
    // Set column widths
    const colWidths = headers.map(() => ({ wch: 25 }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Inscripción');

    // Add instructions sheet
    const instructionsHeaders = ['Campo', 'Descripción', 'Obligatorio', 'Formato/Opciones'];
    const instructions = [
      ['Nombre del Estudiante', 'Nombre propio del estudiante', 'Sí', 'Texto'],
      ['Apellidos del Estudiante', 'Apellidos completos del estudiante', 'Sí', 'Texto'],
      ['Email del Estudiante', 'Correo electrónico único del estudiante', 'Sí', 'ejemplo@dominio.com'],
      ['Contraseña del Estudiante', 'Contraseña de acceso (mínimo 6 caracteres)', 'Sí', 'Texto'],
      ['Fecha de Nacimiento del Estudiante', 'Fecha de nacimiento', 'Sí', 'YYYY-MM-DD (ej: 2010-05-15)'],
      ['DNI/NIE del Estudiante', 'Documento de identidad', 'No', '12345678A'],
      ['Teléfono del Estudiante', 'Número de teléfono', 'No', '+34 600 000 000'],
      ['Número de Matrícula', 'Número único de matrícula (se genera automáticamente si se deja vacío)', 'No', 'MW-2025-0001'],
      ['Nivel Educativo', 'Nivel educativo del estudiante', 'Sí', 'Educación Infantil, Educación Primaria, Educación Secundaria'],
      ['Curso', 'Curso específico dentro del nivel', 'No', '1º Primaria, 2º Primaria, etc.'],
      ['Nombre del Contacto Principal', 'Nombre del primer contacto familiar', 'Sí', 'Texto'],
      ['Apellidos del Contacto Principal', 'Apellidos del primer contacto familiar', 'Sí', 'Texto'],
      ['Email del Contacto Principal', 'Email único del contacto principal', 'Sí', 'ejemplo@dominio.com'],
      ['Contraseña del Contacto Principal', 'Contraseña de acceso (mínimo 6 caracteres)', 'Sí', 'Texto'],
      ['Teléfono del Contacto Principal', 'Teléfono del contacto principal', 'Sí', '+34 600 000 000'],
      ['Relación con el Estudiante (Principal)', 'Relación familiar', 'Sí', 'father, mother, guardian, other'],
      ['¿Tiene Contacto Secundario?', 'Indica si hay un segundo contacto', 'No', 'Sí/No, Si/No, Yes/No, True/False, 1/0'],
      ['Email del Contacto Secundario', 'Email del segundo contacto (si existe)', 'Solo si tiene contacto secundario', 'ejemplo@dominio.com'],
      ['Relación con el Estudiante (Secundario)', 'Relación del segundo contacto', 'Solo si tiene contacto secundario', 'father, mother, guardian, other'],
    ];

    const instructionsWs = XLSX.utils.aoa_to_sheet([instructionsHeaders, ...instructions]);
    instructionsWs['!cols'] = [{ wch: 30 }, { wch: 50 }, { wch: 15 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instrucciones');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}