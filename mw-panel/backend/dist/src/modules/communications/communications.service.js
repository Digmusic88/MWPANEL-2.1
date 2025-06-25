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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CommunicationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("./entities/message.entity");
const notification_entity_1 = require("./entities/notification.entity");
const conversation_entity_1 = require("./entities/conversation.entity");
const message_attachment_entity_1 = require("./entities/message-attachment.entity");
const message_deletion_entity_1 = require("./entities/message-deletion.entity");
const user_entity_1 = require("../users/entities/user.entity");
const class_group_entity_1 = require("../students/entities/class-group.entity");
const student_entity_1 = require("../students/entities/student.entity");
let CommunicationsService = CommunicationsService_1 = class CommunicationsService {
    constructor(messageRepository, notificationRepository, conversationRepository, attachmentRepository, messageDeletionRepository, userRepository, classGroupRepository, studentRepository) {
        this.messageRepository = messageRepository;
        this.notificationRepository = notificationRepository;
        this.conversationRepository = conversationRepository;
        this.attachmentRepository = attachmentRepository;
        this.messageDeletionRepository = messageDeletionRepository;
        this.userRepository = userRepository;
        this.classGroupRepository = classGroupRepository;
        this.studentRepository = studentRepository;
        this.logger = new common_1.Logger(CommunicationsService_1.name);
    }
    async createMessage(senderId, createMessageDto) {
        const { recipientId, targetGroupId, relatedStudentId, parentMessageId, ...messageData } = createMessageDto;
        const sender = await this.userRepository.findOne({ where: { id: senderId } });
        if (!sender) {
            throw new common_1.NotFoundException('Remitente no encontrado');
        }
        let recipient = null;
        if (recipientId) {
            recipient = await this.userRepository.findOne({ where: { id: recipientId } });
            if (!recipient) {
                throw new common_1.NotFoundException('Destinatario no encontrado');
            }
        }
        let targetGroup = null;
        if (targetGroupId) {
            targetGroup = await this.classGroupRepository.findOne({
                where: { id: targetGroupId },
                relations: ['students', 'students.user', 'tutor', 'tutor.user'],
            });
            if (!targetGroup) {
                throw new common_1.NotFoundException('Grupo destinatario no encontrado');
            }
        }
        let relatedStudent = null;
        if (relatedStudentId) {
            relatedStudent = await this.studentRepository.findOne({
                where: { id: relatedStudentId },
                relations: ['user'],
            });
            if (!relatedStudent) {
                throw new common_1.NotFoundException('Estudiante relacionado no encontrado');
            }
        }
        let parentMessage = null;
        if (parentMessageId) {
            parentMessage = await this.messageRepository.findOne({
                where: { id: parentMessageId },
            });
            if (!parentMessage) {
                throw new common_1.NotFoundException('Mensaje padre no encontrado');
            }
        }
        await this.validateSendPermissions(sender, recipient, targetGroup, relatedStudent);
        const message = this.messageRepository.create({
            ...messageData,
            sender,
            senderId,
            recipient,
            recipientId,
            targetGroup,
            targetGroupId,
            relatedStudent,
            relatedStudentId,
            parentMessage,
            parentMessageId,
        });
        const savedMessage = await this.messageRepository.save(message);
        await this.createMessageNotifications(savedMessage);
        return this.findOneMessage(savedMessage.id);
    }
    async findAllMessages(userId, filters) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        let queryBuilder = this.messageRepository.createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .leftJoinAndSelect('sender.profile', 'senderProfile')
            .leftJoinAndSelect('message.recipient', 'recipient')
            .leftJoinAndSelect('recipient.profile', 'recipientProfile')
            .leftJoinAndSelect('message.targetGroup', 'targetGroup')
            .leftJoinAndSelect('message.relatedStudent', 'relatedStudent')
            .leftJoinAndSelect('relatedStudent.user', 'studentUser')
            .leftJoinAndSelect('studentUser.profile', 'studentProfile')
            .leftJoinAndSelect('message.parentMessage', 'parentMessage')
            .leftJoinAndSelect('message.attachments', 'attachments')
            .where('message.isDeleted = :isDeleted', { isDeleted: false });
        if (user.role !== user_entity_1.UserRole.ADMIN) {
            queryBuilder.andWhere(`
        NOT EXISTS (
          SELECT 1 FROM message_deletions md 
          WHERE md."messageId" = message.id AND md."userId" = :userId
        )
      `, { userId });
        }
        if (user.role === user_entity_1.UserRole.TEACHER) {
            const teacherGroups = await this.classGroupRepository.find({
                where: { tutor: { user: { id: userId } } },
                select: ['id'],
                relations: ['tutor', 'tutor.user']
            });
            const groupIds = teacherGroups.map(g => g.id);
            if (groupIds.length > 0) {
                queryBuilder.andWhere('(message.senderId = :userId OR message.recipientId = :userId OR message.targetGroupId IN (:...groupIds))', { userId, groupIds });
            }
            else {
                queryBuilder.andWhere('(message.senderId = :userId OR message.recipientId = :userId)', { userId });
            }
        }
        else if (user.role === user_entity_1.UserRole.FAMILY) {
            queryBuilder.andWhere('(message.senderId = :userId OR message.recipientId = :userId)', { userId });
        }
        else if (user.role === user_entity_1.UserRole.ADMIN) {
        }
        if (filters?.type) {
            queryBuilder.andWhere('message.type = :type', { type: filters.type });
        }
        if (filters?.priority) {
            queryBuilder.andWhere('message.priority = :priority', { priority: filters.priority });
        }
        if (filters?.isRead !== undefined) {
            queryBuilder.andWhere('message.isRead = :isRead', { isRead: filters.isRead });
        }
        if (filters?.search) {
            queryBuilder.andWhere('(message.subject ILIKE :search OR message.content ILIKE :search)', { search: `%${filters.search}%` });
        }
        return queryBuilder
            .orderBy('message.createdAt', 'DESC')
            .getMany();
    }
    async findAllMessagesOld(userId, filters) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const queryBuilder = this.messageRepository.createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .leftJoinAndSelect('sender.profile', 'senderProfile')
            .leftJoinAndSelect('message.recipient', 'recipient')
            .leftJoinAndSelect('recipient.profile', 'recipientProfile')
            .leftJoinAndSelect('message.targetGroup', 'targetGroup')
            .leftJoinAndSelect('message.relatedStudent', 'relatedStudent')
            .leftJoinAndSelect('relatedStudent.user', 'relatedStudentUser')
            .leftJoinAndSelect('relatedStudentUser.profile', 'relatedStudentProfile')
            .leftJoinAndSelect('message.parentMessage', 'parentMessage')
            .leftJoinAndSelect('message.attachments', 'attachments')
            .where('message.isDeleted = :isDeleted', { isDeleted: false });
        if (user.role === user_entity_1.UserRole.TEACHER) {
            queryBuilder.andWhere(`(
        message.senderId = :userId OR 
        message.recipientId = :userId OR 
        targetGroup.tutorId = :userId
      )`, { userId });
        }
        else {
            queryBuilder.andWhere(`(
        message.senderId = :userId OR 
        message.recipientId = :userId
      )`, { userId });
        }
        if (filters?.type) {
            queryBuilder.andWhere('message.type = :type', { type: filters.type });
        }
        if (filters?.priority) {
            queryBuilder.andWhere('message.priority = :priority', { priority: filters.priority });
        }
        if (filters?.isRead !== undefined) {
            queryBuilder.andWhere('message.isRead = :isRead', { isRead: filters.isRead });
        }
        return queryBuilder
            .orderBy('message.createdAt', 'DESC')
            .getMany();
    }
    async findOneMessage(id) {
        const message = await this.messageRepository.findOne({
            where: { id, isDeleted: false },
            relations: [
                'sender',
                'sender.profile',
                'recipient',
                'recipient.profile',
                'targetGroup',
                'relatedStudent',
                'relatedStudent.user',
                'relatedStudent.user.profile',
                'parentMessage',
                'replies',
                'attachments',
            ],
        });
        if (!message) {
            throw new common_1.NotFoundException('Mensaje no encontrado');
        }
        return message;
    }
    async updateMessage(id, userId, updateMessageDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const message = await this.findOneMessage(id);
        const canUpdate = user.role === user_entity_1.UserRole.ADMIN ||
            message.senderId === userId ||
            message.recipientId === userId ||
            (message.type === message_entity_1.MessageType.ANNOUNCEMENT);
        if (!canUpdate) {
            throw new common_1.ForbiddenException('No tienes permisos para actualizar este mensaje');
        }
        if (updateMessageDto.isRead !== undefined) {
            message.isRead = updateMessageDto.isRead;
            if (updateMessageDto.isRead) {
                message.readAt = new Date();
            }
        }
        if (updateMessageDto.isArchived !== undefined) {
            message.isArchived = updateMessageDto.isArchived;
        }
        if (updateMessageDto.status) {
            message.status = updateMessageDto.status;
        }
        return this.messageRepository.save(message);
    }
    async deleteMessage(id, userId) {
        this.logger.debug(`=== DELETE MESSAGE DEBUG ===`);
        this.logger.debug(`Attempting to delete message ${id} by user ${userId}`);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        this.logger.debug(`User found: ${user.email}, role: ${user.role}`);
        const message = await this.findOneMessage(id);
        this.logger.debug(`Message found: senderId=${message.senderId}, recipientId=${message.recipientId}, type=${message.type}`);
        const isAdmin = user.role === user_entity_1.UserRole.ADMIN;
        const isSender = message.senderId === userId;
        const isRecipient = message.recipientId === userId;
        const isAnnouncement = message.type === message_entity_1.MessageType.ANNOUNCEMENT;
        this.logger.debug(`Permission checks: isAdmin=${isAdmin}, isSender=${isSender}, isRecipient=${isRecipient}, isAnnouncement=${isAnnouncement}`);
        const canDelete = isAdmin || isSender || isRecipient || isAnnouncement;
        this.logger.debug(`Final canDelete result: ${canDelete}`);
        if (!canDelete) {
            this.logger.error(`Permission denied for user ${userId} (${user.role}) to delete message ${id}`);
            throw new common_1.ForbiddenException('No tienes permisos para eliminar este mensaje');
        }
        if (isAdmin) {
            message.isDeleted = true;
            await this.messageRepository.save(message);
            this.logger.debug(`Admin deletion - marking message as completely deleted`);
        }
        else {
            const existingDeletion = await this.messageDeletionRepository.findOne({
                where: { messageId: id, userId }
            });
            if (!existingDeletion) {
                const deletion = this.messageDeletionRepository.create({
                    messageId: id,
                    userId,
                    message,
                    user,
                });
                await this.messageDeletionRepository.save(deletion);
                this.logger.debug(`Created personal deletion record for user ${userId} and message ${id}`);
                if (message.type === message_entity_1.MessageType.DIRECT && message.recipientId) {
                    const allDeletions = await this.messageDeletionRepository.count({
                        where: { messageId: id }
                    });
                    if (allDeletions >= 2) {
                        message.isDeleted = true;
                        await this.messageRepository.save(message);
                        this.logger.debug(`Both users deleted direct message - marking as completely deleted`);
                    }
                }
            }
            else {
                this.logger.debug(`User ${userId} already deleted message ${id}`);
            }
        }
        this.logger.log(`Usuario ${userId} eliminó el mensaje ${id} exitosamente`);
        this.logger.debug(`=== END DELETE MESSAGE DEBUG ===`);
    }
    async createNotification(createNotificationDto) {
        const { userId, triggeredById, relatedStudentId, relatedGroupId, ...notificationData } = createNotificationDto;
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('Usuario destinatario no encontrado');
        }
        let triggeredBy = null;
        if (triggeredById) {
            triggeredBy = await this.userRepository.findOne({ where: { id: triggeredById } });
        }
        let relatedStudent = null;
        if (relatedStudentId) {
            relatedStudent = await this.studentRepository.findOne({ where: { id: relatedStudentId } });
        }
        let relatedGroup = null;
        if (relatedGroupId) {
            relatedGroup = await this.classGroupRepository.findOne({ where: { id: relatedGroupId } });
        }
        const notification = this.notificationRepository.create({
            ...notificationData,
            user,
            userId,
            triggeredBy,
            triggeredById,
            relatedStudent,
            relatedStudentId,
            relatedGroup,
            relatedGroupId,
        });
        return this.notificationRepository.save(notification);
    }
    async findUserNotifications(userId, filters) {
        const queryBuilder = this.notificationRepository.createQueryBuilder('notification')
            .leftJoinAndSelect('notification.triggeredBy', 'triggeredBy')
            .leftJoinAndSelect('triggeredBy.profile', 'triggeredByProfile')
            .leftJoinAndSelect('notification.relatedStudent', 'relatedStudent')
            .leftJoinAndSelect('relatedStudent.user', 'relatedStudentUser')
            .leftJoinAndSelect('relatedStudentUser.profile', 'relatedStudentProfile')
            .leftJoinAndSelect('notification.relatedGroup', 'relatedGroup')
            .where('notification.userId = :userId', { userId });
        if (filters?.type) {
            queryBuilder.andWhere('notification.type = :type', { type: filters.type });
        }
        if (filters?.status) {
            queryBuilder.andWhere('notification.status = :status', { status: filters.status });
        }
        return queryBuilder
            .orderBy('notification.createdAt', 'DESC')
            .getMany();
    }
    async updateNotification(id, userId, updateNotificationDto) {
        const notification = await this.notificationRepository.findOne({
            where: { id, userId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notificación no encontrada');
        }
        if (updateNotificationDto.status) {
            notification.status = updateNotificationDto.status;
            if (updateNotificationDto.status === notification_entity_1.NotificationStatus.READ) {
                notification.readAt = new Date();
            }
            else if (updateNotificationDto.status === notification_entity_1.NotificationStatus.DISMISSED) {
                notification.dismissedAt = new Date();
            }
        }
        return this.notificationRepository.save(notification);
    }
    async getUnreadNotificationsCount(userId) {
        return this.notificationRepository.count({
            where: {
                userId,
                status: notification_entity_1.NotificationStatus.UNREAD,
            },
        });
    }
    async markAllNotificationsAsRead(userId) {
        await this.notificationRepository.update({ userId, status: notification_entity_1.NotificationStatus.UNREAD }, { status: notification_entity_1.NotificationStatus.READ, readAt: new Date() });
    }
    async deleteNotification(notificationId, userId) {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId, userId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notificación no encontrada');
        }
        await this.notificationRepository.remove(notification);
    }
    async deleteAllNotifications(userId) {
        const notifications = await this.notificationRepository.find({
            where: { userId },
        });
        const count = notifications.length;
        await this.notificationRepository.remove(notifications);
        return count;
    }
    async validateSendPermissions(sender, recipient, targetGroup, relatedStudent) {
        this.logger.debug(`=== VALIDATE SEND PERMISSIONS ===`);
        this.logger.debug(`Sender: ${sender.email} (${sender.role})`);
        this.logger.debug(`Recipient: ${recipient?.email || 'N/A'} (${recipient?.role || 'N/A'})`);
        this.logger.debug(`TargetGroup: ${targetGroup?.name || 'N/A'}`);
        this.logger.debug(`RelatedStudent: ${relatedStudent?.id || 'N/A'}`);
        if (sender.role === user_entity_1.UserRole.ADMIN) {
            this.logger.debug('Admin sender - all permissions granted');
            return;
        }
        if (sender.role === user_entity_1.UserRole.TEACHER) {
            this.logger.debug('Teacher sender - validating permissions');
            if (recipient) {
                if (recipient.role === user_entity_1.UserRole.ADMIN || recipient.role === user_entity_1.UserRole.TEACHER) {
                    this.logger.debug('Teacher to Admin/Teacher - allowed');
                    return;
                }
                if (recipient.role === user_entity_1.UserRole.FAMILY) {
                    if (!relatedStudent) {
                        this.logger.debug('Teacher to Family without relatedStudent - allowed for general communication');
                        return;
                    }
                    const teacher = await this.userRepository.findOne({
                        where: { id: sender.id },
                        relations: ['profile']
                    });
                    if (!teacher) {
                        this.logger.error(`Teacher user ${sender.id} not found`);
                        throw new common_1.ForbiddenException('Usuario profesor no encontrado');
                    }
                    const classGroups = await this.classGroupRepository.find({
                        where: { tutor: { user: { id: sender.id } } },
                        relations: ['students', 'tutor', 'tutor.user'],
                    });
                    this.logger.debug(`Found ${classGroups.length} class groups for teacher ${sender.id}`);
                    const hasStudent = classGroups.some(group => group.students.some(student => student.id === relatedStudent.id));
                    if (!hasStudent) {
                        this.logger.error(`Teacher ${sender.id} doesn't have access to student ${relatedStudent.id}. Groups: ${classGroups.map(g => g.name).join(', ')}`);
                        throw new common_1.ForbiddenException('No tienes permisos para contactar con esta familia sobre este estudiante');
                    }
                    this.logger.debug('Teacher to Family with valid student - allowed');
                    return;
                }
                if (recipient.role === user_entity_1.UserRole.STUDENT) {
                    this.logger.debug('Teacher to Student - allowed');
                    return;
                }
            }
            if (targetGroup) {
                const isGroupTutor = await this.classGroupRepository.findOne({
                    where: { id: targetGroup.id, tutor: { user: { id: sender.id } } },
                    relations: ['tutor', 'tutor.user']
                });
                if (!isGroupTutor) {
                    this.logger.error(`Teacher ${sender.id} is not tutor of group ${targetGroup.id}`);
                    throw new common_1.ForbiddenException('No tienes permisos para enviar mensajes a este grupo');
                }
                this.logger.debug('Teacher to own group - allowed');
                return;
            }
            this.logger.debug('Teacher general case - allowed');
            return;
        }
        else if (sender.role === user_entity_1.UserRole.FAMILY) {
            this.logger.debug('Family sender - validating permissions');
            if (recipient && ![user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.ADMIN].includes(recipient.role)) {
                this.logger.error(`Family ${sender.id} trying to contact ${recipient.role}`);
                throw new common_1.ForbiddenException('Las familias solo pueden contactar con profesores y administración');
            }
            this.logger.debug('Family to Teacher/Admin - allowed');
            return;
        }
        else if (sender.role === user_entity_1.UserRole.STUDENT) {
            this.logger.debug('Student sender - validating permissions');
            if (recipient && ![user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.ADMIN].includes(recipient.role)) {
                this.logger.error(`Student ${sender.id} trying to contact ${recipient.role}`);
                throw new common_1.ForbiddenException('Los estudiantes solo pueden contactar con profesores y administración');
            }
            this.logger.debug('Student to Teacher/Admin - allowed');
            return;
        }
        this.logger.debug('=== END VALIDATE SEND PERMISSIONS ===');
    }
    async createMessageNotifications(message) {
        this.logger.debug(`=== CREATE MESSAGE NOTIFICATIONS ===`);
        this.logger.debug(`Message ID: ${message.id}, Sender: ${message.senderId}, Recipient: ${message.recipientId || 'N/A'}`);
        const notifications = [];
        if (message.recipient) {
            const notificationDto = {
                title: `Nuevo mensaje de ${message.sender.profile?.firstName} ${message.sender.profile?.lastName}`,
                content: message.subject,
                type: notification_entity_1.NotificationType.MESSAGE,
                userId: message.recipientId,
                triggeredById: message.senderId,
                relatedStudentId: message.relatedStudentId,
                actionUrl: `/messages/${message.id}`,
            };
            notifications.push(notificationDto);
            this.logger.debug(`Added direct message notification for user ${message.recipientId}`);
        }
        else if (message.targetGroup) {
            const groupUsers = await this.getGroupUsers(message.targetGroup);
            this.logger.debug(`Found ${groupUsers.length} users in group ${message.targetGroup.name}`);
            for (const user of groupUsers) {
                if (user.id !== message.senderId) {
                    notifications.push({
                        title: `Nuevo mensaje grupal en ${message.targetGroup.name}`,
                        content: message.subject,
                        type: notification_entity_1.NotificationType.MESSAGE,
                        userId: user.id,
                        triggeredById: message.senderId,
                        relatedGroupId: message.targetGroupId,
                        actionUrl: `/messages/${message.id}`,
                    });
                    this.logger.debug(`Added group message notification for user ${user.id}`);
                }
            }
        }
        this.logger.debug(`Creating ${notifications.length} notifications`);
        for (const notificationDto of notifications) {
            try {
                const createdNotification = await this.createNotification(notificationDto);
                this.logger.debug(`Notification created successfully: ${createdNotification.id} for user ${notificationDto.userId}`);
            }
            catch (error) {
                this.logger.error(`Error creating notification for user ${notificationDto.userId}:`, error);
            }
        }
        this.logger.debug(`=== END CREATE MESSAGE NOTIFICATIONS ===`);
    }
    async getGroupUsers(group) {
        const users = [];
        if (group.tutor && group.tutor.user && group.tutor.user.id) {
            const tutor = await this.userRepository.findOne({
                where: { id: group.tutor.user.id },
            });
            if (tutor)
                users.push(tutor);
        }
        for (const student of group.students) {
            if (student.user) {
                users.push(student.user);
            }
        }
        return users;
    }
    async getUserMessagingStats(userId) {
        const [totalSent, totalReceived, unreadMessages, unreadNotifications,] = await Promise.all([
            this.messageRepository.count({
                where: { senderId: userId, isDeleted: false, isDeletedBySender: false },
            }),
            this.messageRepository.count({
                where: { recipientId: userId, isDeleted: false, isDeletedByRecipient: false },
            }),
            this.getUnreadMessagesCount(userId),
            this.getUnreadNotificationsCount(userId),
        ]);
        return {
            totalSent,
            totalReceived,
            unreadMessages,
            unreadNotifications,
            totalMessages: totalSent + totalReceived,
        };
    }
    async getUnreadMessagesCount(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const queryBuilder = this.messageRepository.createQueryBuilder('message')
            .where('message.isDeleted = :isDeleted AND message.isRead = :isRead', {
            isDeleted: false,
            isRead: false
        })
            .andWhere('message.senderId != :userId', { userId });
        if (user.role !== user_entity_1.UserRole.ADMIN) {
            queryBuilder.andWhere(`
        NOT EXISTS (
          SELECT 1 FROM message_deletions md 
          WHERE md."messageId" = message.id AND md."userId" = :userId
        )
      `, { userId });
        }
        if (user.role === user_entity_1.UserRole.TEACHER) {
            const teacherGroups = await this.classGroupRepository.find({
                where: { tutor: { user: { id: userId } } },
                select: ['id'],
                relations: ['tutor', 'tutor.user']
            });
            const groupIds = teacherGroups.map(g => g.id);
            if (groupIds.length > 0) {
                queryBuilder.andWhere('(message.senderId = :userId OR message.recipientId = :userId OR message.targetGroupId IN (:...groupIds))', { userId, groupIds });
            }
            else {
                queryBuilder.andWhere('(message.senderId = :userId OR message.recipientId = :userId)', { userId });
            }
        }
        else if (user.role === user_entity_1.UserRole.FAMILY) {
            queryBuilder.andWhere('(message.senderId = :userId OR message.recipientId = :userId)', { userId });
        }
        else if (user.role === user_entity_1.UserRole.ADMIN) {
        }
        return queryBuilder.getCount();
    }
    async getAvailableRecipients(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['profile']
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        this.logger.debug(`Getting available recipients for user ${user.email} (${user.role})`);
        let availableUsers = [];
        if (user.role === user_entity_1.UserRole.ADMIN) {
            availableUsers = await this.userRepository.find({
                where: { isActive: true },
                relations: ['profile'],
                order: { role: 'ASC', profile: { firstName: 'ASC' } }
            });
        }
        else if (user.role === user_entity_1.UserRole.TEACHER) {
            availableUsers = await this.userRepository.find({
                where: {
                    isActive: true,
                    role: (0, typeorm_2.In)([user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY, user_entity_1.UserRole.STUDENT])
                },
                relations: ['profile'],
                order: { role: 'ASC', profile: { firstName: 'ASC' } }
            });
        }
        else if (user.role === user_entity_1.UserRole.FAMILY) {
            availableUsers = await this.userRepository.find({
                where: {
                    isActive: true,
                    role: (0, typeorm_2.In)([user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER])
                },
                relations: ['profile'],
                order: { role: 'ASC', profile: { firstName: 'ASC' } }
            });
        }
        else if (user.role === user_entity_1.UserRole.STUDENT) {
            availableUsers = await this.userRepository.find({
                where: {
                    isActive: true,
                    role: (0, typeorm_2.In)([user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER])
                },
                relations: ['profile'],
                order: { role: 'ASC', profile: { firstName: 'ASC' } }
            });
        }
        availableUsers = availableUsers.filter(u => u.id !== userId);
        const formattedUsers = availableUsers.map(u => ({
            id: u.id,
            email: u.email,
            role: u.role,
            profile: {
                firstName: u.profile?.firstName || '',
                lastName: u.profile?.lastName || ''
            },
            displayName: `${u.profile?.firstName || ''} ${u.profile?.lastName || ''} (${u.role})`.trim()
        }));
        this.logger.debug(`Found ${formattedUsers.length} available recipients for ${user.role}`);
        return formattedUsers;
    }
    async getAvailableGroups(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['profile']
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        this.logger.debug(`Getting available groups for user ${user.email} (${user.role})`);
        let availableGroups = [];
        if (user.role === user_entity_1.UserRole.ADMIN) {
            availableGroups = await this.classGroupRepository.find({
                relations: ['tutor', 'tutor.user', 'tutor.user.profile'],
                order: { name: 'ASC' }
            });
        }
        else if (user.role === user_entity_1.UserRole.TEACHER) {
            availableGroups = await this.classGroupRepository.find({
                where: { tutor: { user: { id: userId } } },
                relations: ['tutor', 'tutor.user', 'tutor.user.profile'],
                order: { name: 'ASC' }
            });
        }
        const formattedGroups = availableGroups.map(g => ({
            id: g.id,
            name: g.name,
            section: g.section,
            tutor: g.tutor ? {
                id: g.tutor.id,
                name: `${g.tutor.user?.profile?.firstName || ''} ${g.tutor.user?.profile?.lastName || ''}`.trim()
            } : null,
            displayName: g.section ? `${g.name} - ${g.section}` : g.name
        }));
        this.logger.debug(`Found ${formattedGroups.length} available groups for ${user.role}`);
        return formattedGroups;
    }
    async markAllMessagesAsRead(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const queryBuilder = this.messageRepository.createQueryBuilder('message')
            .where('message.isDeleted = :isDeleted AND message.isRead = :isRead', {
            isDeleted: false,
            isRead: false
        });
        if (user.role !== user_entity_1.UserRole.ADMIN) {
            queryBuilder.andWhere(`
        NOT EXISTS (
          SELECT 1 FROM message_deletions md 
          WHERE md."messageId" = message.id AND md."userId" = :userId
        )
      `, { userId });
        }
        if (user.role === user_entity_1.UserRole.TEACHER) {
            const teacherGroups = await this.classGroupRepository.find({
                where: { tutor: { user: { id: userId } } },
                select: ['id'],
                relations: ['tutor', 'tutor.user']
            });
            const groupIds = teacherGroups.map(g => g.id);
            if (groupIds.length > 0) {
                queryBuilder.andWhere('(message.senderId = :userId OR message.recipientId = :userId OR message.targetGroupId IN (:...groupIds))', { userId, groupIds });
            }
            else {
                queryBuilder.andWhere('(message.senderId = :userId OR message.recipientId = :userId)', { userId });
            }
        }
        else if (user.role === user_entity_1.UserRole.FAMILY) {
            queryBuilder.andWhere('(message.senderId = :userId OR message.recipientId = :userId)', { userId });
        }
        else if (user.role === user_entity_1.UserRole.ADMIN) {
        }
        const messages = await queryBuilder.select('message.id').getMany();
        const messageIds = messages.map(m => m.id);
        if (messageIds.length > 0) {
            await this.messageRepository.update({ id: (0, typeorm_2.In)(messageIds) }, {
                isRead: true,
                readAt: new Date()
            });
        }
        this.logger.log(`Usuario ${userId} marcó ${messageIds.length} mensajes como leídos`);
    }
    async deleteAllMessages(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        if (user.role === user_entity_1.UserRole.ADMIN) {
            const result = await this.messageRepository.update({ isDeleted: false }, { isDeleted: true });
            const deletedCount = result.affected || 0;
            this.logger.log(`Admin ${userId} eliminó completamente ${deletedCount} mensajes`);
            return deletedCount;
        }
        const queryBuilder = this.messageRepository.createQueryBuilder('message')
            .where('message.isDeleted = :isDeleted', { isDeleted: false });
        queryBuilder.andWhere(`
      NOT EXISTS (
        SELECT 1 FROM message_deletions md 
        WHERE md."messageId" = message.id AND md."userId" = :userId
      )
    `, { userId });
        if (user.role === user_entity_1.UserRole.TEACHER) {
            const teacherGroups = await this.classGroupRepository.find({
                where: { tutor: { user: { id: userId } } },
                select: ['id'],
                relations: ['tutor', 'tutor.user']
            });
            const groupIds = teacherGroups.map(g => g.id);
            if (groupIds.length > 0) {
                queryBuilder.andWhere('(message.senderId = :userId OR message.recipientId = :userId OR message.targetGroupId IN (:...groupIds))', { userId, groupIds });
            }
            else {
                queryBuilder.andWhere('(message.senderId = :userId OR message.recipientId = :userId)', { userId });
            }
        }
        else if (user.role === user_entity_1.UserRole.FAMILY) {
            queryBuilder.andWhere('(message.senderId = :userId OR message.recipientId = :userId)', { userId });
        }
        const messages = await queryBuilder.select('message.id').getMany();
        const messageIds = messages.map(m => m.id);
        let deletedCount = 0;
        if (messageIds.length > 0) {
            const deletions = messageIds.map(messageId => ({
                messageId,
                userId,
            }));
            await this.messageDeletionRepository.insert(deletions);
            deletedCount = messageIds.length;
            const directMessages = await this.messageRepository.find({
                where: {
                    id: (0, typeorm_2.In)(messageIds),
                    type: message_entity_1.MessageType.DIRECT,
                    recipientId: (0, typeorm_2.Not)((0, typeorm_2.IsNull)())
                }
            });
            for (const message of directMessages) {
                const allDeletions = await this.messageDeletionRepository.count({
                    where: { messageId: message.id }
                });
                if (allDeletions >= 2) {
                    await this.messageRepository.update({ id: message.id }, { isDeleted: true });
                    this.logger.debug(`Both users deleted direct message ${message.id} - marking as completely deleted`);
                }
            }
        }
        this.logger.log(`Usuario ${userId} eliminó ${deletedCount} mensajes`);
        return deletedCount;
    }
};
exports.CommunicationsService = CommunicationsService;
exports.CommunicationsService = CommunicationsService = CommunicationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(1, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(2, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(3, (0, typeorm_1.InjectRepository)(message_attachment_entity_1.MessageAttachment)),
    __param(4, (0, typeorm_1.InjectRepository)(message_deletion_entity_1.MessageDeletion)),
    __param(5, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(6, (0, typeorm_1.InjectRepository)(class_group_entity_1.ClassGroup)),
    __param(7, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CommunicationsService);
//# sourceMappingURL=communications.service.js.map