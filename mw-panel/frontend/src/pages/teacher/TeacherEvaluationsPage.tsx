import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Select,
  Table,
  Tag,
  Progress,
  Button,
  Space,
  Empty,
  Spin,
  Alert,
  Input,
  DatePicker,
  Badge,
  Avatar,
  Modal,
  Form,
  Rate,
  Tooltip,
  Drawer,
} from 'antd';
import {
  FileTextOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  CalendarOutlined,
  UserOutlined,
  BookOutlined,
  StarOutlined,
  SendOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useResponsive } from '../../hooks/useResponsive';
import apiClient from '../../services/apiClient';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface Evaluation {
  id: string;
  student: {
    id: string;
    user: {
      profile: {
        firstName: string;
        lastName: string;
      };
    };
    classGroup: {
      id: string;
      name: string;
    };
  };
  subject: {
    id: string;
    name: string;
    code: string;
  };
  period: {
    id: string;
    name: string;
  };
  status: 'draft' | 'submitted' | 'reviewed' | 'finalized';
  generalObservations?: string;
  overallScore?: number;
  competencyEvaluations: Array<{
    id: string;
    competency: {
      id: string;
      name: string;
      code: string;
    };
    score: number;
    observations?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface EvaluationFormData {
  studentId: string;
  subjectId: string;
  periodId: string;
  generalObservations?: string;
  competencyEvaluations: Array<{
    competencyId: string;
    score: number;
    observations?: string;
  }>;
}

const TeacherEvaluationsPage: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    subjectId: '',
    periodId: '',
    classGroupId: '',
    search: '',
  });
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [classGroups, setClassGroups] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);
  const [viewingEvaluation, setViewingEvaluation] = useState<Evaluation | null>(null);
  const [form] = Form.useForm();
  const { isMobile, isTablet } = useResponsive();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get current user to find teacher ID
      const userResponse = await apiClient.get('/auth/me');
      const currentUser = userResponse.data;

      // Find teacher by user ID
      const teachersResponse = await apiClient.get('/teachers');
      const teachers = teachersResponse.data;
      const currentTeacher = teachers.find((teacher: any) => teacher.user.id === currentUser.id);

      if (!currentTeacher) {
        throw new Error('No se encontró el perfil de profesor');
      }

      const [
        evaluationsRes,
        periodsRes,
        competenciesRes,
        subjectsRes,
        classGroupsRes,
        studentsRes,
      ] = await Promise.all([
        apiClient.get(`/evaluations/teacher/${currentTeacher.id}`),
        apiClient.get('/evaluations/periods'),
        apiClient.get('/competencies'),
        apiClient.get(`/subjects/assignments/teacher/${currentTeacher.id}`),
        apiClient.get(`/class-groups?tutorId=${currentTeacher.id}`),
        apiClient.get('/students'),
      ]);

      setEvaluations(evaluationsRes.data);
      setPeriods(periodsRes.data);
      setCompetencies(competenciesRes.data);
      setSubjects(subjectsRes.data.map((assignment: any) => assignment.subject));
      setClassGroups(classGroupsRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finalized': return 'success';
      case 'reviewed': return 'processing';
      case 'submitted': return 'warning';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'finalized': return 'Finalizada';
      case 'reviewed': return 'Revisada';
      case 'submitted': return 'Enviada';
      case 'draft': return 'Borrador';
      default: return status;
    }
  };

  const handleCreateEvaluation = async (values: any) => {
    try {
      const evaluationData: EvaluationFormData = {
        studentId: values.studentId,
        subjectId: values.subjectId,
        periodId: values.periodId,
        generalObservations: values.generalObservations,
        competencyEvaluations: values.competencyEvaluations.map((comp: any) => ({
          competencyId: comp.competencyId,
          score: comp.score,
          observations: comp.observations,
        })),
      };

      await apiClient.post('/evaluations', evaluationData);
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error: any) {
      console.error('Error creating evaluation:', error);
    }
  };

  const handleUpdateEvaluation = async (evaluationId: string, values: any) => {
    try {
      await apiClient.patch(`/evaluations/${evaluationId}`, values);
      setEditingEvaluation(null);
      setDrawerVisible(false);
      fetchData();
    } catch (error: any) {
      console.error('Error updating evaluation:', error);
    }
  };

  const handleDeleteEvaluation = async (evaluationId: string) => {
    try {
      await apiClient.delete(`/evaluations/${evaluationId}`);
      fetchData();
    } catch (error: any) {
      console.error('Error deleting evaluation:', error);
    }
  };

  const columns: ColumnsType<Evaluation> = [
    {
      title: 'Estudiante',
      key: 'student',
      width: isMobile ? 150 : 200,
      render: (record: Evaluation) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <Text strong>
              {record.student?.user?.profile?.firstName || 'N/A'} {record.student?.user?.profile?.lastName || ''}
            </Text>
            <div className="text-sm text-gray-500">{record.student?.classGroup?.name || 'Sin clase'}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Asignatura',
      key: 'subject',
      width: 150,
      render: (record: Evaluation) => (
        <div>
          <Text>{record.subject?.name || 'N/A'}</Text>
          <div className="text-sm text-gray-500">{record.subject?.code || 'N/A'}</div>
        </div>
      ),
    },
    {
      title: 'Período',
      dataIndex: ['period', 'name'],
      key: 'period',
      width: 120,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Puntuación',
      dataIndex: 'overallScore',
      key: 'overallScore',
      width: 120,
      render: (score: number) => (
        score !== undefined && score !== null && typeof score === 'number' ? (
          <div>
            <Rate disabled value={score} count={5} />
            <div className="text-sm text-gray-500">{score.toFixed(1)}/5.0</div>
          </div>
        ) : (
          <Text type="secondary">Pendiente</Text>
        )
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      render: (record: Evaluation) => (
        <Space size="small">
          <Tooltip title="Ver detalles">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setViewingEvaluation(record);
                setDrawerVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingEvaluation(record);
                setDrawerVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button
              size="small"
              icon={<DeleteOutlined />}
              danger
              onClick={() => {
                Modal.confirm({
                  title: '¿Estás seguro?',
                  content: 'Esta acción eliminará la evaluación permanentemente.',
                  onOk: () => handleDeleteEvaluation(record.id),
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredEvaluations = evaluations.filter((evaluation) => {
    const matchesStatus = !filters.status || evaluation.status === filters.status;
    const matchesSubject = !filters.subjectId || evaluation.subject?.id === filters.subjectId;
    const matchesPeriod = !filters.periodId || evaluation.period?.id === filters.periodId;
    const matchesSearch = !filters.search ||
      evaluation.student?.user?.profile?.firstName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      evaluation.student?.user?.profile?.lastName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      evaluation.subject?.name?.toLowerCase().includes(filters.search.toLowerCase());

    return matchesStatus && matchesSubject && matchesPeriod && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="!mb-2">
            Mis Evaluaciones
          </Title>
          <Text type="secondary">
            Gestiona las evaluaciones de competencias de tus estudiantes
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={() => setModalVisible(true)}
        >
          Nueva Evaluación
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{evaluations.length}</div>
              <div className="text-gray-500">Total Evaluaciones</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {evaluations.filter(e => e.status === 'finalized').length}
              </div>
              <div className="text-gray-500">Finalizadas</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {evaluations.filter(e => e.status === 'draft').length}
              </div>
              <div className="text-gray-500">Borradores</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(() => {
                  const evaluationsWithScores = evaluations.filter(e => e.overallScore !== undefined && e.overallScore !== null);
                  if (evaluationsWithScores.length === 0) return '0.0';
                  const average = evaluationsWithScores.reduce((sum, e) => sum + (e.overallScore || 0), 0) / evaluationsWithScores.length;
                  return Math.round(average * 10) / 10;
                })()}
              </div>
              <div className="text-gray-500">Promedio</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card title="Filtros" size="small">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Buscar estudiante o asignatura..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Estado"
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              allowClear
            >
              <Option value="draft">Borrador</Option>
              <Option value="submitted">Enviada</Option>
              <Option value="reviewed">Revisada</Option>
              <Option value="finalized">Finalizada</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Asignatura"
              style={{ width: '100%' }}
              value={filters.subjectId}
              onChange={(value) => setFilters(prev => ({ ...prev, subjectId: value }))}
              allowClear
            >
              {subjects.map(subject => (
                <Option key={subject.id} value={subject.id}>
                  {subject.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Período"
              style={{ width: '100%' }}
              value={filters.periodId}
              onChange={(value) => setFilters(prev => ({ ...prev, periodId: value }))}
              allowClear
            >
              {periods.map(period => (
                <Option key={period.id} value={period.id}>
                  {period.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Evaluations Table */}
      <Card title={`Evaluaciones (${filteredEvaluations.length})`}>
        {filteredEvaluations.length === 0 ? (
          <Empty
            description="No se encontraron evaluaciones"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            dataSource={filteredEvaluations}
            columns={columns}
            rowKey="id"
            scroll={{ x: isMobile ? 800 : undefined }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: !isMobile,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} de ${total} evaluaciones`,
            }}
            size={isMobile ? 'small' : 'middle'}
          />
        )}
      </Card>

      {/* Create Evaluation Modal */}
      <Modal
        title="Nueva Evaluación"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateEvaluation}
          initialValues={{
            competencyEvaluations: competencies.map(comp => ({
              competencyId: comp.id,
              score: 3,
              observations: '',
            })),
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="studentId"
                label="Estudiante"
                rules={[{ required: true, message: 'Selecciona un estudiante' }]}
              >
                <Select placeholder="Seleccionar estudiante" showSearch>
                  {students.map(student => (
                    <Option key={student.id} value={student.id}>
                      {student.user.profile.firstName} {student.user.profile.lastName} - {student.classGroup?.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="subjectId"
                label="Asignatura"
                rules={[{ required: true, message: 'Selecciona una asignatura' }]}
              >
                <Select placeholder="Seleccionar asignatura">
                  {subjects.map(subject => (
                    <Option key={subject.id} value={subject.id}>
                      {subject.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="periodId"
            label="Período"
            rules={[{ required: true, message: 'Selecciona un período' }]}
          >
            <Select placeholder="Seleccionar período">
              {periods.map(period => (
                <Option key={period.id} value={period.id}>
                  {period.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="generalObservations" label="Observaciones Generales">
            <TextArea rows={3} placeholder="Observaciones generales sobre la evaluación..." />
          </Form.Item>

          <div className="mb-4">
            <Text strong>Evaluación por Competencias</Text>
          </div>

          <Form.List name="competencyEvaluations">
            {(fields) => (
              <>
                {fields.map(({ key, name }) => {
                  const competency = competencies[name];
                  if (!competency) return null;

                  return (
                    <Card key={key} size="small" className="mb-4">
                      <Form.Item name={[name, 'competencyId']} hidden>
                        <Input />
                      </Form.Item>
                      
                      <div className="mb-2">
                        <Text strong>{competency.code}: {competency.name}</Text>
                      </div>
                      
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            name={[name, 'score']}
                            label="Puntuación"
                          >
                            <Rate count={5} />
                          </Form.Item>
                        </Col>
                        <Col span={16}>
                          <Form.Item
                            name={[name, 'observations']}
                            label="Observaciones"
                          >
                            <TextArea rows={2} placeholder="Observaciones específicas..." />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  );
                })}
              </>
            )}
          </Form.List>

          <div className="text-right mt-4">
            <Space>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
                Crear Evaluación
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* View/Edit Evaluation Drawer */}
      <Drawer
        title={viewingEvaluation ? "Detalles de Evaluación" : "Editar Evaluación"}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          setViewingEvaluation(null);
          setEditingEvaluation(null);
        }}
        width={600}
      >
        {viewingEvaluation && (
          // Read-only view
          <div className="space-y-4">
            <Card size="small">
              <div className="space-y-2">
                <div><Text strong>Estudiante:</Text> {viewingEvaluation?.student?.user?.profile?.firstName || 'N/A'} {viewingEvaluation?.student?.user?.profile?.lastName || ''}</div>
                <div><Text strong>Clase:</Text> {viewingEvaluation?.student?.classGroup?.name || 'N/A'}</div>
                <div><Text strong>Asignatura:</Text> {viewingEvaluation?.subject?.name || 'N/A'}</div>
                <div><Text strong>Período:</Text> {viewingEvaluation?.period?.name || 'N/A'}</div>
                <div><Text strong>Estado:</Text> <Tag color={getStatusColor(viewingEvaluation?.status || '')}>{getStatusText(viewingEvaluation?.status || '')}</Tag></div>
                {viewingEvaluation?.overallScore !== undefined && viewingEvaluation?.overallScore !== null && !isNaN(viewingEvaluation?.overallScore || 0) && (
                  <div><Text strong>Puntuación:</Text> <Rate disabled value={viewingEvaluation?.overallScore || 0} count={5} /></div>
                )}
              </div>
            </Card>

            {viewingEvaluation?.generalObservations && (
              <Card size="small" title="Observaciones Generales">
                <Text>{viewingEvaluation?.generalObservations}</Text>
              </Card>
            )}

            <Card size="small" title="Evaluación por Competencias">
              <div className="space-y-3">
                {viewingEvaluation?.competencyEvaluations?.map((compEval) => (
                  <div key={compEval?.id || Math.random()} className="border-b pb-2">
                    <div className="flex justify-between items-center mb-1">
                      <Text strong>{compEval?.competency?.code || 'N/A'}: {compEval?.competency?.name || 'N/A'}</Text>
                      <Rate 
                        disabled 
                        value={compEval?.score !== undefined && compEval?.score !== null && !isNaN(compEval.score) ? compEval.score : 0} 
                        count={5} 
                      />
                    </div>
                    {compEval?.observations && (
                      <Text type="secondary" className="text-sm">{compEval.observations}</Text>
                    )}
                  </div>
                )) || (
                  <Text type="secondary">No hay evaluaciones de competencias disponibles</Text>
                )}
              </div>
            </Card>
          </div>
        )}

        {editingEvaluation && (
          // Editable form
          <Form
            layout="vertical"
            onFinish={(values) => handleUpdateEvaluation(editingEvaluation.id, {
              generalObservations: values.generalObservations,
              status: values.status,
              competencyEvaluations: values.competencyEvaluations.map((comp: any) => ({
                competencyId: comp.competencyId,
                score: comp.score,
                observations: comp.observations,
              })),
            })}
            initialValues={{
              status: editingEvaluation.status,
              generalObservations: editingEvaluation.generalObservations,
              competencyEvaluations: editingEvaluation.competencyEvaluations?.map(compEval => ({
                competencyId: compEval.competency?.id,
                score: compEval.score,
                observations: compEval.observations || '',
              })) || [],
            }}
          >
            {/* Basic Info (Read-only) */}
            <Card size="small" title="Información de la Evaluación">
              <div className="space-y-2">
                <div><Text strong>Estudiante:</Text> {editingEvaluation?.student?.user?.profile?.firstName || 'N/A'} {editingEvaluation?.student?.user?.profile?.lastName || ''}</div>
                <div><Text strong>Clase:</Text> {editingEvaluation?.student?.classGroup?.name || 'N/A'}</div>
                <div><Text strong>Asignatura:</Text> {editingEvaluation?.subject?.name || 'N/A'}</div>
                <div><Text strong>Período:</Text> {editingEvaluation?.period?.name || 'N/A'}</div>
              </div>
            </Card>

            {/* Status */}
            <Form.Item
              name="status"
              label="Estado"
              rules={[{ required: true, message: 'Selecciona un estado' }]}
            >
              <Select>
                <Option value="draft">Borrador</Option>
                <Option value="submitted">Enviada</Option>
                <Option value="reviewed">Revisada</Option>
                <Option value="finalized">Finalizada</Option>
              </Select>
            </Form.Item>

            {/* General Observations */}
            <Form.Item name="generalObservations" label="Observaciones Generales">
              <TextArea rows={3} placeholder="Observaciones generales sobre la evaluación..." />
            </Form.Item>

            {/* Competency Evaluations */}
            <div className="mb-4">
              <Text strong>Evaluación por Competencias</Text>
            </div>

            <Form.List name="competencyEvaluations">
              {(fields) => (
                <>
                  {fields.map(({ key, name }) => {
                    const competency = editingEvaluation.competencyEvaluations?.[name]?.competency;
                    if (!competency) return null;

                    return (
                      <Card key={key} size="small" className="mb-4">
                        <Form.Item name={[name, 'competencyId']} hidden>
                          <Input />
                        </Form.Item>
                        
                        <div className="mb-2">
                          <Text strong>{competency.code}: {competency.name}</Text>
                        </div>
                        
                        <Row gutter={16}>
                          <Col span={8}>
                            <Form.Item
                              name={[name, 'score']}
                              label="Puntuación"
                              rules={[{ required: true, message: 'Asigna una puntuación' }]}
                            >
                              <Rate count={5} />
                            </Form.Item>
                          </Col>
                          <Col span={16}>
                            <Form.Item
                              name={[name, 'observations']}
                              label="Observaciones"
                            >
                              <TextArea rows={2} placeholder="Observaciones específicas..." />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    );
                  })}
                </>
              )}
            </Form.List>

            {/* Action Buttons */}
            <div className="text-right mt-4">
              <Space>
                <Button onClick={() => {
                  setDrawerVisible(false);
                  setEditingEvaluation(null);
                }}>
                  Cancelar
                </Button>
                <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
                  Guardar Cambios
                </Button>
              </Space>
            </div>
          </Form>
        )}
      </Drawer>
    </div>
  );
};

export default TeacherEvaluationsPage;