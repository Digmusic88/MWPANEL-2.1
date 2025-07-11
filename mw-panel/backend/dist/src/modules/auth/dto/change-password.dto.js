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
exports.ChangePasswordDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ChangePasswordDto {
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Contraseña actual',
        example: 'OldPassword123!',
    }),
    (0, class_validator_1.IsString)({ message: 'La contraseña actual debe ser una cadena de texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'La contraseña actual es obligatoria' }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nueva contraseña',
        example: 'NewPassword123!',
        minLength: 8,
    }),
    (0, class_validator_1.IsString)({ message: 'La nueva contraseña debe ser una cadena de texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'La nueva contraseña es obligatoria' }),
    (0, class_validator_1.MinLength)(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: 'La nueva contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial',
    }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
//# sourceMappingURL=change-password.dto.js.map