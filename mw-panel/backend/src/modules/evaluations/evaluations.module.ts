import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationsController } from './evaluations.controller';
import { EvaluationsService } from './evaluations.service';
import { Evaluation } from './entities/evaluation.entity';
import { EvaluationPeriod } from './entities/evaluation-period.entity';
import { CompetencyEvaluation } from './entities/competency-evaluation.entity';
import { RadarEvaluation } from './entities/radar-evaluation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Evaluation,
      EvaluationPeriod,
      CompetencyEvaluation,
      RadarEvaluation,
    ]),
  ],
  controllers: [EvaluationsController],
  providers: [EvaluationsService],
  exports: [EvaluationsService],
})
export class EvaluationsModule {}