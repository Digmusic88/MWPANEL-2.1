import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { SubjectAssignment } from '../../students/entities/subject-assignment.entity';
import { TaskSubmission } from './task-submission.entity';
import { TaskAttachment } from './task-attachment.entity';

export enum TaskType {
  ASSIGNMENT = 'assignment',     // Tarea/Ejercicio
  PROJECT = 'project',          // Proyecto
  EXAM = 'exam',               // Examen (Test Yourself)
  HOMEWORK = 'homework',       // Deberes
  RESEARCH = 'research',       // Investigación
  PRESENTATION = 'presentation', // Presentación
  QUIZ = 'quiz',               // Cuestionario
}

export enum TaskStatus {
  DRAFT = 'draft',           // Borrador
  PUBLISHED = 'published',   // Publicada
  CLOSED = 'closed',        // Cerrada
  ARCHIVED = 'archived',    // Archivada
}

export enum TaskPriority {
  LOW = 'low',              // Baja
  MEDIUM = 'medium',        // Media
  HIGH = 'high',           // Alta
  URGENT = 'urgent',       // Urgente
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({
    type: 'enum',
    enum: TaskType,
    default: TaskType.HOMEWORK,
  })
  taskType: TaskType;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.DRAFT,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Column({ type: 'timestamp' })
  assignedDate: Date;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  maxPoints: number;

  @Column({ type: 'boolean', default: true })
  allowLateSubmission: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.5 })
  latePenalty: number; // Porcentaje de penalización por entrega tardía

  @Column({ type: 'boolean', default: true })
  notifyFamilies: boolean;

  @Column({ type: 'boolean', default: false })
  requiresFile: boolean; // Si requiere archivo adjunto

  @Column({ type: 'text', nullable: true })
  allowedFileTypes: string; // JSON array de tipos permitidos

  @Column({ type: 'int', nullable: true })
  maxFileSize: number; // Tamaño máximo en bytes

  @Column({ type: 'text', nullable: true })
  rubric: string; // Criterios de evaluación (JSON)

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @Column({ type: 'uuid' })
  teacherId: string;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher;

  @Column({ type: 'uuid' })
  subjectAssignmentId: string;

  @ManyToOne(() => SubjectAssignment)
  @JoinColumn({ name: 'subjectAssignmentId' })
  subjectAssignment: SubjectAssignment;

  @OneToMany(() => TaskSubmission, (submission) => submission.task)
  submissions: TaskSubmission[];

  @OneToMany(() => TaskAttachment, (attachment) => attachment.task)
  attachments: TaskAttachment[];

  // Campos virtuales/calculados
  get isOverdue(): boolean {
    return new Date() > this.dueDate && this.status === TaskStatus.PUBLISHED;
  }

  get submissionCount(): number {
    return this.submissions?.length || 0;
  }

  get gradedSubmissionCount(): number {
    return this.submissions?.filter(s => s.isGraded)?.length || 0;
  }
}