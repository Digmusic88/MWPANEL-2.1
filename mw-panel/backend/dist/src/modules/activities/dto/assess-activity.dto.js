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
exports.AssessmentResponseDto = exports.BulkAssessActivityDto = exports.AssessActivityDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class AssessActivityDto {
}
exports.AssessActivityDto = AssessActivityDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Valor de la valoración (happy/neutral/sad para emoji, número para score)',
        example: 'happy'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AssessActivityDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Comentario opcional del profesor' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AssessActivityDto.prototype, "comment", void 0);
class BulkAssessActivityDto {
}
exports.BulkAssessActivityDto = BulkAssessActivityDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Valor a aplicar masivamente',
        example: 'happy'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkAssessActivityDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Comentario opcional a aplicar a todos' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkAssessActivityDto.prototype, "comment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'IDs de estudiantes específicos (si no se envía, aplica a todos)',
        type: [String]
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], BulkAssessActivityDto.prototype, "studentIds", void 0);
class AssessmentResponseDto {
}
exports.AssessmentResponseDto = AssessmentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AssessmentResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AssessmentResponseDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], AssessmentResponseDto.prototype, "comment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], AssessmentResponseDto.prototype, "assessedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], AssessmentResponseDto.prototype, "isAssessed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AssessmentResponseDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AssessmentResponseDto.prototype, "activityId", void 0);
//# sourceMappingURL=assess-activity.dto.js.map