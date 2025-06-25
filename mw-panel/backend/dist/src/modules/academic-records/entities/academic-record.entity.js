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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicRecord = void 0;
const typeorm_1 = require("typeorm");
const student_entity_1 = require("../../students/entities/student.entity");
const academic_record_entry_entity_1 = require("./academic-record-entry.entity");
const academic_record_types_1 = require("./academic-record.types");
let AcademicRecord = class AcademicRecord {
    get completionPercentage() {
        if (!this.totalCredits || this.totalCredits === 0)
            return 0;
        return Math.round((this.completedCredits / this.totalCredits) * 100);
    }
    get attendancePercentage() {
        const typicalSchoolDays = 180;
        const attendedDays = typicalSchoolDays - this.absences;
        return Math.max(0, Math.round((attendedDays / typicalSchoolDays) * 100));
    }
    get isYearComplete() {
        return this.status === academic_record_types_1.RecordStatus.COMPLETED || this.completionPercentage >= 100;
    }
};
exports.AcademicRecord = AcademicRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AcademicRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: academic_record_types_1.AcademicYear,
    }),
    __metadata("design:type", String)
], AcademicRecord.prototype, "academicYear", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: academic_record_types_1.RecordStatus,
        default: academic_record_types_1.RecordStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], AcademicRecord.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 4, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], AcademicRecord.prototype, "finalGPA", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], AcademicRecord.prototype, "totalCredits", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], AcademicRecord.prototype, "completedCredits", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], AcademicRecord.prototype, "absences", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], AcademicRecord.prototype, "tardiness", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AcademicRecord.prototype, "observations", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AcademicRecord.prototype, "achievements", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AcademicRecord.prototype, "disciplinaryRecords", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], AcademicRecord.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], AcademicRecord.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AcademicRecord.prototype, "isPromoted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AcademicRecord.prototype, "promotionNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], AcademicRecord.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AcademicRecord.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AcademicRecord.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], AcademicRecord.prototype, "studentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => student_entity_1.Student),
    (0, typeorm_1.JoinColumn)({ name: 'studentId' }),
    __metadata("design:type", student_entity_1.Student)
], AcademicRecord.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => academic_record_entry_entity_1.AcademicRecordEntry, (entry) => entry.academicRecord),
    __metadata("design:type", Array)
], AcademicRecord.prototype, "entries", void 0);
exports.AcademicRecord = AcademicRecord = __decorate([
    (0, typeorm_1.Entity)('academic_records')
], AcademicRecord);
//# sourceMappingURL=academic-record.entity.js.map