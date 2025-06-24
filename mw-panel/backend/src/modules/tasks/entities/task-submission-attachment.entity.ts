import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TaskSubmission } from './task-submission.entity';

export enum SubmissionAttachmentStatus {
  UPLOADED = 'uploaded',         // Subido
  PROCESSING = 'processing',     // En procesamiento
  VALIDATED = 'validated',       // Validado
  REJECTED = 'rejected',         // Rechazado
  CORRUPTED = 'corrupted',       // Corrupto
}

@Entity('task_submission_attachments')
export class TaskSubmissionAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  filename: string; // Nombre del archivo en el servidor

  @Column({ type: 'varchar', length: 255 })
  originalName: string; // Nombre original del archivo

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ type: 'bigint' })
  size: number; // Tamaño en bytes

  @Column({ type: 'varchar', length: 500 })
  path: string; // Ruta del archivo en el servidor

  @Column({
    type: 'enum',
    enum: SubmissionAttachmentStatus,
    default: SubmissionAttachmentStatus.UPLOADED,
  })
  status: SubmissionAttachmentStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string; // Descripción del estudiante

  @Column({ type: 'varchar', length: 500, nullable: true })
  rejectionReason: string; // Motivo de rechazo si aplica

  @Column({ type: 'boolean', default: false })
  isMainSubmission: boolean; // Si es el archivo principal de la entrega

  @Column({ type: 'int', default: 1 })
  version: number; // Versión del archivo (si se reemplaza)

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  uploadedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  validatedAt: Date;

  // Relaciones
  @Column({ type: 'uuid' })
  submissionId: string;

  @ManyToOne(() => TaskSubmission, (submission) => submission.attachments)
  @JoinColumn({ name: 'submissionId' })
  submission: TaskSubmission;

  // Métodos utiles
  get fileExtension(): string {
    return this.originalName.split('.').pop()?.toLowerCase() || '';
  }

  get sizeInMB(): number {
    return Math.round((this.size / (1024 * 1024)) * 100) / 100;
  }

  get isImage(): boolean {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    return imageTypes.includes(this.fileExtension);
  }

  get isDocument(): boolean {
    const docTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
    return docTypes.includes(this.fileExtension);
  }

  get isSpreadsheet(): boolean {
    const spreadsheetTypes = ['xls', 'xlsx', 'csv'];
    return spreadsheetTypes.includes(this.fileExtension);
  }

  get isPresentation(): boolean {
    const presentationTypes = ['ppt', 'pptx'];
    return presentationTypes.includes(this.fileExtension);
  }

  get isVideo(): boolean {
    const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
    return videoTypes.includes(this.fileExtension);
  }

  get isAudio(): boolean {
    const audioTypes = ['mp3', 'wav', 'ogg', 'aac', 'm4a'];
    return audioTypes.includes(this.fileExtension);
  }

  get isArchive(): boolean {
    const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz'];
    return archiveTypes.includes(this.fileExtension);
  }

  get statusColor(): string {
    switch (this.status) {
      case SubmissionAttachmentStatus.UPLOADED:
        return '#1890ff';
      case SubmissionAttachmentStatus.PROCESSING:
        return '#faad14';
      case SubmissionAttachmentStatus.VALIDATED:
        return '#52c41a';
      case SubmissionAttachmentStatus.REJECTED:
        return '#ff4d4f';
      case SubmissionAttachmentStatus.CORRUPTED:
        return '#f5222d';
      default:
        return '#d9d9d9';
    }
  }
}