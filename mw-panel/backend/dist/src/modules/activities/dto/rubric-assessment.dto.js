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
exports.RubricAssessmentResponseDto = exports.UpdateRubricAssessmentDto = exports.CreateRubricAssessmentDto = exports.CreateRubricAssessmentCriterionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateRubricAssessmentCriterionDto {
}
exports.CreateRubricAssessmentCriterionDto = CreateRubricAssessmentCriterionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del criterio' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateRubricAssessmentCriterionDto.prototype, "criterionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del nivel seleccionado' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateRubricAssessmentCriterionDto.prototype, "levelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la celda seleccionada' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateRubricAssessmentCriterionDto.prototype, "cellId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Comentarios específicos del criterio', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRubricAssessmentCriterionDto.prototype, "comments", void 0);
class CreateRubricAssessmentDto {
}
exports.CreateRubricAssessmentDto = CreateRubricAssessmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la actividad (assessment)' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateRubricAssessmentDto.prototype, "activityAssessmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la rúbrica' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateRubricAssessmentDto.prototype, "rubricId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del estudiante' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateRubricAssessmentDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Comentarios generales', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRubricAssessmentDto.prototype, "comments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Evaluaciones por criterio', type: [CreateRubricAssessmentCriterionDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateRubricAssessmentCriterionDto),
    __metadata("design:type", Array)
], CreateRubricAssessmentDto.prototype, "criterionAssessments", void 0);
class UpdateRubricAssessmentDto {
}
exports.UpdateRubricAssessmentDto = UpdateRubricAssessmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Comentarios generales', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRubricAssessmentDto.prototype, "comments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Evaluaciones por criterio', type: [CreateRubricAssessmentCriterionDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateRubricAssessmentCriterionDto),
    __metadata("design:type", Array)
], UpdateRubricAssessmentDto.prototype, "criterionAssessments", void 0);
class RubricAssessmentResponseDto {
}
exports.RubricAssessmentResponseDto = RubricAssessmentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la evaluación' }),
    __metadata("design:type", String)
], RubricAssessmentResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Puntuación total obtenida' }),
    __metadata("design:type", Number)
], RubricAssessmentResponseDto.prototype, "totalScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Puntuación máxima posible' }),
    __metadata("design:type", Number)
], RubricAssessmentResponseDto.prototype, "maxPossibleScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Porcentaje obtenido' }),
    __metadata("design:type", Number)
], RubricAssessmentResponseDto.prototype, "percentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Comentarios generales' }),
    __metadata("design:type", String)
], RubricAssessmentResponseDto.prototype, "comments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Si está completa la evaluación' }),
    __metadata("design:type", Boolean)
], RubricAssessmentResponseDto.prototype, "isComplete", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Evaluaciones por criterio' }),
    __metadata("design:type", Array)
], RubricAssessmentResponseDto.prototype, "criterionAssessments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Información del estudiante' }),
    __metadata("design:type", Object)
], RubricAssessmentResponseDto.prototype, "student", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Información de la rúbrica' }),
    __metadata("design:type", Object)
], RubricAssessmentResponseDto.prototype, "rubric", void 0);
//# sourceMappingURL=rubric-assessment.dto.js.map