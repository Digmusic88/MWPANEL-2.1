import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, IsNull } from 'typeorm';
import { Message, MessageType, MessageStatus } from './entities/message.entity';
import { Notification, NotificationType, NotificationStatus } from './entities/notification.entity';
import { Conversation, ConversationType } from './entities/conversation.entity';
import { MessageAttachment } from './entities/message-attachment.entity';
import { MessageDeletion } from './entities/message-deletion.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { ClassGroup } from '../students/entities/class-group.entity';
import { Student } from '../students/entities/student.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class CommunicationsService {
  private readonly logger = new Logger(CommunicationsService.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(MessageAttachment)
    private readonly attachmentRepository: Repository<MessageAttachment>,
    @InjectRepository(MessageDeletion)
    private readonly messageDeletionRepository: Repository<MessageDeletion>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ClassGroup)
    private readonly classGroupRepository: Repository<ClassGroup>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  // ==================== MESSAGES ====================

  async createMessage(senderId: string, createMessageDto: CreateMessageDto): Promise<Message> {
    const { recipientId, targetGroupId, relatedStudentId, parentMessageId, ...messageData } = createMessageDto;

    // Verificar que el remitente existe
    const sender = await this.userRepository.findOne({ where: { id: senderId } });
    if (!sender) {
      throw new NotFoundException('Remitente no encontrado');
    }

    // Validar destinatario para mensajes directos
    let recipient = null;
    if (recipientId) {
      recipient = await this.userRepository.findOne({ where: { id: recipientId } });
      if (!recipient) {
        throw new NotFoundException('Destinatario no encontrado');
      }
    }

    // Validar grupo destinatario para mensajes grupales
    let targetGroup = null;
    if (targetGroupId) {
      targetGroup = await this.classGroupRepository.findOne({
        where: { id: targetGroupId },
        relations: ['students', 'students.user', 'tutor', 'tutor.user'],
      });
      if (!targetGroup) {
        throw new NotFoundException('Grupo destinatario no encontrado');
      }
    }

    // Validar estudiante relacionado
    let relatedStudent = null;
    if (relatedStudentId) {
      relatedStudent = await this.studentRepository.findOne({
        where: { id: relatedStudentId },
        relations: ['user'],
      });
      if (!relatedStudent) {
        throw new NotFoundException('Estudiante relacionado no encontrado');
      }
    }

    // Validar mensaje padre
    let parentMessage = null;
    if (parentMessageId) {
      parentMessage = await this.messageRepository.findOne({
        where: { id: parentMessageId },
      });
      if (!parentMessage) {
        throw new NotFoundException('Mensaje padre no encontrado');
      }
    }

    // Validar permisos de envío
    await this.validateSendPermissions(sender, recipient, targetGroup, relatedStudent);

    // Crear el mensaje
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

    // Crear notificaciones para los destinatarios
    await this.createMessageNotifications(savedMessage);

    return this.findOneMessage(savedMessage.id);
  }


  async findAllMessages(userId: string, filters?: any): Promise<Message[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
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

    // Filtrar mensajes eliminados por el usuario actual usando la tabla de eliminaciones
    if (user.role !== UserRole.ADMIN) {
      queryBuilder.andWhere(`
        NOT EXISTS (
          SELECT 1 FROM message_deletions md 
          WHERE md."messageId" = message.id AND md."userId" = :userId
        )
      `, { userId });
    }

    // Filtros por rol del usuario
    if (user.role === UserRole.TEACHER) {
      // Para profesores: obtener primero los grupos donde es tutor
      const teacherGroups = await this.classGroupRepository.find({
        where: { tutor: { user: { id: userId } } },
        select: ['id'],
        relations: ['tutor', 'tutor.user']
      });
      const groupIds = teacherGroups.map(g => g.id);
      
      if (groupIds.length > 0) {
        queryBuilder.andWhere(
          '(message.senderId = :userId OR message.recipientId = :userId OR message.targetGroupId IN (:...groupIds))',
          { userId, groupIds }
        );
      } else {
        queryBuilder.andWhere(
          '(message.senderId = :userId OR message.recipientId = :userId)',
          { userId }
        );
      }
    } else if (user.role === UserRole.FAMILY) {
      queryBuilder.andWhere(
        '(message.senderId = :userId OR message.recipientId = :userId)',
        { userId }
      );
    } else if (user.role === UserRole.ADMIN) {
      // Admin puede ver todos los mensajes
    }

    // Aplicar filtros adicionales si se proporcionan
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
      queryBuilder.andWhere(
        '(message.subject ILIKE :search OR message.content ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return queryBuilder
      .orderBy('message.createdAt', 'DESC')
      .getMany();
  }

  async findAllMessagesOld(userId: string, filters?: any): Promise<Message[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
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

    // Filtrar mensajes según el rol del usuario
    if (user.role === UserRole.TEACHER) {
      // Profesor puede ver mensajes donde sea remitente, destinatario, o tutor del grupo
      queryBuilder.andWhere(`(
        message.senderId = :userId OR 
        message.recipientId = :userId OR 
        targetGroup.tutorId = :userId
      )`, { userId });
    } else {
      // Familias y estudiantes solo ven mensajes donde sean remitente o destinatario
      queryBuilder.andWhere(`(
        message.senderId = :userId OR 
        message.recipientId = :userId
      )`, { userId });
    }

    // Aplicar filtros adicionales
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

  async findOneMessage(id: string): Promise<Message> {
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
      throw new NotFoundException('Mensaje no encontrado');
    }

    return message;
  }

  async updateMessage(id: string, userId: string, updateMessageDto: UpdateMessageDto): Promise<Message> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const message = await this.findOneMessage(id);

    // Verificar permisos: Admin, remitente o destinatario pueden actualizar
    const canUpdate = 
      user.role === UserRole.ADMIN ||
      message.senderId === userId ||
      message.recipientId === userId ||
      (message.type === MessageType.ANNOUNCEMENT); // Cualquier usuario puede marcar comunicados como leídos

    if (!canUpdate) {
      throw new ForbiddenException('No tienes permisos para actualizar este mensaje');
    }

    // Actualizar campos permitidos
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

  async deleteMessage(id: string, userId: string): Promise<void> {
    this.logger.debug(`=== DELETE MESSAGE DEBUG ===`);
    this.logger.debug(`Attempting to delete message ${id} by user ${userId}`);
    
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    
    this.logger.debug(`User found: ${user.email}, role: ${user.role}`);

    const message = await this.findOneMessage(id);
    this.logger.debug(`Message found: senderId=${message.senderId}, recipientId=${message.recipientId}, type=${message.type}`);

    // Verificar permisos: 
    // - Admin puede eliminar cualquier mensaje (eliminación completa)
    // - Remitente puede eliminar sus mensajes enviados (solo para él)
    // - Destinatario puede eliminar mensajes recibidos (solo para él)
    // - Para mensajes grupales: miembros del grupo pueden eliminar (solo para ellos)
    const isAdmin = user.role === UserRole.ADMIN;
    const isSender = message.senderId === userId;
    const isRecipient = message.recipientId === userId;
    const isAnnouncement = message.type === MessageType.ANNOUNCEMENT;
    
    this.logger.debug(`Permission checks: isAdmin=${isAdmin}, isSender=${isSender}, isRecipient=${isRecipient}, isAnnouncement=${isAnnouncement}`);
    
    const canDelete = isAdmin || isSender || isRecipient || isAnnouncement;
    
    this.logger.debug(`Final canDelete result: ${canDelete}`);

    if (!canDelete) {
      this.logger.error(`Permission denied for user ${userId} (${user.role}) to delete message ${id}`);
      throw new ForbiddenException('No tienes permisos para eliminar este mensaje');
    }

    // Lógica de eliminación diferenciada usando tabla de eliminaciones
    if (isAdmin) {
      // Admin elimina completamente el mensaje para todos
      message.isDeleted = true;
      await this.messageRepository.save(message);
      this.logger.debug(`Admin deletion - marking message as completely deleted`);
    } else {
      // Para usuarios normales: crear registro de eliminación personal
      // Verificar si ya existe un registro de eliminación para este usuario y mensaje
      const existingDeletion = await this.messageDeletionRepository.findOne({
        where: { messageId: id, userId }
      });

      if (!existingDeletion) {
        // Crear registro de eliminación personal
        const deletion = this.messageDeletionRepository.create({
          messageId: id,
          userId,
          message,
          user,
        });
        await this.messageDeletionRepository.save(deletion);
        this.logger.debug(`Created personal deletion record for user ${userId} and message ${id}`);

        // Para mensajes directos: si ambos usuarios han eliminado el mensaje, eliminarlo completamente
        if (message.type === MessageType.DIRECT && message.recipientId) {
          const allDeletions = await this.messageDeletionRepository.count({
            where: { messageId: id }
          });
          
          // Si tanto emisor como receptor han eliminado el mensaje (2 eliminaciones)
          if (allDeletions >= 2) {
            message.isDeleted = true;
            await this.messageRepository.save(message);
            this.logger.debug(`Both users deleted direct message - marking as completely deleted`);
          }
        }
      } else {
        this.logger.debug(`User ${userId} already deleted message ${id}`);
      }
    }
    
    this.logger.log(`Usuario ${userId} eliminó el mensaje ${id} exitosamente`);
    this.logger.debug(`=== END DELETE MESSAGE DEBUG ===`);
  }


  // ==================== NOTIFICATIONS ====================

  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const { userId, triggeredById, relatedStudentId, relatedGroupId, ...notificationData } = createNotificationDto;

    // Verificar que el usuario destinatario existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario destinatario no encontrado');
    }

    // Verificar usuario que genera la notificación
    let triggeredBy = null;
    if (triggeredById) {
      triggeredBy = await this.userRepository.findOne({ where: { id: triggeredById } });
    }

    // Verificar estudiante relacionado
    let relatedStudent = null;
    if (relatedStudentId) {
      relatedStudent = await this.studentRepository.findOne({ where: { id: relatedStudentId } });
    }

    // Verificar grupo relacionado
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

  async findUserNotifications(userId: string, filters?: any): Promise<Notification[]> {
    const queryBuilder = this.notificationRepository.createQueryBuilder('notification')
      .leftJoinAndSelect('notification.triggeredBy', 'triggeredBy')
      .leftJoinAndSelect('triggeredBy.profile', 'triggeredByProfile')
      .leftJoinAndSelect('notification.relatedStudent', 'relatedStudent')
      .leftJoinAndSelect('relatedStudent.user', 'relatedStudentUser')
      .leftJoinAndSelect('relatedStudentUser.profile', 'relatedStudentProfile')
      .leftJoinAndSelect('notification.relatedGroup', 'relatedGroup')
      .where('notification.userId = :userId', { userId });

    // Aplicar filtros
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

  async updateNotification(id: string, userId: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    if (updateNotificationDto.status) {
      notification.status = updateNotificationDto.status;
      if (updateNotificationDto.status === NotificationStatus.READ) {
        notification.readAt = new Date();
      } else if (updateNotificationDto.status === NotificationStatus.DISMISSED) {
        notification.dismissedAt = new Date();
      }
    }

    return this.notificationRepository.save(notification);
  }

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
      },
    });
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, status: NotificationStatus.UNREAD },
      { status: NotificationStatus.READ, readAt: new Date() }
    );
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    await this.notificationRepository.remove(notification);
  }

  async deleteAllNotifications(userId: string): Promise<number> {
    const notifications = await this.notificationRepository.find({
      where: { userId },
    });

    const count = notifications.length;
    await this.notificationRepository.remove(notifications);
    
    return count;
  }

  // ==================== HELPER METHODS ====================

  private async validateSendPermissions(
    sender: User,
    recipient: User | null,
    targetGroup: ClassGroup | null,
    relatedStudent: Student | null,
  ): Promise<void> {
    this.logger.debug(`=== VALIDATE SEND PERMISSIONS ===`);
    this.logger.debug(`Sender: ${sender.email} (${sender.role})`);
    this.logger.debug(`Recipient: ${recipient?.email || 'N/A'} (${recipient?.role || 'N/A'})`);
    this.logger.debug(`TargetGroup: ${targetGroup?.name || 'N/A'}`);
    this.logger.debug(`RelatedStudent: ${relatedStudent?.id || 'N/A'}`);

    // Admin puede enviar mensajes a cualquiera
    if (sender.role === UserRole.ADMIN) {
      this.logger.debug('Admin sender - all permissions granted');
      return;
    }

    // Validaciones específicas por rol
    if (sender.role === UserRole.TEACHER) {
      this.logger.debug('Teacher sender - validating permissions');
      
      // Profesores pueden enviar:
      // 1. Mensajes a otros profesores/admin (sin restricciones)
      // 2. Mensajes grupales a sus clases
      // 3. Comunicados oficiales
      // 4. Mensajes a familias de estudiantes de sus clases
      
      if (recipient) {
        // Mensaje directo a otro usuario
        if (recipient.role === UserRole.ADMIN || recipient.role === UserRole.TEACHER) {
          this.logger.debug('Teacher to Admin/Teacher - allowed');
          return; // Profesores pueden contactar con admin y otros profesores
        }
        
        if (recipient.role === UserRole.FAMILY) {
          if (!relatedStudent) {
            this.logger.debug('Teacher to Family without relatedStudent - allowed for general communication');
            return; // Permitir comunicación general con familias
          }
          
          // Si hay estudiante relacionado, verificar que está en sus clases
          // Primero obtener el teacher record del usuario
          const teacher = await this.userRepository.findOne({
            where: { id: sender.id },
            relations: ['profile']
          });
          
          if (!teacher) {
            this.logger.error(`Teacher user ${sender.id} not found`);
            throw new ForbiddenException('Usuario profesor no encontrado');
          }

          // Buscar los grupos donde este usuario es tutor a través de la tabla teachers
          const classGroups = await this.classGroupRepository.find({
            where: { tutor: { user: { id: sender.id } } },
            relations: ['students', 'tutor', 'tutor.user'],
          });

          this.logger.debug(`Found ${classGroups.length} class groups for teacher ${sender.id}`);

          const hasStudent = classGroups.some(group =>
            group.students.some(student => student.id === relatedStudent.id)
          );

          if (!hasStudent) {
            this.logger.error(`Teacher ${sender.id} doesn't have access to student ${relatedStudent.id}. Groups: ${classGroups.map(g => g.name).join(', ')}`);
            throw new ForbiddenException('No tienes permisos para contactar con esta familia sobre este estudiante');
          }
          
          this.logger.debug('Teacher to Family with valid student - allowed');
          return;
        }
        
        if (recipient.role === UserRole.STUDENT) {
          this.logger.debug('Teacher to Student - allowed');
          return; // Profesores pueden contactar con estudiantes
        }
      }
      
      if (targetGroup) {
        // Mensaje grupal - verificar si es tutor del grupo
        const isGroupTutor = await this.classGroupRepository.findOne({
          where: { id: targetGroup.id, tutor: { user: { id: sender.id } } },
          relations: ['tutor', 'tutor.user']
        });
        
        if (!isGroupTutor) {
          this.logger.error(`Teacher ${sender.id} is not tutor of group ${targetGroup.id}`);
          throw new ForbiddenException('No tienes permisos para enviar mensajes a este grupo');
        }
        
        this.logger.debug('Teacher to own group - allowed');
        return;
      }
      
      this.logger.debug('Teacher general case - allowed');
      return; // Otros casos para profesores permitidos
      
    } else if (sender.role === UserRole.FAMILY) {
      this.logger.debug('Family sender - validating permissions');
      
      // Las familias solo pueden enviar mensajes a profesores y admin
      if (recipient && ![UserRole.TEACHER, UserRole.ADMIN].includes(recipient.role)) {
        this.logger.error(`Family ${sender.id} trying to contact ${recipient.role}`);
        throw new ForbiddenException('Las familias solo pueden contactar con profesores y administración');
      }
      
      this.logger.debug('Family to Teacher/Admin - allowed');
      return;
      
    } else if (sender.role === UserRole.STUDENT) {
      this.logger.debug('Student sender - validating permissions');
      
      // Los estudiantes pueden enviar mensajes a profesores y admin
      if (recipient && ![UserRole.TEACHER, UserRole.ADMIN].includes(recipient.role)) {
        this.logger.error(`Student ${sender.id} trying to contact ${recipient.role}`);
        throw new ForbiddenException('Los estudiantes solo pueden contactar con profesores y administración');
      }
      
      this.logger.debug('Student to Teacher/Admin - allowed');
      return;
    }
    
    this.logger.debug('=== END VALIDATE SEND PERMISSIONS ===');
  }

  private async createMessageNotifications(message: Message): Promise<void> {
    this.logger.debug(`=== CREATE MESSAGE NOTIFICATIONS ===`);
    this.logger.debug(`Message ID: ${message.id}, Sender: ${message.senderId}, Recipient: ${message.recipientId || 'N/A'}`);
    
    const notifications: CreateNotificationDto[] = [];

    if (message.recipient) {
      // Notificación para mensaje directo
      const notificationDto = {
        title: `Nuevo mensaje de ${message.sender.profile?.firstName} ${message.sender.profile?.lastName}`,
        content: message.subject,
        type: NotificationType.MESSAGE,
        userId: message.recipientId,
        triggeredById: message.senderId,
        relatedStudentId: message.relatedStudentId,
        actionUrl: `/messages/${message.id}`,
      };
      
      notifications.push(notificationDto);
      this.logger.debug(`Added direct message notification for user ${message.recipientId}`);
      
    } else if (message.targetGroup) {
      // Notificaciones para mensaje grupal
      const groupUsers = await this.getGroupUsers(message.targetGroup);
      this.logger.debug(`Found ${groupUsers.length} users in group ${message.targetGroup.name}`);
      
      for (const user of groupUsers) {
        if (user.id !== message.senderId) {
          notifications.push({
            title: `Nuevo mensaje grupal en ${message.targetGroup.name}`,
            content: message.subject,
            type: NotificationType.MESSAGE,
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

    // Crear todas las notificaciones
    for (const notificationDto of notifications) {
      try {
        const createdNotification = await this.createNotification(notificationDto);
        this.logger.debug(`Notification created successfully: ${createdNotification.id} for user ${notificationDto.userId}`);
      } catch (error) {
        this.logger.error(`Error creating notification for user ${notificationDto.userId}:`, error);
      }
    }
    
    this.logger.debug(`=== END CREATE MESSAGE NOTIFICATIONS ===`);
  }

  private async getGroupUsers(group: ClassGroup): Promise<User[]> {
    const users: User[] = [];

    // Agregar tutor
    if (group.tutor && group.tutor.user && group.tutor.user.id) {
      const tutor = await this.userRepository.findOne({
        where: { id: group.tutor.user.id },
      });
      if (tutor) users.push(tutor);
    }

    // Agregar familias de los estudiantes
    for (const student of group.students) {
      if (student.user) {
        users.push(student.user);
        
        // TODO: Agregar usuarios de la familia del estudiante
        // Esto requeriría acceso al repositorio de familias
      }
    }

    return users;
  }

  // ==================== STATISTICS ====================

  async getUserMessagingStats(userId: string): Promise<any> {
    const [
      totalSent,
      totalReceived,
      unreadMessages,
      unreadNotifications,
    ] = await Promise.all([
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

  async getUnreadMessagesCount(userId: string): Promise<number> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const queryBuilder = this.messageRepository.createQueryBuilder('message')
      .where('message.isDeleted = :isDeleted AND message.isRead = :isRead', { 
        isDeleted: false, 
        isRead: false 
      })
      // Excluir mensajes enviados por el usuario (el emisor no necesita "leer" sus propios mensajes)
      .andWhere('message.senderId != :userId', { userId });

    // Filtrar mensajes eliminados por el usuario actual usando la tabla de eliminaciones
    if (user.role !== UserRole.ADMIN) {
      queryBuilder.andWhere(`
        NOT EXISTS (
          SELECT 1 FROM message_deletions md 
          WHERE md."messageId" = message.id AND md."userId" = :userId
        )
      `, { userId });
    }

    // Aplicar filtros por rol del usuario (misma lógica que findAllMessages)
    if (user.role === UserRole.TEACHER) {
      // Para profesores: obtener primero los grupos donde es tutor
      const teacherGroups = await this.classGroupRepository.find({
        where: { tutor: { user: { id: userId } } },
        select: ['id'],
        relations: ['tutor', 'tutor.user']
      });
      const groupIds = teacherGroups.map(g => g.id);
      
      if (groupIds.length > 0) {
        queryBuilder.andWhere(
          '(message.senderId = :userId OR message.recipientId = :userId OR message.targetGroupId IN (:...groupIds))',
          { userId, groupIds }
        );
      } else {
        queryBuilder.andWhere(
          '(message.senderId = :userId OR message.recipientId = :userId)',
          { userId }
        );
      }
    } else if (user.role === UserRole.FAMILY) {
      queryBuilder.andWhere(
        '(message.senderId = :userId OR message.recipientId = :userId)',
        { userId }
      );
    } else if (user.role === UserRole.ADMIN) {
      // Admin puede ver todos los mensajes
    }

    return queryBuilder.getCount();
  }

  // ==================== AVAILABLE RECIPIENTS ====================

  async getAvailableRecipients(userId: string): Promise<any[]> {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      relations: ['profile']
    });
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    this.logger.debug(`Getting available recipients for user ${user.email} (${user.role})`);

    let availableUsers: User[] = [];

    if (user.role === UserRole.ADMIN) {
      // Admin puede enviar mensajes a cualquiera
      availableUsers = await this.userRepository.find({
        where: { isActive: true },
        relations: ['profile'],
        order: { role: 'ASC', profile: { firstName: 'ASC' } }
      });
      
    } else if (user.role === UserRole.TEACHER) {
      // Profesores pueden enviar a:
      // 1. Otros profesores y admin
      // 2. Todas las familias (comunicación general permitida)
      // 3. Todos los estudiantes
      availableUsers = await this.userRepository.find({
        where: { 
          isActive: true,
          role: In([UserRole.ADMIN, UserRole.TEACHER, UserRole.FAMILY, UserRole.STUDENT])
        },
        relations: ['profile'],
        order: { role: 'ASC', profile: { firstName: 'ASC' } }
      });
      
    } else if (user.role === UserRole.FAMILY) {
      // Familias solo pueden enviar a profesores y admin
      availableUsers = await this.userRepository.find({
        where: { 
          isActive: true,
          role: In([UserRole.ADMIN, UserRole.TEACHER])
        },
        relations: ['profile'],
        order: { role: 'ASC', profile: { firstName: 'ASC' } }
      });
      
    } else if (user.role === UserRole.STUDENT) {
      // Estudiantes solo pueden enviar a profesores y admin
      availableUsers = await this.userRepository.find({
        where: { 
          isActive: true,
          role: In([UserRole.ADMIN, UserRole.TEACHER])
        },
        relations: ['profile'],
        order: { role: 'ASC', profile: { firstName: 'ASC' } }
      });
    }

    // Filtrar al usuario actual (no puede enviarse mensajes a sí mismo)
    availableUsers = availableUsers.filter(u => u.id !== userId);

    // Formatear respuesta
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

  async getAvailableGroups(userId: string): Promise<any[]> {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      relations: ['profile']
    });
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    this.logger.debug(`Getting available groups for user ${user.email} (${user.role})`);

    let availableGroups: ClassGroup[] = [];

    if (user.role === UserRole.ADMIN) {
      // Admin puede enviar mensajes a cualquier grupo
      availableGroups = await this.classGroupRepository.find({
        relations: ['tutor', 'tutor.user', 'tutor.user.profile'],
        order: { name: 'ASC' }
      });
      
    } else if (user.role === UserRole.TEACHER) {
      // Profesores solo pueden enviar a grupos donde son tutores
      availableGroups = await this.classGroupRepository.find({
        where: { tutor: { user: { id: userId } } },
        relations: ['tutor', 'tutor.user', 'tutor.user.profile'],
        order: { name: 'ASC' }
      });
    }

    // Formatear respuesta
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

  // ==================== BULK OPERATIONS FOR MESSAGES ====================

  async markAllMessagesAsRead(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Obtener todos los mensajes que el usuario puede ver (usando la misma lógica que findAllMessages)
    const queryBuilder = this.messageRepository.createQueryBuilder('message')
      .where('message.isDeleted = :isDeleted AND message.isRead = :isRead', { 
        isDeleted: false, 
        isRead: false 
      });

    // Filtrar mensajes eliminados por el usuario actual usando la tabla de eliminaciones
    if (user.role !== UserRole.ADMIN) {
      queryBuilder.andWhere(`
        NOT EXISTS (
          SELECT 1 FROM message_deletions md 
          WHERE md."messageId" = message.id AND md."userId" = :userId
        )
      `, { userId });
    }

    // Aplicar filtros por rol del usuario (misma lógica que findAllMessages)
    if (user.role === UserRole.TEACHER) {
      // Para profesores: obtener primero los grupos donde es tutor
      const teacherGroups = await this.classGroupRepository.find({
        where: { tutor: { user: { id: userId } } },
        select: ['id'],
        relations: ['tutor', 'tutor.user']
      });
      const groupIds = teacherGroups.map(g => g.id);
      
      if (groupIds.length > 0) {
        queryBuilder.andWhere(
          '(message.senderId = :userId OR message.recipientId = :userId OR message.targetGroupId IN (:...groupIds))',
          { userId, groupIds }
        );
      } else {
        queryBuilder.andWhere(
          '(message.senderId = :userId OR message.recipientId = :userId)',
          { userId }
        );
      }
    } else if (user.role === UserRole.FAMILY) {
      queryBuilder.andWhere(
        '(message.senderId = :userId OR message.recipientId = :userId)',
        { userId }
      );
    } else if (user.role === UserRole.ADMIN) {
      // Admin puede marcar todos los mensajes como leídos
    }

    // Obtener los IDs de los mensajes a marcar
    const messages = await queryBuilder.select('message.id').getMany();
    const messageIds = messages.map(m => m.id);

    if (messageIds.length > 0) {
      // Marcar como leídos todos los mensajes encontrados
      await this.messageRepository.update(
        { id: In(messageIds) },
        { 
          isRead: true, 
          readAt: new Date() 
        }
      );
    }

    this.logger.log(`Usuario ${userId} marcó ${messageIds.length} mensajes como leídos`);
  }

  async deleteAllMessages(userId: string): Promise<number> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.role === UserRole.ADMIN) {
      // Admin elimina completamente todos los mensajes
      const result = await this.messageRepository.update(
        { isDeleted: false },
        { isDeleted: true }
      );
      const deletedCount = result.affected || 0;
      this.logger.log(`Admin ${userId} eliminó completamente ${deletedCount} mensajes`);
      return deletedCount;
    }

    // Para usuarios normales: obtener mensajes que pueden ver y crear registros de eliminación
    const queryBuilder = this.messageRepository.createQueryBuilder('message')
      .where('message.isDeleted = :isDeleted', { isDeleted: false });

    // Filtrar mensajes ya eliminados por el usuario actual
    queryBuilder.andWhere(`
      NOT EXISTS (
        SELECT 1 FROM message_deletions md 
        WHERE md."messageId" = message.id AND md."userId" = :userId
      )
    `, { userId });

    // Aplicar filtros por rol del usuario (misma lógica que findAllMessages)
    if (user.role === UserRole.TEACHER) {
      // Para profesores: obtener primero los grupos donde es tutor
      const teacherGroups = await this.classGroupRepository.find({
        where: { tutor: { user: { id: userId } } },
        select: ['id'],
        relations: ['tutor', 'tutor.user']
      });
      const groupIds = teacherGroups.map(g => g.id);
      
      if (groupIds.length > 0) {
        queryBuilder.andWhere(
          '(message.senderId = :userId OR message.recipientId = :userId OR message.targetGroupId IN (:...groupIds))',
          { userId, groupIds }
        );
      } else {
        queryBuilder.andWhere(
          '(message.senderId = :userId OR message.recipientId = :userId)',
          { userId }
        );
      }
    } else if (user.role === UserRole.FAMILY) {
      queryBuilder.andWhere(
        '(message.senderId = :userId OR message.recipientId = :userId)',
        { userId }
      );
    }

    // Obtener los IDs de los mensajes a eliminar
    const messages = await queryBuilder.select('message.id').getMany();
    const messageIds = messages.map(m => m.id);

    let deletedCount = 0;
    if (messageIds.length > 0) {
      // Crear registros de eliminación para cada mensaje
      const deletions = messageIds.map(messageId => ({
        messageId,
        userId,
      }));

      await this.messageDeletionRepository.insert(deletions);
      deletedCount = messageIds.length;

      // Para mensajes directos: verificar si necesitamos eliminar completamente algunos mensajes
      const directMessages = await this.messageRepository.find({
        where: { 
          id: In(messageIds), 
          type: MessageType.DIRECT,
          recipientId: Not(IsNull())
        }
      });

      for (const message of directMessages) {
        const allDeletions = await this.messageDeletionRepository.count({
          where: { messageId: message.id }
        });
        
        // Si tanto emisor como receptor han eliminado el mensaje (2 eliminaciones)
        if (allDeletions >= 2) {
          await this.messageRepository.update(
            { id: message.id },
            { isDeleted: true }
          );
          this.logger.debug(`Both users deleted direct message ${message.id} - marking as completely deleted`);
        }
      }
    }

    this.logger.log(`Usuario ${userId} eliminó ${deletedCount} mensajes`);
    return deletedCount;
  }
}