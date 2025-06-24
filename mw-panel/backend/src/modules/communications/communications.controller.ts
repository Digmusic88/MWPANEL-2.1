import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommunicationsService } from './communications.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('communications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('communications')
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  // ==================== MESSAGES ====================

  @Post('messages')
  @ApiOperation({ summary: 'Enviar nuevo mensaje' })
  @ApiResponse({ status: 201, description: 'Mensaje enviado exitosamente' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY)
  async createMessage(@Request() req: any, @Body() createMessageDto: CreateMessageDto) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    return this.communicationsService.createMessage(userId, createMessageDto);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Obtener mensajes del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de mensajes obtenida exitosamente' })
  @ApiQuery({ name: 'type', required: false, description: 'Filtrar por tipo de mensaje' })
  @ApiQuery({ name: 'priority', required: false, description: 'Filtrar por prioridad' })
  @ApiQuery({ name: 'isRead', required: false, description: 'Filtrar por estado de lectura' })
  // @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY, UserRole.STUDENT) // Temporalmente removido para debug
  async findAllMessages(@Request() req: any, @Query() filters: any) {
    console.log('Controller: findAllMessages called');
    console.log('Controller: User:', req.user);
    
    // Debug info
    try {
      const userId = req.user?.sub || req.user?.userId || req.user?.id;
      const result = await this.communicationsService.findAllMessages(userId, filters);
      console.log('Controller: Messages returned:', result.length);
      return result;
    } catch (error) {
      console.error('Controller: Error in findAllMessages:', error);
      throw error;
    }
  }

  @Get('messages/unread-count')
  @ApiOperation({ summary: 'Obtener número de mensajes no leídos' })
  @ApiResponse({ status: 200, description: 'Contador obtenido exitosamente' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY, UserRole.STUDENT)
  async getUnreadMessagesCount(@Request() req: any) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    const count = await this.communicationsService.getUnreadMessagesCount(userId);
    return { count };
  }

  @Get('messages/:id')
  @ApiOperation({ summary: 'Obtener mensaje específico' })
  @ApiResponse({ status: 200, description: 'Mensaje obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Mensaje no encontrado' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY, UserRole.STUDENT)
  async findOneMessage(@Param('id') id: string) {
    return this.communicationsService.findOneMessage(id);
  }

  @Patch('messages/:id')
  @ApiOperation({ summary: 'Actualizar mensaje' })
  @ApiResponse({ status: 200, description: 'Mensaje actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Mensaje no encontrado' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY, UserRole.STUDENT)
  async updateMessage(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    return this.communicationsService.updateMessage(id, userId, updateMessageDto);
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Eliminar mensaje' })
  @ApiResponse({ status: 204, description: 'Mensaje eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Mensaje no encontrado' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY, UserRole.STUDENT)
  async deleteMessage(@Param('id') id: string, @Request() req: any) {
    console.log('=== DELETE CONTROLLER DEBUG ===');
    console.log('Request user:', req.user);
    console.log('User sub:', req.user?.sub);
    console.log('User ID:', req.user?.userId);
    console.log('Message ID to delete:', id);
    console.log('=== END DELETE CONTROLLER DEBUG ===');
    
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    return this.communicationsService.deleteMessage(id, userId);
  }

  @Post('messages/mark-all-read')
  @ApiOperation({ summary: 'Marcar todos los mensajes como leídos' })
  @ApiResponse({ status: 200, description: 'Mensajes marcados como leídos' })
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY, UserRole.STUDENT)
  async markAllMessagesAsRead(@Request() req: any) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    await this.communicationsService.markAllMessagesAsRead(userId);
    return { message: 'Todos los mensajes han sido marcados como leídos' };
  }

  @Delete('messages/bulk/delete-all')
  @ApiOperation({ summary: 'Eliminar todos los mensajes del usuario' })
  @ApiResponse({ status: 200, description: 'Mensajes eliminados exitosamente' })
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY, UserRole.STUDENT)
  async deleteAllMessages(@Request() req: any) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    const count = await this.communicationsService.deleteAllMessages(userId);
    return { message: 'Todos los mensajes han sido eliminados', deletedCount: count };
  }

  // ==================== NOTIFICATIONS ====================

  @Post('notifications')
  @ApiOperation({ summary: 'Crear nueva notificación' })
  @ApiResponse({ status: 201, description: 'Notificación creada exitosamente' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.communicationsService.createNotification(createNotificationDto);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Obtener notificaciones del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de notificaciones obtenida exitosamente' })
  @ApiQuery({ name: 'type', required: false, description: 'Filtrar por tipo de notificación' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrar por estado' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY, UserRole.STUDENT)
  async findUserNotifications(@Request() req: any, @Query() filters: any) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    return this.communicationsService.findUserNotifications(userId, filters);
  }

  @Patch('notifications/:id')
  @ApiOperation({ summary: 'Actualizar notificación' })
  @ApiResponse({ status: 200, description: 'Notificación actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY, UserRole.STUDENT)
  async updateNotification(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    return this.communicationsService.updateNotification(id, userId, updateNotificationDto);
  }

  @Get('notifications/unread-count')
  @ApiOperation({ summary: 'Obtener número de notificaciones no leídas' })
  @ApiResponse({ status: 200, description: 'Contador obtenido exitosamente' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY, UserRole.STUDENT)
  async getUnreadNotificationsCount(@Request() req: any) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    const count = await this.communicationsService.getUnreadNotificationsCount(userId);
    return { count };
  }

  @Post('notifications/mark-all-read')
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  @ApiResponse({ status: 200, description: 'Notificaciones marcadas como leídas' })
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY, UserRole.STUDENT)
  async markAllNotificationsAsRead(@Request() req: any) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    await this.communicationsService.markAllNotificationsAsRead(userId);
    return { message: 'Todas las notificaciones han sido marcadas como leídas' };
  }

  @Delete('notifications/:id')
  @ApiOperation({ summary: 'Eliminar notificación permanentemente' })
  @ApiResponse({ status: 200, description: 'Notificación eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY, UserRole.STUDENT)
  async deleteNotification(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    await this.communicationsService.deleteNotification(id, userId);
    return { message: 'Notificación eliminada exitosamente' };
  }

  @Delete('notifications/bulk/delete-all')
  @ApiOperation({ summary: 'Eliminar todas las notificaciones del usuario' })
  @ApiResponse({ status: 200, description: 'Notificaciones eliminadas exitosamente' })
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY, UserRole.STUDENT)
  async deleteAllNotifications(@Request() req: any) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    const count = await this.communicationsService.deleteAllNotifications(userId);
    return { message: 'Todas las notificaciones han sido eliminadas', deletedCount: count };
  }

  // ==================== STATISTICS ====================

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de mensajería del usuario' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY, UserRole.STUDENT)
  async getUserMessagingStats(@Request() req: any) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    return this.communicationsService.getUserMessagingStats(userId);
  }

  // ==================== AVAILABLE RECIPIENTS ====================

  @Get('available-recipients')
  @ApiOperation({ summary: 'Obtener usuarios disponibles para enviar mensajes' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios disponibles según permisos' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY, UserRole.STUDENT)
  async getAvailableRecipients(@Request() req: any) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    return this.communicationsService.getAvailableRecipients(userId);
  }

  @Get('available-groups')
  @ApiOperation({ summary: 'Obtener grupos disponibles para enviar mensajes' })
  @ApiResponse({ status: 200, description: 'Lista de grupos disponibles según permisos' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async getAvailableGroups(@Request() req: any) {
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    return this.communicationsService.getAvailableGroups(userId);
  }

  // ==================== BULK OPERATIONS ====================

  @Post('messages/group/:groupId')
  @ApiOperation({ summary: 'Enviar mensaje a grupo de clase' })
  @ApiResponse({ status: 201, description: 'Mensaje grupal enviado exitosamente' })
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async sendGroupMessage(
    @Request() req: any,
    @Param('groupId') groupId: string,
    @Body() createMessageDto: Omit<CreateMessageDto, 'targetGroupId'>,
  ) {
    const messageDto = { ...createMessageDto, targetGroupId: groupId };
    const userId = req.user?.sub || req.user?.userId || req.user?.id;
    return this.communicationsService.createMessage(userId, messageDto);
  }

  @Post('notifications/bulk')
  @ApiOperation({ summary: 'Crear notificaciones masivas' })
  @ApiResponse({ status: 201, description: 'Notificaciones masivas creadas exitosamente' })
  @Roles(UserRole.ADMIN)
  async createBulkNotifications(@Body() data: { userIds: string[], notification: Omit<CreateNotificationDto, 'userId'> }) {
    const { userIds, notification } = data;
    const results = [];

    for (const userId of userIds) {
      try {
        const result = await this.communicationsService.createNotification({
          ...notification,
          userId,
        });
        results.push({ userId, success: true, notificationId: result.id });
      } catch (error) {
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
}