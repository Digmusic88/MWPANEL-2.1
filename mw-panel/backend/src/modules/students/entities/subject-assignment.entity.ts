import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Subject } from './subject.entity';
import { ClassGroup } from './class-group.entity';
import { AcademicYear } from './academic-year.entity';

@Entity('subject_assignments')
export class SubjectAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Teacher)
  teacher: Teacher;

  @ManyToOne(() => Subject)
  subject: Subject;

  @ManyToOne(() => ClassGroup)
  classGroup: ClassGroup;

  @ManyToOne(() => AcademicYear)
  academicYear: AcademicYear;

  @Column({ type: 'int', default: 0 })
  weeklyHours: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}