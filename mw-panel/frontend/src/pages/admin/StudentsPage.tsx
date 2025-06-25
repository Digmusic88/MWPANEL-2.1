import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
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
  Avatar,
  Tooltip,
  Popconfirm,
  DatePicker,
  AutoComplete,
  Drawer,
  Divider,
  Row,
  Col,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  EyeOutlined,
  FilterOutlined,
  FileTextOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import apiClient from '@services/apiClient'
import StudentEvaluations from '../../components/StudentEvaluations'
import ResponsiveTable, { useResponsiveColumns } from '../../components/common/ResponsiveTable'
import ResponsiveModal from '../../components/common/ResponsiveModal'
import { useResponsive } from '../../hooks/useResponsive'

const { Title, Text } = Typography
const { Option } = Select

interface Student {
  id: string
  user: {
    id: string
    email: string
    isActive: boolean
    profile: {
      firstName: string
      lastName: string
      phone?: string
      avatarUrl?: string
      dni?: string
    }
  }
  enrollmentNumber: string
  birthDate: string
  educationalLevel?: {
    id: string
    name: string
  }
  course?: {
    id: string
    name: string
  }
  classGroups?: Array<{
    id: string
    name: string
  }>
  createdAt: string
}


const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [searchOptions, setSearchOptions] = useState<{ value: string; label: string }[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false)
  const [isEvaluationsVisible, setIsEvaluationsVisible] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null)
  const [evaluatingStudent, setEvaluatingStudent] = useState<Student | null>(null)
  const [form] = Form.useForm()
  const { isMobile } = useResponsive()

  // Fetch students
  const fetchStudents = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/students')
      setStudents(response.data)
    } catch (error) {
      message.error('Error al cargar estudiantes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  // Generate search options for autocomplete
  const generateSearchOptions = (searchValue: string) => {
    if (!searchValue || searchValue.length < 2) {
      setSearchOptions([])
      return
    }

    const options: { value: string; label: string }[] = []
    const searchLower = searchValue.toLowerCase()

    students.forEach(student => {
      const fullName = `${student.user.profile.firstName} ${student.user.profile.lastName}`
      const email = student.user.email
      const enrollmentNumber = student.enrollmentNumber

      // Add matching full names
      if (fullName.toLowerCase().includes(searchLower)) {
        options.push({
          value: fullName,
          label: `👤 ${fullName}`,
        })
      }

      // Add matching emails
      if (email.toLowerCase().includes(searchLower)) {
        options.push({
          value: email,
          label: `📧 ${email}`,
        })
      }

      // Add matching enrollment numbers
      if (enrollmentNumber.toLowerCase().includes(searchLower)) {
        options.push({
          value: enrollmentNumber,
          label: `🎓 ${enrollmentNumber}`,
        })
      }
    })

    // Remove duplicates and limit to 10 results
    const uniqueOptions = options.filter((option, index, self) => 
      index === self.findIndex(o => o.value === option.value)
    ).slice(0, 10)

    setSearchOptions(uniqueOptions)
  }

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.user.profile.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
      student.user.profile.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
      student.user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      student.enrollmentNumber.toLowerCase().includes(searchText.toLowerCase())
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && student.user.isActive) ||
      (statusFilter === 'inactive' && !student.user.isActive)
    
    return matchesSearch && matchesStatus
  })

  // Table columns with responsive configuration
  const baseColumns: (ColumnsType<Student>[number] & { hideOnMobile?: boolean; hideOnTablet?: boolean })[] = [
    {
      title: 'Estudiante',
      key: 'student',
      render: (_, record) => (
        <Space>
          <Avatar 
            src={record.user.profile.avatarUrl} 
            icon={<UserOutlined />}
            size={isMobile ? 'default' : 'large'}
          />
          <div>
            <div className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
              {record.user.profile.firstName} {record.user.profile.lastName}
            </div>
            <Text type="secondary" className="text-xs">
              {record.user.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Número de Matrícula',
      dataIndex: 'enrollmentNumber',
      key: 'enrollmentNumber',
      hideOnMobile: true,
      render: (number) => (
        <Tag color="blue" className="text-xs">{number}</Tag>
      ),
    },
    {
      title: 'Nivel/Curso',
      key: 'education',
      hideOnMobile: false,
      render: (_, record) => (
        <div>
          {record.educationalLevel && (
            <div className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
              {record.educationalLevel.name}
            </div>
          )}
          {record.course && (
            <Text type="secondary" className="text-xs">
              {record.course.name}
            </Text>
          )}
          {!record.educationalLevel && !record.course && (
            <Text type="secondary" className="text-xs">Sin asignar</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Estado',
      key: 'status',
      hideOnTablet: true,
      render: (_, record) => (
        <Tag 
          color={record.user.isActive ? 'green' : 'red'}
          className="text-xs"
        >
          {record.user.isActive ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
    },
    {
      title: 'Fecha de Nacimiento',
      dataIndex: 'birthDate',
      key: 'birthDate',
      hideOnMobile: true,
      hideOnTablet: true,
      render: (date) => (
        <Text className="text-sm">
          {new Date(date).toLocaleDateString('es-ES')}
        </Text>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver">
            <Button 
              type="text" 
              size={isMobile ? 'small' : 'middle'}
              icon={<EyeOutlined />}
              onClick={() => handleViewStudent(record)}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button 
              type="text" 
              size={isMobile ? 'small' : 'middle'}
              icon={<EditOutlined />}
              onClick={() => handleEditStudent(record)}
            />
          </Tooltip>
          {!isMobile && (
            <Tooltip title="Eliminar">
              <Popconfirm
                title="¿Estás seguro?"
                description="Se eliminará este estudiante"
                onConfirm={() => handleDeleteStudent(record.id)}
                okText="Sí"
                cancelText="No"
              >
                <Button 
                  type="text" 
                  danger 
                  size="small"
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  // Get responsive columns
  const columns = useResponsiveColumns(baseColumns)

  // Handlers
  const handleViewStudent = (student: Student) => {
    setViewingStudent(student)
    setIsDetailDrawerVisible(true)
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    form.setFieldsValue({
      email: student.user.email,
      firstName: student.user.profile.firstName,
      lastName: student.user.profile.lastName,
      phone: student.user.profile.phone,
      dni: student.user.profile.dni,
      enrollmentNumber: student.enrollmentNumber,
      birthDate: student.birthDate ? dayjs(student.birthDate) : null,
    })
    setIsModalVisible(true)
  }

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await apiClient.delete(`/students/${studentId}`)
      message.success('Estudiante eliminado correctamente')
      fetchStudents()
    } catch (error) {
      message.error('Error al eliminar estudiante')
    }
  }

  const handleAddStudent = () => {
    setEditingStudent(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    try {
      // Format birth date if provided
      const submitData = {
        ...values,
        birthDate: values.birthDate ? dayjs(values.birthDate).format('YYYY-MM-DD') : undefined,
      }

      if (editingStudent) {
        // Update student
        await apiClient.patch(`/students/${editingStudent.id}`, submitData)
        message.success('Estudiante actualizado correctamente')
      } else {
        // Create new student
        await apiClient.post('/students', submitData)
        message.success('Estudiante creado correctamente')
      }
      setIsModalVisible(false)
      form.resetFields()
      fetchStudents()
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error al guardar estudiante')
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
    setEditingStudent(null)
  }

  const handleSearchChange = (value: string) => {
    setSearchText(value)
    generateSearchOptions(value)
  }

  const handleSearchSelect = (value: string) => {
    setSearchText(value)
    setSearchOptions([])
  }

  const handleDetailDrawerClose = () => {
    setIsDetailDrawerVisible(false)
    setViewingStudent(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="!mb-2">
            Gestión de Estudiantes
          </Title>
          <Text type="secondary">
            Administra los estudiantes del centro educativo
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAddStudent}
        >
          Nuevo Estudiante
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className={`flex gap-4 items-center ${isMobile ? 'flex-col' : 'flex-wrap'}`}>
          <AutoComplete
            placeholder="Buscar estudiantes..."
            value={searchText}
            options={searchOptions}
            onSearch={handleSearchChange}
            onSelect={handleSearchSelect}
            onChange={handleSearchChange}
            className={isMobile ? 'w-full' : 'w-64'}
            allowClear
          >
            <Input prefix={<SearchOutlined />} />
          </AutoComplete>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className={isMobile ? 'w-full' : 'w-40'}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">Todos</Option>
            <Option value="active">Activos</Option>
            <Option value="inactive">Inactivos</Option>
          </Select>
          <Text type="secondary" className={isMobile ? 'text-center' : ''}>
            {filteredStudents.length} estudiante(s) encontrado(s)
          </Text>
        </div>
      </Card>

      {/* Students Table */}
      <Card>
        <ResponsiveTable
          columns={columns}
          dataSource={filteredStudents}
          loading={loading}
          rowKey="id"
          mobileTitle="Estudiantes"
          mobileCardRender={(record, index) => (
            <Card 
              key={record.id}
              size="small"
              className="mb-3 shadow-sm"
            >
              <Space direction="vertical" size="small" className="w-full">
                {/* Header with avatar and name */}
                <div className="flex items-center gap-3">
                  <Avatar 
                    src={record.user.profile.avatarUrl} 
                    icon={<UserOutlined />}
                    size="large"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-base">
                      {record.user.profile.firstName} {record.user.profile.lastName}
                    </div>
                    <Text type="secondary" className="text-sm">
                      {record.user.email}
                    </Text>
                  </div>
                  <Tag 
                    color={record.user.isActive ? 'green' : 'red'}
                    className="text-xs"
                  >
                    {record.user.isActive ? 'Activo' : 'Inactivo'}
                  </Tag>
                </div>
                
                {/* Education info */}
                {(record.educationalLevel || record.course) && (
                  <div className="flex justify-between text-sm">
                    <Text type="secondary">Nivel/Curso:</Text>
                    <div className="text-right">
                      {record.educationalLevel && (
                        <div className="font-medium">{record.educationalLevel.name}</div>
                      )}
                      {record.course && (
                        <Text type="secondary" className="text-xs">
                          {record.course.name}
                        </Text>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex justify-center gap-2 pt-2 border-t border-gray-100">
                  <Button 
                    type="text" 
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewStudent(record)}
                  >
                    Ver
                  </Button>
                  <Button 
                    type="text" 
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEditStudent(record)}
                  >
                    Editar
                  </Button>
                </div>
              </Space>
            </Card>
          )}
        />
      </Card>

      {/* Student Details Drawer */}
      <Drawer
        title="Detalles del Estudiante"
        placement="right"
        size={isMobile ? 'default' : 'large'}
        width={isMobile ? '100%' : 720}
        onClose={handleDetailDrawerClose}
        open={isDetailDrawerVisible}
        extra={
          viewingStudent && (
            <Space>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => {
                  handleDetailDrawerClose()
                  handleEditStudent(viewingStudent)
                }}
              >
                Editar
              </Button>
            </Space>
          )
        }
      >
        {viewingStudent && (
          <div className="space-y-6">
            {/* Student Header */}
            <div className="text-center border-b pb-6">
              <Avatar 
                size={120} 
                src={viewingStudent.user.profile.avatarUrl}
                icon={<UserOutlined />}
                className="mb-4"
              />
              <h2 className="text-2xl font-bold mb-2">
                {viewingStudent.user.profile.firstName} {viewingStudent.user.profile.lastName}
              </h2>
              <Tag 
                color={viewingStudent.user.isActive ? 'green' : 'red'}
                className="text-sm"
              >
                {viewingStudent.user.isActive ? 'Activo' : 'Inactivo'}
              </Tag>
            </div>

            {/* Student Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Información Personal</h3>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div>
                    <Text type="secondary">Email</Text>
                    <div className="font-medium">{viewingStudent.user.email}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text type="secondary">Número de Matrícula</Text>
                    <div className="font-medium">
                      <Tag color="blue">{viewingStudent.enrollmentNumber}</Tag>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text type="secondary">DNI/NIE</Text>
                    <div className="font-medium">
                      {viewingStudent.user.profile.dni || 'No especificado'}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text type="secondary">Teléfono</Text>
                    <div className="font-medium">
                      {viewingStudent.user.profile.phone || 'No especificado'}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text type="secondary">Fecha de Nacimiento</Text>
                    <div className="font-medium">
                      {new Date(viewingStudent.birthDate).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text type="secondary">Fecha de Registro</Text>
                    <div className="font-medium">
                      {new Date(viewingStudent.createdAt).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Academic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Información Académica</h3>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div>
                    <Text type="secondary">Nivel Educativo</Text>
                    <div className="font-medium">
                      {viewingStudent.educationalLevel?.name || 'No asignado'}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text type="secondary">Curso</Text>
                    <div className="font-medium">
                      {viewingStudent.course?.name || 'No asignado'}
                    </div>
                  </div>
                </Col>
                <Col span={24}>
                  <div>
                    <Text type="secondary">Clases</Text>
                    <div className="font-medium mt-2">
                      {viewingStudent.classGroups && viewingStudent.classGroups.length > 0 ? (
                        <Space wrap>
                          {viewingStudent.classGroups.map(classGroup => (
                            <Tag key={classGroup.id} color="purple">
                              {classGroup.name}
                            </Tag>
                          ))}
                        </Space>
                      ) : (
                        'No asignado a ninguna clase'
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider />

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
              <Space direction="vertical" className="w-full">
                <Button 
                  type="default" 
                  block 
                  icon={<FileTextOutlined />}
                  onClick={() => {
                    setEvaluatingStudent(viewingStudent)
                    setIsEvaluationsVisible(true)
                  }}
                >
                  Ver Evaluaciones
                </Button>
                <Button 
                  type="default" 
                  block 
                  icon={<BarChartOutlined />}
                  onClick={() => message.info('Función de reportes en desarrollo')}
                >
                  Generar Reporte
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add/Edit Student Modal */}
      <ResponsiveModal
        title={editingStudent ? 'Editar Estudiante' : 'Nuevo Estudiante'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        desktopWidth={600}
        tabletWidth="90%"
        mobileAsDrawer={true}
        drawerPlacement="bottom"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-4'}`}>
            <Form.Item
              name="firstName"
              label="Nombre"
              rules={[{ required: true, message: 'El nombre es requerido' }]}
            >
              <Input placeholder="Nombre del estudiante" />
            </Form.Item>
            <Form.Item
              name="lastName"
              label="Apellidos"
              rules={[{ required: true, message: 'Los apellidos son requeridos' }]}
            >
              <Input placeholder="Apellidos del estudiante" />
            </Form.Item>
          </div>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'El email es requerido' },
              { type: 'email', message: 'Email no válido' }
            ]}
          >
            <Input placeholder="email@ejemplo.com" />
          </Form.Item>

          {!editingStudent && (
            <Form.Item
              name="password"
              label="Contraseña"
              rules={[
                { required: true, message: 'La contraseña es requerida' },
                { min: 6, message: 'Mínimo 6 caracteres' }
              ]}
            >
              <Input.Password placeholder="Contraseña del estudiante" />
            </Form.Item>
          )}

          {editingStudent && (
            <Form.Item
              name="newPassword"
              label="Nueva Contraseña (opcional)"
              rules={[
                { min: 8, message: 'Mínimo 8 caracteres' }
              ]}
            >
              <Input.Password placeholder="Dejar vacío para mantener la contraseña actual" />
            </Form.Item>
          )}

          <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-4'}`}>
            <Form.Item
              name="dni"
              label="DNI/NIE"
            >
              <Input placeholder="12345678A" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Teléfono"
            >
              <Input placeholder="+34 600 000 000" />
            </Form.Item>
          </div>

          <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-4'}`}>
            <Form.Item
              name="enrollmentNumber"
              label="Número de Matrícula"
              rules={[{ required: true, message: 'El número de matrícula es requerido' }]}
            >
              <Input placeholder="MT-2024-001" />
            </Form.Item>
            <Form.Item
              name="birthDate"
              label="Fecha de Nacimiento"
            >
              <DatePicker 
                placeholder="Selecciona fecha" 
                format="DD/MM/YYYY"
                className="w-full"
              />
            </Form.Item>
          </div>

          <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-end gap-2'} mt-6`}>
            <Button onClick={handleCancel} block={isMobile}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit" block={isMobile}>
              {editingStudent ? 'Actualizar' : 'Crear'} Estudiante
            </Button>
          </div>
        </Form>
      </ResponsiveModal>

      {/* Student Evaluations Modal */}
      <StudentEvaluations
        visible={isEvaluationsVisible}
        onClose={() => {
          setIsEvaluationsVisible(false)
          setEvaluatingStudent(null)
        }}
        student={evaluatingStudent}
      />
    </div>
  )
}

export default StudentsPage