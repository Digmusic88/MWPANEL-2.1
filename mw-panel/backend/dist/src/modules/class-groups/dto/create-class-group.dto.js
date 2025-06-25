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
exports.CreateClassGroupDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateClassGroupDto {
}
exports.CreateClassGroupDto = CreateClassGroupDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre del grupo de clase', example: '3º A Primaria' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateClassGroupDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sección del grupo', example: 'A', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClassGroupDto.prototype, "section", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del año académico' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateClassGroupDto.prototype, "academicYearId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lista de IDs de cursos', type: [String] }),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], CreateClassGroupDto.prototype, "courseIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del profesor tutor', required: false }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClassGroupDto.prototype, "tutorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lista de IDs de estudiantes', required: false }),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateClassGroupDto.prototype, "studentIds", void 0);
//# sourceMappingURL=create-class-group.dto.js.map