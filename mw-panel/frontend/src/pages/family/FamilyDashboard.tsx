import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Statistic, Typography, Space, Select, Avatar, Progress, Button, Spin, message, Empty, Alert, List, Tag } from 'antd'
import {
  UserOutlined,
  TrophyOutlined,
  CalendarOutlined,
  FileTextOutlined,
  DownloadOutlined,
  BookOutlined,
  SmileOutlined,
  MehOutlined,
  FrownOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  SendOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import apiClient from '@services/apiClient'
import MessagesPage from '../communications/MessagesPage'
import AttendancePage from './AttendancePage'
import ActivitiesPage from './ActivitiesPage'
import TasksPage from './TasksPage'

const { Title, Text } = Typography
const { Option } = Select

// Interfaces
interface CompetencyEvaluation {
  competencyName: string
  score?: number
  displayGrade?: string
  observations?: string
}

interface RecentEvaluation {
  id: string
  period: string
  createdAt: string
  competencyEvaluations: CompetencyEvaluation[]
}

interface StudentStats {
  totalEvaluations: number
  completedEvaluations: number
  pendingEvaluations: number
  averageGrade: number
  attendance: number
}

interface StudentData {
  id: string
  enrollmentNumber: string
  relationship: 'father' | 'mother' | 'guardian' | 'other'
  user: {
    profile: {
      firstName: string
      lastName: string
    }
  }
  educationalLevel?: {
    id: string
    name: string
  }
  course?: {
    id: string
    name: string
  }
  classGroups: Array<{
    id: string
    name: string
  }>
  stats: StudentStats
  recentEvaluations: RecentEvaluation[]
}

interface RecentActivity {
  id: string
  value: string
  comment?: string
  assessedAt: string
  activity: {
    name: string
    description?: string
    valuationType: 'emoji' | 'score'
    maxScore?: number
    subjectAssignment?: {
      subject: {
        name: string
        code: string
      }
      classGroup: {
        name: string
      }
    }
    teacher: {
      user: {
        profile: {
          firstName: string
          lastName: string
        }
      }
    }
  }
}

interface TaskSubmission {
  id: string
  status: 'not_submitted' | 'submitted' | 'late' | 'returned'
  isGraded: boolean
  finalGrade?: number
  needsRevision: boolean
  submittedAt?: string
}

interface PendingTask {
  id: string
  title: string
  description?: string
  taskType: 'homework' | 'project' | 'exam' | 'quiz'
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  assignedDate: string
  maxPoints?: number
  requiresFile: boolean
  subjectAssignment: {
    subject: {
      name: string
      code: string
    }
  }
  submissions: TaskSubmission[]
}

interface FamilyDashboardData {
  family: {
    id: string
    primaryContact: {
      id: string
      profile: {
        firstName: string
        lastName: string
      }
    }
    secondaryContact?: {
      id: string
      profile: {
        firstName: string
        lastName: string
      }
    }
  }
  students: StudentData[]
  summary: {
    totalStudents: number
    averageGrade: number
    totalPendingEvaluations: number
    totalCompletedEvaluations: number
  }
}

const relationshipLabels = {
  father: 'Padre',
  mother: 'Madre', 
  guardian: 'Tutor/a',
  other: 'Otro'
}

const FamilyDashboardHome: React.FC = () => {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState<FamilyDashboardData | null>(null)
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get('/families/dashboard/my-family')
      setDashboardData(response.data)
      
      // Set first child as selected by default
      if (response.data.students && response.data.students.length > 0) {
        setSelectedChildId(response.data.students[0].id)
      }
    } catch (error: any) {
      console.error('Error fetching family dashboard:', error)
      setError(error.response?.data?.message || 'Error al cargar los datos familiares')
      message.error('Error al cargar los datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentActivities = async (studentId: string) => {
    try {
      setLoadingActivities(true)
      const response = await apiClient.get(`/activities/family/activities?studentId=${studentId}&limit=3`)
      setRecentActivities(response.data)
    } catch (error: any) {
      console.error('Error fetching recent activities:', error)
    } finally {
      setLoadingActivities(false)
    }
  }

  const fetchPendingTasks = async (studentId: string) => {
    try {
      setLoadingTasks(true)
      const response = await apiClient.get(`/tasks/family/tasks?studentId=${studentId}&onlyPending=true&limit=4`)
      setPendingTasks(response.data.tasks || [])
    } catch (error: any) {
      console.error('Error fetching pending tasks:', error)
      setPendingTasks([])
    } finally {
      setLoadingTasks(false)
    }
  }

  const getEmojiIcon = (value: string) => {
    switch (value) {
      case 'happy': return <SmileOutlined style={{ color: '#52c41a' }} />
      case 'neutral': return <MehOutlined style={{ color: '#faad14' }} />
      case 'sad': return <FrownOutlined style={{ color: '#ff4d4f' }} />
      default: return null
    }
  }


  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'homework': return 'Tarea'
      case 'project': return 'Proyecto'
      case 'exam': return 'Test Yourself'
      case 'quiz': return 'Cuestionario'
      case 'assignment': return 'Tarea'
      case 'research': return 'Investigación'
      case 'presentation': return 'Presentación'
      default: return 'Actividad'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4d4f'
      case 'medium': return '#faad14'
      case 'low': return '#52c41a'
      default: return '#d9d9d9'
    }
  }

  const getTaskStatus = (task: PendingTask) => {
    const submission = task.submissions?.[0]
    if (!submission) return { status: 'no_submission', color: '#d9d9d9', text: 'Sin asignar' }
    
    // Para tareas tipo EXAM (Test Yourself), mostrar como notificación
    if (task.taskType === 'exam') {
      const now = new Date()
      const dueDate = new Date(task.dueDate)
      const isOverdue = now > dueDate
      
      if (isOverdue) {
        return { status: 'exam_completed', color: '#52c41a', text: 'Examen Realizado' }
      }
      return { status: 'exam_notification', color: '#1890ff', text: 'Notificación de Examen' }
    }
    
    const now = new Date()
    const dueDate = new Date(task.dueDate)
    const isOverdue = now > dueDate
    
    if (submission.isGraded) {
      return { status: 'graded', color: '#52c41a', text: 'Calificada' }
    }
    
    if (submission.needsRevision) {
      return { status: 'needs_revision', color: '#722ed1', text: 'Necesita revisión' }
    }
    
    if (submission.status === 'submitted' || submission.status === 'late') {
      return { status: 'submitted', color: '#1890ff', text: 'Entregada' }
    }
    
    if (isOverdue) {
      return { status: 'overdue', color: '#ff4d4f', text: 'Atrasada' }
    }
    
    return { status: 'pending', color: '#faad14', text: 'Pendiente' }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (selectedChildId) {
      fetchRecentActivities(selectedChildId)
      fetchPendingTasks(selectedChildId)
    }
  }, [selectedChildId])

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Cargando datos familiares..." />
      </div>
    )
  }

  // Show error state
  if (error || !dashboardData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Alert
          message="Error al cargar datos"
          description={error || 'No se pudieron cargar los datos familiares'}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={fetchDashboardData}>
              Reintentar
            </Button>
          }
        />
      </div>
    )
  }

  // Show empty state if no students
  if (!dashboardData.students || dashboardData.students.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No hay estudiantes asignados a esta familia"
        />
      </div>
    )
  }

  const selectedChild = dashboardData.students.find(s => s.id === selectedChildId) || dashboardData.students[0]

  const getGradeColor = (grade: number) => {
    if (grade >= 9) return '#52c41a'
    if (grade >= 7) return '#1890ff'
    if (grade >= 5) return '#faad14'
    return '#f5222d'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Title level={2} className="!mb-2">
            Panel Familiar
          </Title>
          <Text type="secondary">
            Seguimiento académico de {dashboardData.family.primaryContact.profile.firstName} {dashboardData.family.primaryContact.profile.lastName}
            {dashboardData.family.secondaryContact && (
              <span> y {dashboardData.family.secondaryContact.profile.firstName} {dashboardData.family.secondaryContact.profile.lastName}</span>
            )}
          </Text>
        </div>
        
        {dashboardData.students.length > 1 && (
          <Select
            value={selectedChildId}
            onChange={setSelectedChildId}
            style={{ width: 250 }}
            size="large"
            placeholder="Seleccionar hijo/a"
          >
            {dashboardData.students.map(student => (
              <Option key={student.id} value={student.id}>
                {student.user.profile.firstName} {student.user.profile.lastName}
                <Text type="secondary" className="ml-2">
                  ({relationshipLabels[student.relationship]})
                </Text>
              </Option>
            ))}
          </Select>
        )}
      </div>

      {/* Child Info Card */}
      <Card>
        <div className="flex items-center gap-4">
          <Avatar size={64} icon={<UserOutlined />} />
          <div>
            <Title level={4} className="!mb-1">
              {selectedChild.user.profile.firstName} {selectedChild.user.profile.lastName}
            </Title>
            <Space>
              <Text type="secondary">
                {selectedChild.educationalLevel?.name} 
                {selectedChild.course && ` - ${selectedChild.course.name}`}
              </Text>
              <Text type="secondary">•</Text>
              <Text type="secondary">
                {selectedChild.enrollmentNumber}
              </Text>
              <Text type="secondary">•</Text>
              <Text type="secondary">
                {relationshipLabels[selectedChild.relationship]}
              </Text>
            </Space>
            {selectedChild.classGroups.length > 0 && (
              <div className="mt-2">
                <Space wrap>
                  {selectedChild.classGroups.map(classGroup => (
                    <span key={classGroup.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {classGroup.name}
                    </span>
                  ))}
                </Space>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Nota Media"
              value={selectedChild.stats.averageGrade}
              precision={1}
              prefix={<TrophyOutlined />}
              suffix="/ 10"
              valueStyle={{ color: getGradeColor(selectedChild.stats.averageGrade) }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Asistencia"
              value={selectedChild.stats.attendance}
              prefix={<CalendarOutlined />}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Evaluaciones Completadas"
              value={selectedChild.stats.completedEvaluations}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Evaluaciones Pendientes"
              value={selectedChild.stats.pendingEvaluations}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content - Reorganized for compactness */}
      <Row gutter={[16, 16]}>
        {/* Left Column */}
        <Col xs={24} lg={12}>
          <Space direction="vertical" size="middle" className="w-full">
            {/* Pending Tasks Widget */}
            <Card 
              title={
                <Space>
                  <SendOutlined style={{ color: '#faad14' }} />
                  Tareas Pendientes
                </Space>
              }
              extra={
                <Button 
                  type="primary" 
                  size="small" 
                  icon={<EyeOutlined />}
                  onClick={() => navigate('/family/tasks')}
                >
                  Ver Todas
                </Button>
              }
              size="small"
            >
              {loadingTasks ? (
                <div className="text-center py-4">
                  <Spin size="small" />
                </div>
              ) : pendingTasks.length > 0 ? (
                <List
                  size="small"
                  dataSource={pendingTasks}
                  renderItem={(task) => {
                    const taskStatus = getTaskStatus(task)
                    const dueDate = new Date(task.dueDate)
                    const isUrgent = dueDate.getTime() - Date.now() < 24 * 60 * 60 * 1000 // Less than 24h
                    
                    return (
                      <List.Item className="hover:bg-gray-50 px-3 py-2">
                        <List.Item.Meta
                          avatar={
                            <div className="relative">
                              <Avatar 
                                style={{ backgroundColor: getPriorityColor(task.priority) }}
                                icon={<SendOutlined />}
                                size="small"
                              />
                              {isUrgent && (
                                <ExclamationCircleOutlined 
                                  className="absolute -top-1 -right-1 text-red-500 text-xs"
                                />
                              )}
                            </div>
                          }
                          title={
                            <div className="flex justify-between items-start">
                              <Text strong className="text-sm">{task.title}</Text>
                              <Tag color={taskStatus.color} className="text-xs">
                                {taskStatus.text}
                              </Tag>
                            </div>
                          }
                          description={
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                              <div className="flex justify-between items-center">
                                <Tag color="blue" className="text-xs">
                                  {task.subjectAssignment.subject.code}
                                </Tag>
                                <Text type="secondary" className="text-xs">
                                  {getTaskTypeLabel(task.taskType)}
                                </Text>
                              </div>
                              <div className="flex justify-between items-center">
                                <Text type="secondary" className="text-xs">
                                  <ClockCircleOutlined className="mr-1" />
                                  {dueDate.toLocaleDateString('es-ES')}
                                </Text>
                                {task.requiresFile && (
                                  <Text type="secondary" className="text-xs">
                                    📎 Requiere archivo
                                  </Text>
                                )}
                              </div>
                              {isUrgent && (
                                <Alert
                                  message="¡Entrega urgente!"
                                  type="warning"
                                  showIcon
                                  className="mt-1"
                                />
                              )}
                            </Space>
                          }
                        />
                      </List.Item>
                    )
                  }}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No hay tareas pendientes"
                  className="py-4"
                />
              )}
            </Card>

            {/* Recent Activities Widget - Compact */}
            <Card 
              title={
                <Space>
                  <BookOutlined />
                  Actividades Recientes
                </Space>
              }
              extra={
                <Button 
                  type="link" 
                  size="small" 
                  icon={<EyeOutlined />}
                  onClick={() => navigate('/family/activities')}
                >
                  Ver Todas
                </Button>
              }
              size="small"
            >
              {loadingActivities ? (
                <div className="text-center py-4">
                  <Spin size="small" />
                </div>
              ) : recentActivities.length > 0 ? (
                <List
                  size="small"
                  dataSource={recentActivities.slice(0, 3)}
                  renderItem={(activity) => (
                    <List.Item className="hover:bg-gray-50 px-3 py-2">
                      <List.Item.Meta
                        avatar={
                          <div className="flex flex-col items-center">
                            {activity.activity.valuationType === 'emoji' ? (
                              getEmojiIcon(activity.value)
                            ) : (
                              <Avatar 
                                style={{ backgroundColor: '#1890ff' }}
                                size="small"
                              >
                                {activity.value}
                              </Avatar>
                            )}
                          </div>
                        }
                        title={
                          <div className="flex justify-between items-center">
                            <Text strong className="text-sm">{activity.activity.name}</Text>
                            <Tag 
                              color={activity.activity.subjectAssignment ? 'blue' : 'default'}
                              className="text-xs"
                            >
                              {activity.activity.subjectAssignment?.subject.code || 'General'}
                            </Tag>
                          </div>
                        }
                        description={
                          <Text type="secondary" className="text-xs">
                            {new Date(activity.assessedAt).toLocaleDateString('es-ES')}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No hay actividades recientes"
                  className="py-4"
                />
              )}
            </Card>
          </Space>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={12}>
          <Space direction="vertical" size="middle" className="w-full">
            {/* Student Summary - Compact */}
            <Card title="Resumen Académico" extra={<BookOutlined />} size="small">
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: getGradeColor(selectedChild.stats.averageGrade) }}>
                      {selectedChild.stats.averageGrade.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500">Nota Media</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedChild.stats.attendance}%
                    </div>
                    <div className="text-xs text-gray-500">Asistencia</div>
                  </div>
                </Col>
              </Row>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <Text className="text-sm">Evaluaciones Completadas</Text>
                  <Text strong className="text-sm">{selectedChild.stats.completedEvaluations}/{selectedChild.stats.totalEvaluations}</Text>
                </div>
                <Progress 
                  percent={selectedChild.stats.totalEvaluations > 0 
                    ? Math.round((selectedChild.stats.completedEvaluations / selectedChild.stats.totalEvaluations) * 100)
                    : 0
                  }
                  strokeColor="#52c41a"
                  size="small"
                />
              </div>
            </Card>

            {/* Recent Evaluations - Compact */}
            <Card 
              title="Evaluaciones Recientes"
              extra={
                <Button type="link" icon={<DownloadOutlined />} size="small">
                  Informe
                </Button>
              }
              size="small"
            >
              {selectedChild.recentEvaluations.length > 0 ? (
                <Space direction="vertical" className="w-full">
                  {selectedChild.recentEvaluations.slice(0, 2).map((evaluation) => (
                    <div key={evaluation.id} className="border-b border-gray-100 pb-2 last:border-b-0">
                      <div className="flex justify-between items-start mb-1">
                        <Text strong className="text-sm">{evaluation.period}</Text>
                        <Text className="text-xs text-gray-500">
                          {new Date(evaluation.createdAt).toLocaleDateString('es-ES')}
                        </Text>
                      </div>
                      {evaluation.competencyEvaluations.slice(0, 2).map((compEval, index) => (
                        <div key={index} className="flex justify-between items-center py-1">
                          <Text className="text-xs">{compEval.competencyName}</Text>
                          {compEval.displayGrade && (
                            <span 
                              className="text-xs font-medium"
                              style={{ color: getGradeColor(parseFloat(compEval.displayGrade)) }}
                            >
                              {compEval.displayGrade}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </Space>
              ) : (
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No hay evaluaciones"
                  className="py-4"
                />
              )}
            </Card>

            {/* Quick Actions - Compact */}
            <Card title="Acciones Rápidas" size="small">
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Button 
                    type="default" 
                    block 
                    size="small"
                    icon={<FileTextOutlined />}
                    onClick={() => navigate('/family/messages')}
                  >
                    Mensajes
                  </Button>
                </Col>
                <Col span={12}>
                  <Button 
                    type="default" 
                    block 
                    size="small"
                    icon={<CalendarOutlined />}
                    onClick={() => navigate('/family/attendance')}
                  >
                    Asistencia
                  </Button>
                </Col>
                <Col span={24}>
                  <Button 
                    type="primary" 
                    block 
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => message.info('Función de reportes en desarrollo')}
                  >
                    Descargar Boletín Completo
                  </Button>
                </Col>
              </Row>
            </Card>
          </Space>
        </Col>
      </Row>


      {/* Competency Progress - Compact */}
      <Card title="Evaluación por Competencias" size="small">
        {selectedChild.recentEvaluations.length > 0 ? (
          <Row gutter={[8, 8]}>
            {(() => {
              // Aggregate competency data from recent evaluations
              const competencyMap = new Map<string, { total: number; count: number; grades: number[] }>()
              
              selectedChild.recentEvaluations.forEach(evaluation => {
                evaluation.competencyEvaluations.forEach(compEval => {
                  if (compEval.displayGrade !== undefined && compEval.displayGrade !== null) {
                    const grade = parseFloat(compEval.displayGrade)
                    if (!competencyMap.has(compEval.competencyName)) {
                      competencyMap.set(compEval.competencyName, { total: 0, count: 0, grades: [] })
                    }
                    const data = competencyMap.get(compEval.competencyName)!
                    data.total += grade
                    data.count += 1
                    data.grades.push(grade)
                  }
                })
              })
              
              const competencies = Array.from(competencyMap.entries())
                .map(([name, data]) => ({
                  name,
                  average: data.total / data.count,
                  count: data.count
                }))
                .sort((a, b) => b.count - a.count) // Sort by frequency
                .slice(0, 6) // Show top 6 competencies
              
              return competencies.map((comp) => (
                <Col xs={12} sm={8} lg={4} key={comp.name}>
                  <div className="text-center">
                    <div className="text-sm font-bold mb-2" title={comp.name}>
                      {comp.name.length > 15 ? `${comp.name.substring(0, 15)}...` : comp.name}
                    </div>
                    <Progress 
                      type="circle" 
                      percent={comp.average * 10} 
                      strokeColor={getGradeColor(comp.average)}
                      format={() => comp.average.toFixed(1)}
                      width={60}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {comp.count} eval.
                    </div>
                  </div>
                </Col>
              ))
            })()}
          </Row>
        ) : (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No hay evaluaciones por competencias disponibles"
            className="py-4"
          />
        )}
      </Card>
    </div>
  )
}

const FamilyDashboard: React.FC = () => {
  return (
    <Routes>
      <Route index element={<FamilyDashboardHome />} />
      <Route path="messages" element={<MessagesPage />} />
      <Route path="attendance" element={<AttendancePage />} />
      <Route path="activities" element={<ActivitiesPage />} />
      <Route path="tasks" element={<TasksPage />} />
      {/* Add more family routes here */}
    </Routes>
  )
}

export default FamilyDashboard