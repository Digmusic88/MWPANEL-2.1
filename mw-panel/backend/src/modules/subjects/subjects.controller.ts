import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { CreateSubjectAssignmentDto } from './dto/create-subject-assignment.dto';
import { UpdateSubjectAssignmentDto } from './dto/update-subject-assignment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('subjects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  // ==================== SUBJECTS ====================

  @Get()
  @ApiOperation({ summary: 'Obtener todas las asignaturas' })
  @ApiResponse({ status: 200, description: 'Lista de asignaturas obtenida exitosamente' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findAllSubjects() {
    return this.subjectsService.findAllSubjects();
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva asignatura' })
  @ApiResponse({ status: 201, description: 'Asignatura creada exitosamente' })
  @Roles(UserRole.ADMIN)
  createSubject(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.createSubject(createSubjectDto);
  }

  @Get('by-course/:courseId')
  @ApiOperation({ summary: 'Obtener asignaturas por curso' })
  @ApiResponse({ status: 200, description: 'Asignaturas del curso obtenidas exitosamente' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findSubjectsByCourse(@Param('courseId') courseId: string) {
    return this.subjectsService.findSubjectsByCourse(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener asignatura por ID' })
  @ApiResponse({ status: 200, description: 'Asignatura obtenida exitosamente' })
  @ApiResponse({ status: 404, description: 'Asignatura no encontrada' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findOneSubject(@Param('id') id: string) {
    return this.subjectsService.findOneSubject(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar asignatura' })
  @ApiResponse({ status: 200, description: 'Asignatura actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Asignatura no encontrada' })
  @Roles(UserRole.ADMIN)
  updateSubject(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto) {
    return this.subjectsService.updateSubject(id, updateSubjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar asignatura' })
  @ApiResponse({ status: 200, description: 'Asignatura eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Asignatura no encontrada' })
  @Roles(UserRole.ADMIN)
  removeSubject(@Param('id') id: string) {
    return this.subjectsService.removeSubject(id);
  }

  // ==================== SUBJECT ASSIGNMENTS ====================

  @Get('assignments/all')
  @ApiOperation({ summary: 'Obtener todas las asignaciones de asignaturas' })
  @ApiResponse({ status: 200, description: 'Lista de asignaciones obtenida exitosamente' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findAllAssignments() {
    return this.subjectsService.findAllAssignments();
  }

  @Post('assignments')
  @ApiOperation({ summary: 'Crear nueva asignación de asignatura' })
  @ApiResponse({ status: 201, description: 'Asignación creada exitosamente' })
  @Roles(UserRole.ADMIN)
  createAssignment(@Body() createAssignmentDto: CreateSubjectAssignmentDto) {
    return this.subjectsService.createAssignment(createAssignmentDto);
  }

  @Get('assignments/teacher/:teacherId')
  @ApiOperation({ summary: 'Obtener asignaciones por profesor' })
  @ApiResponse({ status: 200, description: 'Asignaciones del profesor obtenidas exitosamente' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findAssignmentsByTeacher(@Param('teacherId') teacherId: string) {
    return this.subjectsService.findAssignmentsByTeacher(teacherId);
  }

  @Get('assignments/class-group/:classGroupId')
  @ApiOperation({ summary: 'Obtener asignaciones por grupo de clase' })
  @ApiResponse({ status: 200, description: 'Asignaciones del grupo obtenidas exitosamente' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findAssignmentsByClassGroup(@Param('classGroupId') classGroupId: string) {
    return this.subjectsService.findAssignmentsByClassGroup(classGroupId);
  }

  @Get('assignments/academic-year/:academicYearId')
  @ApiOperation({ summary: 'Obtener asignaciones por año académico' })
  @ApiResponse({ status: 200, description: 'Asignaciones del año académico obtenidas exitosamente' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findAssignmentsByAcademicYear(@Param('academicYearId') academicYearId: string) {
    return this.subjectsService.findAssignmentsByAcademicYear(academicYearId);
  }

  @Get('assignments/:id')
  @ApiOperation({ summary: 'Obtener asignación por ID' })
  @ApiResponse({ status: 200, description: 'Asignación obtenida exitosamente' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findOneAssignment(@Param('id') id: string) {
    return this.subjectsService.findOneAssignment(id);
  }

  @Patch('assignments/:id')
  @ApiOperation({ summary: 'Actualizar asignación de asignatura' })
  @ApiResponse({ status: 200, description: 'Asignación actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  @Roles(UserRole.ADMIN)
  updateAssignment(@Param('id') id: string, @Body() updateAssignmentDto: UpdateSubjectAssignmentDto) {
    return this.subjectsService.updateAssignment(id, updateAssignmentDto);
  }

  @Delete('assignments/:id')
  @ApiOperation({ summary: 'Eliminar asignación de asignatura' })
  @ApiResponse({ status: 200, description: 'Asignación eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  @Roles(UserRole.ADMIN)
  removeAssignment(@Param('id') id: string) {
    return this.subjectsService.removeAssignment(id);
  }

  // === ENDPOINTS FOR EVALUATIONS INTEGRATION ===

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Obtener asignaturas de un estudiante' })
  @ApiResponse({ status: 200, description: 'Asignaturas del estudiante obtenidas exitosamente' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY)
  findSubjectsByStudent(@Param('studentId') studentId: string) {
    return this.subjectsService.findSubjectsByStudent(studentId);
  }

  @Get('teacher/:teacherId')
  @ApiOperation({ summary: 'Obtener asignaturas que imparte un profesor' })
  @ApiResponse({ status: 200, description: 'Asignaturas del profesor obtenidas exitosamente' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findSubjectsByTeacher(@Param('teacherId') teacherId: string) {
    return this.subjectsService.findSubjectsByTeacher(teacherId);
  }

  @Get('teacher/:teacherId/group/:groupId')
  @ApiOperation({ summary: 'Obtener asignaturas que un profesor imparte a un grupo específico' })
  @ApiResponse({ status: 200, description: 'Asignaturas obtenidas exitosamente' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findSubjectsByTeacherAndGroup(
    @Param('teacherId') teacherId: string,
    @Param('groupId') groupId: string
  ) {
    return this.subjectsService.findSubjectsByTeacherAndGroup(teacherId, groupId);
  }

  @Get('assignment-details')
  @ApiOperation({ summary: 'Obtener detalles de asignación específica' })
  @ApiResponse({ status: 200, description: 'Detalles de asignación obtenidos exitosamente' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findAssignmentDetails(
    @Query('teacherId') teacherId: string,
    @Query('subjectId') subjectId: string,
    @Query('classGroupId') classGroupId: string
  ) {
    return this.subjectsService.findAssignmentDetails(teacherId, subjectId, classGroupId);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Obtener estadísticas del sistema de asignaturas' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  @Roles(UserRole.ADMIN)
  getSubjectStatistics() {
    return this.subjectsService.getSubjectStatistics();
  }

  @Get('can-evaluate')
  @ApiOperation({ summary: 'Verificar si un profesor puede evaluar una asignatura para un estudiante' })
  @ApiResponse({ status: 200, description: 'Verificación completada' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  canTeacherEvaluateSubject(
    @Query('teacherId') teacherId: string,
    @Query('subjectId') subjectId: string,
    @Query('studentId') studentId: string
  ) {
    return this.subjectsService.canTeacherEvaluateSubject(teacherId, subjectId, studentId);
  }
}