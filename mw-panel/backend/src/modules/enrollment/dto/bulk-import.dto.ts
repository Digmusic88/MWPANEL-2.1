import { IsString, IsEmail, IsOptional, IsEnum, IsDateString, IsBoolean } from 'class-validator';

export class BulkEnrollmentRowDto {
  // Student Data
  @IsString()
  studentFirstName: string;

  @IsString()
  studentLastName: string;

  @IsEmail()
  studentEmail: string;

  @IsString()
  studentPassword: string;

  @IsDateString()
  studentBirthDate: string;

  @IsOptional()
  @IsString()
  studentDocumentNumber?: string;

  @IsOptional()
  @IsString()
  studentPhone?: string;

  @IsOptional()
  @IsString()
  enrollmentNumber?: string;

  @IsString()
  educationalLevelId: string;

  @IsOptional()
  @IsString()
  courseId?: string;

  // Primary Contact Data
  @IsString()
  primaryFirstName: string;

  @IsString()
  primaryLastName: string;

  @IsEmail()
  primaryEmail: string;

  @IsString()
  primaryPassword: string;

  @IsString()
  primaryPhone: string;

  @IsOptional()
  @IsString()
  primaryDocumentNumber?: string;

  @IsOptional()
  @IsDateString()
  primaryDateOfBirth?: string;

  @IsOptional()
  @IsString()
  primaryAddress?: string;

  @IsOptional()
  @IsString()
  primaryOccupation?: string;

  @IsEnum(['father', 'mother', 'guardian', 'other'])
  relationshipToPrimary: 'father' | 'mother' | 'guardian' | 'other';

  // Secondary Contact Data (Optional)
  @IsOptional()
  @IsBoolean()
  hasSecondaryContact?: boolean;

  @IsOptional()
  @IsString()
  secondaryFirstName?: string;

  @IsOptional()
  @IsString()
  secondaryLastName?: string;

  @IsOptional()
  @IsEmail()
  secondaryEmail?: string;

  @IsOptional()
  @IsString()
  secondaryPassword?: string;

  @IsOptional()
  @IsString()
  secondaryPhone?: string;

  @IsOptional()
  @IsString()
  secondaryDocumentNumber?: string;

  @IsOptional()
  @IsDateString()
  secondaryDateOfBirth?: string;

  @IsOptional()
  @IsString()
  secondaryAddress?: string;

  @IsOptional()
  @IsString()
  secondaryOccupation?: string;

  @IsOptional()
  @IsEnum(['father', 'mother', 'guardian', 'other'])
  relationshipToSecondary?: 'father' | 'mother' | 'guardian' | 'other';
}

export interface BulkImportResult {
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: BulkImportError[];
  warnings: BulkImportWarning[];
  importedStudents: Array<{
    rowNumber: number;
    studentName: string;
    enrollmentNumber: string;
    familyId: string;
  }>;
}

export interface BulkImportError {
  rowNumber: number;
  field?: string;
  message: string;
  originalData: any;
}

export interface BulkImportWarning {
  rowNumber: number;
  field?: string;
  message: string;
  originalData: any;
}