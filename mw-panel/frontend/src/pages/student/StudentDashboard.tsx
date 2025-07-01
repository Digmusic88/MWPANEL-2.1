import React from 'react'
import { Routes, Route } from 'react-router-dom'
import TasksPage from './TasksPage'
import StudentGradesPage from './StudentGradesPage'
import StudentCalendarPage from './StudentCalendarPage'
import ProfilePage from './ProfilePage'
import SettingsPage from './SettingsPage'
import CalendarWidget from '@components/calendar/CalendarWidget'
import { Card, Row, Col, Statistic, Typography, Space, Progress, List, Avatar } from 'antd'
import {
  TrophyOutlined,
  BookOutlined,
  CalendarOutlined,
  FileTextOutlined,
  StarOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const StudentDashboardHome: React.FC = () => {
  // Mock data - replace with real API calls
  const stats = {
    overallGrade: 8.7,
    completedAssignments: 45,
    pendingAssignments: 3,
    attendance: 96,
  }

  const subjects = [
    { name: 'Matemáticas', grade: 9.2, progress: 85, teacher: 'María García' },
    { name: 'Lengua Castellana', grade: 8.8, progress: 90, teacher: 'Ana López' },
    { name: 'Ciencias Naturales', grade: 8.5, progress: 78, teacher: 'Carlos Ruiz' },
    { name: 'Historia', grade: 9.0, progress: 82, teacher: 'Laura Martín' },
    { name: 'Inglés', grade: 8.3, progress: 88, teacher: 'John Smith' },
    { name: 'Educación Física', grade: 9.5, progress: 95, teacher: 'Pedro Sánchez' },
  ]

  const recentGrades = [
    { subject: 'Matemáticas', assignment: 'Examen Tema 4: Fracciones', grade: 9.5, date: '2024-01-15' },
    { subject: 'Lengua', assignment: 'Redacción: Mi familia', grade: 8.0, date: '2024-01-14' },
    { subject: 'Ciencias', assignment: 'Práctica: El agua', grade: 8.8, date: '2024-01-12' },
    { subject: 'Historia', assignment: 'Trabajo: La Edad Media', grade: 9.2, date: '2024-01-10' },
  ]

  const schedule = [
    { time: '09:00 - 10:00', subject: 'Matemáticas', teacher: 'María García', room: 'Aula 12' },
    { time: '10:00 - 11:00', subject: 'Lengua Castellana', teacher: 'Ana López', room: 'Aula 12' },
    { time: '11:30 - 12:30', subject: 'Ciencias Naturales', teacher: 'Carlos Ruiz', room: 'Lab 1' },
    { time: '12:30 - 13:30', subject: 'Educación Física', teacher: 'Pedro Sánchez', room: 'Gimnasio' },
  ]

  const getGradeColor = (grade: number) => {
    if (grade >= 9) return '#52c41a'
    if (grade >= 7) return '#1890ff'
    if (grade >= 5) return '#faad14'
    return '#f5222d'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Title level={2} className="!mb-2">
          Mi Panel Estudiantil
        </Title>
        <Text type="secondary">
          Consulta tu progreso académico y calificaciones
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Nota Media"
              value={stats.overallGrade}
              precision={1}
              prefix={<TrophyOutlined />}
              suffix="/ 10"
              valueStyle={{ color: getGradeColor(stats.overallGrade) }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Asignaturas"
              value={subjects.length}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tareas Pendientes"
              value={stats.pendingAssignments}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Asistencia"
              value={stats.attendance}
              prefix={<CalendarOutlined />}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Calendar Widget */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <CalendarWidget 
            userRole="student"
            height={700}
            showEventList={true}
            maxEvents={5}
          />
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Subject Progress */}
        <Col xs={24} lg={12}>
          <Card title="Progreso por Asignatura">
            <Space direction="vertical" className="w-full">
              {subjects.map((subject, index) => (
                <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <Text strong>{subject.name}</Text>
                      <div className="text-sm text-gray-500">{subject.teacher}</div>
                    </div>
                    <div className="text-right">
                      <div 
                        className="text-lg font-bold"
                        style={{ color: getGradeColor(subject.grade) }}
                      >
                        {subject.grade}
                      </div>
                      <div className="text-xs text-gray-500">Nota</div>
                    </div>
                  </div>
                  <Progress 
                    percent={subject.progress} 
                    strokeColor={getGradeColor(subject.grade)}
                    size="small"
                  />
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        {/* Schedule and Recent Grades */}
        <Col xs={24} lg={12}>
          <Space direction="vertical" size="large" className="w-full">
            {/* Today's Schedule */}
            <Card title="Horario de Hoy" extra={<ClockCircleOutlined />}>
              <Space direction="vertical" className="w-full">
                {schedule.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-center min-w-[80px]">
                      <div className="text-sm font-bold text-blue-600">{item.time}</div>
                    </div>
                    <div className="flex-1">
                      <Text strong>{item.subject}</Text>
                      <div className="text-sm text-gray-500">
                        {item.teacher} • {item.room}
                      </div>
                    </div>
                  </div>
                ))}
              </Space>
            </Card>

            {/* Competency Progress */}
            <Card title="Competencias Clave">
              <Space direction="vertical" className="w-full">
                <div>
                  <div className="flex justify-between mb-1">
                    <Text>Competencia Matemática</Text>
                    <Text strong>8.9</Text>
                  </div>
                  <Progress percent={89} strokeColor="#52c41a" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <Text>Competencia Lingüística</Text>
                    <Text strong>8.5</Text>
                  </div>
                  <Progress percent={85} strokeColor="#1890ff" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <Text>Competencia Digital</Text>
                    <Text strong>8.2</Text>
                  </div>
                  <Progress percent={82} strokeColor="#722ed1" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <Text>Competencia Social</Text>
                    <Text strong>9.1</Text>
                  </div>
                  <Progress percent={91} strokeColor="#f5222d" />
                </div>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Recent Grades */}
      <Card title="Calificaciones Recientes" extra={<StarOutlined />}>
        <List
          dataSource={recentGrades}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    style={{ backgroundColor: getGradeColor(item.grade) }}
                  >
                    {item.grade}
                  </Avatar>
                }
                title={item.assignment}
                description={
                  <Space>
                    <Text type="secondary">{item.subject}</Text>
                    <Text type="secondary">•</Text>
                    <Text type="secondary">{item.date}</Text>
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

const StudentDashboard: React.FC = () => {
  return (
    <Routes>
      <Route index element={<StudentDashboardHome />} />
      <Route path="tasks" element={<TasksPage />} />
      <Route path="grades" element={<StudentGradesPage />} />
      <Route path="calendar" element={<StudentCalendarPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Routes>
  )
}

export default StudentDashboard