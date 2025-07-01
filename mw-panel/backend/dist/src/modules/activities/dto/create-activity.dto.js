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
exports.CreateActivityDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const activity_entity_1 = require("../entities/activity.entity");
class CreateActivityDto {
    constructor() {
        this.notifyFamilies = true;
        this.notifyOnHappy = false;
        this.notifyOnNeutral = true;
        this.notifyOnSad = true;
        this.isTemplate = false;
    }
}
exports.CreateActivityDto = CreateActivityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre de la actividad', example: 'Ejercicios de matemáticas' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Descripción de la actividad' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fecha de asignación', example: '2025-01-15' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "assignedDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fecha de revisión opcional', example: '2025-01-20' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "reviewDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del grupo de clase' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "classGroupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la asignación de asignatura (obligatorio)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "subjectAssignmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo de valoración',
        enum: activity_entity_1.ActivityValuationType,
        example: activity_entity_1.ActivityValuationType.EMOJI
    }),
    (0, class_validator_1.IsEnum)(activity_entity_1.ActivityValuationType),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "valuationType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Puntuación máxima (requerido para tipo score)',
        minimum: 1,
        maximum: 100
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateActivityDto.prototype, "maxScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Si notificar a las familias', default: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateActivityDto.prototype, "notifyFamilies", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notificar cuando el emoji sea happy (cara sonriente)', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateActivityDto.prototype, "notifyOnHappy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notificar cuando el emoji sea neutral (cara neutral)', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateActivityDto.prototype, "notifyOnNeutral", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notificar cuando el emoji sea sad (cara triste)', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateActivityDto.prototype, "notifyOnSad", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'IDs de estudiantes específicos (opcional, por defecto todo el grupo)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateActivityDto.prototype, "targetStudentIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Guardar como plantilla reutilizable', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateActivityDto.prototype, "isTemplate", void 0);
//# sourceMappingURL=create-activity.dto.js.map