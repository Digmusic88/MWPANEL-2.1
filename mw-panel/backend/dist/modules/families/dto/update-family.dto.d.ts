import { FamilyRelationship } from '../../users/entities/family.entity';
export declare class UpdateFamilyContactDto {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    documentNumber?: string;
    phone?: string;
    address?: string;
    occupation?: string;
}
export declare class UpdateFamilyStudentRelationDto {
    studentId: string;
    relationship: FamilyRelationship;
}
export declare class UpdateFamilyDto {
    id?: string;
    primaryContact?: UpdateFamilyContactDto;
    secondaryContact?: UpdateFamilyContactDto;
    students?: UpdateFamilyStudentRelationDto[];
    notes?: string;
}
