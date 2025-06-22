import { Repository, DataSource } from 'typeorm';
import { EnrollmentService } from '../enrollment.service';
import { BulkImportResult } from '../dto/bulk-import.dto';
import { User } from '../../users/entities/user.entity';
import { Student } from '../../students/entities/student.entity';
import { EducationalLevel } from '../../students/entities/educational-level.entity';
import { Course } from '../../students/entities/course.entity';
export declare class BulkImportService {
    private usersRepository;
    private studentsRepository;
    private educationalLevelsRepository;
    private coursesRepository;
    private dataSource;
    private enrollmentService;
    constructor(usersRepository: Repository<User>, studentsRepository: Repository<Student>, educationalLevelsRepository: Repository<EducationalLevel>, coursesRepository: Repository<Course>, dataSource: DataSource, enrollmentService: EnrollmentService);
    processBulkImport(file: any): Promise<BulkImportResult>;
    private parseFile;
    private normalizeColumnName;
    private validateAndTransformRow;
    private convertToEnrollmentDto;
    generateTemplate(): Promise<Buffer>;
}
