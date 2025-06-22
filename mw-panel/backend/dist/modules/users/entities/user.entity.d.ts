import { UserProfile } from './user-profile.entity';
export declare enum UserRole {
    ADMIN = "admin",
    TEACHER = "teacher",
    STUDENT = "student",
    FAMILY = "family"
}
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    isActive: boolean;
    lastLoginAt: Date;
    createdAt: Date;
    updatedAt: Date;
    profile: UserProfile;
    password: string;
    hashPassword(): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
}
