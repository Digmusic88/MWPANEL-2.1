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
import { User } from './user.entity';
import { Student } from '../../students/entities/student.entity';

export enum FamilyRelationship {
  PARENT = 'parent', // Padre/Madre
  GUARDIAN = 'guardian',
  OTHER = 'other',
}

@Entity('families')
export class Family {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  primaryContact: User;

  @ManyToOne(() => User, { nullable: true })
  secondaryContact: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('family_students')
export class FamilyStudent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Family)
  family: Family;

  @ManyToOne(() => Student)
  student: Student;

  @Column({
    type: 'enum',
    enum: FamilyRelationship,
  })
  relationship: FamilyRelationship;
}