import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import StudentsPage from './StudentsPage'
import TeachersPage from './TeachersPage'
import FamiliesPage from './FamiliesPage'
import ClassGroupsPage from './ClassGroupsPage'
import EnrollmentPage from './EnrollmentPage'
import { Card, Row, Col, Statistic, Typography, Space, Progress, Spin, message } from 'antd'
import apiClient from '@services/apiClient'
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  FileTextOutlined,
  TrophyOutlined,
  RiseOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

interface DashboardStats {
  totalStudents: number
  totalTeachers: number
  totalClasses: number
  completedEvaluations: number
  pendingEvaluations: number
  averageGrade: number
  levelDistribution: {
    infantil: number
    primaria: number
    secundaria: number
    other: number
  }
  lastUpdated: string
}

const AdminDashboardHome: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/dashboard/stats')
      setStats(response.data)
    } catch (error) {
      message.error('Error al cargar estadísticas del dashboard')
      console.error('Dashboard stats error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center p-8">
        <Typography.Text type="secondary">
          Error al cargar las estadísticas del dashboard
        </Typography.Text>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="!mb-2">
            Panel de Administración
          </Title>
          <Text type="secondary">
            Resumen general del sistema educativo
          </Text>
        </div>
        <div className="text-right">
          <Text type="secondary" className="text-sm">
            Última actualización: {new Date(stats.lastUpdated).toLocaleString('es-ES')}
          </Text>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Estudiantes"
              value={stats.totalStudents}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Profesores"
              value={stats.totalTeachers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Clases Activas"
              value={stats.totalClasses}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Promedio General"
              value={stats.averageGrade}
              precision={1}
              prefix={<TrophyOutlined />}
              suffix="/ 10"
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Estado de Evaluaciones" extra={<RiseOutlined />}>
            <Space direction="vertical" className="w-full">
              <div>
                <div className="flex justify-between mb-1">
                  <Text>Evaluaciones Completadas</Text>
                  <Text strong>{stats.completedEvaluations}</Text>
                </div>
                <Progress 
                  percent={Math.round((stats.completedEvaluations / (stats.completedEvaluations + stats.pendingEvaluations)) * 100)} 
                  status="success" 
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <Text>Evaluaciones Pendientes</Text>
                  <Text strong>{stats.pendingEvaluations}</Text>
                </div>
                <Progress 
                  percent={Math.round((stats.pendingEvaluations / (stats.completedEvaluations + stats.pendingEvaluations)) * 100)} 
                  status="exception" 
                />
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Distribución por Nivel Educativo">
            <Space direction="vertical" className="w-full">
              {stats.totalStudents > 0 ? (
                <>
                  <div>
                    <div className="flex justify-between mb-1">
                      <Text>Educación Infantil</Text>
                      <Text strong>{stats.levelDistribution.infantil} estudiante(s)</Text>
                    </div>
                    <Progress 
                      percent={Math.round((stats.levelDistribution.infantil / stats.totalStudents) * 100)} 
                      strokeColor="#52c41a" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <Text>Educación Primaria</Text>
                      <Text strong>{stats.levelDistribution.primaria} estudiante(s)</Text>
                    </div>
                    <Progress 
                      percent={Math.round((stats.levelDistribution.primaria / stats.totalStudents) * 100)} 
                      strokeColor="#1890ff" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <Text>Educación Secundaria</Text>
                      <Text strong>{stats.levelDistribution.secundaria} estudiante(s)</Text>
                    </div>
                    <Progress 
                      percent={Math.round((stats.levelDistribution.secundaria / stats.totalStudents) * 100)} 
                      strokeColor="#722ed1" 
                    />
                  </div>
                  {stats.levelDistribution.other > 0 && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <Text>Sin nivel asignado</Text>
                        <Text strong>{stats.levelDistribution.other} estudiante(s)</Text>
                      </div>
                      <Progress 
                        percent={Math.round((stats.levelDistribution.other / stats.totalStudents) * 100)} 
                        strokeColor="#ffa940" 
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Text type="secondary">No hay estudiantes registrados aún</Text>
                </div>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Card title="Actividad Reciente">
        <Space direction="vertical" className="w-full">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <FileTextOutlined className="text-blue-600" />
            <div>
              <Text strong>Nueva evaluación completada</Text>
              <div className="text-sm text-gray-500">
                María García evaluó a 3º de Primaria - hace 2 horas
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <UserOutlined className="text-green-600" />
            <div>
              <Text strong>Nuevo estudiante registrado</Text>
              <div className="text-sm text-gray-500">
                Juan Pérez se unió a 1º de Secundaria - hace 4 horas
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <TeamOutlined className="text-purple-600" />
            <div>
              <Text strong>Profesor asignado</Text>
              <div className="text-sm text-gray-500">
                Ana López asignada a Matemáticas 2º ESO - hace 1 día
              </div>
            </div>
          </div>
        </Space>
      </Card>
    </div>
  )
}

const AdminDashboard: React.FC = () => {
  return (
    <div>
      <Routes>
        <Route index element={<AdminDashboardHome />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="families" element={<FamiliesPage />} />
        <Route path="class-groups" element={<ClassGroupsPage />} />
        <Route path="enrollment" element={<EnrollmentPage />} />
        <Route path="*" element={
          <div style={{ padding: '20px', backgroundColor: '#ffcccc', border: '2px solid orange' }}>
            <h1>RUTA NO ENCONTRADA EN ADMIN</h1>
            <p>Ruta actual: {window.location.pathname}</p>
            <p>No se encontró ninguna ruta que coincida.</p>
          </div>
        } />
      </Routes>
    </div>
  )
}

export default AdminDashboard