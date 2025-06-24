import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Estudiantes')
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los estudiantes' })
  @ApiResponse({ status: 200, description: 'Lista de estudiantes' })
  findAll() {
    return this.studentsService.findAll();
  }

  @Get('me')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Obtener mi perfil de estudiante' })
  @ApiResponse({ status: 200, description: 'Datos del estudiante actual' })
  getMyProfile(@Request() req: any) {
    return this.studentsService.findByUserId(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener estudiante por ID' })
  @ApiResponse({ status: 200, description: 'Datos del estudiante' })
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear nuevo estudiante' })
  @ApiResponse({ status: 201, description: 'Estudiante creado exitosamente' })
  create(@Body() createStudentDto: any) {
    return this.studentsService.create(createStudentDto);
  }

  @Patch('me/password')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Cambiar mi contraseña' })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada exitosamente' })
  changeMyPassword(@Request() req: any, @Body() changePasswordDto: any) {
    return this.studentsService.changePassword(req.user.id, changePasswordDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Actualizar estudiante' })
  @ApiResponse({ status: 200, description: 'Estudiante actualizado exitosamente' })
  update(@Param('id') id: string, @Body() updateStudentDto: any) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar estudiante' })
  @ApiResponse({ status: 200, description: 'Estudiante eliminado exitosamente' })
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}