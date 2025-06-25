"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const PDFKit = require("pdfkit");
const fs = require("fs");
const path = require("path");
const academic_record_entity_1 = require("../entities/academic-record.entity");
const student_entity_1 = require("../../students/entities/student.entity");
const settings_service_1 = require("../../settings/settings.service");
let ReportGeneratorService = class ReportGeneratorService {
    constructor(academicRecordsRepository, studentsRepository, settingsService) {
        this.academicRecordsRepository = academicRecordsRepository;
        this.studentsRepository = studentsRepository;
        this.settingsService = settingsService;
        this.reportsDir = path.join(process.cwd(), 'reports');
        this.ensureReportsDirectory();
    }
    async generateStudentReport(studentId, academicYear, options = {}) {
        const isModuleEnabled = await this.settingsService.isModuleEnabled('expedientes');
        if (!isModuleEnabled) {
            throw new common_1.NotFoundException('El módulo de expedientes no está habilitado');
        }
        const config = {
            includeGrades: true,
            includeAttendance: true,
            includeComments: true,
            includeBehavioral: true,
            template: 'standard',
            language: 'es',
            ...options,
        };
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
            throw new common_1.NotFoundException('Estudiante no encontrado');
        }
        const academicRecord = await this.academicRecordsRepository.findOne({
            where: {
                studentId,
                academicYear: academicYear,
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
            throw new common_1.NotFoundException('Expediente académico no encontrado para el año especificado');
        }
        const fileName = `boletin_${student.enrollmentNumber}_${academicYear}_${Date.now()}.pdf`;
        const filePath = path.join(this.reportsDir, fileName);
        await this.createPDFReport(student, academicRecord, filePath, config);
        const stats = fs.statSync(filePath);
        return {
            filePath,
            fileName,
            size: stats.size,
            generatedAt: new Date(),
        };
    }
    async generateClassReport(classGroupId, academicYear, options = {}) {
        const isModuleEnabled = await this.settingsService.isModuleEnabled('expedientes');
        if (!isModuleEnabled) {
            throw new common_1.NotFoundException('El módulo de expedientes no está habilitado');
        }
        const students = await this.studentsRepository.find({
            where: { classGroups: { id: classGroupId } },
            relations: [
                'user',
                'user.profile',
                'classGroup',
            ],
        });
        if (students.length === 0) {
            throw new common_1.NotFoundException('No se encontraron estudiantes para esta clase');
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
    async createPDFReport(student, academicRecord, filePath, options) {
        const doc = new PDFKit({ margin: 50 });
        doc.pipe(fs.createWriteStream(filePath));
        await this.addHeader(doc, options.language);
        this.addStudentInfo(doc, student, academicRecord);
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
        this.addFooter(doc);
        doc.end();
    }
    async createClassSummaryPDF(students, academicYear, filePath, options) {
        const doc = new PDFKit({ margin: 50 });
        doc.pipe(fs.createWriteStream(filePath));
        await this.addHeader(doc, options.language || 'es');
        doc.fontSize(16).text('Reporte de Clase', { align: 'center' });
        doc.moveDown(2);
        for (const student of students) {
            const academicRecord = await this.academicRecordsRepository.findOne({
                where: {
                    studentId: student.id,
                    academicYear: academicYear,
                    isActive: true,
                },
                relations: ['entries'],
            });
            if (academicRecord) {
                doc.fontSize(12).text(`${student.user.profile.firstName} ${student.user.profile.lastName} - Promedio: ${academicRecord.finalGPA || 'N/A'}`);
                doc.moveDown(0.5);
            }
        }
        doc.end();
    }
    async addHeader(doc, language) {
        const schoolName = await this.settingsService.getString('school_name', 'MW Panel Educational Center');
        const schoolAddress = await this.settingsService.getString('school_address', '');
        doc.fontSize(20).text(schoolName, { align: 'center' });
        if (schoolAddress) {
            doc.fontSize(12).text(schoolAddress, { align: 'center' });
        }
        doc.fontSize(16).text(language === 'es' ? 'Boletín de Calificaciones' : 'Academic Report', { align: 'center' });
        doc.moveDown(2);
    }
    addStudentInfo(doc, student, record) {
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
    addAcademicSummary(doc, record) {
        doc.fontSize(12);
        doc.text('RESUMEN ACADÉMICO', { underline: true });
        doc.moveDown(0.5);
        doc.text(`Promedio General: ${record.finalGPA ? record.finalGPA.toFixed(2) : 'N/A'}`);
        doc.text(`Créditos Completados: ${record.completedCredits || 0}/${record.totalCredits || 0}`);
        doc.text(`Porcentaje de Asistencia: ${record.attendancePercentage}%`);
        doc.text(`Estado: ${record.isPromoted ? 'Promovido' : 'En Progreso'}`);
        doc.moveDown(1);
    }
    addGradesSection(doc, record) {
        const academicEntries = record.entries?.filter(entry => entry.type === 'academic') || [];
        if (academicEntries.length === 0)
            return;
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
    addAttendanceSection(doc, record) {
        doc.fontSize(12);
        doc.text('REGISTRO DE ASISTENCIA', { underline: true });
        doc.moveDown(0.5);
        doc.text(`Faltas: ${record.absences}`);
        doc.text(`Retrasos: ${record.tardiness}`);
        doc.text(`Porcentaje de Asistencia: ${record.attendancePercentage}%`);
        doc.moveDown(1);
    }
    addCommentsSection(doc, record) {
        if (!record.observations)
            return;
        doc.fontSize(12);
        doc.text('OBSERVACIONES', { underline: true });
        doc.moveDown(0.5);
        doc.text(record.observations, { width: doc.page.width - 100 });
        doc.moveDown(1);
    }
    addBehavioralSection(doc, record) {
        const behavioralEntries = record.entries?.filter(entry => entry.type === 'behavioral') || [];
        if (behavioralEntries.length === 0)
            return;
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
    addFooter(doc) {
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
    ensureReportsDirectory() {
        if (!fs.existsSync(this.reportsDir)) {
            fs.mkdirSync(this.reportsDir, { recursive: true });
        }
    }
    async deleteReport(fileName) {
        const filePath = path.join(this.reportsDir, fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
    async getReportPath(fileName) {
        const filePath = path.join(this.reportsDir, fileName);
        if (!fs.existsSync(filePath)) {
            throw new common_1.NotFoundException('Archivo de reporte no encontrado');
        }
        return filePath;
    }
};
exports.ReportGeneratorService = ReportGeneratorService;
exports.ReportGeneratorService = ReportGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(academic_record_entity_1.AcademicRecord)),
    __param(1, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        settings_service_1.SettingsService])
], ReportGeneratorService);
//# sourceMappingURL=report-generator.service.js.map