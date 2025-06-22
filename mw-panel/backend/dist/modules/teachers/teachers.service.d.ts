import { Repository } from 'typeorm';
import { Teacher } from './entities/teacher.entity';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
export declare class TeachersService {
    private teachersRepository;
    private usersRepository;
    private profilesRepository;
    constructor(teachersRepository: Repository<Teacher>, usersRepository: Repository<User>, profilesRepository: Repository<UserProfile>);
    findAll(): Promise<Teacher[]>;
    findOne(id: string): Promise<Teacher>;
    create(createTeacherDto: CreateTeacherDto): Promise<Teacher>;
    update(id: string, updateTeacherDto: UpdateTeacherDto): Promise<Teacher>;
    remove(id: string): Promise<void>;
}
