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
exports.AcademicRecordGrade = void 0;
const typeorm_1 = require("typeorm");
const academic_record_entry_entity_1 = require("./academic-record-entry.entity");
const academic_record_types_1 = require("./academic-record.types");
let AcademicRecordGrade = class AcademicRecordGrade {
    get percentage() {
        if (this.totalPoints === 0)
            return 0;
        return Math.round((this.earnedPoints / this.totalPoints) * 100);
    }
    get letterGrade() {
        const percent = this.percentage;
        if (percent >= 90)
            return 'A';
        if (percent >= 80)
            return 'B';
        if (percent >= 70)
            return 'C';
        if (percent >= 60)
            return 'D';
        return 'F';
    }
    get isPassing() {
        return this.percentage >= 60;
    }
    get weightedPoints() {
        if (!this.weight)
            return this.earnedPoints;
        return this.earnedPoints * this.weight;
    }
    get maxWeightedPoints() {
        if (!this.weight)
            return this.totalPoints;
        return this.totalPoints * this.weight;
    }
};
exports.AcademicRecordGrade = AcademicRecordGrade;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AcademicRecordGrade.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: academic_record_types_1.GradeType,
        default: academic_record_types_1.GradeType.ASSIGNMENT,
    }),
    __metadata("design:type", String)
], AcademicRecordGrade.prototype, "gradeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], AcademicRecordGrade.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AcademicRecordGrade.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], AcademicRecordGrade.prototype, "earnedPoints", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], AcademicRecordGrade.prototype, "totalPoints", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], AcademicRecordGrade.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], AcademicRecordGrade.prototype, "gradeDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], AcademicRecordGrade.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AcademicRecordGrade.prototype, "isLate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AcademicRecordGrade.prototype, "isExcused", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AcademicRecordGrade.prototype, "isDropped", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AcademicRecordGrade.prototype, "teacherComments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AcademicRecordGrade.prototype, "rubricData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], AcademicRecordGrade.prototype, "gradedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], AcademicRecordGrade.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AcademicRecordGrade.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AcademicRecordGrade.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], AcademicRecordGrade.prototype, "entryId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => academic_record_entry_entity_1.AcademicRecordEntry, (entry) => entry.grades),
    (0, typeorm_1.JoinColumn)({ name: 'entryId' }),
    __metadata("design:type", academic_record_entry_entity_1.AcademicRecordEntry)
], AcademicRecordGrade.prototype, "entry", void 0);
exports.AcademicRecordGrade = AcademicRecordGrade = __decorate([
    (0, typeorm_1.Entity)('academic_record_grades')
], AcademicRecordGrade);
//# sourceMappingURL=academic-record-grade.entity.js.map