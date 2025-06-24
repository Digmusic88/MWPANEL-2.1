import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Card, Row, Col, Statistic, Typography, Space, List, Avatar, Progress, Button, Spin, message, Alert } from 'antd'
import {
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  PlusOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import apiClient from '@services/apiClient'
import TeacherSchedulePage from './TeacherSchedulePage'
import MessagesPage from '../communications/MessagesPage'
import AttendancePage from './AttendancePage'

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
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Real data state
  const [teacherClasses, setTeacherClasses] = useState<any[]>([])
  const [teacherSubjects, setTeacherSubjects] = useState<any[]>([])

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

  useEffect(() => {
    fetchTeacherProfile()
  }, [])

  useEffect(() => {
    if (teacherProfile?.id) {
      fetchTeacherClasses(teacherProfile.id)
      fetchTeacherSubjects(teacherProfile.id)
    }
  }, [teacherProfile])

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

        {/* Progress and Schedule */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" className="w-full">
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

            {/* Schedule Today */}
            <Card title="Horario de Hoy" extra={<CalendarOutlined />}>
              <Space direction="vertical" className="w-full">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">09:00</div>
                    <div className="text-xs text-gray-500">10:00</div>
                  </div>
                  <div>
                    <Text strong>3º A Primaria</Text>
                    <div className="text-sm text-gray-500">Matemáticas - Aula 12</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">11:00</div>
                    <div className="text-xs text-gray-500">12:00</div>
                  </div>
                  <div>
                    <Text strong>4º B Primaria</Text>
                    <div className="text-sm text-gray-500">Matemáticas - Aula 15</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">12:30</div>
                    <div className="text-xs text-gray-500">13:30</div>
                  </div>
                  <div>
                    <Text strong>5º A Primaria</Text>
                    <div className="text-sm text-gray-500">Matemáticas - Aula 18</div>
                  </div>
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
    </div>
  )
}

const TeacherDashboard: React.FC = () => {
  return (
    <Routes>
      <Route index element={<TeacherDashboardHome />} />
      <Route path="schedule" element={<TeacherSchedulePage />} />
      <Route path="attendance" element={<AttendancePage />} />
      <Route path="messages" element={<MessagesPage />} />
      {/* Add more teacher routes here */}
    </Routes>
  )
}

export default TeacherDashboard