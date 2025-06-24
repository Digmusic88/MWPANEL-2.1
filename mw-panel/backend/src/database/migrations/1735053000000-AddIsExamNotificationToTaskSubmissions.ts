import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsExamNotificationToTaskSubmissions1735053000000 implements MigrationInterface {
  name = 'AddIsExamNotificationToTaskSubmissions1735053000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_submissions" ADD "isExamNotification" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_submissions" DROP COLUMN "isExamNotification"`,
    );
  }
}