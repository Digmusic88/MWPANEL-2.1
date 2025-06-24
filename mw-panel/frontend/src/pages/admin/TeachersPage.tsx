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
  TeamOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import apiClient from '@services/apiClient'

const { Title, Text } = Typography
const { Option } = Select

interface Teacher {
  id: string
  employeeNumber: string
  specialties: string[]
  user: {
    id: string
    email: string
    isActive: boolean
    profile: {
      firstName: string
      lastName: string
      dateOfBirth?: string
      documentNumber?: string
      phone?: string
      address?: string
      education?: string
      hireDate?: string
      department?: string
      position?: string
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
  createdAt: string
  updatedAt: string
}

const TeachersPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true) // Start with true to show loading initially
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)
  const [form] = Form.useForm()

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching teachers...')
      const response = await apiClient.get('/teachers')
      console.log('Teachers fetched:', response.data)
      setTeachers(response.data || [])
    } catch (error: any) {
      console.error('Error fetching teachers:', error)
      let errorMessage = 'Error al cargar profesores'
      if (error.response?.status === 401) {
        errorMessage = 'No tienes autorización para ver esta página'
      } else if (error.response?.status === 403) {
        errorMessage = 'No tienes permisos para acceder a los profesores'
      }
      setError(errorMessage)
      message.error(errorMessage)
      setTeachers([]) // Set empty array to avoid undefined errors
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeachers()
  }, [])

  // Handle create teacher
  const handleCreateTeacher = async (values: any) => {
    try {
      await apiClient.post('/teachers', {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : undefined,
        hireDate: values.hireDate ? values.hireDate.format('YYYY-MM-DD') : undefined,
      })
      message.success('Profesor creado exitosamente')
      setIsModalVisible(false)
      form.resetFields()
      fetchTeachers()
    } catch (error: any) {
      if (error.response?.status === 409) {
        message.error('El email o número de empleado ya está registrado')
      } else {
        message.error('Error al crear profesor')
      }
      console.error('Error creating teacher:', error)
    }
  }

  // Handle edit teacher
  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    form.setFieldsValue({
      ...teacher,
      ...teacher.user.profile,
      email: teacher.user.email,
      isActive: teacher.user.isActive,
      dateOfBirth: teacher.user.profile.dateOfBirth ? dayjs(teacher.user.profile.dateOfBirth) : undefined,
      hireDate: teacher.user.profile.hireDate ? dayjs(teacher.user.profile.hireDate) : undefined,
    })
    setIsModalVisible(true)
  }

  // Handle update teacher
  const handleUpdateTeacher = async (values: any) => {
    if (!editingTeacher) return
    
    try {
      await apiClient.patch(`/teachers/${editingTeacher.id}`, {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : undefined,
        hireDate: values.hireDate ? values.hireDate.format('YYYY-MM-DD') : undefined,
      })
      message.success('Profesor actualizado exitosamente')
      setIsModalVisible(false)
      setEditingTeacher(null)
      form.resetFields()
      fetchTeachers()
    } catch (error: any) {
      if (error.response?.status === 409) {
        message.error('El email o número de empleado ya está registrado')
      } else {
        message.error('Error al actualizar profesor')
      }
      console.error('Error updating teacher:', error)
    }
  }

  // Handle delete teacher
  const handleDeleteTeacher = async (id: string) => {
    try {
      await apiClient.delete(`/teachers/${id}`)
      message.success('Profesor eliminado exitosamente')
      fetchTeachers()
    } catch (error) {
      message.error('Error al eliminar profesor')
      console.error('Error deleting teacher:', error)
    }
  }

  // Handle view details
  const handleViewDetails = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setIsDetailDrawerVisible(true)
  }

  // Generate autocomplete options
  const generateSearchOptions = (searchValue: string) => {
    if (!searchValue) return []
    
    const searchLower = searchValue.toLowerCase()
    const options: { value: string; label: string }[] = []

    teachers.forEach(teacher => {
      const fullName = `${teacher.user.profile.firstName} ${teacher.user.profile.lastName}`
      const email = teacher.user.email
      const employeeNumber = teacher.employeeNumber
      const department = teacher.user.profile.department || ''

      // Add matching names
      if (fullName.toLowerCase().includes(searchLower)) {
        options.push({
          value: fullName,
          label: `👤 ${fullName}`
        })
      }

      // Add matching emails
      if (email.toLowerCase().includes(searchLower)) {
        options.push({
          value: email,
          label: `📧 ${email}`
        })
      }

      // Add matching employee numbers
      if (employeeNumber.toLowerCase().includes(searchLower)) {
        options.push({
          value: employeeNumber,
          label: `🆔 ${employeeNumber}`
        })
      }

      // Add matching departments
      if (department.toLowerCase().includes(searchLower)) {
        options.push({
          value: department,
          label: `🏢 ${department}`
        })
      }
    })

    // Remove duplicates
    return options.filter((option, index, self) => 
      index === self.findIndex(t => t.value === option.value)
    ).slice(0, 10)
  }

  // Filter teachers based on search and filters
  const filteredTeachers = teachers.filter(teacher => {
    const fullName = `${teacher.user.profile.firstName} ${teacher.user.profile.lastName}`.toLowerCase()
    const email = teacher.user.email.toLowerCase()
    const employeeNumber = teacher.employeeNumber.toLowerCase()
    const department = (teacher.user.profile.department || '').toLowerCase()
    const searchLower = searchValue.toLowerCase()

    const matchesSearch = !searchValue || 
      fullName.includes(searchLower) ||
      email.includes(searchLower) ||
      employeeNumber.includes(searchLower) ||
      department.includes(searchLower)

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && teacher.user.isActive) ||
      (statusFilter === 'inactive' && !teacher.user.isActive)

    const matchesDepartment = departmentFilter === 'all' || 
      department === departmentFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesDepartment
  })

  // Get unique departments for filter
  const departments = Array.from(
    new Set(
      teachers
        .map(t => t.user.profile.department)
        .filter(Boolean)
    )
  )

  const columns: ColumnsType<Teacher> = [
    {
      title: 'Profesor',
      key: 'teacher',
      render: (_, record) => (
        <Space>
          <Avatar 
            size="large" 
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1890ff' }}
          >
            {record.user.profile.firstName?.[0]}{record.user.profile.lastName?.[0]}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.user.profile.firstName} {record.user.profile.lastName}
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.user.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Número de Empleado',
      dataIndex: 'employeeNumber',
      key: 'employeeNumber',
      render: (employeeNumber) => (
        <Tag color="blue">{employeeNumber}</Tag>
      ),
    },
    {
      title: 'Departamento',
      key: 'department',
      render: (_, record) => (
        <Tag color="green">
          {record.user.profile.department || 'Sin asignar'}
        </Tag>
      ),
    },
    {
      title: 'Especialidades',
      dataIndex: 'specialties',
      key: 'specialties',
      render: (specialties: string[]) => (
        <Space wrap>
          {specialties?.map(specialty => (
            <Tag key={specialty} color="orange">{specialty}</Tag>
          )) || <Text type="secondary">Sin especialidades</Text>}
        </Space>
      ),
    },
    {
      title: 'Estado',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.user.isActive ? 'success' : 'error'}>
          {record.user.isActive ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
    },
    {
      title: 'Fecha de Contratación',
      key: 'hireDate',
      render: (_, record) => {
        const hireDate = record.user.profile.hireDate
        return hireDate ? dayjs(hireDate).format('DD/MM/YYYY') : 'No especificada'
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver detalles">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditTeacher(record)}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Popconfirm
              title="¿Estás seguro de eliminar este profesor?"
              onConfirm={() => handleDeleteTeacher(record.id)}
              okText="Sí"
              cancelText="No"
            >
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ]

  // Early return for loading state
  if (loading && teachers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <Text type="secondary">Cargando profesores...</Text>
        </div>
      </div>
    )
  }

  // Early return for error state
  if (error && teachers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
          </div>
          <Title level={4} type="danger">Error al cargar profesores</Title>
          <Text type="secondary" className="block mb-4">{error}</Text>
          <Button type="primary" onClick={fetchTeachers}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="!mb-2">Gestión de Profesores</Title>
          <Text type="secondary">
            Administra los profesores del centro educativo
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingTeacher(null)
            form.resetFields()
            setIsModalVisible(true)
          }}
        >
          Nuevo Profesor
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={8}>
            <AutoComplete
              style={{ width: '100%' }}
              placeholder="Buscar por nombre, email, número de empleado..."
              value={searchValue}
              onChange={setSearchValue}
              options={generateSearchOptions(searchValue)}
              filterOption={false}
            >
              <Input 
                prefix={<SearchOutlined />} 
                allowClear
              />
            </AutoComplete>
          </Col>
          <Col xs={24} md={6} lg={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Estado"
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">Todos los estados</Option>
              <Option value="active">Activos</Option>
              <Option value="inactive">Inactivos</Option>
            </Select>
          </Col>
          <Col xs={24} md={6} lg={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Departamento"
              value={departmentFilter}
              onChange={setDepartmentFilter}
            >
              <Option value="all">Todos los departamentos</Option>
              {departments.map(dept => (
                <Option key={dept} value={dept?.toLowerCase()}>{dept}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Teachers Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredTeachers}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredTeachers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} profesores`,
          }}
        />
      </Card>

      {/* Create/Edit Teacher Modal */}
      <Modal
        title={editingTeacher ? 'Editar Profesor' : 'Nuevo Profesor'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          setEditingTeacher(null)
          form.resetFields()
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingTeacher ? handleUpdateTeacher : handleCreateTeacher}
          initialValues={{ isActive: true }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="employeeNumber"
                label="Número de Empleado"
                rules={[{ required: true, message: 'Ingrese el número de empleado' }]}
              >
                <Input placeholder="EMP001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Ingrese el email' },
                  { type: 'email', message: 'Email inválido' }
                ]}
              >
                <Input placeholder="profesor@colegio.com" />
              </Form.Item>
            </Col>
          </Row>

          {!editingTeacher && (
            <Form.Item
              name="password"
              label="Contraseña"
              rules={[
                { required: true, message: 'Ingrese la contraseña' },
                { min: 6, message: 'Mínimo 6 caracteres' }
              ]}
            >
              <Input.Password placeholder="Contraseña inicial" />
            </Form.Item>
          )}

          {editingTeacher && (
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="Nombre"
                rules={[{ required: true, message: 'Ingrese el nombre' }]}
              >
                <Input placeholder="Juan" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Apellidos"
                rules={[{ required: true, message: 'Ingrese los apellidos' }]}
              >
                <Input placeholder="Pérez García" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dateOfBirth" label="Fecha de Nacimiento">
                <DatePicker style={{ width: '100%' }} placeholder="Seleccionar fecha" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="documentNumber" label="Número de Documento">
                <Input placeholder="12345678A" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Teléfono">
                <Input placeholder="+34 600 123 456" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hireDate" label="Fecha de Contratación">
                <DatePicker style={{ width: '100%' }} placeholder="Seleccionar fecha" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Dirección">
            <Input placeholder="Calle Mayor, 123, Madrid" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="education" label="Formación Académica">
                <Input placeholder="Licenciado en Matemáticas" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="Departamento">
                <Input placeholder="Departamento de Ciencias" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="position" label="Cargo">
                <Input placeholder="Profesor Titular" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isActive" label="Estado" valuePropName="checked">
                <Select>
                  <Option value={true}>Activo</Option>
                  <Option value={false}>Inactivo</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="specialties" label="Especialidades">
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Matemáticas, Física, Química..."
              tokenSeparators={[',']}
            />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => {
              setIsModalVisible(false)
              setEditingTeacher(null)
              form.resetFields()
            }}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit">
              {editingTeacher ? 'Actualizar' : 'Crear'} Profesor
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Teacher Details Drawer */}
      <Drawer
        title="Detalles del Profesor"
        placement="right"
        onClose={() => setIsDetailDrawerVisible(false)}
        open={isDetailDrawerVisible}
        width={600}
      >
        {selectedTeacher && (
          <div className="space-y-6">
            {/* Header with avatar and basic info */}
            <div className="text-center pb-4">
              <Avatar 
                size={80} 
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1890ff', marginBottom: 16 }}
              >
                {selectedTeacher.user.profile.firstName?.[0]}
                {selectedTeacher.user.profile.lastName?.[0]}
              </Avatar>
              <Title level={3} className="!mb-2">
                {selectedTeacher.user.profile.firstName} {selectedTeacher.user.profile.lastName}
              </Title>
              <Text type="secondary">{selectedTeacher.user.email}</Text>
              <div className="mt-2">
                <Tag color={selectedTeacher.user.isActive ? 'success' : 'error'}>
                  {selectedTeacher.user.isActive ? 'Activo' : 'Inactivo'}
                </Tag>
              </div>
            </div>

            <Divider />

            {/* Professional Information */}
            <div>
              <Title level={4}>
                <TeamOutlined /> Información Profesional
              </Title>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>Número de Empleado:</Text>
                  <div>{selectedTeacher.employeeNumber}</div>
                </Col>
                <Col span={12}>
                  <Text strong>Departamento:</Text>
                  <div>{selectedTeacher.user.profile.department || 'No asignado'}</div>
                </Col>
                <Col span={12}>
                  <Text strong>Cargo:</Text>
                  <div>{selectedTeacher.user.profile.position || 'No especificado'}</div>
                </Col>
                <Col span={12}>
                  <Text strong>Fecha de Contratación:</Text>
                  <div>
                    {selectedTeacher.user.profile.hireDate 
                      ? dayjs(selectedTeacher.user.profile.hireDate).format('DD/MM/YYYY')
                      : 'No especificada'
                    }
                  </div>
                </Col>
                <Col span={24}>
                  <Text strong>Especialidades:</Text>
                  <div className="mt-1">
                    <Space wrap>
                      {selectedTeacher.specialties?.map(specialty => (
                        <Tag key={specialty} color="orange">{specialty}</Tag>
                      )) || <Text type="secondary">Sin especialidades</Text>}
                    </Space>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider />

            {/* Personal Information */}
            <div>
              <Title level={4}>
                <UserOutlined /> Información Personal
              </Title>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>Fecha de Nacimiento:</Text>
                  <div>
                    {selectedTeacher.user.profile.dateOfBirth
                      ? dayjs(selectedTeacher.user.profile.dateOfBirth).format('DD/MM/YYYY')
                      : 'No especificada'
                    }
                  </div>
                </Col>
                <Col span={12}>
                  <Text strong>Documento:</Text>
                  <div>{selectedTeacher.user.profile.documentNumber || 'No especificado'}</div>
                </Col>
                <Col span={24}>
                  <Text strong>Teléfono:</Text>
                  <div>{selectedTeacher.user.profile.phone || 'No especificado'}</div>
                </Col>
                <Col span={24}>
                  <Text strong>Dirección:</Text>
                  <div>{selectedTeacher.user.profile.address || 'No especificada'}</div>
                </Col>
                <Col span={24}>
                  <Text strong>Formación Académica:</Text>
                  <div>{selectedTeacher.user.profile.education || 'No especificada'}</div>
                </Col>
              </Row>
            </div>

            <Divider />

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button 
                icon={<EditOutlined />}
                onClick={() => {
                  setIsDetailDrawerVisible(false)
                  handleEditTeacher(selectedTeacher)
                }}
              >
                Editar Profesor
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default TeachersPage