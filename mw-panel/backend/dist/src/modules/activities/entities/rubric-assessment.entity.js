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
exports.RubricAssessment = void 0;
const typeorm_1 = require("typeorm");
const activity_assessment_entity_1 = require("./activity-assessment.entity");
const rubric_entity_1 = require("./rubric.entity");
const student_entity_1 = require("../../students/entities/student.entity");
const rubric_assessment_criterion_entity_1 = require("./rubric-assessment-criterion.entity");
let RubricAssessment = class RubricAssessment {
};
exports.RubricAssessment = RubricAssessment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RubricAssessment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], RubricAssessment.prototype, "totalScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], RubricAssessment.prototype, "maxPossibleScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], RubricAssessment.prototype, "percentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], RubricAssessment.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], RubricAssessment.prototype, "isComplete", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], RubricAssessment.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => activity_assessment_entity_1.ActivityAssessment, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'activityAssessmentId' }),
    __metadata("design:type", activity_assessment_entity_1.ActivityAssessment)
], RubricAssessment.prototype, "activityAssessment", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], RubricAssessment.prototype, "activityAssessmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rubric_entity_1.Rubric, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'rubricId' }),
    __metadata("design:type", rubric_entity_1.Rubric)
], RubricAssessment.prototype, "rubric", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], RubricAssessment.prototype, "rubricId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => student_entity_1.Student, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'studentId' }),
    __metadata("design:type", student_entity_1.Student)
], RubricAssessment.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], RubricAssessment.prototype, "studentId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => rubric_assessment_criterion_entity_1.RubricAssessmentCriterion, criterion => criterion.rubricAssessment, { cascade: true }),
    __metadata("design:type", Array)
], RubricAssessment.prototype, "criterionAssessments", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RubricAssessment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RubricAssessment.prototype, "updatedAt", void 0);
exports.RubricAssessment = RubricAssessment = __decorate([
    (0, typeorm_1.Entity)('rubric_assessments'),
    (0, typeorm_1.Unique)(['activityAssessmentId', 'rubricId', 'studentId'])
], RubricAssessment);
//# sourceMappingURL=rubric-assessment.entity.js.map