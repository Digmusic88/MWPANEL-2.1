export declare class BulkEnrollmentRowDto {
    studentFirstName: string;
    studentLastName: string;
    studentEmail: string;
    studentPassword: string;
    studentBirthDate: string;
    studentDocumentNumber?: string;
    studentPhone?: string;
    enrollmentNumber?: string;
    educationalLevelId: string;
    courseId?: string;
    primaryFirstName: string;
    primaryLastName: string;
    primaryEmail: string;
    primaryPassword: string;
    primaryPhone: string;
    primaryDocumentNumber?: string;
    primaryDateOfBirth?: string;
    primaryAddress?: string;
    primaryOccupation?: string;
    relationshipToPrimary: 'father' | 'mother' | 'guardian' | 'other';
    hasSecondaryContact?: boolean;
    secondaryFirstName?: string;
    secondaryLastName?: string;
    secondaryEmail?: string;
    secondaryPassword?: string;
    secondaryPhone?: string;
    secondaryDocumentNumber?: string;
    secondaryDateOfBirth?: string;
    secondaryAddress?: string;
    secondaryOccupation?: string;
    relationshipToSecondary?: 'father' | 'mother' | 'guardian' | 'other';
}
export interface BulkImportResult {
    totalRows: number;
    successfulImports: number;
    failedImports: number;
    errors: BulkImportError[];
    warnings: BulkImportWarning[];
    importedStudents: Array<{
        rowNumber: number;
        studentName: string;
        enrollmentNumber: string;
        familyId: string;
    }>;
}
export interface BulkImportError {
    rowNumber: number;
    field?: string;
    message: string;
    originalData: any;
}
export interface BulkImportWarning {
    rowNumber: number;
    field?: string;
    message: string;
    originalData: any;
}
