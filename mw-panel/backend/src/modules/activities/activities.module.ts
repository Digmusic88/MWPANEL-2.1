import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { RubricsController } from './controllers/rubrics.controller';
import { RubricsService } from './services/rubrics.service';
import { RubricUtilsService } from './services/rubric-utils.service';
import { Activity } from './entities/activity.entity';
import { ActivityAssessment } from './entities/activity-assessment.entity';
import { ActivityNotification } from './entities/activity-notification.entity';
import { Rubric } from './entities/rubric.entity';
import { RubricCriterion } from './entities/rubric-criterion.entity';
import { RubricLevel } from './entities/rubric-level.entity';
import { RubricCell } from './entities/rubric-cell.entity';
import { RubricAssessment } from './entities/rubric-assessment.entity';
import { RubricAssessmentCriterion } from './entities/rubric-assessment-criterion.entity';
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
      Rubric,
      RubricCriterion,
      RubricLevel,
      RubricCell,
      RubricAssessment,
      RubricAssessmentCriterion,
      ClassGroup,
      Student,
      Family,
      FamilyStudent,
      Teacher,
      SubjectAssignment,
    ]),
  ],
  controllers: [ActivitiesController, RubricsController],
  providers: [ActivitiesService, RubricsService, RubricUtilsService],
  exports: [ActivitiesService, RubricsService, RubricUtilsService],
})
export class ActivitiesModule {}