import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicRecord } from './entities/academic-record.entity';
import { AcademicRecordEntry } from './entities/academic-record-entry.entity';
import { AcademicRecordGrade } from './entities/academic-record-grade.entity';
import { AcademicYear, RecordStatus, EntryType } from './entities/academic-record.types';
import { Student } from '../students/entities/student.entity';
import { SettingsService } from '../settings/settings.service';
import {
  CreateAcademicRecordDto,
  UpdateAcademicRecordDto,
  CreateAcademicRecordEntryDto,
  UpdateAcademicRecordEntryDto,
  CreateAcademicRecordGradeDto,
  UpdateAcademicRecordGradeDto,
  AcademicRecordQueryDto,
} from './dto/academic-record.dto';

@Injectable()
export class AcademicRecordsService {
  constructor(
    @InjectRepository(AcademicRecord)
    private academicRecordsRepository: Repository<AcademicRecord>,
    @InjectRepository(AcademicRecordEntry)
    private entriesRepository: Repository<AcademicRecordEntry>,
    @InjectRepository(AcademicRecordGrade)
    private gradesRepository: Repository<AcademicRecordGrade>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    private settingsService: SettingsService,
  ) {}

  // ==================== ACADEMIC RECORDS ====================

  async createRecord(createDto: CreateAcademicRecordDto): Promise<AcademicRecord> {
    // Verificar si el módulo está habilitado
    await this.checkModuleEnabled();

    // Verificar que el estudiante existe
    const student = await this.studentsRepository.findOne({
      where: { id: createDto.studentId },
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Verificar que no existe ya un expediente para este año
    const existing = await this.academicRecordsRepository.findOne({
      where: {
        studentId: createDto.studentId,
        academicYear: createDto.academicYear,
        isActive: true,
      },
    });

    if (existing) {
      throw new BadRequestException('Ya existe un expediente académico para este estudiante en el año especificado');
    }

    const record = this.academicRecordsRepository.create({
      ...createDto,
      startDate: createDto.startDate ? new Date(createDto.startDate) : null,
      endDate: createDto.endDate ? new Date(createDto.endDate) : null,
    });

    return this.academicRecordsRepository.save(record);
  }

  async findStudentRecords(
    studentId: string,
    query: AcademicRecordQueryDto
  ): Promise<{ records: AcademicRecord[]; total: number }> {
    await this.checkModuleEnabled();

    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const offset = (page - 1) * limit;

    const queryBuilder = this.academicRecordsRepository.createQueryBuilder('record')
      .leftJoinAndSelect('record.student', 'student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('record.entries', 'entries')
      .leftJoinAndSelect('entries.subjectAssignment', 'subjectAssignment')
      .leftJoinAndSelect('subjectAssignment.subject', 'subject')
      .where('record.studentId = :studentId', { studentId })
      .andWhere('record.isActive = :isActive', { isActive: true });

    if (query.academicYear) {
      queryBuilder.andWhere('record.academicYear = :academicYear', { academicYear: query.academicYear });
    }

    if (query.status) {
      queryBuilder.andWhere('record.status = :status', { status: query.status });
    }

    queryBuilder.orderBy('record.academicYear', 'DESC');

    const [records, total] = await queryBuilder
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { records, total };
  }

  async findRecordById(id: string): Promise<AcademicRecord> {
    await this.checkModuleEnabled();

    const record = await this.academicRecordsRepository.findOne({
      where: { id, isActive: true },
      relations: [
        'student',
        'student.user',
        'student.user.profile',
        'student.classGroups',
        'entries',
        'entries.subjectAssignment',
        'entries.subjectAssignment.subject',
        'entries.grades',
      ],
    });

    if (!record) {
      throw new NotFoundException('Expediente académico no encontrado');
    }

    return record;
  }

  async updateRecord(id: string, updateDto: UpdateAcademicRecordDto): Promise<AcademicRecord> {
    await this.checkModuleEnabled();

    const record = await this.findRecordById(id);

    Object.assign(record, updateDto);

    // Recalcular promedio si se actualizaron las entradas
    if (updateDto.finalGPA === undefined) {
      record.finalGPA = await this.calculateGPA(record);
    }

    return this.academicRecordsRepository.save(record);
  }

  async deleteRecord(id: string): Promise<void> {
    await this.checkModuleEnabled();

    const record = await this.findRecordById(id);
    record.isActive = false;
    await this.academicRecordsRepository.save(record);
  }

  // ==================== ACADEMIC RECORD ENTRIES ====================

  async createEntry(createDto: CreateAcademicRecordEntryDto): Promise<AcademicRecordEntry> {
    await this.checkModuleEnabled();

    // Verificar que el expediente existe
    const record = await this.findRecordById(createDto.academicRecordId);

    const entry = this.entriesRepository.create({
      ...createDto,
      entryDate: new Date(createDto.entryDate),
    });

    const saved = await this.entriesRepository.save(entry);

    // Recalcular GPA del expediente
    if (entry.type === EntryType.ACADEMIC) {
      await this.recalculateRecordGPA(record.id);
    }

    return this.findEntryById(saved.id);
  }

  async findEntryById(id: string): Promise<AcademicRecordEntry> {
    const entry = await this.entriesRepository.findOne({
      where: { id, isActive: true },
      relations: [
        'academicRecord',
        'subjectAssignment',
        'subjectAssignment.subject',
        'grades',
      ],
    });

    if (!entry) {
      throw new NotFoundException('Entrada del expediente no encontrada');
    }

    return entry;
  }

  async updateEntry(id: string, updateDto: UpdateAcademicRecordEntryDto): Promise<AcademicRecordEntry> {
    await this.checkModuleEnabled();

    const entry = await this.findEntryById(id);

    Object.assign(entry, updateDto);
    await this.entriesRepository.save(entry);

    // Recalcular GPA si es una entrada académica
    if (entry.type === EntryType.ACADEMIC) {
      await this.recalculateRecordGPA(entry.academicRecordId);
    }

    return this.findEntryById(id);
  }

  async deleteEntry(id: string): Promise<void> {
    await this.checkModuleEnabled();

    const entry = await this.findEntryById(id);
    entry.isActive = false;
    await this.entriesRepository.save(entry);

    // Recalcular GPA si es una entrada académica
    if (entry.type === EntryType.ACADEMIC) {
      await this.recalculateRecordGPA(entry.academicRecordId);
    }
  }

  // ==================== ACADEMIC RECORD GRADES ====================

  async createGrade(createDto: CreateAcademicRecordGradeDto): Promise<AcademicRecordGrade> {
    await this.checkModuleEnabled();

    // Verificar que la entrada existe
    const entry = await this.findEntryById(createDto.entryId);

    const grade = this.gradesRepository.create({
      ...createDto,
      gradeDate: new Date(createDto.gradeDate),
      dueDate: createDto.dueDate ? new Date(createDto.dueDate) : null,
    });

    const saved = await this.gradesRepository.save(grade);

    // Recalcular GPA
    await this.recalculateRecordGPA(entry.academicRecordId);

    return this.findGradeById(saved.id);
  }

  async findGradeById(id: string): Promise<AcademicRecordGrade> {
    const grade = await this.gradesRepository.findOne({
      where: { id, isActive: true },
      relations: ['entry', 'entry.academicRecord'],
    });

    if (!grade) {
      throw new NotFoundException('Calificación no encontrada');
    }

    return grade;
  }

  async updateGrade(id: string, updateDto: UpdateAcademicRecordGradeDto): Promise<AcademicRecordGrade> {
    await this.checkModuleEnabled();

    const grade = await this.findGradeById(id);

    Object.assign(grade, updateDto);
    await this.gradesRepository.save(grade);

    // Recalcular GPA
    await this.recalculateRecordGPA(grade.entry.academicRecordId);

    return this.findGradeById(id);
  }

  async deleteGrade(id: string): Promise<void> {
    await this.checkModuleEnabled();

    const grade = await this.findGradeById(id);
    grade.isActive = false;
    await this.gradesRepository.save(grade);

    // Recalcular GPA
    await this.recalculateRecordGPA(grade.entry.academicRecordId);
  }

  // ==================== STATISTICS ====================

  async getStudentStatistics(studentId: string, academicYear?: AcademicYear): Promise<any> {
    await this.checkModuleEnabled();

    const queryBuilder = this.academicRecordsRepository.createQueryBuilder('record')
      .leftJoinAndSelect('record.entries', 'entries')
      .leftJoinAndSelect('entries.grades', 'grades')
      .where('record.studentId = :studentId', { studentId })
      .andWhere('record.isActive = :isActive', { isActive: true });

    if (academicYear) {
      queryBuilder.andWhere('record.academicYear = :academicYear', { academicYear });
    }

    const records = await queryBuilder.getMany();

    if (records.length === 0) {
      return {
        totalRecords: 0,
        averageGPA: 0,
        totalCredits: 0,
        completedCredits: 0,
        attendanceRate: 0,
      };
    }

    const totalRecords = records.length;
    const totalGPA = records.reduce((sum, record) => sum + (record.finalGPA || 0), 0);
    const averageGPA = totalGPA / totalRecords;
    const totalCredits = records.reduce((sum, record) => sum + (record.totalCredits || 0), 0);
    const completedCredits = records.reduce((sum, record) => sum + (record.completedCredits || 0), 0);
    const averageAttendance = records.reduce((sum, record) => sum + record.attendancePercentage, 0) / totalRecords;

    return {
      totalRecords,
      averageGPA: Math.round(averageGPA * 100) / 100,
      totalCredits,
      completedCredits,
      attendanceRate: Math.round(averageAttendance),
    };
  }

  // ==================== UTILITIES ====================

  private async calculateGPA(record: AcademicRecord): Promise<number> {
    const entries = await this.entriesRepository.find({
      where: {
        academicRecordId: record.id,
        type: EntryType.ACADEMIC,
        isActive: true,
      },
      relations: ['grades'],
    });

    if (entries.length === 0) return 0;

    let totalWeightedPoints = 0;
    let totalWeights = 0;

    entries.forEach(entry => {
      if (entry.grades && entry.grades.length > 0) {
        entry.grades.forEach(grade => {
          if (!grade.isDropped && grade.isActive) {
            const weight = grade.weight || 1;
            totalWeightedPoints += grade.percentage * weight;
            totalWeights += weight;
          }
        });
      } else if (entry.numericValue !== null && entry.numericValue !== undefined) {
        const weight = entry.credits || 1;
        totalWeightedPoints += entry.numericValue * weight;
        totalWeights += weight;
      }
    });

    return totalWeights > 0 ? Math.round((totalWeightedPoints / totalWeights) * 100) / 100 : 0;
  }

  private async recalculateRecordGPA(recordId: string): Promise<void> {
    const record = await this.academicRecordsRepository.findOne({
      where: { id: recordId },
    });

    if (record) {
      record.finalGPA = await this.calculateGPA(record);
      await this.academicRecordsRepository.save(record);
    }
  }

  private async checkModuleEnabled(): Promise<void> {
    const isEnabled = await this.settingsService.isModuleEnabled('expedientes');
    if (!isEnabled) {
      throw new NotFoundException('El módulo de expedientes académicos no está habilitado');
    }
  }

  // ==================== INTEGRATION WITH EVALUATIONS ====================

  async syncFromEvaluations(studentId: string, academicYear: AcademicYear): Promise<AcademicRecord> {
    await this.checkModuleEnabled();

    // Esta función sincronizará las evaluaciones existentes con el expediente
    // Se implementará la lógica específica según el sistema de evaluaciones existente
    
    let record = await this.academicRecordsRepository.findOne({
      where: {
        studentId,
        academicYear,
        isActive: true,
      },
    });

    if (!record) {
      record = await this.createRecord({
        studentId,
        academicYear,
        status: RecordStatus.ACTIVE,
      });
    }

    // TODO: Implementar sincronización con el módulo de evaluaciones existente
    // Esto requeriría acceso al servicio de evaluaciones para obtener las calificaciones

    return record;
  }
}