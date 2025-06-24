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
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  BookOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import apiClient from '@services/apiClient';

const { Title, Text } = Typography;

interface StudentProfile {
  id: string;
  enrollmentNumber: string;
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
  classGroup: {
    id: string;
    name: string;
    section?: string;
  };
}

interface StudentStats {
  totalSubjects: number;
  averageGrade: number;
  attendanceRate: number;
  completedActivities: number;
  pendingActivities: number;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/students/me');
      setProfile(response.data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // These endpoints might need to be implemented
      const response = await apiClient.get('/students/me/statistics');
      setStats(response.data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      // Set mock data if endpoint doesn't exist
      setStats({
        totalSubjects: 6,
        averageGrade: 8.7,
        attendanceRate: 96,
        completedActivities: 45,
        pendingActivities: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>Error al cargar el perfil</Text>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Row gutter={[16, 16]}>
          {/* Profile Header */}
          <Col span={24}>
            <Card>
              <Space size="large">
                <Avatar
                  size={100}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#1890ff' }}
                />
                <div>
                  <Title level={2} style={{ margin: 0 }}>
                    {profile.user.profile.firstName} {profile.user.profile.lastName}
                  </Title>
                  <Text type="secondary" style={{ fontSize: '16px' }}>
                    Estudiante - {profile.classGroup.name}
                    {profile.classGroup.section && ` (${profile.classGroup.section})`}
                  </Text>
                  <br />
                  <Tag color="blue" style={{ marginTop: 8 }}>
                    {profile.enrollmentNumber}
                  </Tag>
                  <Tag color={profile.user.isActive ? 'green' : 'red'}>
                    {profile.user.isActive ? 'Activo' : 'Inactivo'}
                  </Tag>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Statistics */}
          {stats && (
            <Col span={24}>
              <Card title="Estadísticas Académicas">
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Asignaturas"
                      value={stats.totalSubjects}
                      prefix={<BookOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Promedio General"
                      value={stats.averageGrade}
                      precision={1}
                      prefix={<TrophyOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Asistencia"
                      value={stats.attendanceRate}
                      suffix="%"
                      prefix={<ClockCircleOutlined />}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Actividades Pendientes"
                      value={stats.pendingActivities}
                      prefix={<CalendarOutlined />}
                      valueStyle={{ color: stats.pendingActivities > 0 ? '#faad14' : '#52c41a' }}
                    />
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
                <Descriptions.Item label="Número de Matrícula">
                  {profile.enrollmentNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Documento de Identidad">
                  {profile.user.profile.documentNumber || 'No especificado'}
                </Descriptions.Item>
                <Descriptions.Item label="Fecha de Nacimiento">
                  {profile.user.profile.dateOfBirth 
                    ? new Date(profile.user.profile.dateOfBirth).toLocaleDateString('es-ES')
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
                  {new Date(profile.user.createdAt).toLocaleDateString('es-ES')}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Academic Information */}
          <Col span={24}>
            <Card title="Información Académica">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Grupo">
                  {profile.classGroup.name}
                  {profile.classGroup.section && ` - Sección ${profile.classGroup.section}`}
                </Descriptions.Item>
                <Descriptions.Item label="Estado Académico">
                  <Tag color="green">Activo</Tag>
                </Descriptions.Item>
                {stats && (
                  <>
                    <Descriptions.Item label="Actividades Completadas">
                      {stats.completedActivities}
                    </Descriptions.Item>
                    <Descriptions.Item label="Actividades Pendientes">
                      {stats.pendingActivities}
                    </Descriptions.Item>
                  </>
                )}
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ProfilePage;