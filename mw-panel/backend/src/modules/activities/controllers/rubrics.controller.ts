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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { RubricsService } from '../services/rubrics.service';
import { CreateRubricDto } from '../dto/create-rubric.dto';
import { UpdateRubricDto } from '../dto/update-rubric.dto';
import { ImportRubricDto } from '../dto/import-rubric.dto';
import { CreateRubricAssessmentDto, UpdateRubricAssessmentDto, RubricAssessmentResponseDto } from '../dto/rubric-assessment.dto';
import { ShareRubricDto, UnshareRubricDto } from '../dto/share-rubric.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { Rubric } from '../entities/rubric.entity';
import { RubricAssessment } from '../entities/rubric-assessment.entity';

@ApiTags('rubrics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rubrics')
export class RubricsController {
  constructor(private readonly rubricsService: RubricsService) {}

  // ==================== CRUD RÚBRICAS ====================

  @Post()
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Crear nueva rúbrica' })
  @ApiResponse({ status: 201, description: 'Rúbrica creada exitosamente', type: Rubric })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'Sin permisos para crear rúbricas' })
  async create(
    @Body() createRubricDto: CreateRubricDto,
    @Request() req: any,
  ): Promise<Rubric> {
    const userId = req.user.sub || req.user.id;
    return this.rubricsService.create(createRubricDto, userId);
  }

  @Get()
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Obtener rúbricas del profesor' })
  @ApiQuery({ name: 'includeTemplates', required: false, description: 'Incluir plantillas', type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de rúbricas del profesor', type: [Rubric] })
  async findAll(
    @Request() req: any,
    @Query('includeTemplates') includeTemplates?: boolean,
  ): Promise<Rubric[]> {
    const userId = req.user.sub || req.user.id;
    console.log('[DEBUG] RubricsController findAll - userId:', userId, 'includeTemplates:', includeTemplates);
    return this.rubricsService.findAll(userId, includeTemplates === true);
  }

  @Get('shared-with-me')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Obtener rúbricas compartidas conmigo' })
  @ApiResponse({ status: 200, description: 'Lista de rúbricas compartidas conmigo', type: [Rubric] })
  async getSharedWithMe(@Request() req: any): Promise<Rubric[]> {
    const userId = req.user.sub || req.user.id;
    return this.rubricsService.getSharedWithMe(userId);
  }

  @Get('colleagues')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Obtener lista de profesores colegas para compartir' })
  @ApiResponse({ status: 200, description: 'Lista de profesores', type: Array })
  async getColleagues(@Request() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.rubricsService.getColleagues(userId);
  }

  @Get(':id')
  @Roles(UserRole.TEACHER, UserRole.FAMILY)
  @ApiOperation({ summary: 'Obtener rúbrica por ID' })
  @ApiResponse({ status: 200, description: 'Rúbrica encontrada', type: Rubric })
  @ApiResponse({ status: 404, description: 'Rúbrica no encontrada' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Rubric> {
    return this.rubricsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Actualizar rúbrica' })
  @ApiResponse({ status: 200, description: 'Rúbrica actualizada exitosamente', type: Rubric })
  @ApiResponse({ status: 403, description: 'Sin permisos para editar esta rúbrica' })
  @ApiResponse({ status: 404, description: 'Rúbrica no encontrada' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRubricDto: UpdateRubricDto,
    @Request() req: any,
  ): Promise<Rubric> {
    const userId = req.user.sub || req.user.id;
    return this.rubricsService.update(id, updateRubricDto, userId);
  }

  @Delete(':id')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Eliminar rúbrica (soft delete)' })
  @ApiResponse({ status: 200, description: 'Rúbrica eliminada exitosamente' })
  @ApiResponse({ status: 403, description: 'Sin permisos para eliminar esta rúbrica' })
  @ApiResponse({ status: 404, description: 'Rúbrica no encontrada' })
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    const userId = req.user.sub || req.user.id;
    await this.rubricsService.remove(id, userId);
    return { message: 'Rúbrica eliminada exitosamente' };
  }

  @Patch(':id/publish')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Publicar rúbrica (cambiar estado a activo)' })
  @ApiResponse({ status: 200, description: 'Rúbrica publicada exitosamente', type: Rubric })
  @ApiResponse({ status: 403, description: 'Sin permisos para publicar esta rúbrica' })
  @ApiResponse({ status: 404, description: 'Rúbrica no encontrada' })
  async publish(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<Rubric> {
    const userId = req.user.sub || req.user.id;
    return this.rubricsService.publish(id, userId);
  }

  // ==================== IMPORTACIÓN DESDE CHATGPT ====================

  @Post('preview-import')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Vista previa de rúbrica desde ChatGPT (Markdown o CSV)' })
  @ApiResponse({ status: 200, description: 'Vista previa generada exitosamente' })
  @ApiResponse({ status: 400, description: 'Error en el formato de importación' })
  async previewImportFromChatGPT(
    @Body() previewDto: { format: string; data: string },
  ): Promise<any> {
    return this.rubricsService.previewImportFromChatGPT(previewDto.format, previewDto.data);
  }

  @Post('import')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Importar rúbrica desde ChatGPT (Markdown o CSV)' })
  @ApiResponse({ status: 201, description: 'Rúbrica importada exitosamente', type: Rubric })
  @ApiResponse({ status: 400, description: 'Error en el formato de importación' })
  async importFromChatGPT(
    @Body() importDto: ImportRubricDto,
    @Request() req: any,
  ): Promise<Rubric> {
    const userId = req.user.sub || req.user.id;
    return this.rubricsService.importFromChatGPT(importDto, userId);
  }

  // ==================== EVALUACIONES CON RÚBRICAS ====================

  @Post('assessments')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Crear evaluación con rúbrica' })
  @ApiResponse({ status: 201, description: 'Evaluación creada exitosamente', type: RubricAssessmentResponseDto })
  @ApiResponse({ status: 400, description: 'Datos de evaluación inválidos' })
  async createAssessment(
    @Body() createDto: CreateRubricAssessmentDto,
  ): Promise<RubricAssessment> {
    return this.rubricsService.createAssessment(createDto);
  }

  @Get('assessments/:id')
  @Roles(UserRole.TEACHER, UserRole.FAMILY)
  @ApiOperation({ summary: 'Obtener evaluación con rúbrica por ID' })
  @ApiResponse({ status: 200, description: 'Evaluación encontrada', type: RubricAssessmentResponseDto })
  @ApiResponse({ status: 404, description: 'Evaluación no encontrada' })
  async getAssessment(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RubricAssessment> {
    return this.rubricsService.getAssessment(id);
  }

  // ==================== ENDPOINTS DE TESTING (TEMPORALES) ====================

  @Get('test/colors/:count')
  @Public()
  @ApiOperation({ summary: 'TEST: Generar colores automáticos para niveles' })
  async testGenerateColors(@Param('count') count: number) {
    // Para testing del sistema de colores
    return {
      count,
      colors: [], // Se implementaría llamando al servicio de utilidades
    };
  }

  @Post('test/parse-markdown')
  @Public()
  @ApiOperation({ summary: 'TEST: Parsear tabla Markdown' })
  async testParseMarkdown(@Body() body: { data: string }) {
    // Para testing del parser de Markdown
    return {
      message: 'Parser implementado en RubricUtilsService',
      input: body.data,
    };
  }

  @Post('test/parse-csv')
  @Public()
  @ApiOperation({ summary: 'TEST: Parsear tabla CSV' })
  async testParseCSV(@Body() body: { data: string }) {
    // Para testing del parser de CSV
    return {
      message: 'Parser implementado en RubricUtilsService',
      input: body.data,
    };
  }

  // ==================== COMPARTIR RÚBRICAS ====================

  @Post(':id/share')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Compartir rúbrica con otros profesores' })
  @ApiResponse({ status: 200, description: 'Rúbrica compartida exitosamente', type: Rubric })
  @ApiResponse({ status: 403, description: 'Sin permisos para compartir esta rúbrica' })
  @ApiResponse({ status: 404, description: 'Rúbrica no encontrada' })
  async shareRubric(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() shareDto: ShareRubricDto,
    @Request() req: any,
  ): Promise<Rubric> {
    const userId = req.user.sub || req.user.id;
    return this.rubricsService.shareRubric(id, shareDto.teacherIds, userId);
  }

  @Post(':id/unshare')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Retirar acceso de rúbrica compartida' })
  @ApiResponse({ status: 200, description: 'Acceso retirado exitosamente', type: Rubric })
  @ApiResponse({ status: 403, description: 'Sin permisos para modificar esta rúbrica' })
  @ApiResponse({ status: 404, description: 'Rúbrica no encontrada' })
  async unshareRubric(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() unshareDto: UnshareRubricDto,
    @Request() req: any,
  ): Promise<Rubric> {
    const userId = req.user.sub || req.user.id;
    return this.rubricsService.unshareRubric(id, unshareDto.teacherIds, userId);
  }
}