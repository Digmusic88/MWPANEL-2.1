import React, { useState, useEffect } from 'react';
import {
  Card,
  Calendar,
  Badge,
  List,
  Avatar,
  Typography,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Tag,
  Row,
  Col,
  message,
  Spin,
  Tooltip,
  Drawer,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import apiClient from '@services/apiClient';
import { useAuth } from '@/hooks/useAuth';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: 'activity' | 'evaluation' | 'test_yourself' | 'general_event' | 'holiday' | 'meeting' | 'excursion' | 'festival' | 'deadline' | 'reminder';
  visibility: 'public' | 'teachers_only' | 'students_only' | 'families_only' | 'admin_only' | 'class_specific' | 'subject_specific' | 'private';
  color: string;
  isAllDay: boolean;
  location?: string;
  isRecurrent: boolean;
  recurrenceType?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  tags: string[];
  priority: number;
  notifyBefore: number;
  autoNotify: boolean;
  createdBy: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  eventGroups?: Array<{
    classGroup: {
      id: string;
      name: string;
    };
  }>;
  eventSubjects?: Array<{
    subject: {
      id: string;
      name: string;
    };
  }>;
  relatedTask?: {
    id: string;
    title: string;
  };
}

interface ClassGroup {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [form] = Form.useForm();
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'list'>('month');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const eventsForDate = events.filter(event => {
      const eventDate = dayjs(event.startDate);
      return eventDate.isSame(selectedDate, 'day');
    });
    setSelectedEvents(eventsForDate);
  }, [selectedDate, events]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [eventsResponse, groupsResponse, subjectsResponse] = await Promise.all([
        apiClient.get('/calendar'),
        apiClient.get('/class-groups'),
        apiClient.get('/subjects'),
      ]);

      setEvents(eventsResponse.data);
      setClassGroups(groupsResponse.data);
      setSubjects(subjectsResponse.data);
    } catch (error: any) {
      console.error('Error fetching calendar data:', error);
      message.error('Error al cargar el calendario');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventsByDateRange = async (startDate: Dayjs, endDate: Dayjs) => {
    try {
      const response = await apiClient.get('/calendar/date-range', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      setEvents(response.data);
    } catch (error: any) {
      console.error('Error fetching events by date range:', error);
      message.error('Error al cargar eventos');
    }
  };

  const handleCreateEvent = async (values: any) => {
    try {
      const eventData = {
        ...values,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        color: values.color || '#1890ff',
        priority: values.priority || 1,
        notifyBefore: values.notifyBefore || 60,
        autoNotify: values.autoNotify !== false,
        tags: values.tags || [],
        classGroupIds: values.classGroupIds || [],
        subjectIds: values.subjectIds || [],
        studentIds: values.studentIds || [],
      };

      const response = await apiClient.post('/calendar', eventData);
      
      setEvents(prev => [...prev, response.data]);
      setModalVisible(false);
      form.resetFields();
      message.success('Evento creado exitosamente');
    } catch (error: any) {
      console.error('Error creating event:', error);
      message.error(error.response?.data?.message || 'Error al crear el evento');
    }
  };

  const handleUpdateEvent = async (eventId: string, values: any) => {
    try {
      const eventData = {
        ...values,
        startDate: values.dateRange ? values.dateRange[0].toISOString() : undefined,
        endDate: values.dateRange ? values.dateRange[1].toISOString() : undefined,
      };

      const response = await apiClient.patch(`/calendar/${eventId}`, eventData);
      
      setEvents(prev => prev.map(event => 
        event.id === eventId ? response.data : event
      ));
      setDrawerVisible(false);
      setSelectedEvent(null);
      message.success('Evento actualizado exitosamente');
    } catch (error: any) {
      console.error('Error updating event:', error);
      message.error(error.response?.data?.message || 'Error al actualizar el evento');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await apiClient.delete(`/calendar/${eventId}`);
      
      setEvents(prev => prev.filter(event => event.id !== eventId));
      setDrawerVisible(false);
      setSelectedEvent(null);
      message.success('Evento eliminado exitosamente');
    } catch (error: any) {
      console.error('Error deleting event:', error);
      message.error(error.response?.data?.message || 'Error al eliminar el evento');
    }
  };

  const getListData = (value: Dayjs) => {
    const dayEvents = events.filter(event => {
      const eventDate = dayjs(event.startDate);
      return eventDate.isSame(value, 'day');
    });

    return dayEvents.map(event => ({
      type: getEventBadgeType(event.type),
      content: event.title,
      event,
    }));
  };

  const getEventBadgeType = (type: string) => {
    switch (type) {
      case 'evaluation': return 'error';
      case 'test_yourself': return 'warning';
      case 'activity': return 'success';
      case 'holiday': return 'default';
      case 'meeting': return 'processing';
      default: return 'default';
    }
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'activity': 'Actividad',
      'evaluation': 'Evaluación',
      'test_yourself': 'Test Yourself',
      'general_event': 'Evento General',
      'holiday': 'Festivo',
      'meeting': 'Reunión',
      'excursion': 'Excursión',
      'festival': 'Festival',
      'deadline': 'Fecha Límite',
      'reminder': 'Recordatorio',
    };
    return labels[type] || type;
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <ul className="events">
        {listData.slice(0, 3).map((item, index) => (
          <li key={index}>
            <Badge 
              status={item.type as any} 
              text={
                <span 
                  style={{ 
                    fontSize: '11px',
                    cursor: 'pointer',
                    color: item.event.color,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(item.event);
                    setDrawerVisible(true);
                  }}
                >
                  {item.content.length > 15 ? item.content.substring(0, 15) + '...' : item.content}
                </span>
              } 
            />
          </li>
        ))}
        {listData.length > 3 && (
          <li>
            <span style={{ fontSize: '11px', color: '#999' }}>
              +{listData.length - 3} más
            </span>
          </li>
        )}
      </ul>
    );
  };

  const canCreateEvents = user?.role === 'admin' || user?.role === 'teacher';

  const filteredEvents = events.filter(event => {
    if (filterType === 'all') return true;
    return event.type === filterType;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Cargando calendario..." />
      </div>
    );
  }

  return (
    <div className="calendar-page">
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div className="mb-6">
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2}>
                <CalendarOutlined className="mr-2" />
                Calendario Escolar
              </Title>
              <Text type="secondary">
                Gestión de eventos, actividades y fechas importantes
              </Text>
            </Col>
            <Col>
              <Space>
                <Select
                  value={filterType}
                  onChange={setFilterType}
                  style={{ width: 150 }}
                  placeholder="Filtrar por tipo"
                >
                  <Option value="all">Todos</Option>
                  <Option value="activity">Actividades</Option>
                  <Option value="evaluation">Evaluaciones</Option>
                  <Option value="test_yourself">Test Yourself</Option>
                  <Option value="holiday">Festivos</Option>
                  <Option value="meeting">Reuniones</Option>
                </Select>
                {canCreateEvents && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalVisible(true)}
                  >
                    Nuevo Evento
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </div>

        <Row gutter={[24, 24]}>
          {/* Calendar */}
          <Col xs={24} lg={18}>
            <Card>
              <Calendar
                dateCellRender={dateCellRender}
                onSelect={(date) => setSelectedDate(date)}
                onPanelChange={(date) => {
                  const startOfMonth = date.startOf('month');
                  const endOfMonth = date.endOf('month');
                  fetchEventsByDateRange(startOfMonth, endOfMonth);
                }}
              />
            </Card>
          </Col>

          {/* Events List */}
          <Col xs={24} lg={6}>
            <Card 
              title={`Eventos - ${selectedDate.format('DD/MM/YYYY')}`}
              extra={<Badge count={selectedEvents.length} showZero />}
            >
              <List
                size="small"
                dataSource={selectedEvents}
                renderItem={(event) => (
                  <List.Item
                    actions={[
                      <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          setSelectedEvent(event);
                          setDrawerVisible(true);
                        }}
                      />
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          
                          style={{ backgroundColor: event.color }}
                          icon={<CalendarOutlined />}
                        />
                      }
                      title={
                        <Tooltip title={event.title}>
                          <span>{event.title}</span>
                        </Tooltip>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <Tag color={event.color}>
                            {getEventTypeLabel(event.type)}
                          </Tag>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {event.isAllDay 
                              ? 'Todo el día'
                              : `${dayjs(event.startDate).format('HH:mm')} - ${dayjs(event.endDate).format('HH:mm')}`
                            }
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No hay eventos este día' }}
              />
            </Card>

            {/* Upcoming Events */}
            <Card title="Próximos Eventos" className="mt-4">
              <List
                size="small"
                dataSource={events
                  .filter(event => dayjs(event.startDate).isAfter(dayjs()))
                  .sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)))
                  .slice(0, 5)
                }
                renderItem={(event) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          
                          style={{ backgroundColor: event.color }}
                          icon={<CalendarOutlined />}
                        />
                      }
                      title={event.title}
                      description={
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {dayjs(event.startDate).format('DD/MM/YYYY HH:mm')}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No hay eventos próximos' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Create Event Modal */}
        <Modal
          title="Crear Nuevo Evento"
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateEvent}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="title"
                  label="Título"
                  rules={[{ required: true, message: 'El título es requerido' }]}
                >
                  <Input placeholder="Título del evento" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Tipo de Evento"
                  rules={[{ required: true, message: 'El tipo es requerido' }]}
                >
                  <Select placeholder="Selecciona el tipo">
                    <Option value="activity">Actividad</Option>
                    <Option value="evaluation">Evaluación</Option>
                    <Option value="test_yourself">Test Yourself</Option>
                    <Option value="general_event">Evento General</Option>
                    <Option value="holiday">Festivo</Option>
                    <Option value="meeting">Reunión</Option>
                    <Option value="excursion">Excursión</Option>
                    <Option value="festival">Festival</Option>
                    <Option value="deadline">Fecha Límite</Option>
                    <Option value="reminder">Recordatorio</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Descripción"
            >
              <TextArea rows={3} placeholder="Descripción del evento" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="dateRange"
                  label="Fecha y Hora"
                  rules={[{ required: true, message: 'La fecha es requerida' }]}
                >
                  <RangePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    style={{ width: '100%' }}
                    placeholder={['Fecha inicio', 'Fecha fin']}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="isAllDay"
                  label="Todo el día"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="visibility"
                  label="Visibilidad"
                  rules={[{ required: true, message: 'La visibilidad es requerida' }]}
                >
                  <Select placeholder="Selecciona la visibilidad">
                    <Option value="public">Público</Option>
                    <Option value="teachers_only">Solo Profesores</Option>
                    <Option value="students_only">Solo Estudiantes</Option>
                    <Option value="families_only">Solo Familias</Option>
                    <Option value="admin_only">Solo Administradores</Option>
                    <Option value="class_specific">Grupos Específicos</Option>
                    <Option value="subject_specific">Asignaturas Específicas</Option>
                    <Option value="private">Privado</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="location"
                  label="Ubicación"
                >
                  <Input placeholder="Ubicación del evento" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Crear Evento
                </Button>
                <Button onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}>
                  Cancelar
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Event Details Drawer */}
        <Drawer
          title="Detalles del Evento"
          placement="right"
          onClose={() => {
            setDrawerVisible(false);
            setSelectedEvent(null);
          }}
          open={drawerVisible}
          width={600}
          extra={
            selectedEvent && canCreateEvents && (
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    // Open edit modal with selectedEvent data
                  }}
                >
                  Editar
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: '¿Eliminar evento?',
                      content: '¿Estás seguro de que quieres eliminar este evento?',
                      onOk: () => selectedEvent && handleDeleteEvent(selectedEvent.id),
                    });
                  }}
                >
                  Eliminar
                </Button>
              </Space>
            )
          }
        >
          {selectedEvent && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={4}>{selectedEvent.title}</Title>
                <Tag color={selectedEvent.color}>
                  {getEventTypeLabel(selectedEvent.type)}
                </Tag>
              </div>

              {selectedEvent.description && (
                <div>
                  <Text strong>Descripción:</Text>
                  <Paragraph>{selectedEvent.description}</Paragraph>
                </div>
              )}

              <div>
                <Space direction="vertical" size="small">
                  <div>
                    <ClockCircleOutlined className="mr-2" />
                    <Text strong>Fecha y Hora:</Text>
                  </div>
                  <Text>
                    {selectedEvent.isAllDay 
                      ? `${dayjs(selectedEvent.startDate).format('DD/MM/YYYY')} - Todo el día`
                      : `${dayjs(selectedEvent.startDate).format('DD/MM/YYYY HH:mm')} - ${dayjs(selectedEvent.endDate).format('DD/MM/YYYY HH:mm')}`
                    }
                  </Text>
                </Space>
              </div>

              {selectedEvent.location && (
                <div>
                  <Space direction="vertical" size="small">
                    <div>
                      <EnvironmentOutlined className="mr-2" />
                      <Text strong>Ubicación:</Text>
                    </div>
                    <Text>{selectedEvent.location}</Text>
                  </Space>
                </div>
              )}

              <div>
                <Space direction="vertical" size="small">
                  <div>
                    <UserOutlined className="mr-2" />
                    <Text strong>Creado por:</Text>
                  </div>
                  <Text>
                    {selectedEvent.createdBy.profile.firstName} {selectedEvent.createdBy.profile.lastName}
                  </Text>
                </Space>
              </div>

              {selectedEvent.eventGroups && selectedEvent.eventGroups.length > 0 && (
                <div>
                  <Space direction="vertical" size="small">
                    <div>
                      <TeamOutlined className="mr-2" />
                      <Text strong>Grupos:</Text>
                    </div>
                    <Space wrap>
                      {selectedEvent.eventGroups.map(eg => (
                        <Tag key={eg.classGroup.id}>{eg.classGroup.name}</Tag>
                      ))}
                    </Space>
                  </Space>
                </div>
              )}

              {selectedEvent.eventSubjects && selectedEvent.eventSubjects.length > 0 && (
                <div>
                  <Space direction="vertical" size="small">
                    <div>
                      <BookOutlined className="mr-2" />
                      <Text strong>Asignaturas:</Text>
                    </div>
                    <Space wrap>
                      {selectedEvent.eventSubjects.map(es => (
                        <Tag key={es.subject.id}>{es.subject.name}</Tag>
                      ))}
                    </Space>
                  </Space>
                </div>
              )}

              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                <div>
                  <Text strong>Tags:</Text>
                  <div className="mt-2">
                    <Space wrap>
                      {selectedEvent.tags.map(tag => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </Space>
                  </div>
                </div>
              )}
            </Space>
          )}
        </Drawer>
      </div>

      <style>{`
        .events {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .events .ant-badge-status {
          overflow: hidden;
          white-space: nowrap;
          width: 100%;
          text-overflow: ellipsis;
          font-size: 12px;
        }
        .ant-picker-calendar-date-content {
          height: 80px;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default CalendarPage;