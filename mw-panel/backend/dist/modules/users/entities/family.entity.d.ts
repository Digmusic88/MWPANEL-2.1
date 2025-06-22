import { User } from './user.entity';
import { Student } from '../../students/entities/student.entity';
export declare enum FamilyRelationship {
    FATHER = "father",
    MOTHER = "mother",
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
    family: Family;
    student: Student;
    relationship: FamilyRelationship;
}
