import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from './task.entity';

export enum AttachmentType {
  INSTRUCTION = 'instruction',    // Instrucciones
  TEMPLATE = 'template',         // Plantilla
  REFERENCE = 'reference',       // Material de referencia
  EXAMPLE = 'example',          // Ejemplo
  RESOURCE = 'resource',        // Recurso adicional
}

@Entity('task_attachments')
export class TaskAttachment {
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
    enum: AttachmentType,
    default: AttachmentType.INSTRUCTION,
  })
  type: AttachmentType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string; // Descripción del archivo

  @Column({ type: 'int', default: 0 })
  downloadCount: number; // Número de descargas

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  uploadedAt: Date;

  // Relaciones
  @Column({ type: 'uuid' })
  taskId: string;

  @ManyToOne(() => Task, (task) => task.attachments)
  @JoinColumn({ name: 'taskId' })
  task: Task;

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
}