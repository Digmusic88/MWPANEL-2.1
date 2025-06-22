import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { Subject } from '../students/entities/subject.entity';
import { SubjectAssignment } from '../students/entities/subject-assignment.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { ClassGroup } from '../students/entities/class-group.entity';
import { Course } from '../students/entities/course.entity';
import { AcademicYear } from '../students/entities/academic-year.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subject,
      SubjectAssignment,
      Teacher,
      ClassGroup,
      Course,
      AcademicYear,
    ]),
  ],
  controllers: [SubjectsController],
  providers: [SubjectsService],
  exports: [SubjectsService],
})
export class SubjectsModule {}