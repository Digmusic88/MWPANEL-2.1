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
exports.SystemSettingResponseDto = exports.UpdateSystemSettingDto = exports.CreateSystemSettingDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const system_setting_entity_1 = require("../entities/system-setting.entity");
class CreateSystemSettingDto {
}
exports.CreateSystemSettingDto = CreateSystemSettingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Clave única del setting',
        example: 'module_expedientes_enabled',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSystemSettingDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nombre descriptivo del setting',
        example: 'Módulo de Expedientes Habilitado',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSystemSettingDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Descripción del setting',
        example: 'Habilita o deshabilita el módulo de expedientes académicos',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSystemSettingDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo de dato del setting',
        enum: system_setting_entity_1.SettingType,
        example: system_setting_entity_1.SettingType.BOOLEAN,
    }),
    (0, class_validator_1.IsEnum)(system_setting_entity_1.SettingType),
    __metadata("design:type", String)
], CreateSystemSettingDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Categoría del setting',
        enum: system_setting_entity_1.SettingCategory,
        example: system_setting_entity_1.SettingCategory.MODULES,
    }),
    (0, class_validator_1.IsEnum)(system_setting_entity_1.SettingCategory),
    __metadata("design:type", String)
], CreateSystemSettingDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Valor del setting (como string)',
        example: 'true',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSystemSettingDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Valor por defecto',
        example: 'false',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSystemSettingDto.prototype, "defaultValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Si el setting es editable',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSystemSettingDto.prototype, "isEditable", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Si requiere reinicio para aplicarse',
        example: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSystemSettingDto.prototype, "requiresRestart", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reglas de validación (JSON)',
        example: '{"min": 0, "max": 100}',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSystemSettingDto.prototype, "validationRules", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Orden de clasificación',
        example: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSystemSettingDto.prototype, "sortOrder", void 0);
class UpdateSystemSettingDto {
}
exports.UpdateSystemSettingDto = UpdateSystemSettingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nombre descriptivo del setting',
        example: 'Módulo de Expedientes Habilitado',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSystemSettingDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Descripción del setting',
        example: 'Habilita o deshabilita el módulo de expedientes académicos',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSystemSettingDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Valor del setting (como string)',
        example: 'true',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateSystemSettingDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Orden de clasificación',
        example: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateSystemSettingDto.prototype, "sortOrder", void 0);
class SystemSettingResponseDto {
}
exports.SystemSettingResponseDto = SystemSettingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SystemSettingResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SystemSettingResponseDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SystemSettingResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SystemSettingResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: system_setting_entity_1.SettingType }),
    __metadata("design:type", String)
], SystemSettingResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: system_setting_entity_1.SettingCategory }),
    __metadata("design:type", String)
], SystemSettingResponseDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SystemSettingResponseDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], SystemSettingResponseDto.prototype, "parsedValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SystemSettingResponseDto.prototype, "defaultValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], SystemSettingResponseDto.prototype, "isEditable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], SystemSettingResponseDto.prototype, "requiresRestart", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SystemSettingResponseDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], SystemSettingResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], SystemSettingResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=system-setting.dto.js.map