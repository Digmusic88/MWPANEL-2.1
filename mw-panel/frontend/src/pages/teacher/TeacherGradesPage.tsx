import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Select,
  Table,
  Tag,
  Progress,
  Statistic,
  Button,
  Space,
  Empty,
  Spin,
  Alert,
  Tooltip,
  Input,
  Modal,
  Form,
  InputNumber,
  message,
  Dropdown,
  Menu,
  Badge,
  Descriptions,
} from 'antd';
import {
  BarChartOutlined,
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined,
  EditOutlined,
  ExportOutlined,
  PrinterOutlined,
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import useGrades, { ClassGrades } from '../../hooks/useGrades';
import useSubjects from '../../hooks/useSubjects';
import useClassGroups from '../../hooks/useClassGroups';
import { useResponsive } from '../../hooks/useResponsive';
import { useAuthStore } from '../../store/authStore';
import { Column, Bar } from '@ant-design/plots';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

interface StudentGradeRow {
  key: string;
  id: string;
  enrollmentNumber: string;
  fullName: string;
  taskAverage: number;
  activityAverage: number;
  overallAverage: number;
  gradedTasks: number;
  pendingTasks: number;
  lastActivity?: Date;
  trend?: 'up' | 'down' | 'stable';
}

const TeacherGradesPage: React.FC = () => {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [classGrades, setClassGrades] = useState<ClassGrades | null>(null);
  const [classesSummary, setClassesSummary] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentGradeRow | null>(null);
  
  const { user } = useAuthStore();
  const { getClassGrades, getTeacherClassesSummary, loading } = useGrades();
  const { teacherSubjects, loading: loadingSubjects } = useSubjects();
  const { classGroups, loading: loadingClasses } = useClassGroups();
  const { isMobile } = useResponsive();

  const [form] = Form.useForm();

  useEffect(() => {
    fetchClassesSummary();
  }, []);

  useEffect(() => {
    if (selectedClassId && selectedSubjectId) {
      fetchClassGrades();
    }
  }, [selectedClassId, selectedSubjectId]);

  const fetchClassesSummary = async () => {
    const summary = await getTeacherClassesSummary();
    setClassesSummary(summary);
    
    // Auto-select first class and subject if available
    if (summary.length > 0) {
      setSelectedClassId(summary[0].classGroup.id);
      setSelectedSubjectId(summary[0].subject.id);
    }
  };

  const fetchClassGrades = async () => {
    if (!selectedClassId || !selectedSubjectId) return;
    
    const grades = await getClassGrades(selectedClassId, selectedSubjectId);
    if (grades) {
      setClassGrades(grades);
    }
  };

  const getGradeColor = (grade: number): string => {
    if (grade >= 9) return '#52c41a';
    if (grade >= 7) return '#1890ff';
    if (grade >= 5) return '#faad14';
    return '#ff4d4f';
  };

  const getGradeStatus = (grade: number): 'success' | 'normal' | 'exception' => {
    if (grade >= 9) return 'success';
    if (grade >= 5) return 'normal';
    return 'exception';
  };

  const getStudentTrend = (): 'up' | 'down' | 'stable' => {
    // In a real implementation, this would compare with previous period
    const random = Math.random();
    if (random < 0.33) return 'up';
    if (random < 0.66) return 'down';
    return 'stable';
  };

  const handleEditGrade = (student: StudentGradeRow) => {
    setSelectedStudent(student);
    form.setFieldsValue({
      taskAverage: student.taskAverage,
      activityAverage: student.activityAverage,
    });
    setEditModalVisible(true);
  };

  const handleSaveGrade = async () => {
    try {
      const values = await form.validateFields();
      // In real implementation, this would call an API to update grades
      message.success('Calificaciones actualizadas exitosamente');
      setEditModalVisible(false);
      // Refresh data
      fetchClassGrades();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const exportGrades = () => {
    message.info('Exportando calificaciones...');
    // Implementation would generate Excel/PDF file
  };

  const printGrades = () => {
    window.print();
  };

  // Prepare data for charts
  const prepareDistributionData = () => {
    if (!classGrades || !classGrades.students || classGrades.students.length === 0) return [];
    
    const distribution = {
      'Excelente (9-10)': 0,
      'Notable (7-8.9)': 0,
      'Aprobado (5-6.9)': 0,
      'Suspenso (0-4.9)': 0,
    };

    classGrades.students
      .filter(student => 
        student && 
        student.grades && 
        typeof student.grades.overallAverage === 'number' &&
        !isNaN(student.grades.overallAverage)
      )
      .forEach(student => {
        const avg = student.grades.overallAverage;
        if (avg >= 9) distribution['Excelente (9-10)']++;
        else if (avg >= 7) distribution['Notable (7-8.9)']++;
        else if (avg >= 5) distribution['Aprobado (5-6.9)']++;
        else distribution['Suspenso (0-4.9)']++;
      });

    const total = classGrades.students.length;
    return Object.entries(distribution)
      .filter(([, count]) => count > 0)
      .map(([range, count]) => ({
        range,
        count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0',
      }));
  };

  const columns: ColumnsType<StudentGradeRow> = [
    {
      title: 'Estudiante',
      key: 'student',
      fixed: 'left',
      width: 200,
      render: (_, record) => (
        <Space>
          <div>
            <Text strong>{record.fullName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.enrollmentNumber}
            </Text>
          </div>
        </Space>
      ),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) => {
        const searchValue = value as string;
        return record.fullName.toLowerCase().includes(searchValue.toLowerCase()) ||
               record.enrollmentNumber.toLowerCase().includes(searchValue.toLowerCase());
      },
    },
    {
      title: 'Promedio Tareas',
      dataIndex: 'taskAverage',
      key: 'taskAverage',
      width: 120,
      align: 'center',
      render: (value: number) => (
        <Tag color={getGradeColor(value)}>
          {value.toFixed(1)}
        </Tag>
      ),
      sorter: (a, b) => a.taskAverage - b.taskAverage,
    },
    {
      title: 'Promedio Actividades',
      dataIndex: 'activityAverage',
      key: 'activityAverage',
      width: 120,
      align: 'center',
      render: (value: number) => (
        <Tag color={getGradeColor(value)}>
          {value.toFixed(1)}
        </Tag>
      ),
      sorter: (a, b) => a.activityAverage - b.activityAverage,
    },
    {
      title: 'Promedio General',
      dataIndex: 'overallAverage',
      key: 'overallAverage',
      width: 150,
      align: 'center',
      render: (value: number, record) => (
        <Space>
          <Progress
            type="circle"
            percent={value * 10}
            width={50}
            status={getGradeStatus(value)}
            format={() => value.toFixed(1)}
          />
          {record.trend === 'up' && <RiseOutlined style={{ color: '#52c41a' }} />}
          {record.trend === 'down' && <FallOutlined style={{ color: '#ff4d4f' }} />}
        </Space>
      ),
      sorter: (a, b) => a.overallAverage - b.overallAverage,
      defaultSortOrder: 'descend',
    },
    {
      title: 'Evaluaciones',
      key: 'evaluations',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Badge status="success" text={`${record.gradedTasks} completadas`} />
          <Badge status="warning" text={`${record.pendingTasks} pendientes`} />
        </Space>
      ),
    },
    {
      title: 'Última Actividad',
      dataIndex: 'lastActivity',
      key: 'lastActivity',
      width: 120,
      render: (date: Date) => date ? (
        <Tooltip title={new Date(date).toLocaleString()}>
          <ClockCircleOutlined /> {new Date(date).toLocaleDateString()}
        </Tooltip>
      ) : '-',
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Editar calificaciones',
                onClick: () => handleEditGrade(record),
              },
              {
                key: 'export',
                icon: <ExportOutlined />,
                label: 'Exportar boletín',
              },
              {
                key: 'view',
                icon: <BarChartOutlined />,
                label: 'Ver detalles',
              },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const tableData: StudentGradeRow[] = classGrades?.students.map(student => ({
    key: student.id,
    id: student.id,
    enrollmentNumber: student.enrollmentNumber,
    fullName: `${student.firstName} ${student.lastName}`,
    taskAverage: student.grades.taskAverage,
    activityAverage: student.grades.activityAverage,
    overallAverage: student.grades.overallAverage,
    gradedTasks: student.grades.gradedTasks,
    pendingTasks: student.grades.pendingTasks,
    lastActivity: student.grades.lastActivity,
    trend: getStudentTrend(),
  })) || [];

  if (loading || loadingSubjects || loadingClasses) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Cargando calificaciones..." />
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? '16px' : '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>
            <BarChartOutlined style={{ marginRight: 8 }} />
            Gestión de Calificaciones
          </Title>
          <Text type="secondary">
            Administra las calificaciones de tus estudiantes
          </Text>
        </Col>
        <Col>
          <Space>
            <Button icon={<PrinterOutlined />} onClick={printGrades}>
              Imprimir
            </Button>
            <Button type="primary" icon={<DownloadOutlined />} onClick={exportGrades}>
              Exportar
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Class and Subject Selectors */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Select
              style={{ width: '100%' }}
              placeholder="Seleccionar clase"
              value={selectedClassId}
              onChange={setSelectedClassId}
              size="large"
            >
              {classesSummary.map(item => (
                <Option key={item.classGroup.id} value={item.classGroup.id}>
                  <Space>
                    <TeamOutlined />
                    {item.classGroup.name}
                    <Tag>{item.studentCount} estudiantes</Tag>
                  </Space>
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12}>
            <Select
              style={{ width: '100%' }}
              placeholder="Seleccionar asignatura"
              value={selectedSubjectId}
              onChange={setSelectedSubjectId}
              disabled={!selectedClassId}
              size="large"
            >
              {classesSummary
                .filter(item => item.classGroup.id === selectedClassId)
                .map(item => (
                  <Option key={item.subject.id} value={item.subject.id}>
                    <Space>
                      <BookOutlined />
                      {item.subject.name}
                      <Tag color="blue">{item.subject.code}</Tag>
                    </Space>
                  </Option>
                ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {classGrades ? (
        <>
          {/* Statistics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Promedio de la Clase"
                  value={classGrades.statistics.classAverage}
                  precision={2}
                  prefix={<TrophyOutlined />}
                  suffix="/ 10"
                  valueStyle={{ color: getGradeColor(classGrades.statistics.classAverage) }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Nota Más Alta"
                  value={classGrades.statistics.highestGrade}
                  precision={2}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Nota Más Baja"
                  value={classGrades.statistics.lowestGrade}
                  precision={2}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tasa de Aprobación"
                  value={classGrades.statistics.passingRate}
                  precision={1}
                  suffix="%"
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: classGrades.statistics.passingRate >= 70 ? '#52c41a' : '#faad14' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Grade Distribution Chart */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="Distribución de Calificaciones">
                {(() => {
                  const distributionData = prepareDistributionData();
                  
                  if (distributionData.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Empty 
                          description="No hay datos de calificaciones para mostrar" 
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      </div>
                    );
                  }
                  
                  return (
                    <Column
                      data={distributionData}
                      xField="range"
                      yField="count"
                      label={{
                        position: 'middle',
                        style: {
                          fill: '#FFFFFF',
                          opacity: 0.8,
                        },
                      }}
                      xAxis={{
                        label: {
                          autoHide: false,
                          autoRotate: false,
                        },
                        grid: null,
                      }}
                      yAxis={{
                        grid: {
                          line: {
                            style: {
                              stroke: '#f0f0f0',
                              lineWidth: 1,
                            },
                          },
                        },
                      }}
                      tooltip={{
                        formatter: (datum: any) => {
                          return {
                            name: 'Estudiantes',
                            value: `${datum.count} (${datum.percentage}%)`,
                          };
                        },
                      }}
                      meta={{
                        count: {
                          alias: 'Estudiantes',
                        },
                      }}
                    />
                  );
                })()}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Información de la Clase">
                <Descriptions column={1}>
                  <Descriptions.Item label="Clase">
                    {classGrades.classGroup.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nivel">
                    {classGrades.classGroup.level}
                  </Descriptions.Item>
                  <Descriptions.Item label="Curso">
                    {classGrades.classGroup.course}
                  </Descriptions.Item>
                  <Descriptions.Item label="Asignatura">
                    {classGrades.subject.name} ({classGrades.subject.code})
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Estudiantes">
                    {classGrades.students.length}
                  </Descriptions.Item>
                  <Descriptions.Item label="Profesor">
                    {user?.profile?.fullName}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>

          {/* Students Table */}
          <Card
            title="Calificaciones de Estudiantes"
            extra={
              <Search
                placeholder="Buscar estudiante..."
                allowClear
                style={{ width: 250 }}
                onSearch={setSearchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            }
          >
            <Table
              columns={columns}
              dataSource={tableData}
              scroll={{ x: 1000 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} estudiantes`,
              }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>
                      <Text strong>Promedios de la Clase</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="center">
                      <Tag color={getGradeColor(classGrades.statistics.classAverage)}>
                        {(tableData.reduce((sum, s) => sum + s.taskAverage, 0) / tableData.length).toFixed(1)}
                      </Tag>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="center">
                      <Tag color={getGradeColor(classGrades.statistics.classAverage)}>
                        {(tableData.reduce((sum, s) => sum + s.activityAverage, 0) / tableData.length).toFixed(1)}
                      </Tag>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="center">
                      <Tag color={getGradeColor(classGrades.statistics.classAverage)}>
                        {classGrades.statistics.classAverage.toFixed(1)}
                      </Tag>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} />
                    <Table.Summary.Cell index={5} />
                    <Table.Summary.Cell index={6} />
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>
        </>
      ) : (
        <Empty
          description="Selecciona una clase y asignatura para ver las calificaciones"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      {/* Edit Grade Modal */}
      <Modal
        title={`Editar Calificaciones - ${selectedStudent?.fullName}`}
        open={editModalVisible}
        onOk={handleSaveGrade}
        onCancel={() => setEditModalVisible(false)}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Alert
            message="Nota: Esta funcionalidad está en desarrollo. Los cambios no se guardarán."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Form.Item
            name="taskAverage"
            label="Promedio de Tareas"
            rules={[
              { required: true, message: 'Por favor ingresa una calificación' },
              { type: 'number', min: 0, max: 10, message: 'La calificación debe estar entre 0 y 10' },
            ]}
          >
            <InputNumber
              min={0}
              max={10}
              step={0.1}
              precision={1}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="activityAverage"
            label="Promedio de Actividades"
            rules={[
              { required: true, message: 'Por favor ingresa una calificación' },
              { type: 'number', min: 0, max: 10, message: 'La calificación debe estar entre 0 y 10' },
            ]}
          >
            <InputNumber
              min={0}
              max={10}
              step={0.1}
              precision={1}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="Promedio General Calculado">
            <Text strong style={{ fontSize: '18px' }}>
              {((form.getFieldValue('taskAverage') || 0 + form.getFieldValue('activityAverage') || 0) / 2).toFixed(1)}
            </Text>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherGradesPage;