import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { Activity } from './entities/activity.entity';
import { ActivityAssessment } from './entities/activity-assessment.entity';
import { ActivityNotification } from './entities/activity-notification.entity';
import { ClassGroup } from '../students/entities/class-group.entity';
import { Student } from '../students/entities/student.entity';
import { Family, FamilyStudent } from '../users/entities/family.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { SubjectAssignment } from '../students/entities/subject-assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Activity,
      ActivityAssessment,
      ActivityNotification,
      ClassGroup,
      Student,
      Family,
      FamilyStudent,
      Teacher,
      SubjectAssignment,
    ]),
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}