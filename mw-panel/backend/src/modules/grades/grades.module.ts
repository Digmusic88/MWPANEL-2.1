import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';
import { Student } from '../students/entities/student.entity';
import { TaskSubmission } from '../tasks/entities/task-submission.entity';
import { ActivityAssessment } from '../activities/entities/activity-assessment.entity';
import { CompetencyEvaluation } from '../evaluations/entities/competency-evaluation.entity';
import { Evaluation } from '../evaluations/entities/evaluation.entity';
import { SubjectAssignment } from '../students/entities/subject-assignment.entity';
import { ClassGroup } from '../students/entities/class-group.entity';
import { FamilyStudent } from '../users/entities/family.entity';
import { Family } from '../users/entities/family.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      TaskSubmission,
      ActivityAssessment,
      CompetencyEvaluation,
      Evaluation,
      SubjectAssignment,
      ClassGroup,
      FamilyStudent,
      Family,
    ]),
  ],
  controllers: [GradesController],
  providers: [GradesService],
  exports: [GradesService],
})
export class GradesModule {}