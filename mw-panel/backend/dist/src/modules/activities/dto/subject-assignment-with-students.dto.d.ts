export declare class SubjectAssignmentWithStudentsDto {
    id: string;
    subject: {
        id: string;
        name: string;
        code: string;
    };
    classGroup: {
        id: string;
        name: string;
    };
    academicYear: {
        id: string;
        name: string;
    };
    weeklyHours: number;
    students: Array<{
        id: string;
        enrollmentNumber: string;
        user: {
            profile: {
                firstName: string;
                lastName: string;
            };
        };
    }>;
}
