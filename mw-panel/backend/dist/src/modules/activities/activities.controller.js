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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivitiesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const activities_service_1 = require("./activities.service");
const create_activity_dto_1 = require("./dto/create-activity.dto");
const update_activity_dto_1 = require("./dto/update-activity.dto");
const assess_activity_dto_1 = require("./dto/assess-activity.dto");
const activity_statistics_dto_1 = require("./dto/activity-statistics.dto");
const subject_assignment_with_students_dto_1 = require("./dto/subject-assignment-with-students.dto");
const activity_template_dto_1 = require("./dto/activity-template.dto");
const subject_activity_summary_dto_1 = require("./dto/subject-activity-summary.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const activity_entity_1 = require("./entities/activity.entity");
let ActivitiesController = class ActivitiesController {
    constructor(activitiesService) {
        this.activitiesService = activitiesService;
    }
    async create(createActivityDto, req) {
        const userId = req.user.sub;
        return this.activitiesService.createByUserId(createActivityDto, userId);
    }
    async findAll(req, classGroupId, startDate, endDate) {
        const userId = req.user.sub;
        return this.activitiesService.findAllByUserId(userId, classGroupId, startDate, endDate);
    }
    async getTeacherSummary(req) {
        const userId = req.user.sub;
        return this.activitiesService.getTeacherSummaryByUserId(userId);
    }
    async findOne(id) {
        return this.activitiesService.findOne(id);
    }
    async update(id, updateActivityDto, req) {
        const userId = req.user.sub;
        return this.activitiesService.updateByUserId(id, updateActivityDto, userId);
    }
    async remove(id, req) {
        const userId = req.user.sub;
        await this.activitiesService.removeByUserId(id, userId);
        return { message: 'Actividad eliminada exitosamente' };
    }
    async assessStudent(activityId, studentId, assessDto, req) {
        const userId = req.user.sub;
        return this.activitiesService.assessStudentByUserId(activityId, studentId, assessDto, userId);
    }
    async bulkAssess(activityId, bulkAssessDto, req) {
        const userId = req.user.sub;
        return this.activitiesService.bulkAssessByUserId(activityId, bulkAssessDto, userId);
    }
    async getActivityStatistics(id, req) {
        const userId = req.user.sub;
        return this.activitiesService.getActivityStatisticsByUserId(id, userId);
    }
    async getTeacherSubjectAssignments(req) {
        const userId = req.user.sub;
        return this.activitiesService.getTeacherSubjectAssignmentsByUserId(userId);
    }
    async findActivitiesBySubjectAssignment(subjectAssignmentId, req, includeArchived) {
        const userId = req.user.sub;
        return this.activitiesService.findActivitiesBySubjectAssignmentUserId(subjectAssignmentId, userId, includeArchived === true);
    }
    async getSubjectActivitySummary(subjectAssignmentId, req) {
        const userId = req.user.sub;
        return this.activitiesService.getSubjectActivitySummaryByUserId(subjectAssignmentId, userId);
    }
    async getTeacherTemplates(req) {
        const userId = req.user.sub;
        return this.activitiesService.getTeacherTemplatesByUserId(userId);
    }
    async createFromTemplate(createFromTemplateDto, req) {
        const userId = req.user.sub;
        return this.activitiesService.createFromTemplateByUserId(createFromTemplateDto, userId);
    }
    async toggleArchive(id, req) {
        const userId = req.user.sub;
        return this.activitiesService.toggleArchiveByUserId(id, userId);
    }
    async getFamilyActivities(req, studentId, limit) {
        const familyUserId = req.user.id;
        return this.activitiesService.getFamilyActivities(familyUserId, studentId, limit || 10);
    }
    async getTestTeacherAssignments() {
        const teacherId = '19f18f41-9480-40c3-9165-b9d0404d5bb1';
        return this.activitiesService.getTeacherSubjectAssignments(teacherId);
    }
    async getTestTeacherSummary() {
        const teacherId = '19f18f41-9480-40c3-9165-b9d0404d5bb1';
        return this.activitiesService.getTeacherSummary(teacherId);
    }
};
exports.ActivitiesController = ActivitiesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nueva actividad diaria' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Actividad creada exitosamente', type: activity_entity_1.Activity }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Sin permisos para acceder al grupo' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_activity_dto_1.CreateActivityDto, Object]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener actividades del profesor' }),
    (0, swagger_1.ApiQuery)({ name: 'classGroupId', required: false, description: 'ID del grupo de clase' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Fecha de inicio (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'Fecha de fin (YYYY-MM-DD)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de actividades', type: [activity_entity_1.Activity] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('classGroupId')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener resumen de actividades del profesor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resumen de actividades', type: activity_statistics_dto_1.TeacherActivitySummaryDto }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "getTeacherSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener actividad por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Actividad encontrada', type: activity_entity_1.Activity }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Actividad no encontrada' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar actividad' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Actividad actualizada', type: activity_entity_1.Activity }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Sin permisos para editar esta actividad' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Actividad no encontrada' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_activity_dto_1.UpdateActivityDto, Object]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar actividad (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Actividad eliminada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Sin permisos para eliminar esta actividad' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Actividad no encontrada' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':activityId/assess/:studentId'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Valorar actividad de un estudiante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Valoración registrada', type: assess_activity_dto_1.AssessmentResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Valor de valoración inválido' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Sin permisos para valorar esta actividad' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Actividad o estudiante no encontrado' }),
    __param(0, (0, common_1.Param)('activityId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('studentId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, assess_activity_dto_1.AssessActivityDto, Object]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "assessStudent", null);
__decorate([
    (0, common_1.Post)(':activityId/bulk-assess'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Valoración masiva de actividad' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Valoraciones masivas registradas', type: [assess_activity_dto_1.AssessmentResponseDto] }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Valor de valoración inválido' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Sin permisos para valorar esta actividad' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Actividad no encontrada' }),
    __param(0, (0, common_1.Param)('activityId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assess_activity_dto_1.BulkAssessActivityDto, Object]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "bulkAssess", null);
__decorate([
    (0, common_1.Get)(':id/statistics'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estadísticas de una actividad' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estadísticas de la actividad', type: activity_statistics_dto_1.ActivityStatisticsDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Sin permisos para ver estas estadísticas' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Actividad no encontrada' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "getActivityStatistics", null);
__decorate([
    (0, common_1.Get)('teacher/subject-assignments'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener asignaciones de asignaturas del profesor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de asignaciones con estudiantes', type: [subject_assignment_with_students_dto_1.SubjectAssignmentWithStudentsDto] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "getTeacherSubjectAssignments", null);
__decorate([
    (0, common_1.Get)('subject/:subjectAssignmentId'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener actividades por asignación de asignatura' }),
    (0, swagger_1.ApiQuery)({ name: 'includeArchived', required: false, description: 'Incluir actividades archivadas' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de actividades de la asignatura', type: [activity_entity_1.Activity] }),
    __param(0, (0, common_1.Param)('subjectAssignmentId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('includeArchived')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Boolean]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "findActivitiesBySubjectAssignment", null);
__decorate([
    (0, common_1.Get)('subject/:subjectAssignmentId/summary'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Resumen de actividades por asignatura' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resumen de la asignatura', type: subject_activity_summary_dto_1.SubjectActivitySummaryDto }),
    __param(0, (0, common_1.Param)('subjectAssignmentId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "getSubjectActivitySummary", null);
__decorate([
    (0, common_1.Get)('templates'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener plantillas de actividades del profesor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de plantillas', type: [activity_entity_1.Activity] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "getTeacherTemplates", null);
__decorate([
    (0, common_1.Post)('create-from-template'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Crear actividad desde plantilla' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Actividad creada desde plantilla', type: activity_entity_1.Activity }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Plantilla no encontrada' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [activity_template_dto_1.CreateFromTemplateDto, Object]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "createFromTemplate", null);
__decorate([
    (0, common_1.Patch)(':id/archive'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Archivar/desarchivar actividad' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estado actualizado', type: activity_entity_1.Activity }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "toggleArchive", null);
__decorate([
    (0, common_1.Get)('family/activities'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener actividades valoradas para la familia' }),
    (0, swagger_1.ApiQuery)({ name: 'studentId', required: false, description: 'ID del estudiante específico' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Límite de resultados', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de actividades valoradas', type: [assess_activity_dto_1.AssessmentResponseDto] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('studentId')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "getFamilyActivities", null);
__decorate([
    (0, common_1.Get)('test/teacher-assignments'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'TEST: Obtener subject assignments sin auth' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "getTestTeacherAssignments", null);
__decorate([
    (0, common_1.Get)('test/summary'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'TEST: Obtener teacher summary sin auth' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ActivitiesController.prototype, "getTestTeacherSummary", null);
exports.ActivitiesController = ActivitiesController = __decorate([
    (0, swagger_1.ApiTags)('activities'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('activities'),
    __metadata("design:paramtypes", [activities_service_1.ActivitiesService])
], ActivitiesController);
//# sourceMappingURL=activities.controller.js.map