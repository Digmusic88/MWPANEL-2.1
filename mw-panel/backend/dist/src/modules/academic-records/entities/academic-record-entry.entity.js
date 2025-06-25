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
exports.AcademicRecordEntry = void 0;
const typeorm_1 = require("typeorm");
const academic_record_entity_1 = require("./academic-record.entity");
const subject_assignment_entity_1 = require("../../students/entities/subject-assignment.entity");
const academic_record_grade_entity_1 = require("./academic-record-grade.entity");
const academic_record_types_1 = require("./academic-record.types");
let AcademicRecordEntry = class AcademicRecordEntry {
    get gradePoint() {
        const gradePoints = {
            'A+': 4.0, 'A': 4.0, 'A-': 3.7,
            'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7,
            'D+': 1.3, 'D': 1.0, 'D-': 0.7,
            'F': 0.0,
        };
        if (this.letterGrade && gradePoints[this.letterGrade] !== undefined) {
            return gradePoints[this.letterGrade];
        }
        if (this.numericValue !== null && this.numericValue !== undefined) {
            if (this.numericValue >= 90)
                return 4.0;
            if (this.numericValue >= 80)
                return 3.0;
            if (this.numericValue >= 70)
                return 2.0;
            if (this.numericValue >= 60)
                return 1.0;
            return 0.0;
        }
        return 0.0;
    }
    get displayGrade() {
        if (this.isExempt)
            return 'EX';
        if (this.letterGrade)
            return this.letterGrade;
        if (this.numericValue !== null && this.numericValue !== undefined) {
            return this.numericValue.toString();
        }
        return 'N/A';
    }
};
exports.AcademicRecordEntry = AcademicRecordEntry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AcademicRecordEntry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: academic_record_types_1.EntryType,
        default: academic_record_types_1.EntryType.ACADEMIC,
    }),
    __metadata("design:type", String)
], AcademicRecordEntry.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: academic_record_types_1.AcademicPeriod,
    }),
    __metadata("design:type", String)
], AcademicRecordEntry.prototype, "period", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], AcademicRecordEntry.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AcademicRecordEntry.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], AcademicRecordEntry.prototype, "entryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 4, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], AcademicRecordEntry.prototype, "numericValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], AcademicRecordEntry.prototype, "letterGrade", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AcademicRecordEntry.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], AcademicRecordEntry.prototype, "credits", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AcademicRecordEntry.prototype, "isPassing", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AcademicRecordEntry.prototype, "isExempt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AcademicRecordEntry.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], AcademicRecordEntry.prototype, "enteredBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], AcademicRecordEntry.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AcademicRecordEntry.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AcademicRecordEntry.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], AcademicRecordEntry.prototype, "academicRecordId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => academic_record_entity_1.AcademicRecord, (record) => record.entries),
    (0, typeorm_1.JoinColumn)({ name: 'academicRecordId' }),
    __metadata("design:type", academic_record_entity_1.AcademicRecord)
], AcademicRecordEntry.prototype, "academicRecord", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], AcademicRecordEntry.prototype, "subjectAssignmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subject_assignment_entity_1.SubjectAssignment, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'subjectAssignmentId' }),
    __metadata("design:type", subject_assignment_entity_1.SubjectAssignment)
], AcademicRecordEntry.prototype, "subjectAssignment", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => academic_record_grade_entity_1.AcademicRecordGrade, (grade) => grade.entry),
    __metadata("design:type", Array)
], AcademicRecordEntry.prototype, "grades", void 0);
exports.AcademicRecordEntry = AcademicRecordEntry = __decorate([
    (0, typeorm_1.Entity)('academic_record_entries')
], AcademicRecordEntry);
//# sourceMappingURL=academic-record-entry.entity.js.map