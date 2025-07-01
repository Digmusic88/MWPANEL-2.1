import { Response } from 'express';
import { EnrollmentService } from './enrollment.service';
import { BulkImportService } from './services/bulk-import.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
export declare class EnrollmentController {
    private readonly enrollmentService;
    private readonly bulkImportService;
    constructor(enrollmentService: EnrollmentService, bulkImportService: BulkImportService);
    createEnrollment(createEnrollmentDto: CreateEnrollmentDto): Promise<{
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
    createTestEnrollment(): Promise<{
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
    bulkImport(file: any): Promise<import("./dto/bulk-import.dto").BulkImportResult>;
    downloadTemplate(res: Response): Promise<void>;
}
