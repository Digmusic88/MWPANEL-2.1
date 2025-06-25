import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddIsExamNotificationToTaskSubmissions1735053000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
