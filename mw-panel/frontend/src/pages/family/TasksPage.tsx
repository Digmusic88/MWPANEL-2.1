import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Button,
  Space,
  Typography,
  Select,
  Tag,
  Row,
  Col,
  Statistic,
  Drawer,
  Avatar,
  Divider,
  Alert,
  Empty,
  Spin,
  Collapse,
} from 'antd';
import {
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  UserOutlined,
  FileTextOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import apiClient from '@services/apiClient';
import {
  Task,
  StudentTaskStatistics,
  TASK_TYPE_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
  SUBMISSION_STATUS_LABELS,
} from '@/types/tasks';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

interface FamilyTasksQuery {
  page?: number;
  limit?: number;
  submissionStatus?: string;
  onlyPending?: boolean;
  onlyGraded?: boolean;
  subjectId?: string;
  studentId?: string;
}

interface FamilyStudent {
  id: string;
  user: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

const FamilyTasksPage: React.FC = () => {
  // Estados principales
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<FamilyStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | undefined>();
  const [statistics, setStatistics] = useState<{ [studentId: string]: StudentTaskStatistics }>({});
  
  // Estados de modales y formularios
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Estados de filtros y paginación
  const [filters, setFilters] = useState<FamilyTasksQuery>({
    page: 1,
    limit: 20,
  });
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'by-student'>('by-student');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      fetchTasks();
      fetchAllStatistics();
    }
  }, [filters, students]);

  const fetchStudents = async () => {
    try {
      const response = await apiClient.get('/families/my-children');
      setStudents(response.data);
      if (response.data.length > 0 && !selectedStudent) {
        setSelectedStudent(response.data[0].id);
        setFilters(prev => ({ ...prev, studentId: response.data[0].id }));
      }
    } catch (error: any) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/tasks/family/tasks?${params}`);
      setTasks(response.data.tasks);
      setTotal(response.data.total);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStatistics = async () => {
    try {
      const statsPromises = students.map(student =>
        apiClient.get(`/tasks/family/student/${student.id}/statistics`)
          .then(response => ({ studentId: student.id, stats: response.data }))
      );
      
      const results = await Promise.all(statsPromises);
      const statsMap: { [studentId: string]: StudentTaskStatistics } = {};
      results.forEach(({ studentId, stats }) => {
        statsMap[studentId] = stats;
      });
      setStatistics(statsMap);
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
    }
  };

  const openDetailDrawer = (task: Task) => {
    setSelectedTask(task);
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
    }
  };

  const getTaskStatusForStudent = (task: Task, studentId: string) => {
    const submission = task.submissions.find(s => s.student.id === studentId);
    if (!submission) return { status: 'not_assigned', color: '#d9d9d9', text: 'No asignada' };
    
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const isOverdue = now > dueDate;
    
    if (submission.isGraded) {
      return { status: 'graded', color: '#52c41a', text: 'Calificada' };
    }
    
    if (submission.needsRevision) {
      return { status: 'needs_revision', color: '#722ed1', text: 'Necesita revisión' };
    }
    
    if (submission.status === 'submitted' || submission.status === 'late') {
      return { status: 'submitted', color: '#1890ff', text: 'Entregada' };
    }
    
    if (isOverdue) {
      return { status: 'overdue', color: '#ff4d4f', text: 'Atrasada' };
    }
    
    return { status: 'pending', color: '#faad14', text: 'Pendiente' };
  };

  const renderTaskCard = (task: Task, studentId?: string) => {
    const relevantSubmissions = studentId 
      ? task.submissions.filter(s => s.student.id === studentId)
      : task.submissions;

    return (
      <Card
        key={`${task.id}-${studentId || 'all'}`}
        className="mb-4 hover:shadow-md transition-shadow duration-200"
        size="small"
        title={
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Text strong>{task.title}</Text>
                <Tag color={TASK_PRIORITY_COLORS[task.priority]}>
                  {TASK_PRIORITY_LABELS[task.priority]}
                </Tag>
              </div>
              <div className="text-sm text-gray-500">
                {TASK_TYPE_LABELS[task.taskType]} • {task.subjectAssignment.subject.name}
              </div>
            </div>
            {task.maxPoints && (
              <div className="text-sm text-gray-500">
                Máx: {task.maxPoints} pts
              </div>
            )}
          </div>
        }
        actions={[
          <Button
            key="view"
            type="text"
            icon={<EyeOutlined />}
            onClick={() => openDetailDrawer(task)}
          >
            Ver Detalles
          </Button>,
        ]}
      >
        {/* Descripción */}
        {task.description && (
          <div className="text-gray-600 text-sm mb-3">
            {task.description}
          </div>
        )}

        {/* Fechas */}
        <div className="flex justify-between items-center text-sm mb-3">
          <div className="flex items-center gap-1">
            <CalendarOutlined className="text-blue-500" />
            <span>Asignada: {dayjs(task.assignedDate).format('DD/MM/YYYY')}</span>
          </div>
          <div className="flex items-center gap-1">
            <ClockCircleOutlined className={dayjs().isAfter(task.dueDate) ? 'text-red-500' : 'text-orange-500'} />
            <span className={dayjs().isAfter(task.dueDate) ? 'text-red-600 font-medium' : ''}>
              Entrega: {dayjs(task.dueDate).format('DD/MM/YYYY HH:mm')}
            </span>
          </div>
        </div>

        {/* Estados por estudiante */}
        <div className="space-y-2">
          {relevantSubmissions.map(submission => {
            const taskStatus = getTaskStatusForStudent(task, submission.student.id);
            const student = students.find(s => s.id === submission.student.id);
            
            return (
              <div key={submission.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span className="text-sm">
                    {student?.user.profile.firstName} {student?.user.profile.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag color={taskStatus.color}>
                    {taskStatus.text}
                  </Tag>
                  {submission.isGraded && submission.finalGrade && (
                    <Tag color="green">
                      {submission.finalGrade}/{task.maxPoints || 10}
                    </Tag>
                  )}
                  {submission.isLate && (
                    <Tag color="orange">Tardía</Tag>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Alertas */}
        {relevantSubmissions.some(s => s.needsRevision) && (
          <Alert
            message="Algún estudiante tiene tareas que necesitan revisión"
            type="warning"
            showIcon
            className="mt-3"
          />
        )}
      </Card>
    );
  };

  const renderByStudentView = () => {
    const studentTasks = students.map(student => {
      const studentTasksFiltered = tasks.filter(task => 
        task.submissions.some(s => s.student.id === student.id)
      );
      
      return {
        student,
        tasks: studentTasksFiltered,
        stats: statistics[student.id],
      };
    });

    return (
      <Collapse defaultActiveKey={students.map(s => s.id)}>
        {studentTasks.map(({ student, tasks: studentTasks, stats }) => (
          <Panel
            key={student.id}
            header={
              <div className="flex justify-between items-center w-full mr-4">
                <div className="flex items-center gap-3">
                  <Avatar icon={<UserOutlined />} />
                  <span className="font-medium">
                    {student.user.profile.firstName} {student.user.profile.lastName}
                  </span>
                </div>
                {stats && (
                  <div className="flex gap-4 text-sm">
                    <span className="text-blue-600">Total: {stats.totalAssigned}</span>
                    <span className="text-orange-600">Pendientes: {stats.pending}</span>
                    <span className="text-green-600">Entregadas: {stats.submitted}</span>
                    {stats.averageGrade > 0 && (
                      <span className="text-purple-600">Promedio: {stats.averageGrade.toFixed(1)}</span>
                    )}
                  </div>
                )}
              </div>
            }
          >
            {studentTasks.length > 0 ? (
              studentTasks.map(task => renderTaskCard(task, student.id))
            ) : (
              <Empty description="No hay tareas asignadas" />
            )}
          </Panel>
        ))}
      </Collapse>
    );
  };

  return (
    <div className="family-tasks-page">
      {/* Header */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <Card>
            <Row gutter={16} align="middle">
              <Col xs={24} md={12}>
                <Space>
                  <BookOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                  <div>
                    <Title level={4} style={{ margin: 0 }}>Tareas de mis Hijos</Title>
                    <Text type="secondary">Supervisa el progreso académico de tus hijos</Text>
                  </div>
                </Space>
              </Col>
              <Col xs={24} md={12} className="text-right">
                <Space>
                  <Select
                    value={viewMode}
                    onChange={setViewMode}
                    style={{ width: 150 }}
                  >
                    <Option value="by-student">Por Estudiante</Option>
                    <Option value="list">Lista General</Option>
                  </Select>
                  {viewMode === 'list' && (
                    <Select
                      placeholder="Seleccionar hijo"
                      value={selectedStudent}
                      onChange={(value) => {
                        setSelectedStudent(value);
                        setFilters({ ...filters, studentId: value, page: 1 });
                      }}
                      style={{ width: 200 }}
                    >
                      <Option value="">Todos los hijos</Option>
                      {students.map(student => (
                        <Option key={student.id} value={student.id}>
                          {student.user.profile.firstName} {student.user.profile.lastName}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Estadísticas generales */}
        {Object.keys(statistics).length > 0 && (
          <>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Total Tareas"
                  value={Object.values(statistics).reduce((sum, stat) => sum + stat.totalAssigned, 0)}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Pendientes"
                  value={Object.values(statistics).reduce((sum, stat) => sum + stat.pending, 0)}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Entregadas"
                  value={Object.values(statistics).reduce((sum, stat) => sum + stat.submitted, 0)}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Promedio General"
                  value={
                    Object.values(statistics).filter(s => s.averageGrade > 0).length > 0
                      ? Object.values(statistics)
                          .filter(s => s.averageGrade > 0)
                          .reduce((sum, stat) => sum + stat.averageGrade, 0) /
                        Object.values(statistics).filter(s => s.averageGrade > 0).length
                      : 0
                  }
                  precision={1}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </>
        )}
      </Row>

      {/* Filtros para vista lista */}
      {viewMode === 'list' && (
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
      )}

      {/* Contenido principal */}
      <Card>
        {loading ? (
          <div className="text-center py-8">
            <Spin size="large" />
          </div>
        ) : viewMode === 'by-student' ? (
          renderByStudentView()
        ) : tasks.length > 0 ? (
          <div>
            {tasks.map(task => renderTaskCard(task))}
            
            {/* Paginación */}
            <div className="text-center mt-4">
              <Button
                disabled={filters.page === 1}
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
              >
                Anterior
              </Button>
              <span className="mx-4">
                Página {filters.page} de {Math.ceil(total / (filters.limit || 20))}
              </span>
              <Button
                disabled={(filters.page || 1) * (filters.limit || 20) >= total}
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
              >
                Siguiente
              </Button>
            </div>
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No hay tareas disponibles"
          />
        )}
      </Card>

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
                <Text strong>Profesor:</Text>
                <div>
                  {selectedTask.teacher.user.profile.firstName} {selectedTask.teacher.user.profile.lastName}
                </div>
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

              {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                <div>
                  <Text strong>Archivos del profesor:</Text>
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

              <Divider />

              <div>
                <Text strong>Estados de entregas:</Text>
                <div className="mt-2 space-y-3">
                  {selectedTask.submissions.map(submission => {
                    const student = students.find(s => s.id === submission.student.id);
                    const taskStatus = getTaskStatusForStudent(selectedTask, submission.student.id);
                    
                    return (
                      <Card key={submission.id} size="small">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Avatar size="small" icon={<UserOutlined />} />
                              <span className="font-medium">
                                {student?.user.profile.firstName} {student?.user.profile.lastName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Tag color={taskStatus.color}>
                                {taskStatus.text}
                              </Tag>
                              {submission.isLate && <Tag color="orange">Tardía</Tag>}
                              {submission.isGraded && <Tag color="green">Calificada</Tag>}
                            </div>
                          </div>

                          {submission.submittedAt && (
                            <div className="text-sm text-gray-500">
                              Entregada: {dayjs(submission.submittedAt).format('DD/MM/YYYY HH:mm')}
                            </div>
                          )}

                          {submission.isGraded && submission.finalGrade && (
                            <div>
                              <div className="text-lg font-bold text-green-600">
                                Calificación: {submission.finalGrade}/{selectedTask.maxPoints || 10}
                              </div>
                              {submission.teacherFeedback && (
                                <div className="mt-2 p-3 bg-green-50 rounded">
                                  <div className="font-medium text-green-800">Comentarios del profesor:</div>
                                  <div className="text-green-700">"{submission.teacherFeedback}"</div>
                                </div>
                              )}
                            </div>
                          )}

                          {submission.needsRevision && (
                            <Alert
                              message="Esta entrega necesita ser revisada"
                              type="warning"
                              showIcon
                            />
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default FamilyTasksPage;