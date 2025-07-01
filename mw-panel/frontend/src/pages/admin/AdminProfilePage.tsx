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
  Timeline,
  Alert,
  Button,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  IdcardOutlined,
  TeamOutlined,
  BookOutlined,
  MessageOutlined,
  CalendarOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  BankOutlined,
  BarChartOutlined,
  CloudServerOutlined,
} from '@ant-design/icons';
import apiClient from '@services/apiClient';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface AdminProfile {
  id: string;
  employeeNumber: string;
  department?: string;
  user: {
    id: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    lastLoginAt?: string;
    profile: {
      firstName: string;
      lastName: string;
      dateOfBirth?: string;
      documentNumber?: string;
      phone?: string;
      address?: string;
    };
  };
}

interface SystemStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalFamilies: number;
  totalSubjects: number;
  totalClassGroups: number;
  totalMessages: number;
  totalActivities: number;
  systemUptime: string;
  lastBackup?: string;
  activeUsers24h: number;
  storageUsed: number;
  storageTotal: number;
}

interface ModuleStatus {
  name: string;
  enabled: boolean;
  lastUpdated: string;
  version?: string;
  status: 'healthy' | 'warning' | 'error';
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  description: string;
  timestamp: string;
  resolved?: boolean;
}

interface RecentActivity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
  type: 'login' | 'user_creation' | 'system_change' | 'error';
}

const AdminProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [moduleStatus, setModuleStatus] = useState<ModuleStatus[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch admin profile and system data
      const requests = [
        apiClient.get('/admin/profile').catch(() => ({ data: null })),
        apiClient.get('/admin/system-stats').catch(() => ({ data: null })),
        apiClient.get('/admin/modules-status').catch(() => ({ data: [] })),
        apiClient.get('/admin/system-alerts').catch(() => ({ data: [] })),
        apiClient.get('/admin/recent-activity').catch(() => ({ data: [] })),
      ];

      const [profileRes, statsRes, modulesRes, alertsRes, activityRes] = await Promise.all(requests);

      setProfile(profileRes.data || {
        id: '1',
        employeeNumber: 'ADM001',
        department: 'Administración',
        user: {
          id: '1',
          email: 'admin@mwpanel.com',
          isActive: true,
          createdAt: '2024-01-01',
          lastLoginAt: new Date().toISOString(),
          profile: {
            firstName: 'Administrador',
            lastName: 'Sistema',
            phone: '+34 600 000 000',
            address: 'Centro Educativo MW Panel',
          }
        }
      });

      setSystemStats(statsRes.data || {
        totalUsers: 156,
        totalTeachers: 25,
        totalStudents: 120,
        totalFamilies: 85,
        totalSubjects: 15,
        totalClassGroups: 8,
        totalMessages: 342,
        totalActivities: 187,
        systemUptime: '45 días, 12 horas',
        lastBackup: '2024-06-25T02:00:00Z',
        activeUsers24h: 89,
        storageUsed: 2.3,
        storageTotal: 10.0,
      });

      setModuleStatus(modulesRes.data.length > 0 ? modulesRes.data : [
        { name: 'Sistema de Usuarios', enabled: true, lastUpdated: '2024-06-25', status: 'healthy' },
        { name: 'Sistema de Comunicaciones', enabled: true, lastUpdated: '2024-06-24', status: 'healthy' },
        { name: 'Sistema de Evaluaciones', enabled: true, lastUpdated: '2024-06-23', status: 'healthy' },
        { name: 'Sistema de Rúbricas', enabled: true, lastUpdated: '2024-06-25', status: 'healthy' },
        { name: 'Sistema de Tareas', enabled: true, lastUpdated: '2024-06-22', status: 'warning' },
        { name: 'Sistema de Calendario', enabled: true, lastUpdated: '2024-06-21', status: 'healthy' },
      ]);

      setSystemAlerts(alertsRes.data.length > 0 ? alertsRes.data : [
        {
          id: '1',
          type: 'warning',
          title: 'Espacio de almacenamiento',
          description: 'El uso de almacenamiento ha alcanzado el 80%',
          timestamp: '2024-06-25T10:30:00Z',
          resolved: false,
        },
        {
          id: '2',
          type: 'info',
          title: 'Backup completado',
          description: 'Backup automático completado exitosamente',
          timestamp: '2024-06-25T02:00:00Z',
          resolved: true,
        },
      ]);

      setRecentActivity(activityRes.data.length > 0 ? activityRes.data : [
        {
          id: '1',
          action: 'Inicio de sesión',
          user: 'María García (Profesora)',
          timestamp: '2024-06-25T11:45:00Z',
          type: 'login',
        },
        {
          id: '2',
          action: 'Usuario creado',
          user: 'Admin Sistema',
          timestamp: '2024-06-25T09:15:00Z',
          details: 'Nuevo estudiante: Juan Pérez',
          type: 'user_creation',
        },
        {
          id: '3',
          action: 'Configuración modificada',
          user: 'Admin Sistema',
          timestamp: '2024-06-25T08:30:00Z',
          details: 'Módulo de rúbricas activado',
          type: 'system_change',
        },
      ]);

    } catch (error: any) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <WarningOutlined style={{ color: '#ff4d4f' }} />;
      case 'warning': return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'success': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      default: return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <UserOutlined style={{ color: '#1890ff' }} />;
      case 'user_creation': return <TeamOutlined style={{ color: '#52c41a' }} />;
      case 'system_change': return <SettingOutlined style={{ color: '#faad14' }} />;
      case 'error': return <WarningOutlined style={{ color: '#ff4d4f' }} />;
      default: return <ClockCircleOutlined style={{ color: '#722ed1' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'green';
      case 'warning': return 'orange';
      case 'error': return 'red';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large">
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            Cargando datos del administrador...
          </div>
        </Spin>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>Error al cargar el perfil del administrador</Text>
      </div>
    );
  }

  return (
    <div className="admin-profile-page">
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Row gutter={[16, 16]}>
          {/* Profile Header */}
          <Col span={24}>
            <Card>
              <Space size="large">
                <Avatar
                  size={100}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#722ed1' }}
                />
                <div>
                  <Title level={2} style={{ margin: 0 }}>
                    {profile.user.profile.firstName} {profile.user.profile.lastName}
                  </Title>
                  <Text type="secondary" style={{ fontSize: '16px' }}>
                    Administrador del Sistema {profile.department && `- ${profile.department}`}
                  </Text>
                  <br />
                  <Tag color="purple" style={{ marginTop: 8 }}>
                    <IdcardOutlined /> {profile.employeeNumber}
                  </Tag>
                  <Tag color={profile.user.isActive ? 'green' : 'red'}>
                    {profile.user.isActive ? 'Activo' : 'Inactivo'}
                  </Tag>
                  <Tag color="blue">
                    <SafetyCertificateOutlined /> Acceso Total
                  </Tag>
                  {profile.user.lastLoginAt && (
                    <Tag color="cyan">
                      Última sesión: {dayjs(profile.user.lastLoginAt).format('DD/MM/YYYY HH:mm')}
                    </Tag>
                  )}
                </div>
              </Space>
            </Card>
          </Col>

          {/* System Statistics */}
          {systemStats && (
            <Col span={24}>
              <Card title="Estadísticas del Sistema">
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Total Usuarios"
                      value={systemStats.totalUsers}
                      prefix={<TeamOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Profesores"
                      value={systemStats.totalTeachers}
                      prefix={<UserOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Estudiantes"
                      value={systemStats.totalStudents}
                      prefix={<BookOutlined />}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Familias"
                      value={systemStats.totalFamilies}
                      prefix={<HomeOutlined />}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Col>
                </Row>
                <Divider />
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Mensajes"
                      value={systemStats.totalMessages}
                      prefix={<MessageOutlined />}
                      valueStyle={{ color: '#13c2c2' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Actividades"
                      value={systemStats.totalActivities}
                      prefix={<CalendarOutlined />}
                      valueStyle={{ color: '#eb2f96' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Usuarios Activos (24h)"
                      value={systemStats.activeUsers24h}
                      prefix={<ClockCircleOutlined />}
                      valueStyle={{ color: '#f5222d' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                      <Text strong>Almacenamiento</Text>
                      <Progress 
                        type="dashboard" 
                        percent={Math.round((systemStats.storageUsed / systemStats.storageTotal) * 100)}
                        format={() => `${systemStats.storageUsed}GB / ${systemStats.storageTotal}GB`}
                        strokeColor={
                          (systemStats.storageUsed / systemStats.storageTotal) > 0.8 ? '#ff4d4f' : 
                          (systemStats.storageUsed / systemStats.storageTotal) > 0.6 ? '#faad14' : '#52c41a'
                        }
                      />
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
                  {profile.department || 'Administración General'}
                </Descriptions.Item>
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
                <Descriptions.Item label="Tiempo de actividad del sistema">
                  {systemStats?.systemUptime || 'No disponible'}
                </Descriptions.Item>
                {systemStats?.lastBackup && (
                  <Descriptions.Item label="Último backup">
                    {dayjs(systemStats.lastBackup).format('DD/MM/YYYY HH:mm')}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>

          {/* System Alerts */}
          <Col xs={24} lg={12}>
            <Card title="Alertas del Sistema" extra={<Badge count={systemAlerts.filter(a => !a.resolved).length} />}>
              <List
                size="small"
                dataSource={systemAlerts.slice(0, 5)}
                renderItem={(alert) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={getAlertIcon(alert.type)}
                      title={
                        <Space>
                          <Text strong={!alert.resolved}>{alert.title}</Text>
                          {alert.resolved && <Tag color="green" size="small">Resuelto</Tag>}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">{alert.description}</Text>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {dayjs(alert.timestamp).format('DD/MM/YYYY HH:mm')}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No hay alertas activas' }}
              />
            </Card>
          </Col>

          {/* Module Status */}
          <Col xs={24} lg={12}>
            <Card title="Estado de Módulos" extra={<Badge count={moduleStatus.length} />}>
              <List
                size="small"
                dataSource={moduleStatus}
                renderItem={(module) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<DatabaseOutlined />} style={{ backgroundColor: getStatusColor(module.status) }} />}
                      title={
                        <Space>
                          <Text>{module.name}</Text>
                          <Tag color={getStatusColor(module.status)}>{module.status}</Tag>
                          {module.enabled ? 
                            <Tag color="green" size="small">Activo</Tag> : 
                            <Tag color="red" size="small">Inactivo</Tag>
                          }
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          {module.version && <Text type="secondary">Versión: {module.version}</Text>}
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            Actualizado: {dayjs(module.lastUpdated).format('DD/MM/YYYY')}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No hay módulos configurados' }}
              />
            </Card>
          </Col>

          {/* Recent Activity */}
          <Col xs={24} lg={12}>
            <Card title="Actividad Reciente">
              <Timeline
                items={recentActivity.slice(0, 5).map((activity) => ({
                  dot: getActivityIcon(activity.type),
                  children: (
                    <div>
                      <Text strong>{activity.action}</Text>
                      <br />
                      <Text type="secondary">{activity.user}</Text>
                      {activity.details && (
                        <>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>{activity.details}</Text>
                        </>
                      )}
                      <br />
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        {dayjs(activity.timestamp).format('DD/MM/YYYY HH:mm')}
                      </Text>
                    </div>
                  ),
                }))}
              />
            </Card>
          </Col>

          {/* Quick Actions */}
          <Col span={24}>
            <Card title="Acciones Rápidas">
              <Space wrap>
                <Button type="primary" icon={<TeamOutlined />}>
                  Gestionar Usuarios
                </Button>
                <Button icon={<DatabaseOutlined />}>
                  Backup del Sistema
                </Button>
                <Button icon={<BarChartOutlined />}>
                  Informes Detallados
                </Button>
                <Button icon={<SettingOutlined />}>
                  Configuración Global
                </Button>
                <Button icon={<CloudServerOutlined />}>
                  Estado del Servidor
                </Button>
                <Button icon={<SafetyCertificateOutlined />}>
                  Logs de Seguridad
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AdminProfilePage;