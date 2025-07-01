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
exports.Evaluation = exports.EvaluationStatus = void 0;
const typeorm_1 = require("typeorm");
const student_entity_1 = require("../../students/entities/student.entity");
const subject_entity_1 = require("../../students/entities/subject.entity");
const teacher_entity_1 = require("../../teachers/entities/teacher.entity");
const evaluation_period_entity_1 = require("./evaluation-period.entity");
const competency_evaluation_entity_1 = require("./competency-evaluation.entity");
var EvaluationStatus;
(function (EvaluationStatus) {
    EvaluationStatus["DRAFT"] = "draft";
    EvaluationStatus["SUBMITTED"] = "submitted";
    EvaluationStatus["REVIEWED"] = "reviewed";
    EvaluationStatus["FINALIZED"] = "finalized";
})(EvaluationStatus || (exports.EvaluationStatus = EvaluationStatus = {}));
let Evaluation = class Evaluation {
};
exports.Evaluation = Evaluation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Evaluation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => student_entity_1.Student, (student) => student.evaluations),
    __metadata("design:type", student_entity_1.Student)
], Evaluation.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subject_entity_1.Subject),
    __metadata("design:type", subject_entity_1.Subject)
], Evaluation.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => teacher_entity_1.Teacher, (teacher) => teacher.evaluations),
    __metadata("design:type", teacher_entity_1.Teacher)
], Evaluation.prototype, "teacher", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => evaluation_period_entity_1.EvaluationPeriod),
    __metadata("design:type", evaluation_period_entity_1.EvaluationPeriod)
], Evaluation.prototype, "period", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: EvaluationStatus,
        default: EvaluationStatus.DRAFT,
    }),
    __metadata("design:type", String)
], Evaluation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Evaluation.prototype, "generalObservations", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 4, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Evaluation.prototype, "overallScore", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => competency_evaluation_entity_1.CompetencyEvaluation, (ce) => ce.evaluation),
    __metadata("design:type", Array)
], Evaluation.prototype, "competencyEvaluations", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Evaluation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Evaluation.prototype, "updatedAt", void 0);
exports.Evaluation = Evaluation = __decorate([
    (0, typeorm_1.Entity)('evaluations')
], Evaluation);
//# sourceMappingURL=evaluation.entity.js.map