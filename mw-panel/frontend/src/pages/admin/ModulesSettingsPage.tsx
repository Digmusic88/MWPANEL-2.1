import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Switch,
  Typography,
  Space,
  Alert,
  Spin,
  message,
  Button,
  Modal,
  Descriptions,
  Tag,
  Row,
  Col,
} from 'antd';
import {
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import apiClient from '@services/apiClient';

const { Title, Text, Paragraph } = Typography;

interface SystemSetting {
  id: string;
  key: string;
  name: string;
  description?: string;
  type: 'boolean' | 'string' | 'number' | 'json';
  category: 'general' | 'academic' | 'reports' | 'communications' | 'modules';
  value: string;
  parsedValue: any;
  defaultValue?: string;
  isEditable: boolean;
  requiresRestart: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const ModulesSettingsPage: React.FC = () => {
  const [modules, setModules] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedModule, setSelectedModule] = useState<SystemSetting | null>(null);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/settings/modules');
      setModules(response.data);
    } catch (error: any) {
      console.error('Error fetching modules:', error);
      message.error('Error al cargar la configuración de módulos');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleToggle = async (moduleKey: string, enabled: boolean) => {
    const moduleName = moduleKey.replace('module_', '').replace('_enabled', '');
    
    try {
      setUpdating(moduleKey);
      
      if (enabled) {
        await apiClient.post(`/settings/modules/${moduleName}/enable`);
        message.success(`Módulo ${getModuleName(moduleKey)} habilitado`);
      } else {
        await apiClient.post(`/settings/modules/${moduleName}/disable`);
        message.success(`Módulo ${getModuleName(moduleKey)} deshabilitado`);
      }
      
      // Actualizar la lista
      await fetchModules();
    } catch (error: any) {
      console.error('Error updating module:', error);
      message.error(`Error al ${enabled ? 'habilitar' : 'deshabilitar'} el módulo`);
    } finally {
      setUpdating(null);
    }
  };

  const getModuleName = (key: string): string => {
    const moduleNames: { [key: string]: string } = {
      'module_expedientes_enabled': 'Expedientes',
      'module_calendario_enabled': 'Calendario',
      'module_recursos_enabled': 'Recursos',
      'module_analytics_enabled': 'Analytics',
      'module_chat_enabled': 'Chat',
    };
    return moduleNames[key] || key;
  };

  const getModuleIcon = (key: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'module_expedientes_enabled': '📋',
      'module_calendario_enabled': '📅',
      'module_recursos_enabled': '📚',
      'module_analytics_enabled': '📊',
      'module_chat_enabled': '💬',
    };
    return icons[key] || '⚙️';
  };

  const getModuleStatus = (enabled: boolean) => {
    if (enabled) {
      return (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          Habilitado
        </Tag>
      );
    } else {
      return (
        <Tag color="red" icon={<ExclamationCircleOutlined />}>
          Deshabilitado
        </Tag>
      );
    }
  };

  const showModuleDetails = (module: SystemSetting) => {
    setSelectedModule(module);
    setDetailModalVisible(true);
  };

  const initializeSettings = async () => {
    try {
      setLoading(true);
      await apiClient.post('/settings/initialize');
      message.success('Configuraciones inicializadas correctamente');
      await fetchModules();
    } catch (error: any) {
      console.error('Error initializing settings:', error);
      message.error('Error al inicializar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Cargando configuración de módulos..." />
      </div>
    );
  }

  return (
    <div className="modules-settings-page">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
        {/* Header */}
        <div className="mb-6">
          <Title level={2}>
            <SettingOutlined className="mr-2" />
            Configuración de Módulos
          </Title>
          <Paragraph type="secondary">
            Habilita o deshabilita módulos del sistema según las necesidades del centro educativo.
            Los cambios se aplican inmediatamente.
          </Paragraph>
        </div>

        {/* Warning Alert */}
        <Alert
          message="Importante"
          description="Los módulos deshabilitados no estarán disponibles para ningún usuario. Asegúrate de comunicar los cambios al personal antes de modificar la configuración."
          type="warning"
          showIcon
          className="mb-6"
        />

        {/* Actions */}
        <Row gutter={16} className="mb-6">
          <Col>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchModules}
              disabled={loading}
            >
              Actualizar
            </Button>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<SettingOutlined />} 
              onClick={initializeSettings}
              disabled={loading}
            >
              Inicializar Configuraciones
            </Button>
          </Col>
        </Row>

        {/* Modules List */}
        <Card title="Módulos del Sistema">
          {modules.length === 0 ? (
            <Alert
              message="No hay módulos configurados"
              description="Ejecuta la inicialización de configuraciones para crear los módulos por defecto."
              type="info"
              showIcon
              action={
                <Button type="primary" onClick={initializeSettings}>
                  Inicializar
                </Button>
              }
            />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={modules}
              renderItem={(module) => (
                <List.Item
                  actions={[
                    <Button
                      key="details"
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => showModuleDetails(module)}
                    >
                      Detalles
                    </Button>,
                    <Switch
                      key="toggle"
                      checked={module.parsedValue}
                      loading={updating === module.key}
                      disabled={!module.isEditable || updating === module.key}
                      onChange={(checked) => handleModuleToggle(module.key, checked)}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{ fontSize: '32px', lineHeight: 1 }}>
                        {getModuleIcon(module.key)}
                      </div>
                    }
                    title={
                      <Space>
                        <Text strong>{module.name}</Text>
                        {getModuleStatus(module.parsedValue)}
                        {module.requiresRestart && (
                          <Tag color="orange" icon={<InfoCircleOutlined />}>
                            Requiere Reinicio
                          </Tag>
                        )}
                      </Space>
                    }
                    description={
                      <div>
                        <Paragraph className="mb-2">
                          {module.description || 'Sin descripción disponible'}
                        </Paragraph>
                        <Text type="secondary" className="text-xs">
                          Última modificación: {new Date(module.updatedAt).toLocaleString('es-ES')}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>

        {/* Module Details Modal */}
        <Modal
          title="Detalles del Módulo"
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Cerrar
            </Button>,
          ]}
          width={600}
        >
          {selectedModule && (
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Nombre">
                {selectedModule.name}
              </Descriptions.Item>
              <Descriptions.Item label="Clave">
                <code>{selectedModule.key}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Descripción">
                {selectedModule.description || 'Sin descripción'}
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                {getModuleStatus(selectedModule.parsedValue)}
              </Descriptions.Item>
              <Descriptions.Item label="Tipo">
                <Tag>{selectedModule.type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Categoría">
                <Tag color="blue">{selectedModule.category}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Valor Actual">
                <code>{selectedModule.value}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Valor por Defecto">
                <code>{selectedModule.defaultValue || 'N/A'}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Editable">
                {selectedModule.isEditable ? 'Sí' : 'No'}
              </Descriptions.Item>
              <Descriptions.Item label="Requiere Reinicio">
                {selectedModule.requiresRestart ? 'Sí' : 'No'}
              </Descriptions.Item>
              <Descriptions.Item label="Creado">
                {new Date(selectedModule.createdAt).toLocaleString('es-ES')}
              </Descriptions.Item>
              <Descriptions.Item label="Actualizado">
                {new Date(selectedModule.updatedAt).toLocaleString('es-ES')}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ModulesSettingsPage;