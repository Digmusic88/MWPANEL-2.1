import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddSubjectAssignmentToActivities1735052000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
