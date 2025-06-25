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
import { Rubric } from './rubric.entity';
import { RubricCell } from './rubric-cell.entity';

@Entity('rubric_criteria')
export class RubricCriterion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  order: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1 })
  weight: number; // Peso del criterio (suma total debe ser 1 o 100%)

  @Column({ default: true })
  isActive: boolean;

  // Relaciones
  @ManyToOne(() => Rubric, rubric => rubric.criteria, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rubricId' })
  rubric: Rubric;

  @Column('uuid')
  rubricId: string;

  @OneToMany(() => RubricCell, cell => cell.criterion, { cascade: true })
  cells: RubricCell[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}