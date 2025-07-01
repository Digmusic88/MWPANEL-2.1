import { User } from './user.entity';
import { Student } from '../../students/entities/student.entity';
export declare enum FamilyRelationship {
    PARENT = "parent",
    GUARDIAN = "guardian",
    OTHER = "other"
}
export declare class Family {
    id: string;
    primaryContact: User;
    secondaryContact: User;
    createdAt: Date;
    updatedAt: Date;
}
export declare class FamilyStudent {
    id: string;
    familyId: string;
    family: Family;
    studentId: string;
    student: Student;
    relationship: FamilyRelationship;
}
