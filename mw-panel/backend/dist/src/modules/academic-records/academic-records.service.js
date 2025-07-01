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
exports.AcademicRecordsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const academic_record_entity_1 = require("./entities/academic-record.entity");
const academic_record_entry_entity_1 = require("./entities/academic-record-entry.entity");
const academic_record_grade_entity_1 = require("./entities/academic-record-grade.entity");
const academic_record_types_1 = require("./entities/academic-record.types");
const student_entity_1 = require("../students/entities/student.entity");
const settings_service_1 = require("../settings/settings.service");
let AcademicRecordsService = class AcademicRecordsService {
    constructor(academicRecordsRepository, entriesRepository, gradesRepository, studentsRepository, settingsService) {
        this.academicRecordsRepository = academicRecordsRepository;
        this.entriesRepository = entriesRepository;
        this.gradesRepository = gradesRepository;
        this.studentsRepository = studentsRepository;
        this.settingsService = settingsService;
    }
    async createRecord(createDto) {
        await this.checkModuleEnabled();
        const student = await this.studentsRepository.findOne({
            where: { id: createDto.studentId },
        });
        if (!student) {
            throw new common_1.NotFoundException('Estudiante no encontrado');
        }
        const existing = await this.academicRecordsRepository.findOne({
            where: {
                studentId: createDto.studentId,
                academicYear: createDto.academicYear,
                isActive: true,
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('Ya existe un expediente académico para este estudiante en el año especificado');
        }
        const record = this.academicRecordsRepository.create({
            ...createDto,
            startDate: createDto.startDate ? new Date(createDto.startDate) : null,
            endDate: createDto.endDate ? new Date(createDto.endDate) : null,
        });
        return this.academicRecordsRepository.save(record);
    }
    async findStudentRecords(studentId, query) {
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
    async findRecordById(id) {
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
            throw new common_1.NotFoundException('Expediente académico no encontrado');
        }
        return record;
    }
    async updateRecord(id, updateDto) {
        await this.checkModuleEnabled();
        const record = await this.findRecordById(id);
        Object.assign(record, updateDto);
        if (updateDto.finalGPA === undefined) {
            record.finalGPA = await this.calculateGPA(record);
        }
        return this.academicRecordsRepository.save(record);
    }
    async deleteRecord(id) {
        await this.checkModuleEnabled();
        const record = await this.findRecordById(id);
        record.isActive = false;
        await this.academicRecordsRepository.save(record);
    }
    async createEntry(createDto) {
        await this.checkModuleEnabled();
        const record = await this.findRecordById(createDto.academicRecordId);
        const entry = this.entriesRepository.create({
            ...createDto,
            entryDate: new Date(createDto.entryDate),
        });
        const saved = await this.entriesRepository.save(entry);
        if (entry.type === academic_record_types_1.EntryType.ACADEMIC) {
            await this.recalculateRecordGPA(record.id);
        }
        return this.findEntryById(saved.id);
    }
    async findEntryById(id) {
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
            throw new common_1.NotFoundException('Entrada del expediente no encontrada');
        }
        return entry;
    }
    async updateEntry(id, updateDto) {
        await this.checkModuleEnabled();
        const entry = await this.findEntryById(id);
        Object.assign(entry, updateDto);
        await this.entriesRepository.save(entry);
        if (entry.type === academic_record_types_1.EntryType.ACADEMIC) {
            await this.recalculateRecordGPA(entry.academicRecordId);
        }
        return this.findEntryById(id);
    }
    async deleteEntry(id) {
        await this.checkModuleEnabled();
        const entry = await this.findEntryById(id);
        entry.isActive = false;
        await this.entriesRepository.save(entry);
        if (entry.type === academic_record_types_1.EntryType.ACADEMIC) {
            await this.recalculateRecordGPA(entry.academicRecordId);
        }
    }
    async createGrade(createDto) {
        await this.checkModuleEnabled();
        const entry = await this.findEntryById(createDto.entryId);
        const grade = this.gradesRepository.create({
            ...createDto,
            gradeDate: new Date(createDto.gradeDate),
            dueDate: createDto.dueDate ? new Date(createDto.dueDate) : null,
        });
        const saved = await this.gradesRepository.save(grade);
        await this.recalculateRecordGPA(entry.academicRecordId);
        return this.findGradeById(saved.id);
    }
    async findGradeById(id) {
        const grade = await this.gradesRepository.findOne({
            where: { id, isActive: true },
            relations: ['entry', 'entry.academicRecord'],
        });
        if (!grade) {
            throw new common_1.NotFoundException('Calificación no encontrada');
        }
        return grade;
    }
    async updateGrade(id, updateDto) {
        await this.checkModuleEnabled();
        const grade = await this.findGradeById(id);
        Object.assign(grade, updateDto);
        await this.gradesRepository.save(grade);
        await this.recalculateRecordGPA(grade.entry.academicRecordId);
        return this.findGradeById(id);
    }
    async deleteGrade(id) {
        await this.checkModuleEnabled();
        const grade = await this.findGradeById(id);
        grade.isActive = false;
        await this.gradesRepository.save(grade);
        await this.recalculateRecordGPA(grade.entry.academicRecordId);
    }
    async getStudentStatistics(studentId, academicYear) {
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
    async calculateGPA(record) {
        const entries = await this.entriesRepository.find({
            where: {
                academicRecordId: record.id,
                type: academic_record_types_1.EntryType.ACADEMIC,
                isActive: true,
            },
            relations: ['grades'],
        });
        if (entries.length === 0)
            return 0;
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
            }
            else if (entry.numericValue !== null && entry.numericValue !== undefined) {
                const weight = entry.credits || 1;
                totalWeightedPoints += entry.numericValue * weight;
                totalWeights += weight;
            }
        });
        return totalWeights > 0 ? Math.round((totalWeightedPoints / totalWeights) * 100) / 100 : 0;
    }
    async recalculateRecordGPA(recordId) {
        const record = await this.academicRecordsRepository.findOne({
            where: { id: recordId },
        });
        if (record) {
            record.finalGPA = await this.calculateGPA(record);
            await this.academicRecordsRepository.save(record);
        }
    }
    async checkModuleEnabled() {
        const isEnabled = await this.settingsService.isModuleEnabled('expedientes');
        if (!isEnabled) {
            throw new common_1.NotFoundException('El módulo de expedientes académicos no está habilitado');
        }
    }
    async syncFromEvaluations(studentId, academicYear) {
        await this.checkModuleEnabled();
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
                status: academic_record_types_1.RecordStatus.ACTIVE,
            });
        }
        return record;
    }
};
exports.AcademicRecordsService = AcademicRecordsService;
exports.AcademicRecordsService = AcademicRecordsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(academic_record_entity_1.AcademicRecord)),
    __param(1, (0, typeorm_1.InjectRepository)(academic_record_entry_entity_1.AcademicRecordEntry)),
    __param(2, (0, typeorm_1.InjectRepository)(academic_record_grade_entity_1.AcademicRecordGrade)),
    __param(3, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        settings_service_1.SettingsService])
], AcademicRecordsService);
//# sourceMappingURL=academic-records.service.js.map