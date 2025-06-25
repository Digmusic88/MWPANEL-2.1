import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
export declare class StudentsService {
    private studentsRepository;
    private usersRepository;
    private userProfileRepository;
    constructor(studentsRepository: Repository<Student>, usersRepository: Repository<User>, userProfileRepository: Repository<UserProfile>);
    findAll(): Promise<Student[]>;
    findOne(id: string): Promise<Student>;
    findByUserId(userId: string): Promise<Student>;
    create(createStudentDto: any): Promise<Student>;
    update(id: string, updateStudentDto: any): Promise<Student>;
    changePassword(userId: string, changePasswordDto: any): Promise<{
        message: string;
    }>;
    remove(id: string): Promise<void>;
}
