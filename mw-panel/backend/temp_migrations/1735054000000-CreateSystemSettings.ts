import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSystemSettings1735054000000 implements MigrationInterface {
  name = 'CreateSystemSettings1735054000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "public"."system_settings_type_enum" AS ENUM(
        'boolean', 
        'string', 
        'number', 
        'json'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."system_settings_category_enum" AS ENUM(
        'general', 
        'academic', 
        'reports', 
        'communications', 
        'modules'
      )
    `);

    // Create system_settings table
    await queryRunner.query(`
      CREATE TABLE "system_settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "key" character varying(100) NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "type" "public"."system_settings_type_enum" NOT NULL DEFAULT 'string',
        "category" "public"."system_settings_category_enum" NOT NULL DEFAULT 'general',
        "value" text NOT NULL,
        "defaultValue" text,
        "isEditable" boolean NOT NULL DEFAULT true,
        "requiresRestart" boolean NOT NULL DEFAULT false,
        "validationRules" text,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_system_settings_key" UNIQUE ("key"),
        CONSTRAINT "PK_system_settings_id" PRIMARY KEY ("id")
      )
    `);

    // Insert default module settings
    await queryRunner.query(`
      INSERT INTO "system_settings" ("key", "name", "description", "type", "category", "value", "defaultValue", "isEditable", "requiresRestart", "sortOrder") VALUES
      ('module_expedientes_enabled', 'Módulo de Expedientes', 'Habilita el módulo de expedientes académicos y generación de boletines PDF', 'boolean', 'modules', 'false', 'false', true, false, 1),
      ('module_calendario_enabled', 'Módulo de Calendario', 'Habilita el calendario académico integrado', 'boolean', 'modules', 'false', 'false', true, false, 2),
      ('module_recursos_enabled', 'Módulo de Recursos', 'Habilita el portal de recursos educativos', 'boolean', 'modules', 'false', 'false', true, false, 3),
      ('module_analytics_enabled', 'Módulo de Analytics', 'Habilita el dashboard de métricas y estadísticas avanzadas', 'boolean', 'modules', 'false', 'false', true, false, 4),
      ('module_chat_enabled', 'Módulo de Chat', 'Habilita el chat en tiempo real', 'boolean', 'modules', 'false', 'false', true, false, 5)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "system_settings"`);
    await queryRunner.query(`DROP TYPE "public"."system_settings_category_enum"`);
    await queryRunner.query(`DROP TYPE "public"."system_settings_type_enum"`);
  }
}