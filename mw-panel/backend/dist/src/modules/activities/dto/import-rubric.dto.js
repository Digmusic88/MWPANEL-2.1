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
exports.ImportRubricDto = exports.ImportFormat = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var ImportFormat;
(function (ImportFormat) {
    ImportFormat["MARKDOWN"] = "markdown";
    ImportFormat["CSV"] = "csv";
})(ImportFormat || (exports.ImportFormat = ImportFormat = {}));
class ImportRubricDto {
}
exports.ImportRubricDto = ImportRubricDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre de la rúbrica', example: 'Rúbrica de redacción' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportRubricDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Descripción de la rúbrica', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportRubricDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Formato de importación', enum: ImportFormat }),
    (0, class_validator_1.IsEnum)(ImportFormat),
    __metadata("design:type", String)
], ImportRubricDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Datos de la tabla en formato markdown o CSV',
        example: `| Criterio | Insuficiente | Aceptable | Bueno | Excelente |
|----------|--------------|-----------|-------|-----------|
| Coherencia | No coherente | Algo claro | Claro | Muy claro |
| Ortografía | Muchos fallos | Algunos fallos | Bien | Sin errores |`
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportRubricDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Si es plantilla reutilizable', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ImportRubricDto.prototype, "isTemplate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Si es visible para familias', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ImportRubricDto.prototype, "isVisibleToFamilies", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la asignación de asignatura', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ImportRubricDto.prototype, "subjectAssignmentId", void 0);
//# sourceMappingURL=import-rubric.dto.js.map