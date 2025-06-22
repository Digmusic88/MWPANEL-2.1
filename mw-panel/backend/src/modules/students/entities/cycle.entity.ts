import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { EducationalLevel } from './educational-level.entity';
import { Course } from './course.entity';

@Entity('cycles')
export class Cycle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  order: number;

  @ManyToOne(() => EducationalLevel, (level) => level.cycles)
  educationalLevel: EducationalLevel;

  @OneToMany(() => Course, (course) => course.cycle)
  courses: Course[];
}