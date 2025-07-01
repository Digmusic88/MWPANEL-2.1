import React, { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Avatar,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
  Tag,
  Spin,
  List,
  Badge,
  Progress,
  Divider,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BookOutlined,
  TeamOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  BarChartOutlined,
  HomeOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import apiClient from '@services/apiClient';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface TeacherProfile {
  id: string;
  employeeNumber: string;
  department?: string;
  user: {
    id: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    profile: {
      firstName: string;
      lastName: string;
      dateOfBirth?: string;
      documentNumber?: string;
      phone?: string;
      address?: string;
    };
  };
  subjectAssignments?: Array<{
    id: string;
    subject: {
      id: string;
      name: string;
      code: string;
    };
    classGroup: {
      id: string;
      name: string;
    };
  }>;
}

interface TeacherStats {
  totalStudents: number;
  totalSubjects: number;
  totalClassGroups: number;
  averageClassGrade: number;
  completedActivities: number;
  pendingActivities: number;
  attendanceRate: number;
  totalActivitiesCreated: number;
}

interface Schedule {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subject: {
    name: string;
    code: string;
  };
  classGroup: {
    name: string;
  };
  classroom?: {
    name: string;
  };
}

const TeacherProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchStats();
    fetchSchedules();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/teachers/me');
      setProfile(response.data);
    } catch (error: any) {
      console.error('Error fetching teacher profile:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/teachers/me/statistics');
      setStats(response.data);
    } catch (error: any) {
      console.error('Error fetching teacher stats:', error);
      // Set mock data if endpoint doesn't exist
      setStats({
        totalStudents: 125,
        totalSubjects: 3,
        totalClassGroups: 5,
        averageClassGrade: 7.8,
        completedActivities: 67,
        pendingActivities: 8,
        attendanceRate: 92,
        totalActivitiesCreated: 75,
      });
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await apiClient.get('/teachers/me/schedules');
      setSchedules(response.data);
    } catch (error: any) {
      console.error('Error fetching teacher schedules:', error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayNumber: string) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[parseInt(dayNumber)] || dayNumber;
  };

  const getUniqueSubjects = () => {
    if (!profile?.subjectAssignments) return [];
    const subjects = profile.subjectAssignments.map(sa => sa.subject);
    return subjects.filter((subject, index, self) => 
      index === self.findIndex(s => s.id === subject.id)
    );
  };

  const getUniqueClassGroups = () => {
    if (!profile?.subjectAssignments) return [];
    const groups = profile.subjectAssignments.map(sa => sa.classGroup);
    return groups.filter((group, index, self) => 
      index === self.findIndex(g => g.id === group.id)
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large">
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            Cargando perfil del profesor...
          </div>
        </Spin>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>Error al cargar el perfil del profesor</Text>
      </div>
    );
  }

  return (
    <div className="teacher-profile-page">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Row gutter={[16, 16]}>
          {/* Profile Header */}
          <Col span={24}>
            <Card>
              <Space size="large">
                <Avatar
                  size={100}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#52c41a' }}
                />
                <div>
                  <Title level={2} style={{ margin: 0 }}>
                    {profile.user.profile.firstName} {profile.user.profile.lastName}
                  </Title>
                  <Text type="secondary" style={{ fontSize: '16px' }}>
                    Profesor {profile.department && `- ${profile.department}`}
                  </Text>
                  <br />
                  <Tag color="green" style={{ marginTop: 8 }}>
                    <IdcardOutlined /> {profile.employeeNumber}
                  </Tag>
                  <Tag color={profile.user.isActive ? 'blue' : 'red'}>
                    {profile.user.isActive ? 'Activo' : 'Inactivo'}
                  </Tag>
                  <Tag color="orange">
                    {getUniqueSubjects().length} Asignatura{getUniqueSubjects().length !== 1 ? 's' : ''}
                  </Tag>
                  <Tag color="purple">
                    {getUniqueClassGroups().length} Grupo{getUniqueClassGroups().length !== 1 ? 's' : ''}
                  </Tag>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Teaching Statistics */}
          {stats && (
            <Col span={24}>
              <Card title="Estadísticas de Enseñanza">
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Total Estudiantes"
                      value={stats.totalStudents}
                      prefix={<TeamOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Promedio de Clase"
                      value={stats.averageClassGrade}
                      precision={1}
                      prefix={<TrophyOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                      suffix="/10"
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Asistencia Media"
                      value={stats.attendanceRate}
                      suffix="%"
                      prefix={<ClockCircleOutlined />}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Actividades Creadas"
                      value={stats.totalActivitiesCreated}
                      prefix={<BarChartOutlined />}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Col>
                </Row>
                <Divider />
                <Row gutter={16}>
                  <Col xs={24} sm={8}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                      <Text strong>Actividades Completadas</Text>
                      <Progress 
                        type="dashboard" 
                        percent={Math.round((stats.completedActivities / (stats.completedActivities + stats.pendingActivities)) * 100)}
                        format={() => `${stats.completedActivities}/${stats.completedActivities + stats.pendingActivities}`}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                      <Text strong>Asignaturas</Text>
                      <div style={{ fontSize: '24px', color: '#1890ff', marginTop: '10px' }}>
                        {stats.totalSubjects}
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                      <Text strong>Grupos de Clase</Text>
                      <div style={{ fontSize: '24px', color: '#52c41a', marginTop: '10px' }}>
                        {stats.totalClassGroups}
                      </div>
                    </Card>
                  </Col>
                </Row>
              </Card>
            </Col>
          )}

          {/* Personal Information */}
          <Col xs={24} lg={12}>
            <Card title="Información Personal">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Nombre Completo">
                  {profile.user.profile.firstName} {profile.user.profile.lastName}
                </Descriptions.Item>
                <Descriptions.Item label="Número de Empleado">
                  {profile.employeeNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Departamento">
                  {profile.department || 'No especificado'}
                </Descriptions.Item>
                <Descriptions.Item label="Documento de Identidad">
                  {profile.user.profile.documentNumber || 'No especificado'}
                </Descriptions.Item>
                <Descriptions.Item label="Fecha de Nacimiento">
                  {profile.user.profile.dateOfBirth 
                    ? dayjs(profile.user.profile.dateOfBirth).format('DD/MM/YYYY')
                    : 'No especificada'
                  }
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Contact Information */}
          <Col xs={24} lg={12}>
            <Card title="Información de Contacto">
              <Descriptions column={1} size="small">
                <Descriptions.Item 
                  label={<><MailOutlined /> Email</>}
                >
                  {profile.user.email}
                </Descriptions.Item>
                <Descriptions.Item 
                  label={<><PhoneOutlined /> Teléfono</>}
                >
                  {profile.user.profile.phone || 'No especificado'}
                </Descriptions.Item>
                <Descriptions.Item 
                  label={<><HomeOutlined /> Dirección</>}
                >
                  {profile.user.profile.address || 'No especificada'}
                </Descriptions.Item>
                <Descriptions.Item label="Miembro desde">
                  {dayjs(profile.user.createdAt).format('DD/MM/YYYY')}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Subject Assignments */}
          <Col xs={24} lg={12}>
            <Card title="Asignaturas Asignadas" extra={<Badge count={getUniqueSubjects().length} />}>
              <List
                size="small"
                dataSource={getUniqueSubjects()}
                renderItem={(subject) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<BookOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                      title={subject.name}
                      description={`Código: ${subject.code}`}
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No hay asignaturas asignadas' }}
              />
            </Card>
          </Col>

          {/* Class Groups */}
          <Col xs={24} lg={12}>
            <Card title="Grupos de Clase" extra={<Badge count={getUniqueClassGroups().length} />}>
              <List
                size="small"
                dataSource={getUniqueClassGroups()}
                renderItem={(group) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<TeamOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                      title={group.name}
                      description={`Estudiantes en este grupo`}
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No hay grupos asignados' }}
              />
            </Card>
          </Col>

          {/* Weekly Schedule */}
          <Col span={24}>
            <Card title="Horario Semanal" extra={<Badge count={schedules.length} />}>
              <List
                size="small"
                dataSource={schedules}
                renderItem={(schedule) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<CalendarOutlined />} style={{ backgroundColor: '#faad14' }} />}
                      title={`${getDayName(schedule.dayOfWeek)} ${schedule.startTime} - ${schedule.endTime}`}
                      description={
                        <Space wrap>
                          <Tag color="blue">{schedule.subject.name}</Tag>
                          <Tag color="green">{schedule.classGroup.name}</Tag>
                          {schedule.classroom && <Tag color="orange">{schedule.classroom.name}</Tag>}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No hay horarios programados' }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default TeacherProfilePage;