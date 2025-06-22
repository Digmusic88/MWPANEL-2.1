import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Evaluation } from './evaluation.entity';
import { Competency } from '../../competencies/entities/competency.entity';

@Entity('competency_evaluations')
export class CompetencyEvaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Evaluation, (evaluation) => evaluation.competencyEvaluations)
  evaluation: Evaluation;

  @ManyToOne(() => Competency)
  competency: Competency;

  @Column({ type: 'int' })
  score: number; // 1-5 scale for radar chart

  @Column({ type: 'text', nullable: true })
  observations: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}