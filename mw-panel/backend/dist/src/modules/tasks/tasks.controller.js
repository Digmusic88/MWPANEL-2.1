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
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const tasks_service_1 = require("./tasks.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const entities_1 = require("./entities");
const multerConfig = {
    storage: (0, multer_1.diskStorage)({
        destination: (req, file, cb) => {
            const uploadPath = (0, path_1.join)(process.cwd(), 'uploads', 'tasks');
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const fileExtension = (0, path_1.extname)(file.originalname);
            cb(null, `task-${uniqueSuffix}${fileExtension}`);
        },
    }),
    limits: {
        fileSize: 100 * 1024 * 1024,
        files: 10,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/zip',
            'application/x-rar-compressed',
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new common_1.BadRequestException(`Tipo de archivo no permitido: ${file.mimetype}`), false);
        }
    },
};
let TasksController = class TasksController {
    constructor(tasksService) {
        this.tasksService = tasksService;
    }
    async create(createTaskDto, req) {
        return this.tasksService.create(createTaskDto, req.user.sub);
    }
    async findMyTasks(query, req) {
        return this.tasksService.findAllByTeacher(req.user.sub, query);
    }
    async getTeacherStatistics(req) {
        return this.tasksService.getTeacherStatistics(req.user.sub);
    }
    async uploadTaskAttachments(id, files, req) {
        await this.tasksService.uploadTaskAttachments(id, files, req.user.sub);
        return { message: 'Archivos subidos exitosamente', files: files.map(f => f.filename) };
    }
    async downloadTaskAttachment(attachmentId, res) {
        const { filePath, originalName } = await this.tasksService.downloadAttachment(attachmentId, 'task');
        const file = (0, fs_1.createReadStream)(filePath);
        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${originalName}"`,
        });
        return new common_1.StreamableFile(file);
    }
    async downloadSubmissionAttachment(attachmentId, res) {
        const { filePath, originalName } = await this.tasksService.downloadAttachment(attachmentId, 'submission');
        const file = (0, fs_1.createReadStream)(filePath);
        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${originalName}"`,
        });
        return new common_1.StreamableFile(file);
    }
    async deleteTaskAttachment(attachmentId, req) {
        return this.tasksService.deleteTaskAttachment(attachmentId, req.user.sub);
    }
    async deleteSubmissionAttachment(attachmentId, req) {
        return this.tasksService.deleteSubmissionAttachment(attachmentId, req.user.sub);
    }
    async update(id, updateTaskDto, req) {
        return this.tasksService.update(id, updateTaskDto, req.user.sub);
    }
    async remove(id, req) {
        return this.tasksService.remove(id, req.user.sub);
    }
    async getSubmission(submissionId, req) {
        return this.tasksService.getSubmission(submissionId, req.user.sub);
    }
    async gradeSubmission(submissionId, gradeDto, req) {
        return this.tasksService.gradeSubmission(submissionId, gradeDto, req.user.sub);
    }
    async getMyTasks(query, req) {
        return this.tasksService.getStudentTasks(req.user.sub, query);
    }
    async getStudentStatistics(req) {
        return this.tasksService.getStudentStatistics(req.user.sub);
    }
    async submitTask(id, submitDto, req) {
        console.log(`[DEBUG] Controller - Full req.user object:`, JSON.stringify(req.user, null, 2));
        console.log(`[DEBUG] Controller - req.user.sub:`, req.user?.sub);
        console.log(`[DEBUG] Controller - req.user.id:`, req.user?.id);
        if (!req.user) {
            throw new common_1.BadRequestException('Usuario no autenticado correctamente');
        }
        const userId = req.user.sub || req.user.id;
        if (!userId) {
            throw new common_1.BadRequestException('ID de usuario no disponible');
        }
        console.log(`[DEBUG] Controller - Using userId:`, userId);
        return this.tasksService.submitTask(id, submitDto, userId);
    }
    async uploadSubmissionAttachments(submissionId, files, req) {
        await this.tasksService.uploadSubmissionAttachments(submissionId, files, req.user.sub);
        return { message: 'Archivos subidos exitosamente', files: files.map(f => f.filename) };
    }
    async getFamilyTasks(query, req) {
        return this.tasksService.getFamilyTasks(req.user.sub, query);
    }
    async getFamilyStudentStatistics(studentId, req) {
        return this.tasksService.getStudentStatistics(studentId);
    }
    async findOne(id) {
        return this.tasksService.findOne(id);
    }
    async getAllTasks(query) {
        return { message: 'Endpoint en desarrollo' };
    }
    async getSystemStatistics() {
        return this.tasksService.getSystemStatistics();
    }
    async getAdvancedTeacherStatistics(req) {
        console.log(`[DEBUG] Advanced stats - req.user:`, req.user ? `${req.user.id} (${req.user.email})` : 'null');
        if (!req.user) {
            throw new common_1.BadRequestException('Usuario no autenticado correctamente');
        }
        const userId = req.user.sub || req.user.id;
        if (!userId) {
            throw new common_1.BadRequestException('ID de usuario no disponible');
        }
        return this.tasksService.getAdvancedTeacherStatistics(userId);
    }
    async getTaskSubmissionAnalytics(id, req) {
        return this.tasksService.getTaskSubmissionAnalytics(id, req.user.sub);
    }
    async getPendingGrading(req) {
        return this.tasksService.getPendingGrading(req.user.sub);
    }
    async getTestPendingGrading() {
        return this.tasksService.getTestPendingGrading();
    }
    async getTestSubmission(submissionId) {
        return this.tasksService.getTestSubmission(submissionId);
    }
    async getOverdueTasks(req) {
        return this.tasksService.getOverdueTasks(req.user.sub);
    }
    async sendBulkReminders(body, req) {
        return this.tasksService.sendBulkReminders(body.taskIds, req.user.sub, body.message);
    }
    async getUpcomingDeadlines(req) {
        return this.tasksService.getUpcomingDeadlines(req.user.sub);
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nueva tarea' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Tarea creada exitosamente', type: entities_1.Task }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Sin permisos para esta asignatura' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateTaskDto, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('teacher/my-tasks'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener tareas del profesor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de tareas del profesor' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TaskQueryDto, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findMyTasks", null);
__decorate([
    (0, common_1.Get)('teacher/statistics'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estadísticas del profesor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estadísticas del profesor', type: dto_1.TaskStatisticsDto }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getTeacherStatistics", null);
__decorate([
    (0, common_1.Post)(':id/attachments'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, multerConfig)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Subir archivos adjuntos a una tarea' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "uploadTaskAttachments", null);
__decorate([
    (0, common_1.Get)('attachments/:attachmentId/download'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.STUDENT, user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Descargar archivo adjunto de tarea' }),
    __param(0, (0, common_1.Param)('attachmentId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "downloadTaskAttachment", null);
__decorate([
    (0, common_1.Get)('submissions/attachments/:attachmentId/download'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.STUDENT, user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Descargar archivo adjunto de entrega' }),
    __param(0, (0, common_1.Param)('attachmentId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "downloadSubmissionAttachment", null);
__decorate([
    (0, common_1.Delete)('attachments/:attachmentId'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar archivo adjunto de tarea' }),
    __param(0, (0, common_1.Param)('attachmentId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "deleteTaskAttachment", null);
__decorate([
    (0, common_1.Delete)('submissions/attachments/:attachmentId'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar archivo adjunto de entrega' }),
    __param(0, (0, common_1.Param)('attachmentId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "deleteSubmissionAttachment", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar tarea' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tarea actualizada exitosamente', type: entities_1.Task }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Sin permisos para editar esta tarea' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tarea no encontrada' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateTaskDto, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar tarea' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tarea eliminada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Sin permisos para eliminar esta tarea' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tarea no encontrada' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('submissions/:submissionId'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.STUDENT, user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener detalles de una entrega específica' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Detalles de la entrega', type: entities_1.TaskSubmission }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Entrega no encontrada' }),
    __param(0, (0, common_1.Param)('submissionId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getSubmission", null);
__decorate([
    (0, common_1.Post)('submissions/:submissionId/grade'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Calificar entrega de estudiante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Entrega calificada exitosamente', type: entities_1.TaskSubmission }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Sin permisos para calificar esta entrega' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Entrega no encontrada' }),
    __param(0, (0, common_1.Param)('submissionId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.GradeTaskDto, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "gradeSubmission", null);
__decorate([
    (0, common_1.Get)('student/my-tasks'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener tareas asignadas al estudiante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de tareas del estudiante' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.StudentTaskQueryDto, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getMyTasks", null);
__decorate([
    (0, common_1.Get)('student/statistics'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estadísticas del estudiante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estadísticas del estudiante', type: dto_1.StudentTaskStatisticsDto }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getStudentStatistics", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Entregar tarea' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tarea entregada exitosamente', type: entities_1.TaskSubmission }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Error en la entrega' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tarea no encontrada o no asignada' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.SubmitTaskDto, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "submitTask", null);
__decorate([
    (0, common_1.Post)('submissions/:submissionId/attachments'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.STUDENT),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 5, {
        ...multerConfig,
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadPath = (0, path_1.join)(process.cwd(), 'uploads', 'submissions');
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const fileExtension = (0, path_1.extname)(file.originalname);
                cb(null, `submission-${uniqueSuffix}${fileExtension}`);
            },
        }),
    })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Subir archivos a una entrega' }),
    __param(0, (0, common_1.Param)('submissionId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "uploadSubmissionAttachments", null);
__decorate([
    (0, common_1.Get)('family/tasks'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener tareas de los hijos' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de tareas de los hijos' }),
    (0, swagger_1.ApiQuery)({ name: 'studentId', required: false, description: 'ID del estudiante específico' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.FamilyTaskQueryDto, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getFamilyTasks", null);
__decorate([
    (0, common_1.Get)('family/student/:studentId/statistics'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estadísticas de un hijo específico' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estadísticas del estudiante', type: dto_1.StudentTaskStatisticsDto }),
    __param(0, (0, common_1.Param)('studentId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getFamilyStudentStatistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.STUDENT, user_entity_1.UserRole.FAMILY),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener tarea por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Detalle de la tarea', type: entities_1.Task }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tarea no encontrada' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('admin/all-tasks'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todas las tareas (solo admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista completa de tareas' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TaskQueryDto]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getAllTasks", null);
__decorate([
    (0, common_1.Get)('admin/statistics'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estadísticas generales del sistema (solo admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estadísticas generales del sistema' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getSystemStatistics", null);
__decorate([
    (0, common_1.Get)('teacher/advanced-statistics'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estadísticas avanzadas del profesor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estadísticas avanzadas con seguimiento detallado' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getAdvancedTeacherStatistics", null);
__decorate([
    (0, common_1.Get)('teacher/:id/submissions/analytics'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener analytics de entregas de una tarea específica' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Analytics detallados de la tarea' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getTaskSubmissionAnalytics", null);
__decorate([
    (0, common_1.Get)('teacher/pending-grading'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener tareas pendientes de calificar' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de entregas pendientes de calificar' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getPendingGrading", null);
__decorate([
    (0, common_1.Get)('test/pending-grading'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'TEST: Obtener tareas pendientes de calificar sin auth' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getTestPendingGrading", null);
__decorate([
    (0, common_1.Get)('test/submission/:submissionId'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'TEST: Obtener submission sin auth' }),
    __param(0, (0, common_1.Param)('submissionId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getTestSubmission", null);
__decorate([
    (0, common_1.Get)('teacher/overdue-tasks'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener tareas vencidas sin entregar' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de tareas vencidas' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getOverdueTasks", null);
__decorate([
    (0, common_1.Post)('teacher/bulk-reminder'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar recordatorios masivos para tareas' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recordatorios enviados' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "sendBulkReminders", null);
__decorate([
    (0, common_1.Get)('teacher/upcoming-deadlines'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener fechas límite próximas del profesor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de fechas límite próximas' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getUpcomingDeadlines", null);
exports.TasksController = TasksController = __decorate([
    (0, swagger_1.ApiTags)('tasks'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('tasks'),
    __metadata("design:paramtypes", [tasks_service_1.TasksService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map