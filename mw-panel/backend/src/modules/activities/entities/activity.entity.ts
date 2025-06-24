import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ClassGroup } from '../../students/entities/class-group.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { ActivityAssessment } from './activity-assessment.entity';

export enum ActivityValuationType {
  EMOJI = 'emoji',
  SCORE = 'score',
}

@Entity('activities')
export class Activity {
  @ApiProperty({ description: 'ID único de la actividad' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nombre de la actividad', example: 'Ejercicios de matemáticas' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({ description: 'Descripción opcional de la actividad' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Fecha de asignación de la actividad' })
  @Column({ type: 'date' })
  assignedDate: Date;

  @ApiProperty({ description: 'Fecha opcional de revisión' })
  @Column({ type: 'date', nullable: true })
  reviewDate?: Date;

  @ApiProperty({ description: 'Tipo de valoración', enum: ActivityValuationType })
  @Column({
    type: 'enum',
    enum: ActivityValuationType,
    default: ActivityValuationType.EMOJI,
  })
  valuationType: ActivityValuationType;

  @ApiProperty({ description: 'Puntuación máxima (solo para tipo score)' })
  @Column({ type: 'int', nullable: true })
  maxScore?: number;

  @ApiProperty({ description: 'Si se notifica a las familias' })
  @Column({ type: 'boolean', default: true })
  notifyFamilies: boolean;

  @ApiProperty({ description: 'Notificar cuando el emoji sea happy (cara sonriente)' })
  @Column({ type: 'boolean', default: false, name: 'notify_on_happy' })
  notifyOnHappy: boolean;

  @ApiProperty({ description: 'Notificar cuando el emoji sea neutral (cara neutral)' })
  @Column({ type: 'boolean', default: true, name: 'notify_on_neutral' })
  notifyOnNeutral: boolean;

  @ApiProperty({ description: 'Notificar cuando el emoji sea sad (cara triste)' })
  @Column({ type: 'boolean', default: true, name: 'notify_on_sad' })
  notifyOnSad: boolean;

  @ApiProperty({ description: 'Si la actividad está activa' })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'ID del grupo de clase' })
  @Column({ name: 'class_group_id' })
  classGroupId: string;

  @ApiProperty({ description: 'ID del profesor que creó la actividad' })
  @Column({ name: 'teacher_id' })
  teacherId: string;

  // Relaciones
  @ManyToOne(() => ClassGroup, (classGroup) => classGroup.id)
  @JoinColumn({ name: 'class_group_id' })
  classGroup: ClassGroup;

  @ManyToOne(() => Teacher, (teacher) => teacher.id)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @OneToMany(() => ActivityAssessment, (assessment) => assessment.activity)
  assessments: ActivityAssessment[];

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn()
  updatedAt: Date;
}