import React, { useState, useEffect } from 'react'
import {
  Card,
  List,
  Typography,
  Space,
  Select,
  Avatar,
  Tag,
  Empty,
  Spin,
  Row,
  Col,
  Statistic,
  Progress,
  message,
  Radio,
  Badge,
  Collapse,
} from 'antd'
import {
  SmileOutlined,
  MehOutlined,
  FrownOutlined,
  BookOutlined,
  TrophyOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import apiClient from '@services/apiClient'

const { Title, Text } = Typography
const { Option } = Select
const { Panel } = Collapse

interface ActivityAssessment {
  id: string
  value: string
  comment?: string
  isAssessed: boolean
  assessedAt: string
  notifiedAt: string
  activity: {
    id: string
    name: string
    description?: string
    assignedDate: string
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
      id: string
      user: {
        profile: {
          firstName: string
          lastName: string
        }
      }
    }
  }
  student: {
    id: string
    user: {
      profile: {
        firstName: string
        lastName: string
      }
    }
  }
}

interface Student {
  id: string
  enrollmentNumber: string
  user: {
    profile: {
      firstName: string
      lastName: string
    }
  }
}

interface ActivityStats {
  totalActivities: number
  happyCount: number
  neutralCount: number
  sadCount: number
  averageScore: number
  thisWeekActivities: number
  lastActivityDate?: string
}

interface SubjectGroup {
  subjectCode: string
  subjectName: string
  classGroupName: string
  activities: ActivityAssessment[]
  stats: {
    total: number
    completed: number
    pending: number
    happy: number
    neutral: number
    sad: number
    averageScore?: number
  }
}

interface ViewState {
  mode: 'list' | 'subjects'
  selectedSubject: string | null
}

const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<ActivityAssessment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<ActivityStats | null>(null)
  const [limit, setLimit] = useState(10)
  
  // Nuevos estados para vista por asignaturas
  const [viewState, setViewState] = useState<ViewState>({ mode: 'subjects', selectedSubject: null })
  const [subjectGroups, setSubjectGroups] = useState<SubjectGroup[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    if (selectedStudent || students.length === 1) {
      const studentId = selectedStudent || students[0]?.id
      if (studentId) {
        if (viewState.mode === 'list') {
          fetchActivities(studentId)
          calculateStats(studentId)
        } else {
          fetchActivitiesBySubjects(studentId)
        }
      }
    }
  }, [selectedStudent, students, limit, viewState.mode])

  const fetchStudents = async () => {
    try {
      const response = await apiClient.get('/families/my-children')
      setStudents(response.data)
      
      // Auto-seleccionar si solo hay un estudiante
      if (response.data.length === 1) {
        setSelectedStudent(response.data[0].id)
      }
    } catch (error: any) {
      console.error('Error fetching students:', error)
      message.error('Error al cargar estudiantes')
    }
  }

  const fetchActivities = async (studentId: string) => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/activities/family/activities?studentId=${studentId}&limit=${limit}`)
      setActivities(response.data)
    } catch (error: any) {
      console.error('Error fetching activities:', error)
      message.error('Error al cargar actividades')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (studentId: string) => {
    if (activities.length === 0) return

    const currentStudentActivities = activities.filter(a => a.student.id === studentId)
    
    const happyCount = currentStudentActivities.filter(a => a.value === 'happy').length
    const neutralCount = currentStudentActivities.filter(a => a.value === 'neutral').length
    const sadCount = currentStudentActivities.filter(a => a.value === 'sad').length
    
    // Calcular promedio de puntuaciones numéricas
    const scoreActivities = currentStudentActivities.filter(a => 
      a.activity.valuationType === 'score' && a.value && !isNaN(parseFloat(a.value))
    )
    const averageScore = scoreActivities.length > 0 
      ? scoreActivities.reduce((sum, a) => sum + parseFloat(a.value), 0) / scoreActivities.length
      : 0

    // Actividades de esta semana
    const oneWeekAgo = dayjs().subtract(7, 'days')
    const thisWeekActivities = currentStudentActivities.filter(a => 
      dayjs(a.assessedAt).isAfter(oneWeekAgo)
    ).length

    // Última actividad
    const sortedActivities = currentStudentActivities.sort((a, b) => 
      dayjs(b.assessedAt).unix() - dayjs(a.assessedAt).unix()
    )
    const lastActivityDate = sortedActivities[0]?.assessedAt

    setStats({
      totalActivities: currentStudentActivities.length,
      happyCount,
      neutralCount,
      sadCount,
      averageScore,
      thisWeekActivities,
      lastActivityDate,
    })
  }

  const fetchActivitiesBySubjects = async (studentId: string) => {
    try {
      setLoadingSubjects(true)
      // Obtener todas las actividades del estudiante sin límite para agrupación
      const response = await apiClient.get(`/activities/family/activities?studentId=${studentId}&limit=1000`)
      const allActivities: ActivityAssessment[] = response.data

      // Agrupar por asignatura
      const grouped = allActivities.reduce((acc: { [key: string]: SubjectGroup }, activity) => {
        if (!activity.activity.subjectAssignment) return acc

        const subjectCode = activity.activity.subjectAssignment.subject.code
        const subjectName = activity.activity.subjectAssignment.subject.name
        const classGroupName = activity.activity.subjectAssignment.classGroup.name

        if (!acc[subjectCode]) {
          acc[subjectCode] = {
            subjectCode,
            subjectName,
            classGroupName,
            activities: [],
            stats: {
              total: 0,
              completed: 0,
              pending: 0,
              happy: 0,
              neutral: 0,
              sad: 0,
              averageScore: 0
            }
          }
        }

        acc[subjectCode].activities.push(activity)
        return acc
      }, {})

      // Calcular estadísticas para cada asignatura
      const subjectGroupsArray = Object.values(grouped).map(group => {
        const activities = group.activities
        const completed = activities.filter(a => a.isAssessed).length
        const pending = activities.length - completed
        const happy = activities.filter(a => a.value === 'happy').length
        const neutral = activities.filter(a => a.value === 'neutral').length
        const sad = activities.filter(a => a.value === 'sad').length
        
        // Calcular promedio de puntuaciones numéricas
        const scoreActivities = activities.filter(a => 
          a.activity.valuationType === 'score' && a.value && !isNaN(parseFloat(a.value))
        )
        const averageScore = scoreActivities.length > 0 
          ? scoreActivities.reduce((sum, a) => sum + parseFloat(a.value), 0) / scoreActivities.length
          : undefined

        return {
          ...group,
          activities: activities.sort((a, b) => dayjs(b.assessedAt).unix() - dayjs(a.assessedAt).unix()),
          stats: {
            total: activities.length,
            completed,
            pending,
            happy,
            neutral,
            sad,
            averageScore
          }
        }
      })

      // Ordenar por nombre de asignatura
      subjectGroupsArray.sort((a, b) => a.subjectName.localeCompare(b.subjectName))
      setSubjectGroups(subjectGroupsArray)

    } catch (error: any) {
      console.error('Error fetching activities by subjects:', error)
      message.error('Error al cargar actividades por asignaturas')
    } finally {
      setLoadingSubjects(false)
    }
  }

  const getEmojiIcon = (value: string, size = 16) => {
    const style = { fontSize: `${size}px` }
    switch (value) {
      case 'happy': return <SmileOutlined style={{ ...style, color: '#52c41a' }} />
      case 'neutral': return <MehOutlined style={{ ...style, color: '#faad14' }} />
      case 'sad': return <FrownOutlined style={{ ...style, color: '#ff4d4f' }} />
      default: return <SmileOutlined style={{ ...style, color: '#d9d9d9' }} />
    }
  }

  const getEmojiText = (value: string) => {
    switch (value) {
      case 'happy': return 'Excelente'
      case 'neutral': return 'Incompleta'
      case 'sad': return 'No entregada'
      default: return 'Sin valorar'
    }
  }

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return '#52c41a'
    if (percentage >= 60) return '#faad14'
    return '#ff4d4f'
  }

  const selectedStudentName = students.find(s => s.id === selectedStudent)?.user.profile
  const currentStudentActivities = activities.filter(a => 
    !selectedStudent || a.student.id === selectedStudent
  )

  return (
    <div className="activities-page">
      <Row gutter={[16, 16]} className="mb-6">
        {/* Header con selector de estudiante */}
        <Col span={24}>
          <Card>
            <Row gutter={16} align="middle">
              <Col xs={24} md={12}>
                <Space>
                  <BookOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                  <div>
                    <Title level={4} style={{ margin: 0 }}>Actividades Diarias</Title>
                    <Text type="secondary">Seguimiento del progreso académico diario</Text>
                  </div>
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Space direction="vertical" className="w-full">
                  {students.length > 1 && (
                    <Select
                      style={{ width: '100%' }}
                      placeholder="Seleccionar hijo/a"
                      value={selectedStudent}
                      onChange={setSelectedStudent}
                    >
                      {students.map(student => (
                        <Option key={student.id} value={student.id}>
                          <Space>
                            <Avatar icon={<UserOutlined />} />
                            {student.user.profile.firstName} {student.user.profile.lastName}
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  )}
                  <Radio.Group 
                    value={viewState.mode} 
                    onChange={(e) => setViewState({ mode: e.target.value, selectedSubject: null })}
                    buttonStyle="solid"
                    className="w-full"
                  >
                    <Radio.Button value="subjects" className="w-1/2 text-center">
                      <AppstoreOutlined /> Por Asignaturas
                    </Radio.Button>
                    <Radio.Button value="list" className="w-1/2 text-center">
                      <UnorderedListOutlined /> Lista Completa
                    </Radio.Button>
                  </Radio.Group>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Estadísticas */}
        {stats && selectedStudentName && (
          <>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Total Actividades"
                  value={stats.totalActivities}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Esta Semana"
                  value={stats.thisWeekActivities}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Valoraciones Positivas"
                  value={stats.happyCount}
                  prefix={<SmileOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Promedio Puntuación"
                  value={stats.averageScore}
                  precision={1}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </>
        )}
      </Row>

      {/* Distribución de valoraciones */}
      {stats && (stats.happyCount + stats.neutralCount + stats.sadCount) > 0 && (
        <Row gutter={16} className="mb-6">
          <Col span={24}>
            <Card title="Distribución de Valoraciones">
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <div className="text-center">
                    <div className="mb-2">
                      <SmileOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
                    </div>
                    <Statistic
                      title="Excelente"
                      value={stats.happyCount}
                      valueStyle={{ color: '#52c41a' }}
                    />
                    <Progress 
                      percent={Math.round((stats.happyCount / stats.totalActivities) * 100)}
                      strokeColor="#52c41a"
                      showInfo={false}
                      size="small"
                    />
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div className="text-center">
                    <div className="mb-2">
                      <MehOutlined style={{ fontSize: '32px', color: '#faad14' }} />
                    </div>
                    <Statistic
                      title="Incompleta"
                      value={stats.neutralCount}
                      valueStyle={{ color: '#faad14' }}
                    />
                    <Progress 
                      percent={Math.round((stats.neutralCount / stats.totalActivities) * 100)}
                      strokeColor="#faad14"
                      showInfo={false}
                      size="small"
                    />
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div className="text-center">
                    <div className="mb-2">
                      <FrownOutlined style={{ fontSize: '32px', color: '#ff4d4f' }} />
                    </div>
                    <Statistic
                      title="No entregada"
                      value={stats.sadCount}
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                    <Progress 
                      percent={Math.round((stats.sadCount / stats.totalActivities) * 100)}
                      strokeColor="#ff4d4f"
                      showInfo={false}
                      size="small"
                    />
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )}

      {/* Vista por asignaturas */}
      {viewState.mode === 'subjects' && (
        <Row gutter={16}>
          <Col span={24}>
            <Card 
              title={
                <Space>
                  <AppstoreOutlined />
                  Actividades por Asignatura
                  {selectedStudentName && (
                    <Tag color="blue">
                      {selectedStudentName.firstName} {selectedStudentName.lastName}
                    </Tag>
                  )}
                </Space>
              }
            >
              {loadingSubjects ? (
                <div className="text-center py-8">
                  <Spin size="large" />
                </div>
              ) : subjectGroups.length > 0 ? (
                <Collapse defaultActiveKey={subjectGroups.slice(0, 2).map(g => g.subjectCode)} className="mb-4">
                  {subjectGroups.map((subjectGroup) => (
                    <Panel
                      key={subjectGroup.subjectCode}
                      header={
                        <div className="flex justify-between items-center w-full">
                          <Space>
                            <Avatar 
                              style={{ backgroundColor: '#1890ff' }}
                              icon={<BookOutlined />}
                              size="small"
                            />
                            <div>
                              <Text strong>{subjectGroup.subjectName}</Text>
                              <br />
                              <Text type="secondary" className="text-xs">
                                {subjectGroup.subjectCode} • {subjectGroup.classGroupName}
                              </Text>
                            </div>
                          </Space>
                          <Space>
                            <Badge count={subjectGroup.stats.total} showZero color="#1890ff" />
                            {subjectGroup.stats.pending > 0 && (
                              <Badge count={subjectGroup.stats.pending} showZero color="#faad14" />
                            )}
                            <div className="text-right">
                              <div className="flex gap-1">
                                <span className="text-green-500">😊{subjectGroup.stats.happy}</span>
                                <span className="text-orange-500">😐{subjectGroup.stats.neutral}</span>
                                <span className="text-red-500">😞{subjectGroup.stats.sad}</span>
                              </div>
                            </div>
                          </Space>
                        </div>
                      }
                    >
                      <List
                        dataSource={subjectGroup.activities}
                        renderItem={(assessment) => (
                          <List.Item className="hover:bg-gray-50 transition-colors duration-200">
                            <List.Item.Meta
                              avatar={
                                <div className="flex flex-col items-center">
                                  <div className="text-center">
                                    {assessment.activity.valuationType === 'emoji' ? (
                                      getEmojiIcon(assessment.value, 24)
                                    ) : (
                                      <div 
                                        style={{ 
                                          color: getScoreColor(
                                            parseFloat(assessment.value), 
                                            assessment.activity.maxScore || 10
                                          ),
                                          fontWeight: 'bold',
                                          fontSize: '16px'
                                        }}
                                      >
                                        {assessment.value}/{assessment.activity.maxScore}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              }
                              title={
                                <Space direction="vertical" style={{ width: '100%' }}>
                                  <div className="flex justify-between items-start">
                                    <Text strong className="text-lg">
                                      {assessment.activity.name}
                                    </Text>
                                    <Space>
                                      {assessment.activity.valuationType === 'emoji' ? (
                                        <Tag color={
                                          assessment.value === 'happy' ? 'green' :
                                          assessment.value === 'neutral' ? 'orange' : 'red'
                                        }>
                                          {getEmojiText(assessment.value)}
                                        </Tag>
                                      ) : (
                                        <Tag color="blue">
                                          Puntuación: {assessment.value}/{assessment.activity.maxScore}
                                        </Tag>
                                      )}
                                    </Space>
                                  </div>
                                  
                                  {assessment.activity.description && (
                                    <Text type="secondary" className="text-sm">
                                      {assessment.activity.description}
                                    </Text>
                                  )}
                                </Space>
                              }
                              description={
                                <Space direction="vertical" style={{ width: '100%' }}>
                                  <Row gutter={16}>
                                    <Col xs={24} sm={12}>
                                      <Space size="small">
                                        <UserOutlined style={{ color: '#1890ff' }} />
                                        <Text type="secondary">
                                          Prof. {assessment.activity.teacher.user.profile.firstName} {assessment.activity.teacher.user.profile.lastName}
                                        </Text>
                                      </Space>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                      <Space size="small">
                                        <CalendarOutlined style={{ color: '#52c41a' }} />
                                        <Text type="secondary">
                                          {dayjs(assessment.assessedAt).format('DD/MM/YYYY HH:mm')}
                                        </Text>
                                      </Space>
                                    </Col>
                                  </Row>
                                  
                                  {assessment.comment && (
                                    <div className="bg-gray-50 p-2 rounded mt-2">
                                      <Text className="text-sm italic">
                                        💬 "{assessment.comment}"
                                      </Text>
                                    </div>
                                  )}
                                </Space>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </Panel>
                  ))}
                </Collapse>
              ) : (
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No hay actividades por asignaturas"
                />
              )}
            </Card>
          </Col>
        </Row>
      )}

      {/* Vista lista completa */}
      {viewState.mode === 'list' && (
        <Row gutter={16}>
          <Col span={24}>
            <Card 
              title={
                <Space>
                  <ClockCircleOutlined />
                  Actividades Recientes
                  {selectedStudentName && (
                    <Tag color="blue">
                      {selectedStudentName.firstName} {selectedStudentName.lastName}
                    </Tag>
                  )}
                </Space>
              }
              extra={
                <Space>
                  <Text type="secondary">Mostrar:</Text>
                  <Select
                    size="small"
                    value={limit}
                    onChange={setLimit}
                    style={{ width: 100 }}
                  >
                    <Option value={10}>10</Option>
                    <Option value={20}>20</Option>
                    <Option value={50}>50</Option>
                  </Select>
                </Space>
              }
            >
            {loading ? (
              <div className="text-center py-8">
                <Spin size="large" />
              </div>
            ) : currentStudentActivities.length > 0 ? (
              <List
                dataSource={currentStudentActivities}
                renderItem={(assessment) => (
                  <List.Item
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <List.Item.Meta
                      avatar={
                        <div className="flex flex-col items-center">
                          <Avatar 
                            style={{ 
                              backgroundColor: assessment.activity.valuationType === 'emoji' ? '#52c41a' : '#1890ff',
                              marginBottom: '4px'
                            }}
                            icon={<BookOutlined />}
                          />
                          <div className="text-center">
                            {assessment.activity.valuationType === 'emoji' ? (
                              getEmojiIcon(assessment.value, 20)
                            ) : (
                              <div 
                                style={{ 
                                  color: getScoreColor(
                                    parseFloat(assessment.value), 
                                    assessment.activity.maxScore || 10
                                  ),
                                  fontWeight: 'bold'
                                }}
                              >
                                {assessment.value}/{assessment.activity.maxScore}
                              </div>
                            )}
                          </div>
                        </div>
                      }
                      title={
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div className="flex justify-between items-start">
                            <Text strong className="text-lg">
                              {assessment.activity.name}
                            </Text>
                            <Space>
                              {assessment.activity.valuationType === 'emoji' ? (
                                <Tag color={
                                  assessment.value === 'happy' ? 'green' :
                                  assessment.value === 'neutral' ? 'orange' : 'red'
                                }>
                                  {getEmojiText(assessment.value)}
                                </Tag>
                              ) : (
                                <Tag color="blue">
                                  Puntuación: {assessment.value}/{assessment.activity.maxScore}
                                </Tag>
                              )}
                            </Space>
                          </div>
                          
                          {assessment.activity.description && (
                            <Text type="secondary" className="text-sm">
                              {assessment.activity.description}
                            </Text>
                          )}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" style={{ width: '100%' }}>
                          {assessment.activity.subjectAssignment && (
                            <div className="flex items-center gap-2 mb-2">
                              <Tag color="blue">
                                {assessment.activity.subjectAssignment.subject.code}
                              </Tag>
                              <Text type="secondary" className="text-sm">
                                {assessment.activity.subjectAssignment.subject.name}
                              </Text>
                              <Text type="secondary" className="text-xs">
                                • {assessment.activity.subjectAssignment.classGroup.name}
                              </Text>
                            </div>
                          )}
                          <Row gutter={16}>
                            <Col xs={24} sm={12}>
                              <Space size="small">
                                <UserOutlined style={{ color: '#1890ff' }} />
                                <Text type="secondary">
                                  Prof. {assessment.activity.teacher.user.profile.firstName} {assessment.activity.teacher.user.profile.lastName}
                                </Text>
                              </Space>
                            </Col>
                            <Col xs={24} sm={12}>
                              <Space size="small">
                                <CalendarOutlined style={{ color: '#52c41a' }} />
                                <Text type="secondary">
                                  {dayjs(assessment.activity.assignedDate).format('DD/MM/YYYY')}
                                </Text>
                              </Space>
                            </Col>
                          </Row>
                          
                          <Row gutter={16}>
                            <Col xs={24} sm={12}>
                              <Space size="small">
                                <CheckCircleOutlined style={{ color: '#722ed1' }} />
                                <Text type="secondary">
                                  Valorado: {dayjs(assessment.assessedAt).format('DD/MM/YYYY HH:mm')}
                                </Text>
                              </Space>
                            </Col>
                            <Col xs={24} sm={12}>
                              <Space size="small">
                                <ClockCircleOutlined style={{ color: '#faad14' }} />
                                <Text type="secondary">
                                  Notificado: {dayjs(assessment.notifiedAt).format('DD/MM/YYYY HH:mm')}
                                </Text>
                              </Space>
                            </Col>
                          </Row>

                          {assessment.comment && (
                            <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                              <Text className="text-sm">
                                <strong>Comentario del profesor:</strong>
                              </Text>
                              <div className="mt-1">
                                <Text className="text-sm italic">
                                  "{assessment.comment}"
                                </Text>
                              </div>
                            </div>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                pagination={{
                  pageSize: 5,
                  showSizeChanger: false,
                  showQuickJumper: false,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} de ${total} actividades`,
                }}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Space direction="vertical">
                    <Text type="secondary">No hay actividades valoradas</Text>
                    <Text type="secondary" className="text-sm">
                      Las actividades aparecerán aquí cuando los profesores las valoren
                    </Text>
                  </Space>
                }
              />
            )}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  )
}

export default ActivitiesPage