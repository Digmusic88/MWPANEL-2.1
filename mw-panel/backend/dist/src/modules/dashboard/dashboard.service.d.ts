import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { User } from '../users/entities/user.entity';
import { Evaluation } from '../evaluations/entities/evaluation.entity';
import { ClassGroup } from '../students/entities/class-group.entity';
export declare class DashboardService {
    private studentsRepository;
    private teachersRepository;
    private usersRepository;
    private evaluationsRepository;
    private classGroupsRepository;
    constructor(studentsRepository: Repository<Student>, teachersRepository: Repository<Teacher>, usersRepository: Repository<User>, evaluationsRepository: Repository<Evaluation>, classGroupsRepository: Repository<ClassGroup>);
    getStats(): Promise<{
        totalStudents: number;
        totalTeachers: number;
        totalClasses: number;
        completedEvaluations: number;
        pendingEvaluations: number;
        averageGrade: number;
        levelDistribution: {
            infantil: number;
            primaria: number;
            secundaria: number;
            other: number;
        };
        lastUpdated: Date;
    }>;
}
