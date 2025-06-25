export declare class SubjectGradeDto {
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    averageGrade: number;
    taskAverage?: number;
    activityAverage?: number;
    competencyAverage?: number;
    gradedTasks: number;
    pendingTasks: number;
    activityAssessments: number;
    lastUpdated: Date;
}
export declare class GradeDetailDto {
    id: string;
    type: 'task' | 'activity' | 'evaluation' | 'exam';
    title: string;
    grade: number;
    maxGrade: number;
    weight?: number;
    gradedAt: Date;
    feedback?: string;
    subject: {
        id: string;
        name: string;
        code: string;
    };
}
export declare class StudentGradesResponseDto {
    student: {
        id: string;
        enrollmentNumber: string;
        firstName: string;
        lastName: string;
        classGroup: {
            id: string;
            name: string;
        };
        educationalLevel: {
            id: string;
            name: string;
        };
    };
    summary: {
        overallAverage: number;
        totalSubjects: number;
        totalGradedItems: number;
        totalPendingTasks: number;
        lastActivityDate: Date;
    };
    subjectGrades: SubjectGradeDto[];
    recentGrades: GradeDetailDto[];
    academicPeriod: {
        current: string;
        year: string;
    };
}
export declare class ClassGradesResponseDto {
    classGroup: {
        id: string;
        name: string;
        level: string;
        course: string;
    };
    subject: {
        id: string;
        name: string;
        code: string;
    };
    students: Array<{
        id: string;
        enrollmentNumber: string;
        firstName: string;
        lastName: string;
        grades: {
            taskAverage: number;
            activityAverage: number;
            overallAverage: number;
            gradedTasks: number;
            pendingTasks: number;
            lastActivity: Date;
        };
    }>;
    statistics: {
        classAverage: number;
        highestGrade: number;
        lowestGrade: number;
        passingRate: number;
    };
}
