import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
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
  Row,
  Col,
  Statistic,
  Drawer,
  Avatar,
  Divider,
  Upload,
  Alert,
  Empty,
  Spin,
} from 'antd';
import {
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  SendOutlined,
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import apiClient from '@services/apiClient';
import {
  Task,
  TaskSubmission,
  StudentTaskStatistics,
  SubmitTaskForm,
  TASK_TYPE_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
  SUBMISSION_STATUS_LABELS,
  SUBMISSION_STATUS_COLORS,
} from '@/types/tasks';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

interface StudentTasksQuery {
  page?: number;
  limit?: number;
  submissionStatus?: string;
  onlyPending?: boolean;
  onlyGraded?: boolean;
  subjectId?: string;
  startDate?: string;
  endDate?: string;
}

const StudentTasksPage: React.FC = () => {
  // Estados principales
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<StudentTaskStatistics | null>(null);
  
  // Estados de modales y formularios
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<TaskSubmission | null>(null);
  const [submitForm] = Form.useForm();
  
  // Estados de filtros y paginación
  const [filters, setFilters] = useState<StudentTasksQuery>({
    page: 1,
    limit: 10,
  });
  const [total, setTotal] = useState(0);
  
  // Estados para archivos
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchStatistics();
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

      const response = await apiClient.get(`/tasks/student/my-tasks?${params}`);
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
      const response = await apiClient.get('/tasks/student/statistics');
      setStatistics(response.data);
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleSubmitTask = async (values: SubmitTaskForm) => {
    if (!selectedTask) return;

    try {
      setUploading(true);
      
      // Primero subir archivos si los hay
      if (fileList.length > 0) {
        const formData = new FormData();
        fileList.forEach(file => {
          formData.append('files', file.originFileObj);
        });

        // Encontrar la submission ID del estudiante actual
        const mySubmission = selectedTask.submissions?.[0];
        if (mySubmission) {
          await apiClient.post(`/tasks/submissions/${mySubmission.id}/attachments`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      }

      // Luego enviar la tarea
      await apiClient.post(`/tasks/${selectedTask.id}/submit`, values);
      message.success('Tarea entregada exitosamente');
      setSubmitModalVisible(false);
      submitForm.resetFields();
      setFileList([]);
      setSelectedTask(null);
      fetchTasks();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error submitting task:', error);
      message.error(error.response?.data?.message || 'Error al entregar la tarea');
    } finally {
      setUploading(false);
    }
  };

  const openSubmitModal = (task: Task) => {
    setSelectedTask(task);
    const mySubmission = task.submissions?.[0];
    setSelectedSubmission(mySubmission || null);
    
    // Pre-llenar formulario si ya hay una entrega
    if (mySubmission && mySubmission.content) {
      submitForm.setFieldsValue({
        content: mySubmission.content,
        submissionNotes: mySubmission.submissionNotes,
      });
    }
    
    setSubmitModalVisible(true);
  };

  const openDetailDrawer = (task: Task) => {
    setSelectedTask(task);
    const mySubmission = task.submissions?.[0];
    setSelectedSubmission(mySubmission || null);
    setDetailDrawerVisible(true);
  };

  const handleDownloadAttachment = async (attachmentId: string, filename: string) => {
    try {
      const response = await apiClient.get(`/tasks/attachments/${attachmentId}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading file:', error);
      message.error('Error al descargar el archivo');
    }
  };

  const getTaskStatus = (task: Task) => {
    const mySubmission = task.submissions?.[0];
    if (!mySubmission) return { status: 'not_assigned', color: '#d9d9d9', text: 'No asignada' };
    
    // Para tareas tipo EXAM (Test Yourself), mostrar como recordatorio
    if (task.taskType === 'exam') {
      const now = new Date();
      const dueDate = new Date(task.dueDate);
      const isOverdue = now > dueDate;
      
      if (isOverdue) {
        return { status: 'exam_completed', color: '#52c41a', text: 'Examen Realizado' };
      }
      return { status: 'exam_reminder', color: '#1890ff', text: 'Recordatorio de Examen' };
    }
    
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const isOverdue = now > dueDate;
    
    if (mySubmission.isGraded) {
      return { status: 'graded', color: '#52c41a', text: 'Calificada' };
    }
    
    if (mySubmission.needsRevision) {
      return { status: 'needs_revision', color: '#722ed1', text: 'Necesita revisión' };
    }
    
    if (mySubmission.status === 'submitted' || mySubmission.status === 'late') {
      return { status: 'submitted', color: '#1890ff', text: 'Entregada' };
    }
    
    if (isOverdue) {
      return { status: 'overdue', color: '#ff4d4f', text: 'Atrasada' };
    }
    
    return { status: 'pending', color: '#faad14', text: 'Pendiente' };
  };

  const getSubmissionProgress = (task: Task) => {
    const mySubmission = task.submissions?.[0];
    if (!mySubmission) return 0;
    
    // Para tareas tipo EXAM (Test Yourself), mostrar progreso basado en fechas
    if (task.taskType === 'exam') {
      const now = new Date();
      const dueDate = new Date(task.dueDate);
      const assignedDate = new Date(task.assignedDate);
      
      if (now > dueDate) return 100; // Examen completado
      
      // Calcular progreso basado en tiempo transcurrido
      const totalTime = dueDate.getTime() - assignedDate.getTime();
      const elapsedTime = now.getTime() - assignedDate.getTime();
      const progress = Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100);
      
      return Math.round(progress);
    }
    
    if (mySubmission.isGraded) return 100;
    if (mySubmission.status === 'submitted' || mySubmission.status === 'late') return 75;
    if (mySubmission.content || (mySubmission.attachments && mySubmission.attachments.length > 0)) return 25;
    return 0;
  };

  const uploadProps = {
    name: 'files',
    multiple: true,
    fileList,
    onChange: (info: any) => {
      setFileList(info.fileList);
    },
    beforeUpload: () => false, // No subir automáticamente
    onRemove: (file: any) => {
      setFileList(fileList.filter(f => f.uid !== file.uid));
    },
  };

  const renderTaskCard = (task: Task) => {
    const mySubmission = task.submissions?.[0];
    const taskStatus = getTaskStatus(task);
    const progress = getSubmissionProgress(task);
    const dueDate = dayjs(task.dueDate);
    const isOverdue = dayjs().isAfter(dueDate);
    const hoursUntilDue = dueDate.diff(dayjs(), 'hours');

    return (
      <Card
        key={task.id}
        className="mb-4 hover:shadow-md transition-shadow duration-200"
        actions={[
          <Button
            key="view"
            type="text"
            icon={<EyeOutlined />}
            onClick={() => openDetailDrawer(task)}
          >
            Ver Detalles
          </Button>,
          // Solo mostrar botón de entrega si NO es un Test Yourself (exam)
          task.taskType !== 'exam' && (mySubmission?.status === 'not_submitted' || mySubmission?.needsRevision) ? (
            <Button
              key="submit"
              type="text"
              icon={<SendOutlined />}
              onClick={() => openSubmitModal(task)}
              className="text-blue-600"
            >
              {mySubmission?.needsRevision ? 'Reenviar' : 'Entregar'}
            </Button>
          ) : task.taskType === 'exam' ? (
            <Button key="exam-reminder" type="text" disabled>
              Recordatorio de Examen
            </Button>
          ) : (
            <Button key="submitted" type="text" disabled>
              {mySubmission?.isGraded ? 'Calificada' : 'Entregada'}
            </Button>
          ),
        ]}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Title level={5} className="!mb-0">{task.title}</Title>
                <Tag color={TASK_PRIORITY_COLORS[task.priority]}>
                  {TASK_PRIORITY_LABELS[task.priority]}
                </Tag>
                <Tag color={taskStatus.color}>
                  {taskStatus.text}
                </Tag>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{TASK_TYPE_LABELS[task.taskType]}</span>
                <span>•</span>
                <span>{task.subjectAssignment.subject.name}</span>
                <span>•</span>
                <span>{task.subjectAssignment.subject.code}</span>
              </div>
            </div>
            <div className="text-right">
              {mySubmission?.isGraded && mySubmission?.finalGrade && (
                <div className="text-lg font-bold text-green-600">
                  {mySubmission.finalGrade}/{task.maxPoints || 10}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="text-gray-600 text-sm">
              {task.description}
            </div>
          )}

          {/* Progress */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Progreso</span>
              <span>{progress}%</span>
            </div>
            <Progress 
              percent={progress} 
              size="small" 
              strokeColor={
                progress === 100 ? '#52c41a' : 
                progress >= 75 ? '#1890ff' : 
                progress >= 25 ? '#faad14' : '#ff4d4f'
              }
            />
          </div>

          {/* Dates and Status */}
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-1">
              <CalendarOutlined className="text-blue-500" />
              <span>Asignada: {dayjs(task.assignedDate).format('DD/MM/YYYY')}</span>
            </div>
            <div className="flex items-center gap-1">
              <ClockCircleOutlined className={isOverdue ? 'text-red-500' : 'text-orange-500'} />
              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                Entrega: {dueDate.format('DD/MM/YYYY HH:mm')}
              </span>
            </div>
          </div>

          {/* Time warning for regular tasks */}
          {!isOverdue && hoursUntilDue <= 24 && mySubmission?.status === 'not_submitted' && task.taskType !== 'exam' && (
            <Alert
              message={`¡Quedan ${hoursUntilDue} horas para la entrega!`}
              type="warning"
              showIcon
            />
          )}

          {/* Exam reminder */}
          {task.taskType === 'exam' && !isOverdue && (
            <Alert
              message={`📝 Examen programado: ${dueDate.format('DD/MM/YYYY HH:mm')}`}
              description="Este es un recordatorio de examen. No requiere entrega digital."
              type="info"
              showIcon
            />
          )}

          {/* Exam completed */}
          {task.taskType === 'exam' && isOverdue && (
            <Alert
              message="✅ Examen realizado"
              description="El período del examen ha finalizado."
              type="success"
              showIcon
            />
          )}

          {/* Late submission */}
          {mySubmission?.isLate && (
            <Alert
              message="Entrega realizada fuera de plazo"
              type="error"
              showIcon
            />
          )}

          {/* Teacher feedback */}
          {mySubmission?.teacherFeedback && (
            <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
              <Text strong className="text-blue-800">Comentarios del profesor:</Text>
              <div className="mt-1 text-blue-700">
                "{mySubmission.teacherFeedback}"
              </div>
            </div>
          )}

          {/* Revision needed */}
          {mySubmission?.needsRevision && (
            <Alert
              message="Esta tarea necesita ser revisada y reenviada"
              type="warning"
              showIcon
              action={
                <Button 
                  size="small" 
                  type="primary" 
                  onClick={() => openSubmitModal(task)}
                >
                  Revisar
                </Button>
              }
            />
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="student-tasks-page">
      {/* Header con estadísticas */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <Card>
            <Row gutter={16} align="middle">
              <Col xs={24} md={12}>
                <Space>
                  <BookOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                  <div>
                    <Title level={4} style={{ margin: 0 }}>Mis Tareas</Title>
                    <Text type="secondary">Gestiona tus tareas y entregas académicas</Text>
                  </div>
                </Space>
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
                  title="Tareas Asignadas"
                  value={statistics.totalAssigned}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Pendientes"
                  value={statistics.pending}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Entregadas"
                  value={statistics.submitted}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Promedio"
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
        <Col xs={24} sm={8}>
          <Select
            placeholder="Estado de entrega"
            value={filters.submissionStatus}
            onChange={(value) => setFilters({ ...filters, submissionStatus: value, page: 1 })}
            allowClear
            style={{ width: '100%' }}
          >
            {Object.entries(SUBMISSION_STATUS_LABELS).map(([value, label]) => (
              <Option key={value} value={value}>{label}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8}>
          <Select
            placeholder="Filtro rápido"
            onChange={(value) => {
              if (value === 'pending') {
                setFilters({ ...filters, onlyPending: true, onlyGraded: false, page: 1 });
              } else if (value === 'graded') {
                setFilters({ ...filters, onlyGraded: true, onlyPending: false, page: 1 });
              } else {
                setFilters({ ...filters, onlyPending: false, onlyGraded: false, page: 1 });
              }
            }}
            allowClear
            style={{ width: '100%' }}
          >
            <Option value="pending">Solo Pendientes</Option>
            <Option value="graded">Solo Calificadas</Option>
          </Select>
        </Col>
      </Row>

      {/* Lista de tareas */}
      <Card>
        {loading ? (
          <div className="text-center py-8">
            <Spin size="large" />
          </div>
        ) : tasks.length > 0 ? (
          <div>
            {tasks.map(renderTaskCard)}
            
            {/* Paginación */}
            <div className="text-center mt-4">
              <Button
                disabled={filters.page === 1}
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
              >
                Anterior
              </Button>
              <span className="mx-4">
                Página {filters.page} de {Math.ceil(total / (filters.limit || 10))}
              </span>
              <Button
                disabled={(filters.page || 1) * (filters.limit || 10) >= total}
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
              >
                Siguiente
              </Button>
            </div>
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No tienes tareas asignadas"
          />
        )}
      </Card>

      {/* Modal de entrega */}
      <Modal
        title={`Entregar Tarea: ${selectedTask?.title}`}
        open={submitModalVisible}
        onCancel={() => {
          setSubmitModalVisible(false);
          submitForm.resetFields();
          setFileList([]);
          setSelectedTask(null);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        {selectedTask && (
          <div>
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <div className="space-y-2">
                <div><strong>Asignatura:</strong> {selectedTask.subjectAssignment.subject.name}</div>
                <div><strong>Tipo:</strong> {TASK_TYPE_LABELS[selectedTask.taskType]}</div>
                <div><strong>Fecha límite:</strong> {dayjs(selectedTask.dueDate).format('DD/MM/YYYY HH:mm')}</div>
                {selectedTask.maxPoints && (
                  <div><strong>Puntuación máxima:</strong> {selectedTask.maxPoints} puntos</div>
                )}
                {selectedTask.requiresFile && (
                  <div className="text-orange-600">
                    <ExclamationCircleOutlined /> Esta tarea requiere archivo adjunto
                  </div>
                )}
              </div>
            </div>

            {selectedTask.instructions && (
              <div className="mb-4">
                <Title level={5}>Instrucciones:</Title>
                <div className="p-3 bg-blue-50 rounded">
                  {selectedTask.instructions}
                </div>
              </div>
            )}

            {selectedTask.attachments && selectedTask.attachments.length > 0 && (
              <div className="mb-4">
                <Title level={5}>Archivos del profesor:</Title>
                <List
                  size="small"
                  dataSource={selectedTask.attachments}
                  renderItem={(attachment) => (
                    <List.Item
                      actions={[
                        <Button
                          key="download"
                          type="link"
                          icon={<DownloadOutlined />}
                          onClick={() => handleDownloadAttachment(attachment.id, attachment.originalName)}
                        >
                          Descargar
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<FileTextOutlined />} />}
                        title={attachment.originalName}
                        description={`${attachment.description || 'Archivo adjunto'} (${(attachment.size / 1024 / 1024).toFixed(2)} MB)`}
                      />
                    </List.Item>
                  )}
                />
              </div>
            )}

            <Form
              form={submitForm}
              layout="vertical"
              onFinish={handleSubmitTask}
            >
              <Form.Item
                name="content"
                label="Respuesta (Texto)"
              >
                <TextArea
                  rows={6}
                  placeholder="Escribe tu respuesta aquí..."
                />
              </Form.Item>

              <Form.Item
                name="submissionNotes"
                label="Notas adicionales"
              >
                <TextArea
                  rows={3}
                  placeholder="Comentarios adicionales sobre tu entrega..."
                />
              </Form.Item>

              <Form.Item label="Archivos adjuntos">
                <Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Haz clic o arrastra archivos para subirlos
                  </p>
                  <p className="ant-upload-hint">
                    Soporta archivos individuales o múltiples. Máximo 10MB por archivo.
                  </p>
                </Dragger>
              </Form.Item>

              {selectedTask.requiresFile && fileList.length === 0 && !selectedSubmission?.attachments?.length && (
                <Alert
                  message="Esta tarea requiere al menos un archivo adjunto"
                  type="warning"
                  showIcon
                  className="mb-4"
                />
              )}

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => {
                    setSubmitModalVisible(false);
                    submitForm.resetFields();
                    setFileList([]);
                    setSelectedTask(null);
                  }}>
                    Cancelar
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={uploading}
                    disabled={selectedTask.requiresFile && fileList.length === 0 && !selectedSubmission?.attachments?.length}
                  >
                    {selectedSubmission?.needsRevision ? 'Reenviar Tarea' : 'Entregar Tarea'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
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
          setSelectedSubmission(null);
        }}
      >
        {selectedTask && (
          <div className="space-y-6">
            <div>
              <Title level={4}>{selectedTask.title}</Title>
              <Space wrap>
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
                <Text strong>Descripción:</Text>
                <div>{selectedTask.description || 'Sin descripción'}</div>
              </div>

              <div>
                <Text strong>Instrucciones:</Text>
                <div>{selectedTask.instructions || 'Sin instrucciones específicas'}</div>
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
                  <li>Requiere archivo: {selectedTask.requiresFile ? 'Sí' : 'No'}</li>
                  <li>Entregas tardías: {selectedTask.allowLateSubmission ? 'Permitidas' : 'No permitidas'}</li>
                </ul>
              </div>

              {selectedSubmission && (
                <>
                  <Divider />
                  
                  <div>
                    <Text strong>Mi Entrega:</Text>
                    <div className="mt-2 space-y-2">
                      <div>
                        <Tag color={SUBMISSION_STATUS_COLORS[selectedSubmission.status]}>
                          {SUBMISSION_STATUS_LABELS[selectedSubmission.status]}
                        </Tag>
                        {selectedSubmission.isLate && <Tag color="orange">Tardía</Tag>}
                        {selectedSubmission.isGraded && <Tag color="green">Calificada</Tag>}
                      </div>
                      
                      {selectedSubmission.submittedAt && (
                        <div>Entregada: {dayjs(selectedSubmission.submittedAt).format('DD/MM/YYYY HH:mm')}</div>
                      )}
                      
                      {selectedSubmission.content && (
                        <div>
                          <div className="font-medium">Respuesta:</div>
                          <div className="p-3 bg-gray-50 rounded">{selectedSubmission.content}</div>
                        </div>
                      )}
                      
                      {selectedSubmission.submissionNotes && (
                        <div>
                          <div className="font-medium">Notas:</div>
                          <div className="p-3 bg-blue-50 rounded">{selectedSubmission.submissionNotes}</div>
                        </div>
                      )}
                      
                      {selectedSubmission.isGraded && (
                        <div>
                          <div className="font-medium">Calificación:</div>
                          <div className="text-lg font-bold text-green-600">
                            {selectedSubmission.finalGrade}/{selectedTask.maxPoints || 10}
                          </div>
                          {selectedSubmission.teacherFeedback && (
                            <div className="mt-2 p-3 bg-green-50 rounded">
                              <div className="font-medium text-green-800">Comentarios del profesor:</div>
                              <div className="text-green-700">"{selectedSubmission.teacherFeedback}"</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default StudentTasksPage;