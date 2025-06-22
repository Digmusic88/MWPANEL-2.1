import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Card, Row, Col, Statistic, Typography, Space, List, Avatar, Progress, Button } from 'antd'
import {
  TeamOutlined,
  FileTextOutlined,
  BookOutlined,
  CalendarOutlined,
  PlusOutlined,
  EyeOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const TeacherDashboardHome: React.FC = () => {
  // Mock data - replace with real API calls
  const stats = {
    totalClasses: 6,
    totalStudents: 145,
    pendingEvaluations: 23,
    completedEvaluations: 87,
  }

  const classes = [
    { id: 1, name: '3º A Primaria', subject: 'Matemáticas', students: 24 },
    { id: 2, name: '3º B Primaria', subject: 'Matemáticas', students: 23 },
    { id: 3, name: '4º A Primaria', subject: 'Matemáticas', students: 25 },
    { id: 4, name: '4º B Primaria', subject: 'Matemáticas', students: 24 },
    { id: 5, name: '5º A Primaria', subject: 'Matemáticas', students: 26 },
    { id: 6, name: '5º B Primaria', subject: 'Matemáticas', students: 23 },
  ]

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
        <Text type="secondary">
          Gestiona tus clases y evaluaciones
        </Text>
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
              title="Evaluaciones Pendientes"
              value={stats.pendingEvaluations}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Evaluaciones Completadas"
              value={stats.completedEvaluations}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* My Classes */}
        <Col xs={24} lg={12}>
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
                        <Text type="secondary">{item.subject}</Text>
                        <Text className="text-sm">{item.students} estudiantes</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Progress and Schedule */}
        <Col xs={24} lg={12}>
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
      {/* Add more teacher routes here */}
    </Routes>
  )
}

export default TeacherDashboard