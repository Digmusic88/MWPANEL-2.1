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
import { User } from '../../users/entities/user.entity';
import { ClassGroup } from '../../students/entities/class-group.entity';
import { Student } from '../../students/entities/student.entity';
import { MessageAttachment } from './message-attachment.entity';

export enum MessageType {
  DIRECT = 'direct',           // Mensaje directo entre dos usuarios
  GROUP = 'group',             // Mensaje a un grupo de clase
  ANNOUNCEMENT = 'announcement', // Comunicado oficial
  NOTIFICATION = 'notification', // Notificación del sistema
}

export enum MessagePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  subject: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.DIRECT,
  })
  type: MessageType;

  @Column({
    type: 'enum',
    enum: MessagePriority,
    default: MessagePriority.NORMAL,
  })
  priority: MessagePriority;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  // Remitente del mensaje
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  senderId: string;

  // Destinatario (para mensajes directos)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'recipientId' })
  recipient: User;

  @Column({ nullable: true })
  recipientId: string;

  // Grupo destinatario (para mensajes grupales)
  @ManyToOne(() => ClassGroup, { nullable: true })
  @JoinColumn({ name: 'targetGroupId' })
  targetGroup: ClassGroup;

  @Column({ nullable: true })
  targetGroupId: string;

  // Estudiante relacionado (para contexto del mensaje)
  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'relatedStudentId' })
  relatedStudent: Student;

  @Column({ nullable: true })
  relatedStudentId: string;

  // Mensaje padre (para hilos de conversación)
  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'parentMessageId' })
  parentMessage: Message;

  @Column({ nullable: true })
  parentMessageId: string;

  // Respuestas a este mensaje
  @OneToMany(() => Message, (message) => message.parentMessage)
  replies: Message[];

  // Archivos adjuntos
  @OneToMany(() => MessageAttachment, (attachment) => attachment.message)
  attachments: MessageAttachment[];

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  readAt: Date;

  @Column({ default: false })
  isArchived: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ default: false })
  isDeletedBySender: boolean;

  @Column({ default: false })
  isDeletedByRecipient: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}