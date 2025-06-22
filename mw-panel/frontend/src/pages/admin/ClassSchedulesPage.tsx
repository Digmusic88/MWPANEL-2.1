import React, { useState, useEffect } from 'react';
import {
  Card,
  Select,
  Row,
  Col,
  Typography,
  message,
  Alert,
  Button,
  Space,
  Divider,
  Tag
} from 'antd';
import {
  CalendarOutlined,
  TeamOutlined,
  BookOutlined,
  ReloadOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import ScheduleGrid, { ScheduleSession, ClassGroup } from '@/components/ScheduleGrid';
import apiClient from '@/services/apiClient';

const { Title, Text } = Typography;
const { Option } = Select;

interface AcademicYear {
  id: string;
  name: string;
  isCurrent: boolean;
}


const ClassSchedulesPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [sessions, setSessions] = useState<ScheduleSession[]>([]);
  
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [selectedClassGroup, setSelectedClassGroup] = useState<string>('');

  // Cargar años académicos al montar el componente
  useEffect(() => {
    fetchAcademicYears();
  }, []);

  // Cargar grupos de clase cuando cambia el año académico
  useEffect(() => {
    if (selectedAcademicYear) {
      fetchClassGroups();
    } else {
      setClassGroups([]);
      setSelectedClassGroup('');
    }
  }, [selectedAcademicYear]);

  // Cargar sesiones cuando cambia el grupo de clase
  useEffect(() => {
    if (selectedClassGroup) {
      fetchScheduleSessions();
    } else {
      setSessions([]);
    }
  }, [selectedClassGroup]);

  const fetchAcademicYears = async () => {
    try {
      const response = await apiClient.get('/academic-years');
      setAcademicYears(response.data);
      
      // Seleccionar automáticamente el año académico actual
      const currentYear = response.data.find((year: AcademicYear) => year.isCurrent);
      if (currentYear) {
        setSelectedAcademicYear(currentYear.id);
      }
    } catch (error: any) {
      message.error('Error al cargar años académicos: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchClassGroups = async () => {
    if (!selectedAcademicYear) return;
    
    setLoading(true);
    try {
      const response = await apiClient.get(`/class-groups?academicYearId=${selectedAcademicYear}`);
      setClassGroups(response.data);
    } catch (error: any) {
      message.error('Error al cargar grupos de clase: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduleSessions = async () => {
    if (!selectedClassGroup) return;
    
    setLoading(true);
    try {
      const response = await apiClient.get(`/schedules/sessions/by-class-group/${selectedClassGroup}`);
      setSessions(response.data);
    } catch (error: any) {
      message.error('Error al cargar horarios: ' + (error.response?.data?.message || error.message));
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (selectedClassGroup) {
      fetchScheduleSessions();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedGroup = classGroups.find(group => group.id === selectedClassGroup);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CalendarOutlined style={{ color: '#1890ff' }} />
              Horarios de Grupos de Clase
            </Title>
            <Text type="secondary">
              Visualización gráfica de horarios por grupo académico
            </Text>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                disabled={!selectedClassGroup}
              >
                Actualizar
              </Button>
              <Button 
                icon={<PrinterOutlined />} 
                onClick={handlePrint}
                disabled={!sessions.length}
                type="primary"
              >
                Imprimir
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Filtros */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                <BookOutlined /> Año Académico:
              </Text>
              <Select
                placeholder="Seleccionar año académico"
                style={{ width: '100%' }}
                value={selectedAcademicYear}
                onChange={setSelectedAcademicYear}
                loading={loading}
              >
                {academicYears.map(year => (
                  <Option key={year.id} value={year.id}>
                    {year.name}
                    {year.isCurrent && <Tag color="blue" style={{ marginLeft: '8px' }}>Actual</Tag>}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                <TeamOutlined /> Grupo de Clase:
              </Text>
              <Select
                placeholder="Seleccionar grupo de clase"
                style={{ width: '100%' }}
                value={selectedClassGroup}
                onChange={setSelectedClassGroup}
                loading={loading}
                disabled={!selectedAcademicYear}
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {classGroups.map(group => (
                  <Option key={group.id} value={group.id}>
                    {group.name}
                    <Text type="secondary" style={{ marginLeft: '8px' }}>
                      ({group.courses.map(course => course.name).join(', ')})
                    </Text>
                  </Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24} md={8}>
            {selectedGroup && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                  Información del Grupo:
                </Text>
                <div>
                  <Tag color="blue">{selectedGroup.academicYear.name}</Tag>
                  <Tag color="green">Sección {selectedGroup.section}</Tag>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {selectedGroup.courses.length} curso(s) asignado(s)
                  </Text>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Card>

      {/* Mensaje de ayuda */}
      {!selectedAcademicYear && (
        <Alert
          message="Selecciona un año académico"
          description="Para ver los horarios, primero selecciona un año académico de la lista desplegable."
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      {selectedAcademicYear && !selectedClassGroup && (
        <Alert
          message="Selecciona un grupo de clase"
          description="Ahora selecciona el grupo de clase para el cual deseas ver el horario gráfico."
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* Contenido principal - Horario gráfico */}
      {selectedClassGroup && selectedGroup && (
        <div>
          <Divider orientation="left">
            <Space>
              <CalendarOutlined />
              <span>Horario Semanal - {selectedGroup.name}</span>
            </Space>
          </Divider>
          
          <ScheduleGrid
            classGroup={selectedGroup}
            sessions={sessions}
            loading={loading}
          />
        </div>
      )}

      {/* Información adicional */}
      {sessions.length > 0 && (
        <Card 
          title="Resumen del Horario"
          style={{ marginTop: '24px' }}
          size="small"
        >
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {sessions.length}
                </div>
                <Text type="secondary">Sesiones Totales</Text>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                  {new Set(sessions.map(s => s.subjectAssignment.subject.name)).size}
                </div>
                <Text type="secondary">Asignaturas</Text>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                  {new Set(sessions.map(s => s.subjectAssignment.teacher.user.profile.firstName + ' ' + s.subjectAssignment.teacher.user.profile.lastName)).size}
                </div>
                <Text type="secondary">Profesores</Text>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f5222d' }}>
                  {new Set(sessions.map(s => s.classroom.code)).size}
                </div>
                <Text type="secondary">Aulas</Text>
              </div>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default ClassSchedulesPage;