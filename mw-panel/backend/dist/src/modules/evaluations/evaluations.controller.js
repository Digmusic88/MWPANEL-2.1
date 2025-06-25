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
exports.EvaluationsController = exports.Public = exports.IS_PUBLIC_KEY = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const evaluations_service_1 = require("./evaluations.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
exports.IS_PUBLIC_KEY = 'isPublic';
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;
let EvaluationsController = class EvaluationsController {
    constructor(evaluationsService) {
        this.evaluationsService = evaluationsService;
    }
    findAll() {
        return this.evaluationsService.findAll();
    }
    getStats() {
        return this.evaluationsService.getEvaluationStats();
    }
    findByStudent(studentId) {
        return this.evaluationsService.findByStudent(studentId);
    }
    findByTeacher(teacherId) {
        return this.evaluationsService.findByTeacher(teacherId);
    }
    getRadarChart(studentId, periodId) {
        return this.evaluationsService.getRadarChart(studentId, periodId);
    }
    generateRadarChart(studentId, periodId) {
        return this.evaluationsService.generateRadarChart(studentId, periodId);
    }
    getAllPeriods() {
        return this.evaluationsService.getAllPeriods();
    }
    getActivePeriod() {
        return this.evaluationsService.getActivePeriod();
    }
    createEvaluationPeriods() {
        return this.evaluationsService.createEvaluationPeriods();
    }
    async createTestData() {
        return this.evaluationsService.createTestData();
    }
    async initPeriods() {
        return this.evaluationsService.createEvaluationPeriods();
    }
    findOne(id) {
        return this.evaluationsService.findOne(id);
    }
    create(createEvaluationDto) {
        return this.evaluationsService.create(createEvaluationDto);
    }
    update(id, updateEvaluationDto) {
        return this.evaluationsService.update(id, updateEvaluationDto);
    }
    remove(id) {
        return this.evaluationsService.remove(id);
    }
};
exports.EvaluationsController = EvaluationsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todas las evaluaciones' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de evaluaciones obtenida exitosamente' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EvaluationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estadísticas de evaluaciones' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estadísticas obtenidas exitosamente' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EvaluationsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener evaluaciones de un estudiante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Evaluaciones del estudiante obtenidas exitosamente' }),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EvaluationsController.prototype, "findByStudent", null);
__decorate([
    (0, common_1.Get)('teacher/:teacherId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener evaluaciones de un profesor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Evaluaciones del profesor obtenidas exitosamente' }),
    __param(0, (0, common_1.Param)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EvaluationsController.prototype, "findByTeacher", null);
__decorate([
    (0, common_1.Get)('radar/:studentId/:periodId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener diana competencial de un estudiante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Diana competencial obtenida exitosamente' }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Param)('periodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EvaluationsController.prototype, "getRadarChart", null);
__decorate([
    (0, common_1.Post)('radar/:studentId/:periodId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Generar diana competencial de un estudiante' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Diana competencial generada exitosamente' }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Param)('periodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EvaluationsController.prototype, "generateRadarChart", null);
__decorate([
    (0, common_1.Get)('periods'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todos los períodos de evaluación' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Períodos obtenidos exitosamente' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EvaluationsController.prototype, "getAllPeriods", null);
__decorate([
    (0, common_1.Get)('periods/active'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener período de evaluación activo' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Período activo obtenido exitosamente' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EvaluationsController.prototype, "getActivePeriod", null);
__decorate([
    (0, common_1.Post)('periods/initialize'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Inicializar períodos de evaluación para el año académico' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Períodos creados exitosamente' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EvaluationsController.prototype, "createEvaluationPeriods", null);
__decorate([
    (0, common_1.Post)('setup/test-data'),
    (0, exports.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear datos de prueba para evaluaciones' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Datos de prueba creados exitosamente' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EvaluationsController.prototype, "createTestData", null);
__decorate([
    (0, common_1.Post)('init/periods'),
    (0, exports.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Inicializar períodos (sin auth)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Períodos creados exitosamente' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EvaluationsController.prototype, "initPeriods", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener una evaluación específica' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Evaluación obtenida exitosamente' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EvaluationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Crear una nueva evaluación' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Evaluación creada exitosamente' }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EvaluationsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar una evaluación' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Evaluación actualizada exitosamente' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EvaluationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar una evaluación' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Evaluación eliminada exitosamente' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EvaluationsController.prototype, "remove", null);
exports.EvaluationsController = EvaluationsController = __decorate([
    (0, swagger_1.ApiTags)('Evaluaciones'),
    (0, common_1.Controller)('evaluations'),
    __metadata("design:paramtypes", [evaluations_service_1.EvaluationsService])
], EvaluationsController);
//# sourceMappingURL=evaluations.controller.js.map