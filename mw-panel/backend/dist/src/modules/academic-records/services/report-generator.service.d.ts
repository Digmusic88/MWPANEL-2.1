import { Repository } from 'typeorm';
import { AcademicRecord } from '../entities/academic-record.entity';
import { Student } from '../../students/entities/student.entity';
import { SettingsService } from '../../settings/settings.service';
export interface ReportGenerationOptions {
    includeGrades: boolean;
    includeAttendance: boolean;
    includeComments: boolean;
    includeBehavioral: boolean;
    template: 'standard' | 'detailed' | 'summary';
    language: 'es' | 'en';
}
export interface GeneratedReport {
    filePath: string;
    fileName: string;
    size: number;
    generatedAt: Date;
}
export declare class ReportGeneratorService {
    private academicRecordsRepository;
    private studentsRepository;
    private settingsService;
    private readonly reportsDir;
    constructor(academicRecordsRepository: Repository<AcademicRecord>, studentsRepository: Repository<Student>, settingsService: SettingsService);
    generateStudentReport(studentId: string, academicYear: string, options?: Partial<ReportGenerationOptions>): Promise<GeneratedReport>;
    generateClassReport(classGroupId: string, academicYear: string, options?: Partial<ReportGenerationOptions>): Promise<GeneratedReport>;
    private createPDFReport;
    private createClassSummaryPDF;
    private addHeader;
    private addStudentInfo;
    private addAcademicSummary;
    private addGradesSection;
    private addAttendanceSection;
    private addCommentsSection;
    private addBehavioralSection;
    private addFooter;
    private ensureReportsDirectory;
    deleteReport(fileName: string): Promise<void>;
    getReportPath(fileName: string): Promise<string>;
}
