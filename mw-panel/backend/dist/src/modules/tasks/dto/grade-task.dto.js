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
exports.ReturnTaskDto = exports.BulkGradeTaskDto = exports.GradeTaskDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class GradeTaskDto {
}
exports.GradeTaskDto = GradeTaskDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Puntuación obtenida',
        example: 8.5,
        minimum: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GradeTaskDto.prototype, "grade", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Comentarios del profesor sobre la entrega',
        example: 'Excelente trabajo. Solo mejorar la conclusión.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GradeTaskDto.prototype, "teacherFeedback", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Notas privadas del profesor (no visibles para el estudiante)',
        example: 'Estudiante muestra gran progreso este trimestre.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GradeTaskDto.prototype, "privateNotes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Indica si la entrega necesita revisión y reenvío',
        example: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GradeTaskDto.prototype, "needsRevision", void 0);
class BulkGradeTaskDto {
}
exports.BulkGradeTaskDto = BulkGradeTaskDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Lista de calificaciones por estudiante',
        example: [
            {
                submissionId: 'uuid-1',
                grade: 8.5,
                teacherFeedback: 'Muy bien',
            },
            {
                submissionId: 'uuid-2',
                grade: 7.0,
                teacherFeedback: 'Mejorar redacción',
            },
        ],
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], BulkGradeTaskDto.prototype, "grades", void 0);
class ReturnTaskDto {
}
exports.ReturnTaskDto = ReturnTaskDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Motivo de devolución para revisión',
        example: 'Por favor, amplía la conclusión y añade más fuentes bibliográficas.',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReturnTaskDto.prototype, "returnReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Comentarios adicionales para el estudiante',
        example: 'Buen trabajo en general, solo necesita algunas mejoras.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReturnTaskDto.prototype, "additionalComments", void 0);
//# sourceMappingURL=grade-task.dto.js.map