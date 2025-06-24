import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateSystemSettingDto, UpdateSystemSettingDto, SystemSettingResponseDto } from './dto/system-setting.dto';
import { SystemSetting, SettingCategory } from './entities/system-setting.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva configuración' })
  @ApiResponse({ status: 201, description: 'Configuración creada', type: SystemSettingResponseDto })
  async create(@Body() createDto: CreateSystemSettingDto): Promise<SystemSetting> {
    return this.settingsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las configuraciones' })
  @ApiResponse({ status: 200, description: 'Lista de configuraciones', type: [SystemSettingResponseDto] })
  async findAll(
    @Query('category') category?: SettingCategory
  ): Promise<SystemSetting[]> {
    return this.settingsService.findAll(category);
  }

  @Get('modules')
  @ApiOperation({ summary: 'Obtener configuraciones de módulos' })
  @ApiResponse({ status: 200, description: 'Configuraciones de módulos', type: [SystemSettingResponseDto] })
  async getModuleSettings(): Promise<SystemSetting[]> {
    return this.settingsService.findAll(SettingCategory.MODULES);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Obtener configuración por clave' })
  @ApiResponse({ status: 200, description: 'Configuración encontrada', type: SystemSettingResponseDto })
  async findByKey(@Param('key') key: string): Promise<SystemSetting> {
    return this.settingsService.findByKey(key);
  }

  @Put(':key')
  @ApiOperation({ summary: 'Actualizar configuración' })
  @ApiResponse({ status: 200, description: 'Configuración actualizada', type: SystemSettingResponseDto })
  async update(
    @Param('key') key: string,
    @Body() updateDto: UpdateSystemSettingDto
  ): Promise<SystemSetting> {
    return this.settingsService.update(key, updateDto);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Eliminar configuración' })
  @ApiResponse({ status: 200, description: 'Configuración eliminada' })
  async delete(@Param('key') key: string): Promise<{ message: string }> {
    await this.settingsService.delete(key);
    return { message: 'Configuración eliminada exitosamente' };
  }

  @Post('modules/:moduleName/enable')
  @ApiOperation({ summary: 'Habilitar módulo' })
  @ApiResponse({ status: 200, description: 'Módulo habilitado' })
  async enableModule(@Param('moduleName') moduleName: string): Promise<{ message: string }> {
    await this.settingsService.enableModule(moduleName);
    return { message: `Módulo ${moduleName} habilitado exitosamente` };
  }

  @Post('modules/:moduleName/disable')
  @ApiOperation({ summary: 'Deshabilitar módulo' })
  @ApiResponse({ status: 200, description: 'Módulo deshabilitado' })
  async disableModule(@Param('moduleName') moduleName: string): Promise<{ message: string }> {
    await this.settingsService.disableModule(moduleName);
    return { message: `Módulo ${moduleName} deshabilitado exitosamente` };
  }

  @Get('modules/:moduleName/status')
  @ApiOperation({ summary: 'Verificar estado de módulo' })
  @ApiResponse({ status: 200, description: 'Estado del módulo' })
  async getModuleStatus(@Param('moduleName') moduleName: string): Promise<{ enabled: boolean }> {
    const enabled = await this.settingsService.isModuleEnabled(moduleName);
    return { enabled };
  }

  @Post('initialize')
  @ApiOperation({ summary: 'Inicializar configuraciones por defecto' })
  @ApiResponse({ status: 200, description: 'Configuraciones inicializadas' })
  async initializeSettings(): Promise<{ message: string }> {
    await this.settingsService.initializeDefaultSettings();
    return { message: 'Configuraciones por defecto inicializadas exitosamente' };
  }
}