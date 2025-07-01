import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User, UserRole } from './entities/user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(page: number, limit: number, role?: UserRole, search?: string): Promise<{
        users: User[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getStats(): Promise<{
        total: number;
        byRole: Record<UserRole, number>;
        activeUsers: number;
        inactiveUsers: number;
    }>;
    getUsersByRole(role: UserRole): Promise<User[]>;
    getMyProfile(user: User): Promise<User>;
    findOne(id: string): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    updateMyProfile(user: User, updateProfileDto: UpdateProfileDto): Promise<User>;
    updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<User>;
    remove(id: string): Promise<{
        message: string;
    }>;
    restore(id: string): Promise<User>;
}
