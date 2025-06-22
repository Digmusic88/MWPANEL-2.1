import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Drawer,
  Tag,
  Typography,
  Row,
  Col,
  Divider,
  Avatar,
  List,
  Popconfirm,
  Transfer,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import apiClient from '@services/apiClient';

const { Title, Text } = Typography;
const { Option } = Select;

interface ClassGroup {
  id: string;
  name: string;
  section: string;
  academicYear: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  };
  courses: Array<{
    id: string;
    name: string;
    order: number;
    cycle: {
      id: string;
      name: string;
      educationalLevel: {
        id: string;
        name: string;
        code: string;
      };
    };
  }>;
  tutor: {
    id: string;
    employeeNumber: string;
    specialties: string[];
    user: {
      id: string;
      email: string;
      profile: {
        firstName: string;
        lastName: string;
        department: string;
        position: string;
      };
    };
  };
  students: Array<{
    id: string;
    enrollmentNumber: string;
    user: {
      id: string;
      email: string;
      profile: {
        firstName: string;
        lastName: string;
      };
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Teacher {
  id: string;
  employeeNumber: string;
  specialties: string[];
  user: {
    profile: {
      firstName: string;
      lastName: string;
      department: string;
      position: string;
    };
  };
}

interface Student {
  id: string;
  enrollmentNumber: string;
  user: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

interface Course {
  id: string;
  name: string;
  order: number;
  cycle: {
    name: string;
    educationalLevel: {
      name: string;
    };
  };
}

const ClassGroupsPage: React.FC = () => {
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [academicYears] = useState<AcademicYear[]>([
    {
      id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20',
      name: '2024-2025',
      startDate: '2024-09-01',
      endDate: '2025-06-30',
      isCurrent: true,
    },
  ]);
  const [courses] = useState<Course[]>([
    {
      id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30',
      name: '1º Primaria',
      order: 1,
      cycle: { name: 'Primer Ciclo', educationalLevel: { name: 'Primaria' } },
    },
    {
      id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31',
      name: '2º Primaria',
      order: 2,
      cycle: { name: 'Primer Ciclo', educationalLevel: { name: 'Primaria' } },
    },
    {
      id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32',
      name: '3º Primaria',
      order: 3,
      cycle: { name: 'Segundo Ciclo', educationalLevel: { name: 'Primaria' } },
    },
    {
      id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      name: '4º Primaria',
      order: 4,
      cycle: { name: 'Segundo Ciclo', educationalLevel: { name: 'Primaria' } },
    },
    {
      id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34',
      name: '5º Primaria',
      order: 5,
      cycle: { name: 'Tercer Ciclo', educationalLevel: { name: 'Primaria' } },
    },
    {
      id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35',
      name: '6º Primaria',
      order: 6,
      cycle: { name: 'Tercer Ciclo', educationalLevel: { name: 'Primaria' } },
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [transferVisible, setTransferVisible] = useState(false);
  const [editingClassGroup, setEditingClassGroup] = useState<ClassGroup | null>(null);
  const [selectedClassGroup, setSelectedClassGroup] = useState<ClassGroup | null>(null);
  const [form] = Form.useForm();

  // Transfer states
  const [targetKeys, setTargetKeys] = useState<string[]>([]);

  useEffect(() => {
    fetchClassGroups();
    fetchTeachers();
    fetchStudents();
  }, []);

  const fetchClassGroups = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/class-groups');
      setClassGroups(response.data);
    } catch (error: any) {
      message.error('Error al cargar grupos de clase: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await apiClient.get('/class-groups/available-teachers');
      setTeachers(response.data);
    } catch (error: any) {
      message.error('Error al cargar profesores: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await apiClient.get('/class-groups/available-students');
      setStudents(response.data);
    } catch (error: any) {
      message.error('Error al cargar estudiantes: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCreate = () => {
    setEditingClassGroup(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: ClassGroup) => {
    setEditingClassGroup(record);
    form.setFieldsValue({
      name: record.name,
      section: record.section,
      academicYearId: record.academicYear.id,
      courseIds: record.courses.map(c => c.id),
      tutorId: record.tutor?.id,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/class-groups/${id}`);
      message.success('Grupo de clase eliminado exitosamente');
      fetchClassGroups();
    } catch (error: any) {
      message.error('Error al eliminar grupo de clase: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingClassGroup) {
        await apiClient.patch(`/class-groups/${editingClassGroup.id}`, values);
        message.success('Grupo de clase actualizado exitosamente');
      } else {
        await apiClient.post('/class-groups', values);
        message.success('Grupo de clase creado exitosamente');
      }
      setModalVisible(false);
      form.resetFields();
      fetchClassGroups();
    } catch (error: any) {
      message.error('Error al guardar grupo de clase: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleViewDetails = (record: ClassGroup) => {
    setSelectedClassGroup(record);
    setDrawerVisible(true);
  };

  const handleManageStudents = (record: ClassGroup) => {
    setSelectedClassGroup(record);
    
    // Prepare transfer data
    const assignedStudentIds = record.students.map(s => s.id);
    
    setTargetKeys(assignedStudentIds);
    setTransferVisible(true);
  };

  const handleTransferChange = (targetKeys: React.Key[]) => {
    setTargetKeys(targetKeys as string[]);
  };

  const handleTransferSubmit = async () => {
    if (!selectedClassGroup) return;

    try {
      // Update students for the class group
      await apiClient.patch(`/class-groups/${selectedClassGroup.id}`, {
        studentIds: targetKeys,
      });
      message.success('Estudiantes actualizados exitosamente');
      setTransferVisible(false);
      fetchClassGroups();
    } catch (error: any) {
      message.error('Error al actualizar estudiantes: ' + (error.response?.data?.message || error.message));
    }
  };

  const columns: ColumnsType<ClassGroup> = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Sección',
      dataIndex: 'section',
      key: 'section',
      width: 80,
      render: (section) => <Tag color="blue">{section}</Tag>,
    },
    {
      title: 'Cursos',
      key: 'courses',
      render: (_, record) => (
        <div>
          {record.courses?.map((course, index) => (
            <div key={course.id}>
              <div>{course.name}</div>
              {index === 0 && course.cycle?.educationalLevel?.name && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {course.cycle.educationalLevel.name}
                </Text>
              )}
            </div>
          )) || <Text type="secondary">Sin cursos</Text>}
        </div>
      ),
    },
    {
      title: 'Año Académico',
      key: 'academicYear',
      render: (_, record) => (
        <div>
          <Tag color={record.academicYear.isCurrent ? 'green' : 'default'}>
            {record.academicYear.name}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Tutor',
      key: 'tutor',
      render: (_, record) => (
        record.tutor ? (
          <div>
            <div>{record.tutor.user.profile.firstName} {record.tutor.user.profile.lastName}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.tutor.employeeNumber}
            </Text>
          </div>
        ) : (
          <Text type="secondary">Sin asignar</Text>
        )
      ),
    },
    {
      title: 'Estudiantes',
      key: 'students',
      render: (_, record) => (
        <div>
          <Tag color="cyan">{record.students.length} estudiantes</Tag>
        </div>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            size="small"
          >
            Ver
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Editar
          </Button>
          <Button
            type="link"
            icon={<UserOutlined />}
            onClick={() => handleManageStudents(record)}
            size="small"
          >
            Estudiantes
          </Button>
          <Popconfirm
            title="¿Está seguro de eliminar este grupo de clase?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const transferData = students.map(student => ({
    key: student.id,
    title: `${student.user.profile.firstName} ${student.user.profile.lastName}`,
    description: student.enrollmentNumber,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level={2}>Gestión de Grupos de Clase</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Crear Grupo de Clase
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={classGroups}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} grupos de clase`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingClassGroup ? 'Editar Grupo de Clase' : 'Crear Grupo de Clase'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nombre del Grupo"
                name="name"
                rules={[{ required: true, message: 'Por favor ingrese el nombre del grupo' }]}
              >
                <Input placeholder="Ej: 3º A Primaria" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Sección"
                name="section"
                rules={[{ required: true, message: 'Por favor ingrese la sección' }]}
              >
                <Input placeholder="Ej: A, B, C" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Año Académico"
                name="academicYearId"
                rules={[{ required: true, message: 'Por favor seleccione el año académico' }]}
              >
                <Select placeholder="Seleccionar año académico">
                  {academicYears.map(year => (
                    <Option key={year.id} value={year.id}>
                      {year.name} {year.isCurrent && <Tag color="green">Actual</Tag>}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Cursos"
                name="courseIds"
                rules={[{ required: true, message: 'Por favor seleccione al menos un curso' }]}
              >
                <Select 
                  mode="multiple"
                  placeholder="Seleccionar cursos (multinivel)"
                  allowClear
                >
                  {courses.map(course => (
                    <Option key={course.id} value={course.id}>
                      {course.name} - {course.cycle.educationalLevel.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Profesor Tutor"
            name="tutorId"
          >
            <Select
              placeholder="Seleccionar profesor tutor (opcional)"
              allowClear
            >
              {teachers.map(teacher => (
                <Option key={teacher.id} value={teacher.id}>
                  {teacher.user.profile.firstName} {teacher.user.profile.lastName} - {teacher.employeeNumber}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setModalVisible(false)}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit">
              {editingClassGroup ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Details Drawer */}
      <Drawer
        title="Detalles del Grupo de Clase"
        placement="right"
        size="large"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedClassGroup && (
          <div className="space-y-6">
            <div>
              <Title level={3}>{selectedClassGroup.name}</Title>
              <Space>
                <Tag color="blue">Sección {selectedClassGroup.section}</Tag>
                <Tag color="green">{selectedClassGroup.academicYear.name}</Tag>
              </Space>
            </div>

            <Divider />

            <div>
              <Title level={4}>Información del Curso</Title>
              <div>
                <Text strong>Cursos:</Text>
                <div className="mt-2">
                  {selectedClassGroup.courses?.map(course => (
                    <div key={course.id} className="mb-1">
                      <Tag color="blue">{course.name}</Tag>
                      {course.cycle?.educationalLevel?.name && (
                        <Text type="secondary" className="ml-2">
                          {course.cycle.educationalLevel.name}
                        </Text>
                      )}
                    </div>
                  )) || <Text type="secondary">Sin cursos asignados</Text>}
                </div>
              </div>
            </div>

            {selectedClassGroup.tutor && (
              <>
                <Divider />
                <div>
                  <Title level={4}>Profesor Tutor</Title>
                  <div className="flex items-center space-x-3">
                    <Avatar size={48} icon={<UserOutlined />} />
                    <div>
                      <div className="font-medium">
                        {selectedClassGroup.tutor.user.profile.firstName} {selectedClassGroup.tutor.user.profile.lastName}
                      </div>
                      <div className="text-gray-500">
                        {selectedClassGroup.tutor.employeeNumber} - {selectedClassGroup.tutor.user.profile.department}
                      </div>
                      <div className="text-sm">
                        Especialidades: {selectedClassGroup.tutor.specialties.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Divider />

            <div>
              <div className="flex justify-between items-center mb-4">
                <Title level={4}>Estudiantes ({selectedClassGroup.students.length})</Title>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => handleManageStudents(selectedClassGroup)}
                  size="small"
                >
                  Gestionar
                </Button>
              </div>
              
              <List
                dataSource={selectedClassGroup.students}
                renderItem={student => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={`${student.user.profile.firstName} ${student.user.profile.lastName}`}
                      description={`Matrícula: ${student.enrollmentNumber}`}
                    />
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}
      </Drawer>

      {/* Students Transfer Modal */}
      <Modal
        title={`Gestionar Estudiantes - ${selectedClassGroup?.name}`}
        open={transferVisible}
        onCancel={() => setTransferVisible(false)}
        onOk={handleTransferSubmit}
        width={700}
      >
        <Transfer
          dataSource={transferData}
          targetKeys={targetKeys}
          onChange={handleTransferChange}
          render={item => item.title}
          titles={['Estudiantes Disponibles', 'Estudiantes Asignados']}
          listStyle={{
            width: 300,
            height: 400,
          }}
        />
      </Modal>
    </div>
  );
};

export default ClassGroupsPage;