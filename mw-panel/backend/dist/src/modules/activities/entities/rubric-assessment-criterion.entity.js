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
exports.RubricAssessmentCriterion = void 0;
const typeorm_1 = require("typeorm");
const rubric_assessment_entity_1 = require("./rubric-assessment.entity");
const rubric_criterion_entity_1 = require("./rubric-criterion.entity");
const rubric_level_entity_1 = require("./rubric-level.entity");
const rubric_cell_entity_1 = require("./rubric-cell.entity");
let RubricAssessmentCriterion = class RubricAssessmentCriterion {
};
exports.RubricAssessmentCriterion = RubricAssessmentCriterion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RubricAssessmentCriterion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], RubricAssessmentCriterion.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], RubricAssessmentCriterion.prototype, "weightedScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], RubricAssessmentCriterion.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], RubricAssessmentCriterion.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rubric_assessment_entity_1.RubricAssessment, assessment => assessment.criterionAssessments, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'rubricAssessmentId' }),
    __metadata("design:type", rubric_assessment_entity_1.RubricAssessment)
], RubricAssessmentCriterion.prototype, "rubricAssessment", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], RubricAssessmentCriterion.prototype, "rubricAssessmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rubric_criterion_entity_1.RubricCriterion, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'criterionId' }),
    __metadata("design:type", rubric_criterion_entity_1.RubricCriterion)
], RubricAssessmentCriterion.prototype, "criterion", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], RubricAssessmentCriterion.prototype, "criterionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rubric_level_entity_1.RubricLevel, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'levelId' }),
    __metadata("design:type", rubric_level_entity_1.RubricLevel)
], RubricAssessmentCriterion.prototype, "selectedLevel", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], RubricAssessmentCriterion.prototype, "levelId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rubric_cell_entity_1.RubricCell, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'cellId' }),
    __metadata("design:type", rubric_cell_entity_1.RubricCell)
], RubricAssessmentCriterion.prototype, "selectedCell", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], RubricAssessmentCriterion.prototype, "cellId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RubricAssessmentCriterion.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RubricAssessmentCriterion.prototype, "updatedAt", void 0);
exports.RubricAssessmentCriterion = RubricAssessmentCriterion = __decorate([
    (0, typeorm_1.Entity)('rubric_assessment_criteria'),
    (0, typeorm_1.Unique)(['rubricAssessmentId', 'criterionId'])
], RubricAssessmentCriterion);
//# sourceMappingURL=rubric-assessment-criterion.entity.js.map