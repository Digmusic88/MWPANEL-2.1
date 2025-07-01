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
exports.SubjectActivitySummaryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class SubjectActivitySummaryDto {
}
exports.SubjectActivitySummaryDto = SubjectActivitySummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la asignación de asignatura' }),
    __metadata("design:type", String)
], SubjectActivitySummaryDto.prototype, "subjectAssignmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre de la asignatura' }),
    __metadata("design:type", String)
], SubjectActivitySummaryDto.prototype, "subjectName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Código de la asignatura' }),
    __metadata("design:type", String)
], SubjectActivitySummaryDto.prototype, "subjectCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre del grupo de clase' }),
    __metadata("design:type", String)
], SubjectActivitySummaryDto.prototype, "classGroupName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total de actividades' }),
    __metadata("design:type", Number)
], SubjectActivitySummaryDto.prototype, "totalActivities", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Actividades activas' }),
    __metadata("design:type", Number)
], SubjectActivitySummaryDto.prototype, "activeActivities", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Actividades archivadas' }),
    __metadata("design:type", Number)
], SubjectActivitySummaryDto.prototype, "archivedActivities", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Plantillas disponibles' }),
    __metadata("design:type", Number)
], SubjectActivitySummaryDto.prototype, "templatesCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Valoraciones pendientes' }),
    __metadata("design:type", Number)
], SubjectActivitySummaryDto.prototype, "pendingAssessments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Valoraciones completadas esta semana' }),
    __metadata("design:type", Number)
], SubjectActivitySummaryDto.prototype, "weekCompletedAssessments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Porcentaje de valoraciones positivas' }),
    __metadata("design:type", Number)
], SubjectActivitySummaryDto.prototype, "positiveRatio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Última actividad creada' }),
    __metadata("design:type", Date)
], SubjectActivitySummaryDto.prototype, "lastActivityDate", void 0);
//# sourceMappingURL=subject-activity-summary.dto.js.map