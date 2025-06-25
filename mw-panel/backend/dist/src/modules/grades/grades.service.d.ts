import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { TaskSubmission } from '../tasks/entities/task-submission.entity';
import { ActivityAssessment } from '../activities/entities/activity-assessment.entity';
import { Evaluation } from '../evaluations/entities/evaluation.entity';
import { SubjectAssignment } from '../students/entities/subject-assignment.entity';
import { ClassGroup } from '../students/entities/class-group.entity';
import { FamilyStudent } from '../users/entities/family.entity';
import { StudentGradesResponseDto, ClassGradesResponseDto } from './dto/student-grades.dto';
import { UserRole } from '../users/entities/user.entity';
export declare class GradesService {
    private studentRepository;
    private taskSubmissionRepository;
    private activityAssessmentRepository;
    private evaluationRepository;
    private subjectAssignmentRepository;
    private classGroupRepository;
    private familyStudentRepository;
    constructor(studentRepository: Repository<Student>, taskSubmissionRepository: Repository<TaskSubmission>, activityAssessmentRepository: Repository<ActivityAssessment>, evaluationRepository: Repository<Evaluation>, subjectAssignmentRepository: Repository<SubjectAssignment>, classGroupRepository: Repository<ClassGroup>, familyStudentRepository: Repository<FamilyStudent>);
    getStudentGrades(studentId: string, userId: string, userRole: UserRole): Promise<StudentGradesResponseDto>;
    getClassGrades(classGroupId: string, subjectId: string, teacherId: string): Promise<ClassGradesResponseDto>;
    private verifyStudentAccess;
    private getStudentSubjectAssignments;
    private calculateSubjectGrades;
    private calculateTaskAverage;
    private calculateActivityAverage;
    private calculateCompetencyAverage;
    private getRecentGradeDetails;
    private calculateStudentSummary;
    private calculateStudentSubjectGrade;
    private calculateClassStatistics;
    private getCurrentPeriod;
    getStudentByUserId(userId: string): Promise<Student>;
    getFamilyChildrenGrades(userId: string): Promise<StudentGradesResponseDto[]>;
    getTeacherClassesSummary(teacherId: string): Promise<{
        classGroup: {
            id: string;
            name: string;
        };
        subject: {
            id: string;
            name: string;
            code: string;
        };
        studentCount: number;
        classAverage: number;
    }[]>;
    getSchoolGradesOverview(filters: {
        levelId?: string;
        courseId?: string;
        classGroupId?: string;
    }): Promise<{
        overview: {
            classGroup: {
                id: string;
                name: string;
                level: string;
                course: string;
            };
            studentCount: number;
            classAverage: number;
            passingRate: number;
        }[];
        totals: {
            totalClasses: number;
            totalStudents: number;
            schoolAverage: number;
        };
    }>;
    exportStudentGrades(studentId: string, userId: string, userRole: UserRole, period?: string): Promise<{
        message: string;
        data: StudentGradesResponseDto;
    }>;
}
