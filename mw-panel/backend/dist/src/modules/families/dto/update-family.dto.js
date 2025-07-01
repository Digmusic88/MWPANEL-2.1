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
exports.UpdateFamilyDto = exports.UpdateFamilyStudentRelationDto = exports.UpdateFamilyContactDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const family_entity_1 = require("../../users/entities/family.entity");
class UpdateFamilyContactDto {
}
exports.UpdateFamilyContactDto = UpdateFamilyContactDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'padre@example.com', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFamilyContactDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Password123!', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFamilyContactDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nueva contraseña para el contacto familiar (solo si se quiere cambiar)',
        example: 'NewPassword123',
        required: false,
        minLength: 8,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La nueva contraseña debe ser una cadena de texto' }),
    (0, class_validator_1.MinLength)(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' }),
    __metadata("design:type", String)
], UpdateFamilyContactDto.prototype, "newPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Juan', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFamilyContactDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Pérez García', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFamilyContactDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1980-05-15', required: false }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFamilyContactDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '12345678A', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFamilyContactDto.prototype, "documentNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+34 600 123 456', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFamilyContactDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Calle Mayor, 123, Madrid', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFamilyContactDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ingeniero', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFamilyContactDto.prototype, "occupation", void 0);
class UpdateFamilyStudentRelationDto {
}
exports.UpdateFamilyStudentRelationDto = UpdateFamilyStudentRelationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFamilyStudentRelationDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: family_entity_1.FamilyRelationship, example: family_entity_1.FamilyRelationship.PARENT }),
    (0, class_validator_1.IsEnum)(family_entity_1.FamilyRelationship),
    __metadata("design:type", String)
], UpdateFamilyStudentRelationDto.prototype, "relationship", void 0);
class UpdateFamilyDto {
}
exports.UpdateFamilyDto = UpdateFamilyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '550e8400-e29b-41d4-a716-446655440000', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFamilyDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: UpdateFamilyContactDto, required: false }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UpdateFamilyContactDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", UpdateFamilyContactDto)
], UpdateFamilyDto.prototype, "primaryContact", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: UpdateFamilyContactDto, required: false }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UpdateFamilyContactDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", UpdateFamilyContactDto)
], UpdateFamilyDto.prototype, "secondaryContact", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [UpdateFamilyStudentRelationDto], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => UpdateFamilyStudentRelationDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateFamilyDto.prototype, "students", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Familia muy colaboradora', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFamilyDto.prototype, "notes", void 0);
//# sourceMappingURL=update-family.dto.js.map