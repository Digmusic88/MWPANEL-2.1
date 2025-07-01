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
exports.CreateRubricDto = exports.CreateRubricCellDto = exports.CreateRubricLevelDto = exports.CreateRubricCriterionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateRubricCriterionDto {
}
exports.CreateRubricCriterionDto = CreateRubricCriterionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre del criterio', example: 'Coherencia del texto' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRubricCriterionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Descripción del criterio', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRubricCriterionDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Orden del criterio', example: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateRubricCriterionDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Peso del criterio (0-1)', example: 0.25 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], CreateRubricCriterionDto.prototype, "weight", void 0);
class CreateRubricLevelDto {
}
exports.CreateRubricLevelDto = CreateRubricLevelDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre del nivel', example: 'Excelente' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRubricLevelDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Descripción del nivel', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRubricLevelDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Orden del nivel', example: 3 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateRubricLevelDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Valor de puntuación del nivel', example: 4 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateRubricLevelDto.prototype, "scoreValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Color del nivel', example: '#4CAF50' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRubricLevelDto.prototype, "color", void 0);
class CreateRubricCellDto {
}
exports.CreateRubricCellDto = CreateRubricCellDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del criterio', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRubricCellDto.prototype, "criterionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del nivel', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRubricCellDto.prototype, "levelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Contenido de la celda', example: 'Texto muy claro y coherente' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRubricCellDto.prototype, "content", void 0);
class CreateRubricDto {
}
exports.CreateRubricDto = CreateRubricDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre de la rúbrica', example: 'Evaluación de redacción' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRubricDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Descripción de la rúbrica', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRubricDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Si es plantilla reutilizable', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateRubricDto.prototype, "isTemplate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Si es visible para familias', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateRubricDto.prototype, "isVisibleToFamilies", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la asignación de asignatura', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateRubricDto.prototype, "subjectAssignmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Puntuación máxima', default: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateRubricDto.prototype, "maxScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fuente de importación', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRubricDto.prototype, "importSource", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Datos originales de importación', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRubricDto.prototype, "originalImportData", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Criterios de la rúbrica', type: [CreateRubricCriterionDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateRubricCriterionDto),
    __metadata("design:type", Array)
], CreateRubricDto.prototype, "criteria", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Niveles de la rúbrica', type: [CreateRubricLevelDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateRubricLevelDto),
    __metadata("design:type", Array)
], CreateRubricDto.prototype, "levels", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Celdas de la rúbrica', type: [CreateRubricCellDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateRubricCellDto),
    __metadata("design:type", Array)
], CreateRubricDto.prototype, "cells", void 0);
//# sourceMappingURL=create-rubric.dto.js.map