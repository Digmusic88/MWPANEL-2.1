import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { Course } from './course.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'int', default: 0 })
  weeklyHours: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Course, (course) => course.subjects)
  course: Course;
}