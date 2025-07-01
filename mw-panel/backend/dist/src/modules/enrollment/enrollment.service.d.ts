import { Repository, DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { Student } from '../students/entities/student.entity';
import { Family, FamilyStudent } from '../users/entities/family.entity';
import { EnrollmentNumberService } from '../students/services/enrollment-number.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
export declare class EnrollmentService {
    private usersRepository;
    private profilesRepository;
    private studentsRepository;
    private familiesRepository;
    private familyStudentRepository;
    private dataSource;
    private enrollmentNumberService;
    constructor(usersRepository: Repository<User>, profilesRepository: Repository<UserProfile>, studentsRepository: Repository<Student>, familiesRepository: Repository<Family>, familyStudentRepository: Repository<FamilyStudent>, dataSource: DataSource, enrollmentNumberService: EnrollmentNumberService);
    processEnrollment(createEnrollmentDto: CreateEnrollmentDto): Promise<{
        message: string;
        student: {
            id: string;
            enrollmentNumber: string;
            user: {
                id: string;
                email: string;
            };
        };
        family: {
            id: string;
            primaryContact: string;
            secondaryContact: string;
        };
    }>;
    private createStudentUser;
    private createStudentRecord;
    private createNewFamily;
    private createFamilyContact;
    private linkStudentToFamily;
}
