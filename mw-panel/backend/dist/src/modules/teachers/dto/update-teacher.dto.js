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
exports.UpdateTeacherDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_teacher_dto_1 = require("./create-teacher.dto");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
class UpdateTeacherDto extends (0, swagger_1.PartialType)(create_teacher_dto_1.CreateTeacherDto) {
}
exports.UpdateTeacherDto = UpdateTeacherDto;
__decorate([
    (0, swagger_2.ApiProperty)({ example: '550e8400-e29b-41d4-a716-446655440000', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTeacherDto.prototype, "id", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({
        description: 'Nueva contraseña para el profesor (solo si se quiere cambiar)',
        example: 'NewPassword123',
        required: false,
        minLength: 8,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La nueva contraseña debe ser una cadena de texto' }),
    (0, class_validator_1.MinLength)(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' }),
    __metadata("design:type", String)
], UpdateTeacherDto.prototype, "newPassword", void 0);
//# sourceMappingURL=update-teacher.dto.js.map