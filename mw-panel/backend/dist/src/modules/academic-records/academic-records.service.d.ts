import { Repository } from 'typeorm';
import { AcademicRecord } from './entities/academic-record.entity';
import { AcademicRecordEntry } from './entities/academic-record-entry.entity';
import { AcademicRecordGrade } from './entities/academic-record-grade.entity';
import { AcademicYear } from './entities/academic-record.types';
import { Student } from '../students/entities/student.entity';
import { SettingsService } from '../settings/settings.service';
import { CreateAcademicRecordDto, UpdateAcademicRecordDto, CreateAcademicRecordEntryDto, UpdateAcademicRecordEntryDto, CreateAcademicRecordGradeDto, UpdateAcademicRecordGradeDto, AcademicRecordQueryDto } from './dto/academic-record.dto';
export declare class AcademicRecordsService {
    private academicRecordsRepository;
    private entriesRepository;
    private gradesRepository;
    private studentsRepository;
    private settingsService;
    constructor(academicRecordsRepository: Repository<AcademicRecord>, entriesRepository: Repository<AcademicRecordEntry>, gradesRepository: Repository<AcademicRecordGrade>, studentsRepository: Repository<Student>, settingsService: SettingsService);
    createRecord(createDto: CreateAcademicRecordDto): Promise<AcademicRecord>;
    findStudentRecords(studentId: string, query: AcademicRecordQueryDto): Promise<{
        records: AcademicRecord[];
        total: number;
    }>;
    findRecordById(id: string): Promise<AcademicRecord>;
    updateRecord(id: string, updateDto: UpdateAcademicRecordDto): Promise<AcademicRecord>;
    deleteRecord(id: string): Promise<void>;
    createEntry(createDto: CreateAcademicRecordEntryDto): Promise<AcademicRecordEntry>;
    findEntryById(id: string): Promise<AcademicRecordEntry>;
    updateEntry(id: string, updateDto: UpdateAcademicRecordEntryDto): Promise<AcademicRecordEntry>;
    deleteEntry(id: string): Promise<void>;
    createGrade(createDto: CreateAcademicRecordGradeDto): Promise<AcademicRecordGrade>;
    findGradeById(id: string): Promise<AcademicRecordGrade>;
    updateGrade(id: string, updateDto: UpdateAcademicRecordGradeDto): Promise<AcademicRecordGrade>;
    deleteGrade(id: string): Promise<void>;
    getStudentStatistics(studentId: string, academicYear?: AcademicYear): Promise<any>;
    private calculateGPA;
    private recalculateRecordGPA;
    private checkModuleEnabled;
    syncFromEvaluations(studentId: string, academicYear: AcademicYear): Promise<AcademicRecord>;
}
