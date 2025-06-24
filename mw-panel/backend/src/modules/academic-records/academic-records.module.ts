import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicRecordsController } from './academic-records.controller';
import { AcademicRecordsService } from './academic-records.service';
import { ReportGeneratorService } from './services/report-generator.service';
import { 
  AcademicRecord, 
  AcademicRecordEntry, 
  AcademicRecordGrade 
} from './entities';
import { Student } from '../students/entities/student.entity';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AcademicRecord,
      AcademicRecordEntry,
      AcademicRecordGrade,
      Student,
    ]),
    SettingsModule,
  ],
  controllers: [AcademicRecordsController],
  providers: [AcademicRecordsService, ReportGeneratorService],
  exports: [AcademicRecordsService, ReportGeneratorService],
})
export class AcademicRecordsModule {}