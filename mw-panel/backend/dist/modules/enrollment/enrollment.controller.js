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
exports.EnrollmentController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const enrollment_service_1 = require("./enrollment.service");
const bulk_import_service_1 = require("./services/bulk-import.service");
const create_enrollment_dto_1 = require("./dto/create-enrollment.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let EnrollmentController = class EnrollmentController {
    constructor(enrollmentService, bulkImportService) {
        this.enrollmentService = enrollmentService;
        this.bulkImportService = bulkImportService;
    }
    async createEnrollment(createEnrollmentDto) {
        console.log('Received enrollment data:', JSON.stringify(createEnrollmentDto, null, 2));
        try {
            return await this.enrollmentService.processEnrollment(createEnrollmentDto);
        }
        catch (error) {
            console.error('Enrollment processing error:', error);
            throw error;
        }
    }
    async createTestEnrollment() {
        console.log('Creating test enrollment with sample data...');
        const testData = {
            student: {
                firstName: 'Juan Carlos',
                lastName: 'Pérez González',
                email: 'juan.perez@test.com',
                password: 'password123',
                birthDate: '2010-05-15',
                documentNumber: '12345678A',
                phone: '666123456',
                educationalLevelId: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
                courseId: null,
                classGroupIds: []
            },
            family: {
                primaryContact: {
                    firstName: 'María',
                    lastName: 'González López',
                    email: 'maria.gonzalez@test.com',
                    password: 'password123',
                    phone: '666987654',
                    documentNumber: '87654321B',
                    dateOfBirth: '1985-03-20',
                    address: 'Calle Mayor 123, Madrid',
                    occupation: 'Enfermera',
                },
                secondaryContact: {
                    firstName: 'Carlos',
                    lastName: 'Pérez Martín',
                    email: 'carlos.perez@test.com',
                    password: 'password123',
                    phone: '666555444',
                    documentNumber: '11223344C',
                    dateOfBirth: '1982-08-10',
                    address: 'Calle Mayor 123, Madrid',
                    occupation: 'Ingeniero',
                },
                relationship: 'mother'
            }
        };
        try {
            console.log('Test data being processed:', JSON.stringify(testData, null, 2));
            return await this.enrollmentService.processEnrollment(testData);
        }
        catch (error) {
            console.error('Test enrollment error:', error);
            throw error;
        }
    }
    async bulkImport(file) {
        if (!file) {
            throw new Error('No se proporcionó ningún archivo');
        }
        console.log('Processing bulk import file:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });
        try {
            const result = await this.bulkImportService.processBulkImport(file);
            console.log('Bulk import completed:', {
                totalRows: result.totalRows,
                successful: result.successfulImports,
                failed: result.failedImports,
                errorsCount: result.errors.length
            });
            return result;
        }
        catch (error) {
            console.error('Bulk import error:', error);
            throw error;
        }
    }
    async downloadTemplate(res) {
        try {
            const template = await this.bulkImportService.generateTemplate();
            res.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="plantilla_inscripcion_masiva.xlsx"',
                'Content-Length': template.length.toString(),
            });
            res.send(template);
        }
        catch (error) {
            console.error('Template generation error:', error);
            throw error;
        }
    }
};
exports.EnrollmentController = EnrollmentController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Procesar inscripción de estudiante y familia' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Inscripción completada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email ya existe' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_enrollment_dto_1.CreateEnrollmentDto]),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "createEnrollment", null);
__decorate([
    (0, common_1.Post)('test'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'SOLO PARA TESTING - Crear inscripción con datos de prueba' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Inscripción de prueba creada exitosamente' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "createTestEnrollment", null);
__decorate([
    (0, common_1.Post)('bulk-import'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Importación masiva de estudiantes y familias desde archivo Excel/CSV' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Archivo procesado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Error en el archivo o datos inválidos' }),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "bulkImport", null);
__decorate([
    (0, common_1.Get)('template'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Descargar plantilla Excel para importación masiva' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Plantilla Excel generada exitosamente' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "downloadTemplate", null);
exports.EnrollmentController = EnrollmentController = __decorate([
    (0, swagger_1.ApiTags)('Inscripción'),
    (0, common_1.Controller)('enrollment'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [enrollment_service_1.EnrollmentService,
        bulk_import_service_1.BulkImportService])
], EnrollmentController);
//# sourceMappingURL=enrollment.controller.js.map