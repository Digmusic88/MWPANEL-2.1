"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddNotificationOptionsToActivities1735050000000 = void 0;
class AddNotificationOptionsToActivities1735050000000 {
    constructor() {
        this.name = 'AddNotificationOptionsToActivities1735050000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "activities" 
      ADD COLUMN "notify_on_happy" boolean NOT NULL DEFAULT false,
      ADD COLUMN "notify_on_neutral" boolean NOT NULL DEFAULT true,
      ADD COLUMN "notify_on_sad" boolean NOT NULL DEFAULT true
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "activities" 
      DROP COLUMN "notify_on_happy",
      DROP COLUMN "notify_on_neutral",
      DROP COLUMN "notify_on_sad"
    `);
    }
}
exports.AddNotificationOptionsToActivities1735050000000 = AddNotificationOptionsToActivities1735050000000;
//# sourceMappingURL=1735050000000-AddNotificationOptionsToActivities.js.map