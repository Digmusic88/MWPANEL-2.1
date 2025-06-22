import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Student } from './student.entity';
import { AcademicYear } from './academic-year.entity';

@Entity('class_groups')
export class ClassGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  section: string; // A, B, C...

  @ManyToOne(() => AcademicYear)
  academicYear: AcademicYear;

  @ManyToOne(() => Course)
  course: Course;

  @ManyToOne(() => Teacher)
  tutor: Teacher;

  @ManyToMany(() => Student, (student) => student.classGroups)
  @JoinTable({
    name: 'class_students',
    joinColumn: { name: 'classId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'studentId', referencedColumnName: 'id' },
  })
  students: Student[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}