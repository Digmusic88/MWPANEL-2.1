import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { EnrollmentNumberService } from './services/enrollment-number.service';
import { Student } from './entities/student.entity';
import { EducationalLevel } from './entities/educational-level.entity';
import { Cycle } from './entities/cycle.entity';
import { Course } from './entities/course.entity';
import { Subject } from './entities/subject.entity';
import { ClassGroup } from './entities/class-group.entity';
import { AcademicYear } from './entities/academic-year.entity';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      EducationalLevel,
      Cycle,
      Course,
      Subject,
      ClassGroup,
      AcademicYear,
      User,
      UserProfile,
    ]),
  ],
  controllers: [StudentsController],
  providers: [StudentsService, EnrollmentNumberService],
  exports: [StudentsService, EnrollmentNumberService],
})
export class StudentsModule {}