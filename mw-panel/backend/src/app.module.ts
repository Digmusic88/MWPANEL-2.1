import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { FamiliesModule } from './modules/families/families.module';
import { ClassGroupsModule } from './modules/class-groups/class-groups.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { AcademicYearsModule } from './modules/academic-years/academic-years.module';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { EvaluationsModule } from './modules/evaluations/evaluations.module';
import { CompetenciesModule } from './modules/competencies/competencies.module';
import { ReportsModule } from './modules/reports/reports.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CommunicationsModule } from './modules/communications/communications.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AcademicRecordsModule } from './modules/academic-records/academic-records.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { GradesModule } from './modules/grades/grades.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Enable for initial setup
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    StudentsModule,
    TeachersModule,
    FamiliesModule,
    ClassGroupsModule,
    SubjectsModule,
    SchedulesModule,
    AcademicYearsModule,
    EnrollmentModule,
    EvaluationsModule,
    CompetenciesModule,
    ReportsModule,
    DashboardModule,
    CommunicationsModule,
    AttendanceModule,
    ActivitiesModule,
    TasksModule,
    SettingsModule,
    AcademicRecordsModule,
    CalendarModule,
    GradesModule,
  ],
  controllers: [],
  providers: [
    // Global guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}