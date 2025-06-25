import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddQuizTaskType1735053100000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
