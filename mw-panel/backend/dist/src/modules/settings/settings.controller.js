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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const settings_service_1 = require("./settings.service");
const system_setting_dto_1 = require("./dto/system-setting.dto");
const system_setting_entity_1 = require("./entities/system-setting.entity");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let SettingsController = class SettingsController {
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    async create(createDto) {
        return this.settingsService.create(createDto);
    }
    async findAll(category) {
        return this.settingsService.findAll(category);
    }
    async getModuleSettings() {
        return this.settingsService.findAll(system_setting_entity_1.SettingCategory.MODULES);
    }
    async findByKey(key) {
        return this.settingsService.findByKey(key);
    }
    async update(key, updateDto) {
        return this.settingsService.update(key, updateDto);
    }
    async delete(key) {
        await this.settingsService.delete(key);
        return { message: 'Configuración eliminada exitosamente' };
    }
    async enableModule(moduleName) {
        await this.settingsService.enableModule(moduleName);
        return { message: `Módulo ${moduleName} habilitado exitosamente` };
    }
    async disableModule(moduleName) {
        await this.settingsService.disableModule(moduleName);
        return { message: `Módulo ${moduleName} deshabilitado exitosamente` };
    }
    async getModuleStatus(moduleName) {
        const enabled = await this.settingsService.isModuleEnabled(moduleName);
        return { enabled };
    }
    async initializeSettings() {
        await this.settingsService.initializeDefaultSettings();
        return { message: 'Configuraciones por defecto inicializadas exitosamente' };
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nueva configuración' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Configuración creada', type: system_setting_dto_1.SystemSettingResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [system_setting_dto_1.CreateSystemSettingDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todas las configuraciones' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de configuraciones', type: [system_setting_dto_1.SystemSettingResponseDto] }),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('modules'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener configuraciones de módulos' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuraciones de módulos', type: [system_setting_dto_1.SystemSettingResponseDto] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getModuleSettings", null);
__decorate([
    (0, common_1.Get)(':key'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener configuración por clave' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuración encontrada', type: system_setting_dto_1.SystemSettingResponseDto }),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "findByKey", null);
__decorate([
    (0, common_1.Put)(':key'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar configuración' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuración actualizada', type: system_setting_dto_1.SystemSettingResponseDto }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, system_setting_dto_1.UpdateSystemSettingDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':key'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar configuración' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuración eliminada' }),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)('modules/:moduleName/enable'),
    (0, swagger_1.ApiOperation)({ summary: 'Habilitar módulo' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Módulo habilitado' }),
    __param(0, (0, common_1.Param)('moduleName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "enableModule", null);
__decorate([
    (0, common_1.Post)('modules/:moduleName/disable'),
    (0, swagger_1.ApiOperation)({ summary: 'Deshabilitar módulo' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Módulo deshabilitado' }),
    __param(0, (0, common_1.Param)('moduleName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "disableModule", null);
__decorate([
    (0, common_1.Get)('modules/:moduleName/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar estado de módulo' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estado del módulo' }),
    __param(0, (0, common_1.Param)('moduleName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getModuleStatus", null);
__decorate([
    (0, common_1.Post)('initialize'),
    (0, swagger_1.ApiOperation)({ summary: 'Inicializar configuraciones por defecto' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuraciones inicializadas' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "initializeSettings", null);
exports.SettingsController = SettingsController = __decorate([
    (0, swagger_1.ApiTags)('Settings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Controller)('settings'),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map