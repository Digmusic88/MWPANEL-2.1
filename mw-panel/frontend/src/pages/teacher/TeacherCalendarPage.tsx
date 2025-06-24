import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Table,
  Typography,
  Tag,
  Select,
  DatePicker,
  message,
  List,
  Avatar,
  Badge,
  Tabs,
  Statistic,
  Alert,
  Modal,
  Form,
  Input,
} from 'antd';
import {
  CalendarOutlined,
  PlusOutlined,
  BookOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  BellOutlined,
} from '@ant-design/icons';
import CalendarPage from '../shared/CalendarPage';
import apiClient from '@services/apiClient';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface TeacherSchedule {
  id: string;
  subject: string;
  classGroup: string;
  timeSlot: string;
  dayOfWeek: string;
  classroom: string;
}

interface TaskDeadline {
  id: string;
  title: string;
  dueDate: string;
  subject: string;
  classGroup: string;
  submissionCount: number;
  totalStudents: number;
  status: 'upcoming' | 'due_today' | 'overdue';
}

interface ClassEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  subject: string;
  classGroup: string;
  description?: string;
}

const TeacherCalendarPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [teacherSchedule, setTeacherSchedule] = useState<TeacherSchedule[]>([]);
  const [taskDeadlines, setTaskDeadlines] = useState<TaskDeadline[]>([]);
  const [classEvents, setClassEvents] = useState<ClassEvent[]>([]);
  const [quickEventModalVisible, setQuickEventModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      const [scheduleResponse, deadlinesResponse, eventsResponse] = await Promise.all([
        apiClient.get('/schedules/teacher/current'),
        apiClient.get('/tasks/teacher/upcoming-deadlines'),
        apiClient.get('/calendar/teacher/class-events'),
      ]);

      setTeacherSchedule(scheduleResponse.data);
      setTaskDeadlines(deadlinesResponse.data);
      setClassEvents(eventsResponse.data);
    } catch (error: any) {
      console.error('Error fetching teacher data:', error);
      message.error('Error al cargar datos del profesor');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickEvent = async (values: any) => {
    try {
      await apiClient.post('/calendar', {
        ...values,
        startDate: values.date.toISOString(),
        endDate: values.date.add(1, 'hour').toISOString(),
        type: 'activity',
        visibility: 'class_specific',
      });
      
      message.success('Evento rápido creado exitosamente');
      setQuickEventModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      console.error('Error creating quick event:', error);
      message.error('Error al crear el evento');
    }
  };

  const scheduleColumns = [
    {
      title: 'Hora',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
    },
    {
      title: 'Asignatura',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject: string) => (
        <Tag color="blue">{subject}</Tag>
      ),
    },
    {
      title: 'Grupo',
      dataIndex: 'classGroup',
      key: 'classGroup',
    },
    {
      title: 'Aula',
      dataIndex: 'classroom',
      key: 'classroom',
    },
    {
      title: 'Día',
      dataIndex: 'dayOfWeek',
      key: 'dayOfWeek',
    },
  ];

  const getDeadlineStatus = (deadline: TaskDeadline) => {
    switch (deadline.status) {
      case 'due_today':
        return { color: 'orange', icon: <ClockCircleOutlined /> };
      case 'overdue':
        return { color: 'red', icon: <ExclamationCircleOutlined /> };
      default:
        return { color: 'blue', icon: <CheckCircleOutlined /> };
    }
  };

  const getCompletionRate = (deadline: TaskDeadline) => {
    return Math.round((deadline.submissionCount / deadline.totalStudents) * 100);
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div className="mb-6">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>
              <CalendarOutlined className="mr-2" />
              Mi Calendario de Clases
            </Title>
            <Text type="secondary">
              Gestiona tu horario, eventos y fechas importantes
            </Text>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setQuickEventModalVisible(true)}
              >
                Evento Rápido
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Clases Hoy"
              value={teacherSchedule.filter(s => s.dayOfWeek === dayjs().format('dddd')).length}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tareas por Vencer"
              value={taskDeadlines.filter(d => d.status === 'upcoming').length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Eventos Esta Semana"
              value={classEvents.filter(e => dayjs(e.date).isSame(dayjs(), 'week')).length}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Main Calendar */}
        <Col xs={24} lg={16}>
          <Card title="Calendario de Eventos">
            <CalendarPage />
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Today's Schedule */}
            <Card 
              title="Horario de Hoy" 
              size="small"
              extra={<Badge count={teacherSchedule.filter(s => s.dayOfWeek === dayjs().format('dddd')).length} />}
            >
              <List
                size="small"
                dataSource={teacherSchedule.filter(s => s.dayOfWeek === dayjs().format('dddd'))}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<BookOutlined />} />}
                      title={item.subject}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">{item.timeSlot}</Text>
                          <Text type="secondary">{item.classGroup} - {item.classroom}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No hay clases hoy' }}
              />
            </Card>

            {/* Task Deadlines */}
            <Card title="Fechas Límite de Tareas" size="small">
              <List
                size="small"
                dataSource={taskDeadlines.slice(0, 5)}
                renderItem={(deadline) => {
                  const status = getDeadlineStatus(deadline);
                  const completionRate = getCompletionRate(deadline);
                  
                  return (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            icon={status.icon} 
                            style={{ backgroundColor: status.color }}
                          />
                        }
                        title={deadline.title}
                        description={
                          <Space direction="vertical" size={0} style={{ width: '100%' }}>
                            <Text type="secondary">
                              {dayjs(deadline.dueDate).format('DD/MM/YYYY')}
                            </Text>
                            <Text type="secondary">
                              {deadline.subject} - {deadline.classGroup}
                            </Text>
                            <div>
                              <Text type="secondary">
                                Entregas: {deadline.submissionCount}/{deadline.totalStudents} ({completionRate}%)
                              </Text>
                            </div>
                          </Space>
                        }
                      />
                    </List.Item>
                  );
                }}
                locale={{ emptyText: 'No hay fechas límite próximas' }}
              />
            </Card>

            {/* Upcoming Class Events */}
            <Card title="Próximos Eventos de Clase" size="small">
              <List
                size="small"
                dataSource={classEvents
                  .filter(event => dayjs(event.date).isAfter(dayjs()))
                  .slice(0, 5)
                }
                renderItem={(event) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<CalendarOutlined />} />}
                      title={event.title}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">
                            {dayjs(event.date).format('DD/MM/YYYY')}
                          </Text>
                          <Text type="secondary">
                            {event.subject} - {event.classGroup}
                          </Text>
                          <Tag size="small">{event.type}</Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No hay eventos próximos' }}
              />
            </Card>

            {/* Quick Actions */}
            <Card title="Acciones Rápidas" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  block 
                  icon={<PlusOutlined />}
                  onClick={() => setQuickEventModalVisible(true)}
                >
                  Crear Evento Rápido
                </Button>
                <Button 
                  block 
                  icon={<BookOutlined />}
                  onClick={() => window.location.href = '/teacher/tasks/create'}
                >
                  Nueva Tarea
                </Button>
                <Button 
                  block 
                  icon={<TeamOutlined />}
                  onClick={() => window.location.href = '/teacher/evaluations/create'}
                >
                  Nueva Evaluación
                </Button>
                <Button 
                  block 
                  icon={<BellOutlined />}
                  onClick={() => message.info('Función próximamente disponible')}
                >
                  Enviar Recordatorio
                </Button>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Weekly Schedule Tab */}
      <Card title="Horario Semanal" className="mt-6">
        <Table
          dataSource={teacherSchedule}
          columns={scheduleColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      {/* Quick Event Modal */}
      <Modal
        title="Crear Evento Rápido"
        open={quickEventModalVisible}
        onCancel={() => {
          setQuickEventModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleQuickEvent}
        >
          <Form.Item
            name="title"
            label="Título del Evento"
            rules={[{ required: true, message: 'El título es requerido' }]}
          >
            <Input placeholder="Ej: Reunión de departamento" />
          </Form.Item>

          <Form.Item
            name="date"
            label="Fecha y Hora"
            rules={[{ required: true, message: 'La fecha es requerida' }]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Selecciona fecha y hora"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Descripción (opcional)"
          >
            <Input.TextArea rows={3} placeholder="Descripción del evento" />
          </Form.Item>

          <Form.Item
            name="classGroupId"
            label="Grupo (opcional)"
          >
            <Select placeholder="Selecciona un grupo">
              {/* Aquí se cargarían los grupos del profesor */}
              <Option value="grupo1">1º ESO A</Option>
              <Option value="grupo2">2º ESO B</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Crear Evento
              </Button>
              <Button onClick={() => {
                setQuickEventModalVisible(false);
                form.resetFields();
              }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherCalendarPage;