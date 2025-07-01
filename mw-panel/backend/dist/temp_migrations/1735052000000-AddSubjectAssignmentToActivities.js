"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSubjectAssignmentToActivities1735052000000 = void 0;
class AddSubjectAssignmentToActivities1735052000000 {
    constructor() {
        this.name = 'AddSubjectAssignmentToActivities1735052000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "activities" 
      ADD COLUMN "subject_assignment_id" uuid,
      ADD COLUMN "is_archived" boolean NOT NULL DEFAULT false,
      ADD COLUMN "is_template" boolean NOT NULL DEFAULT false
    `);
        await queryRunner.query(`
      UPDATE "activities" 
      SET "subject_assignment_id" = (
        SELECT sa.id 
        FROM "subject_assignments" sa
        INNER JOIN "teachers" t ON t.id = sa."teacher_id"
        WHERE t.id = "activities"."teacher_id"
        LIMIT 1
      )
      WHERE "subject_assignment_id" IS NULL
    `);
        await queryRunner.query(`
      UPDATE "activities" 
      SET "subject_assignment_id" = (
        SELECT id FROM "subject_assignments" LIMIT 1
      )
      WHERE "subject_assignment_id" IS NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "activities" 
      ALTER COLUMN "subject_assignment_id" SET NOT NULL
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_activities_subject_assignment_id" ON "activities" ("subject_assignment_id")
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_activities_is_archived" ON "activities" ("is_archived")
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_activities_is_template" ON "activities" ("is_template")
    `);
        await queryRunner.query(`
      ALTER TABLE "activities" 
      ADD CONSTRAINT "FK_activities_subject_assignment_id" 
      FOREIGN KEY ("subject_assignment_id") 
      REFERENCES "subject_assignments"("id") 
      ON DELETE CASCADE
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "activities" 
      DROP CONSTRAINT "FK_activities_subject_assignment_id"
    `);
        await queryRunner.query(`DROP INDEX "IDX_activities_subject_assignment_id"`);
        await queryRunner.query(`DROP INDEX "IDX_activities_is_archived"`);
        await queryRunner.query(`DROP INDEX "IDX_activities_is_template"`);
        await queryRunner.query(`
      ALTER TABLE "activities" 
      DROP COLUMN "subject_assignment_id",
      DROP COLUMN "is_archived",
      DROP COLUMN "is_template"
    `);
    }
}
exports.AddSubjectAssignmentToActivities1735052000000 = AddSubjectAssignmentToActivities1735052000000;
//# sourceMappingURL=1735052000000-AddSubjectAssignmentToActivities.js.map