import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  NotFoundException,
  Res,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { createReadStream } from 'fs';
import { Response } from 'express';
import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  SubmitTaskDto,
  GradeTaskDto,
  TaskQueryDto,
  StudentTaskQueryDto,
  FamilyTaskQueryDto,
  TaskStatisticsDto,
  StudentTaskStatisticsDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Task, TaskSubmission } from './entities';

// Configuración de multer para archivos
const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = join(process.cwd(), 'uploads', 'tasks');
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExtension = extname(file.originalname);
      cb(null, `task-${uniqueSuffix}${fileExtension}`);
    },
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB máximo
    files: 10, // Máximo 10 archivos
  },
  fileFilter: (req, file, cb) => {
    // Tipos de archivo permitidos
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
    } else {
      cb(new BadRequestException(`Tipo de archivo no permitido: ${file.mimetype}`), false);
    }
  },
};

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // ==================== ENDPOINTS PARA PROFESORES ====================

  @Post()
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Crear nueva tarea' })
  @ApiResponse({ status: 201, description: 'Tarea creada exitosamente', type: Task })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'Sin permisos para esta asignatura' })
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req): Promise<Task> {
    return this.tasksService.create(createTaskDto, req.user.sub);
  }

  @Get('teacher/my-tasks')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Obtener tareas del profesor' })
  @ApiResponse({ status: 200, description: 'Lista de tareas del profesor' })
  async findMyTasks(@Query() query: TaskQueryDto, @Request() req) {
    return this.tasksService.findAllByTeacher(req.user.sub, query);
  }

  @Get('teacher/statistics')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Obtener estadísticas del profesor' })
  @ApiResponse({ status: 200, description: 'Estadísticas del profesor', type: TaskStatisticsDto })
  async getTeacherStatistics(@Request() req): Promise<TaskStatisticsDto> {
    return this.tasksService.getTeacherStatistics(req.user.sub);
  }

  @Post(':id/attachments')
  @Roles(UserRole.TEACHER)
  @UseInterceptors(FilesInterceptor('files', 10, multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir archivos adjuntos a una tarea' })
  async uploadTaskAttachments(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    await this.tasksService.uploadTaskAttachments(id, files, req.user.sub);
    return { message: 'Archivos subidos exitosamente', files: files.map(f => f.filename) };
  }

  @Get('attachments/:attachmentId/download')
  @Roles(UserRole.TEACHER, UserRole.STUDENT, UserRole.FAMILY)
  @ApiOperation({ summary: 'Descargar archivo adjunto de tarea' })
  async downloadTaskAttachment(
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { filePath, originalName } = await this.tasksService.downloadAttachment(attachmentId, 'task');
    
    const file = createReadStream(filePath);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${originalName}"`,
    });
    
    return new StreamableFile(file);
  }

  @Get('submissions/attachments/:attachmentId/download')
  @Roles(UserRole.TEACHER, UserRole.STUDENT, UserRole.FAMILY)
  @ApiOperation({ summary: 'Descargar archivo adjunto de entrega' })
  async downloadSubmissionAttachment(
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { filePath, originalName } = await this.tasksService.downloadAttachment(attachmentId, 'submission');
    
    const file = createReadStream(filePath);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${originalName}"`,
    });
    
    return new StreamableFile(file);
  }

  @Delete('attachments/:attachmentId')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Eliminar archivo adjunto de tarea' })
  async deleteTaskAttachment(
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
    @Request() req,
  ): Promise<void> {
    return this.tasksService.deleteTaskAttachment(attachmentId, req.user.sub);
  }

  @Delete('submissions/attachments/:attachmentId')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Eliminar archivo adjunto de entrega' })
  async deleteSubmissionAttachment(
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
    @Request() req,
  ): Promise<void> {
    return this.tasksService.deleteSubmissionAttachment(attachmentId, req.user.sub);
  }

  @Patch(':id')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Actualizar tarea' })
  @ApiResponse({ status: 200, description: 'Tarea actualizada exitosamente', type: Task })
  @ApiResponse({ status: 403, description: 'Sin permisos para editar esta tarea' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req,
  ): Promise<Task> {
    return this.tasksService.update(id, updateTaskDto, req.user.sub);
  }

  @Delete(':id')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Eliminar tarea' })
  @ApiResponse({ status: 200, description: 'Tarea eliminada exitosamente' })
  @ApiResponse({ status: 403, description: 'Sin permisos para eliminar esta tarea' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req): Promise<void> {
    return this.tasksService.remove(id, req.user.sub);
  }

  @Get('submissions/:submissionId')
  @Roles(UserRole.TEACHER, UserRole.STUDENT, UserRole.FAMILY)
  @ApiOperation({ summary: 'Obtener detalles de una entrega específica' })
  @ApiResponse({ status: 200, description: 'Detalles de la entrega', type: TaskSubmission })
  @ApiResponse({ status: 404, description: 'Entrega no encontrada' })
  async getSubmission(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Request() req,
  ): Promise<TaskSubmission> {
    return this.tasksService.getSubmission(submissionId, req.user.sub);
  }

  @Post('submissions/:submissionId/grade')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Calificar entrega de estudiante' })
  @ApiResponse({ status: 200, description: 'Entrega calificada exitosamente', type: TaskSubmission })
  @ApiResponse({ status: 403, description: 'Sin permisos para calificar esta entrega' })
  @ApiResponse({ status: 404, description: 'Entrega no encontrada' })
  async gradeSubmission(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body() gradeDto: GradeTaskDto,
    @Request() req,
  ): Promise<TaskSubmission> {
    return this.tasksService.gradeSubmission(submissionId, gradeDto, req.user.sub);
  }

  // ==================== ENDPOINTS PARA ESTUDIANTES ====================

  @Get('student/my-tasks')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Obtener tareas asignadas al estudiante' })
  @ApiResponse({ status: 200, description: 'Lista de tareas del estudiante' })
  async getMyTasks(@Query() query: StudentTaskQueryDto, @Request() req) {
    return this.tasksService.getStudentTasks(req.user.sub, query);
  }

  @Get('student/statistics')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Obtener estadísticas del estudiante' })
  @ApiResponse({ status: 200, description: 'Estadísticas del estudiante', type: StudentTaskStatisticsDto })
  async getStudentStatistics(@Request() req): Promise<StudentTaskStatisticsDto> {
    return this.tasksService.getStudentStatistics(req.user.sub);
  }

  @Post(':id/submit')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Entregar tarea' })
  @ApiResponse({ status: 200, description: 'Tarea entregada exitosamente', type: TaskSubmission })
  @ApiResponse({ status: 400, description: 'Error en la entrega' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada o no asignada' })
  async submitTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() submitDto: SubmitTaskDto,
    @Request() req,
  ): Promise<TaskSubmission> {
    console.log(`[DEBUG] Controller - Full req.user object:`, JSON.stringify(req.user, null, 2));
    console.log(`[DEBUG] Controller - req.user.sub:`, req.user?.sub);
    console.log(`[DEBUG] Controller - req.user.id:`, req.user?.id);
    
    // SECURITY FIX: Validate user object exists
    if (!req.user) {
      throw new BadRequestException('Usuario no autenticado correctamente');
    }
    
    // Use user.id instead of user.sub if sub is undefined
    const userId = req.user.sub || req.user.id;
    
    if (!userId) {
      throw new BadRequestException('ID de usuario no disponible');
    }
    
    console.log(`[DEBUG] Controller - Using userId:`, userId);
    return this.tasksService.submitTask(id, submitDto, userId);
  }


  @Post('submissions/:submissionId/attachments')
  @Roles(UserRole.STUDENT)
  @UseInterceptors(FilesInterceptor('files', 5, {
    ...multerConfig,
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = join(process.cwd(), 'uploads', 'submissions');
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = extname(file.originalname);
        cb(null, `submission-${uniqueSuffix}${fileExtension}`);
      },
    }),
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir archivos a una entrega' })
  async uploadSubmissionAttachments(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    await this.tasksService.uploadSubmissionAttachments(submissionId, files, req.user.sub);
    return { message: 'Archivos subidos exitosamente', files: files.map(f => f.filename) };
  }

  // ==================== ENDPOINTS PARA FAMILIAS ====================

  @Get('family/tasks')
  @Roles(UserRole.FAMILY)
  @ApiOperation({ summary: 'Obtener tareas de los hijos' })
  @ApiResponse({ status: 200, description: 'Lista de tareas de los hijos' })
  @ApiQuery({ name: 'studentId', required: false, description: 'ID del estudiante específico' })
  async getFamilyTasks(@Query() query: FamilyTaskQueryDto, @Request() req) {
    return this.tasksService.getFamilyTasks(req.user.sub, query);
  }

  @Get('family/student/:studentId/statistics')
  @Roles(UserRole.FAMILY)
  @ApiOperation({ summary: 'Obtener estadísticas de un hijo específico' })
  @ApiResponse({ status: 200, description: 'Estadísticas del estudiante', type: StudentTaskStatisticsDto })
  async getFamilyStudentStatistics(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Request() req,
  ): Promise<StudentTaskStatisticsDto> {
    // TODO: Verificar que el estudiante pertenece a la familia
    return this.tasksService.getStudentStatistics(studentId);
  }

  // ==================== ENDPOINTS COMUNES ====================

  @Get(':id')
  @Roles(UserRole.TEACHER, UserRole.STUDENT, UserRole.FAMILY)
  @ApiOperation({ summary: 'Obtener tarea por ID' })
  @ApiResponse({ status: 200, description: 'Detalle de la tarea', type: Task })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Task> {
    return this.tasksService.findOne(id);
  }

  // ==================== ENDPOINTS PARA ADMINISTRADORES ====================

  @Get('admin/all-tasks')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener todas las tareas (solo admin)' })
  @ApiResponse({ status: 200, description: 'Lista completa de tareas' })
  async getAllTasks(@Query() query: TaskQueryDto) {
    // TODO: Implementar consulta general para administradores
    return { message: 'Endpoint en desarrollo' };
  }

  @Get('admin/statistics')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener estadísticas generales del sistema (solo admin)' })
  @ApiResponse({ status: 200, description: 'Estadísticas generales del sistema' })
  async getSystemStatistics() {
    return this.tasksService.getSystemStatistics();
  }

  @Get('teacher/advanced-statistics')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Obtener estadísticas avanzadas del profesor' })
  @ApiResponse({ status: 200, description: 'Estadísticas avanzadas con seguimiento detallado' })
  async getAdvancedTeacherStatistics(@Request() req) {
    console.log(`[DEBUG] Advanced stats - req.user:`, req.user ? `${req.user.id} (${req.user.email})` : 'null');
    
    // SECURITY FIX: Validate user object exists
    if (!req.user) {
      throw new BadRequestException('Usuario no autenticado correctamente');
    }
    
    // Use user.id instead of user.sub if sub is undefined
    const userId = req.user.sub || req.user.id;
    
    if (!userId) {
      throw new BadRequestException('ID de usuario no disponible');
    }
    
    return this.tasksService.getAdvancedTeacherStatistics(userId);
  }

  @Get('teacher/:id/submissions/analytics')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Obtener analytics de entregas de una tarea específica' })
  @ApiResponse({ status: 200, description: 'Analytics detallados de la tarea' })
  async getTaskSubmissionAnalytics(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    return this.tasksService.getTaskSubmissionAnalytics(id, req.user.sub);
  }

  @Get('teacher/pending-grading')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Obtener tareas pendientes de calificar' })
  @ApiResponse({ status: 200, description: 'Lista de entregas pendientes de calificar' })
  async getPendingGrading(@Request() req) {
    return this.tasksService.getPendingGrading(req.user.sub);
  }

  // ENDPOINT TEMPORAL PARA TESTING SIN AUTH  
  @Get('test/pending-grading')
  @Public()
  @ApiOperation({ summary: 'TEST: Obtener tareas pendientes de calificar sin auth' })
  async getTestPendingGrading() {
    // Usar teacherId conocido directamente (profesor@mwpanel.com)
    return this.tasksService.getTestPendingGrading();
  }

  @Get('test/submission/:submissionId')
  @Public()
  @ApiOperation({ summary: 'TEST: Obtener submission sin auth' })
  async getTestSubmission(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
  ) {
    return this.tasksService.getTestSubmission(submissionId);
  }

  @Get('teacher/overdue-tasks')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Obtener tareas vencidas sin entregar' })
  @ApiResponse({ status: 200, description: 'Lista de tareas vencidas' })
  async getOverdueTasks(@Request() req) {
    return this.tasksService.getOverdueTasks(req.user.sub);
  }

  @Post('teacher/bulk-reminder')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Enviar recordatorios masivos para tareas' })
  @ApiResponse({ status: 200, description: 'Recordatorios enviados' })
  async sendBulkReminders(
    @Body() body: { taskIds: string[], message?: string },
    @Request() req,
  ) {
    return this.tasksService.sendBulkReminders(body.taskIds, req.user.sub, body.message);
  }

  @Get('teacher/upcoming-deadlines')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Obtener fechas límite próximas del profesor' })
  @ApiResponse({ status: 200, description: 'Lista de fechas límite próximas' })
  async getUpcomingDeadlines(@Request() req) {
    return this.tasksService.getUpcomingDeadlines(req.user.sub);
  }
}