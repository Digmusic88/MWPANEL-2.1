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
exports.SubjectTaskSummaryDto = exports.StudentTaskStatisticsDto = exports.TaskStatisticsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class TaskStatisticsDto {
}
exports.TaskStatisticsDto = TaskStatisticsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total de tareas',
        example: 25,
    }),
    __metadata("design:type", Number)
], TaskStatisticsDto.prototype, "totalTasks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tareas publicadas',
        example: 20,
    }),
    __metadata("design:type", Number)
], TaskStatisticsDto.prototype, "publishedTasks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tareas en borrador',
        example: 3,
    }),
    __metadata("design:type", Number)
], TaskStatisticsDto.prototype, "draftTasks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tareas cerradas',
        example: 2,
    }),
    __metadata("design:type", Number)
], TaskStatisticsDto.prototype, "closedTasks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tareas vencidas',
        example: 1,
    }),
    __metadata("design:type", Number)
], TaskStatisticsDto.prototype, "overdueTasks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total de entregas',
        example: 150,
    }),
    __metadata("design:type", Number)
], TaskStatisticsDto.prototype, "totalSubmissions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Entregas calificadas',
        example: 120,
    }),
    __metadata("design:type", Number)
], TaskStatisticsDto.prototype, "gradedSubmissions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Entregas pendientes',
        example: 25,
    }),
    __metadata("design:type", Number)
], TaskStatisticsDto.prototype, "pendingSubmissions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Entregas tardías',
        example: 5,
    }),
    __metadata("design:type", Number)
], TaskStatisticsDto.prototype, "lateSubmissions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Promedio de calificaciones',
        example: 7.8,
    }),
    __metadata("design:type", Number)
], TaskStatisticsDto.prototype, "averageGrade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tasa de entrega (%)',
        example: 85.5,
    }),
    __metadata("design:type", Number)
], TaskStatisticsDto.prototype, "submissionRate", void 0);
class StudentTaskStatisticsDto {
}
exports.StudentTaskStatisticsDto = StudentTaskStatisticsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total de tareas asignadas',
        example: 15,
    }),
    __metadata("design:type", Number)
], StudentTaskStatisticsDto.prototype, "totalAssigned", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tareas entregadas',
        example: 12,
    }),
    __metadata("design:type", Number)
], StudentTaskStatisticsDto.prototype, "submitted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tareas pendientes',
        example: 3,
    }),
    __metadata("design:type", Number)
], StudentTaskStatisticsDto.prototype, "pending", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tareas calificadas',
        example: 10,
    }),
    __metadata("design:type", Number)
], StudentTaskStatisticsDto.prototype, "graded", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Entregas tardías',
        example: 1,
    }),
    __metadata("design:type", Number)
], StudentTaskStatisticsDto.prototype, "lateSubmissions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Promedio de calificaciones',
        example: 8.2,
    }),
    __metadata("design:type", Number)
], StudentTaskStatisticsDto.prototype, "averageGrade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tasa de entrega (%)',
        example: 80.0,
    }),
    __metadata("design:type", Number)
], StudentTaskStatisticsDto.prototype, "submissionRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Próxima fecha de entrega',
        example: '2025-07-01T23:59:00Z',
    }),
    __metadata("design:type", Date)
], StudentTaskStatisticsDto.prototype, "nextDueDate", void 0);
class SubjectTaskSummaryDto {
}
exports.SubjectTaskSummaryDto = SubjectTaskSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID de la asignatura',
        example: 'uuid-string',
    }),
    __metadata("design:type", String)
], SubjectTaskSummaryDto.prototype, "subjectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nombre de la asignatura',
        example: 'Matemáticas',
    }),
    __metadata("design:type", String)
], SubjectTaskSummaryDto.prototype, "subjectName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Código de la asignatura',
        example: 'MAT-01',
    }),
    __metadata("design:type", String)
], SubjectTaskSummaryDto.prototype, "subjectCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total de tareas',
        example: 8,
    }),
    __metadata("design:type", Number)
], SubjectTaskSummaryDto.prototype, "totalTasks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tareas pendientes',
        example: 2,
    }),
    __metadata("design:type", Number)
], SubjectTaskSummaryDto.prototype, "pendingTasks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tareas completadas',
        example: 6,
    }),
    __metadata("design:type", Number)
], SubjectTaskSummaryDto.prototype, "completedTasks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Promedio de calificaciones',
        example: 7.5,
    }),
    __metadata("design:type", Number)
], SubjectTaskSummaryDto.prototype, "averageGrade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Última tarea asignada',
        example: '2025-06-20T10:00:00Z',
    }),
    __metadata("design:type", Date)
], SubjectTaskSummaryDto.prototype, "lastTaskDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Próxima fecha límite',
        example: '2025-07-01T23:59:00Z',
    }),
    __metadata("design:type", Date)
], SubjectTaskSummaryDto.prototype, "nextDueDate", void 0);
//# sourceMappingURL=task-statistics.dto.js.map