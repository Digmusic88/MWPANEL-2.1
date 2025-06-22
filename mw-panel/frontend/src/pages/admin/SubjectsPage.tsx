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
  InputNumber,
  Popconfirm,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BookOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import apiClient from '@services/apiClient';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface Subject {
  id: string;
  name: string;
  code: string;
  weeklyHours: number;
  description: string;
  course: {
    id: string;
    name: string;
    order: number;
    cycle: {
      name: string;
      educationalLevel: {
        name: string;
        code: string;
      };
    };
  };
}

interface SubjectAssignment {
  id: string;
  weeklyHours: number;
  notes: string;
  teacher: {
    id: string;
    employeeNumber: string;
    user: {
      profile: {
        firstName: string;
        lastName: string;
      };
    };
  };
  subject: {
    id: string;
    name: string;
    code: string;
    course: {
      name: string;
    };
  };
  classGroup: {
    id: string;
    name: string;
    courses: Array<{
      name: string;
    }>;
  };
  academicYear: {
    id: string;
    name: string;
    isCurrent: boolean;
  };
}

interface Course {
  id: string;
  name: string;
  order: number;
  cycle: {
    name: string;
    order: number;
    educationalLevel: {
      name: string;
      code: string;
    };
  };
}

interface Teacher {
  id: string;
  employeeNumber: string;
  user: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

interface ClassGroup {
  id: string;
  name: string;
  courses: Array<{
    name: string;
  }>;
}

interface AcademicYear {
  id: string;
  name: string;
  isCurrent: boolean;
}

const SubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<SubjectAssignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [academicYears] = useState<AcademicYear[]>([
    {
      id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20',
      name: '2024-2025',
      isCurrent: true,
    },
  ]);
  
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [assignmentModalVisible, setAssignmentModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<SubjectAssignment | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activeTab, setActiveTab] = useState('subjects');
  
  const [form] = Form.useForm();
  const [assignmentForm] = Form.useForm();

  useEffect(() => {
    fetchSubjects();
    fetchAssignments();
    fetchCourses();
    fetchTeachers();
    fetchClassGroups();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/subjects');
      setSubjects(response.data);
    } catch (error: any) {
      message.error('Error al cargar asignaturas: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await apiClient.get('/subjects/assignments/all');
      setAssignments(response.data);
    } catch (error: any) {
      message.error('Error al cargar asignaciones: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await apiClient.get('/class-groups/available-courses');
      const coursesData = response.data || [];
      
      // Sort courses by educational level and then by order
      const sortedCourses = coursesData.sort((a: Course, b: Course) => {
        // Define educational level order
        const levelOrder: { [key: string]: number } = {
          'INFANTIL': 1,
          'PRIMARIA': 2,
          'SECUNDARIA': 3
        };
        
        const aLevelOrder = levelOrder[a.cycle.educationalLevel.code] || 4;
        const bLevelOrder = levelOrder[b.cycle.educationalLevel.code] || 4;
        
        // First sort by educational level
        if (aLevelOrder !== bLevelOrder) {
          return aLevelOrder - bLevelOrder;
        }
        
        // Then by cycle order
        if (a.cycle.order !== b.cycle.order) {
          return a.cycle.order - b.cycle.order;
        }
        
        // Finally by course order
        return a.order - b.order;
      });
      
      setCourses(sortedCourses);
    } catch (error: any) {
      console.error('Error loading courses:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await apiClient.get('/class-groups/available-teachers');
      setTeachers(response.data);
    } catch (error: any) {
      console.error('Error loading teachers:', error);
    }
  };

  const fetchClassGroups = async () => {
    try {
      const response = await apiClient.get('/class-groups');
      setClassGroups(response.data);
    } catch (error: any) {
      console.error('Error loading class groups:', error);
    }
  };

  // ==================== SUBJECTS ====================

  const handleCreateSubject = () => {
    setEditingSubject(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditSubject = (record: Subject) => {
    setEditingSubject(record);
    form.setFieldsValue({
      name: record.name,
      code: record.code,
      weeklyHours: record.weeklyHours,
      description: record.description,
      courseId: record.course.id,
    });
    setModalVisible(true);
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await apiClient.delete(`/subjects/${id}`);
      message.success('Asignatura eliminada exitosamente');
      fetchSubjects();
    } catch (error: any) {
      message.error('Error al eliminar asignatura: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmitSubject = async (values: any) => {
    try {
      if (editingSubject) {
        await apiClient.patch(`/subjects/${editingSubject.id}`, values);
        message.success('Asignatura actualizada exitosamente');
      } else {
        await apiClient.post('/subjects', values);
        message.success('Asignatura creada exitosamente');
      }
      setModalVisible(false);
      form.resetFields();
      fetchSubjects();
    } catch (error: any) {
      message.error('Error al guardar asignatura: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleViewSubjectDetails = (record: Subject) => {
    setSelectedSubject(record);
    setDrawerVisible(true);
  };

  // ==================== ASSIGNMENTS ====================

  const handleCreateAssignment = () => {
    setEditingAssignment(null);
    assignmentForm.resetFields();
    setAssignmentModalVisible(true);
  };

  const handleEditAssignment = (record: SubjectAssignment) => {
    setEditingAssignment(record);
    assignmentForm.setFieldsValue({
      teacherId: record.teacher.id,
      subjectId: record.subject.id,
      classGroupId: record.classGroup.id,
      academicYearId: record.academicYear.id,
      weeklyHours: record.weeklyHours,
      notes: record.notes,
    });
    setAssignmentModalVisible(true);
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      await apiClient.delete(`/subjects/assignments/${id}`);
      message.success('Asignación eliminada exitosamente');
      fetchAssignments();
    } catch (error: any) {
      message.error('Error al eliminar asignación: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmitAssignment = async (values: any) => {
    try {
      if (editingAssignment) {
        await apiClient.patch(`/subjects/assignments/${editingAssignment.id}`, values);
        message.success('Asignación actualizada exitosamente');
      } else {
        await apiClient.post('/subjects/assignments', values);
        message.success('Asignación creada exitosamente');
      }
      setAssignmentModalVisible(false);
      assignmentForm.resetFields();
      fetchAssignments();
    } catch (error: any) {
      message.error('Error al guardar asignación: ' + (error.response?.data?.message || error.message));
    }
  };

  // ==================== TABLE COLUMNS ====================

  const subjectColumns: ColumnsType<Subject> = [
    {
      title: 'Asignatura',
      key: 'name',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.name}</div>
          <Tag color="blue">{record.code}</Tag>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Curso',
      key: 'course',
      render: (_, record) => (
        <div>
          <div>{record.course.name}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.course.cycle.educationalLevel.name}
          </Text>
        </div>
      ),
    },
    {
      title: 'Horas Semanales',
      dataIndex: 'weeklyHours',
      key: 'weeklyHours',
      width: 120,
      render: (hours) => <Tag color="green">{hours}h</Tag>,
      sorter: (a, b) => a.weeklyHours - b.weeklyHours,
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewSubjectDetails(record)}
            size="small"
          >
            Ver
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditSubject(record)}
            size="small"
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Está seguro de eliminar esta asignatura?"
            onConfirm={() => handleDeleteSubject(record.id)}
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

  const assignmentColumns: ColumnsType<SubjectAssignment> = [
    {
      title: 'Profesor',
      key: 'teacher',
      render: (_, record) => (
        <div>
          <div className="font-medium">
            {record.teacher.user.profile.firstName} {record.teacher.user.profile.lastName}
          </div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.teacher.employeeNumber}
          </Text>
        </div>
      ),
    },
    {
      title: 'Asignatura',
      key: 'subject',
      render: (_, record) => (
        <div>
          <div>{record.subject.name}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.subject.course.name}
          </Text>
        </div>
      ),
    },
    {
      title: 'Grupo',
      key: 'classGroup',
      render: (_, record) => (
        <div>
          <div>{record.classGroup.name}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.classGroup.courses.map(c => c.name).join(', ')}
          </Text>
        </div>
      ),
    },
    {
      title: 'Año Académico',
      key: 'academicYear',
      render: (_, record) => (
        <Tag color={record.academicYear.isCurrent ? 'green' : 'default'}>
          {record.academicYear.name}
        </Tag>
      ),
    },
    {
      title: 'Horas',
      dataIndex: 'weeklyHours',
      key: 'weeklyHours',
      width: 80,
      render: (hours) => <Tag color="blue">{hours}h</Tag>,
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditAssignment(record)}
            size="small"
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Está seguro de eliminar esta asignación?"
            onConfirm={() => handleDeleteAssignment(record.id)}
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level={2}>Gestión de Asignaturas</Title>
      </div>

      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          tabBarExtraContent={
            <Space>
              {activeTab === 'subjects' && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateSubject}
                >
                  Nueva Asignatura
                </Button>
              )}
              {activeTab === 'assignments' && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateAssignment}
                >
                  Nueva Asignación
                </Button>
              )}
            </Space>
          }
        >
          <TabPane tab={<span><BookOutlined />Asignaturas</span>} key="subjects">
            <Table
              columns={subjectColumns}
              dataSource={subjects}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} de ${total} asignaturas`,
              }}
            />
          </TabPane>
          
          <TabPane tab={<span><TeamOutlined />Asignaciones</span>} key="assignments">
            <Table
              columns={assignmentColumns}
              dataSource={assignments}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} de ${total} asignaciones`,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Subject Create/Edit Modal */}
      <Modal
        title={editingSubject ? 'Editar Asignatura' : 'Crear Asignatura'}
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
          onFinish={handleSubmitSubject}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nombre de la Asignatura"
                name="name"
                rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
              >
                <Input placeholder="Ej: Matemáticas" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Código"
                name="code"
                rules={[{ required: true, message: 'Por favor ingrese el código' }]}
              >
                <Input placeholder="Ej: MAT" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Curso"
                name="courseId"
                rules={[{ required: true, message: 'Por favor seleccione el curso' }]}
              >
                <Select placeholder="Seleccionar curso">
                  {courses.map(course => (
                    <Option key={course.id} value={course.id}>
                      {course.name} - {course.cycle.educationalLevel.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Horas Semanales"
                name="weeklyHours"
                rules={[{ required: true, message: 'Por favor ingrese las horas semanales' }]}
              >
                <InputNumber min={0} max={10} placeholder="0" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Descripción"
            name="description"
          >
            <TextArea rows={3} placeholder="Descripción de la asignatura..." />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setModalVisible(false)}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit">
              {editingSubject ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Assignment Create/Edit Modal */}
      <Modal
        title={editingAssignment ? 'Editar Asignación' : 'Crear Asignación'}
        open={assignmentModalVisible}
        onCancel={() => {
          setAssignmentModalVisible(false);
          assignmentForm.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={assignmentForm}
          layout="vertical"
          onFinish={handleSubmitAssignment}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Profesor"
                name="teacherId"
                rules={[{ required: true, message: 'Por favor seleccione el profesor' }]}
              >
                <Select placeholder="Seleccionar profesor">
                  {teachers.map(teacher => (
                    <Option key={teacher.id} value={teacher.id}>
                      {teacher.user.profile.firstName} {teacher.user.profile.lastName} - {teacher.employeeNumber}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Asignatura"
                name="subjectId"
                rules={[{ required: true, message: 'Por favor seleccione la asignatura' }]}
              >
                <Select placeholder="Seleccionar asignatura">
                  {subjects.map(subject => (
                    <Option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.course.name})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Grupo de Clase"
                name="classGroupId"
                rules={[{ required: true, message: 'Por favor seleccione el grupo' }]}
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
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Horas Semanales"
                name="weeklyHours"
                rules={[{ required: true, message: 'Por favor ingrese las horas semanales' }]}
              >
                <InputNumber min={0} max={10} placeholder="0" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Notas"
            name="notes"
          >
            <TextArea rows={2} placeholder="Notas adicionales..." />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setAssignmentModalVisible(false)}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit">
              {editingAssignment ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Subject Details Drawer */}
      <Drawer
        title="Detalles de la Asignatura"
        placement="right"
        size="large"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedSubject && (
          <div className="space-y-6">
            <div>
              <Title level={3}>{selectedSubject.name}</Title>
              <Space>
                <Tag color="blue">{selectedSubject.code}</Tag>
                <Tag color="green">{selectedSubject.weeklyHours}h semanales</Tag>
              </Space>
            </div>

            <Divider />

            <div>
              <Title level={4}>Información del Curso</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Curso:</Text>
                  <div>{selectedSubject.course.name}</div>
                </Col>
                <Col span={12}>
                  <Text strong>Nivel Educativo:</Text>
                  <div>{selectedSubject.course.cycle.educationalLevel.name}</div>
                </Col>
              </Row>
            </div>

            {selectedSubject.description && (
              <>
                <Divider />
                <div>
                  <Title level={4}>Descripción</Title>
                  <Text>{selectedSubject.description}</Text>
                </div>
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default SubjectsPage;