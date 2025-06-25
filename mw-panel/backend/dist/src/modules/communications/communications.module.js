"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const communications_service_1 = require("./communications.service");
const communications_controller_1 = require("./communications.controller");
const message_entity_1 = require("./entities/message.entity");
const notification_entity_1 = require("./entities/notification.entity");
const conversation_entity_1 = require("./entities/conversation.entity");
const message_attachment_entity_1 = require("./entities/message-attachment.entity");
const message_deletion_entity_1 = require("./entities/message-deletion.entity");
const user_entity_1 = require("../users/entities/user.entity");
const class_group_entity_1 = require("../students/entities/class-group.entity");
const student_entity_1 = require("../students/entities/student.entity");
let CommunicationsModule = class CommunicationsModule {
};
exports.CommunicationsModule = CommunicationsModule;
exports.CommunicationsModule = CommunicationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                message_entity_1.Message,
                notification_entity_1.Notification,
                conversation_entity_1.Conversation,
                message_attachment_entity_1.MessageAttachment,
                message_deletion_entity_1.MessageDeletion,
                user_entity_1.User,
                class_group_entity_1.ClassGroup,
                student_entity_1.Student,
            ]),
        ],
        controllers: [communications_controller_1.CommunicationsController],
        providers: [communications_service_1.CommunicationsService],
        exports: [communications_service_1.CommunicationsService],
    })
], CommunicationsModule);
//# sourceMappingURL=communications.module.js.map