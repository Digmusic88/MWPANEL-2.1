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
exports.AcademicRecordsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const academic_records_service_1 = require("./academic-records.service");
const report_generator_service_1 = require("./services/report-generator.service");
const academic_record_dto_1 = require("./dto/academic-record.dto");
const academic_record_entity_1 = require("./entities/academic-record.entity");
const academic_record_entry_entity_1 = require("./entities/academic-record-entry.entity");
const academic_record_grade_entity_1 = require("./entities/academic-record-grade.entity");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let AcademicRecordsController = class AcademicRecordsController {
    constructor(academicRecordsService, reportGeneratorService) {
        this.academicRecordsService = academicRecordsService;
        this.reportGeneratorService = reportGeneratorService;
    }
    async createRecord(createDto) {
        return this.academicRecordsService.createRecord(createDto);
    }
    async getStudentRecords(studentId, query) {
        return this.academicRecordsService.findStudentRecords(studentId, query);
    }
    async getRecord(id) {
        return this.academicRecordsService.findRecordById(id);
    }
    async updateRecord(id, updateDto) {
        return this.academicRecordsService.updateRecord(id, updateDto);
    }
    async deleteRecord(id) {
        await this.academicRecordsService.deleteRecord(id);
        return { message: 'Expediente eliminado exitosamente' };
    }
    async createEntry(createDto) {
        return this.academicRecordsService.createEntry(createDto);
    }
    async getEntry(id) {
        return this.academicRecordsService.findEntryById(id);
    }
    async updateEntry(id, updateDto) {
        return this.academicRecordsService.updateEntry(id, updateDto);
    }
    async deleteEntry(id) {
        await this.academicRecordsService.deleteEntry(id);
        return { message: 'Entrada eliminada exitosamente' };
    }
    async createGrade(createDto) {
        return this.academicRecordsService.createGrade(createDto);
    }
    async getGrade(id) {
        return this.academicRecordsService.findGradeById(id);
    }
    async updateGrade(id, updateDto) {
        return this.academicRecordsService.updateGrade(id, updateDto);
    }
    async deleteGrade(id) {
        await this.academicRecordsService.deleteGrade(id);
        return { message: 'Calificación eliminada exitosamente' };
    }
    async generateStudentReport(studentId, academicYear, options = {}) {
        const report = await this.reportGeneratorService.generateStudentReport(studentId, academicYear, options);
        return {
            fileName: report.fileName,
            message: 'Boletín generado exitosamente',
        };
    }
    async generateClassReport(classGroupId, academicYear, options = {}) {
        const report = await this.reportGeneratorService.generateClassReport(classGroupId, academicYear, options);
        return {
            fileName: report.fileName,
            message: 'Reporte de clase generado exitosamente',
        };
    }
    async downloadReport(fileName, res) {
        try {
            const filePath = await this.reportGeneratorService.getReportPath(fileName);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.sendFile(filePath);
        }
        catch (error) {
            throw new common_1.NotFoundException('Archivo de reporte no encontrado');
        }
    }
    async deleteReport(fileName) {
        await this.reportGeneratorService.deleteReport(fileName);
        return { message: 'Reporte eliminado exitosamente' };
    }
    async getStudentStatistics(studentId, academicYear) {
        return this.academicRecordsService.getStudentStatistics(studentId, academicYear);
    }
    async syncFromEvaluations(studentId, academicYear) {
        return this.academicRecordsService.syncFromEvaluations(studentId, academicYear);
    }
};
exports.AcademicRecordsController = AcademicRecordsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nuevo expediente académico' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Expediente creado', type: academic_record_entity_1.AcademicRecord }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [academic_record_dto_1.CreateAcademicRecordDto]),
    __metadata("design:returntype", Promise)
], AcademicRecordsController.prototype, "createRecord", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener expedientes de un estudiante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Expedientes encontrados' }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, academic_record_dto_1.AcademicRecordQueryDto]),
    __metadata("design:returntype", Promise)
], AcademicRecordsController.prototype, "getStudentRecords", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener expediente por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Expediente encontrado', type: academic_record_entity_1.AcademicRecord }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicRecordsController.prototype, "getRecord", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar expediente académico' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Expediente actualizado', type: academic_record_entity_1.AcademicRecord }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, academic_record_dto_1.UpdateAcademicRecordDto]),
    __metadata("design:returntype", Promise)
], AcademicRecordsController.prototype, "updateRecord", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar expediente académico' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Expediente eliminado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicRecordsController.prototype, "deleteRecord", null);
__decorate([
    (0, common_1.Post)('entries'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Crear entrada en expediente' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Entrada creada', type: academic_record_entry_entity_1.AcademicRecordEntry }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [academic_record_dto_1.CreateAcademicRecordEntryDto]),
    __metadata("design:returntype", Promise)
], AcademicRecordsController.prototype, "createEntry", null);
__decorate([
    (0, common_1.Get)('entries/:id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener entrada por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Entrada encontrada', type: academic_record_entry_entity_1.AcademicRecordEntry }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicRecordsController.prototype, "getEntry", null);
__decorate([
    (0, common_1.Put)('entries/:id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar entrada en expediente' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Entrada actualizada', type: academic_record_entry_entity_1.AcademicRecordEntry }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, academic_record_dto_1.UpdateAcademicRecordEntryDto]),
    __metadata("design:returntype", Promise)
], AcademicRecordsController.prototype, "updateEntry", null);
__decorate([
    (0, common_1.Delete)('entries/:id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar entrada de expediente' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Entrada eliminada' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicRecordsController.prototype, "deleteEntry", null);
__decorate([
    (0, common_1.Post)('grades'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Crear calificación en expediente' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Calificación creada', type: academic_record_grade_entity_1.AcademicRecordGrade }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [academic_record_dto_1.CreateAcademicRecordGradeDto]),
    __metadata("design:returntype", Promise)
], AcademicRecordsController.prototype, "createGrade", null);
__decorate([
    (0, common_1.Get)('grades/:id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener calificación por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Calificación encontrada', type: academic_record_grade_entity_1.AcademicRecordGrade }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicRecordsController.prototype, "getGrade", null);
__decorate([
    (0, common_1.Put)('grades/:id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar calificación en expediente' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Calificación actualizada', type: academic_record_grade_entity_1.AcademicRecordGrade }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, academic_record_dto_1.UpdateAcademicRecordGradeDto]),
    __metadata("design:returntype", Promise)
], AcademicRecordsController.prototype, "updateGrade", null);
__decorate([
    (0, common_1.Delete)('grades/:id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar calificación de expediente' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Calificación eliminada' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicRecordsController.prototype, "deleteGrade", null);
__decorate([
    (0, common_1.Post)('reports/student/:studentId/:academicYear'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Generar boletín PDF de estudiante' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Boletín generado' }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Param)('academicYear')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AcademicRecordsController.prototype, "generateStudentReport", null);
__decorate([
    (0, common_1.Post)('reports/class/:classGroupId/:academicYear'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Generar reporte PDF de clase' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Reporte generado' }),
    __param(0, (0, common_1.Param)('classGroupId')),
    __param(1, (0, common_1.Param)('academicYear')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AcademicRecordsController.prototype, "generateClassReport", null);
__decorate([
    (0, common_1.Get)('reports/download/:fileName'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Descargar reporte PDF' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Archivo PDF' }),
    __param(0, (0, common_1.Param)('fileName')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AcademicRecordsController.prototype, "downloadReport", null);
__decorate([
    (0, common_1.Delete)('reports/:fileName'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar reporte PDF' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reporte eliminado' }),
    __param(0, (0, common_1.Param)('fileName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicRecordsController.prototype, "deleteReport", null);
__decorate([
    (0, common_1.Get)('statistics/student/:studentId'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estadísticas de estudiante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estadísticas obtenidas' }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('academicYear')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AcademicRecordsController.prototype, "getStudentStatistics", null);
__decorate([
    (0, common_1.Post)('sync/student/:studentId/:academicYear'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Sincronizar expediente con evaluaciones existentes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Expediente sincronizado', type: academic_record_entity_1.AcademicRecord }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Param)('academicYear')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AcademicRecordsController.prototype, "syncFromEvaluations", null);
exports.AcademicRecordsController = AcademicRecordsController = __decorate([
    (0, swagger_1.ApiTags)('Academic Records'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('academic-records'),
    __metadata("design:paramtypes", [academic_records_service_1.AcademicRecordsService,
        report_generator_service_1.ReportGeneratorService])
], AcademicRecordsController);
//# sourceMappingURL=academic-records.controller.js.map