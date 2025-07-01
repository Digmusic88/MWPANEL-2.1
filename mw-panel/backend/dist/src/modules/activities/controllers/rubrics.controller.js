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
exports.RubricsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rubrics_service_1 = require("../services/rubrics.service");
const create_rubric_dto_1 = require("../dto/create-rubric.dto");
const update_rubric_dto_1 = require("../dto/update-rubric.dto");
const import_rubric_dto_1 = require("../dto/import-rubric.dto");
const rubric_assessment_dto_1 = require("../dto/rubric-assessment.dto");
const share_rubric_dto_1 = require("../dto/share-rubric.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../../common/decorators/public.decorator");
const user_entity_1 = require("../../users/entities/user.entity");
const rubric_entity_1 = require("../entities/rubric.entity");
let RubricsController = class RubricsController {
    constructor(rubricsService) {
        this.rubricsService = rubricsService;
    }
    async create(createRubricDto, req) {
        const userId = req.user.sub || req.user.id;
        return this.rubricsService.create(createRubricDto, userId);
    }
    async findAll(req, includeTemplates) {
        const userId = req.user.sub || req.user.id;
        return this.rubricsService.findAll(userId, includeTemplates === true);
    }
    async findOne(id) {
        return this.rubricsService.findOne(id);
    }
    async update(id, updateRubricDto, req) {
        const userId = req.user.sub || req.user.id;
        return this.rubricsService.update(id, updateRubricDto, userId);
    }
    async remove(id, req) {
        const userId = req.user.sub || req.user.id;
        await this.rubricsService.remove(id, userId);
        return { message: 'Rúbrica eliminada exitosamente' };
    }
    async publish(id, req) {
        const userId = req.user.sub || req.user.id;
        return this.rubricsService.publish(id, userId);
    }
    async previewImportFromChatGPT(previewDto) {
        return this.rubricsService.previewImportFromChatGPT(previewDto.format, previewDto.data);
    }
    async importFromChatGPT(importDto, req) {
        const userId = req.user.sub || req.user.id;
        return this.rubricsService.importFromChatGPT(importDto, userId);
    }
    async createAssessment(createDto) {
        return this.rubricsService.createAssessment(createDto);
    }
    async getAssessment(id) {
        return this.rubricsService.getAssessment(id);
    }
    async testGenerateColors(count) {
        return {
            count,
            colors: [],
        };
    }
    async testParseMarkdown(body) {
        return {
            message: 'Parser implementado en RubricUtilsService',
            input: body.data,
        };
    }
    async testParseCSV(body) {
        return {
            message: 'Parser implementado en RubricUtilsService',
            input: body.data,
        };
    }
    async shareRubric(id, shareDto, req) {
        const userId = req.user.sub || req.user.id;
        return this.rubricsService.shareRubric(id, shareDto.teacherIds, userId);
    }
    async unshareRubric(id, unshareDto, req) {
        const userId = req.user.sub || req.user.id;
        return this.rubricsService.unshareRubric(id, unshareDto.teacherIds, userId);
    }
    async getSharedWithMe(req) {
        const userId = req.user.sub || req.user.id;
        return this.rubricsService.getSharedWithMe(userId);
    }
    async getColleagues(req) {
        const userId = req.user.sub || req.user.id;
        return this.rubricsService.getColleagues(userId);
    }
};
exports.RubricsController = RubricsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nueva rúbrica' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Rúbrica creada exitosamente', type: rubric_entity_1.Rubric }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Sin permisos para crear rúbricas' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_rubric_dto_1.CreateRubricDto, Object]),
    __metadata("design:returntype", Promise)
], RubricsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener rúbricas del profesor' }),
    (0, swagger_1.ApiQuery)({ name: 'includeTemplates', required: false, description: 'Incluir plantillas', type: Boolean }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de rúbricas del profesor', type: [rubric_entity_1.Rubric] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('includeTemplates')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean]),
    __metadata("design:returntype", Promise)
], RubricsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener rúbrica por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rúbrica encontrada', type: rubric_entity_1.Rubric }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rúbrica no encontrada' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RubricsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar rúbrica' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rúbrica actualizada exitosamente', type: rubric_entity_1.Rubric }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Sin permisos para editar esta rúbrica' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rúbrica no encontrada' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_rubric_dto_1.UpdateRubricDto, Object]),
    __metadata("design:returntype", Promise)
], RubricsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar rúbrica (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rúbrica eliminada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Sin permisos para eliminar esta rúbrica' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rúbrica no encontrada' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RubricsController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/publish'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Publicar rúbrica (cambiar estado a activo)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rúbrica publicada exitosamente', type: rubric_entity_1.Rubric }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Sin permisos para publicar esta rúbrica' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rúbrica no encontrada' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RubricsController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)('preview-import'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Vista previa de rúbrica desde ChatGPT (Markdown o CSV)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vista previa generada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Error en el formato de importación' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RubricsController.prototype, "previewImportFromChatGPT", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Importar rúbrica desde ChatGPT (Markdown o CSV)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Rúbrica importada exitosamente', type: rubric_entity_1.Rubric }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Error en el formato de importación' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [import_rubric_dto_1.ImportRubricDto, Object]),
    __metadata("design:returntype", Promise)
], RubricsController.prototype, "importFromChatGPT", null);
__decorate([
    (0, common_1.Post)('assessments'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Crear evaluación con rúbrica' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Evaluación creada exitosamente', type: rubric_assessment_dto_1.RubricAssessmentResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos de evaluación inválidos' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rubric_assessment_dto_1.CreateRubricAssessmentDto]),
    __metadata("design:returntype", Promise)
], RubricsController.prototype, "createAssessment", null);
__decorate([
    (0, common_1.Get)('assessments/:id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener evaluación con rúbrica por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Evaluación encontrada', type: rubric_assessment_dto_1.RubricAssessmentResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Evaluación no encontrada' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RubricsController.prototype, "getAssessment", null);
__decorate([
    (0, common_1.Get)('test/colors/:count'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'TEST: Generar colores automáticos para niveles' }),
    __param(0, (0, common_1.Param)('count')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RubricsController.prototype, "testGenerateColors", null);
__decorate([
    (0, common_1.Post)('test/parse-markdown'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'TEST: Parsear tabla Markdown' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RubricsController.prototype, "testParseMarkdown", null);
__decorate([
    (0, common_1.Post)('test/parse-csv'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'TEST: Parsear tabla CSV' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RubricsController.prototype, "testParseCSV", null);
__decorate([
    (0, common_1.Post)(':id/share'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Compartir rúbrica con otros profesores' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rúbrica compartida exitosamente', type: rubric_entity_1.Rubric }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Sin permisos para compartir esta rúbrica' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rúbrica no encontrada' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, share_rubric_dto_1.ShareRubricDto, Object]),
    __metadata("design:returntype", Promise)
], RubricsController.prototype, "shareRubric", null);
__decorate([
    (0, common_1.Post)(':id/unshare'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Retirar acceso de rúbrica compartida' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Acceso retirado exitosamente', type: rubric_entity_1.Rubric }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Sin permisos para modificar esta rúbrica' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rúbrica no encontrada' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, share_rubric_dto_1.UnshareRubricDto, Object]),
    __metadata("design:returntype", Promise)
], RubricsController.prototype, "unshareRubric", null);
__decorate([
    (0, common_1.Get)('shared-with-me'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener rúbricas compartidas conmigo' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de rúbricas compartidas conmigo', type: [rubric_entity_1.Rubric] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RubricsController.prototype, "getSharedWithMe", null);
__decorate([
    (0, common_1.Get)('colleagues'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener lista de profesores colegas para compartir' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de profesores', type: Array }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RubricsController.prototype, "getColleagues", null);
exports.RubricsController = RubricsController = __decorate([
    (0, swagger_1.ApiTags)('rubrics'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('rubrics'),
    __metadata("design:paramtypes", [rubrics_service_1.RubricsService])
], RubricsController);
//# sourceMappingURL=rubrics.controller.js.map