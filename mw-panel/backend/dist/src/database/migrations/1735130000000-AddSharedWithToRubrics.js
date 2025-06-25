"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSharedWithToRubrics1735130000000 = void 0;
class AddSharedWithToRubrics1735130000000 {
    constructor() {
        this.name = 'AddSharedWithToRubrics1735130000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "rubrics" 
            ADD COLUMN "sharedWith" text[] DEFAULT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_rubrics_shared_with" 
            ON "rubrics" USING GIN ("sharedWith")
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "IDX_rubrics_shared_with"`);
        await queryRunner.query(`ALTER TABLE "rubrics" DROP COLUMN "sharedWith"`);
    }
}
exports.AddSharedWithToRubrics1735130000000 = AddSharedWithToRubrics1735130000000;
//# sourceMappingURL=1735130000000-AddSharedWithToRubrics.js.map