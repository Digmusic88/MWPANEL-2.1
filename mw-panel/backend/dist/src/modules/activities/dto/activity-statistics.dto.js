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
exports.TeacherActivitySummaryDto = exports.ActivityStatisticsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ActivityStatisticsDto {
}
exports.ActivityStatisticsDto = ActivityStatisticsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la actividad' }),
    __metadata("design:type", String)
], ActivityStatisticsDto.prototype, "activityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre de la actividad' }),
    __metadata("design:type", String)
], ActivityStatisticsDto.prototype, "activityName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total de estudiantes' }),
    __metadata("design:type", Number)
], ActivityStatisticsDto.prototype, "totalStudents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Estudiantes valorados' }),
    __metadata("design:type", Number)
], ActivityStatisticsDto.prototype, "assessedStudents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Estudiantes pendientes' }),
    __metadata("design:type", Number)
], ActivityStatisticsDto.prototype, "pendingStudents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Distribución de valoraciones emoji' }),
    __metadata("design:type", Object)
], ActivityStatisticsDto.prototype, "emojiDistribution", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Estadísticas de puntuaciones' }),
    __metadata("design:type", Object)
], ActivityStatisticsDto.prototype, "scoreStatistics", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Porcentaje de completado' }),
    __metadata("design:type", Number)
], ActivityStatisticsDto.prototype, "completionPercentage", void 0);
class TeacherActivitySummaryDto {
}
exports.TeacherActivitySummaryDto = TeacherActivitySummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Actividades de hoy' }),
    __metadata("design:type", Number)
], TeacherActivitySummaryDto.prototype, "todayActivities", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Actividades pendientes de valorar' }),
    __metadata("design:type", Number)
], TeacherActivitySummaryDto.prototype, "pendingAssessments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total de valoraciones realizadas esta semana' }),
    __metadata("design:type", Number)
], TeacherActivitySummaryDto.prototype, "weekAssessments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Promedio de valoraciones positivas' }),
    __metadata("design:type", Number)
], TeacherActivitySummaryDto.prototype, "positiveRatio", void 0);
//# sourceMappingURL=activity-statistics.dto.js.map