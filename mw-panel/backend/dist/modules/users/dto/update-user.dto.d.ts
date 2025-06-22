import { UserRole } from '../entities/user.entity';
export declare class UpdateUserDto {
    email?: string;
    role?: UserRole;
    isActive?: boolean;
}
