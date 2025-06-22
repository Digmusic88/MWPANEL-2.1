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
exports.FamiliesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const families_service_1 = require("./families.service");
const create_family_dto_1 = require("./dto/create-family.dto");
const update_family_dto_1 = require("./dto/update-family.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let FamiliesController = class FamiliesController {
    constructor(familiesService) {
        this.familiesService = familiesService;
    }
    create(createFamilyDto) {
        return this.familiesService.create(createFamilyDto);
    }
    findAll() {
        return this.familiesService.findAll();
    }
    getAvailableStudents() {
        return this.familiesService.getAvailableStudents();
    }
    getMyFamilyDashboard(req) {
        return this.familiesService.getFamilyDashboard(req.user.id);
    }
    findOne(id) {
        return this.familiesService.findOne(id);
    }
    update(id, updateFamilyDto) {
        return this.familiesService.update(id, updateFamilyDto);
    }
    remove(id) {
        return this.familiesService.remove(id);
    }
};
exports.FamiliesController = FamiliesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Crear una nueva familia' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Familia creada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email ya existe' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_family_dto_1.CreateFamilyDto]),
    __metadata("design:returntype", void 0)
], FamiliesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todas las familias' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de familias' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FamiliesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('available-students'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estudiantes disponibles para asignar a familias' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de estudiantes disponibles' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FamiliesController.prototype, "getAvailableStudents", null);
__decorate([
    (0, common_1.Get)('dashboard/my-family'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener datos del dashboard para la familia logueada' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Datos del dashboard familiar' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FamiliesController.prototype, "getMyFamilyDashboard", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener una familia por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Datos de la familia' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Familia no encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FamiliesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar una familia' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Familia actualizada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Familia no encontrada' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email ya existe' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_family_dto_1.UpdateFamilyDto]),
    __metadata("design:returntype", void 0)
], FamiliesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar una familia (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Familia eliminada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Familia no encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FamiliesController.prototype, "remove", null);
exports.FamiliesController = FamiliesController = __decorate([
    (0, swagger_1.ApiTags)('Familias'),
    (0, common_1.Controller)('families'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [families_service_1.FamiliesService])
], FamiliesController);
//# sourceMappingURL=families.controller.js.map