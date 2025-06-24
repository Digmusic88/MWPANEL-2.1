import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/entities/user.entity';
import { AttendanceRequest } from './attendance-request.entity';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EARLY_DEPARTURE = 'early_departure',
  JUSTIFIED_ABSENCE = 'justified_absence',
}

@Entity('attendance_records')
@Unique(['studentId', 'date']) // Un registro por estudiante por día
@Index(['date', 'studentId'])
export class AttendanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  studentId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @Column({ type: 'text', nullable: true })
  justification?: string;

  @Column({ type: 'uuid', nullable: true })
  approvedRequestId?: string;

  @ManyToOne(() => AttendanceRequest, { nullable: true })
  @JoinColumn({ name: 'approvedRequestId' })
  approvedRequest?: AttendanceRequest;

  @Column({ type: 'uuid' })
  markedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'markedById' })
  markedBy: User;

  @Column({ type: 'timestamp' })
  markedAt: Date;

  @Column({ type: 'time', nullable: true })
  arrivalTime?: string; // Para registrar hora de llegada en caso de retraso

  @Column({ type: 'time', nullable: true })
  departureTime?: string; // Para registrar hora de salida anticipada

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}