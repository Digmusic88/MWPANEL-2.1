import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  List,
  Avatar,
  Badge,
  Tag,
  Space,
  Alert,
  Statistic,
  Button,
  Select,
  Tabs,
  Switch,
  message,
  Divider,
  Progress,
} from 'antd';
import {
  CalendarOutlined,
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  TeamOutlined,
  UserOutlined,
  BellOutlined,
  HomeOutlined,
  MailOutlined,
} from '@ant-design/icons';
import CalendarPage from '../shared/CalendarPage';
import apiClient from '@services/apiClient';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  classGroup: string;
  academicYear: string;
}

interface FamilyEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  studentName?: string;
  description?: string;
  requiresResponse?: boolean;
  hasResponded?: boolean;
}

interface StudentAssignment {
  studentId: string;
  studentName: string;
  assignments: Array<{
    id: string;
    title: string;
    subject: string;
    dueDate: string;
    status: 'pending' | 'submitted' | 'graded' | 'late';
    grade?: number;
    maxPoints?: number;
  }>;
}

interface FamilyNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  studentName?: string;
  date: string;
  isRead: boolean;
}

const FamilyCalendarPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [familyEvents, setFamilyEvents] = useState<FamilyEvent[]>([]);
  const [studentAssignments, setStudentAssignments] = useState<StudentAssignment[]>([]);
  const [notifications, setNotifications] = useState<FamilyNotification[]>([]);
  const [showOnlyPending, setShowOnlyPending] = useState(true);

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    try {
      setLoading(true);
      const [studentsResponse, eventsResponse, assignmentsResponse, notificationsResponse] = await Promise.all([
        apiClient.get('/families/my-students'),
        apiClient.get('/calendar/family/events'),
        apiClient.get('/families/student-assignments'),
        apiClient.get('/families/notifications'),
      ]);

      setStudents(studentsResponse.data);
      setFamilyEvents(eventsResponse.data);
      setStudentAssignments(assignmentsResponse.data);
      setNotifications(notificationsResponse.data);
    } catch (error: any) {
      console.error('Error fetching family data:', error);
      message.error('Error al cargar datos familiares');
    } finally {
      setLoading(false);
    }
  };

  const handleEventResponse = async (eventId: string, response: boolean) => {
    try {
      await apiClient.post(`/calendar/family/events/${eventId}/respond`, { attending: response });
      message.success('Respuesta registrada exitosamente');
      
      setFamilyEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, hasResponded: true } : event
      ));
    } catch (error: any) {
      console.error('Error responding to event:', error);
      message.error('Error al registrar respuesta');
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch(`/families/notifications/${notificationId}/read`);
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      ));
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getFilteredAssignments = () => {
    if (selectedStudent === 'all') {
      return studentAssignments.flatMap(sa => 
        sa.assignments.map(a => ({ ...a, studentName: sa.studentName }))
      );
    }
    
    const studentData = studentAssignments.find(sa => sa.studentId === selectedStudent);
    return studentData?.assignments.map(a => ({ ...a, studentName: studentData.studentName })) || [];
  };

  const getPendingEvents = () => {
    return familyEvents.filter(event => event.requiresResponse && !event.hasResponded);
  };

  const getUpcomingEvents = () => {
    return familyEvents.filter(event => dayjs(event.date).isAfter(dayjs()));
  };

  const getUnreadNotifications = () => {
    return notifications.filter(notif => !notif.isRead);
  };

  const getStudentProgress = (studentId: string) => {
    const studentData = studentAssignments.find(sa => sa.studentId === studentId);
    if (!studentData || studentData.assignments.length === 0) return 0;
    
    const completed = studentData.assignments.filter(a => a.status === 'submitted' || a.status === 'graded').length;
    return Math.round((completed / studentData.assignments.length) * 100);
  };

  const getStudentAverage = (studentId: string) => {
    const studentData = studentAssignments.find(sa => sa.studentId === studentId);
    if (!studentData) return 0;
    
    const graded = studentData.assignments.filter(a => a.status === 'graded' && a.grade && a.maxPoints);
    if (graded.length === 0) return 0;
    
    const total = graded.reduce((sum, a) => sum + (a.grade! / a.maxPoints!) * 10, 0);
    return Math.round((total / graded.length) * 10) / 10;
  };

  const filteredAssignments = getFilteredAssignments();
  const pendingAssignments = showOnlyPending 
    ? filteredAssignments.filter(a => a.status === 'pending' || a.status === 'late')
    : filteredAssignments;

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div className="mb-6">
        <Title level={2}>
          <HomeOutlined className="mr-2" />
          Calendario Familiar
        </Title>
        <Text type="secondary">
          Mantente informado sobre las actividades y progreso académico de tus hijos
        </Text>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Eventos Pendientes"
              value={getPendingEvents().length}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Próximos Eventos"
              value={getUpcomingEvents().length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Notificaciones"
              value={getUnreadNotifications().length}
              prefix={<BellOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Mis Hijos"
              value={students.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Student Progress Overview */}
      <Card title="Progreso de Estudiantes" className="mb-6">
        <Row gutter={[16, 16]}>
          {students.map(student => (
            <Col xs={24} sm={12} lg={8} key={student.id}>
              <Card size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Avatar size="large" icon={<UserOutlined />} />
                    <div style={{ marginTop: 8 }}>
                      <Text strong>{student.firstName} {student.lastName}</Text>
                      <div>
                        <Tag color="blue">{student.classGroup}</Tag>
                      </div>
                    </div>
                  </div>
                  
                  <Divider style={{ margin: '12px 0' }} />
                  
                  <div>
                    <Text>Tareas Completadas</Text>
                    <Progress
                      percent={getStudentProgress(student.id)}
                      size="small"
                      strokeColor="#52c41a"
                    />
                  </div>
                  
                  <div>
                    <Text>Promedio Actual</Text>
                    <div style={{ textAlign: 'center', marginTop: 4 }}>
                      <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                        {getStudentAverage(student.id)}/10
                      </Text>
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Main Calendar */}
        <Col xs={24} lg={16}>
          <Card title="Calendario de Eventos Familiares">
            <CalendarPage />
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Events Requiring Response */}
            {getPendingEvents().length > 0 && (
              <Card 
                title="Eventos que Requieren Respuesta" 
                size="small"
                extra={<Badge count={getPendingEvents().length} />}
              >
                <List
                  size="small"
                  dataSource={getPendingEvents()}
                  renderItem={(event) => (
                    <List.Item
                      actions={[
                        <Button 
                          size="small" 
                          type="primary" 
                          onClick={() => handleEventResponse(event.id, true)}
                        >
                          Asistir
                        </Button>,
                        <Button 
                          size="small" 
                          onClick={() => handleEventResponse(event.id, false)}
                        >
                          No Asistir
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<MailOutlined />} style={{ backgroundColor: '#faad14' }} />}
                        title={event.title}
                        description={
                          <Space direction="vertical" size={0}>
                            {event.studentName && <Tag size="small">{event.studentName}</Tag>}
                            <Text type="secondary">
                              {dayjs(event.date).format('DD/MM/YYYY HH:mm')}
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {/* Student Assignments */}
            <Card 
              title="Tareas de Estudiantes" 
              size="small"
              extra={
                <Space>
                  <Select
                    size="small"
                    value={selectedStudent}
                    onChange={setSelectedStudent}
                    style={{ width: 120 }}
                  >
                    <Option value="all">Todos</Option>
                    {students.map(student => (
                      <Option key={student.id} value={student.id}>
                        {student.firstName}
                      </Option>
                    ))}
                  </Select>
                  <Switch
                    size="small"
                    checked={showOnlyPending}
                    onChange={setShowOnlyPending}
                    checkedChildren="Pendientes"
                    unCheckedChildren="Todas"
                  />
                </Space>
              }
            >
              <List
                size="small"
                dataSource={pendingAssignments.slice(0, 5)}
                renderItem={(assignment) => {
                  const isLate = assignment.status === 'late';
                  const isPending = assignment.status === 'pending';
                  
                  return (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            icon={isPending ? <ClockCircleOutlined /> : isLate ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />}
                            style={{ 
                              backgroundColor: isPending ? '#faad14' : isLate ? '#f5222d' : '#52c41a' 
                            }}
                          />
                        }
                        title={assignment.title}
                        description={
                          <Space direction="vertical" size={0}>
                            <Space>
                              <Tag size="small" color="blue">{assignment.subject}</Tag>
                              {selectedStudent === 'all' && (
                                <Tag size="small">{assignment.studentName}</Tag>
                              )}
                            </Space>
                            <Text type="secondary">
                              Vence: {dayjs(assignment.dueDate).format('DD/MM/YYYY')}
                            </Text>
                            {assignment.status === 'graded' && (
                              <Text style={{ color: '#52c41a' }}>
                                Calificación: {assignment.grade}/{assignment.maxPoints}
                              </Text>
                            )}
                          </Space>
                        }
                      />
                    </List.Item>
                  );
                }}
                locale={{ emptyText: 'No hay tareas para mostrar' }}
              />
            </Card>

            {/* Notifications */}
            <Card 
              title="Notificaciones" 
              size="small"
              extra={<Badge count={getUnreadNotifications().length} />}
            >
              <List
                size="small"
                dataSource={notifications.slice(0, 5)}
                renderItem={(notification) => (
                  <List.Item
                    onClick={() => !notification.isRead && markNotificationAsRead(notification.id)}
                    style={{ 
                      cursor: !notification.isRead ? 'pointer' : 'default',
                      backgroundColor: !notification.isRead ? '#f6ffed' : 'transparent'
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={<BellOutlined />} 
                          style={{ 
                            backgroundColor: notification.isRead ? '#d9d9d9' : '#1890ff'
                          }}
                        />
                      }
                      title={
                        <Text strong={!notification.isRead}>
                          {notification.title}
                        </Text>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          {notification.studentName && (
                            <Tag size="small">{notification.studentName}</Tag>
                          )}
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {notification.message}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {dayjs(notification.date).format('DD/MM/YYYY HH:mm')}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No hay notificaciones' }}
              />
            </Card>

            {/* Upcoming Events */}
            <Card title="Próximos Eventos" size="small">
              <List
                size="small"
                dataSource={getUpcomingEvents().slice(0, 5)}
                renderItem={(event) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<CalendarOutlined />} />}
                      title={event.title}
                      description={
                        <Space direction="vertical" size={0}>
                          {event.studentName && <Tag size="small">{event.studentName}</Tag>}
                          <Text type="secondary">
                            {dayjs(event.date).format('DD/MM/YYYY HH:mm')}
                          </Text>
                          <Tag size="small" color="green">{event.type}</Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No hay eventos próximos' }}
              />
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default FamilyCalendarPage;