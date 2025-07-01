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
exports.CompetencyEvaluation = void 0;
const typeorm_1 = require("typeorm");
const evaluation_entity_1 = require("./evaluation.entity");
const competency_entity_1 = require("../../competencies/entities/competency.entity");
let CompetencyEvaluation = class CompetencyEvaluation {
};
exports.CompetencyEvaluation = CompetencyEvaluation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CompetencyEvaluation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => evaluation_entity_1.Evaluation, (evaluation) => evaluation.competencyEvaluations),
    __metadata("design:type", evaluation_entity_1.Evaluation)
], CompetencyEvaluation.prototype, "evaluation", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => competency_entity_1.Competency),
    __metadata("design:type", competency_entity_1.Competency)
], CompetencyEvaluation.prototype, "competency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], CompetencyEvaluation.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CompetencyEvaluation.prototype, "observations", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CompetencyEvaluation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CompetencyEvaluation.prototype, "updatedAt", void 0);
exports.CompetencyEvaluation = CompetencyEvaluation = __decorate([
    (0, typeorm_1.Entity)('competency_evaluations')
], CompetencyEvaluation);
//# sourceMappingURL=competency-evaluation.entity.js.map