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
exports.EvaluationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const evaluation_entity_1 = require("./entities/evaluation.entity");
const competency_evaluation_entity_1 = require("./entities/competency-evaluation.entity");
const evaluation_period_entity_1 = require("./entities/evaluation-period.entity");
const radar_evaluation_entity_1 = require("./entities/radar-evaluation.entity");
const student_entity_1 = require("../students/entities/student.entity");
const teacher_entity_1 = require("../teachers/entities/teacher.entity");
const subject_entity_1 = require("../students/entities/subject.entity");
const academic_year_entity_1 = require("../students/entities/academic-year.entity");
const competency_entity_1 = require("../competencies/entities/competency.entity");
let EvaluationsService = class EvaluationsService {
    constructor(evaluationsRepository, competencyEvaluationsRepository, evaluationPeriodsRepository, radarEvaluationsRepository, studentsRepository, teachersRepository, subjectsRepository, academicYearsRepository, competenciesRepository) {
        this.evaluationsRepository = evaluationsRepository;
        this.competencyEvaluationsRepository = competencyEvaluationsRepository;
        this.evaluationPeriodsRepository = evaluationPeriodsRepository;
        this.radarEvaluationsRepository = radarEvaluationsRepository;
        this.studentsRepository = studentsRepository;
        this.teachersRepository = teachersRepository;
        this.subjectsRepository = subjectsRepository;
        this.academicYearsRepository = academicYearsRepository;
        this.competenciesRepository = competenciesRepository;
    }
    async findAll() {
        return this.evaluationsRepository.find({
            relations: [
                'student',
                'student.user',
                'student.user.profile',
                'teacher',
                'teacher.user',
                'teacher.user.profile',
                'subject',
                'period',
                'competencyEvaluations',
                'competencyEvaluations.competency'
            ],
            order: { createdAt: 'DESC' }
        });
    }
    async findOne(id) {
        const evaluation = await this.evaluationsRepository.findOne({
            where: { id },
            relations: [
                'student',
                'student.user',
                'student.user.profile',
                'teacher',
                'teacher.user',
                'teacher.user.profile',
                'subject',
                'period',
                'competencyEvaluations',
                'competencyEvaluations.competency'
            ],
        });
        if (!evaluation) {
            throw new common_1.NotFoundException(`Evaluación con ID ${id} no encontrada`);
        }
        return evaluation;
    }
    async findByStudent(studentId) {
        return this.evaluationsRepository.find({
            where: { student: { id: studentId } },
            relations: [
                'student',
                'student.user',
                'student.user.profile',
                'teacher',
                'teacher.user',
                'teacher.user.profile',
                'subject',
                'period',
                'competencyEvaluations',
                'competencyEvaluations.competency'
            ],
            order: { createdAt: 'DESC' }
        });
    }
    async findByTeacher(teacherId) {
        return this.evaluationsRepository.find({
            where: { teacher: { id: teacherId } },
            relations: [
                'student',
                'student.user',
                'student.user.profile',
                'teacher',
                'teacher.user',
                'teacher.user.profile',
                'subject',
                'period',
                'competencyEvaluations',
                'competencyEvaluations.competency'
            ],
            order: { createdAt: 'DESC' }
        });
    }
    async create(createEvaluationDto) {
        const student = await this.studentsRepository.findOne({
            where: { id: createEvaluationDto.studentId }
        });
        if (!student) {
            throw new common_1.NotFoundException(`Estudiante con ID ${createEvaluationDto.studentId} no encontrado`);
        }
        const teacher = await this.teachersRepository.findOne({
            where: { id: createEvaluationDto.teacherId }
        });
        if (!teacher) {
            throw new common_1.NotFoundException(`Profesor con ID ${createEvaluationDto.teacherId} no encontrado`);
        }
        const subject = await this.subjectsRepository.findOne({
            where: { id: createEvaluationDto.subjectId }
        });
        if (!subject) {
            throw new common_1.NotFoundException(`Asignatura con ID ${createEvaluationDto.subjectId} no encontrada`);
        }
        const period = await this.evaluationPeriodsRepository.findOne({
            where: { id: createEvaluationDto.periodId }
        });
        if (!period) {
            throw new common_1.NotFoundException(`Período con ID ${createEvaluationDto.periodId} no encontrado`);
        }
        const evaluation = this.evaluationsRepository.create({
            student,
            teacher,
            subject,
            period,
            generalObservations: createEvaluationDto.generalObservations,
            status: evaluation_entity_1.EvaluationStatus.DRAFT
        });
        const savedEvaluation = await this.evaluationsRepository.save(evaluation);
        for (const compEval of createEvaluationDto.competencyEvaluations) {
            const competency = await this.competenciesRepository.findOne({
                where: { id: compEval.competencyId }
            });
            if (!competency) {
                throw new common_1.NotFoundException(`Competencia con ID ${compEval.competencyId} no encontrada`);
            }
            const competencyEvaluation = this.competencyEvaluationsRepository.create({
                evaluation: savedEvaluation,
                competency,
                score: compEval.score,
                observations: compEval.observations
            });
            await this.competencyEvaluationsRepository.save(competencyEvaluation);
        }
        const avgScore = createEvaluationDto.competencyEvaluations.reduce((sum, comp) => sum + comp.score, 0) / createEvaluationDto.competencyEvaluations.length;
        savedEvaluation.overallScore = Math.round(avgScore * 100) / 100;
        await this.evaluationsRepository.save(savedEvaluation);
        return this.findOne(savedEvaluation.id);
    }
    async update(id, updateEvaluationDto) {
        const evaluation = await this.findOne(id);
        if (updateEvaluationDto.generalObservations !== undefined) {
            evaluation.generalObservations = updateEvaluationDto.generalObservations;
        }
        if (updateEvaluationDto.status !== undefined) {
            evaluation.status = updateEvaluationDto.status;
        }
        if (updateEvaluationDto.competencyEvaluations) {
            await this.competencyEvaluationsRepository.delete({ evaluation: { id } });
            for (const compEval of updateEvaluationDto.competencyEvaluations) {
                const competency = await this.competenciesRepository.findOne({
                    where: { id: compEval.competencyId }
                });
                if (!competency) {
                    throw new common_1.NotFoundException(`Competencia con ID ${compEval.competencyId} no encontrada`);
                }
                const competencyEvaluation = this.competencyEvaluationsRepository.create({
                    evaluation,
                    competency,
                    score: compEval.score,
                    observations: compEval.observations
                });
                await this.competencyEvaluationsRepository.save(competencyEvaluation);
            }
            const avgScore = updateEvaluationDto.competencyEvaluations.reduce((sum, comp) => sum + comp.score, 0) / updateEvaluationDto.competencyEvaluations.length;
            evaluation.overallScore = Math.round(avgScore * 100) / 100;
        }
        await this.evaluationsRepository.save(evaluation);
        return this.findOne(id);
    }
    async remove(id) {
        const evaluation = await this.findOne(id);
        await this.evaluationsRepository.remove(evaluation);
    }
    async generateRadarChart(studentId, periodId) {
        const evaluations = await this.evaluationsRepository.find({
            where: {
                student: { id: studentId },
                period: { id: periodId }
            },
            relations: ['competencyEvaluations', 'competencyEvaluations.competency', 'period']
        });
        if (evaluations.length === 0) {
            throw new common_1.NotFoundException(`No se encontraron evaluaciones para el estudiante en el período especificado`);
        }
        const student = await this.studentsRepository.findOne({
            where: { id: studentId }
        });
        const period = await this.evaluationPeriodsRepository.findOne({
            where: { id: periodId }
        });
        const competencyScores = new Map();
        evaluations.forEach(evaluation => {
            evaluation.competencyEvaluations.forEach(compEval => {
                const compId = compEval.competency.id;
                if (!competencyScores.has(compId)) {
                    competencyScores.set(compId, { scores: [], competency: compEval.competency });
                }
                competencyScores.get(compId).scores.push(compEval.score);
            });
        });
        const radarData = Array.from(competencyScores.entries()).map(([compId, data]) => {
            const avgScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
            return {
                code: data.competency.code,
                name: data.competency.name,
                score: Math.round(avgScore * 100) / 100,
                maxScore: 5,
            };
        });
        const overallScore = radarData.reduce((sum, comp) => sum + comp.score, 0) / radarData.length;
        await this.radarEvaluationsRepository.delete({
            student: { id: studentId },
            period: { id: periodId }
        });
        const radarEvaluation = this.radarEvaluationsRepository.create({
            student,
            period,
            data: {
                competencies: radarData,
                overallScore: Math.round(overallScore * 100) / 100,
                date: new Date()
            }
        });
        return this.radarEvaluationsRepository.save(radarEvaluation);
    }
    async getRadarChart(studentId, periodId) {
        const radar = await this.radarEvaluationsRepository.findOne({
            where: {
                student: { id: studentId },
                period: { id: periodId }
            },
            relations: ['student', 'student.user', 'student.user.profile', 'period']
        });
        if (!radar) {
            return this.generateRadarChart(studentId, periodId);
        }
        return radar;
    }
    async getAllPeriods() {
        return this.evaluationPeriodsRepository.find({
            relations: ['academicYear'],
            order: { startDate: 'ASC' }
        });
    }
    async getActivePeriod() {
        const period = await this.evaluationPeriodsRepository.findOne({
            where: { isActive: true },
            relations: ['academicYear']
        });
        if (!period) {
            throw new common_1.NotFoundException('No hay período de evaluación activo');
        }
        return period;
    }
    async createEvaluationPeriods() {
        const academicYear = await this.academicYearsRepository.findOne({
            where: { isCurrent: true }
        });
        if (!academicYear) {
            throw new common_1.NotFoundException('No hay año académico activo');
        }
        const existingPeriods = await this.evaluationPeriodsRepository.find({
            where: { academicYear: { id: academicYear.id } }
        });
        if (existingPeriods.length > 0) {
            return existingPeriods;
        }
        const periods = [
            {
                name: '1º Trimestre',
                type: evaluation_period_entity_1.PeriodType.TRIMESTER_1,
                startDate: new Date('2024-09-01'),
                endDate: new Date('2024-12-20'),
                isActive: true
            },
            {
                name: '2º Trimestre',
                type: evaluation_period_entity_1.PeriodType.TRIMESTER_2,
                startDate: new Date('2025-01-08'),
                endDate: new Date('2025-03-28'),
                isActive: false
            },
            {
                name: '3º Trimestre',
                type: evaluation_period_entity_1.PeriodType.TRIMESTER_3,
                startDate: new Date('2025-04-07'),
                endDate: new Date('2025-06-20'),
                isActive: false
            },
            {
                name: 'Evaluación Final',
                type: evaluation_period_entity_1.PeriodType.FINAL,
                startDate: new Date('2024-09-01'),
                endDate: new Date('2025-06-20'),
                isActive: false
            }
        ];
        const createdPeriods = [];
        for (const periodData of periods) {
            const period = this.evaluationPeriodsRepository.create({
                ...periodData,
                academicYear
            });
            const savedPeriod = await this.evaluationPeriodsRepository.save(period);
            createdPeriods.push(savedPeriod);
        }
        return createdPeriods;
    }
    async createTestData() {
        try {
            const periods = await this.createEvaluationPeriods();
            const allEducationalLevels = await this.academicYearsRepository.manager.find('EducationalLevel');
            console.log('Niveles educativos disponibles:', allEducationalLevels.map(level => ({ id: level.id, name: level.name, code: level.code })));
            const educationalLevel = allEducationalLevels.find(level => level.name.toLowerCase().includes('primaria') ||
                (level.code && level.code.toLowerCase() === 'primaria') ||
                level.name.toLowerCase() === 'educación primaria') || allEducationalLevels[0];
            if (!educationalLevel) {
                throw new common_1.NotFoundException(`No se encontró ningún nivel educativo. Disponibles: ${allEducationalLevels.map(l => l.name).join(', ')}`);
            }
            console.log('Usando nivel educativo:', { id: educationalLevel.id, name: educationalLevel.name });
            const competenciesData = [
                {
                    code: 'CCL',
                    name: 'Competencia en comunicación lingüística',
                    description: 'Habilidad para expresar e interpretar conceptos, pensamientos, sentimientos, hechos y opiniones de forma oral y escrita',
                    educationalLevel
                },
                {
                    code: 'CP',
                    name: 'Competencia plurilingüe',
                    description: 'Habilidad de utilizar distintas lenguas de forma apropiada y eficaz para el aprendizaje y la comunicación',
                    educationalLevel
                },
                {
                    code: 'STEM',
                    name: 'Competencia matemática y competencia en ciencia, tecnología e ingeniería',
                    description: 'Comprensión del mundo utilizando los métodos científicos, el pensamiento y representación matemáticos, la tecnología y los métodos de la ingeniería',
                    educationalLevel
                },
                {
                    code: 'CD',
                    name: 'Competencia digital',
                    description: 'Uso seguro, saludable, sostenible, crítico y responsable de las tecnologías digitales para el aprendizaje, el trabajo y la participación en la sociedad',
                    educationalLevel
                },
                {
                    code: 'CPSAA',
                    name: 'Competencia personal, social y de aprender a aprender',
                    description: 'Habilidad de reflexionar sobre uno mismo, colaborar con otros de forma constructiva, mantener la resiliencia y gestionar el aprendizaje a lo largo de la vida',
                    educationalLevel
                },
                {
                    code: 'CC',
                    name: 'Competencia ciudadana',
                    description: 'Habilidad de actuar como ciudadanos responsables y participar plenamente en la vida social y cívica',
                    educationalLevel
                },
                {
                    code: 'CE',
                    name: 'Competencia emprendedora',
                    description: 'Habilidad de actuar sobre oportunidades e ideas, transformándolas en valores para otros',
                    educationalLevel
                },
                {
                    code: 'CCEC',
                    name: 'Competencia en conciencia y expresión culturales',
                    description: 'Comprensión y respeto de diferentes formas de expresión cultural, así como el desarrollo de las capacidades estéticas y creativas',
                    educationalLevel
                }
            ];
            const createdCompetencies = [];
            for (const compData of competenciesData) {
                const existingCompetency = await this.competenciesRepository.findOne({
                    where: {
                        code: compData.code,
                        educationalLevel: { id: educationalLevel.id }
                    }
                });
                if (!existingCompetency) {
                    const competency = this.competenciesRepository.create(compData);
                    const saved = await this.competenciesRepository.save(competency);
                    createdCompetencies.push(saved);
                    console.log(`✓ Competencia creada: ${compData.code} - ${compData.name}`);
                }
                else {
                    createdCompetencies.push(existingCompetency);
                    console.log(`→ Competencia ya existe: ${compData.code} - ${compData.name}`);
                }
            }
            const students = await this.studentsRepository.find({
                relations: ['user', 'user.profile'],
                take: 3
            });
            const teachers = await this.teachersRepository.find({
                relations: ['user', 'user.profile'],
                take: 2
            });
            const subjects = await this.subjectsRepository.find({
                take: 3
            });
            const activePeriod = periods.find(p => p.isActive) || periods[0];
            const createdEvaluations = [];
            let evaluationCount = 0;
            for (const student of students) {
                for (const subject of subjects) {
                    for (const teacher of teachers) {
                        if (evaluationCount >= 6)
                            break;
                        const competencyEvaluations = createdCompetencies.slice(0, 4).map(comp => ({
                            competencyId: comp.id,
                            score: Math.floor(Math.random() * 3) + 3,
                            observations: `Observaciones de ${comp.name} para ${student.user.profile.firstName}`
                        }));
                        const evaluationDto = {
                            studentId: student.id,
                            teacherId: teacher.id,
                            subjectId: subject.id,
                            periodId: activePeriod.id,
                            generalObservations: `Evaluación de prueba para ${student.user.profile.firstName} ${student.user.profile.lastName} en ${subject.name}`,
                            competencyEvaluations
                        };
                        try {
                            const evaluation = await this.create(evaluationDto);
                            createdEvaluations.push(evaluation);
                            evaluationCount++;
                        }
                        catch (error) {
                            console.log(`Error creando evaluación: ${error.message}`);
                        }
                    }
                }
            }
            return {
                message: 'Datos de prueba creados exitosamente',
                data: {
                    periodsCreated: periods.length,
                    competenciesCreated: createdCompetencies.length,
                    evaluationsCreated: createdEvaluations.length,
                    studentsWithEvaluations: students.length,
                    teachersUsed: teachers.length,
                    subjectsUsed: subjects.length
                }
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error creando datos de prueba: ${error.message}`);
        }
    }
    async getEvaluationStats() {
        try {
            const [totalEvaluations, draftEvaluations, submittedEvaluations, reviewedEvaluations, finalizedEvaluations] = await Promise.all([
                this.evaluationsRepository.count(),
                this.evaluationsRepository.count({ where: { status: evaluation_entity_1.EvaluationStatus.DRAFT } }),
                this.evaluationsRepository.count({ where: { status: evaluation_entity_1.EvaluationStatus.SUBMITTED } }),
                this.evaluationsRepository.count({ where: { status: evaluation_entity_1.EvaluationStatus.REVIEWED } }),
                this.evaluationsRepository.count({ where: { status: evaluation_entity_1.EvaluationStatus.FINALIZED } })
            ]);
            const evaluationsWithScores = await this.evaluationsRepository.find({
                where: { status: evaluation_entity_1.EvaluationStatus.FINALIZED },
                select: ['overallScore']
            });
            const averageScore = evaluationsWithScores.length > 0
                ? evaluationsWithScores.reduce((sum, evaluation) => sum + (evaluation.overallScore || 0), 0) / evaluationsWithScores.length
                : 0;
            const completionRate = totalEvaluations > 0
                ? (finalizedEvaluations / totalEvaluations) * 100
                : 0;
            return {
                total: totalEvaluations,
                completed: finalizedEvaluations,
                pending: submittedEvaluations + reviewedEvaluations,
                overdue: draftEvaluations,
                averageScore: Math.round(averageScore * 10) / 10,
                completionRate: Math.round(completionRate * 10) / 10
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error obteniendo estadísticas: ${error.message}`);
        }
    }
};
exports.EvaluationsService = EvaluationsService;
exports.EvaluationsService = EvaluationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(evaluation_entity_1.Evaluation)),
    __param(1, (0, typeorm_1.InjectRepository)(competency_evaluation_entity_1.CompetencyEvaluation)),
    __param(2, (0, typeorm_1.InjectRepository)(evaluation_period_entity_1.EvaluationPeriod)),
    __param(3, (0, typeorm_1.InjectRepository)(radar_evaluation_entity_1.RadarEvaluation)),
    __param(4, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(5, (0, typeorm_1.InjectRepository)(teacher_entity_1.Teacher)),
    __param(6, (0, typeorm_1.InjectRepository)(subject_entity_1.Subject)),
    __param(7, (0, typeorm_1.InjectRepository)(academic_year_entity_1.AcademicYear)),
    __param(8, (0, typeorm_1.InjectRepository)(competency_entity_1.Competency)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], EvaluationsService);
//# sourceMappingURL=evaluations.service.js.map