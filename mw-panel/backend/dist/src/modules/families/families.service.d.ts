import { Repository, DataSource } from 'typeorm';
import { Family, FamilyStudent } from '../users/entities/family.entity';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { Student } from '../students/entities/student.entity';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
export declare class FamiliesService {
    private familiesRepository;
    private familyStudentRepository;
    private usersRepository;
    private profilesRepository;
    private studentsRepository;
    private dataSource;
    constructor(familiesRepository: Repository<Family>, familyStudentRepository: Repository<FamilyStudent>, usersRepository: Repository<User>, profilesRepository: Repository<UserProfile>, studentsRepository: Repository<Student>, dataSource: DataSource);
    findAll(): Promise<Family[]>;
    findOne(id: string): Promise<Family>;
    create(createFamilyDto: CreateFamilyDto): Promise<Family>;
    update(id: string, updateFamilyDto: UpdateFamilyDto): Promise<Family>;
    remove(id: string): Promise<void>;
    getAvailableStudents(): Promise<Student[]>;
    getFamilyDashboard(userId: string): Promise<{
        family: {
            id: string;
            primaryContact: {
                id: string;
                profile: {
                    firstName: string;
                    lastName: string;
                };
            };
            secondaryContact: {
                id: string;
                profile: {
                    firstName: string;
                    lastName: string;
                };
            };
        };
        students: {
            id: string;
            enrollmentNumber: string;
            relationship: import("../users/entities/family.entity").FamilyRelationship;
            user: {
                profile: {
                    firstName: string;
                    lastName: string;
                };
            };
            educationalLevel: import("../students/entities/educational-level.entity").EducationalLevel;
            course: import("../students/entities/course.entity").Course;
            classGroups: import("../students/entities/class-group.entity").ClassGroup[];
            stats: {
                totalEvaluations: number;
                completedEvaluations: number;
                pendingEvaluations: number;
                averageGrade: number;
                attendance: number;
            };
            recentEvaluations: {
                id: string;
                period: import("../evaluations/entities/evaluation-period.entity").EvaluationPeriod;
                createdAt: Date;
                competencyEvaluations: {
                    competencyName: string;
                    score: number;
                    displayGrade: string;
                    observations: string;
                }[];
            }[];
        }[];
        summary: {
            totalStudents: number;
            averageGrade: number;
            totalPendingEvaluations: number;
            totalCompletedEvaluations: number;
        };
    }>;
    getMyChildren(userId: string): Promise<{
        id: string;
        enrollmentNumber: string;
        user: {
            profile: {
                firstName: string;
                lastName: string;
            };
        };
        relationship: import("../users/entities/family.entity").FamilyRelationship;
        educationalLevel: string;
        classGroups: {
            id: string;
            name: string;
            courses: string[];
        }[];
    }[]>;
    private createFamilyUser;
    private updateFamilyUser;
}
