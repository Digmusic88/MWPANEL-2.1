import { GradesService } from './grades.service';
import { StudentGradesResponseDto, ClassGradesResponseDto } from './dto/student-grades.dto';
export declare class GradesController {
    private readonly gradesService;
    constructor(gradesService: GradesService);
    getStudentGrades(studentId: string, req: any): Promise<StudentGradesResponseDto>;
    getMyGrades(req: any): Promise<StudentGradesResponseDto>;
    getFamilyChildrenGrades(req: any): Promise<StudentGradesResponseDto[]>;
    getFamilyChildGrades(studentId: string, req: any): Promise<StudentGradesResponseDto>;
    getClassGrades(classGroupId: string, subjectId: string, req: any): Promise<ClassGradesResponseDto>;
    getTeacherClassesSummary(req: any): Promise<{
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
    getSchoolGradesOverview(levelId?: string, courseId?: string, classGroupId?: string): Promise<{
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
    exportStudentGrades(studentId: string, period: string, req: any): Promise<{
        message: string;
        data: StudentGradesResponseDto;
    }>;
}
