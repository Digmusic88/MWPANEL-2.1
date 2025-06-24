import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuizTaskType1735053100000 implements MigrationInterface {
  name = 'AddQuizTaskType1735053100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."tasks_tasktype_enum" ADD VALUE 'quiz'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Cannot easily remove enum values in PostgreSQL, would require recreating the enum
    // This is intentionally left empty as removing enum values is complex
  }
}