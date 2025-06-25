"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskSubmission = exports.SubmissionStatus = void 0;
const typeorm_1 = require("typeorm");
const task_entity_1 = require("./task.entity");
const student_entity_1 = require("../../students/entities/student.entity");
const task_submission_attachment_entity_1 = require("./task-submission-attachment.entity");
var SubmissionStatus;
(function (SubmissionStatus) {
    SubmissionStatus["NOT_SUBMITTED"] = "not_submitted";
    SubmissionStatus["SUBMITTED"] = "submitted";
    SubmissionStatus["LATE"] = "late";
    SubmissionStatus["GRADED"] = "graded";
    SubmissionStatus["RETURNED"] = "returned";
    SubmissionStatus["RESUBMITTED"] = "resubmitted";
})(SubmissionStatus || (exports.SubmissionStatus = SubmissionStatus = {}));
let TaskSubmission = class TaskSubmission {
    get wasSubmittedLate() {
        if (!this.firstSubmittedAt || !this.task?.dueDate)
            return false;
        return this.firstSubmittedAt > this.task.dueDate;
    }
    get daysSinceSubmission() {
        if (!this.submittedAt)
            return 0;
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - this.submittedAt.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    get hasAttachments() {
        return this.attachments && this.attachments.length > 0;
    }
    get gradePercentage() {
        if (!this.finalGrade || !this.task?.maxPoints)
            return 0;
        return (this.finalGrade / this.task.maxPoints) * 100;
    }
};
exports.TaskSubmission = TaskSubmission;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TaskSubmission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TaskSubmission.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SubmissionStatus,
        default: SubmissionStatus.NOT_SUBMITTED,
    }),
    __metadata("design:type", String)
], TaskSubmission.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TaskSubmission.prototype, "submittedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TaskSubmission.prototype, "firstSubmittedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TaskSubmission.prototype, "gradedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TaskSubmission.prototype, "returnedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], TaskSubmission.prototype, "grade", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], TaskSubmission.prototype, "finalGrade", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TaskSubmission.prototype, "teacherFeedback", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TaskSubmission.prototype, "privateNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], TaskSubmission.prototype, "isLate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], TaskSubmission.prototype, "isGraded", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], TaskSubmission.prototype, "needsRevision", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], TaskSubmission.prototype, "attemptNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], TaskSubmission.prototype, "revisionCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TaskSubmission.prototype, "submissionNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], TaskSubmission.prototype, "isExamNotification", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], TaskSubmission.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TaskSubmission.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TaskSubmission.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], TaskSubmission.prototype, "taskId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => task_entity_1.Task, (task) => task.submissions),
    (0, typeorm_1.JoinColumn)({ name: 'taskId' }),
    __metadata("design:type", task_entity_1.Task)
], TaskSubmission.prototype, "task", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], TaskSubmission.prototype, "studentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => student_entity_1.Student),
    (0, typeorm_1.JoinColumn)({ name: 'studentId' }),
    __metadata("design:type", student_entity_1.Student)
], TaskSubmission.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_submission_attachment_entity_1.TaskSubmissionAttachment, (attachment) => attachment.submission),
    __metadata("design:type", Array)
], TaskSubmission.prototype, "attachments", void 0);
exports.TaskSubmission = TaskSubmission = __decorate([
    (0, typeorm_1.Entity)('task_submissions'),
    (0, typeorm_1.Unique)(['taskId', 'studentId'])
], TaskSubmission);
//# sourceMappingURL=task-submission.entity.js.map