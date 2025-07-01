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
exports.Rubric = exports.RubricStatus = void 0;
const typeorm_1 = require("typeorm");
const teacher_entity_1 = require("../../teachers/entities/teacher.entity");
const subject_assignment_entity_1 = require("../../students/entities/subject-assignment.entity");
const rubric_criterion_entity_1 = require("./rubric-criterion.entity");
const rubric_level_entity_1 = require("./rubric-level.entity");
const rubric_cell_entity_1 = require("./rubric-cell.entity");
var RubricStatus;
(function (RubricStatus) {
    RubricStatus["DRAFT"] = "draft";
    RubricStatus["ACTIVE"] = "active";
    RubricStatus["ARCHIVED"] = "archived";
})(RubricStatus || (exports.RubricStatus = RubricStatus = {}));
let Rubric = class Rubric {
};
exports.Rubric = Rubric;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Rubric.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Rubric.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Rubric.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RubricStatus,
        default: RubricStatus.DRAFT,
    }),
    __metadata("design:type", String)
], Rubric.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Rubric.prototype, "isTemplate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Rubric.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Rubric.prototype, "isVisibleToFamilies", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Rubric.prototype, "criteriaCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Rubric.prototype, "levelsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 100 }),
    __metadata("design:type", Number)
], Rubric.prototype, "maxScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Rubric.prototype, "importSource", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Rubric.prototype, "originalImportData", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => teacher_entity_1.Teacher, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'teacherId' }),
    __metadata("design:type", teacher_entity_1.Teacher)
], Rubric.prototype, "teacher", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], Rubric.prototype, "teacherId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subject_assignment_entity_1.SubjectAssignment, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'subjectAssignmentId' }),
    __metadata("design:type", subject_assignment_entity_1.SubjectAssignment)
], Rubric.prototype, "subjectAssignment", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], Rubric.prototype, "subjectAssignmentId", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true, nullable: true }),
    __metadata("design:type", Array)
], Rubric.prototype, "sharedWith", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => rubric_criterion_entity_1.RubricCriterion, criterion => criterion.rubric, { cascade: true }),
    __metadata("design:type", Array)
], Rubric.prototype, "criteria", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => rubric_level_entity_1.RubricLevel, level => level.rubric, { cascade: true }),
    __metadata("design:type", Array)
], Rubric.prototype, "levels", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => rubric_cell_entity_1.RubricCell, cell => cell.rubric, { cascade: true }),
    __metadata("design:type", Array)
], Rubric.prototype, "cells", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Rubric.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Rubric.prototype, "updatedAt", void 0);
exports.Rubric = Rubric = __decorate([
    (0, typeorm_1.Entity)('rubrics')
], Rubric);
//# sourceMappingURL=rubric.entity.js.map