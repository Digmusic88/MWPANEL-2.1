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
exports.EvaluationPeriod = exports.PeriodType = void 0;
const typeorm_1 = require("typeorm");
const academic_year_entity_1 = require("../../students/entities/academic-year.entity");
var PeriodType;
(function (PeriodType) {
    PeriodType["CONTINUOUS"] = "continuous";
    PeriodType["TRIMESTER_1"] = "trimester_1";
    PeriodType["TRIMESTER_2"] = "trimester_2";
    PeriodType["TRIMESTER_3"] = "trimester_3";
    PeriodType["FINAL"] = "final";
    PeriodType["EXTRAORDINARY"] = "extraordinary";
})(PeriodType || (exports.PeriodType = PeriodType = {}));
let EvaluationPeriod = class EvaluationPeriod {
};
exports.EvaluationPeriod = EvaluationPeriod;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EvaluationPeriod.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EvaluationPeriod.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PeriodType,
    }),
    __metadata("design:type", String)
], EvaluationPeriod.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], EvaluationPeriod.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], EvaluationPeriod.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => academic_year_entity_1.AcademicYear),
    __metadata("design:type", academic_year_entity_1.AcademicYear)
], EvaluationPeriod.prototype, "academicYear", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], EvaluationPeriod.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EvaluationPeriod.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], EvaluationPeriod.prototype, "updatedAt", void 0);
exports.EvaluationPeriod = EvaluationPeriod = __decorate([
    (0, typeorm_1.Entity)('evaluation_periods')
], EvaluationPeriod);
//# sourceMappingURL=evaluation-period.entity.js.map