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
exports.CreateAttendanceRequestDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const attendance_request_entity_1 = require("../entities/attendance-request.entity");
class CreateAttendanceRequestDto {
}
exports.CreateAttendanceRequestDto = CreateAttendanceRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del estudiante' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAttendanceRequestDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: attendance_request_entity_1.AttendanceRequestType, description: 'Tipo de solicitud' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(attendance_request_entity_1.AttendanceRequestType),
    __metadata("design:type", String)
], CreateAttendanceRequestDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fecha para la solicitud (YYYY-MM-DD)' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAttendanceRequestDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Motivo de la solicitud (mínimo 10 caracteres)' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10, { message: 'El motivo debe tener al menos 10 caracteres' }),
    __metadata("design:type", String)
], CreateAttendanceRequestDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Hora esperada de llegada (HH:MM) para retrasos' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Formato de hora inválido. Use HH:MM' }),
    __metadata("design:type", String)
], CreateAttendanceRequestDto.prototype, "expectedArrivalTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Hora de salida (HH:MM) para salidas anticipadas' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Formato de hora inválido. Use HH:MM' }),
    __metadata("design:type", String)
], CreateAttendanceRequestDto.prototype, "expectedDepartureTime", void 0);
//# sourceMappingURL=create-attendance-request.dto.js.map