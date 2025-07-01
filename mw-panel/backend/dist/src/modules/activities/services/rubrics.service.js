"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RubricsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rubric_entity_1 = require("../entities/rubric.entity");
const rubric_criterion_entity_1 = require("../entities/rubric-criterion.entity");
const rubric_level_entity_1 = require("../entities/rubric-level.entity");
const rubric_cell_entity_1 = require("../entities/rubric-cell.entity");
const rubric_assessment_entity_1 = require("../entities/rubric-assessment.entity");
const rubric_assessment_criterion_entity_1 = require("../entities/rubric-assessment-criterion.entity");
const teacher_entity_1 = require("../../teachers/entities/teacher.entity");
const subject_assignment_entity_1 = require("../../students/entities/subject-assignment.entity");
const import_rubric_dto_1 = require("../dto/import-rubric.dto");
const rubric_utils_service_1 = require("./rubric-utils.service");
let RubricsService = class RubricsService {
    constructor(rubricsRepository, criteriaRepository, levelsRepository, cellsRepository, assessmentsRepository, assessmentCriteriaRepository, teachersRepository, subjectAssignmentsRepository, rubricUtilsService) {
        this.rubricsRepository = rubricsRepository;
        this.criteriaRepository = criteriaRepository;
        this.levelsRepository = levelsRepository;
        this.cellsRepository = cellsRepository;
        this.assessmentsRepository = assessmentsRepository;
        this.assessmentCriteriaRepository = assessmentCriteriaRepository;
        this.teachersRepository = teachersRepository;
        this.subjectAssignmentsRepository = subjectAssignmentsRepository;
        this.rubricUtilsService = rubricUtilsService;
    }
    async create(createRubricDto, userId) {
        const teacher = await this.getTeacherByUserId(userId);
        if (!this.rubricUtilsService.validateCriteriaWeights(createRubricDto.criteria)) {
            createRubricDto.criteria = this.rubricUtilsService.normalizeCriteriaWeights(createRubricDto.criteria);
        }
        if (createRubricDto.subjectAssignmentId) {
            await this.verifyTeacherSubjectAssignmentAccess(teacher.id, createRubricDto.subjectAssignmentId);
        }
        const { criteria: _, levels: __, cells: ___, ...rubricData } = createRubricDto;
        const rubric = this.rubricsRepository.create({
            ...rubricData,
            teacherId: teacher.id,
            criteriaCount: createRubricDto.criteria.length,
            levelsCount: createRubricDto.levels.length,
            status: rubric_entity_1.RubricStatus.DRAFT,
        });
        const savedRubric = await this.rubricsRepository.save(rubric);
        const savedCriteria = await Promise.all(createRubricDto.criteria.map(async (criterionDto, index) => {
            const criterion = this.criteriaRepository.create({
                ...criterionDto,
                rubricId: savedRubric.id,
            });
            return await this.criteriaRepository.save(criterion);
        }));
        const savedLevels = await Promise.all(createRubricDto.levels.map(async (levelDto, index) => {
            const level = this.levelsRepository.create({
                ...levelDto,
                rubricId: savedRubric.id,
            });
            return await this.levelsRepository.save(level);
        }));
        const cellsToCreate = [];
        for (let criterionIndex = 0; criterionIndex < savedCriteria.length; criterionIndex++) {
            for (let levelIndex = 0; levelIndex < savedLevels.length; levelIndex++) {
                const cellIndex = criterionIndex * savedLevels.length + levelIndex;
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
    async findAll(userId, includeTemplates = false) {
        const teacher = await this.getTeacherByUserId(userId);
        return this.rubricsRepository.find({
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
    }
    async findOne(id) {
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
            throw new common_1.NotFoundException('Rúbrica no encontrada');
        }
        return rubric;
    }
    async update(id, updateRubricDto, userId) {
        const teacher = await this.getTeacherByUserId(userId);
        const rubric = await this.findOne(id);
        if (rubric.teacherId !== teacher.id) {
            throw new common_1.ForbiddenException('No tienes permisos para editar esta rúbrica');
        }
        const { criteria: _, levels: __, cells: ___, ...updateData } = updateRubricDto;
        const finalUpdateData = { ...updateData };
        if (updateRubricDto.criteria) {
            if (!this.rubricUtilsService.validateCriteriaWeights(updateRubricDto.criteria)) {
                updateRubricDto.criteria = this.rubricUtilsService.normalizeCriteriaWeights(updateRubricDto.criteria);
            }
            finalUpdateData.criteriaCount = updateRubricDto.criteria.length;
        }
        if (updateRubricDto.levels) {
            finalUpdateData.levelsCount = updateRubricDto.levels.length;
        }
        await this.rubricsRepository.update(id, finalUpdateData);
        return this.findOne(id);
    }
    async remove(id, userId) {
        const teacher = await this.getTeacherByUserId(userId);
        const rubric = await this.findOne(id);
        if (rubric.teacherId !== teacher.id) {
            throw new common_1.ForbiddenException('No tienes permisos para eliminar esta rúbrica');
        }
        await this.rubricsRepository.update(id, { isActive: false });
    }
    async publish(id, userId) {
        const teacher = await this.getTeacherByUserId(userId);
        const rubric = await this.findOne(id);
        if (rubric.teacherId !== teacher.id) {
            throw new common_1.ForbiddenException('No tienes permisos para publicar esta rúbrica');
        }
        await this.rubricsRepository.update(id, { status: rubric_entity_1.RubricStatus.ACTIVE });
        return this.findOne(id);
    }
    async previewImportFromChatGPT(format, data) {
        let parsedData;
        try {
            if (format === import_rubric_dto_1.ImportFormat.MARKDOWN) {
                parsedData = this.rubricUtilsService.parseMarkdownTable(data);
            }
            else if (format === import_rubric_dto_1.ImportFormat.CSV) {
                parsedData = this.rubricUtilsService.parseCSVTable(data);
            }
            else {
                throw new common_1.BadRequestException('Formato de importación no soportado');
            }
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error al parsear los datos: ${error.message}`);
        }
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
    async importFromChatGPT(importDto, userId) {
        const teacher = await this.getTeacherByUserId(userId);
        let parsedData;
        try {
            if (importDto.format === import_rubric_dto_1.ImportFormat.MARKDOWN) {
                parsedData = this.rubricUtilsService.parseMarkdownTable(importDto.data);
            }
            else if (importDto.format === import_rubric_dto_1.ImportFormat.CSV) {
                parsedData = this.rubricUtilsService.parseCSVTable(importDto.data);
            }
            else {
                throw new common_1.BadRequestException('Formato de importación no soportado');
            }
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error al parsear los datos: ${error.message}`);
        }
        const createRubricDto = {
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
            cells: [],
        };
        const createdRubric = await this.create(createRubricDto, userId);
        return this.updateCellsContent(createdRubric.id, parsedData.cells);
    }
    async updateCellsContent(rubricId, parsedCells) {
        const rubric = await this.findOne(rubricId);
        const sortedCriteria = rubric.criteria.sort((a, b) => a.order - b.order);
        const sortedLevels = rubric.levels.sort((a, b) => a.order - b.order);
        for (let criterionIndex = 0; criterionIndex < sortedCriteria.length; criterionIndex++) {
            for (let levelIndex = 0; levelIndex < sortedLevels.length; levelIndex++) {
                const cellIndex = criterionIndex * sortedLevels.length + levelIndex;
                if (parsedCells[cellIndex]) {
                    const criterion = sortedCriteria[criterionIndex];
                    const level = sortedLevels[levelIndex];
                    const cell = rubric.cells.find(c => c.criterionId === criterion.id && c.levelId === level.id);
                    if (cell) {
                        await this.cellsRepository.update(cell.id, {
                            content: parsedCells[cellIndex].content
                        });
                    }
                }
            }
        }
        return this.findOne(rubricId);
    }
    async createAssessment(createDto) {
        const rubric = await this.findOne(createDto.rubricId);
        const rubricCriteriaIds = rubric.criteria.map(c => c.id);
        const assessedCriteriaIds = createDto.criterionAssessments.map(ca => ca.criterionId);
        if (rubricCriteriaIds.length !== assessedCriteriaIds.length ||
            !rubricCriteriaIds.every(id => assessedCriteriaIds.includes(id))) {
            throw new common_1.BadRequestException('Debe evaluar todos los criterios de la rúbrica');
        }
        const assessment = this.assessmentsRepository.create({
            activityAssessmentId: createDto.activityAssessmentId,
            rubricId: createDto.rubricId,
            studentId: createDto.studentId,
            comments: createDto.comments,
            totalScore: 0,
            maxPossibleScore: 0,
            percentage: 0,
            isComplete: true,
        });
        const savedAssessment = await this.assessmentsRepository.save(assessment);
        const criterionAssessments = [];
        for (const criterionDto of createDto.criterionAssessments) {
            const criterion = rubric.criteria.find(c => c.id === criterionDto.criterionId);
            const level = rubric.levels.find(l => l.id === criterionDto.levelId);
            const cell = rubric.cells.find(c => c.id === criterionDto.cellId);
            if (!criterion || !level || !cell) {
                throw new common_1.BadRequestException('Criterio, nivel o celda no válidos');
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
        const scoreCalculation = this.rubricUtilsService.calculateRubricScore(criterionAssessments.map(ca => ({
            criterion: rubric.criteria.find(c => c.id === ca.criterionId),
            selectedLevel: rubric.levels.find(l => l.id === ca.levelId),
        })), rubric.maxScore);
        await this.assessmentsRepository.update(savedAssessment.id, {
            totalScore: scoreCalculation.totalScore,
            maxPossibleScore: scoreCalculation.maxPossibleScore,
            percentage: scoreCalculation.percentage,
        });
        return this.getAssessment(savedAssessment.id);
    }
    async getAssessment(id) {
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
            throw new common_1.NotFoundException('Evaluación con rúbrica no encontrada');
        }
        return assessment;
    }
    async getTeacherByUserId(userId) {
        const teacher = await this.teachersRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user']
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Profesor no encontrado para este usuario');
        }
        return teacher;
    }
    async verifyTeacherSubjectAssignmentAccess(teacherId, subjectAssignmentId) {
        const assignment = await this.subjectAssignmentsRepository.findOne({
            where: { id: subjectAssignmentId, teacher: { id: teacherId } },
        });
        if (!assignment) {
            throw new common_1.ForbiddenException('No tienes acceso a esta asignación de asignatura');
        }
    }
    async shareRubric(rubricId, teacherIds, userId) {
        const teacher = await this.getTeacherByUserId(userId);
        const rubric = await this.rubricsRepository.findOne({
            where: { id: rubricId, teacherId: teacher.id },
            relations: ['teacher']
        });
        if (!rubric) {
            throw new common_1.NotFoundException('Rúbrica no encontrada o no tienes permisos para compartirla');
        }
        const targetTeachers = await this.teachersRepository.findBy({
            id: (0, typeorm_2.In)(teacherIds)
        });
        if (targetTeachers.length !== teacherIds.length) {
            throw new common_1.BadRequestException('Algunos profesores especificados no existen');
        }
        const currentSharedWith = rubric.sharedWith || [];
        const newSharedWith = [...new Set([...currentSharedWith, ...teacherIds])];
        rubric.sharedWith = newSharedWith;
        return await this.rubricsRepository.save(rubric);
    }
    async unshareRubric(rubricId, teacherIds, userId) {
        const teacher = await this.getTeacherByUserId(userId);
        const rubric = await this.rubricsRepository.findOne({
            where: { id: rubricId, teacherId: teacher.id },
        });
        if (!rubric) {
            throw new common_1.NotFoundException('Rúbrica no encontrada o no tienes permisos para modificarla');
        }
        const currentSharedWith = rubric.sharedWith || [];
        rubric.sharedWith = currentSharedWith.filter(id => !teacherIds.includes(id));
        return await this.rubricsRepository.save(rubric);
    }
    async getColleagues(userId) {
        const teacher = await this.getTeacherByUserId(userId);
        const colleagues = await this.teachersRepository.find({
            where: { id: (0, typeorm_2.Not)(teacher.id) },
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
    async getSharedWithMe(userId) {
        try {
            console.log('[DEBUG] getSharedWithMe - userId:', userId);
            const teacher = await this.getTeacherByUserId(userId);
            console.log('[DEBUG] getSharedWithMe - teacher found:', teacher.id);
            const sharedRubrics = await this.rubricsRepository.find({
                where: {
                    isActive: true,
                    sharedWith: (0, typeorm_2.ArrayContains)([teacher.id])
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
                sharedAt: rubric.updatedAt
            }));
        }
        catch (error) {
            console.error('[ERROR] getSharedWithMe:', error);
            throw error;
        }
    }
};
exports.RubricsService = RubricsService;
exports.RubricsService = RubricsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(rubric_entity_1.Rubric)),
    __param(1, (0, typeorm_1.InjectRepository)(rubric_criterion_entity_1.RubricCriterion)),
    __param(2, (0, typeorm_1.InjectRepository)(rubric_level_entity_1.RubricLevel)),
    __param(3, (0, typeorm_1.InjectRepository)(rubric_cell_entity_1.RubricCell)),
    __param(4, (0, typeorm_1.InjectRepository)(rubric_assessment_entity_1.RubricAssessment)),
    __param(5, (0, typeorm_1.InjectRepository)(rubric_assessment_criterion_entity_1.RubricAssessmentCriterion)),
    __param(6, (0, typeorm_1.InjectRepository)(teacher_entity_1.Teacher)),
    __param(7, (0, typeorm_1.InjectRepository)(subject_assignment_entity_1.SubjectAssignment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        rubric_utils_service_1.RubricUtilsService])
], RubricsService);
//# sourceMappingURL=rubrics.service.js.map