import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { AttendanceRequest } from './entities/attendance-request.entity';
import { Student } from '../students/entities/student.entity';
import { User } from '../users/entities/user.entity';
import { ClassGroup } from '../students/entities/class-group.entity';
import { Family, FamilyStudent } from '../users/entities/family.entity';
import { CommunicationsModule } from '../communications/communications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendanceRecord,
      AttendanceRequest,
      Student,
      User,
      ClassGroup,
      Family,
      FamilyStudent,
    ]),
    forwardRef(() => CommunicationsModule),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}