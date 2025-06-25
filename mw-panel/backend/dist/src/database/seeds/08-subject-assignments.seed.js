"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSubjectAssignments = void 0;
const teacher_entity_1 = require("../../modules/teachers/entities/teacher.entity");
const subject_entity_1 = require("../../modules/students/entities/subject.entity");
const class_group_entity_1 = require("../../modules/students/entities/class-group.entity");
const academic_year_entity_1 = require("../../modules/students/entities/academic-year.entity");
const subject_assignment_entity_1 = require("../../modules/students/entities/subject-assignment.entity");
const seedSubjectAssignments = async (dataSource) => {
    const teacherRepository = dataSource.getRepository(teacher_entity_1.Teacher);
    const subjectRepository = dataSource.getRepository(subject_entity_1.Subject);
    const classGroupRepository = dataSource.getRepository(class_group_entity_1.ClassGroup);
    const academicYearRepository = dataSource.getRepository(academic_year_entity_1.AcademicYear);
    const subjectAssignmentRepository = dataSource.getRepository(subject_assignment_entity_1.SubjectAssignment);
    const academicYear = await academicYearRepository.findOne({
        where: { isCurrent: true }
    });
    if (!academicYear) {
        console.log('→ No hay año académico activo para crear asignaciones');
        return;
    }
    const teachers = await teacherRepository.find({
        relations: ['user', 'user.profile']
    });
    const classGroups = await classGroupRepository.find({
        relations: ['course', 'course.cycle', 'course.cycle.educationalLevel']
    });
    const subjects = await subjectRepository.find({
        relations: ['course', 'course.cycle', 'course.cycle.educationalLevel']
    });
    if (teachers.length === 0) {
        console.log('→ No hay profesores disponibles para crear asignaciones');
        return;
    }
    if (classGroups.length === 0) {
        console.log('→ No hay grupos de clase disponibles para crear asignaciones');
        return;
    }
    if (subjects.length === 0) {
        console.log('→ No hay asignaturas disponibles para crear asignaciones');
        return;
    }
    console.log(`→ Creando asignaciones para ${teachers.length} profesores, ${classGroups.length} grupos y ${subjects.length} asignaturas`);
    let assignmentsCreated = 0;
    const assignmentPlans = [
        {
            teacherEmail: 'maria.garcia@mwschool.es',
            assignments: [
                { subjectCode: 'MAT_3º Primaria', groupName: '3º A Primaria', weeklyHours: 4 },
                { subjectCode: 'CMNSC_3º Primaria', groupName: '3º A Primaria', weeklyHours: 3 },
                { subjectCode: 'MAT_4º Primaria', groupName: '4º A Primaria', weeklyHours: 4 },
            ]
        },
        {
            teacherEmail: 'ana.lopez@mwschool.es',
            assignments: [
                { subjectCode: 'LCL_3º Primaria', groupName: '3º A Primaria', weeklyHours: 5 },
                { subjectCode: 'LCL_4º Primaria', groupName: '4º A Primaria', weeklyHours: 5 },
                { subjectCode: 'LCL_5º Primaria', groupName: '5º A Primaria', weeklyHours: 5 },
            ]
        },
        {
            teacherEmail: 'carlos.ruiz@mwschool.es',
            assignments: [
                { subjectCode: 'EF_3º Primaria', groupName: '3º A Primaria', weeklyHours: 2 },
                { subjectCode: 'EF_4º Primaria', groupName: '4º A Primaria', weeklyHours: 2 },
                { subjectCode: 'EF_5º Primaria', groupName: '5º A Primaria', weeklyHours: 2 },
            ]
        },
        {
            teacherEmail: 'laura.martinez@mwschool.es',
            assignments: [
                { subjectCode: 'CMNSC_4º Primaria', groupName: '4º A Primaria', weeklyHours: 3 },
                { subjectCode: 'CMNSC_5º Primaria', groupName: '5º A Primaria', weeklyHours: 3 },
            ]
        },
        {
            teacherEmail: 'diego.fernandez@mwschool.es',
            assignments: [
                { subjectCode: 'ING_3º Primaria', groupName: '3º A Primaria', weeklyHours: 3 },
                { subjectCode: 'ING_4º Primaria', groupName: '4º A Primaria', weeklyHours: 3 },
                { subjectCode: 'EAR_3º Primaria', groupName: '3º A Primaria', weeklyHours: 2 },
                { subjectCode: 'EAR_4º Primaria', groupName: '4º A Primaria', weeklyHours: 2 },
            ]
        },
    ];
    for (const plan of assignmentPlans) {
        const teacher = teachers.find(t => t.user.email === plan.teacherEmail);
        if (!teacher) {
            console.log(`→ Profesor no encontrado: ${plan.teacherEmail}`);
            continue;
        }
        for (const assignment of plan.assignments) {
            const subject = subjects.find(s => s.code === assignment.subjectCode);
            if (!subject) {
                console.log(`→ Asignatura no encontrada: ${assignment.subjectCode}`);
                continue;
            }
            const classGroup = classGroups.find(g => g.name === assignment.groupName);
            if (!classGroup) {
                console.log(`→ Grupo no encontrado: ${assignment.groupName}`);
                continue;
            }
            const existingAssignment = await subjectAssignmentRepository.findOne({
                where: {
                    teacher: { id: teacher.id },
                    subject: { id: subject.id },
                    classGroup: { id: classGroup.id },
                    academicYear: { id: academicYear.id }
                }
            });
            if (!existingAssignment) {
                const subjectAssignment = subjectAssignmentRepository.create({
                    teacher,
                    subject,
                    classGroup,
                    academicYear,
                    weeklyHours: assignment.weeklyHours,
                    notes: `Asignación de ${subject.name} para ${classGroup.name} con ${teacher.user.profile.firstName} ${teacher.user.profile.lastName}`
                });
                await subjectAssignmentRepository.save(subjectAssignment);
                assignmentsCreated++;
                console.log(`✓ Asignación creada: ${teacher.user.profile.firstName} → ${subject.name} → ${classGroup.name} (${assignment.weeklyHours}h)`);
            }
            else {
                console.log(`→ Asignación ya existe: ${teacher.user.profile.firstName} → ${subject.name} → ${classGroup.name}`);
            }
        }
    }
    const religionSubjects = subjects.filter(s => s.code.startsWith('REL_'));
    const availableTeacher = teachers[0];
    for (const subject of religionSubjects) {
        for (const classGroup of classGroups.slice(0, 3)) {
            const existingAssignment = await subjectAssignmentRepository.findOne({
                where: {
                    teacher: { id: availableTeacher.id },
                    subject: { id: subject.id },
                    classGroup: { id: classGroup.id },
                    academicYear: { id: academicYear.id }
                }
            });
            if (!existingAssignment) {
                const subjectAssignment = subjectAssignmentRepository.create({
                    teacher: availableTeacher,
                    subject,
                    classGroup,
                    academicYear,
                    weeklyHours: 1,
                    notes: `Asignación complementaria de ${subject.name}`
                });
                await subjectAssignmentRepository.save(subjectAssignment);
                assignmentsCreated++;
                console.log(`✓ Asignación complementaria: ${availableTeacher.user.profile.firstName} → ${subject.name} → ${classGroup.name}`);
            }
        }
    }
    console.log(`✓ Sistema de asignaciones completado: ${assignmentsCreated} asignaciones creadas`);
};
exports.seedSubjectAssignments = seedSubjectAssignments;
//# sourceMappingURL=08-subject-assignments.seed.js.map