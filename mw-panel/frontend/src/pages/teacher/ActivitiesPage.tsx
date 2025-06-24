import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
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
  Tooltip,
  Row,
  Col,
  Statistic,
  DatePicker,
  Radio,
  InputNumber,
  Switch,
  Drawer,
  List,
  Avatar,
  Badge,
  Spin,
  Popconfirm,
  Checkbox,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BookOutlined,
  TrophyOutlined,
  SmileOutlined,
  MehOutlined,
  FrownOutlined,
  CalendarOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import apiClient from '@services/apiClient'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

interface Activity {
  id: string
  name: string
  description?: string
  assignedDate: string
  reviewDate?: string
  valuationType: 'emoji' | 'score'
  maxScore?: number
  notifyFamilies: boolean
  isActive: boolean
  createdAt: string
  classGroup: {
    id: string
    name: string
  }
  assessments: ActivityAssessment[]
}

interface ActivityAssessment {
  id: string
  value?: string
  comment?: string
  isAssessed: boolean
  assessedAt?: string
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

interface ClassGroup {
  id: string
  name: string
}

interface ActivityStatistics {
  activityId: string
  activityName: string
  totalStudents: number
  assessedStudents: number
  pendingStudents: number
  completionPercentage: number
  emojiDistribution?: {
    happy: number
    neutral: number
    sad: number
  }
  scoreStatistics?: {
    average: number
    min: number
    max: number
    maxPossible: number
  }
}

interface TeacherSummary {
  todayActivities: number
  pendingAssessments: number
  weekAssessments: number
  positiveRatio: number
}

const ActivitiesPage: React.FC = () => {
  // Estados principales
  const [activities, setActivities] = useState<Activity[]>([])
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedClassGroup, setSelectedClassGroup] = useState<string>()
  const [searchText, setSearchText] = useState('')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [summary, setSummary] = useState<TeacherSummary | null>(null)

  // Estados de modales y formularios
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [assessmentDrawerVisible, setAssessmentDrawerVisible] = useState(false)
  const [statisticsModalVisible, setStatisticsModalVisible] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [statistics, setStatistics] = useState<ActivityStatistics | null>(null)

  // Estados de formularios
  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()

  // Estados de valoración
  const [bulkAssessmentMode, setBulkAssessmentMode] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [bulkValue, setBulkValue] = useState<string>('')
  const [bulkComment, setBulkComment] = useState<string>('')

  useEffect(() => {
    fetchActivities()
    fetchClassGroups()
    fetchTeacherSummary()
  }, [selectedClassGroup, dateRange])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (selectedClassGroup) {
        params.append('classGroupId', selectedClassGroup)
      }
      
      if (dateRange) {
        params.append('startDate', dateRange[0].format('YYYY-MM-DD'))
        params.append('endDate', dateRange[1].format('YYYY-MM-DD'))
      }

      const response = await apiClient.get(`/activities?${params.toString()}`)
      setActivities(response.data)
    } catch (error: any) {
      console.error('Error fetching activities:', error)
      message.error('Error al cargar actividades')
    } finally {
      setLoading(false)
    }
  }

  const fetchClassGroups = async () => {
    try {
      const response = await apiClient.get('/class-groups/my-classes')
      setClassGroups(response.data)
    } catch (error: any) {
      console.error('Error fetching class groups:', error)
    }
  }

  const fetchTeacherSummary = async () => {
    try {
      const response = await apiClient.get('/activities/summary')
      setSummary(response.data)
    } catch (error: any) {
      console.error('Error fetching teacher summary:', error)
    }
  }

  const fetchActivityStatistics = async (activityId: string) => {
    try {
      const response = await apiClient.get(`/activities/${activityId}/statistics`)
      setStatistics(response.data)
    } catch (error: any) {
      message.error('Error al cargar estadísticas')
    }
  }

  const handleCreateActivity = async (values: any) => {
    try {
      const activityData = {
        ...values,
        assignedDate: values.assignedDate.format('YYYY-MM-DD'),
        reviewDate: values.reviewDate ? values.reviewDate.format('YYYY-MM-DD') : undefined,
        notifyFamilies: values.notifyFamilies ?? true,
        notifyOnHappy: values.notifyOnHappy ?? false,
        notifyOnNeutral: values.notifyOnNeutral ?? true,
        notifyOnSad: values.notifyOnSad ?? true,
      }

      await apiClient.post('/activities', activityData)
      message.success('Actividad creada exitosamente')
      setCreateModalVisible(false)
      createForm.resetFields()
      fetchActivities()
      fetchTeacherSummary()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear actividad'
      message.error(errorMessage)
    }
  }

  const handleEditActivity = async (values: any) => {
    if (!selectedActivity) return

    try {
      const updateData = {
        ...values,
        assignedDate: values.assignedDate.format('YYYY-MM-DD'),
        reviewDate: values.reviewDate ? values.reviewDate.format('YYYY-MM-DD') : null,
      }

      await apiClient.patch(`/activities/${selectedActivity.id}`, updateData)
      message.success('Actividad actualizada exitosamente')
      setEditModalVisible(false)
      setSelectedActivity(null)
      editForm.resetFields()
      fetchActivities()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar actividad'
      message.error(errorMessage)
    }
  }

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await apiClient.delete(`/activities/${activityId}`)
      message.success('Actividad eliminada exitosamente')
      fetchActivities()
      fetchTeacherSummary()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar actividad'
      message.error(errorMessage)
    }
  }

  const handleAssessStudent = async (studentId: string, value: string, comment?: string) => {
    if (!selectedActivity) return

    try {
      await apiClient.post(`/activities/${selectedActivity.id}/assess/${studentId}`, {
        value,
        comment: comment || undefined,
      })

      message.success('Valoración guardada')
      
      // Actualizar la actividad seleccionada
      const updatedActivity = await apiClient.get(`/activities/${selectedActivity.id}`)
      setSelectedActivity(updatedActivity.data)
      
      // Actualizar la lista de actividades
      fetchActivities()
      fetchTeacherSummary()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al guardar valoración'
      message.error(errorMessage)
    }
  }

  const handleBulkAssessment = async () => {
    if (!selectedActivity || !bulkValue) return

    try {
      const bulkData: any = {
        value: bulkValue,
        comment: bulkComment || undefined,
      }

      if (selectedStudents.length > 0) {
        bulkData.studentIds = selectedStudents
      }

      await apiClient.post(`/activities/${selectedActivity.id}/bulk-assess`, bulkData)
      
      const targetCount = selectedStudents.length > 0 ? selectedStudents.length : selectedActivity.assessments.length
      message.success(`Valoración aplicada a ${targetCount} estudiantes`)
      
      // Resetear estado de valoración masiva
      setBulkAssessmentMode(false)
      setSelectedStudents([])
      setBulkValue('')
      setBulkComment('')
      
      // Actualizar datos
      const updatedActivity = await apiClient.get(`/activities/${selectedActivity.id}`)
      setSelectedActivity(updatedActivity.data)
      fetchActivities()
      fetchTeacherSummary()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error en valoración masiva'
      message.error(errorMessage)
    }
  }

  const openEditModal = (activity: Activity) => {
    setSelectedActivity(activity)
    editForm.setFieldsValue({
      name: activity.name,
      description: activity.description,
      classGroupId: activity.classGroup.id,
      valuationType: activity.valuationType,
      maxScore: activity.maxScore,
      assignedDate: dayjs(activity.assignedDate),
      reviewDate: activity.reviewDate ? dayjs(activity.reviewDate) : null,
      notifyFamilies: activity.notifyFamilies,
    })
    setEditModalVisible(true)
  }

  const openAssessmentDrawer = (activity: Activity) => {
    setSelectedActivity(activity)
    setAssessmentDrawerVisible(true)
  }

  const openStatisticsModal = async (activity: Activity) => {
    setSelectedActivity(activity)
    setStatisticsModalVisible(true)
    await fetchActivityStatistics(activity.id)
  }

  const getEmojiIcon = (value: string) => {
    switch (value) {
      case 'happy': return <SmileOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
      case 'neutral': return <MehOutlined style={{ color: '#faad14', fontSize: '16px' }} />
      case 'sad': return <FrownOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />
      default: return <QuestionCircleOutlined style={{ color: '#d9d9d9', fontSize: '16px' }} />
    }
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return '#52c41a'
    if (percentage >= 60) return '#faad14'
    return '#ff4d4f'
  }

  // Filtrar actividades según búsqueda
  const filteredActivities = activities.filter(activity =>
    activity.name.toLowerCase().includes(searchText.toLowerCase()) ||
    activity.description?.toLowerCase().includes(searchText.toLowerCase()) ||
    activity.classGroup.name.toLowerCase().includes(searchText.toLowerCase())
  )

  // Columnas de la tabla
  const columns: ColumnsType<Activity> = [
    {
      title: 'Actividad',
      key: 'name',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{record.name}</Text>
          {record.description && (
            <Text type="secondary" className="text-sm">
              {record.description}
            </Text>
          )}
          <Space>
            <Tag color="blue">{record.classGroup.name}</Tag>
            <Tag color={record.valuationType === 'emoji' ? 'green' : 'orange'}>
              {record.valuationType === 'emoji' ? 'Emojis' : `Puntuación (/${record.maxScore})`}
            </Tag>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'assignedDate',
      key: 'assignedDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a, b) => dayjs(a.assignedDate).unix() - dayjs(b.assignedDate).unix(),
    },
    {
      title: 'Progreso',
      key: 'progress',
      render: (_, record) => {
        const assessed = record.assessments.filter(a => a.isAssessed).length
        const total = record.assessments.length
        const percentage = total > 0 ? Math.round((assessed / total) * 100) : 0
        
        return (
          <Space direction="vertical" size="small">
            <Progress 
              percent={percentage} 
              size="small" 
              strokeColor={getCompletionColor(percentage)}
              format={() => `${assessed}/${total}`}
            />
            <Text type="secondary" className="text-xs">
              {assessed} de {total} valorados
            </Text>
          </Space>
        )
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver valoraciones">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => openAssessmentDrawer(record)}
            />
          </Tooltip>
          <Tooltip title="Estadísticas">
            <Button 
              type="text" 
              icon={<BarChartOutlined />}
              onClick={() => openStatisticsModal(record)}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button 
              type="text" 
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="¿Estás seguro de eliminar esta actividad?"
            onConfirm={() => handleDeleteActivity(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Tooltip title="Eliminar">
              <Button 
                type="text" 
                icon={<DeleteOutlined />}
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="activities-page">
      {/* Estadísticas del profesor */}
      {summary && (
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Actividades de Hoy"
                value={summary.todayActivities}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Pendientes de Valorar"
                value={summary.pendingAssessments}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Valoraciones esta Semana"
                value={summary.weekAssessments}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Ratio Positivo"
                value={summary.positiveRatio}
                suffix="%"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Controles y filtros */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Buscar actividades..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Filtrar por grupo"
              allowClear
              value={selectedClassGroup}
              onChange={setSelectedClassGroup}
              className="w-full"
            >
              {classGroups.map(group => (
                <Option key={group.id} value={group.id}>
                  {group.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <DatePicker.RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              format="DD/MM/YYYY"
              placeholder={['Fecha inicio', 'Fecha fin']}
              className="w-full"
            />
          </Col>
          <Col xs={24} md={4}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
              className="w-full"
            >
              Nueva Actividad
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tabla de actividades */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredActivities}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredActivities.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} actividades`,
          }}
        />
      </Card>

      {/* Modal crear actividad */}
      <Modal
        title="Nueva Actividad Diaria"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false)
          createForm.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateActivity}
          initialValues={{
            valuationType: 'emoji',
            notifyFamilies: true,
            notifyOnHappy: false,
            notifyOnNeutral: true,
            notifyOnSad: true,
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Nombre de la Actividad"
                rules={[{ required: true, message: 'El nombre es requerido' }]}
              >
                <Input placeholder="Ej: Ejercicios de matemáticas" />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item name="description" label="Descripción (opcional)">
                <TextArea 
                  rows={3} 
                  placeholder="Descripción detallada de la actividad..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="classGroupId"
                label="Grupo de Clase"
                rules={[{ required: true, message: 'Selecciona un grupo' }]}
              >
                <Select placeholder="Seleccionar grupo">
                  {classGroups.map(group => (
                    <Option key={group.id} value={group.id}>
                      {group.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="assignedDate"
                label="Fecha de Asignación"
                rules={[{ required: true, message: 'La fecha es requerida' }]}
              >
                <DatePicker 
                  className="w-full" 
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="reviewDate" label="Fecha de Revisión (opcional)">
                <DatePicker 
                  className="w-full" 
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="valuationType"
                label="Tipo de Valoración"
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  <Radio value="emoji">Emojis</Radio>
                  <Radio value="score">Puntuación</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>

            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.valuationType !== curr.valuationType}>
              {({ getFieldValue }) => 
                getFieldValue('valuationType') === 'score' && (
                  <Col span={24}>
                    <Form.Item
                      name="maxScore"
                      label="Puntuación Máxima"
                      rules={[
                        { required: true, message: 'La puntuación máxima es requerida' },
                        { type: 'number', min: 1, max: 100, message: 'Entre 1 y 100' }
                      ]}
                    >
                      <InputNumber 
                        min={1} 
                        max={100} 
                        className="w-full"
                        placeholder="Ej: 10"
                      />
                    </Form.Item>
                  </Col>
                )
              }
            </Form.Item>

            <Col span={24}>
              <Form.Item name="notifyFamilies" valuePropName="checked">
                <Switch checkedChildren="Notificar a las familias" unCheckedChildren="No notificar" />
              </Form.Item>
            </Col>

            <Form.Item noStyle shouldUpdate={(prev, curr) => 
              prev.notifyFamilies !== curr.notifyFamilies || prev.valuationType !== curr.valuationType
            }>
              {({ getFieldValue }) => 
                getFieldValue('notifyFamilies') && getFieldValue('valuationType') === 'emoji' && (
                  <Col span={24}>
                    <Card size="small" title="Configuración de Notificaciones por Emoji" style={{ backgroundColor: '#f6ffed' }}>
                      <Space direction="vertical" className="w-full">
                        <Typography.Text type="secondary">
                          Selecciona en qué casos se notificará a las familias:
                        </Typography.Text>
                        
                        <Form.Item name="notifyOnHappy" valuePropName="checked" className="mb-2">
                          <Checkbox>
                            <Space>
                              <SmileOutlined style={{ color: '#52c41a' }} />
                              Notificar cuando esté <Typography.Text strong style={{ color: '#52c41a' }}>Feliz</Typography.Text>
                            </Space>
                          </Checkbox>
                        </Form.Item>

                        <Form.Item name="notifyOnNeutral" valuePropName="checked" className="mb-2">
                          <Checkbox>
                            <Space>
                              <MehOutlined style={{ color: '#faad14' }} />
                              Notificar cuando esté <Typography.Text strong style={{ color: '#faad14' }}>Normal</Typography.Text>
                            </Space>
                          </Checkbox>
                        </Form.Item>

                        <Form.Item name="notifyOnSad" valuePropName="checked" className="mb-0">
                          <Checkbox>
                            <Space>
                              <FrownOutlined style={{ color: '#ff4d4f' }} />
                              Notificar cuando esté <Typography.Text strong style={{ color: '#ff4d4f' }}>Triste</Typography.Text>
                            </Space>
                          </Checkbox>
                        </Form.Item>
                      </Space>
                    </Card>
                  </Col>
                )
              }
            </Form.Item>
          </Row>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => {
              setCreateModalVisible(false)
              createForm.resetFields()
            }}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit">
              Crear Actividad
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal editar actividad */}
      <Modal
        title="Editar Actividad"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false)
          setSelectedActivity(null)
          editForm.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditActivity}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Nombre de la Actividad"
                rules={[{ required: true, message: 'El nombre es requerido' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item name="description" label="Descripción">
                <TextArea rows={3} maxLength={500} showCount />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="assignedDate"
                label="Fecha de Asignación"
                rules={[{ required: true }]}
              >
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="reviewDate" label="Fecha de Revisión">
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="valuationType" label="Tipo de Valoración">
                <Radio.Group disabled>
                  <Radio value="emoji">Emojis</Radio>
                  <Radio value="score">Puntuación</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>

            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.valuationType !== curr.valuationType}>
              {({ getFieldValue }) => 
                getFieldValue('valuationType') === 'score' && (
                  <Col span={12}>
                    <Form.Item name="maxScore" label="Puntuación Máxima">
                      <InputNumber min={1} max={100} className="w-full" disabled />
                    </Form.Item>
                  </Col>
                )
              }
            </Form.Item>

            <Col span={24}>
              <Form.Item name="notifyFamilies" valuePropName="checked">
                <Switch checkedChildren="Notificar a las familias" unCheckedChildren="No notificar" />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => {
              setEditModalVisible(false)
              setSelectedActivity(null)
              editForm.resetFields()
            }}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit">
              Guardar Cambios
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Drawer de valoraciones */}
      <Drawer
        title={
          <Space>
            <BookOutlined />
            {selectedActivity?.name}
            <Tag color="blue">{selectedActivity?.classGroup.name}</Tag>
          </Space>
        }
        open={assessmentDrawerVisible}
        onClose={() => {
          setAssessmentDrawerVisible(false)
          setSelectedActivity(null)
          setBulkAssessmentMode(false)
          setSelectedStudents([])
          setBulkValue('')
          setBulkComment('')
        }}
        width={600}
        extra={
          <Space>
            <Button
              type={bulkAssessmentMode ? 'default' : 'primary'}
              onClick={() => setBulkAssessmentMode(!bulkAssessmentMode)}
            >
              {bulkAssessmentMode ? 'Cancelar Masiva' : 'Valoración Masiva'}
            </Button>
          </Space>
        }
      >
        {selectedActivity && (
          <div>
            {/* Modo valoración masiva */}
            {bulkAssessmentMode && (
              <Card className="mb-4" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
                <Space direction="vertical" className="w-full">
                  <Text strong>Valoración Masiva</Text>
                  
                  {selectedActivity.valuationType === 'emoji' ? (
                    <Space>
                      <Text>Valor:</Text>
                      <Radio.Group value={bulkValue} onChange={(e) => setBulkValue(e.target.value)}>
                        <Radio.Button value="happy">
                          <SmileOutlined style={{ color: '#52c41a' }} /> Feliz
                        </Radio.Button>
                        <Radio.Button value="neutral">
                          <MehOutlined style={{ color: '#faad14' }} /> Normal
                        </Radio.Button>
                        <Radio.Button value="sad">
                          <FrownOutlined style={{ color: '#ff4d4f' }} /> Triste
                        </Radio.Button>
                      </Radio.Group>
                    </Space>
                  ) : (
                    <Space>
                      <Text>Puntuación:</Text>
                      <InputNumber
                        min={0}
                        max={selectedActivity.maxScore}
                        value={bulkValue ? parseFloat(bulkValue) : undefined}
                        onChange={(value) => setBulkValue(value?.toString() || '')}
                        placeholder="0"
                      />
                      <Text type="secondary">/ {selectedActivity.maxScore}</Text>
                    </Space>
                  )}

                  <Input.TextArea
                    rows={2}
                    placeholder="Comentario opcional para todos los estudiantes..."
                    value={bulkComment}
                    onChange={(e) => setBulkComment(e.target.value)}
                    maxLength={200}
                    showCount
                  />

                  <div>
                    <Text type="secondary">
                      {selectedStudents.length > 0 
                        ? `Aplicar a ${selectedStudents.length} estudiantes seleccionados`
                        : `Aplicar a todos los ${selectedActivity.assessments.length} estudiantes`
                      }
                    </Text>
                  </div>

                  <Button
                    type="primary"
                    onClick={handleBulkAssessment}
                    disabled={!bulkValue}
                  >
                    Aplicar Valoración Masiva
                  </Button>
                </Space>
              </Card>
            )}

            {/* Lista de estudiantes */}
            <List
              dataSource={selectedActivity.assessments}
              renderItem={(assessment) => (
                <List.Item
                  style={{
                    backgroundColor: bulkAssessmentMode && selectedStudents.includes(assessment.student.id) 
                      ? '#e6f7ff' : 'transparent'
                  }}
                  onClick={() => {
                    if (bulkAssessmentMode) {
                      const studentId = assessment.student.id
                      setSelectedStudents(prev => 
                        prev.includes(studentId) 
                          ? prev.filter(id => id !== studentId)
                          : [...prev, studentId]
                      )
                    }
                  }}
                  className={bulkAssessmentMode ? 'cursor-pointer' : ''}
                  actions={!bulkAssessmentMode ? [
                    selectedActivity.valuationType === 'emoji' ? (
                      <Space key="emoji-actions">
                        <Button
                          type={assessment.value === 'happy' ? 'primary' : 'default'}
                          icon={<SmileOutlined />}
                          onClick={() => handleAssessStudent(assessment.student.id, 'happy')}
                          size="small"
                          style={{ color: assessment.value === 'happy' ? '#fff' : '#52c41a' }}
                        />
                        <Button
                          type={assessment.value === 'neutral' ? 'primary' : 'default'}
                          icon={<MehOutlined />}
                          onClick={() => handleAssessStudent(assessment.student.id, 'neutral')}
                          size="small"
                          style={{ color: assessment.value === 'neutral' ? '#fff' : '#faad14' }}
                        />
                        <Button
                          type={assessment.value === 'sad' ? 'primary' : 'default'}
                          icon={<FrownOutlined />}
                          onClick={() => handleAssessStudent(assessment.student.id, 'sad')}
                          size="small"
                          style={{ color: assessment.value === 'sad' ? '#fff' : '#ff4d4f' }}
                        />
                      </Space>
                    ) : (
                      <Space key="score-actions">
                        <InputNumber
                          min={0}
                          max={selectedActivity.maxScore}
                          value={assessment.value ? parseFloat(assessment.value) : undefined}
                          onChange={(value) => {
                            if (value !== null && value !== undefined) {
                              handleAssessStudent(assessment.student.id, value.toString())
                            }
                          }}
                          size="small"
                          placeholder="0"
                        />
                        <Text type="secondary">/ {selectedActivity.maxScore}</Text>
                      </Space>
                    )
                  ] : undefined}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge 
                        dot={assessment.isAssessed} 
                        status={assessment.isAssessed ? 'success' : 'default'}
                      >
                        <Avatar style={{ backgroundColor: '#87d068' }}>
                          {assessment.student.user.profile.firstName.charAt(0)}
                        </Avatar>
                      </Badge>
                    }
                    title={
                      <Space>
                        {`${assessment.student.user.profile.firstName} ${assessment.student.user.profile.lastName}`}
                        {bulkAssessmentMode && selectedStudents.includes(assessment.student.id) && (
                          <CheckCircleOutlined style={{ color: '#1890ff' }} />
                        )}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        {assessment.isAssessed ? (
                          <Space>
                            <Text strong>
                              {selectedActivity.valuationType === 'emoji' ? (
                                getEmojiIcon(assessment.value!)
                              ) : (
                                `${assessment.value}/${selectedActivity.maxScore}`
                              )}
                            </Text>
                            <Text type="secondary" className="text-xs">
                              {dayjs(assessment.assessedAt).format('DD/MM/YYYY HH:mm')}
                            </Text>
                          </Space>
                        ) : (
                          <Text type="secondary">Sin valorar</Text>
                        )}
                        {assessment.comment && (
                          <Text className="text-sm" style={{ fontStyle: 'italic' }}>
                            "{assessment.comment}"
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </Drawer>

      {/* Modal de estadísticas */}
      <Modal
        title={
          <Space>
            <BarChartOutlined />
            Estadísticas de Actividad
          </Space>
        }
        open={statisticsModalVisible}
        onCancel={() => {
          setStatisticsModalVisible(false)
          setStatistics(null)
          setSelectedActivity(null)
        }}
        footer={[
          <Button key="close" onClick={() => {
            setStatisticsModalVisible(false)
            setStatistics(null)
            setSelectedActivity(null)
          }}>
            Cerrar
          </Button>
        ]}
        width={600}
      >
        {statistics ? (
          <Space direction="vertical" size="large" className="w-full">
            <div>
              <Title level={4}>{statistics.activityName}</Title>
              <Text type="secondary">Estadísticas detalladas de la actividad</Text>
            </div>

            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Total Estudiantes"
                  value={statistics.totalStudents}
                  prefix={<TeamOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Valorados"
                  value={statistics.assessedStudents}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Pendientes"
                  value={statistics.pendingStudents}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
            </Row>

            <Card>
              <div className="text-center">
                <Progress
                  type="circle"
                  percent={statistics.completionPercentage}
                  strokeColor={getCompletionColor(statistics.completionPercentage)}
                  width={120}
                />
                <div className="mt-2">
                  <Text strong>Progreso de Completado</Text>
                </div>
              </div>
            </Card>

            {statistics.emojiDistribution && (
              <Card title="Distribución de Emojis">
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title={<Space><SmileOutlined style={{ color: '#52c41a' }} />Feliz</Space>}
                      value={statistics.emojiDistribution.happy}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title={<Space><MehOutlined style={{ color: '#faad14' }} />Normal</Space>}
                      value={statistics.emojiDistribution.neutral}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title={<Space><FrownOutlined style={{ color: '#ff4d4f' }} />Triste</Space>}
                      value={statistics.emojiDistribution.sad}
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Col>
                </Row>
              </Card>
            )}

            {statistics.scoreStatistics && (
              <Card title="Estadísticas de Puntuación">
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic
                      title="Promedio"
                      value={statistics.scoreStatistics.average}
                      precision={1}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Mínimo"
                      value={statistics.scoreStatistics.min}
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Máximo"
                      value={statistics.scoreStatistics.max}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Máximo Posible"
                      value={statistics.scoreStatistics.maxPossible}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Col>
                </Row>
              </Card>
            )}
          </Space>
        ) : (
          <div className="text-center py-8">
            <Spin size="large" />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ActivitiesPage