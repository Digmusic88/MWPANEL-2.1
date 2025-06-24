import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as PDFKit from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { AcademicRecord } from '../entities/academic-record.entity';
import { AcademicRecordEntry } from '../entities/academic-record-entry.entity';
import { Student } from '../../students/entities/student.entity';
import { SettingsService } from '../../settings/settings.service';

export interface ReportGenerationOptions {
  includeGrades: boolean;
  includeAttendance: boolean;
  includeComments: boolean;
  includeBehavioral: boolean;
  template: 'standard' | 'detailed' | 'summary';
  language: 'es' | 'en';
}

export interface GeneratedReport {
  filePath: string;
  fileName: string;
  size: number;
  generatedAt: Date;
}

@Injectable()
export class ReportGeneratorService {
  private readonly reportsDir = path.join(process.cwd(), 'reports');

  constructor(
    @InjectRepository(AcademicRecord)
    private academicRecordsRepository: Repository<AcademicRecord>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    private settingsService: SettingsService,
  ) {
    this.ensureReportsDirectory();
  }

  async generateStudentReport(
    studentId: string,
    academicYear: string,
    options: Partial<ReportGenerationOptions> = {}
  ): Promise<GeneratedReport> {
    // Verificar si el módulo está habilitado
    const isModuleEnabled = await this.settingsService.isModuleEnabled('expedientes');
    if (!isModuleEnabled) {
      throw new NotFoundException('El módulo de expedientes no está habilitado');
    }

    // Configuración por defecto
    const config: ReportGenerationOptions = {
      includeGrades: true,
      includeAttendance: true,
      includeComments: true,
      includeBehavioral: true,
      template: 'standard',
      language: 'es',
      ...options,
    };

    // Obtener datos del estudiante
    const student = await this.studentsRepository.findOne({
      where: { id: studentId },
      relations: [
        'user',
        'user.profile',
        'classGroup',
        'educationalLevel',
        'course',
      ],
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Obtener expediente académico
    const academicRecord = await this.academicRecordsRepository.findOne({
      where: { 
        studentId, 
        academicYear: academicYear as any,
        isActive: true,
      },
      relations: [
        'entries',
        'entries.subjectAssignment',
        'entries.subjectAssignment.subject',
        'entries.grades',
      ],
    });

    if (!academicRecord) {
      throw new NotFoundException('Expediente académico no encontrado para el año especificado');
    }

    // Generar PDF
    const fileName = `boletin_${student.enrollmentNumber}_${academicYear}_${Date.now()}.pdf`;
    const filePath = path.join(this.reportsDir, fileName);

    await this.createPDFReport(student, academicRecord, filePath, config);

    // Obtener información del archivo generado
    const stats = fs.statSync(filePath);

    return {
      filePath,
      fileName,
      size: stats.size,
      generatedAt: new Date(),
    };
  }

  async generateClassReport(
    classGroupId: string,
    academicYear: string,
    options: Partial<ReportGenerationOptions> = {}
  ): Promise<GeneratedReport> {
    // Verificar si el módulo está habilitado
    const isModuleEnabled = await this.settingsService.isModuleEnabled('expedientes');
    if (!isModuleEnabled) {
      throw new NotFoundException('El módulo de expedientes no está habilitado');
    }

    // Obtener todos los estudiantes de la clase
    const students = await this.studentsRepository.find({
      where: { classGroups: { id: classGroupId } },
      relations: [
        'user',
        'user.profile',
        'classGroup',
      ],
    });

    if (students.length === 0) {
      throw new NotFoundException('No se encontraron estudiantes para esta clase');
    }

    const fileName = `reporte_clase_${classGroupId}_${academicYear}_${Date.now()}.pdf`;
    const filePath = path.join(this.reportsDir, fileName);

    await this.createClassSummaryPDF(students, academicYear, filePath, options);

    const stats = fs.statSync(filePath);

    return {
      filePath,
      fileName,
      size: stats.size,
      generatedAt: new Date(),
    };
  }

  private async createPDFReport(
    student: Student,
    academicRecord: AcademicRecord,
    filePath: string,
    options: ReportGenerationOptions
  ): Promise<void> {
    const doc = new PDFKit({ margin: 50 });
    
    // Pipe to file
    doc.pipe(fs.createWriteStream(filePath));

    // Header
    await this.addHeader(doc, options.language);
    
    // Student Info
    this.addStudentInfo(doc, student, academicRecord);
    
    // Academic Summary
    this.addAcademicSummary(doc, academicRecord);

    if (options.includeGrades) {
      this.addGradesSection(doc, academicRecord);
    }

    if (options.includeAttendance) {
      this.addAttendanceSection(doc, academicRecord);
    }

    if (options.includeComments) {
      this.addCommentsSection(doc, academicRecord);
    }

    if (options.includeBehavioral) {
      this.addBehavioralSection(doc, academicRecord);
    }

    // Footer
    this.addFooter(doc);

    doc.end();
  }

  private async createClassSummaryPDF(
    students: Student[],
    academicYear: string,
    filePath: string,
    options: Partial<ReportGenerationOptions>
  ): Promise<void> {
    const doc = new PDFKit({ margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));

    // Header
    await this.addHeader(doc, options.language || 'es');
    
    doc.fontSize(16).text('Reporte de Clase', { align: 'center' });
    doc.moveDown(2);

    // Students summary table
    for (const student of students) {
      const academicRecord = await this.academicRecordsRepository.findOne({
        where: { 
          studentId: student.id, 
          academicYear: academicYear as any,
          isActive: true,
        },
        relations: ['entries'],
      });

      if (academicRecord) {
        doc.fontSize(12).text(
          `${student.user.profile.firstName} ${student.user.profile.lastName} - Promedio: ${academicRecord.finalGPA || 'N/A'}`
        );
        doc.moveDown(0.5);
      }
    }

    doc.end();
  }

  private async addHeader(doc: any, language: string): Promise<void> {
    const schoolName = await this.settingsService.getString('school_name', 'MW Panel Educational Center');
    const schoolAddress = await this.settingsService.getString('school_address', '');
    
    doc.fontSize(20).text(schoolName, { align: 'center' });
    
    if (schoolAddress) {
      doc.fontSize(12).text(schoolAddress, { align: 'center' });
    }
    
    doc.fontSize(16).text(
      language === 'es' ? 'Boletín de Calificaciones' : 'Academic Report',
      { align: 'center' }
    );
    
    doc.moveDown(2);
  }

  private addStudentInfo(doc: any, student: Student, record: AcademicRecord): void {
    const y = doc.y;
    
    doc.fontSize(12);
    doc.text('INFORMACIÓN DEL ESTUDIANTE', { underline: true });
    doc.moveDown(0.5);
    
    doc.text(`Nombre: ${student.user.profile.firstName} ${student.user.profile.lastName}`);
    doc.text(`Número de Matrícula: ${student.enrollmentNumber}`);
    doc.text(`Clase: ${student.classGroups?.[0]?.name || 'N/A'}`);
    doc.text(`Año Académico: ${record.academicYear}`);
    doc.text(`Período: ${record.startDate ? new Date(record.startDate).getFullYear() : ''} - ${record.endDate ? new Date(record.endDate).getFullYear() : ''}`);
    
    doc.moveDown(1);
  }

  private addAcademicSummary(doc: any, record: AcademicRecord): void {
    doc.fontSize(12);
    doc.text('RESUMEN ACADÉMICO', { underline: true });
    doc.moveDown(0.5);
    
    doc.text(`Promedio General: ${record.finalGPA ? record.finalGPA.toFixed(2) : 'N/A'}`);
    doc.text(`Créditos Completados: ${record.completedCredits || 0}/${record.totalCredits || 0}`);
    doc.text(`Porcentaje de Asistencia: ${record.attendancePercentage}%`);
    doc.text(`Estado: ${record.isPromoted ? 'Promovido' : 'En Progreso'}`);
    
    doc.moveDown(1);
  }

  private addGradesSection(doc: any, record: AcademicRecord): void {
    const academicEntries = record.entries?.filter(entry => entry.type === 'academic') || [];
    
    if (academicEntries.length === 0) return;
    
    doc.fontSize(12);
    doc.text('CALIFICACIONES POR ASIGNATURA', { underline: true });
    doc.moveDown(0.5);

    academicEntries.forEach(entry => {
      const subjectName = entry.subjectAssignment?.subject?.name || 'Asignatura';
      const grade = entry.displayGrade;
      const credits = entry.credits || 0;
      
      doc.text(`${subjectName}: ${grade} (${credits} créditos)`);
      
      if (entry.comments) {
        doc.fontSize(10).text(`   Comentarios: ${entry.comments}`, { color: 'gray' });
        doc.fontSize(12);
      }
      
      doc.moveDown(0.3);
    });
    
    doc.moveDown(1);
  }

  private addAttendanceSection(doc: any, record: AcademicRecord): void {
    doc.fontSize(12);
    doc.text('REGISTRO DE ASISTENCIA', { underline: true });
    doc.moveDown(0.5);
    
    doc.text(`Faltas: ${record.absences}`);
    doc.text(`Retrasos: ${record.tardiness}`);
    doc.text(`Porcentaje de Asistencia: ${record.attendancePercentage}%`);
    
    doc.moveDown(1);
  }

  private addCommentsSection(doc: any, record: AcademicRecord): void {
    if (!record.observations) return;
    
    doc.fontSize(12);
    doc.text('OBSERVACIONES', { underline: true });
    doc.moveDown(0.5);
    
    doc.text(record.observations, { width: doc.page.width - 100 });
    doc.moveDown(1);
  }

  private addBehavioralSection(doc: any, record: AcademicRecord): void {
    const behavioralEntries = record.entries?.filter(entry => entry.type === 'behavioral') || [];
    
    if (behavioralEntries.length === 0) return;
    
    doc.fontSize(12);
    doc.text('REGISTRO DE COMPORTAMIENTO', { underline: true });
    doc.moveDown(0.5);

    behavioralEntries.forEach(entry => {
      doc.text(`${entry.title}: ${entry.description || ''}`);
      doc.fontSize(10).text(`   Fecha: ${new Date(entry.entryDate).toLocaleDateString('es-ES')}`, { color: 'gray' });
      doc.fontSize(12);
      doc.moveDown(0.3);
    });
    
    doc.moveDown(1);
  }

  private addFooter(doc: any): void {
    const currentDate = new Date().toLocaleDateString('es-ES');
    
    doc.fontSize(10);
    doc.text(`Generado el: ${currentDate}`, {
      align: 'center',
      width: doc.page.width - 100,
    });
    
    doc.text('Este documento es un reporte académico oficial', {
      align: 'center',
      width: doc.page.width - 100,
    });
  }

  private ensureReportsDirectory(): void {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async deleteReport(fileName: string): Promise<void> {
    const filePath = path.join(this.reportsDir, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async getReportPath(fileName: string): Promise<string> {
    const filePath = path.join(this.reportsDir, fileName);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Archivo de reporte no encontrado');
    }
    return filePath;
  }
}