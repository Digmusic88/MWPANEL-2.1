import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  ValidationPipe,
  SetMetadata
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EvaluationsService, CreateEvaluationDto, UpdateEvaluationDto } from './evaluations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@ApiTags('Evaluaciones')
@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Obtener todas las evaluaciones' })
  @ApiResponse({ status: 200, description: 'Lista de evaluaciones obtenida exitosamente' })
  findAll() {
    return this.evaluationsService.findAll();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener estadísticas de evaluaciones' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  getStats() {
    return this.evaluationsService.getEvaluationStats();
  }

  @Get('student/:studentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY)
  @ApiOperation({ summary: 'Obtener evaluaciones de un estudiante' })
  @ApiResponse({ status: 200, description: 'Evaluaciones del estudiante obtenidas exitosamente' })
  findByStudent(@Param('studentId') studentId: string) {
    return this.evaluationsService.findByStudent(studentId);
  }

  @Get('teacher/:teacherId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Obtener evaluaciones de un profesor' })
  @ApiResponse({ status: 200, description: 'Evaluaciones del profesor obtenidas exitosamente' })
  findByTeacher(@Param('teacherId') teacherId: string) {
    return this.evaluationsService.findByTeacher(teacherId);
  }

  @Get('radar/:studentId/:periodId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY)
  @ApiOperation({ summary: 'Obtener diana competencial de un estudiante' })
  @ApiResponse({ status: 200, description: 'Diana competencial obtenida exitosamente' })
  getRadarChart(@Param('studentId') studentId: string, @Param('periodId') periodId: string) {
    return this.evaluationsService.getRadarChart(studentId, periodId);
  }

  @Post('radar/:studentId/:periodId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Generar diana competencial de un estudiante' })
  @ApiResponse({ status: 201, description: 'Diana competencial generada exitosamente' })
  generateRadarChart(@Param('studentId') studentId: string, @Param('periodId') periodId: string) {
    return this.evaluationsService.generateRadarChart(studentId, periodId);
  }

  @Get('periods')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY)
  @ApiOperation({ summary: 'Obtener todos los períodos de evaluación' })
  @ApiResponse({ status: 200, description: 'Períodos obtenidos exitosamente' })
  getAllPeriods() {
    return this.evaluationsService.getAllPeriods();
  }

  @Get('periods/active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY)
  @ApiOperation({ summary: 'Obtener período de evaluación activo' })
  @ApiResponse({ status: 200, description: 'Período activo obtenido exitosamente' })
  getActivePeriod() {
    return this.evaluationsService.getActivePeriod();
  }

  @Post('periods/initialize')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Inicializar períodos de evaluación para el año académico' })
  @ApiResponse({ status: 201, description: 'Períodos creados exitosamente' })
  createEvaluationPeriods() {
    return this.evaluationsService.createEvaluationPeriods();
  }

  @Post('setup/test-data')
  @Public()
  @ApiOperation({ summary: 'Crear datos de prueba para evaluaciones' })
  @ApiResponse({ status: 201, description: 'Datos de prueba creados exitosamente' })
  async createTestData() {
    return this.evaluationsService.createTestData();
  }

  @Post('init/periods')
  @Public()
  @ApiOperation({ summary: 'Inicializar períodos (sin auth)' })
  @ApiResponse({ status: 201, description: 'Períodos creados exitosamente' })
  async initPeriods() {
    return this.evaluationsService.createEvaluationPeriods();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY)
  @ApiOperation({ summary: 'Obtener una evaluación específica' })
  @ApiResponse({ status: 200, description: 'Evaluación obtenida exitosamente' })
  findOne(@Param('id') id: string) {
    return this.evaluationsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Crear una nueva evaluación' })
  @ApiResponse({ status: 201, description: 'Evaluación creada exitosamente' })
  create(@Body(ValidationPipe) createEvaluationDto: CreateEvaluationDto) {
    return this.evaluationsService.create(createEvaluationDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Actualizar una evaluación' })
  @ApiResponse({ status: 200, description: 'Evaluación actualizada exitosamente' })
  update(@Param('id') id: string, @Body(ValidationPipe) updateEvaluationDto: UpdateEvaluationDto) {
    return this.evaluationsService.update(id, updateEvaluationDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar una evaluación' })
  @ApiResponse({ status: 200, description: 'Evaluación eliminada exitosamente' })
  remove(@Param('id') id: string) {
    return this.evaluationsService.remove(id);
  }
}