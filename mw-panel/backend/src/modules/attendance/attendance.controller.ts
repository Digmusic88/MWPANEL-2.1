import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import {
  CreateAttendanceRecordDto,
  UpdateAttendanceRecordDto,
  CreateAttendanceRequestDto,
  ReviewAttendanceRequestDto,
  BulkMarkPresentDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AttendanceRequestStatus } from './entities/attendance-request.entity';

@ApiTags('attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // ==================== ATTENDANCE RECORDS ====================

  @Post('records')
  @ApiOperation({ summary: 'Crear registro de asistencia' })
  @ApiResponse({ status: 201, description: 'Registro creado exitosamente' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async createRecord(@Request() req: any, @Body() createDto: CreateAttendanceRecordDto) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    return this.attendanceService.createAttendanceRecord(createDto, userId);
  }

  @Patch('records/:id')
  @ApiOperation({ summary: 'Actualizar registro de asistencia' })
  @ApiResponse({ status: 200, description: 'Registro actualizado exitosamente' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async updateRecord(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateDto: UpdateAttendanceRecordDto,
  ) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    return this.attendanceService.updateAttendanceRecord(id, updateDto, userId);
  }

  @Get('records/group/:classGroupId')
  @ApiOperation({ summary: 'Obtener asistencia por grupo y fecha' })
  @ApiResponse({ status: 200, description: 'Lista de registros de asistencia' })
  @ApiQuery({ name: 'date', required: true, description: 'Fecha (YYYY-MM-DD)' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async getByGroup(
    @Param('classGroupId') classGroupId: string,
    @Query('date') date: string,
  ) {
    return this.attendanceService.getAttendanceByGroup(classGroupId, date);
  }

  @Get('records/student/:studentId')
  @ApiOperation({ summary: 'Obtener historial de asistencia de un estudiante' })
  @ApiResponse({ status: 200, description: 'Historial de asistencia' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY, UserRole.STUDENT)
  async getByStudent(
    @Param('studentId') studentId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.getAttendanceByStudent(studentId, startDate, endDate);
  }

  @Post('records/bulk-present')
  @ApiOperation({ summary: 'Marcar presentes en masa (solo estudiantes sin registro)' })
  @ApiResponse({ status: 201, description: 'Registros creados exitosamente' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  async bulkMarkPresent(@Request() req: any, @Body() bulkDto: BulkMarkPresentDto) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    return this.attendanceService.bulkMarkPresent(bulkDto, userId);
  }

  // ==================== ATTENDANCE REQUESTS ====================

  @Post('requests')
  @ApiOperation({ summary: 'Crear solicitud de justificación' })
  @ApiResponse({ status: 201, description: 'Solicitud creada exitosamente' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY)
  async createRequest(@Request() req: any, @Body() createDto: CreateAttendanceRequestDto) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    return this.attendanceService.createAttendanceRequest(createDto, userId);
  }

  @Patch('requests/:id/review')
  @ApiOperation({ summary: 'Revisar solicitud de justificación' })
  @ApiResponse({ status: 200, description: 'Solicitud revisada exitosamente' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async reviewRequest(
    @Param('id') id: string,
    @Request() req: any,
    @Body() reviewDto: ReviewAttendanceRequestDto,
  ) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    return this.attendanceService.reviewAttendanceRequest(id, reviewDto, userId);
  }

  @Get('requests/student/:studentId')
  @ApiOperation({ summary: 'Obtener solicitudes de un estudiante' })
  @ApiResponse({ status: 200, description: 'Lista de solicitudes' })
  @ApiQuery({ name: 'status', required: false, enum: AttendanceRequestStatus })
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY, UserRole.STUDENT)
  async getRequestsByStudent(
    @Param('studentId') studentId: string,
    @Query('status') status?: AttendanceRequestStatus,
  ) {
    return this.attendanceService.getRequestsByStudent(studentId, status);
  }

  @Get('requests/group/:classGroupId/pending')
  @ApiOperation({ summary: 'Obtener solicitudes pendientes de un grupo' })
  @ApiResponse({ status: 200, description: 'Lista de solicitudes pendientes' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async getPendingRequestsByGroup(@Param('classGroupId') classGroupId: string) {
    return this.attendanceService.getPendingRequestsByGroup(classGroupId);
  }

  @Get('requests/my-requests')
  @ApiOperation({ summary: 'Obtener mis solicitudes realizadas' })
  @ApiResponse({ status: 200, description: 'Lista de solicitudes del usuario' })
  @Roles(UserRole.FAMILY)
  async getMyRequests(@Request() req: any) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    return this.attendanceService.getRequestsByUser(userId);
  }

  // ==================== STATISTICS ====================

  @Get('stats/group/:classGroupId')
  @ApiOperation({ summary: 'Obtener estadísticas de asistencia del grupo' })
  @ApiResponse({ status: 200, description: 'Estadísticas de asistencia' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async getGroupStats(
    @Param('classGroupId') classGroupId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.attendanceService.getAttendanceStats(classGroupId, startDate, endDate);
  }
}