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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const communications_service_1 = require("./communications.service");
const create_message_dto_1 = require("./dto/create-message.dto");
const create_notification_dto_1 = require("./dto/create-notification.dto");
const update_message_dto_1 = require("./dto/update-message.dto");
const update_notification_dto_1 = require("./dto/update-notification.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let CommunicationsController = class CommunicationsController {
    constructor(communicationsService) {
        this.communicationsService = communicationsService;
    }
    async createMessage(req, createMessageDto) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        return this.communicationsService.createMessage(userId, createMessageDto);
    }
    async findAllMessages(req, filters) {
        console.log('Controller: findAllMessages called');
        console.log('Controller: User:', req.user);
        try {
            const userId = req.user?.sub || req.user?.userId || req.user?.id;
            const result = await this.communicationsService.findAllMessages(userId, filters);
            console.log('Controller: Messages returned:', result.length);
            return result;
        }
        catch (error) {
            console.error('Controller: Error in findAllMessages:', error);
            throw error;
        }
    }
    async getUnreadMessagesCount(req) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        const count = await this.communicationsService.getUnreadMessagesCount(userId);
        return { count };
    }
    async findOneMessage(id) {
        return this.communicationsService.findOneMessage(id);
    }
    async updateMessage(id, req, updateMessageDto) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        return this.communicationsService.updateMessage(id, userId, updateMessageDto);
    }
    async deleteMessage(id, req) {
        console.log('=== DELETE CONTROLLER DEBUG ===');
        console.log('Request user:', req.user);
        console.log('User sub:', req.user?.sub);
        console.log('User ID:', req.user?.userId);
        console.log('Message ID to delete:', id);
        console.log('=== END DELETE CONTROLLER DEBUG ===');
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        return this.communicationsService.deleteMessage(id, userId);
    }
    async markAllMessagesAsRead(req) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        await this.communicationsService.markAllMessagesAsRead(userId);
        return { message: 'Todos los mensajes han sido marcados como leídos' };
    }
    async deleteAllMessages(req) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        const count = await this.communicationsService.deleteAllMessages(userId);
        return { message: 'Todos los mensajes han sido eliminados', deletedCount: count };
    }
    async createNotification(createNotificationDto) {
        return this.communicationsService.createNotification(createNotificationDto);
    }
    async findUserNotifications(req, filters) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        return this.communicationsService.findUserNotifications(userId, filters);
    }
    async updateNotification(id, req, updateNotificationDto) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        return this.communicationsService.updateNotification(id, userId, updateNotificationDto);
    }
    async getUnreadNotificationsCount(req) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        const count = await this.communicationsService.getUnreadNotificationsCount(userId);
        return { count };
    }
    async markAllNotificationsAsRead(req) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        await this.communicationsService.markAllNotificationsAsRead(userId);
        return { message: 'Todas las notificaciones han sido marcadas como leídas' };
    }
    async deleteNotification(id, req) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        await this.communicationsService.deleteNotification(id, userId);
        return { message: 'Notificación eliminada exitosamente' };
    }
    async deleteAllNotifications(req) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        const count = await this.communicationsService.deleteAllNotifications(userId);
        return { message: 'Todas las notificaciones han sido eliminadas', deletedCount: count };
    }
    async getUserMessagingStats(req) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        return this.communicationsService.getUserMessagingStats(userId);
    }
    async getAvailableRecipients(req) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        return this.communicationsService.getAvailableRecipients(userId);
    }
    async getAvailableGroups(req) {
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        return this.communicationsService.getAvailableGroups(userId);
    }
    async sendGroupMessage(req, groupId, createMessageDto) {
        const messageDto = { ...createMessageDto, targetGroupId: groupId };
        const userId = req.user?.sub || req.user?.userId || req.user?.id;
        return this.communicationsService.createMessage(userId, messageDto);
    }
    async createBulkNotifications(data) {
        const { userIds, notification } = data;
        const results = [];
        for (const userId of userIds) {
            try {
                const result = await this.communicationsService.createNotification({
                    ...notification,
                    userId,
                });
                results.push({ userId, success: true, notificationId: result.id });
            }
            catch (error) {
                results.push({ userId, success: false, error: error.message });
            }
        }
        return {
            total: userIds.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results,
        };
    }
};
exports.CommunicationsController = CommunicationsController;
__decorate([
    (0, common_1.Post)('messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar nuevo mensaje' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Mensaje enviado exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_message_dto_1.CreateMessageDto]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "createMessage", null);
__decorate([
    (0, common_1.Get)('messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener mensajes del usuario' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de mensajes obtenida exitosamente' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, description: 'Filtrar por tipo de mensaje' }),
    (0, swagger_1.ApiQuery)({ name: 'priority', required: false, description: 'Filtrar por prioridad' }),
    (0, swagger_1.ApiQuery)({ name: 'isRead', required: false, description: 'Filtrar por estado de lectura' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "findAllMessages", null);
__decorate([
    (0, common_1.Get)('messages/unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener número de mensajes no leídos' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contador obtenido exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY, user_entity_1.UserRole.STUDENT),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "getUnreadMessagesCount", null);
__decorate([
    (0, common_1.Get)('messages/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener mensaje específico' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mensaje obtenido exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Mensaje no encontrado' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY, user_entity_1.UserRole.STUDENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "findOneMessage", null);
__decorate([
    (0, common_1.Patch)('messages/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar mensaje' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mensaje actualizado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Mensaje no encontrado' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY, user_entity_1.UserRole.STUDENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_message_dto_1.UpdateMessageDto]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "updateMessage", null);
__decorate([
    (0, common_1.Delete)('messages/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar mensaje' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Mensaje eliminado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Mensaje no encontrado' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY, user_entity_1.UserRole.STUDENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "deleteMessage", null);
__decorate([
    (0, common_1.Post)('messages/mark-all-read'),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar todos los mensajes como leídos' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mensajes marcados como leídos' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY, user_entity_1.UserRole.STUDENT),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "markAllMessagesAsRead", null);
__decorate([
    (0, common_1.Delete)('messages/bulk/delete-all'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar todos los mensajes del usuario' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mensajes eliminados exitosamente' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY, user_entity_1.UserRole.STUDENT),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "deleteAllMessages", null);
__decorate([
    (0, common_1.Post)('notifications'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nueva notificación' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Notificación creada exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_notification_dto_1.CreateNotificationDto]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "createNotification", null);
__decorate([
    (0, common_1.Get)('notifications'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener notificaciones del usuario' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de notificaciones obtenida exitosamente' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, description: 'Filtrar por tipo de notificación' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Filtrar por estado' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY, user_entity_1.UserRole.STUDENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "findUserNotifications", null);
__decorate([
    (0, common_1.Patch)('notifications/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar notificación' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notificación actualizada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notificación no encontrada' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY, user_entity_1.UserRole.STUDENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_notification_dto_1.UpdateNotificationDto]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "updateNotification", null);
__decorate([
    (0, common_1.Get)('notifications/unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener número de notificaciones no leídas' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contador obtenido exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY, user_entity_1.UserRole.STUDENT),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "getUnreadNotificationsCount", null);
__decorate([
    (0, common_1.Post)('notifications/mark-all-read'),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar todas las notificaciones como leídas' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notificaciones marcadas como leídas' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY, user_entity_1.UserRole.STUDENT),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "markAllNotificationsAsRead", null);
__decorate([
    (0, common_1.Delete)('notifications/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar notificación permanentemente' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notificación eliminada exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notificación no encontrada' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY, user_entity_1.UserRole.STUDENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "deleteNotification", null);
__decorate([
    (0, common_1.Delete)('notifications/bulk/delete-all'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar todas las notificaciones del usuario' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notificaciones eliminadas exitosamente' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY, user_entity_1.UserRole.STUDENT),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "deleteAllNotifications", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estadísticas de mensajería del usuario' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estadísticas obtenidas exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY, user_entity_1.UserRole.STUDENT),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "getUserMessagingStats", null);
__decorate([
    (0, common_1.Get)('available-recipients'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener usuarios disponibles para enviar mensajes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de usuarios disponibles según permisos' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER, user_entity_1.UserRole.FAMILY, user_entity_1.UserRole.STUDENT),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "getAvailableRecipients", null);
__decorate([
    (0, common_1.Get)('available-groups'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener grupos disponibles para enviar mensajes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de grupos disponibles según permisos' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "getAvailableGroups", null);
__decorate([
    (0, common_1.Post)('messages/group/:groupId'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar mensaje a grupo de clase' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Mensaje grupal enviado exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('groupId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "sendGroupMessage", null);
__decorate([
    (0, common_1.Post)('notifications/bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear notificaciones masivas' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Notificaciones masivas creadas exitosamente' }),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "createBulkNotifications", null);
exports.CommunicationsController = CommunicationsController = __decorate([
    (0, swagger_1.ApiTags)('communications'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('communications'),
    __metadata("design:paramtypes", [communications_service_1.CommunicationsService])
], CommunicationsController);
//# sourceMappingURL=communications.controller.js.map