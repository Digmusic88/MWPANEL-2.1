export declare class StudentDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    birthDate: string;
    documentNumber?: string;
    phone?: string;
    enrollmentNumber: string;
    educationalLevelId: string;
    courseId?: string;
    classGroupIds?: string[];
}
export declare class FamilyContactDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    documentNumber?: string;
    dateOfBirth?: string;
    address?: string;
    occupation?: string;
}
export declare class FamilyDto {
    existingFamilyId?: string;
    primaryContact?: FamilyContactDto;
    secondaryContact?: FamilyContactDto;
    relationship: string;
}
export declare class CreateEnrollmentDto {
    student: any;
    family: any;
}
