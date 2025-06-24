import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubjectAssignmentToActivities1735052000000 implements MigrationInterface {
  name = 'AddSubjectAssignmentToActivities1735052000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Añadir nuevas columnas (subject_assignment_id como nullable inicialmente)
    await queryRunner.query(`
      ALTER TABLE "activities" 
      ADD COLUMN "subject_assignment_id" uuid,
      ADD COLUMN "is_archived" boolean NOT NULL DEFAULT false,
      ADD COLUMN "is_template" boolean NOT NULL DEFAULT false
    `);

    // Asignar una asignación de asignatura por defecto a actividades existentes
    // Buscar la primera asignación de asignatura disponible para cada profesor
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

    // Para actividades sin profesor asignado o sin asignaciones, usar la primera disponible
    await queryRunner.query(`
      UPDATE "activities" 
      SET "subject_assignment_id" = (
        SELECT id FROM "subject_assignments" LIMIT 1
      )
      WHERE "subject_assignment_id" IS NULL
    `);

    // Ahora hacer la columna NOT NULL
    await queryRunner.query(`
      ALTER TABLE "activities" 
      ALTER COLUMN "subject_assignment_id" SET NOT NULL
    `);

    // Crear índices para optimizar consultas
    await queryRunner.query(`
      CREATE INDEX "IDX_activities_subject_assignment_id" ON "activities" ("subject_assignment_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_activities_is_archived" ON "activities" ("is_archived")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_activities_is_template" ON "activities" ("is_template")
    `);

    // Añadir foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "activities" 
      ADD CONSTRAINT "FK_activities_subject_assignment_id" 
      FOREIGN KEY ("subject_assignment_id") 
      REFERENCES "subject_assignments"("id") 
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "activities" 
      DROP CONSTRAINT "FK_activities_subject_assignment_id"
    `);

    // Eliminar índices
    await queryRunner.query(`DROP INDEX "IDX_activities_subject_assignment_id"`);
    await queryRunner.query(`DROP INDEX "IDX_activities_is_archived"`);
    await queryRunner.query(`DROP INDEX "IDX_activities_is_template"`);

    // Eliminar columnas
    await queryRunner.query(`
      ALTER TABLE "activities" 
      DROP COLUMN "subject_assignment_id",
      DROP COLUMN "is_archived",
      DROP COLUMN "is_template"
    `);
  }
}