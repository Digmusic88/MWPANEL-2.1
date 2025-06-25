import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Badge,
  Tag,
  Space,
  Button,
  Statistic,
  Progress,
  Alert,
  Tabs,
  List,
  Modal,
  Spin,
  message,
  Tooltip,
  Drawer,
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  PlusOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  CarOutlined,
  FileTextOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EditOutlined,
  FormOutlined,
} from '@ant-design/icons';
import { useResponsive } from '../../hooks/useResponsive';
import apiClient from '@services/apiClient';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  classGroup: {
    id: string;
    name: string;
    course: string;
    level: string;
  };
  user: {
    id: string;
    email: string;
    profile: {
      avatar?: string;
      phone?: string;
    };
  };
  academicInfo: {
    currentAverage: number;
    attendanceRate: number;
    pendingTasks: number;
    totalTasks: number;
    alerts: Alert[];
  };
  medicalInfo?: {
    allergies: string[];
    medications: string[];
    emergencyContact: string;
  };
  transportInfo?: {
    busRoute?: string;
    hasLunch: boolean;
    pickupPerson: string;
  };
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  description: string;
  date: string;
  isRead: boolean;
}

interface Authorization {
  id: string;
  childId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'signed' | 'expired';
  type: 'trip' | 'medical' | 'early_departure' | 'activity';
}

const MyChildrenPage: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('academic');
  const [authorizations, setAuthorizations] = useState<Authorization[]>([]);
  
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    fetchChildren();
    fetchAuthorizations();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      
      // Usar endpoint principal de dashboard familiar que incluye toda la información
      const response = await apiClient.get('/families/dashboard/my-family');
      const dashboardData = response.data;
      
      // Transformar datos de la API a la estructura esperada
      const apiStudents = dashboardData.students || [];
      const transformedChildren: Child[] = apiStudents.map((student: any) => {
        return {
          id: student.id,
          firstName: student.user.profile.firstName,
          lastName: student.user.profile.lastName,
          birthDate: student.user.profile.birthDate || dayjs().subtract(12, 'years').toISOString(),
          classGroup: {
            id: student.classGroups?.[0]?.id || '',
            name: student.classGroups?.[0]?.name || 'Sin asignar',
            course: student.course?.name || student.classGroups?.[0]?.course?.name || 'Sin curso',
            level: student.educationalLevel?.name || 'Sin nivel',
          },
          user: {
            id: student.user.id,
            email: student.user.email,
            profile: {
              avatar: student.user.profile.avatarUrl || '',
              phone: student.user.profile.phone || '',
            },
          },
          academicInfo: {
            currentAverage: student.stats.averageGrade || 0,
            attendanceRate: student.stats.attendance || 0,
            pendingTasks: student.stats.pendingEvaluations || 0,
            totalTasks: student.stats.totalEvaluations || 0,
            alerts: student.recentEvaluations?.slice(0, 3).map((evaluation: any, index: number) => ({
              id: `alert-${student.id}-${index}`,
              type: 'info' as const,
              title: `Evaluación: ${evaluation.period}`,
              description: `Última evaluación registrada`,
              date: evaluation.createdAt,
              isRead: false,
            })) || []
          },
          medicalInfo: student.medicalInfo || {
            allergies: [],
            medications: [],
            emergencyContact: '',
          },
          transportInfo: student.transportInfo || {
            busRoute: undefined,
            hasLunch: false,
            pickupPerson: 'Sin especificar',
          },
        };
      });

      setChildren(transformedChildren);
    } catch (error) {
      console.error('Error fetching children:', error);
      message.error('Error al cargar información de los hijos');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthorizations = async () => {
    try {
      // El backend actualmente solo tiene sistema de autorizaciones de asistencia
      // Intentar obtener solicitudes de asistencia como autorizaciones
      const response = await apiClient.get('/attendance/requests/my-requests');
      const attendanceRequests = response.data || [];
      
      // Transformar solicitudes de asistencia a formato de autorizaciones
      const transformedAuthorizations: Authorization[] = attendanceRequests.map((request: any) => ({
        id: request.id,
        childId: request.studentId,
        title: request.type === 'EARLY_DEPARTURE' ? 'Salida Anticipada' : 
               request.type === 'LATE_ARRIVAL' ? 'Llegada Tardía' : 'Justificación de Ausencia',
        description: request.reason || 'Solicitud de autorización de asistencia',
        dueDate: request.requestDate,
        status: request.status.toLowerCase(), // PENDING -> pending, APPROVED -> approved
        type: request.type.toLowerCase().replace('_', '_') === 'early_departure' ? 'early_departure' : 'attendance',
      }));

      setAuthorizations(transformedAuthorizations);
    } catch (error) {
      console.error('Error fetching authorizations:', error);
      // Si no hay solicitudes de asistencia, mostrar lista vacía
      setAuthorizations([]);
    }
  };

  const getChildAge = (birthDate: string) => {
    return dayjs().diff(dayjs(birthDate), 'year');
  };


  const handleChildClick = (child: Child) => {
    setSelectedChild(child);
    setDetailVisible(true);
    setActiveTab('academic');
  };

  const handleSignAuthorization = async (authId: string) => {
    try {
      // Actualmente el sistema de autorizaciones está basado en solicitudes de asistencia
      // En el futuro se implementará un sistema completo de autorizaciones
      
      // Por ahora, mostrar mensaje informativo
      message.info('Sistema de autorizaciones en desarrollo. Las solicitudes de asistencia se gestionan en la sección de Asistencia.');
      
      /* Futuro endpoint cuando se implemente:
      await apiClient.post(`/families/authorizations/${authId}/sign`);
      
      setAuthorizations(prev => 
        prev.map(auth => 
          auth.id === authId ? { ...auth, status: 'signed' as const } : auth
        )
      );
      message.success('Autorización firmada exitosamente');
      */
    } catch (error) {
      console.error('Error signing authorization:', error);
      message.error('Error al procesar la autorización');
    }
  };

  const getChildAuthorizations = (childId: string) => {
    return authorizations.filter(auth => auth.childId === childId);
  };

  const getTotalPendingAuthorizations = () => {
    return authorizations.filter(auth => auth.status === 'pending').length;
  };

  const renderChildCard = (child: Child) => (
    <Card
      key={child.id}
      hoverable
      className="child-card"
      onClick={() => handleChildClick(child)}
      cover={
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
        }}>
          <Avatar 
            size={isMobile ? 60 : 80} 
            icon={<UserOutlined />} 
            style={{ 
              backgroundColor: '#fff', 
              color: '#667eea',
              marginBottom: 12 
            }} 
          />
          <div>
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              {child.firstName}
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
              {getChildAge(child.birthDate)} años
            </Text>
          </div>
        </div>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Tag color="blue">{child.classGroup.name}</Tag>
          <Tag color="purple">{child.classGroup.level}</Tag>
        </div>

        <div>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title="Progreso"
                value={child.academicInfo.currentAverage}
                precision={1}
                suffix="/ 10"
                valueStyle={{ 
                  fontSize: '16px',
                  color: '#1890ff'
                }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Asistencia"
                value={child.academicInfo.attendanceRate}
                suffix="%"
                valueStyle={{ 
                  fontSize: '16px',
                  color: '#52c41a'
                }}
              />
            </Col>
          </Row>
        </div>

        <div>
          {child.academicInfo.pendingTasks > 0 ? (
            <Badge 
              status="processing" 
              text={`${child.academicInfo.pendingTasks} tarea(s) pendiente(s)`}
            />
          ) : (
            <Badge 
              status="success" 
              text="Al día con las tareas"
            />
          )}
        </div>

        {child.academicInfo.alerts.length > 0 && (
          <Alert
            type={child.academicInfo.alerts[0].type}
            message={child.academicInfo.alerts[0].title}
            showIcon
          />
        )}

        <Button type="primary" icon={<EyeOutlined />} block>
          Ver Detalles
        </Button>
      </Space>
    </Card>
  );

  const renderAcademicTab = (child: Child) => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Promedio Actual"
              value={child.academicInfo.currentAverage}
              precision={1}
              suffix="/ 10"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Asistencia"
              value={child.academicInfo.attendanceRate}
              suffix="%"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Tareas Completadas"
              value={child.academicInfo.totalTasks - child.academicInfo.pendingTasks}
              suffix={`/ ${child.academicInfo.totalTasks}`}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Progreso de Tareas" size="small">
        <Progress
          percent={Math.round(((child.academicInfo.totalTasks - child.academicInfo.pendingTasks) / child.academicInfo.totalTasks) * 100)}
          status={child.academicInfo.pendingTasks === 0 ? 'success' : 'active'}
          strokeColor={child.academicInfo.pendingTasks === 0 ? '#52c41a' : '#1890ff'}
        />
        <Text type="secondary">
          {child.academicInfo.totalTasks - child.academicInfo.pendingTasks} de {child.academicInfo.totalTasks} tareas completadas
        </Text>
      </Card>

      {child.academicInfo.alerts.length > 0 && (
        <Card title="Alertas Académicas" size="small">
          <List
            dataSource={child.academicInfo.alerts}
            renderItem={(alert) => (
              <List.Item>
                <Alert
                  type={alert.type}
                  message={alert.title}
                  description={alert.description}
                  showIcon
                  style={{ width: '100%' }}
                />
              </List.Item>
            )}
          />
        </Card>
      )}
    </Space>
  );

  const renderMedicalTab = (child: Child) => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card title="Información Médica" size="small">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Text strong>Alergias:</Text>
            <div style={{ marginTop: 8 }}>
              {child.medicalInfo?.allergies?.length ? (
                child.medicalInfo.allergies.map((allergy, index) => (
                  <Tag key={index} color="red">{allergy}</Tag>
                ))
              ) : (
                <Text type="secondary">Sin alergias conocidas</Text>
              )}
            </div>
          </Col>
          <Col span={24}>
            <Text strong>Medicación:</Text>
            <div style={{ marginTop: 8 }}>
              {child.medicalInfo?.medications?.length ? (
                child.medicalInfo.medications.map((medication, index) => (
                  <Tag key={index} color="blue">{medication}</Tag>
                ))
              ) : (
                <Text type="secondary">Sin medicación regular</Text>
              )}
            </div>
          </Col>
          <Col span={24}>
            <Text strong>Contacto de Emergencia:</Text>
            <div style={{ marginTop: 8 }}>
              <Text>{child.medicalInfo?.emergencyContact || 'No especificado'}</Text>
            </div>
          </Col>
        </Row>
      </Card>
    </Space>
  );

  const renderTransportTab = (child: Child) => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card title="Transporte y Comedor" size="small">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Space>
              <CarOutlined />
              <Text strong>Ruta de Autobús:</Text>
              <Text>{child.transportInfo?.busRoute || 'Transporte propio'}</Text>
            </Space>
          </Col>
          <Col span={24}>
            <Space>
              <HeartOutlined />
              <Text strong>Comedor:</Text>
              <Tag color={child.transportInfo?.hasLunch ? 'green' : 'red'}>
                {child.transportInfo?.hasLunch ? 'Sí' : 'No'}
              </Tag>
            </Space>
          </Col>
          <Col span={24}>
            <Space>
              <UserOutlined />
              <Text strong>Persona Autorizada para Recoger:</Text>
              <Text>{child.transportInfo?.pickupPerson || 'No especificado'}</Text>
            </Space>
          </Col>
        </Row>
      </Card>
    </Space>
  );

  const renderAuthorizationsTab = (child: Child) => {
    const childAuths = getChildAuthorizations(child.id);
    
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Card title="Autorizaciones Pendientes" size="small">
          {childAuths.length > 0 ? (
            <List
              dataSource={childAuths}
              renderItem={(auth) => (
                <List.Item
                  actions={auth.status === 'pending' ? [
                    <Button 
                      type="primary" 
                      size="small"
                      onClick={() => handleSignAuthorization(auth.id)}
                    >
                      Firmar
                    </Button>
                  ] : [
                    <Tag color="green">Firmada</Tag>
                  ]}
                >
                  <List.Item.Meta
                    title={auth.title}
                    description={
                      <Space direction="vertical" size="small">
                        <Text>{auth.description}</Text>
                        <Text type="secondary">
                          Vence: {dayjs(auth.dueDate).format('DD/MM/YYYY')}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Text type="secondary">No hay autorizaciones pendientes</Text>
          )}
        </Card>
      </Space>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>
              👨‍👩‍👧‍👦 Mis Hijos ({children.length})
            </Title>
            <Text type="secondary">
              Seguimiento respetuoso del progreso individual de cada hijo
            </Text>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />}>
              Añadir Hijo
            </Button>
          </Col>
        </Row>
      </div>

      {/* Resumen General de la Familia */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Hijos"
              value={children.length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Tareas Pendientes"
              value={children.reduce((acc, child) => acc + child.academicInfo.pendingTasks, 0)}
              valueStyle={{ color: '#faad14' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Alertas Activas"
              value={children.reduce((acc, child) => acc + child.academicInfo.alerts.length, 0)}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<BellOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Autorizaciones Pendientes"
              value={getTotalPendingAuthorizations()}
              valueStyle={{ color: '#722ed1' }}
              prefix={<FormOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Vista Individual de Cada Hijo */}
      <Title level={4} style={{ marginBottom: '16px' }}>
        👨‍👩‍👧‍👦 Seguimiento Individual
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
        Cada hijo tiene su propio ritmo y progreso único. Aquí puedes ver el desarrollo individual de cada uno.
      </Text>

      {/* Children Grid */}
      <Row gutter={[16, 16]}>
        {children.map((child) => (
          <Col xs={24} sm={12} lg={8} key={child.id}>
            {renderChildCard(child)}
          </Col>
        ))}
      </Row>

      {/* Child Detail Modal/Drawer */}
      {isMobile || isTablet ? (
        <Drawer
          title={selectedChild ? `${selectedChild.firstName} ${selectedChild.lastName}` : ''}
          placement="right"
          onClose={() => setDetailVisible(false)}
          open={detailVisible}
          width="100%"
        >
          {selectedChild && (
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="Académico" key="academic" icon={<BookOutlined />}>
                {renderAcademicTab(selectedChild)}
              </TabPane>
              <TabPane tab="Médico" key="medical" icon={<HeartOutlined />}>
                {renderMedicalTab(selectedChild)}
              </TabPane>
              <TabPane tab="Transporte" key="transport" icon={<CarOutlined />}>
                {renderTransportTab(selectedChild)}
              </TabPane>
              <TabPane tab="Autorizaciones" key="authorizations" icon={<FileTextOutlined />}>
                {renderAuthorizationsTab(selectedChild)}
              </TabPane>
            </Tabs>
          )}
        </Drawer>
      ) : (
        <Modal
          title={selectedChild ? `${selectedChild.firstName} ${selectedChild.lastName}` : ''}
          open={detailVisible}
          onCancel={() => setDetailVisible(false)}
          width={800}
          footer={null}
        >
          {selectedChild && (
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="Académico" key="academic" icon={<BookOutlined />}>
                {renderAcademicTab(selectedChild)}
              </TabPane>
              <TabPane tab="Médico" key="medical" icon={<HeartOutlined />}>
                {renderMedicalTab(selectedChild)}
              </TabPane>
              <TabPane tab="Transporte" key="transport" icon={<CarOutlined />}>
                {renderTransportTab(selectedChild)}
              </TabPane>
              <TabPane tab="Autorizaciones" key="authorizations" icon={<FileTextOutlined />}>
                {renderAuthorizationsTab(selectedChild)}
              </TabPane>
            </Tabs>
          )}
        </Modal>
      )}
    </div>
  );
};

export default MyChildrenPage;