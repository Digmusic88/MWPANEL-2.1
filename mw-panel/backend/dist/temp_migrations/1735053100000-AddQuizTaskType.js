"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddQuizTaskType1735053100000 = void 0;
class AddQuizTaskType1735053100000 {
    constructor() {
        this.name = 'AddQuizTaskType1735053100000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TYPE "public"."tasks_tasktype_enum" ADD VALUE 'quiz'`);
    }
    async down(queryRunner) {
    }
}
exports.AddQuizTaskType1735053100000 = AddQuizTaskType1735053100000;
//# sourceMappingURL=1735053100000-AddQuizTaskType.js.map