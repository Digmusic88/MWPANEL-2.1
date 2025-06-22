import { User } from './user.entity';
export declare class UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    documentNumber: string;
    phone: string;
    address: string;
    avatarUrl: string;
    dni: string;
    education: string;
    hireDate: Date;
    department: string;
    position: string;
    guardianName: string;
    guardianPhone: string;
    emergencyContact: string;
    medicalInfo: string;
    user: User;
    createdAt: Date;
    updatedAt: Date;
    get fullName(): string;
}
