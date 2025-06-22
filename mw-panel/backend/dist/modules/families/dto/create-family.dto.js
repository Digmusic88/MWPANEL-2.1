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
exports.CreateFamilyDto = exports.FamilyStudentRelationDto = exports.FamilyContactDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const family_entity_1 = require("../../users/entities/family.entity");
class FamilyContactDto {
}
exports.FamilyContactDto = FamilyContactDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'padre@example.com' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FamilyContactDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Password123!' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FamilyContactDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Juan' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FamilyContactDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Pérez García' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FamilyContactDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1980-05-15' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FamilyContactDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '12345678A' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FamilyContactDto.prototype, "documentNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+34 600 123 456' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FamilyContactDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Calle Mayor, 123, Madrid' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FamilyContactDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ingeniero' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FamilyContactDto.prototype, "occupation", void 0);
class FamilyStudentRelationDto {
}
exports.FamilyStudentRelationDto = FamilyStudentRelationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FamilyStudentRelationDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: family_entity_1.FamilyRelationship, example: family_entity_1.FamilyRelationship.FATHER }),
    (0, class_validator_1.IsEnum)(family_entity_1.FamilyRelationship),
    __metadata("design:type", String)
], FamilyStudentRelationDto.prototype, "relationship", void 0);
class CreateFamilyDto {
}
exports.CreateFamilyDto = CreateFamilyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: FamilyContactDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FamilyContactDto),
    __metadata("design:type", FamilyContactDto)
], CreateFamilyDto.prototype, "primaryContact", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: FamilyContactDto, required: false }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FamilyContactDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", FamilyContactDto)
], CreateFamilyDto.prototype, "secondaryContact", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [FamilyStudentRelationDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FamilyStudentRelationDto),
    __metadata("design:type", Array)
], CreateFamilyDto.prototype, "students", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Familia muy colaboradora' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFamilyDto.prototype, "notes", void 0);
//# sourceMappingURL=create-family.dto.js.map