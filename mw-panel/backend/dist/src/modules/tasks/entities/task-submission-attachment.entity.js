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
exports.TaskSubmissionAttachment = exports.SubmissionAttachmentStatus = void 0;
const typeorm_1 = require("typeorm");
const task_submission_entity_1 = require("./task-submission.entity");
var SubmissionAttachmentStatus;
(function (SubmissionAttachmentStatus) {
    SubmissionAttachmentStatus["UPLOADED"] = "uploaded";
    SubmissionAttachmentStatus["PROCESSING"] = "processing";
    SubmissionAttachmentStatus["VALIDATED"] = "validated";
    SubmissionAttachmentStatus["REJECTED"] = "rejected";
    SubmissionAttachmentStatus["CORRUPTED"] = "corrupted";
})(SubmissionAttachmentStatus || (exports.SubmissionAttachmentStatus = SubmissionAttachmentStatus = {}));
let TaskSubmissionAttachment = class TaskSubmissionAttachment {
    get fileExtension() {
        return this.originalName.split('.').pop()?.toLowerCase() || '';
    }
    get sizeInMB() {
        return Math.round((this.size / (1024 * 1024)) * 100) / 100;
    }
    get isImage() {
        const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        return imageTypes.includes(this.fileExtension);
    }
    get isDocument() {
        const docTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
        return docTypes.includes(this.fileExtension);
    }
    get isSpreadsheet() {
        const spreadsheetTypes = ['xls', 'xlsx', 'csv'];
        return spreadsheetTypes.includes(this.fileExtension);
    }
    get isPresentation() {
        const presentationTypes = ['ppt', 'pptx'];
        return presentationTypes.includes(this.fileExtension);
    }
    get isVideo() {
        const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
        return videoTypes.includes(this.fileExtension);
    }
    get isAudio() {
        const audioTypes = ['mp3', 'wav', 'ogg', 'aac', 'm4a'];
        return audioTypes.includes(this.fileExtension);
    }
    get isArchive() {
        const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz'];
        return archiveTypes.includes(this.fileExtension);
    }
    get statusColor() {
        switch (this.status) {
            case SubmissionAttachmentStatus.UPLOADED:
                return '#1890ff';
            case SubmissionAttachmentStatus.PROCESSING:
                return '#faad14';
            case SubmissionAttachmentStatus.VALIDATED:
                return '#52c41a';
            case SubmissionAttachmentStatus.REJECTED:
                return '#ff4d4f';
            case SubmissionAttachmentStatus.CORRUPTED:
                return '#f5222d';
            default:
                return '#d9d9d9';
        }
    }
};
exports.TaskSubmissionAttachment = TaskSubmissionAttachment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TaskSubmissionAttachment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], TaskSubmissionAttachment.prototype, "filename", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], TaskSubmissionAttachment.prototype, "originalName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], TaskSubmissionAttachment.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], TaskSubmissionAttachment.prototype, "size", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], TaskSubmissionAttachment.prototype, "path", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SubmissionAttachmentStatus,
        default: SubmissionAttachmentStatus.UPLOADED,
    }),
    __metadata("design:type", String)
], TaskSubmissionAttachment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], TaskSubmissionAttachment.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], TaskSubmissionAttachment.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], TaskSubmissionAttachment.prototype, "isMainSubmission", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], TaskSubmissionAttachment.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], TaskSubmissionAttachment.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TaskSubmissionAttachment.prototype, "uploadedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TaskSubmissionAttachment.prototype, "validatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], TaskSubmissionAttachment.prototype, "submissionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => task_submission_entity_1.TaskSubmission, (submission) => submission.attachments),
    (0, typeorm_1.JoinColumn)({ name: 'submissionId' }),
    __metadata("design:type", task_submission_entity_1.TaskSubmission)
], TaskSubmissionAttachment.prototype, "submission", void 0);
exports.TaskSubmissionAttachment = TaskSubmissionAttachment = __decorate([
    (0, typeorm_1.Entity)('task_submission_attachments')
], TaskSubmissionAttachment);
//# sourceMappingURL=task-submission-attachment.entity.js.map