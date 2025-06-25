import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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

    // Crear la rúbrica
    const rubric = this.rubricsRepository.create({
      ...createRubricDto,
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

    // Crear celdas - lógica simplificada para celdas generadas automáticamente
    const cellsToCreate = [];
    for (let criterionIndex = 0; criterionIndex < savedCriteria.length; criterionIndex++) {
      for (let levelIndex = 0; levelIndex < savedLevels.length; levelIndex++) {
        const cellIndex = criterionIndex * savedLevels.length + levelIndex;
        const cellContent = createRubricDto.cells[cellIndex]?.content || `Criterio ${criterionIndex + 1} - Nivel ${levelIndex + 1}`;
        
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
    const teacher = await this.getTeacherByUserId(userId);

    const query = this.rubricsRepository.createQueryBuilder('rubric')
      .leftJoinAndSelect('rubric.criteria', 'criteria')
      .leftJoinAndSelect('rubric.levels', 'levels')
      .leftJoinAndSelect('rubric.cells', 'cells')
      .leftJoinAndSelect('rubric.subjectAssignment', 'subjectAssignment')
      .leftJoinAndSelect('subjectAssignment.subject', 'subject')
      .leftJoinAndSelect('subjectAssignment.classGroup', 'classGroup')
      .where('rubric.teacherId = :teacherId', { teacherId: teacher.id })
      .andWhere('rubric.isActive = :isActive', { isActive: true })
      .orderBy('rubric.createdAt', 'DESC')
      .addOrderBy('criteria.order', 'ASC')
      .addOrderBy('levels.order', 'ASC');

    if (!includeTemplates) {
      query.andWhere('rubric.isTemplate = :isTemplate', { isTemplate: false });
    }

    return query.getMany();
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

    // Validar pesos si se actualizan criterios
    if (updateRubricDto.criteria) {
      if (!this.rubricUtilsService.validateCriteriaWeights(updateRubricDto.criteria)) {
        updateRubricDto.criteria = this.rubricUtilsService.normalizeCriteriaWeights(updateRubricDto.criteria);
      }
    }

    await this.rubricsRepository.update(id, updateRubricDto);
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

    // Crear DTO para la rúbrica
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
      cells: parsedData.cells,
    };

    return this.create(createRubricDto, userId);
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
    const teacher = await this.teachersRepository.findOne({
      where: { user: { id: userId } },
    });

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
}