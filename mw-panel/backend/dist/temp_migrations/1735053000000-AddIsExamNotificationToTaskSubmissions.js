"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddIsExamNotificationToTaskSubmissions1735053000000 = void 0;
class AddIsExamNotificationToTaskSubmissions1735053000000 {
    constructor() {
        this.name = 'AddIsExamNotificationToTaskSubmissions1735053000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "task_submissions" ADD "isExamNotification" boolean NOT NULL DEFAULT false`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "task_submissions" DROP COLUMN "isExamNotification"`);
    }
}
exports.AddIsExamNotificationToTaskSubmissions1735053000000 = AddIsExamNotificationToTaskSubmissions1735053000000;
//# sourceMappingURL=1735053000000-AddIsExamNotificationToTaskSubmissions.js.map