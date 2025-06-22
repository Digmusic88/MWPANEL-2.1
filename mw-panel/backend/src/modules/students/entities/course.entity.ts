import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Cycle } from './cycle.entity';
import { Subject } from './subject.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  order: number;

  @Column({ nullable: true })
  academicYear: string;

  @ManyToOne(() => Cycle, (cycle) => cycle.courses)
  cycle: Cycle;

  @OneToMany(() => Subject, (subject) => subject.course)
  subjects: Subject[];
}