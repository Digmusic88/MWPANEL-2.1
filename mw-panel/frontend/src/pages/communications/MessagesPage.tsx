import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Drawer,
  Typography,
  Badge,
  Tooltip,
  Avatar,
  Divider,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlusOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  TeamOutlined,
  ReloadOutlined,
  CheckOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import apiClient from '../../services/apiClient';
import { useAuthStore } from '../../store/authStore';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Message {
  id: string;
  subject: string;
  content: string;
  type: 'direct' | 'group' | 'announcement' | 'notification';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'sent' | 'delivered' | 'read';
  sender: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  recipient?: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  targetGroup?: {
    id: string;
    name: string;
  };
  relatedStudent?: {
    id: string;
    user: {
      profile: {
        firstName: string;
        lastName: string;
      };
    };
  };
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  replies?: Message[];
}

interface User {
  id: string;
  role: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

interface ClassGroup {
  id: string;
  name: string;
}

interface Student {
  id: string;
  user: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

const MessagesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [availableRecipients, setAvailableRecipients] = useState<User[]>([]);
  const [availableGroups, setAvailableGroups] = useState<ClassGroup[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState<any>({});
  const [userRole, setUserRole] = useState<string>('');

  // Helper para determinar si un mensaje debe mostrarse como leído
  const isMessageReadForUser = (message: Message): boolean => {
    // Los mensajes enviados por el usuario actual siempre se muestran como leídos
    if (message.sender.id === user?.id) {
      return true;
    }
    // Para mensajes recibidos, usar el estado isRead normal
    return message.isRead;
  };

  // Filtros
  const [filters, setFilters] = useState<{
    type?: string;
    priority?: string;
    isRead?: boolean;
  }>({
    type: undefined,
    priority: undefined,
    isRead: undefined,
  });

  useEffect(() => {
    fetchMessages();
    fetchAvailableRecipients();
    fetchAvailableGroups();
    fetchStudents();
    fetchStats();
    fetchUserRole();
  }, [filters]);

  const fetchUserRole = async () => {
    try {
      // Obtener el rol del usuario del token o de un endpoint
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role || '');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.isRead !== undefined) params.append('isRead', filters.isRead.toString());

      const response = await apiClient.get(`/communications/messages${params.toString() ? '?' + params.toString() : ''}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      message.error('Error al cargar los mensajes');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRecipients = async () => {
    try {
      const response = await apiClient.get('/communications/available-recipients');
      setAvailableRecipients(response.data);
    } catch (error) {
      console.error('Error fetching available recipients:', error);
    }
  };

  const fetchAvailableGroups = async () => {
    try {
      const response = await apiClient.get('/communications/available-groups');
      setAvailableGroups(response.data);
    } catch (error) {
      console.error('Error fetching available groups:', error);
      // Si hay error (ej: usuario sin permisos), establecer array vacío
      setAvailableGroups([]);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await apiClient.get('/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/communications/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateMessage = async (values: any) => {
    try {
      await apiClient.post('/communications/messages', values);
      message.success('Mensaje enviado exitosamente');
      setModalVisible(false);
      form.resetFields();
      fetchMessages();
      fetchStats();
    } catch (error) {
      console.error('Error creating message:', error);
      message.error('Error al enviar el mensaje');
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await apiClient.patch(`/communications/messages/${messageId}`, {
        isRead: true,
      });
      fetchMessages();
      fetchStats();
    } catch (error) {
      console.error('Error marking message as read:', error);
      message.error('Error al marcar como leído');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await apiClient.delete(`/communications/messages/${messageId}`);
      message.success('Mensaje eliminado exitosamente');
      fetchMessages();
      fetchStats();
    } catch (error) {
      console.error('Error deleting message:', error);
      message.error('Error al eliminar el mensaje');
    }
  };

  const handleMarkAllAsRead = async () => {
    Modal.confirm({
      title: '¿Marcar todos los mensajes como leídos?',
      content: 'Esta acción marcará todos los mensajes no leídos como leídos. ¿Está seguro?',
      onOk: async () => {
        try {
          await apiClient.post('/communications/messages/mark-all-read');
          message.success('Todos los mensajes han sido marcados como leídos');
          fetchMessages();
          fetchStats();
        } catch (error) {
          console.error('Error marking all messages as read:', error);
          message.error('Error al marcar todos los mensajes como leídos');
        }
      },
    });
  };

  const handleDeleteAllMessages = async () => {
    Modal.confirm({
      title: '¿Eliminar todos los mensajes?',
      content: 'Esta acción eliminará todos los mensajes de forma permanente. ¿Está seguro?',
      okText: 'Sí, eliminar todos',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          const response = await apiClient.delete('/communications/messages/bulk/delete-all');
          message.success(`${response.data.deletedCount} mensajes eliminados exitosamente`);
          fetchMessages();
          fetchStats();
        } catch (error) {
          console.error('Error deleting all messages:', error);
          message.error('Error al eliminar todos los mensajes');
        }
      },
    });
  };

  const handleViewMessage = async (messageRecord: Message) => {
    try {
      const response = await apiClient.get(`/communications/messages/${messageRecord.id}`);
      setSelectedMessage(response.data);
      setDrawerVisible(true);
      
      // Marcar como leído si no lo está
      if (!messageRecord.isRead) {
        handleMarkAsRead(messageRecord.id);
      }
    } catch (error) {
      console.error('Error fetching message details:', error);
      message.error('Error al cargar los detalles del mensaje');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'normal': return 'blue';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'direct': return <UserOutlined />;
      case 'group': return <TeamOutlined />;
      case 'announcement': return <FlagOutlined />;
      case 'notification': return <MessageOutlined />;
      default: return <MessageOutlined />;
    }
  };

  const columns = [
    {
      title: 'Estado',
      dataIndex: 'isRead',
      key: 'isRead',
      width: 80,
      render: (_: boolean, record: Message) => {
        const messageRead = isMessageReadForUser(record);
        return (
          <Badge
            status={messageRead ? 'default' : 'processing'}
            title={messageRead ? 'Leído' : 'No leído'}
          />
        );
      },
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => (
        <Tooltip title={type}>
          {getTypeIcon(type)}
        </Tooltip>
      ),
    },
    {
      title: 'Prioridad',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'De',
      dataIndex: 'sender',
      key: 'sender',
      render: (sender: any) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text>{sender.profile.firstName} {sender.profile.lastName}</Text>
        </Space>
      ),
    },
    {
      title: 'Para',
      key: 'recipient',
      render: (record: Message) => {
        if (record.recipient) {
          return (
            <Space>
              <Avatar size="small" icon={<UserOutlined />} />
              <Text>{record.recipient.profile.firstName} {record.recipient.profile.lastName}</Text>
            </Space>
          );
        } else if (record.targetGroup) {
          return (
            <Space>
              <Avatar size="small" icon={<TeamOutlined />} />
              <Text>{record.targetGroup.name}</Text>
            </Space>
          );
        }
        return '-';
      },
    },
    {
      title: 'Asunto',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
      render: (subject: string, record: Message) => (
        <div>
          <Text strong={!isMessageReadForUser(record)}>{subject}</Text>
          {record.relatedStudent && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Sobre: {record.relatedStudent.user.profile.firstName} {record.relatedStudent.user.profile.lastName}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => (
        <Space>
          <ClockCircleOutlined />
          <Text>{new Date(date).toLocaleDateString()}</Text>
        </Space>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      render: (record: Message) => (
        <Space>
          <Tooltip title="Ver mensaje">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewMessage(record)}
            />
          </Tooltip>
          {!isMessageReadForUser(record) && (
            <Tooltip title="Marcar como leído">
              <Button
                type="text"
                icon={<MessageOutlined />}
                onClick={() => handleMarkAsRead(record.id)}
              />
            </Tooltip>
          )}
          <Tooltip title="Eliminar">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteMessage(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <MessageOutlined /> Sistema de Comunicaciones
      </Title>

      {/* Estadísticas */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Mensajes"
              value={stats.totalMessages || 0}
              prefix={<MessageOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Enviados"
              value={stats.totalSent || 0}
              prefix={<SendOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Recibidos"
              value={stats.totalReceived || 0}
              prefix={<MessageOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="No Leídos"
              value={stats.unreadMessages || 0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<EyeOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros y acciones */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Select
              placeholder="Filtrar por tipo"
              allowClear
              style={{ width: 150 }}
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value })}
            >
              <Select.Option value="direct">Directo</Select.Option>
              <Select.Option value="group">Grupal</Select.Option>
              <Select.Option value="announcement">Comunicado</Select.Option>
              <Select.Option value="notification">Notificación</Select.Option>
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="Filtrar por prioridad"
              allowClear
              style={{ width: 150 }}
              value={filters.priority}
              onChange={(value) => setFilters({ ...filters, priority: value })}
            >
              <Select.Option value="urgent">Urgente</Select.Option>
              <Select.Option value="high">Alta</Select.Option>
              <Select.Option value="normal">Normal</Select.Option>
              <Select.Option value="low">Baja</Select.Option>
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="Estado de lectura"
              allowClear
              style={{ width: 150 }}
              value={filters.isRead}
              onChange={(value) => setFilters({ ...filters, isRead: value })}
            >
              <Select.Option value={true}>Leídos</Select.Option>
              <Select.Option value={false}>No leídos</Select.Option>
            </Select>
          </Col>
          <Col flex="auto">
            <Space style={{ float: 'right' }}>
              <Button icon={<ReloadOutlined />} onClick={fetchMessages}>
                Actualizar
              </Button>
              <Button 
                icon={<CheckOutlined />} 
                onClick={handleMarkAllAsRead}
                title="Marcar todos como leídos"
              >
                Marcar Todo Leído
              </Button>
              <Button 
                danger
                icon={<ClearOutlined />} 
                onClick={handleDeleteAllMessages}
                title="Eliminar todos los mensajes"
              >
                Eliminar Todo
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
              >
                Nuevo Mensaje
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tabla de mensajes */}
      <Card>
        <Table
          columns={columns}
          dataSource={messages}
          rowKey="id"
          loading={loading}
          pagination={{
            total: messages.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} mensajes`,
          }}
          rowClassName={(record) => !isMessageReadForUser(record) ? 'unread-message' : ''}
        />
      </Card>

      {/* Modal para crear mensaje */}
      <Modal
        title="Nuevo Mensaje"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateMessage}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tipo de mensaje"
                name="type"
                rules={[{ required: true, message: 'Seleccione el tipo de mensaje' }]}
              >
                <Select placeholder="Seleccionar tipo">
                  <Select.Option value="direct">Mensaje directo</Select.Option>
                  {(userRole === 'admin' || userRole === 'teacher') && (
                    <Select.Option value="group">Mensaje grupal</Select.Option>
                  )}
                  {userRole === 'admin' && (
                    <Select.Option value="announcement">Comunicado oficial</Select.Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Prioridad"
                name="priority"
                initialValue="normal"
              >
                <Select>
                  <Select.Option value="low">Baja</Select.Option>
                  <Select.Option value="normal">Normal</Select.Option>
                  <Select.Option value="high">Alta</Select.Option>
                  <Select.Option value="urgent">Urgente</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.type !== currentValues.type
            }
          >
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              
              if (type === 'direct') {
                return (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Destinatario"
                        name="recipientId"
                        rules={[{ required: true, message: 'Seleccione un destinatario' }]}
                      >
                        <Select
                          showSearch
                          placeholder={availableRecipients.length > 0 ? "Buscar usuario disponible" : "No hay usuarios disponibles"}
                          disabled={availableRecipients.length === 0}
                          filterOption={(input, option) =>
                            (option?.children as unknown as string)
                              ?.toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {availableRecipients.map(user => (
                            <Select.Option key={user.id} value={user.id}>
                              {(user as any).displayName || `${user.profile.firstName} ${user.profile.lastName} (${user.role})`}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Estudiante relacionado (opcional)"
                        name="relatedStudentId"
                      >
                        <Select
                          showSearch
                          placeholder="Seleccionar estudiante"
                          allowClear
                          filterOption={(input, option) =>
                            (option?.children as unknown as string)
                              ?.toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {students.map(student => (
                            <Select.Option key={student.id} value={student.id}>
                              {student.user.profile.firstName} {student.user.profile.lastName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                );
              } else if (type === 'group') {
                return (
                  <Form.Item
                    label="Grupo destinatario"
                    name="targetGroupId"
                    rules={[{ required: true, message: 'Seleccione un grupo' }]}
                  >
                    <Select 
                      placeholder={availableGroups.length > 0 ? "Seleccionar grupo" : "No tienes grupos disponibles"}
                      disabled={availableGroups.length === 0}
                    >
                      {availableGroups.map(group => (
                        <Select.Option key={group.id} value={group.id}>
                          {(group as any).displayName || group.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>

          <Form.Item
            label="Asunto"
            name="subject"
            rules={[{ required: true, message: 'Ingrese el asunto del mensaje' }]}
          >
            <Input placeholder="Asunto del mensaje" />
          </Form.Item>

          <Form.Item
            label="Contenido"
            name="content"
            rules={[{ required: true, message: 'Ingrese el contenido del mensaje' }]}
          >
            <TextArea rows={6} placeholder="Escriba su mensaje aquí..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer para ver mensaje */}
      <Drawer
        title="Detalles del Mensaje"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        {selectedMessage && (
          <div>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* Header del mensaje */}
              <Card size="small">
                <Row gutter={16}>
                  <Col span={12}>
                    <Text strong>De:</Text>
                    <div>
                      <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                      {selectedMessage.sender.profile.firstName} {selectedMessage.sender.profile.lastName}
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text strong>Para:</Text>
                    <div>
                      {selectedMessage.recipient ? (
                        <>
                          <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                          {selectedMessage.recipient.profile.firstName} {selectedMessage.recipient.profile.lastName}
                        </>
                      ) : selectedMessage.targetGroup ? (
                        <>
                          <Avatar size="small" icon={<TeamOutlined />} style={{ marginRight: 8 }} />
                          {selectedMessage.targetGroup.name}
                        </>
                      ) : '-'}
                    </div>
                  </Col>
                </Row>
                <Divider />
                <Row gutter={16}>
                  <Col span={8}>
                    <Text strong>Tipo:</Text>
                    <div>
                      <Tag color={getPriorityColor(selectedMessage.type)}>
                        {getTypeIcon(selectedMessage.type)} {selectedMessage.type}
                      </Tag>
                    </div>
                  </Col>
                  <Col span={8}>
                    <Text strong>Prioridad:</Text>
                    <div>
                      <Tag color={getPriorityColor(selectedMessage.priority)}>
                        {selectedMessage.priority.toUpperCase()}
                      </Tag>
                    </div>
                  </Col>
                  <Col span={8}>
                    <Text strong>Fecha:</Text>
                    <div>{new Date(selectedMessage.createdAt).toLocaleString()}</div>
                  </Col>
                </Row>
                {selectedMessage.relatedStudent && (
                  <>
                    <Divider />
                    <Text strong>Estudiante relacionado:</Text>
                    <div>
                      <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                      {selectedMessage.relatedStudent.user.profile.firstName} {selectedMessage.relatedStudent.user.profile.lastName}
                    </div>
                  </>
                )}
              </Card>

              {/* Asunto */}
              <Card size="small">
                <Title level={4}>{selectedMessage.subject}</Title>
              </Card>

              {/* Contenido */}
              <Card size="small">
                <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedMessage.content}
                </Paragraph>
              </Card>

              {/* Respuestas (si las hay) */}
              {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                <Card size="small" title="Respuestas">
                  {selectedMessage.replies.map((reply) => (
                    <Card key={reply.id} size="small" style={{ marginBottom: 16 }}>
                      <div>
                        <Text strong>
                          {reply.sender.profile.firstName} {reply.sender.profile.lastName}
                        </Text>
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          {new Date(reply.createdAt).toLocaleString()}
                        </Text>
                      </div>
                      <Paragraph style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                        {reply.content}
                      </Paragraph>
                    </Card>
                  ))}
                </Card>
              )}
            </Space>
          </div>
        )}
      </Drawer>

      <style>{`
        .unread-message {
          background-color: #f6ffed;
          border-left: 3px solid #52c41a;
        }
      `}</style>
    </div>
  );
};

export default MessagesPage;