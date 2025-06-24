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
import { FamiliesService } from './families.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Familias')
@Controller('families')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear una nueva familia' })
  @ApiResponse({ status: 201, description: 'Familia creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Email ya existe' })
  create(@Body() createFamilyDto: CreateFamilyDto) {
    return this.familiesService.create(createFamilyDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Obtener todas las familias' })
  @ApiResponse({ status: 200, description: 'Lista de familias' })
  findAll() {
    return this.familiesService.findAll();
  }

  @Get('available-students')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener estudiantes disponibles para asignar a familias' })
  @ApiResponse({ status: 200, description: 'Lista de estudiantes disponibles' })
  getAvailableStudents() {
    return this.familiesService.getAvailableStudents();
  }

  @Get('dashboard/my-family')
  @Roles(UserRole.FAMILY)
  @ApiOperation({ summary: 'Obtener datos del dashboard para la familia logueada' })
  @ApiResponse({ status: 200, description: 'Datos del dashboard familiar' })
  getMyFamilyDashboard(@Request() req: any) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    return this.familiesService.getFamilyDashboard(userId);
  }

  @Get('my-children')
  @Roles(UserRole.FAMILY)
  @ApiOperation({ summary: 'Obtener los hijos de la familia logueada para actividades' })
  @ApiResponse({ status: 200, description: 'Lista de hijos de la familia' })
  getMyChildren(@Request() req: any) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    return this.familiesService.getMyChildren(userId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY)
  @ApiOperation({ summary: 'Obtener una familia por ID' })
  @ApiResponse({ status: 200, description: 'Datos de la familia' })
  @ApiResponse({ status: 404, description: 'Familia no encontrada' })
  findOne(@Param('id') id: string) {
    return this.familiesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar una familia' })
  @ApiResponse({ status: 200, description: 'Familia actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Familia no encontrada' })
  @ApiResponse({ status: 409, description: 'Email ya existe' })
  update(@Param('id') id: string, @Body() updateFamilyDto: UpdateFamilyDto) {
    return this.familiesService.update(id, updateFamilyDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una familia (soft delete)' })
  @ApiResponse({ status: 204, description: 'Familia eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Familia no encontrada' })
  remove(@Param('id') id: string) {
    return this.familiesService.remove(id);
  }
}