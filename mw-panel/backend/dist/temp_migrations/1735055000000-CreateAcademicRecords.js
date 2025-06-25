"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAcademicRecords1735055000000 = void 0;
class CreateAcademicRecords1735055000000 {
    constructor() {
        this.name = 'CreateAcademicRecords1735055000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TYPE "public"."academic_records_academicyear_enum" AS ENUM(
        '2023-2024', 
        '2024-2025', 
        '2025-2026', 
        '2026-2027', 
        '2027-2028'
      )
    `);
        await queryRunner.query(`
      CREATE TYPE "public"."academic_records_status_enum" AS ENUM(
        'active', 
        'completed', 
        'transferred', 
        'archived'
      )
    `);
        await queryRunner.query(`
      CREATE TYPE "public"."academic_record_entries_period_enum" AS ENUM(
        'first_trimester', 
        'second_trimester', 
        'third_trimester', 
        'first_semester', 
        'second_semester', 
        'annual'
      )
    `);
        await queryRunner.query(`
      CREATE TYPE "public"."academic_record_entries_type_enum" AS ENUM(
        'academic', 
        'attendance', 
        'behavioral', 
        'achievement', 
        'disciplinary', 
        'medical', 
        'other'
      )
    `);
        await queryRunner.query(`
      CREATE TYPE "public"."academic_record_grades_gradetype_enum" AS ENUM(
        'exam', 
        'quiz', 
        'homework', 
        'project', 
        'participation', 
        'attendance', 
        'final', 
        'midterm', 
        'assignment', 
        'other'
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "academic_records" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "academicYear" "public"."academic_records_academicyear_enum" NOT NULL,
        "status" "public"."academic_records_status_enum" NOT NULL DEFAULT 'active',
        "finalGPA" numeric(4,2),
        "totalCredits" integer,
        "completedCredits" integer,
        "absences" integer NOT NULL DEFAULT 0,
        "tardiness" integer NOT NULL DEFAULT 0,
        "observations" text,
        "achievements" text,
        "disciplinaryRecords" text,
        "startDate" date,
        "endDate" date,
        "isPromoted" boolean NOT NULL DEFAULT false,
        "promotionNotes" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "studentId" uuid NOT NULL,
        CONSTRAINT "PK_academic_records_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_academic_records_student" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "academic_record_entries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" "public"."academic_record_entries_type_enum" NOT NULL DEFAULT 'academic',
        "period" "public"."academic_record_entries_period_enum" NOT NULL,
        "title" character varying(255) NOT NULL,
        "description" text,
        "entryDate" date NOT NULL,
        "numericValue" numeric(4,2),
        "letterGrade" character varying(10),
        "comments" text,
        "credits" integer,
        "isPassing" boolean NOT NULL DEFAULT false,
        "isExempt" boolean NOT NULL DEFAULT false,
        "attachments" text,
        "enteredBy" character varying(100),
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "academicRecordId" uuid NOT NULL,
        "subjectAssignmentId" uuid,
        CONSTRAINT "PK_academic_record_entries_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_academic_record_entries_record" FOREIGN KEY ("academicRecordId") REFERENCES "academic_records"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_academic_record_entries_subject" FOREIGN KEY ("subjectAssignmentId") REFERENCES "subject_assignments"("id") ON DELETE SET NULL
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "academic_record_grades" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "gradeType" "public"."academic_record_grades_gradetype_enum" NOT NULL DEFAULT 'assignment',
        "name" character varying(255) NOT NULL,
        "description" text,
        "earnedPoints" numeric(5,2) NOT NULL,
        "totalPoints" numeric(5,2) NOT NULL,
        "weight" numeric(3,2),
        "gradeDate" date NOT NULL,
        "dueDate" date,
        "isLate" boolean NOT NULL DEFAULT false,
        "isExcused" boolean NOT NULL DEFAULT false,
        "isDropped" boolean NOT NULL DEFAULT false,
        "teacherComments" text,
        "rubricData" text,
        "gradedBy" character varying(100),
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "entryId" uuid NOT NULL,
        CONSTRAINT "PK_academic_record_grades_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_academic_record_grades_entry" FOREIGN KEY ("entryId") REFERENCES "academic_record_entries"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_academic_records_student_year" ON "academic_records" ("studentId", "academicYear")`);
        await queryRunner.query(`CREATE INDEX "IDX_academic_record_entries_record" ON "academic_record_entries" ("academicRecordId")`);
        await queryRunner.query(`CREATE INDEX "IDX_academic_record_entries_subject" ON "academic_record_entries" ("subjectAssignmentId")`);
        await queryRunner.query(`CREATE INDEX "IDX_academic_record_grades_entry" ON "academic_record_grades" ("entryId")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "IDX_academic_record_grades_entry"`);
        await queryRunner.query(`DROP INDEX "IDX_academic_record_entries_subject"`);
        await queryRunner.query(`DROP INDEX "IDX_academic_record_entries_record"`);
        await queryRunner.query(`DROP INDEX "IDX_academic_records_student_year"`);
        await queryRunner.query(`DROP TABLE "academic_record_grades"`);
        await queryRunner.query(`DROP TABLE "academic_record_entries"`);
        await queryRunner.query(`DROP TABLE "academic_records"`);
        await queryRunner.query(`DROP TYPE "public"."academic_record_grades_gradetype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."academic_record_entries_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."academic_record_entries_period_enum"`);
        await queryRunner.query(`DROP TYPE "public"."academic_records_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."academic_records_academicyear_enum"`);
    }
}
exports.CreateAcademicRecords1735055000000 = CreateAcademicRecords1735055000000;
//# sourceMappingURL=1735055000000-CreateAcademicRecords.js.map