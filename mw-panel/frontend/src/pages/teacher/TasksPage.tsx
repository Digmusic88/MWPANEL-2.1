import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Input,
  Select,
  Modal,
  Form,
  message,
  Tag,
  Progress,
  Tooltip,
  Row,
  Col,
  Statistic,
  DatePicker,
  InputNumber,
  Switch,
  Drawer,
  List,
  Avatar,
  Popconfirm,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BookOutlined,
  TrophyOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import apiClient from '@services/apiClient';
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskStatistics,
  CreateTaskForm,
  TaskQueryParams,
  TASK_TYPE_LABELS,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
  TASK_STATUS_COLORS,
  SUBMISSION_STATUS_COLORS,
  SUBMISSION_STATUS_LABELS,
} from '@/types/tasks';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface SubjectAssignment {
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
}

const TasksPage: React.FC = () => {
  // Estados principales
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<TaskStatistics | null>(null);
  const [subjectAssignments, setSubjectAssignments] = useState<SubjectAssignment[]>([]);
  
  // Estados de modales y formularios
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  
  // Estados de filtros y paginación
  const [filters, setFilters] = useState<TaskQueryParams>({
    page: 1,
    limit: 10,
  });
  const [total, setTotal] = useState(0);
  

  useEffect(() => {
    fetchTasks();
    fetchStatistics();
    fetchSubjectAssignments();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/tasks/teacher/my-tasks?${params}`);
      setTasks(response.data.tasks);
      setTotal(response.data.total);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      message.error('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await apiClient.get('/tasks/teacher/statistics');
      setStatistics(response.data);
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchSubjectAssignments = async () => {
    try {
      // Primero obtener información del profesor logueado usando el dashboard
      const dashboardResponse = await apiClient.get('/teachers/dashboard/my-dashboard');
      const teacherId = dashboardResponse.data.teacher.id;
      
      // Luego obtener sus asignaciones
      const response = await apiClient.get(`/subjects/assignments/teacher/${teacherId}`);
      setSubjectAssignments(response.data);
    } catch (error: any) {
      console.error('Error fetching subject assignments:', error);
    }
  };

  const handleCreateTask = async (values: CreateTaskForm) => {
    try {
      // Procesar fechas y convertir latePenalty de porcentaje a decimal
      const taskData = {
        ...values,
        assignedDate: dayjs(values.assignedDate).toISOString(),
        dueDate: dayjs(values.dueDate).toISOString(),
        allowedFileTypes: values.allowedFileTypes?.filter(type => type.trim() !== ''),
        latePenalty: values.latePenalty ? values.latePenalty / 100 : undefined,
      };

      await apiClient.post('/tasks', taskData);
      message.success('Tarea creada exitosamente');
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchTasks();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error creating task:', error);
      message.error(error.response?.data?.message || 'Error al crear la tarea');
    }
  };

  const handleUpdateTask = async (values: any) => {
    if (!selectedTask) return;
    
    try {
      const updateData = {
        ...values,
        assignedDate: values.assignedDate ? dayjs(values.assignedDate).toISOString() : undefined,
        dueDate: values.dueDate ? dayjs(values.dueDate).toISOString() : undefined,
        latePenalty: values.latePenalty ? values.latePenalty / 100 : undefined,
      };

      await apiClient.patch(`/tasks/${selectedTask.id}`, updateData);
      message.success('Tarea actualizada exitosamente');
      setEditModalVisible(false);
      editForm.resetFields();
      setSelectedTask(null);
      fetchTasks();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error updating task:', error);
      message.error(error.response?.data?.message || 'Error al actualizar la tarea');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiClient.delete(`/tasks/${taskId}`);
      message.success('Tarea eliminada exitosamente');
      fetchTasks();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error deleting task:', error);
      message.error(error.response?.data?.message || 'Error al eliminar la tarea');
    }
  };

  const handlePublishTask = async (taskId: string) => {
    try {
      await apiClient.patch(`/tasks/${taskId}`, { status: TaskStatus.PUBLISHED });
      message.success('Tarea publicada exitosamente');
      fetchTasks();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error publishing task:', error);
      message.error(error.response?.data?.message || 'Error al publicar la tarea');
    }
  };

  const handleCloseTask = async (taskId: string) => {
    try {
      await apiClient.patch(`/tasks/${taskId}`, { status: TaskStatus.CLOSED });
      message.success('Tarea cerrada exitosamente');
      fetchTasks();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error closing task:', error);
      message.error(error.response?.data?.message || 'Error al cerrar la tarea');
    }
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    editForm.setFieldsValue({
      ...task,
      assignedDate: dayjs(task.assignedDate),
      dueDate: dayjs(task.dueDate),
      allowedFileTypes: task.allowedFileTypes ? JSON.parse(task.allowedFileTypes) : undefined,
      latePenalty: task.latePenalty ? task.latePenalty * 100 : undefined,
    });
    setEditModalVisible(true);
  };

  const openDetailDrawer = (task: Task) => {
    setSelectedTask(task);
    setDetailDrawerVisible(true);
  };

  const getSubmissionProgress = (task: Task) => {
    const total = task.submissions.length;
    const submitted = task.submissions.filter(s => s.status !== 'not_submitted').length;
    return total > 0 ? (submitted / total) * 100 : 0;
  };


  const columns: ColumnsType<Task> = [
    {
      title: 'Tarea',
      key: 'task',
      width: 300,
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Text strong className="text-base">{record.title}</Text>
            <Tag color={TASK_PRIORITY_COLORS[record.priority]}>
              {TASK_PRIORITY_LABELS[record.priority]}
            </Tag>
            <Tag color={TASK_STATUS_COLORS[record.status]}>
              {TASK_STATUS_LABELS[record.status]}
            </Tag>
          </div>
          <div className="text-sm text-gray-500 mb-1">
            {TASK_TYPE_LABELS[record.taskType]} • {record.subjectAssignment.subject.name}
          </div>
          {record.description && (
            <div className="text-sm text-gray-600 truncate max-w-sm">
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Fechas',
      key: 'dates',
      width: 180,
      render: (_, record) => (
        <div className="text-sm">
          <div className="flex items-center gap-1 mb-1">
            <CalendarOutlined className="text-blue-500" />
            <span>Asignada: {dayjs(record.assignedDate).format('DD/MM/YYYY')}</span>
          </div>
          <div className="flex items-center gap-1">
            <ClockCircleOutlined className={`${dayjs().isAfter(record.dueDate) ? 'text-red-500' : 'text-orange-500'}`} />
            <span className={dayjs().isAfter(record.dueDate) ? 'text-red-600 font-medium' : ''}>
              Entrega: {dayjs(record.dueDate).format('DD/MM/YYYY HH:mm')}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Progreso Entregas',
      key: 'submissions',
      width: 200,
      render: (_, record) => {
        const progress = getSubmissionProgress(record);
        const submitted = record.submissions.filter(s => s.status !== 'not_submitted').length;
        const total = record.submissions.length;
        
        return (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Entregadas: {submitted}/{total}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress 
              percent={progress} 
              size="small" 
              strokeColor={progress >= 80 ? '#52c41a' : progress >= 50 ? '#faad14' : '#ff4d4f'}
            />
          </div>
        );
      },
    },
    {
      title: 'Progreso Calificación',
      key: 'grading',
      width: 200,
      render: (_, record) => {
        const submitted = record.submissions.filter(s => s.status !== 'not_submitted').length;
        const graded = record.submissions.filter(s => s.isGraded).length;
        const progress = submitted > 0 ? (graded / submitted) * 100 : 0;
        
        return (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Calificadas: {graded}/{submitted}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress 
              percent={progress} 
              size="small" 
              strokeColor={progress >= 80 ? '#52c41a' : progress >= 50 ? '#faad14' : '#ff4d4f'}
            />
          </div>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver detalles">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => openDetailDrawer(record)}
            />
          </Tooltip>
          
          <Tooltip title="Editar">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => openEditModal(record)}
            />
          </Tooltip>

          {record.status === TaskStatus.DRAFT && (
            <Tooltip title="Publicar">
              <Button 
                type="text" 
                icon={<SendOutlined />} 
                className="text-green-600"
                onClick={() => handlePublishTask(record.id)}
              />
            </Tooltip>
          )}

          {record.status === TaskStatus.PUBLISHED && (
            <Tooltip title="Cerrar">
              <Button 
                type="text" 
                icon={<CheckCircleOutlined />} 
                className="text-orange-600"
                onClick={() => handleCloseTask(record.id)}
              />
            </Tooltip>
          )}

          <Popconfirm
            title="¿Eliminar tarea?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => handleDeleteTask(record.id)}
            okText="Eliminar"
            cancelText="Cancelar"
          >
            <Tooltip title="Eliminar">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="tasks-page">
      {/* Header con estadísticas */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <Card>
            <Row gutter={16} align="middle">
              <Col xs={24} md={12}>
                <Space>
                  <BookOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                  <div>
                    <Title level={4} style={{ margin: 0 }}>Gestión de Tareas</Title>
                    <Text type="secondary">Administra y supervisa las tareas asignadas</Text>
                  </div>
                </Space>
              </Col>
              <Col xs={24} md={12} className="text-right">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  size="large"
                  onClick={() => setCreateModalVisible(true)}
                >
                  Nueva Tarea
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Estadísticas */}
        {statistics && (
          <>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Total Tareas"
                  value={statistics.totalTasks}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Tareas Publicadas"
                  value={statistics.publishedTasks}
                  prefix={<SendOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Entregas Pendientes"
                  value={statistics.pendingSubmissions}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Promedio Calificaciones"
                  value={statistics.averageGrade}
                  precision={1}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </>
        )}
      </Row>

      {/* Filtros */}
      <Row gutter={16} className="mb-4">
        <Col xs={24} lg={6}>
          <Input
            placeholder="Buscar tareas..."
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            allowClear
          />
        </Col>
        <Col xs={24} sm={8} lg={4}>
          <Select
            placeholder="Estado"
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
            allowClear
            style={{ width: '100%' }}
          >
            {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
              <Option key={value} value={value}>{label}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8} lg={4}>
          <Select
            placeholder="Tipo"
            value={filters.taskType}
            onChange={(value) => setFilters({ ...filters, taskType: value, page: 1 })}
            allowClear
            style={{ width: '100%' }}
          >
            {Object.entries(TASK_TYPE_LABELS).map(([value, label]) => (
              <Option key={value} value={value}>{label}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8} lg={4}>
          <Select
            placeholder="Prioridad"
            value={filters.priority}
            onChange={(value) => setFilters({ ...filters, priority: value, page: 1 })}
            allowClear
            style={{ width: '100%' }}
          >
            {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
              <Option key={value} value={value}>{label}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} lg={6}>
          <RangePicker
            placeholder={['Fecha inicio', 'Fecha fin']}
            onChange={(dates) => {
              if (dates) {
                setFilters({
                  ...filters,
                  startDate: dates[0]?.format('YYYY-MM-DD'),
                  endDate: dates[1]?.format('YYYY-MM-DD'),
                  page: 1,
                });
              } else {
                setFilters({
                  ...filters,
                  startDate: undefined,
                  endDate: undefined,
                  page: 1,
                });
              }
            }}
            style={{ width: '100%' }}
          />
        </Col>
      </Row>

      {/* Tabla de tareas */}
      <Card>
        <Table
          columns={columns}
          dataSource={tasks}
          loading={loading}
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} tareas`,
            onChange: (page, pageSize) => {
              setFilters({ ...filters, page, limit: pageSize });
            },
          }}
          rowKey="id"
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal crear tarea */}
      <Modal
        title="Crear Nueva Tarea"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateTask}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Título"
                rules={[{ required: true, message: 'El título es requerido' }]}
              >
                <Input placeholder="Título de la tarea" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="subjectAssignmentId"
                label="Asignatura"
                rules={[{ required: true, message: 'La asignatura es requerida' }]}
              >
                <Select placeholder="Seleccionar asignatura">
                  {subjectAssignments.map(assignment => (
                    <Option key={assignment.id} value={assignment.id}>
                      {assignment.subject.code} - {assignment.subject.name} ({assignment.classGroup.name})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Descripción"
          >
            <TextArea 
              rows={3} 
              placeholder="Descripción general de la tarea"
            />
          </Form.Item>

          <Form.Item
            name="instructions"
            label="Instrucciones"
          >
            <TextArea 
              rows={4} 
              placeholder="Instrucciones detalladas para completar la tarea"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="taskType"
                label="Tipo de Tarea"
                rules={[{ required: true, message: 'El tipo es requerido' }]}
              >
                <Select placeholder="Seleccionar tipo">
                  {Object.entries(TASK_TYPE_LABELS).map(([value, label]) => (
                    <Option key={value} value={value}>{label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="priority"
                label="Prioridad"
                initialValue={TaskPriority.MEDIUM}
              >
                <Select>
                  {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                    <Option key={value} value={value}>{label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="maxPoints"
                label="Puntuación Máxima"
              >
                <InputNumber
                  min={0}
                  max={100}
                  placeholder="10"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="assignedDate"
                label="Fecha de Asignación"
                rules={[{ required: true, message: 'La fecha de asignación es requerida' }]}
              >
                <DatePicker 
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }}
                  placeholder="Seleccionar fecha de asignación"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dueDate"
                label="Fecha de Entrega"
                rules={[{ required: true, message: 'La fecha de entrega es requerida' }]}
              >
                <DatePicker 
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }}
                  placeholder="Seleccionar fecha de entrega"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="allowLateSubmission"
                label="Permitir Entregas Tardías"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="latePenalty"
                label="Penalización por Retraso (%)"
                initialValue={20}
              >
                <InputNumber
                  min={0}
                  max={100}
                  addonAfter="%"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="notifyFamilies"
                label="Notificar a Familias"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="requiresFile"
                label="Requiere Archivo Adjunto"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxFileSizeMB"
                label="Tamaño Máximo Archivo (MB)"
                initialValue={10}
              >
                <InputNumber
                  min={1}
                  max={100}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="allowedFileTypes"
            label="Tipos de Archivo Permitidos"
          >
            <Select
              mode="tags"
              placeholder="pdf, doc, docx, jpg, png..."
              tokenSeparators={[',']}
            />
          </Form.Item>

          <Form.Item
            name="rubric"
            label="Criterios de Evaluación"
          >
            <TextArea 
              rows={3} 
              placeholder="Describe los criterios de evaluación..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setCreateModalVisible(false);
                createForm.resetFields();
              }}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                Crear Tarea
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal editar tarea */}
      <Modal
        title="Editar Tarea"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
          setSelectedTask(null);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateTask}
        >
          {/* Similar al formulario de crear, pero con campos pre-populados */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Título"
                rules={[{ required: true, message: 'El título es requerido' }]}
              >
                <Input placeholder="Título de la tarea" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Estado"
              >
                <Select>
                  {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                    <Option key={value} value={value}>{label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Descripción"
          >
            <TextArea rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="assignedDate"
                label="Fecha de Asignación"
              >
                <DatePicker 
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dueDate"
                label="Fecha de Entrega"
              >
                <DatePicker 
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setEditModalVisible(false);
                editForm.resetFields();
                setSelectedTask(null);
              }}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                Actualizar Tarea
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer de detalles */}
      <Drawer
        title="Detalles de la Tarea"
        placement="right"
        size="large"
        open={detailDrawerVisible}
        onClose={() => {
          setDetailDrawerVisible(false);
          setSelectedTask(null);
        }}
      >
        {selectedTask && (
          <div>
            <div className="mb-6">
              <Title level={4}>{selectedTask.title}</Title>
              <Space wrap>
                <Tag color={TASK_STATUS_COLORS[selectedTask.status]}>
                  {TASK_STATUS_LABELS[selectedTask.status]}
                </Tag>
                <Tag color={TASK_PRIORITY_COLORS[selectedTask.priority]}>
                  {TASK_PRIORITY_LABELS[selectedTask.priority]}
                </Tag>
                <Tag>{TASK_TYPE_LABELS[selectedTask.taskType]}</Tag>
              </Space>
            </div>

            <Divider />

            <div className="space-y-4">
              <div>
                <Text strong>Asignatura:</Text>
                <div>{selectedTask.subjectAssignment.subject.name} ({selectedTask.subjectAssignment.subject.code})</div>
              </div>

              <div>
                <Text strong>Grupo:</Text>
                <div>{selectedTask.subjectAssignment.classGroup.name}</div>
              </div>

              <div>
                <Text strong>Descripción:</Text>
                <div>{selectedTask.description || 'Sin descripción'}</div>
              </div>

              <div>
                <Text strong>Instrucciones:</Text>
                <div>{selectedTask.instructions || 'Sin instrucciones'}</div>
              </div>

              <div>
                <Text strong>Fechas:</Text>
                <div>Asignada: {dayjs(selectedTask.assignedDate).format('DD/MM/YYYY HH:mm')}</div>
                <div>Entrega: {dayjs(selectedTask.dueDate).format('DD/MM/YYYY HH:mm')}</div>
              </div>

              <div>
                <Text strong>Configuración:</Text>
                <ul>
                  <li>Puntuación máxima: {selectedTask.maxPoints || 'No definida'}</li>
                  <li>Entregas tardías: {selectedTask.allowLateSubmission ? 'Permitidas' : 'No permitidas'}</li>
                  {selectedTask.allowLateSubmission && (
                    <li>Penalización: {selectedTask.latePenalty * 100}%</li>
                  )}
                  <li>Requiere archivo: {selectedTask.requiresFile ? 'Sí' : 'No'}</li>
                  <li>Notificar familias: {selectedTask.notifyFamilies ? 'Sí' : 'No'}</li>
                </ul>
              </div>

              <Divider />

              <div>
                <Text strong>Entregas ({selectedTask.submissions.length}):</Text>
                <List
                  size="small"
                  dataSource={selectedTask.submissions}
                  renderItem={(submission) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={`${submission.student.user.profile.firstName} ${submission.student.user.profile.lastName}`}
                        description={
                          <Space>
                            <Tag color={SUBMISSION_STATUS_COLORS[submission.status]}>
                              {SUBMISSION_STATUS_LABELS[submission.status]}
                            </Tag>
                            {submission.isGraded && submission.finalGrade && (
                              <Tag color="blue">
                                Nota: {submission.finalGrade}
                              </Tag>
                            )}
                            {submission.isLate && (
                              <Tag color="orange">Tardía</Tag>
                            )}
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default TasksPage;