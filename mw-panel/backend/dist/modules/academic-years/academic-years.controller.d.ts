import { Repository } from 'typeorm';
import { AcademicYear } from '../students/entities/academic-year.entity';
export declare class AcademicYearsController {
    private readonly academicYearRepository;
    constructor(academicYearRepository: Repository<AcademicYear>);
    findAll(): Promise<AcademicYear[]>;
}
