import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { TaskSubmission } from '../tasks/entities/task-submission.entity';
import { ActivityAssessment } from '../activities/entities/activity-assessment.entity';
import { CompetencyEvaluation } from '../evaluations/entities/competency-evaluation.entity';
import { Evaluation } from '../evaluations/entities/evaluation.entity';
import { SubjectAssignment } from '../students/entities/subject-assignment.entity';
import { ClassGroup } from '../students/entities/class-group.entity';
import { FamilyStudent } from '../users/entities/family.entity';
import { StudentGradesResponseDto, ClassGradesResponseDto, SubjectGradeDto, GradeDetailDto } from './dto/student-grades.dto';
import { UserRole } from '../users/entities/user.entity';
import * as dayjs from 'dayjs';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(TaskSubmission)
    private taskSubmissionRepository: Repository<TaskSubmission>,
    @InjectRepository(ActivityAssessment)
    private activityAssessmentRepository: Repository<ActivityAssessment>,
    @InjectRepository(Evaluation)
    private evaluationRepository: Repository<Evaluation>,
    @InjectRepository(SubjectAssignment)
    private subjectAssignmentRepository: Repository<SubjectAssignment>,
    @InjectRepository(ClassGroup)
    private classGroupRepository: Repository<ClassGroup>,
    @InjectRepository(FamilyStudent)
    private familyStudentRepository: Repository<FamilyStudent>,
  ) {}

  /**
   * Get all grades for a specific student
   */
  async getStudentGrades(
    studentId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<StudentGradesResponseDto> {
    // Verify access permissions
    await this.verifyStudentAccess(studentId, userId, userRole);

    // Get student with relations
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
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Get all subject assignments for student's class groups
    const subjectAssignments = await this.getStudentSubjectAssignments(student);

    // Get task submissions
    const taskSubmissions = await this.taskSubmissionRepository.find({
      where: { studentId },
      relations: ['task.subjectAssignment.subject', 'task'],
      order: { submittedAt: 'DESC' },
    });

    // Get activity assessments
    const activityAssessments = await this.activityAssessmentRepository.find({
      where: { studentId },
      relations: ['activity.subjectAssignment.subject', 'activity'],
      order: { assessedAt: 'DESC' },
    });

    // Get competency evaluations
    const evaluations = await this.evaluationRepository.find({
      where: { student: { id: studentId } },
      relations: ['competencyEvaluations.competency'],
      order: { createdAt: 'DESC' },
    });

    // Calculate grades by subject
    const subjectGrades = this.calculateSubjectGrades(
      subjectAssignments,
      taskSubmissions,
      activityAssessments,
      evaluations,
    );

    // Get recent grade details
    const recentGrades = this.getRecentGradeDetails(
      taskSubmissions,
      activityAssessments,
      evaluations,
    );

    // Calculate summary
    const summary = this.calculateStudentSummary(
      subjectGrades,
      taskSubmissions,
      activityAssessments,
    );

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

  /**
   * Get grades for all students in a class (teacher view)
   */
  async getClassGrades(
    classGroupId: string,
    subjectId: string,
    teacherId: string,
  ): Promise<ClassGradesResponseDto> {
    // Verify teacher assignment
    const subjectAssignment = await this.subjectAssignmentRepository.findOne({
      where: {
        classGroup: { id: classGroupId },
        subject: { id: subjectId },
        teacher: { id: teacherId },
      },
      relations: ['subject', 'classGroup'],
    });

    if (!subjectAssignment) {
      throw new ForbiddenException('No tienes asignada esta clase/asignatura');
    }

    // Get all students in the class
    const classGroup = await this.classGroupRepository.findOne({
      where: { id: classGroupId },
      relations: ['students.user.profile', 'students.educationalLevel', 'students.course'],
    });

    if (!classGroup) {
      throw new NotFoundException('Grupo de clase no encontrado');
    }

    // Calculate grades for each student
    const studentsWithGrades = await Promise.all(
      classGroup.students.map(async (student) => {
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

        const grades = this.calculateStudentSubjectGrade(
          taskSubmissions,
          activityAssessments,
        );

        return {
          id: student.id,
          enrollmentNumber: student.enrollmentNumber,
          firstName: student.user.profile.firstName,
          lastName: student.user.profile.lastName,
          grades,
        };
      }),
    );

    // Calculate class statistics
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

  /**
   * Private helper methods
   */
  private async verifyStudentAccess(
    studentId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    switch (userRole) {
      case UserRole.STUDENT:
        const student = await this.studentRepository.findOne({
          where: { id: studentId, user: { id: userId } },
        });
        if (!student) {
          throw new ForbiddenException('No tienes acceso a estas calificaciones');
        }
        break;

      case UserRole.FAMILY:
        const familyStudent = await this.familyStudentRepository
          .createQueryBuilder('familyStudent')
          .innerJoin('familyStudent.family', 'family')
          .innerJoin('family.primaryContact', 'primaryContact')
          .leftJoin('family.secondaryContact', 'secondaryContact')
          .where('familyStudent.studentId = :studentId', { studentId })
          .andWhere('(primaryContact.id = :userId OR secondaryContact.id = :userId)', { userId })
          .getOne();

        if (!familyStudent) {
          throw new ForbiddenException('No tienes acceso a estas calificaciones');
        }
        break;

      case UserRole.TEACHER:
        // Teachers can see grades for students in their classes
        const teacherStudent = await this.studentRepository
          .createQueryBuilder('student')
          .innerJoin('student.classGroups', 'classGroup')
          .innerJoin('classGroup.subjectAssignments', 'assignment')
          .where('student.id = :studentId', { studentId })
          .andWhere('assignment.teacherId = :userId', { userId })
          .getOne();

        if (!teacherStudent) {
          throw new ForbiddenException('No tienes acceso a estas calificaciones');
        }
        break;

      case UserRole.ADMIN:
        // Admins have full access
        break;

      default:
        throw new ForbiddenException('Rol no autorizado');
    }
  }

  private async getStudentSubjectAssignments(student: Student): Promise<SubjectAssignment[]> {
    const classGroupIds = student.classGroups.map(cg => cg.id);
    
    if (classGroupIds.length === 0) {
      return [];
    }

    return this.subjectAssignmentRepository.find({
      where: classGroupIds.map(id => ({ classGroup: { id } })),
      relations: ['subject', 'teacher.user.profile'],
    });
  }

  private calculateSubjectGrades(
    subjectAssignments: SubjectAssignment[],
    taskSubmissions: TaskSubmission[],
    activityAssessments: ActivityAssessment[],
    evaluations: Evaluation[],
  ): SubjectGradeDto[] {
    return subjectAssignments.map(assignment => {
      // Filter data for this subject
      const subjectTasks = taskSubmissions.filter(
        ts => ts.task.subjectAssignment?.subject?.id === assignment.subject.id
      );
      const subjectActivities = activityAssessments.filter(
        aa => aa.activity.subjectAssignment?.subject?.id === assignment.subject.id
      );

      // Calculate averages
      const taskAverage = this.calculateTaskAverage(subjectTasks);
      const activityAverage = this.calculateActivityAverage(subjectActivities);
      const competencyAverage = this.calculateCompetencyAverage(evaluations);

      // Calculate overall average with weights
      const averages = [taskAverage, activityAverage, competencyAverage].filter(a => a !== null);
      const overallAverage = averages.length > 0
        ? averages.reduce((sum, avg) => sum + avg, 0) / averages.length
        : 0;

      // Count tasks
      const gradedTasks = subjectTasks.filter(t => t.isGraded).length;
      const pendingTasks = subjectTasks.filter(t => !t.isGraded).length;

      // Find last update
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

  private calculateTaskAverage(tasks: TaskSubmission[]): number | null {
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

  private calculateActivityAverage(assessments: ActivityAssessment[]): number | null {
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

  private calculateCompetencyAverage(evaluations: Evaluation[]): number | null {
    if (evaluations.length === 0) {
      return null;
    }

    const totalScore = evaluations.reduce((sum, evaluation) => {
      return sum + (evaluation.overallScore || 0);
    }, 0);

    return totalScore / evaluations.length;
  }

  private getRecentGradeDetails(
    taskSubmissions: TaskSubmission[],
    activityAssessments: ActivityAssessment[],
    evaluations: Evaluation[],
  ): GradeDetailDto[] {
    const details: GradeDetailDto[] = [];

    // Add graded tasks
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
          weight: 1, // Default weight since Task entity doesn't have weight property
          gradedAt: ts.gradedAt,
          feedback: ts.teacherFeedback,
          subject: ts.task.subjectAssignment?.subject ? {
            id: ts.task.subjectAssignment.subject.id,
            name: ts.task.subjectAssignment.subject.name,
            code: ts.task.subjectAssignment.subject.code,
          } : null,
        });
      });

    // Add activity assessments with numeric scores
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

    // Sort by date and return most recent
    return details
      .sort((a, b) => b.gradedAt.getTime() - a.gradedAt.getTime())
      .slice(0, 10);
  }

  private calculateStudentSummary(
    subjectGrades: SubjectGradeDto[],
    taskSubmissions: TaskSubmission[],
    activityAssessments: ActivityAssessment[],
  ) {
    const gradesWithAverage = subjectGrades.filter(sg => sg.averageGrade > 0);
    const overallAverage = gradesWithAverage.length > 0
      ? gradesWithAverage.reduce((sum, sg) => sum + sg.averageGrade, 0) / gradesWithAverage.length
      : 0;

    const totalGradedItems = 
      taskSubmissions.filter(ts => ts.isGraded).length +
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

  private calculateStudentSubjectGrade(
    taskSubmissions: TaskSubmission[],
    activityAssessments: ActivityAssessment[],
  ) {
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

  private calculateClassStatistics(studentsWithGrades: any[]) {
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

  private getCurrentPeriod(): string {
    const month = dayjs().month();
    if (month >= 8 || month <= 0) return 'Primer Trimestre';
    if (month >= 1 && month <= 3) return 'Segundo Trimestre';
    return 'Tercer Trimestre';
  }

  /**
   * Get student by user ID
   */
  async getStudentByUserId(userId: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return student;
  }

  /**
   * Get grades for all children of a family
   */
  async getFamilyChildrenGrades(userId: string): Promise<StudentGradesResponseDto[]> {
    // Get all students related to this family
    const familyStudents = await this.familyStudentRepository.find({
      where: [
        { family: { primaryContact: { id: userId } } },
        { family: { secondaryContact: { id: userId } } },
      ],
      relations: ['student'],
    });

    const grades = await Promise.all(
      familyStudents.map(fs => 
        this.getStudentGrades(fs.studentId, userId, UserRole.FAMILY)
      )
    );

    return grades;
  }

  /**
   * Get teacher classes summary
   */
  async getTeacherClassesSummary(teacherId: string) {
    const assignments = await this.subjectAssignmentRepository.find({
      where: { teacherId },
      relations: ['subject', 'classGroup.students'],
    });

    const summary = await Promise.all(
      assignments.map(async (assignment) => {
        const students = assignment.classGroup.students || [];
        
        // Calculate average for this class/subject
        const grades = await Promise.all(
          students.map(async (student) => {
            const taskSubmissions = await this.taskSubmissionRepository.find({
              where: {
                studentId: student.id,
                task: { subjectAssignmentId: assignment.id },
              },
            });

            const taskAvg = this.calculateTaskAverage(taskSubmissions);
            return taskAvg || 0;
          })
        );

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
      })
    );

    return summary;
  }

  /**
   * Get school-wide grades overview
   */
  async getSchoolGradesOverview(filters: {
    levelId?: string;
    courseId?: string;
    classGroupId?: string;
  }) {
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

    const overview = await Promise.all(
      classGroups.map(async (classGroup) => {
        const students = classGroup.students || [];
        
        // Get average grades for all students in this class
        const studentGrades = await Promise.all(
          students.map(async (student) => {
            const summary = await this.getStudentGrades(
              student.id,
              student.id, // Using student ID as a placeholder for admin access
              UserRole.ADMIN,
            );
            return summary.summary.overallAverage;
          })
        );

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
      })
    );

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

  /**
   * Export student grades as PDF (placeholder - needs implementation)
   */
  async exportStudentGrades(
    studentId: string,
    userId: string,
    userRole: UserRole,
    period?: string,
  ) {
    // Verify access
    await this.verifyStudentAccess(studentId, userId, userRole);

    // Get student grades
    const grades = await this.getStudentGrades(studentId, userId, userRole);

    // TODO: Implement PDF generation using existing ReportGeneratorService
    // For now, return the grades data
    return {
      message: 'PDF export functionality pending implementation',
      data: grades,
    };
  }
}