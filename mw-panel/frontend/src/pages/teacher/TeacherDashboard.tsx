import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Statistic, Typography, Space, List, Avatar, Progress, Button, Spin, message, Alert, Badge, Tag } from 'antd'
import {
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  PlusOutlined,
  EyeOutlined,
  BellOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import apiClient from '@services/apiClient'
import TeacherSchedulePage from './TeacherSchedulePage'
import MessagesPage from '../communications/MessagesPage'
import AttendancePage from './AttendancePage'
import ActivitiesPage from './ActivitiesPage'
import TasksPage from './TasksPage'
import TasksDashboard from './TasksDashboard'
import TaskGradingPage from './TaskGradingPage'
import { usePendingAttendanceRequests } from '../../hooks/usePendingAttendanceRequests'

const { Title, Text } = Typography

interface TeacherProfile {
  id: string
  employeeNumber: string
  specialties: string[]
  user: {
    email: string
    profile: {
      firstName: string
      lastName: string
      department: string
      position: string
      education: string
    }
  }
  subjects?: Array<{
    id: string
    name: string
  }>
  tutoredClasses?: Array<{
    id: string
    name: string
  }>
}

const TeacherDashboardHome: React.FC = () => {
  const navigate = useNavigate()
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Real data state
  const [teacherClasses, setTeacherClasses] = useState<any[]>([])
  const [teacherSubjects, setTeacherSubjects] = useState<any[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  
  // Use hook for sidebar badge updates
  const { refreshCount } = usePendingAttendanceRequests()

  const stats = {
    totalClasses: teacherClasses.length,
    totalStudents: teacherClasses.reduce((total, classGroup) => total + (classGroup.students?.length || 0), 0),
    totalSubjects: teacherSubjects.length,
    totalAssignments: teacherSubjects.reduce((total, assignment) => total + assignment.weeklyHours, 0),
    pendingEvaluations: 23,
    completedEvaluations: 87,
  }

  // Fetch teacher profile
  const fetchTeacherProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get current user info first to find teacher ID
      const userResponse = await apiClient.get('/auth/me')
      const currentUser = userResponse.data
      
      // If not a teacher, show error
      if (currentUser.role !== 'teacher') {
        setError('Acceso denegado: Solo profesores pueden acceder a este panel')
        return
      }

      // Find teacher by user ID
      const teachersResponse = await apiClient.get('/teachers')
      const teachers = teachersResponse.data
      
      const currentTeacher = teachers.find((teacher: any) => teacher.user.id === currentUser.id)
      
      if (currentTeacher) {
        setTeacherProfile(currentTeacher)
      } else {
        setError('No se encontró el perfil de profesor para este usuario')
      }
    } catch (error: any) {
      console.error('Error fetching teacher profile:', error)
      const errorMessage = error.response?.data?.message || 'Error al cargar el perfil del profesor'
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Fetch teacher's class groups
  const fetchTeacherClasses = async (teacherId: string) => {
    try {
      const response = await apiClient.get(`/class-groups?tutorId=${teacherId}`)
      setTeacherClasses(response.data)
    } catch (error: any) {
      console.error('Error fetching teacher classes:', error)
      // Don't show error message for this, as it's not critical
    }
  }

  // Fetch teacher's subject assignments
  const fetchTeacherSubjects = async (teacherId: string) => {
    try {
      const response = await apiClient.get(`/subjects/assignments/teacher/${teacherId}`)
      setTeacherSubjects(response.data)
    } catch (error: any) {
      console.error('Error fetching teacher subjects:', error)
      // Don't show error message for this, as it's not critical
    }
  }

  // Fetch pending attendance requests for teacher's classes
  const fetchPendingAttendanceRequests = async () => {
    if (!teacherClasses.length) return

    try {
      setLoadingRequests(true)
      const allRequests: any[] = []

      // Get pending requests for each of teacher's classes
      for (const classGroup of teacherClasses) {
        try {
          const response = await apiClient.get(`/attendance/requests/group/${classGroup.id}/pending`)
          allRequests.push(...response.data)
        } catch (error) {
          console.error(`Error fetching requests for class ${classGroup.id}:`, error)
        }
      }

      setPendingRequests(allRequests)
    } catch (error: any) {
      console.error('Error fetching pending attendance requests:', error)
    } finally {
      setLoadingRequests(false)
    }
  }

  // Handle quick approval/rejection of attendance requests
  const handleQuickReviewRequest = async (requestId: string, status: 'approved' | 'rejected', note?: string) => {
    try {
      await apiClient.patch(`/attendance/requests/${requestId}/review`, {
        status,
        reviewNote: note || ''
      })
      
      message.success(`Solicitud ${status === 'approved' ? 'aprobada' : 'rechazada'} correctamente`)
      
      // Refresh pending requests and sidebar badge
      fetchPendingAttendanceRequests()
      refreshCount()
    } catch (error: any) {
      console.error('Error reviewing request:', error)
      message.error(error.response?.data?.message || 'Error al procesar la solicitud')
    }
  }

  useEffect(() => {
    fetchTeacherProfile()
  }, [])

  useEffect(() => {
    if (teacherProfile?.id) {
      fetchTeacherClasses(teacherProfile.id)
      fetchTeacherSubjects(teacherProfile.id)
    }
  }, [teacherProfile])

  // Fetch attendance requests when teacher classes are loaded
  useEffect(() => {
    if (teacherClasses.length > 0) {
      fetchPendingAttendanceRequests()
    }
  }, [teacherClasses])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Cargando dashboard del profesor..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert
          message="Error al cargar el dashboard"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={fetchTeacherProfile}>
              Reintentar
            </Button>
          }
        />
      </div>
    )
  }

  // Use real teacher classes or show empty state
  const classes = teacherClasses.map(classGroup => ({
    id: classGroup.id,
    name: classGroup.name,
    course: classGroup.courses?.map((c: any) => c.name).join(', ') || 'Sin cursos',
    students: classGroup.students?.length || 0,
    academicYear: classGroup.academicYear?.name || 'Sin año',
  }))

  const recentEvaluations = [
    { id: 1, student: 'Ana García López', class: '3º A', subject: 'Matemáticas', date: '2024-01-15', status: 'completed' },
    { id: 2, student: 'Carlos Ruiz Mora', class: '3º A', subject: 'Matemáticas', date: '2024-01-15', status: 'pending' },
    { id: 3, student: 'María Fernández', class: '3º B', subject: 'Matemáticas', date: '2024-01-14', status: 'completed' },
    { id: 4, student: 'Pedro Sánchez', class: '4º A', subject: 'Matemáticas', date: '2024-01-14', status: 'draft' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Title level={2} className="!mb-2">
          Panel del Profesor
        </Title>
        {teacherProfile && (
          <div className="space-y-2">
            <Text type="secondary" className="block">
              Bienvenido/a, {teacherProfile.user.profile.firstName} {teacherProfile.user.profile.lastName}
            </Text>
            <Space wrap>
              <Text type="secondary">{teacherProfile.user.profile.department}</Text>
              <Text type="secondary">•</Text>
              <Text type="secondary">{teacherProfile.user.profile.position}</Text>
              <Text type="secondary">•</Text>
              <Text type="secondary">Empleado: {teacherProfile.employeeNumber}</Text>
            </Space>
            <div>
              {teacherProfile.specialties.map(specialty => (
                <span 
                  key={specialty}
                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mt-1"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Mis Clases"
              value={stats.totalClasses}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Estudiantes"
              value={stats.totalStudents}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Asignaturas"
              value={stats.totalSubjects}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Horas Semanales"
              value={stats.totalAssignments}
              suffix="h"
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* My Classes */}
        <Col xs={24} lg={8}>
          <Card 
            title="Mis Clases" 
            extra={
              <Button type="primary" icon={<PlusOutlined />} size="small">
                Nueva Evaluación
              </Button>
            }
          >
            <List
              dataSource={classes}
              locale={{
                emptyText: (
                  <div className="text-center py-8">
                    <BookOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                    <div className="mt-4">
                      <Text type="secondary">No tienes clases asignadas como tutor</Text>
                    </div>
                  </div>
                )
              }}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="link" icon={<EyeOutlined />} size="small">
                      Ver
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: '#1890ff' }}>
                        {item.name.charAt(0)}
                      </Avatar>
                    }
                    title={item.name}
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary">{item.course}</Text>
                        <Text className="text-sm">{item.students} estudiantes</Text>
                        <Text className="text-xs text-gray-400">{item.academicYear}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* My Subjects */}
        <Col xs={24} lg={8}>
          <Card 
            title="Mis Asignaturas" 
            extra={
              <Button type="primary" icon={<PlusOutlined />} size="small">
                Ver Horario
              </Button>
            }
          >
            <List
              dataSource={teacherSubjects}
              locale={{
                emptyText: (
                  <div className="text-center py-8">
                    <BookOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                    <div className="mt-4">
                      <Text type="secondary">No tienes asignaturas asignadas</Text>
                    </div>
                  </div>
                )
              }}
              renderItem={(assignment) => (
                <List.Item
                  actions={[
                    <Button type="link" icon={<EyeOutlined />} size="small">
                      Ver
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: '#722ed1' }}>
                        {assignment.subject.code}
                      </Avatar>
                    }
                    title={assignment.subject.name}
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary">{assignment.classGroup.name}</Text>
                        <Text className="text-sm">{assignment.weeklyHours}h semanales</Text>
                        <Text className="text-xs text-gray-400">{assignment.academicYear.name}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Attendance Notifications and Progress */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" className="w-full">
            {/* Attendance Requests */}
            <Card 
              title={
                <Space>
                  <BellOutlined />
                  Solicitudes de Asistencia
                  {pendingRequests.length > 0 && (
                    <Badge count={pendingRequests.length} size="small" />
                  )}
                </Space>
              }
              extra={
                <Button 
                  type="primary" 
                  size="small" 
                  onClick={() => navigate('/teacher/attendance')}
                >
                  Ver Todas
                </Button>
              }
              loading={loadingRequests}
            >
              {pendingRequests.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircleOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
                  <div className="mt-2">
                    <Text type="secondary">No hay solicitudes pendientes</Text>
                  </div>
                </div>
              ) : (
                <List
                  dataSource={pendingRequests.slice(0, 3)}
                  renderItem={(request) => (
                    <List.Item
                      actions={[
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<CheckCircleOutlined />}
                          onClick={() => handleQuickReviewRequest(request.id, 'approved')}
                          style={{ color: '#52c41a' }}
                        >
                          Aprobar
                        </Button>,
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<CloseCircleOutlined />}
                          onClick={() => handleQuickReviewRequest(request.id, 'rejected')}
                          danger
                        >
                          Rechazar
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar style={{ backgroundColor: '#faad14' }}>
                            <ClockCircleOutlined />
                          </Avatar>
                        }
                        title={`${request.student?.user?.profile?.firstName} ${request.student?.user?.profile?.lastName}`}
                        description={
                          <Space direction="vertical" size="small">
                            <Space>
                              <Tag color="blue">
                                {request.type === 'absence' ? 'Ausencia' :
                                 request.type === 'late_arrival' ? 'Retraso' : 'Salida Anticipada'}
                              </Tag>
                              <Text type="secondary" className="text-xs">
                                {new Date(request.date).toLocaleDateString()}
                              </Text>
                            </Space>
                            <Text className="text-xs" ellipsis title={request.reason}>
                              {request.reason}
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>

            {/* Evaluation Progress */}
            <Card title="Progreso de Evaluaciones">
              <Space direction="vertical" className="w-full">
                <div>
                  <div className="flex justify-between mb-1">
                    <Text>Primer Trimestre</Text>
                    <Text strong>89%</Text>
                  </div>
                  <Progress percent={89} status="success" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <Text>Segundo Trimestre</Text>
                    <Text strong>45%</Text>
                  </div>
                  <Progress percent={45} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <Text>Tercer Trimestre</Text>
                    <Text strong>0%</Text>
                  </div>
                  <Progress percent={0} />
                </div>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Recent Evaluations */}
      <Card title="Evaluaciones Recientes">
        <List
          dataSource={recentEvaluations}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="link" size="small">
                  {item.status === 'completed' ? 'Ver' : 'Continuar'}
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar style={{ 
                    backgroundColor: 
                      item.status === 'completed' ? '#52c41a' : 
                      item.status === 'pending' ? '#faad14' : '#d9d9d9' 
                  }}>
                    {item.student.charAt(0)}
                  </Avatar>
                }
                title={item.student}
                description={
                  <Space>
                    <Text type="secondary">{item.class}</Text>
                    <Text type="secondary">•</Text>
                    <Text type="secondary">{item.subject}</Text>
                    <Text type="secondary">•</Text>
                    <Text type="secondary">{item.date}</Text>
                    <Text 
                      className={`px-2 py-1 rounded text-xs ${
                        item.status === 'completed' ? 'bg-green-100 text-green-800' :
                        item.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.status === 'completed' ? 'Completada' :
                       item.status === 'pending' ? 'Pendiente' : 'Borrador'}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Tasks Analytics Card */}
      <Card 
        title="Dashboard de Tareas" 
        extra={
          <Button 
            type="primary" 
            size="small"
            onClick={() => navigate('/teacher/tasks-dashboard')}
          >
            Ver Dashboard
          </Button>
        }
        style={{ marginTop: 16 }}
      >
        <div className="text-center py-4">
          <BookOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
          <div className="mt-2">
            <Text>Estadísticas avanzadas y seguimiento de tareas</Text>
          </div>
          <div className="mt-2">
            <Space>
              <Button type="link" onClick={() => navigate('/teacher/tasks')}>
                Gestionar Tareas
              </Button>
              <Button type="link" onClick={() => navigate('/teacher/tasks-dashboard')}>
                Ver Analytics
              </Button>
            </Space>
          </div>
        </div>
      </Card>
    </div>
  )
}

const TeacherDashboard: React.FC = () => {
  return (
    <Routes>
      <Route index element={<TeacherDashboardHome />} />
      <Route path="schedule" element={<TeacherSchedulePage />} />
      <Route path="attendance" element={<AttendancePage />} />
      <Route path="activities" element={<ActivitiesPage />} />
      <Route path="tasks" element={<TasksPage />} />
      <Route path="tasks-dashboard" element={<TasksDashboard />} />
      <Route path="tasks/:taskId/submissions/:submissionId/grade" element={<TaskGradingPage />} />
      <Route path="messages" element={<MessagesPage />} />
      {/* Add more teacher routes here */}
    </Routes>
  )
}

export default TeacherDashboard