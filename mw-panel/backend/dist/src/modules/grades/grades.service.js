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
exports.GradesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_entity_1 = require("../students/entities/student.entity");
const task_submission_entity_1 = require("../tasks/entities/task-submission.entity");
const activity_assessment_entity_1 = require("../activities/entities/activity-assessment.entity");
const evaluation_entity_1 = require("../evaluations/entities/evaluation.entity");
const subject_assignment_entity_1 = require("../students/entities/subject-assignment.entity");
const class_group_entity_1 = require("../students/entities/class-group.entity");
const family_entity_1 = require("../users/entities/family.entity");
const user_entity_1 = require("../users/entities/user.entity");
const dayjs = require("dayjs");
let GradesService = class GradesService {
    constructor(studentRepository, taskSubmissionRepository, activityAssessmentRepository, evaluationRepository, subjectAssignmentRepository, classGroupRepository, familyStudentRepository) {
        this.studentRepository = studentRepository;
        this.taskSubmissionRepository = taskSubmissionRepository;
        this.activityAssessmentRepository = activityAssessmentRepository;
        this.evaluationRepository = evaluationRepository;
        this.subjectAssignmentRepository = subjectAssignmentRepository;
        this.classGroupRepository = classGroupRepository;
        this.familyStudentRepository = familyStudentRepository;
    }
    async getStudentGrades(studentId, userId, userRole) {
        await this.verifyStudentAccess(studentId, userId, userRole);
        const student = await this.studentRepository.findOne({
            where: { id: studentId },
            relations: [
                'user.profile',
                'classGroups',
                'educationalLevel',
                'course',
            ],
        });
        if (!student) {
            throw new common_1.NotFoundException('Estudiante no encontrado');
        }
        const subjectAssignments = await this.getStudentSubjectAssignments(student);
        const taskSubmissions = await this.taskSubmissionRepository.find({
            where: { studentId },
            relations: ['task.subjectAssignment.subject', 'task'],
            order: { submittedAt: 'DESC' },
        });
        const activityAssessments = await this.activityAssessmentRepository.find({
            where: { studentId },
            relations: ['activity.subjectAssignment.subject', 'activity'],
            order: { assessedAt: 'DESC' },
        });
        const evaluations = await this.evaluationRepository.find({
            where: { student: { id: studentId } },
            relations: ['competencyEvaluations.competency'],
            order: { createdAt: 'DESC' },
        });
        const subjectGrades = this.calculateSubjectGrades(subjectAssignments, taskSubmissions, activityAssessments, evaluations);
        const recentGrades = this.getRecentGradeDetails(taskSubmissions, activityAssessments, evaluations);
        const summary = this.calculateStudentSummary(subjectGrades, taskSubmissions, activityAssessments);
        return {
            student: {
                id: student.id,
                enrollmentNumber: student.enrollmentNumber,
                firstName: student.user.profile.firstName,
                lastName: student.user.profile.lastName,
                classGroup: student.classGroups[0] ? {
                    id: student.classGroups[0].id,
                    name: student.classGroups[0].name,
                } : null,
                educationalLevel: student.educationalLevel ? {
                    id: student.educationalLevel.id,
                    name: student.educationalLevel.name,
                } : null,
            },
            summary,
            subjectGrades,
            recentGrades,
            academicPeriod: {
                current: this.getCurrentPeriod(),
                year: dayjs().format('YYYY'),
            },
        };
    }
    async getClassGrades(classGroupId, subjectId, teacherId) {
        const subjectAssignment = await this.subjectAssignmentRepository.findOne({
            where: {
                classGroup: { id: classGroupId },
                subject: { id: subjectId },
                teacher: { id: teacherId },
            },
            relations: ['subject', 'classGroup'],
        });
        if (!subjectAssignment) {
            throw new common_1.ForbiddenException('No tienes asignada esta clase/asignatura');
        }
        const classGroup = await this.classGroupRepository.findOne({
            where: { id: classGroupId },
            relations: ['students.user.profile', 'students.educationalLevel', 'students.course'],
        });
        if (!classGroup) {
            throw new common_1.NotFoundException('Grupo de clase no encontrado');
        }
        const studentsWithGrades = await Promise.all(classGroup.students.map(async (student) => {
            const taskSubmissions = await this.taskSubmissionRepository.find({
                where: {
                    studentId: student.id,
                    task: { subjectAssignmentId: subjectAssignment.id },
                },
                relations: ['task'],
            });
            const activityAssessments = await this.activityAssessmentRepository.find({
                where: {
                    studentId: student.id,
                    activity: { subjectAssignmentId: subjectAssignment.id },
                },
                relations: ['activity'],
            });
            const grades = this.calculateStudentSubjectGrade(taskSubmissions, activityAssessments);
            return {
                id: student.id,
                enrollmentNumber: student.enrollmentNumber,
                firstName: student.user.profile.firstName,
                lastName: student.user.profile.lastName,
                grades,
            };
        }));
        const statistics = this.calculateClassStatistics(studentsWithGrades);
        return {
            classGroup: {
                id: classGroup.id,
                name: classGroup.name,
                level: classGroup.students[0]?.educationalLevel?.name || '',
                course: classGroup.students[0]?.course?.name || '',
            },
            subject: {
                id: subjectAssignment.subject.id,
                name: subjectAssignment.subject.name,
                code: subjectAssignment.subject.code,
            },
            students: studentsWithGrades,
            statistics,
        };
    }
    async verifyStudentAccess(studentId, userId, userRole) {
        switch (userRole) {
            case user_entity_1.UserRole.STUDENT:
                const student = await this.studentRepository.findOne({
                    where: { id: studentId, user: { id: userId } },
                });
                if (!student) {
                    throw new common_1.ForbiddenException('No tienes acceso a estas calificaciones');
                }
                break;
            case user_entity_1.UserRole.FAMILY:
                const familyStudent = await this.familyStudentRepository
                    .createQueryBuilder('familyStudent')
                    .innerJoin('familyStudent.family', 'family')
                    .innerJoin('family.primaryContact', 'primaryContact')
                    .leftJoin('family.secondaryContact', 'secondaryContact')
                    .where('familyStudent.studentId = :studentId', { studentId })
                    .andWhere('(primaryContact.id = :userId OR secondaryContact.id = :userId)', { userId })
                    .getOne();
                if (!familyStudent) {
                    throw new common_1.ForbiddenException('No tienes acceso a estas calificaciones');
                }
                break;
            case user_entity_1.UserRole.TEACHER:
                const teacherStudent = await this.studentRepository
                    .createQueryBuilder('student')
                    .innerJoin('student.classGroups', 'classGroup')
                    .innerJoin('classGroup.subjectAssignments', 'assignment')
                    .where('student.id = :studentId', { studentId })
                    .andWhere('assignment.teacherId = :userId', { userId })
                    .getOne();
                if (!teacherStudent) {
                    throw new common_1.ForbiddenException('No tienes acceso a estas calificaciones');
                }
                break;
            case user_entity_1.UserRole.ADMIN:
                break;
            default:
                throw new common_1.ForbiddenException('Rol no autorizado');
        }
    }
    async getStudentSubjectAssignments(student) {
        const classGroupIds = student.classGroups.map(cg => cg.id);
        if (classGroupIds.length === 0) {
            return [];
        }
        return this.subjectAssignmentRepository.find({
            where: classGroupIds.map(id => ({ classGroup: { id } })),
            relations: ['subject', 'teacher.user.profile'],
        });
    }
    calculateSubjectGrades(subjectAssignments, taskSubmissions, activityAssessments, evaluations) {
        return subjectAssignments.map(assignment => {
            const subjectTasks = taskSubmissions.filter(ts => ts.task.subjectAssignment?.subject?.id === assignment.subject.id);
            const subjectActivities = activityAssessments.filter(aa => aa.activity.subjectAssignment?.subject?.id === assignment.subject.id);
            const taskAverage = this.calculateTaskAverage(subjectTasks);
            const activityAverage = this.calculateActivityAverage(subjectActivities);
            const competencyAverage = this.calculateCompetencyAverage(evaluations);
            const averages = [taskAverage, activityAverage, competencyAverage].filter(a => a !== null);
            const overallAverage = averages.length > 0
                ? averages.reduce((sum, avg) => sum + avg, 0) / averages.length
                : 0;
            const gradedTasks = subjectTasks.filter(t => t.isGraded).length;
            const pendingTasks = subjectTasks.filter(t => !t.isGraded).length;
            const lastDates = [
                ...subjectTasks.filter(t => t.isGraded).map(t => t.gradedAt),
                ...subjectActivities.map(a => a.assessedAt),
            ].filter(d => d);
            const lastUpdated = lastDates.length > 0
                ? new Date(Math.max(...lastDates.map(d => d.getTime())))
                : new Date();
            return {
                subjectId: assignment.subject.id,
                subjectName: assignment.subject.name,
                subjectCode: assignment.subject.code,
                averageGrade: overallAverage,
                taskAverage,
                activityAverage,
                competencyAverage,
                gradedTasks,
                pendingTasks,
                activityAssessments: subjectActivities.length,
                lastUpdated,
            };
        });
    }
    calculateTaskAverage(tasks) {
        const gradedTasks = tasks.filter(t => t.isGraded && t.finalGrade !== null);
        if (gradedTasks.length === 0) {
            return null;
        }
        const totalGrade = gradedTasks.reduce((sum, task) => {
            const maxPoints = task.task.maxPoints || 10;
            const percentage = (task.finalGrade / maxPoints) * 10;
            return sum + percentage;
        }, 0);
        return totalGrade / gradedTasks.length;
    }
    calculateActivityAverage(assessments) {
        const numericAssessments = assessments.filter(a => {
            return a.activity.valuationType === 'score' && !isNaN(parseFloat(a.value));
        });
        if (numericAssessments.length === 0) {
            return null;
        }
        const totalScore = numericAssessments.reduce((sum, assessment) => {
            const score = parseFloat(assessment.value);
            const maxScore = assessment.activity.maxScore || 10;
            const percentage = (score / maxScore) * 10;
            return sum + percentage;
        }, 0);
        return totalScore / numericAssessments.length;
    }
    calculateCompetencyAverage(evaluations) {
        if (evaluations.length === 0) {
            return null;
        }
        const totalScore = evaluations.reduce((sum, evaluation) => {
            return sum + (evaluation.overallScore || 0);
        }, 0);
        return totalScore / evaluations.length;
    }
    getRecentGradeDetails(taskSubmissions, activityAssessments, evaluations) {
        const details = [];
        taskSubmissions
            .filter(ts => ts.isGraded && ts.finalGrade !== null)
            .slice(0, 5)
            .forEach(ts => {
            details.push({
                id: ts.id,
                type: 'task',
                title: ts.task.title,
                grade: ts.finalGrade,
                maxGrade: ts.task.maxPoints || 10,
                weight: 1,
                gradedAt: ts.gradedAt,
                feedback: ts.teacherFeedback,
                subject: ts.task.subjectAssignment?.subject ? {
                    id: ts.task.subjectAssignment.subject.id,
                    name: ts.task.subjectAssignment.subject.name,
                    code: ts.task.subjectAssignment.subject.code,
                } : null,
            });
        });
        activityAssessments
            .filter(aa => aa.activity.valuationType === 'score' && !isNaN(parseFloat(aa.value)))
            .slice(0, 5)
            .forEach(aa => {
            details.push({
                id: aa.id,
                type: 'activity',
                title: aa.activity.name,
                grade: parseFloat(aa.value),
                maxGrade: aa.activity.maxScore || 10,
                gradedAt: aa.assessedAt,
                feedback: aa.comment,
                subject: aa.activity.subjectAssignment?.subject ? {
                    id: aa.activity.subjectAssignment.subject.id,
                    name: aa.activity.subjectAssignment.subject.name,
                    code: aa.activity.subjectAssignment.subject.code,
                } : null,
            });
        });
        return details
            .sort((a, b) => b.gradedAt.getTime() - a.gradedAt.getTime())
            .slice(0, 10);
    }
    calculateStudentSummary(subjectGrades, taskSubmissions, activityAssessments) {
        const gradesWithAverage = subjectGrades.filter(sg => sg.averageGrade > 0);
        const overallAverage = gradesWithAverage.length > 0
            ? gradesWithAverage.reduce((sum, sg) => sum + sg.averageGrade, 0) / gradesWithAverage.length
            : 0;
        const totalGradedItems = taskSubmissions.filter(ts => ts.isGraded).length +
            activityAssessments.length;
        const totalPendingTasks = taskSubmissions.filter(ts => !ts.isGraded).length;
        const lastActivities = [
            ...taskSubmissions.filter(ts => ts.submittedAt).map(ts => ts.submittedAt),
            ...activityAssessments.map(aa => aa.assessedAt),
        ].filter(d => d);
        const lastActivityDate = lastActivities.length > 0
            ? new Date(Math.max(...lastActivities.map(d => d.getTime())))
            : null;
        return {
            overallAverage,
            totalSubjects: subjectGrades.length,
            totalGradedItems,
            totalPendingTasks,
            lastActivityDate,
        };
    }
    calculateStudentSubjectGrade(taskSubmissions, activityAssessments) {
        const taskAvg = this.calculateTaskAverage(taskSubmissions);
        const activityAvg = this.calculateActivityAverage(activityAssessments);
        const averages = [taskAvg, activityAvg].filter(a => a !== null);
        const overallAverage = averages.length > 0
            ? averages.reduce((sum, avg) => sum + avg, 0) / averages.length
            : 0;
        const lastDates = [
            ...taskSubmissions.filter(ts => ts.submittedAt).map(ts => ts.submittedAt),
            ...activityAssessments.map(aa => aa.assessedAt),
        ];
        const lastActivity = lastDates.length > 0
            ? new Date(Math.max(...lastDates.map(d => d.getTime())))
            : null;
        return {
            taskAverage: taskAvg || 0,
            activityAverage: activityAvg || 0,
            overallAverage,
            gradedTasks: taskSubmissions.filter(ts => ts.isGraded).length,
            pendingTasks: taskSubmissions.filter(ts => !ts.isGraded).length,
            lastActivity,
        };
    }
    calculateClassStatistics(studentsWithGrades) {
        const grades = studentsWithGrades.map(s => s.grades.overallAverage).filter(g => g > 0);
        if (grades.length === 0) {
            return {
                classAverage: 0,
                highestGrade: 0,
                lowestGrade: 0,
                passingRate: 0,
            };
        }
        const classAverage = grades.reduce((sum, g) => sum + g, 0) / grades.length;
        const highestGrade = Math.max(...grades);
        const lowestGrade = Math.min(...grades);
        const passingRate = (grades.filter(g => g >= 5).length / grades.length) * 100;
        return {
            classAverage,
            highestGrade,
            lowestGrade,
            passingRate,
        };
    }
    getCurrentPeriod() {
        const month = dayjs().month();
        if (month >= 8 || month <= 0)
            return 'Primer Trimestre';
        if (month >= 1 && month <= 3)
            return 'Segundo Trimestre';
        return 'Tercer Trimestre';
    }
    async getStudentByUserId(userId) {
        const student = await this.studentRepository.findOne({
            where: { user: { id: userId } },
        });
        if (!student) {
            throw new common_1.NotFoundException('Estudiante no encontrado');
        }
        return student;
    }
    async getFamilyChildrenGrades(userId) {
        const familyStudents = await this.familyStudentRepository.find({
            where: [
                { family: { primaryContact: { id: userId } } },
                { family: { secondaryContact: { id: userId } } },
            ],
            relations: ['student'],
        });
        const grades = await Promise.all(familyStudents.map(fs => this.getStudentGrades(fs.studentId, userId, user_entity_1.UserRole.FAMILY)));
        return grades;
    }
    async getTeacherClassesSummary(teacherId) {
        const assignments = await this.subjectAssignmentRepository.find({
            where: { teacherId },
            relations: ['subject', 'classGroup.students'],
        });
        const summary = await Promise.all(assignments.map(async (assignment) => {
            const students = assignment.classGroup.students || [];
            const grades = await Promise.all(students.map(async (student) => {
                const taskSubmissions = await this.taskSubmissionRepository.find({
                    where: {
                        studentId: student.id,
                        task: { subjectAssignmentId: assignment.id },
                    },
                });
                const taskAvg = this.calculateTaskAverage(taskSubmissions);
                return taskAvg || 0;
            }));
            const validGrades = grades.filter(g => g > 0);
            const classAverage = validGrades.length > 0
                ? validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length
                : 0;
            return {
                classGroup: {
                    id: assignment.classGroup.id,
                    name: assignment.classGroup.name,
                },
                subject: {
                    id: assignment.subject.id,
                    name: assignment.subject.name,
                    code: assignment.subject.code,
                },
                studentCount: students.length,
                classAverage,
            };
        }));
        return summary;
    }
    async getSchoolGradesOverview(filters) {
        let query = this.classGroupRepository
            .createQueryBuilder('classGroup')
            .leftJoinAndSelect('classGroup.students', 'students')
            .leftJoinAndSelect('students.educationalLevel', 'level')
            .leftJoinAndSelect('students.course', 'course');
        if (filters.levelId) {
            query = query.where('level.id = :levelId', { levelId: filters.levelId });
        }
        if (filters.courseId) {
            query = query.andWhere('course.id = :courseId', { courseId: filters.courseId });
        }
        if (filters.classGroupId) {
            query = query.andWhere('classGroup.id = :classGroupId', { classGroupId: filters.classGroupId });
        }
        const classGroups = await query.getMany();
        const overview = await Promise.all(classGroups.map(async (classGroup) => {
            const students = classGroup.students || [];
            const studentGrades = await Promise.all(students.map(async (student) => {
                const summary = await this.getStudentGrades(student.id, student.id, user_entity_1.UserRole.ADMIN);
                return summary.summary.overallAverage;
            }));
            const validGrades = studentGrades.filter(g => g > 0);
            const classAverage = validGrades.length > 0
                ? validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length
                : 0;
            return {
                classGroup: {
                    id: classGroup.id,
                    name: classGroup.name,
                    level: classGroup.students[0]?.educationalLevel?.name,
                    course: classGroup.students[0]?.course?.name,
                },
                studentCount: students.length,
                classAverage,
                passingRate: validGrades.length > 0
                    ? (validGrades.filter(g => g >= 5).length / validGrades.length) * 100
                    : 0,
            };
        }));
        return {
            overview,
            totals: {
                totalClasses: overview.length,
                totalStudents: overview.reduce((sum, o) => sum + o.studentCount, 0),
                schoolAverage: overview.length > 0
                    ? overview.reduce((sum, o) => sum + o.classAverage, 0) / overview.length
                    : 0,
            },
        };
    }
    async exportStudentGrades(studentId, userId, userRole, period) {
        await this.verifyStudentAccess(studentId, userId, userRole);
        const grades = await this.getStudentGrades(studentId, userId, userRole);
        return {
            message: 'PDF export functionality pending implementation',
            data: grades,
        };
    }
};
exports.GradesService = GradesService;
exports.GradesService = GradesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(1, (0, typeorm_1.InjectRepository)(task_submission_entity_1.TaskSubmission)),
    __param(2, (0, typeorm_1.InjectRepository)(activity_assessment_entity_1.ActivityAssessment)),
    __param(3, (0, typeorm_1.InjectRepository)(evaluation_entity_1.Evaluation)),
    __param(4, (0, typeorm_1.InjectRepository)(subject_assignment_entity_1.SubjectAssignment)),
    __param(5, (0, typeorm_1.InjectRepository)(class_group_entity_1.ClassGroup)),
    __param(6, (0, typeorm_1.InjectRepository)(family_entity_1.FamilyStudent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], GradesService);
//# sourceMappingURL=grades.service.js.map