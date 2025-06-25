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
exports.CreateTaskDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const task_entity_1 = require("../entities/task.entity");
class CreateTaskDto {
}
exports.CreateTaskDto = CreateTaskDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Título de la tarea',
        example: 'Ensayo sobre la Guerra Civil Española',
        maxLength: 255,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Descripción general de la tarea',
        example: 'Escribir un ensayo de 1000 palabras sobre las causas de la Guerra Civil Española',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Instrucciones detalladas para completar la tarea',
        example: 'Incluir introducción, desarrollo y conclusión. Citar al menos 3 fuentes bibliográficas.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "instructions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo de tarea',
        enum: task_entity_1.TaskType,
        example: task_entity_1.TaskType.HOMEWORK,
    }),
    (0, class_validator_1.IsEnum)(task_entity_1.TaskType),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "taskType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Prioridad de la tarea',
        enum: task_entity_1.TaskPriority,
        example: task_entity_1.TaskPriority.MEDIUM,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(task_entity_1.TaskPriority),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Fecha de asignación de la tarea',
        example: '2025-06-24T09:00:00Z',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "assignedDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Fecha límite de entrega',
        example: '2025-07-01T23:59:00Z',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID de la asignación de asignatura',
        example: 'uuid-string',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "subjectAssignmentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Puntuación máxima de la tarea',
        example: 10,
        minimum: 0,
        maximum: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateTaskDto.prototype, "maxPoints", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Permitir entregas tardías',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTaskDto.prototype, "allowLateSubmission", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Penalización por entrega tardía (0.0 a 1.0)',
        example: 0.2,
        minimum: 0,
        maximum: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], CreateTaskDto.prototype, "latePenalty", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Notificar a las familias',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTaskDto.prototype, "notifyFamilies", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Requiere archivo adjunto',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTaskDto.prototype, "requiresFile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tipos de archivo permitidos',
        example: ['pdf', 'doc', 'docx'],
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateTaskDto.prototype, "allowedFileTypes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tamaño máximo de archivo en MB',
        example: 10,
        minimum: 1,
        maximum: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateTaskDto.prototype, "maxFileSizeMB", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Criterios de evaluación (rúbrica)',
        example: 'Contenido: 40%, Gramática: 30%, Creatividad: 30%',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "rubric", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'IDs de estudiantes específicos (opcional, si no se envía se asigna a todo el grupo)',
        example: ['student-id-1', 'student-id-2'],
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateTaskDto.prototype, "targetStudentIds", void 0);
//# sourceMappingURL=create-task.dto.js.map