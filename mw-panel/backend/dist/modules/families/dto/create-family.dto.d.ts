import { FamilyRelationship } from '../../users/entities/family.entity';
export declare class FamilyContactDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    documentNumber?: string;
    phone: string;
    address?: string;
    occupation?: string;
}
export declare class FamilyStudentRelationDto {
    studentId: string;
    relationship: FamilyRelationship;
}
export declare class CreateFamilyDto {
    primaryContact: FamilyContactDto;
    secondaryContact?: FamilyContactDto;
    students: FamilyStudentRelationDto[];
    notes?: string;
}
