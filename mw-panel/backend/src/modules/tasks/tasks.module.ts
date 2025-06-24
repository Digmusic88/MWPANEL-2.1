import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { 
  Task, 
  TaskSubmission, 
  TaskAttachment, 
  TaskSubmissionAttachment 
} from './entities';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Student } from '../students/entities/student.entity';
import { SubjectAssignment } from '../students/entities/subject-assignment.entity';
import { Family, FamilyStudent } from '../users/entities/family.entity';
import { mkdir } from 'fs/promises';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      TaskSubmission,
      TaskAttachment,
      TaskSubmissionAttachment,
      Teacher,
      Student,
      SubjectAssignment,
      Family,
      FamilyStudent,
    ]),
    MulterModule.registerAsync({
      useFactory: async () => {
        // Crear directorios de uploads si no existen
        const uploadsPath = join(process.cwd(), 'uploads');
        const tasksPath = join(uploadsPath, 'tasks');
        const submissionsPath = join(uploadsPath, 'submissions');

        try {
          await mkdir(uploadsPath, { recursive: true });
          await mkdir(tasksPath, { recursive: true });
          await mkdir(submissionsPath, { recursive: true });
        } catch (error) {
          // Los directorios ya existen
        }

        return {
          dest: uploadsPath,
        };
      },
    }),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}