import React, { useState, useEffect } from 'react';
import {
  Dropdown,
  Badge,
  List,
  Avatar,
  Typography,
  Button,
  Space,
  Tag,
  Empty,
  Divider,
  Spin,
  message,
} from 'antd';
import {
  BellOutlined,
  MessageOutlined,
  BookOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckOutlined,
  DeleteOutlined,
  EyeOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import apiClient from '../services/apiClient';

const { Text } = Typography;

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'evaluation' | 'message' | 'announcement' | 'academic' | 'attendance' | 'reminder' | 'system';
  status: 'unread' | 'read' | 'dismissed';
  triggeredBy?: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  relatedStudent?: {
    user: {
      profile: {
        firstName: string;
        lastName: string;
      };
    };
  };
  relatedGroup?: {
    name: string;
  };
  actionUrl?: string;
  readAt?: string;
  createdAt: string;
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Polling cada 30 segundos para actualizar notificaciones
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/communications/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.get('/communications/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch(`/communications/notifications/${notificationId}`, {
        status: 'read',
      });
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      message.error('Error al marcar como leída');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.post('/communications/notifications/mark-all-read');
      message.success('Todas las notificaciones marcadas como leídas');
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
      message.error('Error al marcar todas como leídas');
    }
  };

  const handleDismiss = async (notificationId: string) => {
    try {
      await apiClient.patch(`/communications/notifications/${notificationId}`, {
        status: 'dismissed',
      });
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error dismissing notification:', error);
      message.error('Error al descartar la notificación');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'evaluation': return <BookOutlined style={{ color: '#1890ff' }} />;
      case 'message': return <MessageOutlined style={{ color: '#52c41a' }} />;
      case 'announcement': return <BellOutlined style={{ color: '#faad14' }} />;
      case 'academic': return <CalendarOutlined style={{ color: '#722ed1' }} />;
      case 'attendance': return <UserOutlined style={{ color: '#f5222d' }} />;
      case 'reminder': return <BellOutlined style={{ color: '#fa8c16' }} />;
      case 'system': return <SettingOutlined style={{ color: '#13c2c2' }} />;
      default: return <BellOutlined />;
    }
  };

  const getNotificationTypeTag = (type: string) => {
    const configs = {
      evaluation: { color: 'blue', text: 'Evaluación' },
      message: { color: 'green', text: 'Mensaje' },
      announcement: { color: 'orange', text: 'Comunicado' },
      academic: { color: 'purple', text: 'Académico' },
      attendance: { color: 'red', text: 'Asistencia' },
      reminder: { color: 'gold', text: 'Recordatorio' },
      system: { color: 'cyan', text: 'Sistema' },
    };

    const config = configs[type as keyof typeof configs] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Marcar como leída si no lo está
    if (notification.status === 'unread') {
      handleMarkAsRead(notification.id);
    }

    // Navegar a la URL de acción si existe
    if (notification.actionUrl) {
      // Aquí podrías usar react-router para navegar
      console.log('Navigate to:', notification.actionUrl);
    }

    setDropdownVisible(false);
  };

  const notificationList = (
    <div style={{ width: 400, maxHeight: 500, overflow: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text strong>Notificaciones</Text>
          {unreadCount > 0 && (
            <Button
              type="link"
              size="small"
              onClick={handleMarkAllAsRead}
              style={{ padding: 0 }}
            >
              Marcar todas como leídas
            </Button>
          )}
        </Space>
      </div>

      {/* Content */}
      <Spin spinning={loading}>
        {notifications.length === 0 ? (
          <div style={{ padding: '20px' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No hay notificaciones"
            />
          </div>
        ) : (
          <List
            itemLayout="vertical"
            dataSource={notifications.slice(0, 10)} // Mostrar solo las 10 más recientes
            renderItem={(notification) => (
              <List.Item
                key={notification.id}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  backgroundColor: notification.status === 'unread' ? '#f6ffed' : 'transparent',
                  borderLeft: notification.status === 'unread' ? '3px solid #52c41a' : 'none',
                }}
                onClick={() => handleNotificationClick(notification)}
                actions={[
                  <Space key="actions">
                    {notification.status === 'unread' && (
                      <Button
                        type="text"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        title="Marcar como leída"
                      />
                    )}
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss(notification.id);
                      }}
                      title="Descartar"
                    />
                  </Space>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={getNotificationIcon(notification.type)}
                      style={{ backgroundColor: 'transparent' }}
                    />
                  }
                  title={
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Text strong={notification.status === 'unread'}>
                        {notification.title}
                      </Text>
                      {getNotificationTypeTag(notification.type)}
                    </Space>
                  }
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {notification.content}
                      </Text>
                      <div style={{ marginTop: 4 }}>
                        {notification.triggeredBy && (
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            Por: {notification.triggeredBy.profile.firstName} {notification.triggeredBy.profile.lastName}
                          </Text>
                        )}
                        {notification.relatedStudent && (
                          <Text type="secondary" style={{ fontSize: '11px', marginLeft: 8 }}>
                            Estudiante: {notification.relatedStudent.user.profile.firstName} {notification.relatedStudent.user.profile.lastName}
                          </Text>
                        )}
                        {notification.relatedGroup && (
                          <Text type="secondary" style={{ fontSize: '11px', marginLeft: 8 }}>
                            Grupo: {notification.relatedGroup.name}
                          </Text>
                        )}
                        <div style={{ marginTop: 2 }}>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {formatTimeAgo(notification.createdAt)}
                          </Text>
                        </div>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Spin>

      {/* Footer */}
      {notifications.length > 10 && (
        <>
          <Divider style={{ margin: 0 }} />
          <div style={{ padding: '8px 16px', textAlign: 'center' }}>
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                // Navegar a la página completa de notificaciones
                setDropdownVisible(false);
              }}
            >
              Ver todas las notificaciones
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Dropdown
      overlay={notificationList}
      trigger={['click']}
      placement="bottomRight"
      open={dropdownVisible}
      onOpenChange={setDropdownVisible}
    >
      <Badge count={unreadCount} size="small">
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: '16px' }} />}
          style={{ border: 'none', background: 'transparent' }}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationCenter;