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
exports.ResubmitTaskDto = exports.SubmitTaskDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SubmitTaskDto {
}
exports.SubmitTaskDto = SubmitTaskDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Contenido de la entrega (respuesta en texto)',
        example: 'Mi respuesta a la tarea es...',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitTaskDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Notas del estudiante al entregar',
        example: 'He incluido las fuentes solicitadas en el archivo adjunto.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitTaskDto.prototype, "submissionNotes", void 0);
class ResubmitTaskDto extends SubmitTaskDto {
}
exports.ResubmitTaskDto = ResubmitTaskDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Comentarios sobre la revisión realizada',
        example: 'He corregido los errores señalados por el profesor.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResubmitTaskDto.prototype, "revisionComments", void 0);
//# sourceMappingURL=submit-task.dto.js.map