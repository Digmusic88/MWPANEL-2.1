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
  Res,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import * as path from 'path';
import { AcademicRecordsService } from './academic-records.service';
import { ReportGeneratorService, ReportGenerationOptions } from './services/report-generator.service';
import {
  CreateAcademicRecordDto,
  UpdateAcademicRecordDto,
  CreateAcademicRecordEntryDto,
  UpdateAcademicRecordEntryDto,
  CreateAcademicRecordGradeDto,
  UpdateAcademicRecordGradeDto,
  AcademicRecordQueryDto,
} from './dto/academic-record.dto';
import { AcademicRecord } from './entities/academic-record.entity';
import { AcademicRecordEntry } from './entities/academic-record-entry.entity';
import { AcademicRecordGrade } from './entities/academic-record-grade.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Academic Records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('academic-records')
export class AcademicRecordsController {
  constructor(
    private readonly academicRecordsService: AcademicRecordsService,
    private readonly reportGeneratorService: ReportGeneratorService,
  ) {}

  // ==================== ACADEMIC RECORDS ====================

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Crear nuevo expediente académico' })
  @ApiResponse({ status: 201, description: 'Expediente creado', type: AcademicRecord })
  async createRecord(@Body() createDto: CreateAcademicRecordDto): Promise<AcademicRecord> {
    return this.academicRecordsService.createRecord(createDto);
  }

  @Get('student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY)
  @ApiOperation({ summary: 'Obtener expedientes de un estudiante' })
  @ApiResponse({ status: 200, description: 'Expedientes encontrados' })
  async getStudentRecords(
    @Param('studentId') studentId: string,
    @Query() query: AcademicRecordQueryDto
  ): Promise<{ records: AcademicRecord[]; total: number }> {
    return this.academicRecordsService.findStudentRecords(studentId, query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY)
  @ApiOperation({ summary: 'Obtener expediente por ID' })
  @ApiResponse({ status: 200, description: 'Expediente encontrado', type: AcademicRecord })
  async getRecord(@Param('id') id: string): Promise<AcademicRecord> {
    return this.academicRecordsService.findRecordById(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Actualizar expediente académico' })
  @ApiResponse({ status: 200, description: 'Expediente actualizado', type: AcademicRecord })
  async updateRecord(
    @Param('id') id: string,
    @Body() updateDto: UpdateAcademicRecordDto
  ): Promise<AcademicRecord> {
    return this.academicRecordsService.updateRecord(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar expediente académico' })
  @ApiResponse({ status: 200, description: 'Expediente eliminado' })
  async deleteRecord(@Param('id') id: string): Promise<{ message: string }> {
    await this.academicRecordsService.deleteRecord(id);
    return { message: 'Expediente eliminado exitosamente' };
  }

  // ==================== ACADEMIC RECORD ENTRIES ====================

  @Post('entries')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Crear entrada en expediente' })
  @ApiResponse({ status: 201, description: 'Entrada creada', type: AcademicRecordEntry })
  async createEntry(@Body() createDto: CreateAcademicRecordEntryDto): Promise<AcademicRecordEntry> {
    return this.academicRecordsService.createEntry(createDto);
  }

  @Get('entries/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY)
  @ApiOperation({ summary: 'Obtener entrada por ID' })
  @ApiResponse({ status: 200, description: 'Entrada encontrada', type: AcademicRecordEntry })
  async getEntry(@Param('id') id: string): Promise<AcademicRecordEntry> {
    return this.academicRecordsService.findEntryById(id);
  }

  @Put('entries/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Actualizar entrada en expediente' })
  @ApiResponse({ status: 200, description: 'Entrada actualizada', type: AcademicRecordEntry })
  async updateEntry(
    @Param('id') id: string,
    @Body() updateDto: UpdateAcademicRecordEntryDto
  ): Promise<AcademicRecordEntry> {
    return this.academicRecordsService.updateEntry(id, updateDto);
  }

  @Delete('entries/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Eliminar entrada de expediente' })
  @ApiResponse({ status: 200, description: 'Entrada eliminada' })
  async deleteEntry(@Param('id') id: string): Promise<{ message: string }> {
    await this.academicRecordsService.deleteEntry(id);
    return { message: 'Entrada eliminada exitosamente' };
  }

  // ==================== ACADEMIC RECORD GRADES ====================

  @Post('grades')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Crear calificación en expediente' })
  @ApiResponse({ status: 201, description: 'Calificación creada', type: AcademicRecordGrade })
  async createGrade(@Body() createDto: CreateAcademicRecordGradeDto): Promise<AcademicRecordGrade> {
    return this.academicRecordsService.createGrade(createDto);
  }

  @Get('grades/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY)
  @ApiOperation({ summary: 'Obtener calificación por ID' })
  @ApiResponse({ status: 200, description: 'Calificación encontrada', type: AcademicRecordGrade })
  async getGrade(@Param('id') id: string): Promise<AcademicRecordGrade> {
    return this.academicRecordsService.findGradeById(id);
  }

  @Put('grades/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Actualizar calificación en expediente' })
  @ApiResponse({ status: 200, description: 'Calificación actualizada', type: AcademicRecordGrade })
  async updateGrade(
    @Param('id') id: string,
    @Body() updateDto: UpdateAcademicRecordGradeDto
  ): Promise<AcademicRecordGrade> {
    return this.academicRecordsService.updateGrade(id, updateDto);
  }

  @Delete('grades/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Eliminar calificación de expediente' })
  @ApiResponse({ status: 200, description: 'Calificación eliminada' })
  async deleteGrade(@Param('id') id: string): Promise<{ message: string }> {
    await this.academicRecordsService.deleteGrade(id);
    return { message: 'Calificación eliminada exitosamente' };
  }

  // ==================== REPORTS GENERATION ====================

  @Post('reports/student/:studentId/:academicYear')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY)
  @ApiOperation({ summary: 'Generar boletín PDF de estudiante' })
  @ApiResponse({ status: 201, description: 'Boletín generado' })
  async generateStudentReport(
    @Param('studentId') studentId: string,
    @Param('academicYear') academicYear: string,
    @Body() options: Partial<ReportGenerationOptions> = {}
  ): Promise<{ fileName: string; message: string }> {
    const report = await this.reportGeneratorService.generateStudentReport(
      studentId,
      academicYear,
      options
    );
    
    return {
      fileName: report.fileName,
      message: 'Boletín generado exitosamente',
    };
  }

  @Post('reports/class/:classGroupId/:academicYear')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Generar reporte PDF de clase' })
  @ApiResponse({ status: 201, description: 'Reporte generado' })
  async generateClassReport(
    @Param('classGroupId') classGroupId: string,
    @Param('academicYear') academicYear: string,
    @Body() options: Partial<ReportGenerationOptions> = {}
  ): Promise<{ fileName: string; message: string }> {
    const report = await this.reportGeneratorService.generateClassReport(
      classGroupId,
      academicYear,
      options
    );
    
    return {
      fileName: report.fileName,
      message: 'Reporte de clase generado exitosamente',
    };
  }

  @Get('reports/download/:fileName')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY)
  @ApiOperation({ summary: 'Descargar reporte PDF' })
  @ApiResponse({ status: 200, description: 'Archivo PDF' })
  async downloadReport(
    @Param('fileName') fileName: string,
    @Res() res: Response
  ): Promise<void> {
    try {
      const filePath = await this.reportGeneratorService.getReportPath(fileName);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.sendFile(filePath);
    } catch (error) {
      throw new NotFoundException('Archivo de reporte no encontrado');
    }
  }

  @Delete('reports/:fileName')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar reporte PDF' })
  @ApiResponse({ status: 200, description: 'Reporte eliminado' })
  async deleteReport(@Param('fileName') fileName: string): Promise<{ message: string }> {
    await this.reportGeneratorService.deleteReport(fileName);
    return { message: 'Reporte eliminado exitosamente' };
  }

  // ==================== STATISTICS ====================

  @Get('statistics/student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY)
  @ApiOperation({ summary: 'Obtener estadísticas de estudiante' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas' })
  async getStudentStatistics(
    @Param('studentId') studentId: string,
    @Query('academicYear') academicYear?: string
  ): Promise<any> {
    return this.academicRecordsService.getStudentStatistics(
      studentId,
      academicYear as any
    );
  }

  // ==================== SYNC ====================

  @Post('sync/student/:studentId/:academicYear')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Sincronizar expediente con evaluaciones existentes' })
  @ApiResponse({ status: 200, description: 'Expediente sincronizado', type: AcademicRecord })
  async syncFromEvaluations(
    @Param('studentId') studentId: string,
    @Param('academicYear') academicYear: string
  ): Promise<AcademicRecord> {
    return this.academicRecordsService.syncFromEvaluations(
      studentId,
      academicYear as any
    );
  }
}