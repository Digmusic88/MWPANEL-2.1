import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
export declare class EnrollmentNumberService {
    private studentsRepository;
    constructor(studentsRepository: Repository<Student>);
    generateEnrollmentNumber(): Promise<string>;
    validateEnrollmentNumber(enrollmentNumber: string): Promise<boolean>;
    validateEnrollmentFormat(enrollmentNumber: string): boolean;
    generateUniqueEnrollmentNumber(maxAttempts?: number): Promise<string>;
}
