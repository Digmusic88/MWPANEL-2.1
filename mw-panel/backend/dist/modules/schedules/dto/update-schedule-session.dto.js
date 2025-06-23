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
exports.UpdateScheduleSessionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const schedule_session_entity_1 = require("../../students/entities/schedule-session.entity");
class UpdateScheduleSessionDto {
}
exports.UpdateScheduleSessionDto = UpdateScheduleSessionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === '' ? undefined : value),
    (0, class_validator_1.IsUUID)(4, { message: 'subjectAssignmentId must be a valid UUID v4' }),
    __metadata("design:type", String)
], UpdateScheduleSessionDto.prototype, "subjectAssignmentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === '' ? undefined : value),
    (0, class_validator_1.IsUUID)(4, { message: 'classroomId must be a valid UUID v4' }),
    __metadata("design:type", String)
], UpdateScheduleSessionDto.prototype, "classroomId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === '' ? undefined : value),
    (0, class_validator_1.IsUUID)(4, { message: 'timeSlotId must be a valid UUID v4' }),
    __metadata("design:type", String)
], UpdateScheduleSessionDto.prototype, "timeSlotId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(schedule_session_entity_1.DayOfWeek),
    __metadata("design:type", Number)
], UpdateScheduleSessionDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === '' ? undefined : value),
    (0, class_validator_1.IsUUID)(4, { message: 'academicYearId must be a valid UUID v4' }),
    __metadata("design:type", String)
], UpdateScheduleSessionDto.prototype, "academicYearId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateScheduleSessionDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateScheduleSessionDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateScheduleSessionDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateScheduleSessionDto.prototype, "notes", void 0);
//# sourceMappingURL=update-schedule-session.dto.js.map