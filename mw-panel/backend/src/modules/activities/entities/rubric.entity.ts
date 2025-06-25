import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { SubjectAssignment } from '../../students/entities/subject-assignment.entity';
import { RubricCriterion } from './rubric-criterion.entity';
import { RubricLevel } from './rubric-level.entity';
import { RubricCell } from './rubric-cell.entity';

export enum RubricStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived'
}

@Entity('rubrics')
export class Rubric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: RubricStatus,
    default: RubricStatus.DRAFT,
  })
  status: RubricStatus;

  @Column({ default: false })
  isTemplate: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isVisibleToFamilies: boolean;

  @Column({ type: 'int' })
  criteriaCount: number;

  @Column({ type: 'int' })
  levelsCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  maxScore: number;

  // Metadatos para importación
  @Column({ type: 'text', nullable: true })
  importSource: string; // 'manual', 'chatgpt_markdown', 'chatgpt_csv'

  @Column({ type: 'text', nullable: true })
  originalImportData: string; // Datos originales de importación

  // Relaciones
  @ManyToOne(() => Teacher, { nullable: false })
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher;

  @Column('uuid')
  teacherId: string;

  @ManyToOne(() => SubjectAssignment, { nullable: true })
  @JoinColumn({ name: 'subjectAssignmentId' })
  subjectAssignment: SubjectAssignment;

  @Column('uuid', { nullable: true })
  subjectAssignmentId: string;

  @OneToMany(() => RubricCriterion, criterion => criterion.rubric, { cascade: true })
  criteria: RubricCriterion[];

  @OneToMany(() => RubricLevel, level => level.rubric, { cascade: true })
  levels: RubricLevel[];

  @OneToMany(() => RubricCell, cell => cell.rubric, { cascade: true })
  cells: RubricCell[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}