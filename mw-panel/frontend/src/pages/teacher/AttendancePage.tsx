import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  message,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Empty,
  Alert,
  Statistic,
  Popconfirm,
  Tabs,
  List,
} from 'antd';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  UserOutlined,
  EditOutlined,
  BarChartOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../services/apiClient';
import {
  AttendanceRequest,
  AttendanceRecord,
  AttendanceRequestType,
  AttendanceRequestStatus,
  AttendanceStatus,
  CreateAttendanceRecordDto,
  UpdateAttendanceRecordDto,
  ReviewAttendanceRequestDto,
  BulkMarkPresentDto,
  AttendanceStats,
} from '../../types/attendance';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface ClassGroup {
  id: string;
  name: string;
  students?: Array<{
    id: string;
    enrollmentNumber: string;
    user: {
      profile: {
        firstName: string;
        lastName: string;
      };
    };
  }>;
}


const AttendancePage: React.FC = () => {
  const { } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [pendingRequests, setPendingRequests] = useState<AttendanceRequest[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats[]>([]);
  const [isRecordModalVisible, setIsRecordModalVisible] = useState(false);
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AttendanceRequest | null>(null);
  const [form] = Form.useForm();
  const [reviewForm] = Form.useForm();

  // Cargar grupos de clase del profesor
  useEffect(() => {
    loadClassGroups();
  }, []);

  // Cargar datos cuando se selecciona un grupo o fecha
  useEffect(() => {
    if (selectedGroup) {
      loadAttendanceData();
      loadPendingRequests();
    }
  }, [selectedGroup, selectedDate]);

  const loadClassGroups = async () => {
    try {
      setLoading(true);
      // Obtener grupos del profesor actual
      const response = await apiClient.get('/class-groups/teacher/my-groups');
      setClassGroups(response.data);
      
      if (response.data.length > 0) {
        setSelectedGroup(response.data[0].id);
      }
    } catch (error) {
      console.error('Error loading class groups:', error);
      message.error('Error al cargar grupos de clase');
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceData = async () => {
    if (!selectedGroup) return;
    
    try {
      setLoading(true);
      const response = await apiClient.get(
        `/attendance/records/group/${selectedGroup}?date=${selectedDate}`
      );
      setAttendanceRecords(response.data);
    } catch (error) {
      console.error('Error loading attendance data:', error);
      message.error('Error al cargar datos de asistencia');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    if (!selectedGroup) return;
    
    try {
      const response = await apiClient.get(`/attendance/requests/group/${selectedGroup}/pending`);
      setPendingRequests(response.data);
    } catch (error) {
      console.error('Error loading pending requests:', error);
      message.error('Error al cargar solicitudes pendientes');
    }
  };

  const loadAttendanceStats = async () => {
    if (!selectedGroup) return;
    
    try {
      setStatsLoading(true);
      const endDate = dayjs().format('YYYY-MM-DD');
      const startDate = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
      
      const response = await apiClient.get(
        `/attendance/stats/group/${selectedGroup}?startDate=${startDate}&endDate=${endDate}`
      );
      setAttendanceStats(response.data);
    } catch (error) {
      console.error('Error loading attendance stats:', error);
      message.error('Error al cargar estadísticas de asistencia');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleCreateRecord = async (values: any) => {
    try {
      const recordData: CreateAttendanceRecordDto = {
        studentId: values.studentId,
        date: selectedDate,
        status: values.status,
        justification: values.justification,
        arrivalTime: values.arrivalTime?.format('HH:mm'),
        departureTime: values.departureTime?.format('HH:mm'),
      };

      await apiClient.post('/attendance/records', recordData);
      message.success('Registro de asistencia creado exitosamente');
      
      setIsRecordModalVisible(false);
      form.resetFields();
      loadAttendanceData();
    } catch (error: any) {
      console.error('Error creating attendance record:', error);
      message.error(error.response?.data?.message || 'Error al crear registro');
    }
  };

  const handleUpdateRecord = async (values: any) => {
    if (!selectedRecord) return;
    
    try {
      const updateData: UpdateAttendanceRecordDto = {
        status: values.status,
        justification: values.justification,
        arrivalTime: values.arrivalTime?.format('HH:mm'),
        departureTime: values.departureTime?.format('HH:mm'),
      };

      await apiClient.patch(`/attendance/records/${selectedRecord.id}`, updateData);
      message.success('Registro de asistencia actualizado exitosamente');
      
      setIsRecordModalVisible(false);
      setSelectedRecord(null);
      form.resetFields();
      loadAttendanceData();
    } catch (error: any) {
      console.error('Error updating attendance record:', error);
      message.error(error.response?.data?.message || 'Error al actualizar registro');
    }
  };

  const handleReviewRequest = async (values: any) => {
    if (!selectedRequest) return;
    
    try {
      const reviewData: ReviewAttendanceRequestDto = {
        status: values.status,
        reviewNote: values.reviewNote,
      };

      await apiClient.patch(`/attendance/requests/${selectedRequest.id}/review`, reviewData);
      message.success('Solicitud revisada exitosamente');
      
      setIsRequestModalVisible(false);
      setSelectedRequest(null);
      reviewForm.resetFields();
      loadPendingRequests();
      loadAttendanceData();
    } catch (error: any) {
      console.error('Error reviewing request:', error);
      message.error(error.response?.data?.message || 'Error al revisar solicitud');
    }
  };

  const handleBulkMarkPresent = async () => {
    if (!selectedGroup) return;
    
    try {
      const bulkData: BulkMarkPresentDto = {
        classGroupId: selectedGroup,
        date: selectedDate,
        excludeStudentIds: attendanceRecords.map(record => record.studentId),
      };

      const response = await apiClient.post('/attendance/records/bulk-present', bulkData);
      message.success(`${response.data.created} estudiantes marcados como presentes`);
      
      loadAttendanceData();
    } catch (error: any) {
      console.error('Error bulk marking present:', error);
      message.error(error.response?.data?.message || 'Error al marcar presentes');
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return 'success';
      case AttendanceStatus.ABSENT:
        return 'error';
      case AttendanceStatus.LATE:
        return 'warning';
      case AttendanceStatus.EARLY_DEPARTURE:
        return 'processing';
      case AttendanceStatus.JUSTIFIED_ABSENCE:
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return 'Presente';
      case AttendanceStatus.ABSENT:
        return 'Ausente';
      case AttendanceStatus.LATE:
        return 'Tardanza';
      case AttendanceStatus.EARLY_DEPARTURE:
        return 'Salida Anticipada';
      case AttendanceStatus.JUSTIFIED_ABSENCE:
        return 'Falta Justificada';
      default:
        return status;
    }
  };

  const getRequestTypeText = (type: AttendanceRequestType) => {
    switch (type) {
      case AttendanceRequestType.ABSENCE:
        return 'Ausencia';
      case AttendanceRequestType.LATE_ARRIVAL:
        return 'Llegada Tardía';
      case AttendanceRequestType.EARLY_DEPARTURE:
        return 'Salida Anticipada';
      default:
        return type;
    }
  };

  const recordsColumns = [
    {
      title: 'Estudiante',
      key: 'student',
      render: (record: AttendanceRecord) => (
        <Space>
          <UserOutlined />
          <div>
            <div>{record.student?.user.profile.firstName} {record.student?.user.profile.lastName}</div>
            <Text type="secondary" className="text-xs">
              {record.student?.enrollmentNumber}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: AttendanceStatus) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: 'Justificación',
      dataIndex: 'justification',
      key: 'justification',
      render: (justification: string) => justification || '-',
    },
    {
      title: 'Hora Llegada',
      dataIndex: 'arrivalTime',
      key: 'arrivalTime',
      render: (time: string) => time || '-',
    },
    {
      title: 'Hora Salida',
      dataIndex: 'departureTime',
      key: 'departureTime',
      render: (time: string) => time || '-',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (record: AttendanceRecord) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedRecord(record);
              form.setFieldsValue({
                status: record.status,
                justification: record.justification,
                arrivalTime: record.arrivalTime ? dayjs(record.arrivalTime, 'HH:mm') : null,
                departureTime: record.departureTime ? dayjs(record.departureTime, 'HH:mm') : null,
              });
              setIsRecordModalVisible(true);
            }}
          >
            Editar
          </Button>
        </Space>
      ),
    },
  ];

  const requestsColumns = [
    {
      title: 'Estudiante',
      key: 'student',
      render: (request: AttendanceRequest) => (
        <Space>
          <UserOutlined />
          <div>
            <div>{request.student?.user.profile.firstName} {request.student?.user.profile.lastName}</div>
            <Text type="secondary" className="text-xs">
              {request.student?.enrollmentNumber}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type: AttendanceRequestType) => getRequestTypeText(type),
    },
    {
      title: 'Motivo',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: 'Familia',
      key: 'requestedBy',
      render: (request: AttendanceRequest) => (
        request.requestedBy?.profile ? 
        `${request.requestedBy.profile.firstName} ${request.requestedBy.profile.lastName}` : 
        '-'
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (request: AttendanceRequest) => (
        <Space>
          <Button
            size="small"
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => {
              setSelectedRequest(request);
              reviewForm.setFieldsValue({
                status: AttendanceRequestStatus.APPROVED,
                reviewNote: '',
              });
              setIsRequestModalVisible(true);
            }}
          >
            Aprobar
          </Button>
          <Button
            size="small"
            danger
            icon={<CloseOutlined />}
            onClick={() => {
              setSelectedRequest(request);
              reviewForm.setFieldsValue({
                status: AttendanceRequestStatus.REJECTED,
                reviewNote: '',
              });
              setIsRequestModalVisible(true);
            }}
          >
            Rechazar
          </Button>
        </Space>
      ),
    },
  ];

  const selectedGroupName = classGroups.find(g => g.id === selectedGroup)?.name || '';

  return (
    <div className="p-6">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div className="flex justify-between items-center">
                <div>
                  <Title level={2}>
                    <CalendarOutlined className="mr-2" />
                    Control de Asistencia
                  </Title>
                  <Text type="secondary">
                    Gestiona la asistencia diaria y revisa solicitudes de familias
                  </Text>
                </div>
              </div>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>Grupo: </Text>
                  <Select
                    style={{ minWidth: 200 }}
                    value={selectedGroup}
                    onChange={setSelectedGroup}
                    placeholder="Seleccionar grupo"
                  >
                    {classGroups.map(group => (
                      <Option key={group.id} value={group.id}>
                        {group.name}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col span={12}>
                  <Text strong>Fecha: </Text>
                  <DatePicker
                    value={dayjs(selectedDate)}
                    onChange={(date) => setSelectedDate(date?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD'))}
                    format="DD/MM/YYYY"
                    style={{ minWidth: 150 }}
                  />
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>

        {selectedGroup && (
          <Col span={24}>
            <Tabs defaultActiveKey="attendance" onChange={() => loadAttendanceStats()}>
              <TabPane tab="Asistencia Diaria" key="attendance">
                <Card
                  title={`Asistencia - ${selectedGroupName} - ${dayjs(selectedDate).format('DD/MM/YYYY')}`}
                  loading={loading}
                  extra={
                    <Space>
                      <Popconfirm
                        title="¿Marcar todos los estudiantes restantes como presentes?"
                        onConfirm={handleBulkMarkPresent}
                        okText="Sí"
                        cancelText="No"
                      >
                        <Button type="primary" icon={<CheckCircleOutlined />}>
                          Marcar Resto Presente
                        </Button>
                      </Popconfirm>
                      <Button
                        type="primary"
                        icon={<UserOutlined />}
                        onClick={() => {
                          setSelectedRecord(null);
                          form.resetFields();
                          setIsRecordModalVisible(true);
                        }}
                      >
                        Nuevo Registro
                      </Button>
                    </Space>
                  }
                >
                  {attendanceRecords.length > 0 ? (
                    <Table
                      columns={recordsColumns}
                      dataSource={attendanceRecords}
                      rowKey="id"
                      pagination={false}
                    />
                  ) : (
                    <Empty description="No hay registros de asistencia para esta fecha" />
                  )}
                </Card>
              </TabPane>

              <TabPane tab={`Solicitudes Pendientes (${pendingRequests.length})`} key="requests">
                <Card title="Solicitudes de Justificación Pendientes" loading={loading}>
                  {pendingRequests.length > 0 ? (
                    <Table
                      columns={requestsColumns}
                      dataSource={pendingRequests}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                    />
                  ) : (
                    <Empty description="No hay solicitudes pendientes" />
                  )}
                </Card>
              </TabPane>

              <TabPane tab="Estadísticas" key="stats">
                <Card title="Estadísticas de Asistencia (Último Mes)" loading={statsLoading}>
                  <Button
                    type="primary"
                    icon={<BarChartOutlined />}
                    onClick={loadAttendanceStats}
                    className="mb-4"
                  >
                    Cargar Estadísticas
                  </Button>
                  
                  {attendanceStats.length > 0 ? (
                    <List
                      dataSource={attendanceStats}
                      renderItem={(stat) => (
                        <List.Item>
                          <div className="w-full">
                            <div className="flex justify-between items-center mb-2">
                              <Text strong>{stat.student.name}</Text>
                              <Text type="secondary">{stat.totalDays} días</Text>
                            </div>
                            <Row gutter={[8, 8]}>
                              <Col span={6}>
                                <Statistic
                                  title="Presente"
                                  value={stat.present}
                                  valueStyle={{ color: '#52c41a', fontSize: '14px' }}
                                />
                              </Col>
                              <Col span={6}>
                                <Statistic
                                  title="Ausente"
                                  value={stat.absent}
                                  valueStyle={{ color: '#ff4d4f', fontSize: '14px' }}
                                />
                              </Col>
                              <Col span={6}>
                                <Statistic
                                  title="Tardanza"
                                  value={stat.late}
                                  valueStyle={{ color: '#faad14', fontSize: '14px' }}
                                />
                              </Col>
                              <Col span={6}>
                                <Statistic
                                  title="Justificada"
                                  value={stat.justifiedAbsence}
                                  valueStyle={{ color: '#1890ff', fontSize: '14px' }}
                                />
                              </Col>
                            </Row>
                          </div>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="No hay estadísticas disponibles" />
                  )}
                </Card>
              </TabPane>
            </Tabs>
          </Col>
        )}
      </Row>

      {/* Modal para crear/editar registro */}
      <Modal
        title={selectedRecord ? 'Editar Registro de Asistencia' : 'Nuevo Registro de Asistencia'}
        open={isRecordModalVisible}
        onCancel={() => {
          setIsRecordModalVisible(false);
          setSelectedRecord(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={selectedRecord ? handleUpdateRecord : handleCreateRecord}
        >
          {!selectedRecord && (
            <Form.Item
              name="studentId"
              label="Estudiante"
              rules={[{ required: true, message: 'Selecciona un estudiante' }]}
            >
              <Select placeholder="Seleccionar estudiante">
                {/* TODO: Load students from selected group */}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="status"
            label="Estado de Asistencia"
            rules={[{ required: true, message: 'Selecciona el estado' }]}
          >
            <Select placeholder="Seleccionar estado">
              <Option value={AttendanceStatus.PRESENT}>Presente</Option>
              <Option value={AttendanceStatus.ABSENT}>Ausente</Option>
              <Option value={AttendanceStatus.LATE}>Tardanza</Option>
              <Option value={AttendanceStatus.EARLY_DEPARTURE}>Salida Anticipada</Option>
              <Option value={AttendanceStatus.JUSTIFIED_ABSENCE}>Falta Justificada</Option>
            </Select>
          </Form.Item>

          <Form.Item name="justification" label="Justificación">
            <TextArea rows={3} placeholder="Opcional: agregar justificación" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="arrivalTime" label="Hora de Llegada">
                <DatePicker.TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="departureTime" label="Hora de Salida">
                <DatePicker.TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {selectedRecord ? 'Actualizar' : 'Crear'} Registro
              </Button>
              <Button onClick={() => {
                setIsRecordModalVisible(false);
                setSelectedRecord(null);
                form.resetFields();
              }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para revisar solicitud */}
      <Modal
        title="Revisar Solicitud de Justificación"
        open={isRequestModalVisible}
        onCancel={() => {
          setIsRequestModalVisible(false);
          setSelectedRequest(null);
          reviewForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedRequest && (
          <div className="mb-4">
            <Alert
              message="Información de la Solicitud"
              description={
                <div>
                  <p><strong>Estudiante:</strong> {selectedRequest.student?.user.profile.firstName} {selectedRequest.student?.user.profile.lastName}</p>
                  <p><strong>Tipo:</strong> {getRequestTypeText(selectedRequest.type)}</p>
                  <p><strong>Fecha:</strong> {dayjs(selectedRequest.date).format('DD/MM/YYYY')}</p>
                  <p><strong>Motivo:</strong> {selectedRequest.reason}</p>
                  {selectedRequest.expectedArrivalTime && (
                    <p><strong>Hora Estimada de Llegada:</strong> {selectedRequest.expectedArrivalTime}</p>
                  )}
                  {selectedRequest.expectedDepartureTime && (
                    <p><strong>Hora Estimada de Salida:</strong> {selectedRequest.expectedDepartureTime}</p>
                  )}
                </div>
              }
              type="info"
              showIcon
            />
          </div>
        )}
        
        <Form
          form={reviewForm}
          layout="vertical"
          onFinish={handleReviewRequest}
        >
          <Form.Item
            name="status"
            label="Decisión"
            rules={[{ required: true, message: 'Selecciona una decisión' }]}
          >
            <Select placeholder="Aprobar o rechazar">
              <Option value={AttendanceRequestStatus.APPROVED}>Aprobar</Option>
              <Option value={AttendanceRequestStatus.REJECTED}>Rechazar</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="reviewNote"
            label="Nota de Revisión (Opcional)"
          >
            <TextArea
              rows={4}
              placeholder="Opcional: agregar comentarios adicionales..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Enviar Revisión
              </Button>
              <Button onClick={() => {
                setIsRequestModalVisible(false);
                setSelectedRequest(null);
                reviewForm.resetFields();
              }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AttendancePage;