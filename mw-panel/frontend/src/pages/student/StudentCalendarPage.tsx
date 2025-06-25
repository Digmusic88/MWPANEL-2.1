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
  Progress,
  Button,
  Select,
  DatePicker,
  message,
  Tabs,
  Empty,
} from 'antd';
import {
  CalendarOutlined,
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  TeamOutlined,
  BellOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import CalendarPage from '../shared/CalendarPage';
import apiClient from '@services/apiClient';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface StudentSchedule {
  id: string;
  subject: string;
  teacher: string;
  timeSlot: string;
  dayOfWeek: string;
  classroom: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  grade?: number;
  maxPoints?: number;
  type: 'task' | 'exam' | 'project';
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  date: string;
  duration: string;
  classroom: string;
  topics: string[];
}

interface StudentEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  description?: string;
  isOptional: boolean;
}

const StudentCalendarPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [studentSchedule, setStudentSchedule] = useState<StudentSchedule[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [studentEvents, setStudentEvents] = useState<StudentEvent[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [scheduleResponse, assignmentsResponse, examsResponse, eventsResponse] = await Promise.all([
        apiClient.get('/schedules/student/current'),
        apiClient.get('/tasks/student/assignments'),
        apiClient.get('/evaluations/student/upcoming'),
        apiClient.get('/calendar/student/events'),
      ]);

      setStudentSchedule(scheduleResponse.data);
      setAssignments(assignmentsResponse.data);
      setExams(examsResponse.data);
      setStudentEvents(eventsResponse.data);
    } catch (error: any) {
      console.error('Error fetching student data:', error);
      message.error('Error al cargar datos del estudiante');
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentStatus = (assignment: Assignment) => {
    switch (assignment.status) {
      case 'pending':
        return { color: 'orange', icon: <ClockCircleOutlined />, text: 'Pendiente' };
      case 'submitted':
        return { color: 'blue', icon: <CheckCircleOutlined />, text: 'Entregada' };
      case 'graded':
        return { color: 'green', icon: <TrophyOutlined />, text: 'Calificada' };
      case 'late':
        return { color: 'red', icon: <ExclamationCircleOutlined />, text: 'Tardía' };
      default:
        return { color: 'default', icon: <ClockCircleOutlined />, text: 'Pendiente' };
    }
  };

  const getAssignmentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'task': 'Tarea',
      'exam': 'Examen',
      'project': 'Proyecto',
    };
    return labels[type] || type;
  };

  const getPendingAssignments = () => {
    return assignments.filter(a => a.status === 'pending' || a.status === 'late');
  };

  const getUpcomingExams = () => {
    return exams.filter(e => dayjs(e.date).isAfter(dayjs()));
  };

  const getTodaysClasses = () => {
    const today = dayjs().format('dddd');
    return studentSchedule.filter(s => s.dayOfWeek === today);
  };

  const getGradeAverage = () => {
    const gradedAssignments = assignments.filter(a => a.status === 'graded' && a.grade && a.maxPoints);
    if (gradedAssignments.length === 0) return 0;
    
    const total = gradedAssignments.reduce((sum, a) => sum + (a.grade! / a.maxPoints!) * 10, 0);
    return Math.round((total / gradedAssignments.length) * 100) / 100;
  };

  const getCompletionRate = () => {
    if (assignments.length === 0) return 0;
    const completed = assignments.filter(a => a.status === 'submitted' || a.status === 'graded').length;
    return Math.round((completed / assignments.length) * 100);
  };

  const filteredAssignments = selectedSubject === 'all' 
    ? assignments 
    : assignments.filter(a => a.subject === selectedSubject);

  const uniqueSubjects = Array.from(new Set(assignments.map(a => a.subject)));

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div className="mb-6">
        <Title level={2}>
          <CalendarOutlined className="mr-2" />
          Mi Calendario Académico
        </Title>
        <Text type="secondary">
          Mantente al día con tus clases, tareas y evaluaciones
        </Text>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Clases Hoy"
              value={getTodaysClasses().length}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tareas Pendientes"
              value={getPendingAssignments().length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Próximos Exámenes"
              value={getUpcomingExams().length}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Promedio General"
              value={getGradeAverage()}
              precision={1}
              suffix="/10"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress Card */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <Alert
            message={`Tienes ${getPendingAssignments().length} tareas pendientes y ${getUpcomingExams().length} exámenes próximos`}
            description={`Tu tasa de finalización de tareas es del ${getCompletionRate()}%. ¡Sigue así!`}
            type={getPendingAssignments().length > 5 ? 'warning' : 'success'}
            showIcon
            action={
              <Button onClick={() => message.info('Ve a la sección de tareas para más detalles')}>
                Ver Detalles
              </Button>
            }
          />
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
              extra={<Badge count={getTodaysClasses().length} />}
            >
              <List
                size="small"
                dataSource={getTodaysClasses()}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<BookOutlined />} />}
                      title={item.subject}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">{item.timeSlot}</Text>
                          <Text type="secondary">{item.teacher}</Text>
                          <Text type="secondary">{item.classroom}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No hay clases hoy' }}
              />
            </Card>

            {/* Pending Assignments */}
            <Card 
              title="Tareas Pendientes" 
              size="small"
              extra={
                <Space>
                  <Select
                    size="small"
                    value={selectedSubject}
                    onChange={setSelectedSubject}
                    style={{ width: 120 }}
                  >
                    <Option value="all">Todas</Option>
                    {uniqueSubjects.map(subject => (
                      <Option key={subject} value={subject}>{subject}</Option>
                    ))}
                  </Select>
                  <Badge count={getPendingAssignments().length} />
                </Space>
              }
            >
              <List
                size="small"
                dataSource={filteredAssignments.filter(a => a.status === 'pending' || a.status === 'late').slice(0, 5)}
                renderItem={(assignment) => {
                  const status = getAssignmentStatus(assignment);
                  const daysUntilDue = dayjs(assignment.dueDate).diff(dayjs(), 'days');
                  
                  return (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            icon={status.icon} 
                            style={{ backgroundColor: status.color }}
                          />
                        }
                        title={assignment.title}
                        description={
                          <Space direction="vertical" size={0} style={{ width: '100%' }}>
                            <Tag color="blue">{assignment.subject}</Tag>
                            <Text type="secondary">
                              Vence: {dayjs(assignment.dueDate).format('DD/MM/YYYY')}
                            </Text>
                            <Text type={daysUntilDue <= 1 ? 'danger' : 'secondary'}>
                              {daysUntilDue <= 0 ? 'Vencida' : `${daysUntilDue} días restantes`}
                            </Text>
                            <Tag >{getAssignmentTypeLabel(assignment.type)}</Tag>
                          </Space>
                        }
                      />
                    </List.Item>
                  );
                }}
                locale={{ emptyText: 'No hay tareas pendientes' }}
              />
              {getPendingAssignments().length > 5 && (
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <Button type="link" size="small">
                    Ver todas las tareas ({getPendingAssignments().length})
                  </Button>
                </div>
              )}
            </Card>

            {/* Upcoming Exams */}
            <Card title="Próximos Exámenes" size="small">
              <List
                size="small"
                dataSource={getUpcomingExams().slice(0, 3)}
                renderItem={(exam) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<ExclamationCircleOutlined />} style={{ backgroundColor: '#f5222d' }} />}
                      title={exam.title}
                      description={
                        <Space direction="vertical" size={0}>
                          <Tag color="red">{exam.subject}</Tag>
                          <Text type="secondary">
                            {dayjs(exam.date).format('DD/MM/YYYY')} - {exam.duration}
                          </Text>
                          <Text type="secondary">{exam.classroom}</Text>
                          {exam.topics.length > 0 && (
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Temas: {exam.topics.join(', ')}
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No hay exámenes próximos' }}
              />
            </Card>

            {/* Recent Grades */}
            <Card title="Calificaciones Recientes" size="small">
              <List
                size="small"
                dataSource={assignments
                  .filter(a => a.status === 'graded')
                  .sort((a, b) => dayjs(b.dueDate).diff(dayjs(a.dueDate)))
                  .slice(0, 3)
                }
                renderItem={(assignment) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<TrophyOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                      title={assignment.title}
                      description={
                        <Space direction="vertical" size={0}>
                          <Tag color="blue">{assignment.subject}</Tag>
                          <Text strong style={{ color: '#52c41a' }}>
                            {assignment.grade}/{assignment.maxPoints} ({Math.round((assignment.grade! / assignment.maxPoints!) * 10 * 10) / 10}/10)
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No hay calificaciones recientes' }}
              />
            </Card>

            {/* Completion Progress */}
            <Card title="Progreso del Periodo" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>Tareas Completadas</Text>
                  <Progress
                    percent={getCompletionRate()}
                    strokeColor="#52c41a"
                    trailColor="#f0f0f0"
                  />
                </div>
                <div>
                  <Text>Promedio Actual</Text>
                  <Progress
                    percent={getGradeAverage() * 10}
                    strokeColor="#1890ff"
                    trailColor="#f0f0f0"
                    format={() => `${getGradeAverage()}/10`}
                  />
                </div>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default StudentCalendarPage;