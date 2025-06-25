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
  Input,
  DatePicker,
  Badge,
  Avatar,
  List,
  Descriptions,
  Modal,
} from 'antd';
import {
  FileTextOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  CalendarOutlined,
  UserOutlined,
  BookOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useResponsive } from '../../hooks/useResponsive';
import apiClient from '../../services/apiClient';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Evaluation {
  id: string;
  title: string;
  description: string;
  type: 'competency' | 'test' | 'assignment' | 'oral';
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  classGroupId: string;
  classGroupName: string;
  dueDate: string;
  completedAt?: string;
  score?: number;
  maxScore: number;
  createdAt: string;
  updatedAt: string;
}

interface EvaluationStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  averageScore: number;
  completionRate: number;
}

const AdminEvaluationsPage: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [stats, setStats] = useState<EvaluationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    teacherId: '',
    subjectId: '',
    classGroupId: '',
    dateRange: null as [dayjs.Dayjs, dayjs.Dayjs] | null,
    search: '',
  });
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classGroups, setClassGroups] = useState<any[]>([]);
  const { isMobile, isTablet } = useResponsive();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [evaluationsRes, statsRes, teachersRes, subjectsRes, classGroupsRes] = await Promise.all([
        apiClient.get('/evaluations', { params: filters }),
        apiClient.get('/evaluations/stats'),
        apiClient.get('/teachers'),
        apiClient.get('/subjects'),
        apiClient.get('/class-groups'),
      ]);

      setEvaluations(evaluationsRes.data);
      setStats(statsRes.data);
      setTeachers(teachersRes.data);
      setSubjects(subjectsRes.data);
      setClassGroups(classGroupsRes.data);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'processing';
      case 'draft': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'active': return 'Activa';
      case 'draft': return 'Borrador';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'competency': return 'Competencias';
      case 'test': return 'Examen';
      case 'assignment': return 'Tarea';
      case 'oral': return 'Oral';
      default: return type;
    }
  };

  const columns: ColumnsType<Evaluation> = [
    {
      title: 'Evaluación',
      dataIndex: 'title',
      key: 'title',
      width: isMobile ? 200 : 250,
      render: (title: string, record: Evaluation) => (
        <div>
          <Text strong>{title}</Text>
          <div className="text-sm text-gray-500">
            {record.description && record.description.length > 50 
              ? `${record.description.substring(0, 50)}...` 
              : record.description}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Tag color={getStatusColor(record.status)}>
              {getStatusText(record.status)}
            </Tag>
            <Tag>{getTypeText(record.type)}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Estudiante',
      key: 'student',
      width: isMobile ? 150 : 200,
      render: (record: Evaluation) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <Text>{record.studentName}</Text>
            <div className="text-sm text-gray-500">{record.classGroupName}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Profesor/Asignatura',
      key: 'teacher',
      width: isMobile ? 150 : 200,
      render: (record: Evaluation) => (
        <div>
          <Text>{record.teacherName}</Text>
          <div className="text-sm text-gray-500">{record.subjectName}</div>
        </div>
      ),
    },
    {
      title: 'Fechas',
      key: 'dates',
      width: 150,
      render: (record: Evaluation) => (
        <div>
          <div className="text-sm">
            <CalendarOutlined /> Vence: {dayjs(record.dueDate).format('DD/MM/YYYY')}
          </div>
          {record.completedAt && (
            <div className="text-sm text-green-600">
              <CheckCircleOutlined /> Completada: {dayjs(record.completedAt).format('DD/MM/YYYY')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Puntuación',
      key: 'score',
      width: 120,
      render: (record: Evaluation) => (
        <div>
          {record.score !== undefined ? (
            <div>
              <Text strong>{record.score} / {record.maxScore}</Text>
              <Progress 
                percent={Math.round((record.score / record.maxScore) * 100)} 
                size="small"
                status={record.score >= record.maxScore * 0.6 ? 'success' : 'exception'}
              />
            </div>
          ) : (
            <Text type="secondary">Pendiente</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      render: (record: Evaluation) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} />
          <Button size="small" icon={<EditOutlined />} />
          <Button size="small" icon={<DeleteOutlined />} danger />
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="!mb-2">
            Gestión de Evaluaciones
          </Title>
          <Text type="secondary">
            Administra y supervisa todas las evaluaciones del centro
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large">
          Nueva Evaluación
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Evaluaciones"
                value={stats.total}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Completadas"
                value={stats.completed}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pendientes"
                value={stats.pending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Puntuación Media"
                value={stats.averageScore}
                precision={1}
                suffix="/ 10"
                prefix={<BookOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card title="Filtros" size="small">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Buscar evaluación..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Estado"
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              allowClear
            >
              <Option value="draft">Borrador</Option>
              <Option value="active">Activa</Option>
              <Option value="completed">Completada</Option>
              <Option value="cancelled">Cancelada</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Tipo"
              style={{ width: '100%' }}
              value={filters.type}
              onChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              allowClear
            >
              <Option value="competency">Competencias</Option>
              <Option value="test">Examen</Option>
              <Option value="assignment">Tarea</Option>
              <Option value="oral">Oral</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Profesor"
              style={{ width: '100%' }}
              value={filters.teacherId}
              onChange={(value) => setFilters(prev => ({ ...prev, teacherId: value }))}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {teachers.map(teacher => (
                <Option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Asignatura"
              style={{ width: '100%' }}
              value={filters.subjectId}
              onChange={(value) => setFilters(prev => ({ ...prev, subjectId: value }))}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {subjects.map(subject => (
                <Option key={subject.id} value={subject.id}>
                  {subject.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <RangePicker
              style={{ width: '100%' }}
              value={filters.dateRange}
              onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
              placeholder={['Fecha inicio', 'Fecha fin']}
            />
          </Col>
        </Row>
      </Card>

      {/* Evaluations Table */}
      <Card 
        title={`Evaluaciones (${evaluations.length})`}
        extra={
          <Space>
            <Button icon={<FilterOutlined />}>Exportar</Button>
          </Space>
        }
      >
        {evaluations.length === 0 ? (
          <Empty
            description="No se encontraron evaluaciones"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            dataSource={evaluations}
            columns={columns}
            rowKey="id"
            scroll={{ x: isMobile ? 800 : undefined }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: !isMobile,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} de ${total} evaluaciones`,
            }}
            size={isMobile ? 'small' : 'middle'}
          />
        )}
      </Card>
    </div>
  );
};

export default AdminEvaluationsPage;