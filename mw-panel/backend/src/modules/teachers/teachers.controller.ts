import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  HttpCode,
  HttpStatus,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Profesores')
@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo profesor' })
  @ApiResponse({ status: 201, description: 'Profesor creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Email o número de empleado ya existe' })
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teachersService.create(createTeacherDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Obtener todos los profesores' })
  @ApiResponse({ status: 200, description: 'Lista de profesores' })
  findAll() {
    return this.teachersService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Obtener un profesor por ID' })
  @ApiResponse({ status: 200, description: 'Datos del profesor' })
  @ApiResponse({ status: 404, description: 'Profesor no encontrado' })
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un profesor' })
  @ApiResponse({ status: 200, description: 'Profesor actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Profesor no encontrado' })
  @ApiResponse({ status: 409, description: 'Email o número de empleado ya existe' })
  update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.teachersService.update(id, updateTeacherDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un profesor (soft delete)' })
  @ApiResponse({ status: 204, description: 'Profesor eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Profesor no encontrado' })
  remove(@Param('id') id: string) {
    return this.teachersService.remove(id);
  }

  @Get('dashboard/my-dashboard')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Obtener datos del dashboard del profesor actual' })
  @ApiResponse({ status: 200, description: 'Datos del dashboard del profesor' })
  @ApiResponse({ status: 404, description: 'Profesor no encontrado' })
  getMyDashboard(@Request() req: any) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    return this.teachersService.getTeacherDashboard(userId);
  }
}