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
  Row,
  Col,
  Steps,
  Alert,
  Descriptions,
  Badge,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  EyeOutlined,
  FilterOutlined,
  UserAddOutlined,
  TeamOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  IdcardOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import apiClient from '@services/apiClient'

const { Title, Text } = Typography
const { Option } = Select

// Interfaces
interface FamilyContact {
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
    education?: string // Used for occupation
  }
}

interface FamilyStudent {
  id: string
  student: {
    id: string
    enrollmentNumber: string
    user: {
      profile: {
        firstName: string
        lastName: string
      }
    }
  }
  relationship: 'father' | 'mother' | 'guardian' | 'other'
}

interface Family {
  id: string
  primaryContact: FamilyContact
  secondaryContact?: FamilyContact
  students?: FamilyStudent[]
  createdAt: string
  updatedAt: string
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

const relationshipLabels = {
  father: 'Padre',
  mother: 'Madre',
  guardian: 'Tutor/a',
  other: 'Otro'
}

const relationshipColors = {
  father: 'blue',
  mother: 'pink',
  guardian: 'green',
  other: 'orange'
}

const FamiliesPage: React.FC = () => {
  // State management
  const [families, setFamilies] = useState<Family[]>([])
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [searchOptions, setSearchOptions] = useState<{ value: string; label: string }[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false)
  const [editingFamily, setEditingFamily] = useState<Family | null>(null)
  const [viewingFamily, setViewingFamily] = useState<Family | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [form] = Form.useForm()

  // Fetch families
  const fetchFamilies = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/families')
      setFamilies(response.data)
    } catch (error) {
      message.error('Error al cargar familias')
    } finally {
      setLoading(false)
    }
  }

  // Fetch available students
  const fetchAvailableStudents = async () => {
    try {
      const response = await apiClient.get('/families/available-students')
      setAvailableStudents(response.data)
    } catch (error) {
      message.error('Error al cargar estudiantes disponibles')
    }
  }

  useEffect(() => {
    fetchFamilies()
    fetchAvailableStudents()
  }, [])

  // Generate search options for autocomplete
  const generateSearchOptions = (searchValue: string) => {
    if (!searchValue || searchValue.length < 2) {
      setSearchOptions([])
      return
    }

    const options: { value: string; label: string }[] = []
    const searchLower = searchValue.toLowerCase()

    families.forEach(family => {
      // Primary contact
      const primaryName = `${family.primaryContact.profile.firstName} ${family.primaryContact.profile.lastName}`
      const primaryEmail = family.primaryContact.email

      if (primaryName.toLowerCase().includes(searchLower)) {
        options.push({
          value: primaryName,
          label: `👨‍👩‍👧‍👦 ${primaryName} (Contacto Principal)`,
        })
      }

      if (primaryEmail.toLowerCase().includes(searchLower)) {
        options.push({
          value: primaryEmail,
          label: `📧 ${primaryEmail}`,
        })
      }

      // Secondary contact
      if (family.secondaryContact) {
        const secondaryName = `${family.secondaryContact.profile.firstName} ${family.secondaryContact.profile.lastName}`
        const secondaryEmail = family.secondaryContact.email

        if (secondaryName.toLowerCase().includes(searchLower)) {
          options.push({
            value: secondaryName,
            label: `👤 ${secondaryName} (Contacto Secundario)`,
          })
        }

        if (secondaryEmail.toLowerCase().includes(searchLower)) {
          options.push({
            value: secondaryEmail,
            label: `📧 ${secondaryEmail}`,
          })
        }
      }

      // Students
      family.students?.forEach(familyStudent => {
        const studentName = `${familyStudent.student.user.profile.firstName} ${familyStudent.student.user.profile.lastName}`
        if (studentName.toLowerCase().includes(searchLower)) {
          options.push({
            value: studentName,
            label: `🎓 ${studentName} (${familyStudent.student.enrollmentNumber})`,
          })
        }
      })
    })

    // Remove duplicates and limit to 10 results
    const uniqueOptions = options.filter((option, index, self) => 
      index === self.findIndex(o => o.value === option.value)
    ).slice(0, 10)

    setSearchOptions(uniqueOptions)
  }

  // Filter families
  const filteredFamilies = families.filter(family => {
    const primaryName = `${family.primaryContact.profile.firstName} ${family.primaryContact.profile.lastName}`.toLowerCase()
    const primaryEmail = family.primaryContact.email.toLowerCase()
    const secondaryName = family.secondaryContact 
      ? `${family.secondaryContact.profile.firstName} ${family.secondaryContact.profile.lastName}`.toLowerCase()
      : ''
    const secondaryEmail = family.secondaryContact?.email.toLowerCase() || ''

    const studentNames = family.students?.map(fs => 
      `${fs.student.user.profile.firstName} ${fs.student.user.profile.lastName}`.toLowerCase()
    ).join(' ') || ''

    const searchLower = searchText.toLowerCase()

    const matchesSearch = 
      primaryName.includes(searchLower) ||
      primaryEmail.includes(searchLower) ||
      secondaryName.includes(searchLower) ||
      secondaryEmail.includes(searchLower) ||
      studentNames.includes(searchLower)
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && family.primaryContact.isActive) ||
      (statusFilter === 'inactive' && !family.primaryContact.isActive) ||
      (statusFilter === 'dual' && family.secondaryContact) ||
      (statusFilter === 'single' && !family.secondaryContact)
    
    return matchesSearch && matchesStatus
  })

  // Table columns
  const columns: ColumnsType<Family> = [
    {
      title: 'Familia',
      key: 'family',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <Avatar icon={<TeamOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <div>
              <div className="font-medium">
                {record.primaryContact.profile.firstName} {record.primaryContact.profile.lastName}
              </div>
              <Text type="secondary" className="text-sm">
                Contacto Principal
              </Text>
            </div>
          </Space>
          {record.secondaryContact && (
            <Space className="ml-8">
              <Avatar icon={<UserOutlined />} size="small" style={{ backgroundColor: '#52c41a' }} />
              <div>
                <Text className="text-sm">
                  {record.secondaryContact.profile.firstName} {record.secondaryContact.profile.lastName}
                </Text>
                <div>
                  <Text type="secondary" className="text-xs">
                    Contacto Secundario
                  </Text>
                </div>
              </div>
            </Space>
          )}
        </Space>
      ),
    },
    {
      title: 'Estudiantes',
      key: 'students',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.students?.map(familyStudent => (
            <Space key={familyStudent.id} size="small">
              <Tag color={relationshipColors[familyStudent.relationship]}>
                {relationshipLabels[familyStudent.relationship]}
              </Tag>
              <span className="text-sm">
                {familyStudent.student.user.profile.firstName} {familyStudent.student.user.profile.lastName}
              </span>
              <Text type="secondary" className="text-xs">
                ({familyStudent.student.enrollmentNumber})
              </Text>
            </Space>
          )) || <Text type="secondary">Sin estudiantes asignados</Text>}
        </Space>
      ),
    },
    {
      title: 'Tipo de Familia',
      key: 'type',
      render: (_, record) => (
        <Tag color={record.secondaryContact ? 'green' : 'blue'}>
          {record.secondaryContact ? 'Doble Acceso' : 'Acceso Individual'}
        </Tag>
      ),
    },
    {
      title: 'Estado',
      key: 'status',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Badge 
            status={record.primaryContact.isActive ? 'success' : 'error'} 
            text={record.primaryContact.isActive ? 'Activo' : 'Inactivo'}
          />
          {record.secondaryContact && (
            <Badge 
              status={record.secondaryContact.isActive ? 'success' : 'error'} 
              text={record.secondaryContact.isActive ? 'Activo' : 'Inactivo'}
            />
          )}
        </Space>
      ),
    },
    {
      title: 'Fecha de Registro',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('es-ES'),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver detalles">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => handleViewFamily(record)}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button 
              type="text" 
              icon={<EditOutlined />}
              onClick={() => handleEditFamily(record)}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Popconfirm
              title="¿Estás seguro de eliminar esta familia?"
              description="Esta acción desactivará los accesos de los contactos familiares."
              onConfirm={() => handleDeleteFamily(record.id)}
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

  // Handlers
  const handleViewFamily = (family: Family) => {
    setViewingFamily(family)
    setIsDetailDrawerVisible(true)
  }

  const handleEditFamily = (family: Family) => {
    setEditingFamily(family)
    setCurrentStep(0)
    
    // Populate form with existing data
    form.setFieldsValue({
      // Primary contact
      primaryEmail: family.primaryContact.email,
      primaryFirstName: family.primaryContact.profile.firstName,
      primaryLastName: family.primaryContact.profile.lastName,
      primaryDateOfBirth: family.primaryContact.profile.dateOfBirth ? dayjs(family.primaryContact.profile.dateOfBirth) : null,
      primaryDocumentNumber: family.primaryContact.profile.documentNumber,
      primaryPhone: family.primaryContact.profile.phone,
      primaryAddress: family.primaryContact.profile.address,
      primaryOccupation: family.primaryContact.profile.education,
      
      // Secondary contact
      ...(family.secondaryContact && {
        hasSecondaryContact: true,
        secondaryEmail: family.secondaryContact.email,
        secondaryFirstName: family.secondaryContact.profile.firstName,
        secondaryLastName: family.secondaryContact.profile.lastName,
        secondaryDateOfBirth: family.secondaryContact.profile.dateOfBirth ? dayjs(family.secondaryContact.profile.dateOfBirth) : null,
        secondaryDocumentNumber: family.secondaryContact.profile.documentNumber,
        secondaryPhone: family.secondaryContact.profile.phone,
        secondaryAddress: family.secondaryContact.profile.address,
        secondaryOccupation: family.secondaryContact.profile.education,
      }),
      
      // Students
      students: family.students?.map(fs => ({
        studentId: fs.student.id,
        relationship: fs.relationship
      })) || []
    })
    
    setIsModalVisible(true)
  }

  const handleDeleteFamily = async (familyId: string) => {
    try {
      await apiClient.delete(`/families/${familyId}`)
      message.success('Familia eliminada correctamente')
      fetchFamilies()
    } catch (error) {
      message.error('Error al eliminar familia')
    }
  }

  const handleAddFamily = () => {
    setEditingFamily(null)
    setCurrentStep(0)
    form.resetFields()
    form.setFieldsValue({ hasSecondaryContact: false })
    setIsModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      // Helper function to remove undefined/null values
      const filterEmptyValues = (obj: any) => {
        const filtered: any = {}
        Object.keys(obj).forEach(key => {
          if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
            filtered[key] = obj[key]
          }
        })
        return filtered
      }
      
      // Prepare primary contact data
      const primaryContactData = filterEmptyValues({
        email: values.primaryEmail,
        password: values.primaryPassword,
        firstName: values.primaryFirstName,
        lastName: values.primaryLastName,
        dateOfBirth: values.primaryDateOfBirth ? dayjs(values.primaryDateOfBirth).format('YYYY-MM-DD') : undefined,
        documentNumber: values.primaryDocumentNumber,
        phone: values.primaryPhone,
        address: values.primaryAddress,
        occupation: values.primaryOccupation,
      })
      
      // Prepare secondary contact data
      let secondaryContactData = null
      if (values.hasSecondaryContact) {
        secondaryContactData = filterEmptyValues({
          email: values.secondaryEmail,
          password: values.secondaryPassword,
          firstName: values.secondaryFirstName,
          lastName: values.secondaryLastName,
          dateOfBirth: values.secondaryDateOfBirth ? dayjs(values.secondaryDateOfBirth).format('YYYY-MM-DD') : undefined,
          documentNumber: values.secondaryDocumentNumber,
          phone: values.secondaryPhone,
          address: values.secondaryAddress,
          occupation: values.secondaryOccupation,
        })
      }
      
      // Prepare final submit data
      const submitData: any = {
        students: values.students || []
      }
      
      // Only include contacts if they have data
      if (Object.keys(primaryContactData).length > 0) {
        submitData.primaryContact = primaryContactData
      }
      
      if (secondaryContactData && Object.keys(secondaryContactData).length > 0) {
        submitData.secondaryContact = secondaryContactData
      }

      if (editingFamily) {
        // Update family
        await apiClient.patch(`/families/${editingFamily.id}`, submitData)
        message.success('Familia actualizada correctamente')
      } else {
        // Create new family
        await apiClient.post('/families', submitData)
        message.success('Familia creada correctamente')
      }
      
      setIsModalVisible(false)
      form.resetFields()
      setCurrentStep(0)
      fetchFamilies()
      fetchAvailableStudents()
    } catch (error: any) {
      console.error('Error submitting family:', error)
      message.error(error.response?.data?.message || 'Error al guardar familia')
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
    setEditingFamily(null)
    setCurrentStep(0)
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
    setViewingFamily(null)
  }

  const nextStep = () => setCurrentStep(currentStep + 1)
  const prevStep = () => setCurrentStep(currentStep - 1)

  // Form steps
  const steps = [
    {
      title: 'Contacto Principal',
      icon: <UserOutlined />,
    },
    {
      title: 'Contacto Secundario',
      icon: <UserAddOutlined />,
    },
    {
      title: 'Estudiantes',
      icon: <TeamOutlined />,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="!mb-2">
            Gestión de Familias
          </Title>
          <Text type="secondary">
            Administra las familias del centro educativo con sistema de doble acceso
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAddFamily}
        >
          Nueva Familia
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex gap-4 items-center flex-wrap">
          <AutoComplete
            placeholder="Buscar familias..."
            value={searchText}
            options={searchOptions}
            onSearch={handleSearchChange}
            onSelect={handleSearchSelect}
            onChange={handleSearchChange}
            className="w-64"
            allowClear
          >
            <Input prefix={<SearchOutlined />} />
          </AutoComplete>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-48"
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">Todas las familias</Option>
            <Option value="active">Contactos activos</Option>
            <Option value="inactive">Contactos inactivos</Option>
            <Option value="dual">Doble acceso</Option>
            <Option value="single">Acceso individual</Option>
          </Select>
          <Text type="secondary">
            {filteredFamilies.length} familia(s) encontrada(s)
          </Text>
        </div>
      </Card>

      {/* Families Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredFamilies}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} familias`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Family Details Drawer */}
      <Drawer
        title="Detalles de la Familia"
        placement="right"
        size="large"
        onClose={handleDetailDrawerClose}
        open={isDetailDrawerVisible}
        extra={
          viewingFamily && (
            <Space>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => {
                  handleDetailDrawerClose()
                  handleEditFamily(viewingFamily)
                }}
              >
                Editar
              </Button>
            </Space>
          )
        }
      >
        {viewingFamily && (
          <div className="space-y-6">
            {/* Family Header */}
            <div className="text-center border-b pb-6">
              <Avatar 
                size={80} 
                icon={<TeamOutlined />}
                style={{ backgroundColor: '#1890ff' }}
                className="mb-4"
              />
              <h2 className="text-xl font-bold mb-2">
                Familia {viewingFamily.primaryContact.profile.lastName}
              </h2>
              <Space>
                <Tag color={viewingFamily.secondaryContact ? 'green' : 'blue'}>
                  {viewingFamily.secondaryContact ? 'Doble Acceso' : 'Acceso Individual'}
                </Tag>
                <Tag color="purple">
                  {viewingFamily.students?.length || 0} estudiante(s)
                </Tag>
              </Space>
            </div>

            {/* Primary Contact */}
            <div>
              <Title level={4}>
                <UserOutlined /> Contacto Principal
              </Title>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Nombre" span={2}>
                  {viewingFamily.primaryContact.profile.firstName} {viewingFamily.primaryContact.profile.lastName}
                </Descriptions.Item>
                <Descriptions.Item label="Email" span={2}>
                  <Space>
                    <MailOutlined />
                    {viewingFamily.primaryContact.email}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Teléfono">
                  <Space>
                    <PhoneOutlined />
                    {viewingFamily.primaryContact.profile.phone || 'No especificado'}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="DNI/NIE">
                  <Space>
                    <IdcardOutlined />
                    {viewingFamily.primaryContact.profile.documentNumber || 'No especificado'}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Fecha de Nacimiento">
                  {viewingFamily.primaryContact.profile.dateOfBirth 
                    ? new Date(viewingFamily.primaryContact.profile.dateOfBirth).toLocaleDateString('es-ES')
                    : 'No especificada'
                  }
                </Descriptions.Item>
                <Descriptions.Item label="Ocupación">
                  {viewingFamily.primaryContact.profile.education || 'No especificada'}
                </Descriptions.Item>
                <Descriptions.Item label="Dirección" span={2}>
                  <Space>
                    <HomeOutlined />
                    {viewingFamily.primaryContact.profile.address || 'No especificada'}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Estado" span={2}>
                  <Badge 
                    status={viewingFamily.primaryContact.isActive ? 'success' : 'error'} 
                    text={viewingFamily.primaryContact.isActive ? 'Activo' : 'Inactivo'}
                  />
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* Secondary Contact */}
            {viewingFamily.secondaryContact && (
              <div>
                <Title level={4}>
                  <UserAddOutlined /> Contacto Secundario
                </Title>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Nombre" span={2}>
                    {viewingFamily.secondaryContact.profile.firstName} {viewingFamily.secondaryContact.profile.lastName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email" span={2}>
                    <Space>
                      <MailOutlined />
                      {viewingFamily.secondaryContact.email}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Teléfono">
                    <Space>
                      <PhoneOutlined />
                      {viewingFamily.secondaryContact.profile.phone || 'No especificado'}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="DNI/NIE">
                    <Space>
                      <IdcardOutlined />
                      {viewingFamily.secondaryContact.profile.documentNumber || 'No especificado'}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Fecha de Nacimiento">
                    {viewingFamily.secondaryContact.profile.dateOfBirth 
                      ? new Date(viewingFamily.secondaryContact.profile.dateOfBirth).toLocaleDateString('es-ES')
                      : 'No especificada'
                    }
                  </Descriptions.Item>
                  <Descriptions.Item label="Ocupación">
                    {viewingFamily.secondaryContact.profile.education || 'No especificada'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Dirección" span={2}>
                    <Space>
                      <HomeOutlined />
                      {viewingFamily.secondaryContact.profile.address || 'No especificada'}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Estado" span={2}>
                    <Badge 
                      status={viewingFamily.secondaryContact.isActive ? 'success' : 'error'} 
                      text={viewingFamily.secondaryContact.isActive ? 'Activo' : 'Inactivo'}
                    />
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}

            {/* Students */}
            <div>
              <Title level={4}>
                <TeamOutlined /> Estudiantes
              </Title>
              {viewingFamily.students && viewingFamily.students.length > 0 ? (
                <div className="space-y-3">
                  {viewingFamily.students.map(familyStudent => (
                    <Card key={familyStudent.id} size="small">
                      <Space className="w-full justify-between">
                        <Space>
                          <Avatar icon={<UserOutlined />} />
                          <div>
                            <div className="font-medium">
                              {familyStudent.student.user.profile.firstName} {familyStudent.student.user.profile.lastName}
                            </div>
                            <Text type="secondary" className="text-sm">
                              {familyStudent.student.enrollmentNumber}
                            </Text>
                          </div>
                        </Space>
                        <Tag color={relationshipColors[familyStudent.relationship]}>
                          {relationshipLabels[familyStudent.relationship]}
                        </Tag>
                      </Space>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert
                  message="Sin estudiantes asignados"
                  description="Esta familia no tiene estudiantes asociados."
                  type="info"
                  showIcon
                />
              )}
            </div>

            {/* Timestamps */}
            <div>
              <Title level={4}>Información del Sistema</Title>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Fecha de Registro">
                  {new Date(viewingFamily.createdAt).toLocaleString('es-ES')}
                </Descriptions.Item>
                <Descriptions.Item label="Última Actualización">
                  {new Date(viewingFamily.updatedAt).toLocaleString('es-ES')}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add/Edit Family Modal */}
      <Modal
        title={
          <Space>
            <TeamOutlined />
            {editingFamily ? 'Editar Familia' : 'Nueva Familia'}
          </Space>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        destroyOnClose
      >
        <div className="mt-4">
          <Steps current={currentStep} items={steps} className="mb-6" />
          
          <Form
            form={form}
            layout="vertical"
            initialValues={{ hasSecondaryContact: false }}
          >
            {/* Step 0: Primary Contact */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <Alert
                  message="Contacto Principal"
                  description="Este será el contacto principal de la familia. Debe tener acceso completo al sistema."
                  type="info"
                  showIcon
                  className="mb-4"
                />
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="primaryFirstName"
                      label="Nombre"
                      rules={[{ required: true, message: 'El nombre es requerido' }]}
                    >
                      <Input placeholder="Nombre del contacto principal" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="primaryLastName"
                      label="Apellidos"
                      rules={[{ required: true, message: 'Los apellidos son requeridos' }]}
                    >
                      <Input placeholder="Apellidos del contacto principal" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="primaryEmail"
                      label="Email"
                      rules={[
                        { required: true, message: 'El email es requerido' },
                        { type: 'email', message: 'Email no válido' }
                      ]}
                    >
                      <Input prefix={<MailOutlined />} placeholder="email@ejemplo.com" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="primaryPhone"
                      label="Teléfono"
                      rules={[{ required: true, message: 'El teléfono es requerido' }]}
                    >
                      <Input prefix={<PhoneOutlined />} placeholder="+34 600 000 000" />
                    </Form.Item>
                  </Col>
                </Row>

                {!editingFamily && (
                  <Form.Item
                    name="primaryPassword"
                    label="Contraseña"
                    rules={[
                      { required: true, message: 'La contraseña es requerida' },
                      { min: 6, message: 'Mínimo 6 caracteres' }
                    ]}
                  >
                    <Input.Password placeholder="Contraseña para el acceso" />
                  </Form.Item>
                )}

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="primaryDocumentNumber"
                      label="DNI/NIE"
                    >
                      <Input prefix={<IdcardOutlined />} placeholder="12345678A" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="primaryDateOfBirth"
                      label="Fecha de Nacimiento"
                    >
                      <DatePicker 
                        placeholder="Selecciona fecha" 
                        format="DD/MM/YYYY"
                        className="w-full"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="primaryAddress"
                  label="Dirección"
                >
                  <Input prefix={<HomeOutlined />} placeholder="Calle Mayor, 123, Madrid" />
                </Form.Item>

                <Form.Item
                  name="primaryOccupation"
                  label="Ocupación"
                >
                  <Input placeholder="Profesión o ocupación" />
                </Form.Item>
              </div>
            )}

            {/* Step 1: Secondary Contact */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <Form.Item
                  name="hasSecondaryContact"
                  valuePropName="checked"
                >
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={form.getFieldValue('hasSecondaryContact')}
                        onChange={(e) => {
                          form.setFieldValue('hasSecondaryContact', e.target.checked)
                          if (!e.target.checked) {
                            // Clear secondary contact fields
                            const secondaryFields = [
                              'secondaryFirstName', 'secondaryLastName', 'secondaryEmail', 
                              'secondaryPassword', 'secondaryPhone', 'secondaryDocumentNumber',
                              'secondaryDateOfBirth', 'secondaryAddress', 'secondaryOccupation'
                            ]
                            secondaryFields.forEach(field => form.setFieldValue(field, undefined))
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="font-medium">Añadir contacto secundario</div>
                        <Text type="secondary" className="text-sm">
                          Permite que otro progenitor o tutor tenga acceso independiente
                        </Text>
                      </div>
                    </div>
                  </div>
                </Form.Item>

                {form.getFieldValue('hasSecondaryContact') && (
                  <div className="space-y-4">
                    <Alert
                      message="Contacto Secundario"
                      description="Este contacto tendrá acceso independiente al sistema para el seguimiento de los estudiantes."
                      type="success"
                      showIcon
                    />
                    
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="secondaryFirstName"
                          label="Nombre"
                          rules={form.getFieldValue('hasSecondaryContact') ? [{ required: true, message: 'El nombre es requerido' }] : []}
                        >
                          <Input placeholder="Nombre del contacto secundario" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="secondaryLastName"
                          label="Apellidos"
                          rules={form.getFieldValue('hasSecondaryContact') ? [{ required: true, message: 'Los apellidos son requeridos' }] : []}
                        >
                          <Input placeholder="Apellidos del contacto secundario" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="secondaryEmail"
                          label="Email"
                          rules={form.getFieldValue('hasSecondaryContact') ? [
                            { required: true, message: 'El email es requerido' },
                            { type: 'email', message: 'Email no válido' }
                          ] : []}
                        >
                          <Input prefix={<MailOutlined />} placeholder="email@ejemplo.com" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="secondaryPhone"
                          label="Teléfono"
                          rules={form.getFieldValue('hasSecondaryContact') ? [{ required: true, message: 'El teléfono es requerido' }] : []}
                        >
                          <Input prefix={<PhoneOutlined />} placeholder="+34 600 000 000" />
                        </Form.Item>
                      </Col>
                    </Row>

                    {!editingFamily && (
                      <Form.Item
                        name="secondaryPassword"
                        label="Contraseña"
                        rules={form.getFieldValue('hasSecondaryContact') ? [
                          { required: true, message: 'La contraseña es requerida' },
                          { min: 6, message: 'Mínimo 6 caracteres' }
                        ] : []}
                      >
                        <Input.Password placeholder="Contraseña para el acceso" />
                      </Form.Item>
                    )}

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="secondaryDocumentNumber"
                          label="DNI/NIE"
                        >
                          <Input prefix={<IdcardOutlined />} placeholder="12345678A" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="secondaryDateOfBirth"
                          label="Fecha de Nacimiento"
                        >
                          <DatePicker 
                            placeholder="Selecciona fecha" 
                            format="DD/MM/YYYY"
                            className="w-full"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="secondaryAddress"
                      label="Dirección"
                    >
                      <Input prefix={<HomeOutlined />} placeholder="Calle Mayor, 123, Madrid" />
                    </Form.Item>

                    <Form.Item
                      name="secondaryOccupation"
                      label="Ocupación"
                    >
                      <Input placeholder="Profesión o ocupación" />
                    </Form.Item>
                  </div>
                )}

                {!form.getFieldValue('hasSecondaryContact') && (
                  <Alert
                    message="Acceso Individual"
                    description="La familia tendrá un solo acceso al sistema a través del contacto principal."
                    type="info"
                    showIcon
                  />
                )}
              </div>
            )}

            {/* Step 2: Students */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <Alert
                  message="Asignación de Estudiantes"
                  description="Selecciona los estudiantes que pertenecen a esta familia y define la relación familiar."
                  type="info"
                  showIcon
                />

                <Form.List name="students">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Card key={key} size="small" className="mb-4">
                          <Row gutter={16} align="middle">
                            <Col span={10}>
                              <Form.Item
                                {...restField}
                                name={[name, 'studentId']}
                                label="Estudiante"
                                rules={[{ required: true, message: 'Selecciona un estudiante' }]}
                              >
                                <Select
                                  placeholder="Seleccionar estudiante"
                                  showSearch
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                                  }
                                >
                                  {availableStudents.map(student => (
                                    <Option key={student.id} value={student.id}>
                                      {student.user.profile.firstName} {student.user.profile.lastName} ({student.enrollmentNumber})
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={10}>
                              <Form.Item
                                {...restField}
                                name={[name, 'relationship']}
                                label="Relación"
                                rules={[{ required: true, message: 'Selecciona la relación' }]}
                              >
                                <Select placeholder="Relación familiar">
                                  <Option value="father">
                                    <Space>
                                      <Tag color="blue">Padre</Tag>
                                    </Space>
                                  </Option>
                                  <Option value="mother">
                                    <Space>
                                      <Tag color="pink">Madre</Tag>
                                    </Space>
                                  </Option>
                                  <Option value="guardian">
                                    <Space>
                                      <Tag color="green">Tutor/a</Tag>
                                    </Space>
                                  </Option>
                                  <Option value="other">
                                    <Space>
                                      <Tag color="orange">Otro</Tag>
                                    </Space>
                                  </Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Button 
                                type="text" 
                                danger 
                                icon={<DeleteOutlined />}
                                onClick={() => remove(name)}
                              >
                                Eliminar
                              </Button>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Añadir Estudiante
                      </Button>
                    </>
                  )}
                </Form.List>

                {availableStudents.length === 0 && (
                  <Alert
                    message="No hay estudiantes disponibles"
                    description="Primero debes crear estudiantes en el sistema antes de asignarlos a familias."
                    type="warning"
                    showIcon
                  />
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-6 pt-4 border-t">
              <Button 
                onClick={prevStep} 
                disabled={currentStep === 0}
              >
                Anterior
              </Button>
              
              <div className="flex gap-2">
                <Button onClick={handleCancel}>
                  Cancelar
                </Button>
                
                {currentStep < steps.length - 1 ? (
                  <Button type="primary" onClick={nextStep}>
                    Siguiente
                  </Button>
                ) : (
                  <Button type="primary" onClick={handleSubmit}>
                    {editingFamily ? 'Actualizar' : 'Crear'} Familia
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  )
}

export default FamiliesPage