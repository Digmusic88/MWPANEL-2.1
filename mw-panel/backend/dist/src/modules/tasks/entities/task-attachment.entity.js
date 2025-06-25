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
exports.TaskAttachment = exports.AttachmentType = void 0;
const typeorm_1 = require("typeorm");
const task_entity_1 = require("./task.entity");
var AttachmentType;
(function (AttachmentType) {
    AttachmentType["INSTRUCTION"] = "instruction";
    AttachmentType["TEMPLATE"] = "template";
    AttachmentType["REFERENCE"] = "reference";
    AttachmentType["EXAMPLE"] = "example";
    AttachmentType["RESOURCE"] = "resource";
})(AttachmentType || (exports.AttachmentType = AttachmentType = {}));
let TaskAttachment = class TaskAttachment {
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
};
exports.TaskAttachment = TaskAttachment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TaskAttachment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], TaskAttachment.prototype, "filename", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], TaskAttachment.prototype, "originalName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], TaskAttachment.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], TaskAttachment.prototype, "size", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], TaskAttachment.prototype, "path", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AttachmentType,
        default: AttachmentType.INSTRUCTION,
    }),
    __metadata("design:type", String)
], TaskAttachment.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], TaskAttachment.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], TaskAttachment.prototype, "downloadCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], TaskAttachment.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TaskAttachment.prototype, "uploadedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], TaskAttachment.prototype, "taskId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => task_entity_1.Task, (task) => task.attachments),
    (0, typeorm_1.JoinColumn)({ name: 'taskId' }),
    __metadata("design:type", task_entity_1.Task)
], TaskAttachment.prototype, "task", void 0);
exports.TaskAttachment = TaskAttachment = __decorate([
    (0, typeorm_1.Entity)('task_attachments')
], TaskAttachment);
//# sourceMappingURL=task-attachment.entity.js.map