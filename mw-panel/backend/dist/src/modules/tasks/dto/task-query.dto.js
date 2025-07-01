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
exports.FamilyTaskQueryDto = exports.StudentTaskQueryDto = exports.TaskQueryDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const task_entity_1 = require("../entities/task.entity");
const task_submission_entity_1 = require("../entities/task-submission.entity");
class TaskQueryDto {
}
exports.TaskQueryDto = TaskQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID del grupo de clase',
        example: 'uuid-string',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TaskQueryDto.prototype, "classGroupId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID de la asignación de asignatura',
        example: 'uuid-string',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TaskQueryDto.prototype, "subjectAssignmentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tipo de tarea',
        enum: task_entity_1.TaskType,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(task_entity_1.TaskType),
    __metadata("design:type", String)
], TaskQueryDto.prototype, "taskType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Estado de la tarea',
        enum: task_entity_1.TaskStatus,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(task_entity_1.TaskStatus),
    __metadata("design:type", String)
], TaskQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Prioridad de la tarea',
        enum: task_entity_1.TaskPriority,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(task_entity_1.TaskPriority),
    __metadata("design:type", String)
], TaskQueryDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Fecha de inicio para filtrar',
        example: '2025-06-01',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TaskQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Fecha de fin para filtrar',
        example: '2025-06-30',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TaskQueryDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Solo tareas vencidas',
        example: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TaskQueryDto.prototype, "onlyOverdue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Solo tareas con entregas pendientes',
        example: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TaskQueryDto.prototype, "hasPendingSubmissions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Número de página',
        example: '1',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], TaskQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Número de elementos por página',
        example: '10',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], TaskQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Búsqueda por título o descripción',
        example: 'ensayo',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TaskQueryDto.prototype, "search", void 0);
class StudentTaskQueryDto {
}
exports.StudentTaskQueryDto = StudentTaskQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Estado de la entrega',
        enum: task_submission_entity_1.SubmissionStatus,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(task_submission_entity_1.SubmissionStatus),
    __metadata("design:type", String)
], StudentTaskQueryDto.prototype, "submissionStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Solo tareas pendientes de entrega',
        example: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], StudentTaskQueryDto.prototype, "onlyPending", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Solo tareas calificadas',
        example: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], StudentTaskQueryDto.prototype, "onlyGraded", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID de la asignatura',
        example: 'uuid-string',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StudentTaskQueryDto.prototype, "subjectId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Fecha de inicio para filtrar',
        example: '2025-06-01',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], StudentTaskQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Fecha de fin para filtrar',
        example: '2025-06-30',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], StudentTaskQueryDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Número de página',
        example: '1',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], StudentTaskQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Número de elementos por página',
        example: '10',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], StudentTaskQueryDto.prototype, "limit", void 0);
class FamilyTaskQueryDto extends StudentTaskQueryDto {
}
exports.FamilyTaskQueryDto = FamilyTaskQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID del estudiante (hijo)',
        example: 'uuid-string',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FamilyTaskQueryDto.prototype, "studentId", void 0);
//# sourceMappingURL=task-query.dto.js.map