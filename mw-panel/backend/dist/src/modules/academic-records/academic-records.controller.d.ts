import { Response } from 'express';
import { AcademicRecordsService } from './academic-records.service';
import { ReportGeneratorService, ReportGenerationOptions } from './services/report-generator.service';
import { CreateAcademicRecordDto, UpdateAcademicRecordDto, CreateAcademicRecordEntryDto, UpdateAcademicRecordEntryDto, CreateAcademicRecordGradeDto, UpdateAcademicRecordGradeDto, AcademicRecordQueryDto } from './dto/academic-record.dto';
import { AcademicRecord } from './entities/academic-record.entity';
import { AcademicRecordEntry } from './entities/academic-record-entry.entity';
import { AcademicRecordGrade } from './entities/academic-record-grade.entity';
export declare class AcademicRecordsController {
    private readonly academicRecordsService;
    private readonly reportGeneratorService;
    constructor(academicRecordsService: AcademicRecordsService, reportGeneratorService: ReportGeneratorService);
    createRecord(createDto: CreateAcademicRecordDto): Promise<AcademicRecord>;
    getStudentRecords(studentId: string, query: AcademicRecordQueryDto): Promise<{
        records: AcademicRecord[];
        total: number;
    }>;
    getRecord(id: string): Promise<AcademicRecord>;
    updateRecord(id: string, updateDto: UpdateAcademicRecordDto): Promise<AcademicRecord>;
    deleteRecord(id: string): Promise<{
        message: string;
    }>;
    createEntry(createDto: CreateAcademicRecordEntryDto): Promise<AcademicRecordEntry>;
    getEntry(id: string): Promise<AcademicRecordEntry>;
    updateEntry(id: string, updateDto: UpdateAcademicRecordEntryDto): Promise<AcademicRecordEntry>;
    deleteEntry(id: string): Promise<{
        message: string;
    }>;
    createGrade(createDto: CreateAcademicRecordGradeDto): Promise<AcademicRecordGrade>;
    getGrade(id: string): Promise<AcademicRecordGrade>;
    updateGrade(id: string, updateDto: UpdateAcademicRecordGradeDto): Promise<AcademicRecordGrade>;
    deleteGrade(id: string): Promise<{
        message: string;
    }>;
    generateStudentReport(studentId: string, academicYear: string, options?: Partial<ReportGenerationOptions>): Promise<{
        fileName: string;
        message: string;
    }>;
    generateClassReport(classGroupId: string, academicYear: string, options?: Partial<ReportGenerationOptions>): Promise<{
        fileName: string;
        message: string;
    }>;
    downloadReport(fileName: string, res: Response): Promise<void>;
    deleteReport(fileName: string): Promise<{
        message: string;
    }>;
    getStudentStatistics(studentId: string, academicYear?: string): Promise<any>;
    syncFromEvaluations(studentId: string, academicYear: string): Promise<AcademicRecord>;
}
