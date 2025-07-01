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
exports.CreateAttendanceRecordDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const attendance_record_entity_1 = require("../entities/attendance-record.entity");
class CreateAttendanceRecordDto {
}
exports.CreateAttendanceRecordDto = CreateAttendanceRecordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del estudiante' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAttendanceRecordDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fecha del registro (YYYY-MM-DD)' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAttendanceRecordDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: attendance_record_entity_1.AttendanceStatus, description: 'Estado de asistencia' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(attendance_record_entity_1.AttendanceStatus),
    __metadata("design:type", String)
], CreateAttendanceRecordDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Justificación (si aplica)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAttendanceRecordDto.prototype, "justification", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Hora de llegada (HH:MM) para retrasos' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAttendanceRecordDto.prototype, "arrivalTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Hora de salida (HH:MM) para salidas anticipadas' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAttendanceRecordDto.prototype, "departureTime", void 0);
//# sourceMappingURL=create-attendance-record.dto.js.map