import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Statistic,
  Table,
  Typography,
  Tag,
  Select,
  DatePicker,
  message,
  Modal,
  Form,
  Input,
  Switch,
  Progress,
  Alert,
} from 'antd';
import {
  CalendarOutlined,
  PlusOutlined,
  BarChartOutlined,
  TeamOutlined,
  BookOutlined,
  SettingOutlined,
  ExportOutlined,
  ImportOutlined,
} from '@ant-design/icons';
import CalendarPage from '../shared/CalendarPage';
import apiClient from '@services/apiClient';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface CalendarStatistics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  upcomingEvents: number;
  activeEventTypes: string[];
  participationRate: number;
  eventsThisMonth: number;
  eventsLastMonth: number;
}

interface EventTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  defaultDuration: number;
  recurrencePattern?: string;
}

const AdminCalendarPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<CalendarStatistics | null>(null);
  const [eventTemplates, setEventTemplates] = useState<EventTemplate[]>([]);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [bulkImportModalVisible, setBulkImportModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchStatistics();
    fetchEventTemplates();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await apiClient.get('/calendar/admin/statistics');
      setStatistics(response.data);
    } catch (error: any) {
      console.error('Error fetching calendar statistics:', error);
      message.error('Error al cargar estadísticas del calendario');
    }
  };

  const fetchEventTemplates = async () => {
    try {
      const response = await apiClient.get('/calendar/admin/templates');
      setEventTemplates(response.data);
    } catch (error: any) {
      console.error('Error fetching event templates:', error);
    }
  };

  const handleCreateTemplate = async (values: any) => {
    try {
      await apiClient.post('/calendar/admin/templates', values);
      message.success('Plantilla creada exitosamente');
      setTemplateModalVisible(false);
      form.resetFields();
      fetchEventTemplates();
    } catch (error: any) {
      console.error('Error creating template:', error);
      message.error('Error al crear la plantilla');
    }
  };

  const handleBulkImport = async (values: any) => {
    try {
      await apiClient.post('/calendar/admin/bulk-import', values);
      message.success('Eventos importados exitosamente');
      setBulkImportModalVisible(false);
    } catch (error: any) {
      console.error('Error importing events:', error);
      message.error('Error al importar eventos');
    }
  };

  const exportEvents = async () => {
    try {
      const response = await apiClient.get('/calendar/admin/export', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `calendar-events-${dayjs().format('YYYY-MM-DD')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      message.success('Eventos exportados exitosamente');
    } catch (error: any) {
      console.error('Error exporting events:', error);
      message.error('Error al exportar eventos');
    }
  };

  const templateColumns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag>{type}</Tag>
      ),
    },
    {
      title: 'Duración (hrs)',
      dataIndex: 'defaultDuration',
      key: 'defaultDuration',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (record: EventTemplate) => (
        <Space>
          <Button size="small">Usar</Button>
          <Button size="small">Editar</Button>
          <Button size="small" danger>Eliminar</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div className="mb-6">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>
              <CalendarOutlined className="mr-2" />
              Administración del Calendario
            </Title>
            <Text type="secondary">
              Panel de control avanzado para la gestión del calendario escolar
            </Text>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ExportOutlined />}
                onClick={exportEvents}
              >
                Exportar
              </Button>
              <Button
                icon={<ImportOutlined />}
                onClick={() => setBulkImportModalVisible(true)}
              >
                Importar
              </Button>
              <Button
                icon={<SettingOutlined />}
                onClick={() => setTemplateModalVisible(true)}
              >
                Plantillas
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Eventos"
                value={statistics.totalEvents}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Próximos Eventos"
                value={statistics.upcomingEvents}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Este Mes"
                value={statistics.eventsThisMonth}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tasa Participación"
                value={statistics.participationRate}
                suffix="%"
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Event Distribution */}
      {statistics && (
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} lg={12}>
            <Card title="Distribución por Tipo de Evento">
              <Space direction="vertical" style={{ width: '100%' }}>
                {Object.entries(statistics.eventsByType).map(([type, count]) => (
                  <div key={type}>
                    <Text>{type}: {count}</Text>
                    <Progress
                      percent={Math.round((count / statistics.totalEvents) * 100)}
                      size="small"
                      strokeColor="#1890ff"
                    />
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Tendencia Mensual">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>Este mes: {statistics.eventsThisMonth}</Text>
                  <Progress
                    percent={Math.min((statistics.eventsThisMonth / 50) * 100, 100)}
                    size="small"
                    strokeColor="#52c41a"
                  />
                </div>
                <div>
                  <Text>Mes pasado: {statistics.eventsLastMonth}</Text>
                  <Progress
                    percent={Math.min((statistics.eventsLastMonth / 50) * 100, 100)}
                    size="small"
                    strokeColor="#faad14"
                  />
                </div>
                <Alert
                  message={
                    statistics.eventsThisMonth > statistics.eventsLastMonth
                      ? `Incremento del ${Math.round(((statistics.eventsThisMonth - statistics.eventsLastMonth) / statistics.eventsLastMonth) * 100)}%`
                      : `Decremento del ${Math.round(((statistics.eventsLastMonth - statistics.eventsThisMonth) / statistics.eventsLastMonth) * 100)}%`
                  }
                  type={statistics.eventsThisMonth > statistics.eventsLastMonth ? 'success' : 'warning'}
                  showIcon
                />
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      {/* Event Templates */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <Card
            title="Plantillas de Eventos"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setTemplateModalVisible(true)}
              >
                Nueva Plantilla
              </Button>
            }
          >
            <Table
              dataSource={eventTemplates}
              columns={templateColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Main Calendar */}
      <Card title="Calendario Principal">
        <CalendarPage />
      </Card>

      {/* Create Template Modal */}
      <Modal
        title="Crear Plantilla de Evento"
        open={templateModalVisible}
        onCancel={() => {
          setTemplateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTemplate}
        >
          <Form.Item
            name="name"
            label="Nombre de la Plantilla"
            rules={[{ required: true, message: 'El nombre es requerido' }]}
          >
            <Input placeholder="Ej: Reunión de Padres" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Tipo de Evento"
            rules={[{ required: true, message: 'El tipo es requerido' }]}
          >
            <Select placeholder="Selecciona el tipo">
              <Option value="meeting">Reunión</Option>
              <Option value="evaluation">Evaluación</Option>
              <Option value="activity">Actividad</Option>
              <Option value="holiday">Festivo</Option>
              <Option value="excursion">Excursión</Option>
              <Option value="festival">Festival</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Descripción"
          >
            <Input.TextArea rows={3} placeholder="Descripción de la plantilla" />
          </Form.Item>

          <Form.Item
            name="defaultDuration"
            label="Duración por Defecto (horas)"
            rules={[{ required: true, message: 'La duración es requerida' }]}
          >
            <Input type="number" placeholder="2" />
          </Form.Item>

          <Form.Item
            name="recurrencePattern"
            label="Patrón de Recurrencia"
          >
            <Select placeholder="Selecciona patrón (opcional)">
              <Option value="weekly">Semanal</Option>
              <Option value="monthly">Mensual</Option>
              <Option value="yearly">Anual</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Crear Plantilla
              </Button>
              <Button onClick={() => {
                setTemplateModalVisible(false);
                form.resetFields();
              }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal
        title="Importar Eventos en Lote"
        open={bulkImportModalVisible}
        onCancel={() => setBulkImportModalVisible(false)}
        footer={null}
        width={600}
      >
        <Alert
          message="Importación de Eventos"
          description="Puedes importar eventos desde un archivo Excel o CSV. Asegúrate de que el archivo tenga las columnas: título, descripción, fecha_inicio, fecha_fin, tipo, visibilidad."
          type="info"
          showIcon
          className="mb-4"
        />
        
        <Form onFinish={handleBulkImport}>
          <Form.Item
            name="file"
            label="Archivo"
            rules={[{ required: true, message: 'Selecciona un archivo' }]}
          >
            <Input type="file" accept=".xlsx,.csv" />
          </Form.Item>

          <Form.Item
            name="overwriteExisting"
            label="Sobrescribir eventos existentes"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Importar Eventos
              </Button>
              <Button onClick={() => setBulkImportModalVisible(false)}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCalendarPage;