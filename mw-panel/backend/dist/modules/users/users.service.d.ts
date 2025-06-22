import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersService {
    private usersRepository;
    private userProfileRepository;
    constructor(usersRepository: Repository<User>, userProfileRepository: Repository<UserProfile>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(page?: number, limit?: number, role?: UserRole, search?: string): Promise<{
        users: User[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<User>;
    remove(id: string): Promise<void>;
    restore(id: string): Promise<User>;
    getStats(): Promise<{
        total: number;
        byRole: Record<UserRole, number>;
        activeUsers: number;
        inactiveUsers: number;
    }>;
    getUsersByRole(role: UserRole): Promise<User[]>;
}
