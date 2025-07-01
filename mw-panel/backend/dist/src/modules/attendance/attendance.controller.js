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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const attendance_service_1 = require("./attendance.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const attendance_request_entity_1 = require("./entities/attendance-request.entity");
let AttendanceController = class AttendanceController {
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    async createRecord(req, createDto) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        return this.attendanceService.createAttendanceRecord(createDto, userId);
    }
    async updateRecord(id, req, updateDto) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        return this.attendanceService.updateAttendanceRecord(id, updateDto, userId);
    }
    async getByGroup(classGroupId, date) {
        return this.attendanceService.getAttendanceByGroup(classGroupId, date);
    }
    async getByStudent(req, studentId, startDate, endDate) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        const userRole = req.user?.role;
        return this.attendanceService.getAttendanceByStudent(studentId, startDate, endDate, userId, userRole);
    }
    async bulkMarkPresent(req, bulkDto) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        return this.attendanceService.bulkMarkPresent(bulkDto, userId);
    }
    async createRequest(req, createDto) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        return this.attendanceService.createAttendanceRequest(createDto, userId);
    }
    async reviewRequest(id, req, reviewDto) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        return this.attendanceService.reviewAttendanceRequest(id, reviewDto, userId);
    }
    async getRequestsByStudent(req, studentId, status) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        const userRole = req.user?.role;
        return this.attendanceService.getRequestsByStudent(studentId, status, userId, userRole);
    }
    async getPendingRequestsByGroup(classGroupId) {
        return this.attendanceService.getPendingRequestsByGroup(classGroupId);
    }
    async getMyRequests(req) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        return this.attendanceService.getRequestsByUser(userId);
    }
    async getMyChildren(req) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        return this.attendanceService.getFamilyChildren(userId);
    }
    async getMyChildAttendance(req, studentId, startDate, endDate) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        return this.attendanceService.getAttendanceByStudent(studentId, startDate, endDate, userId, 'family');
    }
    async getMyChildRequests(req, studentId, status) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        return this.attendanceService.getRequestsByStudent(studentId, status, userId, 'family');
    }
    async getGroupStats(classGroupId, startDate, endDate) {
        return this.attendanceService.getAttendanceStats(classGroupId, startDate, endDate);
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Post)('records'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear registro de asistencia' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Registro creado exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateAttendanceRecordDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "createRecord", null);
__decorate([
    (0, common_1.Patch)('records/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar registro de asistencia' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Registro actualizado exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, dto_1.UpdateAttendanceRecordDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "updateRecord", null);
__decorate([
    (0, common_1.Get)('records/group/:classGroupId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener asistencia por grupo y fecha' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de registros de asistencia' }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: true, description: 'Fecha (YYYY-MM-DD)' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('classGroupId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getByGroup", null);
__decorate([
    (0, common_1.Get)('records/student/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener historial de asistencia de un estudiante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Historial de asistencia' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.STUDENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('studentId')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getByStudent", null);
__decorate([
    (0, common_1.Post)('records/bulk-present'),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar presentes en masa (solo estudiantes sin registro)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Registros creados exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.BulkMarkPresentDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "bulkMarkPresent", null);
__decorate([
    (0, common_1.Post)('requests'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear solicitud de justificación' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Solicitud creada exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateAttendanceRequestDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "createRequest", null);
__decorate([
    (0, common_1.Patch)('requests/:id/review'),
    (0, swagger_1.ApiOperation)({ summary: 'Revisar solicitud de justificación' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Solicitud revisada exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, dto_1.ReviewAttendanceRequestDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "reviewRequest", null);
__decorate([
    (0, common_1.Get)('requests/student/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener solicitudes de un estudiante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de solicitudes' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: attendance_request_entity_1.AttendanceRequestStatus }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.STUDENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('studentId')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getRequestsByStudent", null);
__decorate([
    (0, common_1.Get)('requests/group/:classGroupId/pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener solicitudes pendientes de un grupo' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de solicitudes pendientes' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('classGroupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getPendingRequestsByGroup", null);
__decorate([
    (0, common_1.Get)('requests/my-requests'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener mis solicitudes realizadas' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de solicitudes del usuario' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.FAMILY),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getMyRequests", null);
__decorate([
    (0, common_1.Get)('family/my-children'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener lista de mis hijos (solo para familias)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de hijos de la familia' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.FAMILY),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getMyChildren", null);
__decorate([
    (0, common_1.Get)('family/child/:studentId/attendance'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener historial de asistencia de mi hijo' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Historial de asistencia del hijo' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.FAMILY),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('studentId')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getMyChildAttendance", null);
__decorate([
    (0, common_1.Get)('family/child/:studentId/requests'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener solicitudes de mi hijo' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de solicitudes del hijo' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: attendance_request_entity_1.AttendanceRequestStatus }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.FAMILY),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('studentId')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getMyChildRequests", null);
__decorate([
    (0, common_1.Get)('stats/group/:classGroupId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estadísticas de asistencia del grupo' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estadísticas de asistencia' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: true }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('classGroupId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getGroupStats", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, swagger_1.ApiTags)('attendance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('attendance'),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map