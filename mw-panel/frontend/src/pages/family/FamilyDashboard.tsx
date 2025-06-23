import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Card, Row, Col, Statistic, Typography, Space, Select, Avatar, Progress, Button, Spin, message, Empty, Alert } from 'antd'
import {
  UserOutlined,
  TrophyOutlined,
  CalendarOutlined,
  FileTextOutlined,
  DownloadOutlined,
  BookOutlined,
} from '@ant-design/icons'
import apiClient from '@services/apiClient'
import MessagesPage from '../communications/MessagesPage'

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
  const [dashboardData, setDashboardData] = useState<FamilyDashboardData | null>(null)
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    fetchDashboardData()
  }, [])

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

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Recent Evaluations */}
        <Col xs={24} lg={12}>
          <Card 
            title="Evaluaciones Recientes"
            extra={
              <Button type="primary" icon={<DownloadOutlined />} size="small">
                Descargar Informe
              </Button>
            }
          >
            {selectedChild.recentEvaluations.length > 0 ? (
              <Space direction="vertical" className="w-full">
                {selectedChild.recentEvaluations.map((evaluation) => (
                  <div key={evaluation.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Text strong>{evaluation.period}</Text>
                        <div className="text-sm text-gray-500">
                          {new Date(evaluation.createdAt).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                      <div className="text-right">
                        <Text className="text-sm text-gray-500">
                          {evaluation.competencyEvaluations.length} competencia(s)
                        </Text>
                      </div>
                    </div>
                    {evaluation.competencyEvaluations.slice(0, 3).map((compEval, index) => (
                      <div key={index} className="flex justify-between items-center py-1">
                        <Text className="text-sm">{compEval.competencyName}</Text>
                        {compEval.displayGrade && (
                          <span 
                            className="text-sm font-medium"
                            style={{ color: getGradeColor(parseFloat(compEval.displayGrade)) }}
                          >
                            {compEval.displayGrade}
                          </span>
                        )}
                        {compEval.score && !compEval.displayGrade && (
                          <span className="text-sm font-medium text-blue-600">
                            {compEval.score}/5
                          </span>
                        )}
                      </div>
                    ))}
                    {evaluation.competencyEvaluations.length > 3 && (
                      <Text type="secondary" className="text-xs">
                        Y {evaluation.competencyEvaluations.length - 3} competencia(s) más...
                      </Text>
                    )}
                  </div>
                ))}
              </Space>
            ) : (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No hay evaluaciones recientes"
              />
            )}
          </Card>
        </Col>

        {/* Student Summary and Actions */}
        <Col xs={24} lg={12}>
          <Space direction="vertical" size="large" className="w-full">
            {/* Student Summary */}
            <Card title="Resumen Académico" extra={<BookOutlined />}>
              <Space direction="vertical" className="w-full">
                <div className="flex justify-between items-center">
                  <Text>Total de Evaluaciones</Text>
                  <Text strong>{selectedChild.stats.totalEvaluations}</Text>
                </div>
                <Progress 
                  percent={selectedChild.stats.totalEvaluations > 0 
                    ? Math.round((selectedChild.stats.completedEvaluations / selectedChild.stats.totalEvaluations) * 100)
                    : 0
                  }
                  strokeColor="#52c41a"
                  format={() => `${selectedChild.stats.completedEvaluations}/${selectedChild.stats.totalEvaluations}`}
                />
                
                <div className="flex justify-between items-center mt-4">
                  <Text>Rendimiento Académico</Text>
                  <Text strong style={{ color: getGradeColor(selectedChild.stats.averageGrade) }}>
                    {selectedChild.stats.averageGrade.toFixed(1)}/10
                  </Text>
                </div>
                <Progress 
                  percent={selectedChild.stats.averageGrade * 10}
                  strokeColor={getGradeColor(selectedChild.stats.averageGrade)}
                />
                
                <div className="flex justify-between items-center mt-4">
                  <Text>Asistencia</Text>
                  <Text strong style={{ color: '#52c41a' }}>
                    {selectedChild.stats.attendance}%
                  </Text>
                </div>
                <Progress 
                  percent={selectedChild.stats.attendance}
                  strokeColor="#52c41a"
                />
              </Space>
            </Card>

            {/* Quick Actions */}
            <Card title="Acciones Rápidas">
              <Space direction="vertical" className="w-full">
                <Button 
                  type="default" 
                  block 
                  icon={<FileTextOutlined />}
                  onClick={() => message.info('Función de comunicaciones en desarrollo')}
                >
                  Ver Comunicaciones
                </Button>
                <Button 
                  type="default" 
                  block 
                  icon={<DownloadOutlined />}
                  onClick={() => message.info('Función de reportes en desarrollo')}
                >
                  Descargar Boletín Completo
                </Button>
                <Button 
                  type="default" 
                  block 
                  icon={<CalendarOutlined />}
                  onClick={() => message.info('Función de calendario en desarrollo')}
                >
                  Ver Calendario Escolar
                </Button>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Competency Progress */}
      <Card title="Evaluación por Competencias">
        {selectedChild.recentEvaluations.length > 0 ? (
          <Row gutter={[16, 16]}>
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
                .slice(0, 4) // Show top 4 competencies
              
              return competencies.map((comp) => (
                <Col xs={24} md={12} lg={6} key={comp.name}>
                  <div className="text-center">
                    <div className="text-lg font-bold mb-2">{comp.name}</div>
                    <Progress 
                      type="circle" 
                      percent={comp.average * 10} 
                      strokeColor={getGradeColor(comp.average)}
                      format={() => comp.average.toFixed(1)}
                    />
                    <div className="text-xs text-gray-500 mt-2">
                      {comp.count} evaluación(es)
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
      {/* Add more family routes here */}
    </Routes>
  )
}

export default FamilyDashboard