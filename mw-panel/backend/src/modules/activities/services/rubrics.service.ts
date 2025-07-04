import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, Brackets, ArrayContains } from 'typeorm';
import { Rubric, RubricStatus } from '../entities/rubric.entity';
import { RubricCriterion } from '../entities/rubric-criterion.entity';
import { RubricLevel } from '../entities/rubric-level.entity';
import { RubricCell } from '../entities/rubric-cell.entity';
import { RubricAssessment } from '../entities/rubric-assessment.entity';
import { RubricAssessmentCriterion } from '../entities/rubric-assessment-criterion.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { SubjectAssignment } from '../../students/entities/subject-assignment.entity';
import { CreateRubricDto } from '../dto/create-rubric.dto';
import { UpdateRubricDto } from '../dto/update-rubric.dto';
import { ImportRubricDto, ImportFormat } from '../dto/import-rubric.dto';
import { CreateRubricAssessmentDto, UpdateRubricAssessmentDto } from '../dto/rubric-assessment.dto';
import { RubricUtilsService } from './rubric-utils.service';

@Injectable()
export class RubricsService {
  constructor(
    @InjectRepository(Rubric)
    private rubricsRepository: Repository<Rubric>,
    @InjectRepository(RubricCriterion)
    private criteriaRepository: Repository<RubricCriterion>,
    @InjectRepository(RubricLevel)
    private levelsRepository: Repository<RubricLevel>,
    @InjectRepository(RubricCell)
    private cellsRepository: Repository<RubricCell>,
    @InjectRepository(RubricAssessment)
    private assessmentsRepository: Repository<RubricAssessment>,
    @InjectRepository(RubricAssessmentCriterion)
    private assessmentCriteriaRepository: Repository<RubricAssessmentCriterion>,
    @InjectRepository(Teacher)
    private teachersRepository: Repository<Teacher>,
    @InjectRepository(SubjectAssignment)
    private subjectAssignmentsRepository: Repository<SubjectAssignment>,
    private rubricUtilsService: RubricUtilsService,
  ) {}

  // ==================== CRUD RÚBRICAS ====================

  async create(createRubricDto: CreateRubricDto, userId: string): Promise<Rubric> {
    const teacher = await this.getTeacherByUserId(userId);

    // Validar que los pesos sumen 1
    if (!this.rubricUtilsService.validateCriteriaWeights(createRubricDto.criteria)) {
      // Normalizar automáticamente si no suman 1
      createRubricDto.criteria = this.rubricUtilsService.normalizeCriteriaWeights(createRubricDto.criteria);
    }

    // Validar acceso a la asignación de asignatura si se especifica
    if (createRubricDto.subjectAssignmentId) {
      await this.verifyTeacherSubjectAssignmentAccess(teacher.id, createRubricDto.subjectAssignmentId);
    }

    // Crear la rúbrica - excluir arrays de relaciones para evitar cascade duplicado
    const { criteria: _, levels: __, cells: ___, ...rubricData } = createRubricDto;
    const rubric = this.rubricsRepository.create({
      ...rubricData,
      teacherId: teacher.id,
      criteriaCount: createRubricDto.criteria.length,
      levelsCount: createRubricDto.levels.length,
      status: RubricStatus.DRAFT,
    });

    const savedRubric = await this.rubricsRepository.save(rubric);

    // Crear criterios
    const savedCriteria = await Promise.all(
      createRubricDto.criteria.map(async (criterionDto, index) => {
        const criterion = this.criteriaRepository.create({
          ...criterionDto,
          rubricId: savedRubric.id,
        });
        return await this.criteriaRepository.save(criterion);
      })
    );

    // Crear niveles
    const savedLevels = await Promise.all(
      createRubricDto.levels.map(async (levelDto, index) => {
        const level = this.levelsRepository.create({
          ...levelDto,
          rubricId: savedRubric.id,
        });
        return await this.levelsRepository.save(level);
      })
    );

    // Crear celdas - mapear desde datos parseados usando índices
    const cellsToCreate = [];
    for (let criterionIndex = 0; criterionIndex < savedCriteria.length; criterionIndex++) {
      for (let levelIndex = 0; levelIndex < savedLevels.length; levelIndex++) {
        const cellIndex = criterionIndex * savedLevels.length + levelIndex;
        
        // Obtener contenido de la celda desde los datos parseados
        let cellContent = `Criterio ${criterionIndex + 1} - Nivel ${levelIndex + 1}`;
        if (createRubricDto.cells && createRubricDto.cells[cellIndex]) {
          cellContent = createRubricDto.cells[cellIndex].content;
        }
        
        cellsToCreate.push(this.cellsRepository.create({
          content: cellContent,
          rubricId: savedRubric.id,
          criterionId: savedCriteria[criterionIndex].id,
          levelId: savedLevels[levelIndex].id,
        }));
      }
    }

    if (cellsToCreate.length > 0) {
      await this.cellsRepository.save(cellsToCreate);
    }

    return this.findOne(savedRubric.id);
  }

  async findAll(userId: string, includeTemplates: boolean = false): Promise<Rubric[]> {
    console.log('[DEBUG] findAll - userId:', userId);
    const teacher = await this.getTeacherByUserId(userId);
    console.log('[DEBUG] findAll - teacher found:', teacher.id);

    // Usar consulta directa más simple y confiable
    const rubrics = await this.rubricsRepository.find({
      where: {
        teacherId: teacher.id,
        isActive: true,
        ...(includeTemplates ? {} : { isTemplate: false })
      },
      relations: [
        'criteria', 
        'levels', 
        'cells',
        'cells.criterion',
        'cells.level',
        'subjectAssignment', 
        'subjectAssignment.subject', 
        'subjectAssignment.classGroup'
      ],
      order: { createdAt: 'DESC' }
    });
    
    console.log('[DEBUG] findAll - found rubrics:', rubrics.length);
    return rubrics;
  }

  async findOne(id: string): Promise<Rubric> {
    const rubric = await this.rubricsRepository.findOne({
      where: { id, isActive: true },
      relations: [
        'criteria',
        'levels', 
        'cells',
        'cells.criterion',
        'cells.level',
        'subjectAssignment',
        'subjectAssignment.subject',
        'subjectAssignment.classGroup'
      ],
    });

    if (!rubric) {
      throw new NotFoundException('Rúbrica no encontrada');
    }

    return rubric;
  }

  async update(id: string, updateRubricDto: UpdateRubricDto, userId: string): Promise<Rubric> {
    const teacher = await this.getTeacherByUserId(userId);
    const rubric = await this.findOne(id);

    if (rubric.teacherId !== teacher.id) {
      throw new ForbiddenException('No tienes permisos para editar esta rúbrica');
    }

    // Excluir arrays de relaciones para evitar conflictos cascade
    const { criteria: _, levels: __, cells: ___, ...updateData } = updateRubricDto;

    // Preparar los datos de actualización con los conteos
    const finalUpdateData: any = { ...updateData };

    // Validar pesos si se actualizan criterios (aunque no se actualizarán en esta operación básica)
    if (updateRubricDto.criteria) {
      if (!this.rubricUtilsService.validateCriteriaWeights(updateRubricDto.criteria)) {
        updateRubricDto.criteria = this.rubricUtilsService.normalizeCriteriaWeights(updateRubricDto.criteria);
      }
      // Actualizar conteo de criterios si se proporcionan
      finalUpdateData.criteriaCount = updateRubricDto.criteria.length;
    }

    if (updateRubricDto.levels) {
      // Actualizar conteo de niveles si se proporcionan
      finalUpdateData.levelsCount = updateRubricDto.levels.length;
    }

    await this.rubricsRepository.update(id, finalUpdateData);
    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const teacher = await this.getTeacherByUserId(userId);
    const rubric = await this.findOne(id);

    if (rubric.teacherId !== teacher.id) {
      throw new ForbiddenException('No tienes permisos para eliminar esta rúbrica');
    }

    await this.rubricsRepository.update(id, { isActive: false });
  }

  async publish(id: string, userId: string): Promise<Rubric> {
    const teacher = await this.getTeacherByUserId(userId);
    const rubric = await this.findOne(id);

    if (rubric.teacherId !== teacher.id) {
      throw new ForbiddenException('No tienes permisos para publicar esta rúbrica');
    }

    await this.rubricsRepository.update(id, { status: RubricStatus.ACTIVE });
    return this.findOne(id);
  }

  // ==================== IMPORTACIÓN DESDE CHATGPT ====================

  async previewImportFromChatGPT(format: string, data: string): Promise<any> {
    let parsedData;
    try {
      if (format === ImportFormat.MARKDOWN) {
        parsedData = this.rubricUtilsService.parseMarkdownTable(data);
      } else if (format === ImportFormat.CSV) {
        parsedData = this.rubricUtilsService.parseCSVTable(data);
      } else {
        throw new BadRequestException('Formato de importación no soportado');
      }
    } catch (error) {
      throw new BadRequestException(`Error al parsear los datos: ${error.message}`);
    }

    // Retornar datos parseados para vista previa
    return {
      criteria: parsedData.criteria,
      levels: parsedData.levels,
      cells: parsedData.cells,
      criteriaCount: parsedData.criteria.length,
      levelsCount: parsedData.levels.length,
      maxScore: 100,
      isTemplate: false,
      isActive: true,
      isVisibleToFamilies: false,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async importFromChatGPT(importDto: ImportRubricDto, userId: string): Promise<Rubric> {
    const teacher = await this.getTeacherByUserId(userId);

    let parsedData;
    try {
      if (importDto.format === ImportFormat.MARKDOWN) {
        parsedData = this.rubricUtilsService.parseMarkdownTable(importDto.data);
      } else if (importDto.format === ImportFormat.CSV) {
        parsedData = this.rubricUtilsService.parseCSVTable(importDto.data);
      } else {
        throw new BadRequestException('Formato de importación no soportado');
      }
    } catch (error) {
      throw new BadRequestException(`Error al parsear los datos: ${error.message}`);
    }

    // Crear DTO para la rúbrica - sin celdas, se generarán automáticamente
    const createRubricDto: CreateRubricDto = {
      name: importDto.name,
      description: importDto.description,
      isTemplate: importDto.isTemplate || false,
      isVisibleToFamilies: importDto.isVisibleToFamilies || false,
      subjectAssignmentId: importDto.subjectAssignmentId,
      maxScore: 100,
      importSource: importDto.format,
      originalImportData: importDto.data,
      criteria: parsedData.criteria,
      levels: parsedData.levels,
      cells: [], // Vacío - se generarán automáticamente
    };

    // Crear la rúbrica base
    const createdRubric = await this.create(createRubricDto, userId);
    
    // Actualizar el contenido de las celdas con los datos parseados
    return this.updateCellsContent(createdRubric.id, parsedData.cells);
  }

  /**
   * Actualizar el contenido de las celdas de una rúbrica con datos parseados
   */
  private async updateCellsContent(rubricId: string, parsedCells: any[]): Promise<Rubric> {
    const rubric = await this.findOne(rubricId);
    
    // Ordenar criterios y niveles para mapeo correcto
    const sortedCriteria = rubric.criteria.sort((a, b) => a.order - b.order);
    const sortedLevels = rubric.levels.sort((a, b) => a.order - b.order);
    
    // Actualizar el contenido de las celdas
    for (let criterionIndex = 0; criterionIndex < sortedCriteria.length; criterionIndex++) {
      for (let levelIndex = 0; levelIndex < sortedLevels.length; levelIndex++) {
        const cellIndex = criterionIndex * sortedLevels.length + levelIndex;
        
        if (parsedCells[cellIndex]) {
          const criterion = sortedCriteria[criterionIndex];
          const level = sortedLevels[levelIndex];
          
          // Buscar la celda correspondiente
          const cell = rubric.cells.find(c => 
            c.criterionId === criterion.id && c.levelId === level.id
          );
          
          if (cell) {
            // Actualizar el contenido de la celda
            await this.cellsRepository.update(cell.id, {
              content: parsedCells[cellIndex].content
            });
          }
        }
      }
    }
    
    // Devolver la rúbrica actualizada
    return this.findOne(rubricId);
  }

  // ==================== EVALUACIONES CON RÚBRICAS ====================

  async createAssessment(createDto: CreateRubricAssessmentDto): Promise<RubricAssessment> {
    const rubric = await this.findOne(createDto.rubricId);

    // Validar que todos los criterios estén evaluados
    const rubricCriteriaIds = rubric.criteria.map(c => c.id);
    const assessedCriteriaIds = createDto.criterionAssessments.map(ca => ca.criterionId);

    if (rubricCriteriaIds.length !== assessedCriteriaIds.length ||
        !rubricCriteriaIds.every(id => assessedCriteriaIds.includes(id))) {
      throw new BadRequestException('Debe evaluar todos los criterios de la rúbrica');
    }

    // Crear evaluación principal
    const assessment = this.assessmentsRepository.create({
      activityAssessmentId: createDto.activityAssessmentId,
      rubricId: createDto.rubricId,
      studentId: createDto.studentId,
      comments: createDto.comments,
      totalScore: 0, // Se calculará después
      maxPossibleScore: 0,
      percentage: 0,
      isComplete: true,
    });

    const savedAssessment = await this.assessmentsRepository.save(assessment);

    // Crear evaluaciones por criterio
    const criterionAssessments = [];
    for (const criterionDto of createDto.criterionAssessments) {
      const criterion = rubric.criteria.find(c => c.id === criterionDto.criterionId);
      const level = rubric.levels.find(l => l.id === criterionDto.levelId);
      const cell = rubric.cells.find(c => c.id === criterionDto.cellId);

      if (!criterion || !level || !cell) {
        throw new BadRequestException('Criterio, nivel o celda no válidos');
      }

      const criterionAssessment = this.assessmentCriteriaRepository.create({
        rubricAssessmentId: savedAssessment.id,
        criterionId: criterion.id,
        levelId: level.id,
        cellId: cell.id,
        score: level.scoreValue,
        weightedScore: level.scoreValue * criterion.weight,
        comments: criterionDto.comments,
      });

      criterionAssessments.push(criterionAssessment);
    }

    await this.assessmentCriteriaRepository.save(criterionAssessments);

    // Calcular puntuación total
    const scoreCalculation = this.rubricUtilsService.calculateRubricScore(
      criterionAssessments.map(ca => ({
        criterion: rubric.criteria.find(c => c.id === ca.criterionId),
        selectedLevel: rubric.levels.find(l => l.id === ca.levelId),
      })),
      rubric.maxScore
    );

    // Actualizar puntuaciones
    await this.assessmentsRepository.update(savedAssessment.id, {
      totalScore: scoreCalculation.totalScore,
      maxPossibleScore: scoreCalculation.maxPossibleScore,
      percentage: scoreCalculation.percentage,
    });

    return this.getAssessment(savedAssessment.id);
  }

  async getAssessment(id: string): Promise<RubricAssessment> {
    const assessment = await this.assessmentsRepository.findOne({
      where: { id, isActive: true },
      relations: [
        'rubric',
        'rubric.criteria',
        'rubric.levels',
        'rubric.cells',
        'student',
        'student.user',
        'student.user.profile',
        'criterionAssessments',
        'criterionAssessments.criterion',
        'criterionAssessments.selectedLevel',
        'criterionAssessments.selectedCell',
      ],
    });

    if (!assessment) {
      throw new NotFoundException('Evaluación con rúbrica no encontrada');
    }

    return assessment;
  }

  // ==================== MÉTODOS HELPER ====================

  private async getTeacherByUserId(userId: string): Promise<Teacher> {
    console.log('[DEBUG] getTeacherByUserId - userId:', userId);
    const teacher = await this.teachersRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user']
    });

    console.log('[DEBUG] getTeacherByUserId - teacher found:', teacher ? teacher.id : 'null');

    if (!teacher) {
      throw new NotFoundException('Profesor no encontrado para este usuario');
    }

    return teacher;
  }

  private async verifyTeacherSubjectAssignmentAccess(teacherId: string, subjectAssignmentId: string): Promise<void> {
    const assignment = await this.subjectAssignmentsRepository.findOne({
      where: { id: subjectAssignmentId, teacher: { id: teacherId } },
    });

    if (!assignment) {
      throw new ForbiddenException('No tienes acceso a esta asignación de asignatura');
    }
  }

  // ==================== MÉTODOS PARA COMPARTIR RÚBRICAS ====================

  async shareRubric(rubricId: string, teacherIds: string[], userId: string): Promise<Rubric> {
    const teacher = await this.getTeacherByUserId(userId);
    
    // Verificar que la rúbrica existe y pertenece al profesor actual
    const rubric = await this.rubricsRepository.findOne({
      where: { id: rubricId, teacherId: teacher.id },
      relations: ['teacher']
    });

    if (!rubric) {
      throw new NotFoundException('Rúbrica no encontrada o no tienes permisos para compartirla');
    }

    // Verificar que los profesores existen
    const targetTeachers = await this.teachersRepository.findBy({ 
      id: In(teacherIds) 
    });

    if (targetTeachers.length !== teacherIds.length) {
      throw new BadRequestException('Algunos profesores especificados no existen');
    }

    // Añadir profesores a la lista de compartidos (evitar duplicados)
    const currentSharedWith = rubric.sharedWith || [];
    const newSharedWith = [...new Set([...currentSharedWith, ...teacherIds])];

    rubric.sharedWith = newSharedWith;
    return await this.rubricsRepository.save(rubric);
  }

  async unshareRubric(rubricId: string, teacherIds: string[], userId: string): Promise<Rubric> {
    const teacher = await this.getTeacherByUserId(userId);
    
    // Verificar que la rúbrica existe y pertenece al profesor actual
    const rubric = await this.rubricsRepository.findOne({
      where: { id: rubricId, teacherId: teacher.id },
    });

    if (!rubric) {
      throw new NotFoundException('Rúbrica no encontrada o no tienes permisos para modificarla');
    }

    // Remover profesores de la lista de compartidos
    const currentSharedWith = rubric.sharedWith || [];
    rubric.sharedWith = currentSharedWith.filter(id => !teacherIds.includes(id));

    return await this.rubricsRepository.save(rubric);
  }

  async getColleagues(userId: string): Promise<any[]> {
    const teacher = await this.getTeacherByUserId(userId);
    
    // Obtener todos los profesores excepto el actual
    const colleagues = await this.teachersRepository.find({
      where: { id: Not(teacher.id) },
      relations: ['user', 'user.profile'],
      select: {
        id: true,
        user: {
          id: true,
          email: true,
          profile: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return colleagues.map(colleague => ({
      id: colleague.id,
      name: `${colleague.user.profile.firstName} ${colleague.user.profile.lastName}`,
      email: colleague.user.email
    }));
  }

  async getSharedWithMe(userId: string): Promise<Rubric[]> {
    try {
      console.log('[DEBUG] getSharedWithMe - userId:', userId);
      const teacher = await this.getTeacherByUserId(userId);
      console.log('[DEBUG] getSharedWithMe - teacher found:', teacher.id);
      
      // Buscar rúbricas donde el teacherId del profesor actual esté en el array sharedWith
      // Simplificamos las relaciones temporalmente para debug
      const sharedRubrics = await this.rubricsRepository.find({
        where: { 
          isActive: true,
          sharedWith: ArrayContains([teacher.id])
        },
        relations: [
          'criteria',
          'levels', 
          'cells',
          'teacher'
        ],
        order: { updatedAt: 'DESC' }
      });

      console.log('[DEBUG] getSharedWithMe - found shared rubrics:', sharedRubrics.length);

      // Agregar información del profesor que compartió cada rúbrica (simplificado)
      return sharedRubrics.map(rubric => ({
        ...rubric,
        sharedByTeacher: {
          id: rubric.teacher.id,
          user: {
            profile: {
              firstName: 'Profesor',
              lastName: 'Compartido'
            }
          }
        },
        // Agregar fecha de cuando fue compartida (simulada)
        sharedAt: rubric.updatedAt
      }));
    } catch (error) {
      console.error('[ERROR] getSharedWithMe:', error);
      throw error;
    }
  }
}