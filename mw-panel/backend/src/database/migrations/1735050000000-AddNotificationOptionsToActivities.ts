import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationOptionsToActivities1735050000000 implements MigrationInterface {
  name = 'AddNotificationOptionsToActivities1735050000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "activities" 
      ADD COLUMN "notify_on_happy" boolean NOT NULL DEFAULT false,
      ADD COLUMN "notify_on_neutral" boolean NOT NULL DEFAULT true,
      ADD COLUMN "notify_on_sad" boolean NOT NULL DEFAULT true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "activities" 
      DROP COLUMN "notify_on_happy",
      DROP COLUMN "notify_on_neutral",
      DROP COLUMN "notify_on_sad"
    `);
  }
}