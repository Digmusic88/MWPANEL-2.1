"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedEvaluations = void 0;
const educational_level_entity_1 = require("../../modules/students/entities/educational-level.entity");
const academic_year_entity_1 = require("../../modules/students/entities/academic-year.entity");
const student_entity_1 = require("../../modules/students/entities/student.entity");
const teacher_entity_1 = require("../../modules/teachers/entities/teacher.entity");
const subject_entity_1 = require("../../modules/students/entities/subject.entity");
const competency_entity_1 = require("../../modules/competencies/entities/competency.entity");
const evaluation_period_entity_1 = require("../../modules/evaluations/entities/evaluation-period.entity");
const evaluation_entity_1 = require("../../modules/evaluations/entities/evaluation.entity");
const competency_evaluation_entity_1 = require("../../modules/evaluations/entities/competency-evaluation.entity");
const seedEvaluations = async (dataSource) => {
    const educationalLevelRepository = dataSource.getRepository(educational_level_entity_1.EducationalLevel);
    const academicYearRepository = dataSource.getRepository(academic_year_entity_1.AcademicYear);
    const competencyRepository = dataSource.getRepository(competency_entity_1.Competency);
    const evaluationPeriodRepository = dataSource.getRepository(evaluation_period_entity_1.EvaluationPeriod);
    const studentRepository = dataSource.getRepository(student_entity_1.Student);
    const teacherRepository = dataSource.getRepository(teacher_entity_1.Teacher);
    const subjectRepository = dataSource.getRepository(subject_entity_1.Subject);
    const evaluationRepository = dataSource.getRepository(evaluation_entity_1.Evaluation);
    const competencyEvaluationRepository = dataSource.getRepository(competency_evaluation_entity_1.CompetencyEvaluation);
    const academicYear = await academicYearRepository.findOne({
        where: { isCurrent: true }
    });
    if (!academicYear) {
        throw new Error('No hay año académico activo');
    }
    const existingPeriods = await evaluationPeriodRepository.find({
        where: { academicYear: { id: academicYear.id } }
    });
    let periods = [];
    if (existingPeriods.length === 0) {
        const periodsData = [
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
        for (const periodData of periodsData) {
            const period = evaluationPeriodRepository.create({
                ...periodData,
                academicYear
            });
            const savedPeriod = await evaluationPeriodRepository.save(period);
            periods.push(savedPeriod);
            console.log(`✓ Período de evaluación creado: ${periodData.name}`);
        }
    }
    else {
        periods = existingPeriods;
        console.log(`→ Períodos de evaluación ya existen (${existingPeriods.length})`);
    }
    const primaryEducation = await educationalLevelRepository.findOne({
        where: { name: 'Educación Primaria' }
    });
    if (!primaryEducation) {
        throw new Error('Nivel educativo "Educación Primaria" no encontrado');
    }
    const competenciesData = [
        {
            code: 'CCL',
            name: 'Competencia en comunicación lingüística',
            description: 'Habilidad para expresar e interpretar conceptos, pensamientos, sentimientos, hechos y opiniones de forma oral y escrita'
        },
        {
            code: 'CP',
            name: 'Competencia plurilingüe',
            description: 'Habilidad de utilizar distintas lenguas de forma apropiada y eficaz para el aprendizaje y la comunicación'
        },
        {
            code: 'STEM',
            name: 'Competencia matemática y competencia en ciencia, tecnología e ingeniería',
            description: 'Comprensión del mundo utilizando los métodos científicos, el pensamiento y representación matemáticos, la tecnología y los métodos de la ingeniería'
        },
        {
            code: 'CD',
            name: 'Competencia digital',
            description: 'Uso seguro, saludable, sostenible, crítico y responsable de las tecnologías digitales para el aprendizaje, el trabajo y la participación en la sociedad'
        },
        {
            code: 'CPSAA',
            name: 'Competencia personal, social y de aprender a aprender',
            description: 'Habilidad de reflexionar sobre uno mismo, colaborar con otros de forma constructiva, mantener la resiliencia y gestionar el aprendizaje a lo largo de la vida'
        },
        {
            code: 'CC',
            name: 'Competencia ciudadana',
            description: 'Habilidad de actuar como ciudadanos responsables y participar plenamente en la vida social y cívica'
        },
        {
            code: 'CE',
            name: 'Competencia emprendedora',
            description: 'Habilidad de actuar sobre oportunidades e ideas, transformándolas en valores para otros'
        },
        {
            code: 'CCEC',
            name: 'Competencia en conciencia y expresión culturales',
            description: 'Comprensión y respeto de diferentes formas de expresión cultural, así como el desarrollo de las capacidades estéticas y creativas'
        }
    ];
    const createdCompetencies = [];
    for (const compData of competenciesData) {
        let competency = await competencyRepository.findOne({
            where: { code: compData.code, educationalLevel: { id: primaryEducation.id } }
        });
        if (!competency) {
            competency = competencyRepository.create({
                ...compData,
                educationalLevel: primaryEducation
            });
            const saved = await competencyRepository.save(competency);
            createdCompetencies.push(saved);
            console.log(`✓ Competencia creada: ${compData.code} - ${compData.name}`);
        }
        else {
            createdCompetencies.push(competency);
        }
    }
    const students = await studentRepository.find({
        relations: ['user', 'user.profile'],
        take: 3
    });
    const teachers = await teacherRepository.find({
        relations: ['user', 'user.profile'],
        take: 2
    });
    const subjects = await subjectRepository.find({
        take: 3
    });
    if (students.length === 0) {
        console.log('→ No se encontraron estudiantes para crear evaluaciones de prueba');
        return;
    }
    if (teachers.length === 0) {
        console.log('→ No se encontraron profesores para crear evaluaciones de prueba');
        return;
    }
    if (subjects.length === 0) {
        console.log('→ No se encontraron asignaturas para crear evaluaciones de prueba');
        return;
    }
    const activePeriod = periods.find(p => p.isActive) || periods[0];
    let evaluationCount = 0;
    for (const student of students) {
        for (let i = 0; i < Math.min(subjects.length, 2); i++) {
            const subject = subjects[i];
            const teacher = teachers[i % teachers.length];
            const existingEvaluation = await evaluationRepository.findOne({
                where: {
                    student: { id: student.id },
                    teacher: { id: teacher.id },
                    subject: { id: subject.id },
                    period: { id: activePeriod.id }
                }
            });
            if (!existingEvaluation) {
                const evaluation = evaluationRepository.create({
                    student,
                    teacher,
                    subject,
                    period: activePeriod,
                    generalObservations: `Evaluación de prueba para ${student.user.profile.firstName} ${student.user.profile.lastName} en ${subject.name}`,
                    status: evaluation_entity_1.EvaluationStatus.FINALIZED
                });
                const savedEvaluation = await evaluationRepository.save(evaluation);
                const competencyScores = [];
                for (let j = 0; j < Math.min(createdCompetencies.length, 4); j++) {
                    const competency = createdCompetencies[j];
                    const score = Math.floor(Math.random() * 3) + 3;
                    const competencyEvaluation = competencyEvaluationRepository.create({
                        evaluation: savedEvaluation,
                        competency,
                        score,
                        observations: `Observaciones de ${competency.name} para ${student.user.profile.firstName}`
                    });
                    await competencyEvaluationRepository.save(competencyEvaluation);
                    competencyScores.push(score);
                }
                const avgScore = competencyScores.reduce((sum, score) => sum + score, 0) / competencyScores.length;
                savedEvaluation.overallScore = Math.round(avgScore * 100) / 100;
                await evaluationRepository.save(savedEvaluation);
                evaluationCount++;
                console.log(`✓ Evaluación creada: ${student.user.profile.firstName} - ${subject.name} - ${teacher.user.profile.firstName}`);
            }
        }
    }
    console.log(`✓ Sistema de evaluaciones inicializado exitosamente`);
    console.log(`  - Períodos de evaluación: ${periods.length}`);
    console.log(`  - Competencias de primaria: ${createdCompetencies.length}`);
    console.log(`  - Evaluaciones de prueba: ${evaluationCount}`);
};
exports.seedEvaluations = seedEvaluations;
//# sourceMappingURL=07-evaluations.seed.js.map