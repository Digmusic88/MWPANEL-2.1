import { UserRole } from '../../users/entities/user.entity';
export declare class RegisterDto {
    email: string;
    password: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    phone?: string;
    dni?: string;
}
