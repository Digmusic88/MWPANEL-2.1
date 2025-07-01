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
exports.RadarEvaluation = void 0;
const typeorm_1 = require("typeorm");
const student_entity_1 = require("../../students/entities/student.entity");
const evaluation_period_entity_1 = require("./evaluation-period.entity");
let RadarEvaluation = class RadarEvaluation {
};
exports.RadarEvaluation = RadarEvaluation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RadarEvaluation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => student_entity_1.Student),
    __metadata("design:type", student_entity_1.Student)
], RadarEvaluation.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => evaluation_period_entity_1.EvaluationPeriod),
    __metadata("design:type", evaluation_period_entity_1.EvaluationPeriod)
], RadarEvaluation.prototype, "period", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], RadarEvaluation.prototype, "data", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RadarEvaluation.prototype, "generatedAt", void 0);
exports.RadarEvaluation = RadarEvaluation = __decorate([
    (0, typeorm_1.Entity)('radar_evaluations')
], RadarEvaluation);
//# sourceMappingURL=radar-evaluation.entity.js.map