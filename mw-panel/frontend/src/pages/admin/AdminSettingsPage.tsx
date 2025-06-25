import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Typography,
  Space,
  Divider,
  Alert,
  Switch,
  Select,
  InputNumber,
  Tabs,
  Row,
  Col,
  TimePicker,
  Checkbox,
  Slider,
  Transfer,
  Table,
  Tag,
  Modal,
  Progress,
} from 'antd';
import {
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  InfoCircleOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  DatabaseOutlined,
  BellOutlined,
  CloudServerOutlined,
  FileTextOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import apiClient from '@services/apiClient';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SystemConfiguration {
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  defaultUserRole: string;
  sessionTimeout: number;
  maxFileUploadSize: number;
  enabledModules: string[];
  systemName: string;
  systemEmail: string;
  maxStudentsPerClass: number;
  academicYearStart: string;
  academicYearEnd: string;
}

interface SecuritySettings {
  requireTwoFactor: boolean;
  passwordExpiration: number;
  passwordMinLength: number;
  passwordRequireSpecialChars: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireUppercase: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number;
  allowPasswordReset: boolean;
  ipWhitelist: string[];
}

interface BackupSettings {
  enableAutoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupTime: string;
  retentionDays: number;
  includeUploads: boolean;
  enableCloudBackup: boolean;
  cloudProvider?: string;
  compressionLevel: number;
}

interface NotificationSettings {
  enableSystemAlerts: boolean;
  enableErrorNotifications: boolean;
  enableSecurityAlerts: boolean;
  adminEmails: string[];
  alertThresholds: {
    diskUsage: number;
    memoryUsage: number;
    errorRate: number;
    loginFailures: number;
  };
}

interface LogSettings {
  enableAuditLog: boolean;
  enableErrorLog: boolean;
  enableAccessLog: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  logRetentionDays: number;
  enableLogRotation: boolean;
  maxLogSize: number;
}

const AdminSettingsPage: React.FC = () => {
  const [passwordForm] = Form.useForm();
  const [systemForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [backupForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [logForm] = Form.useForm();
  
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [systemLoading, setSystemLoading] = useState(false);
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  
  const [systemConfig, setSystemConfig] = useState<SystemConfiguration>({
    maintenanceMode: false,
    allowRegistrations: true,
    defaultUserRole: 'student',
    sessionTimeout: 60,
    maxFileUploadSize: 10,
    enabledModules: [],
    systemName: 'MW Panel',
    systemEmail: 'admin@mwpanel.com',
    maxStudentsPerClass: 30,
    academicYearStart: '2024-09-01',
    academicYearEnd: '2025-06-30',
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    requireTwoFactor: false,
    passwordExpiration: 90,
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    allowPasswordReset: true,
    ipWhitelist: [],
  });

  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    enableAutoBackup: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    retentionDays: 30,
    includeUploads: true,
    enableCloudBackup: false,
    compressionLevel: 6,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enableSystemAlerts: true,
    enableErrorNotifications: true,
    enableSecurityAlerts: true,
    adminEmails: ['admin@mwpanel.com'],
    alertThresholds: {
      diskUsage: 80,
      memoryUsage: 85,
      errorRate: 5,
      loginFailures: 10,
    },
  });

  const [logSettings, setLogSettings] = useState<LogSettings>({
    enableAuditLog: true,
    enableErrorLog: true,
    enableAccessLog: true,
    logLevel: 'info',
    logRetentionDays: 90,
    enableLogRotation: true,
    maxLogSize: 100,
  });

  const availableModules = [
    { key: 'users', title: 'Sistema de Usuarios' },
    { key: 'teachers', title: 'Sistema de Profesores' },
    { key: 'students', title: 'Sistema de Estudiantes' },
    { key: 'families', title: 'Sistema de Familias' },
    { key: 'communications', title: 'Sistema de Comunicaciones' },
    { key: 'tasks', title: 'Sistema de Tareas' },
    { key: 'evaluations', title: 'Sistema de Evaluaciones' },
    { key: 'rubrics', title: 'Sistema de Rúbricas' },
    { key: 'calendar', title: 'Sistema de Calendario' },
    { key: 'attendance', title: 'Sistema de Asistencia' },
    { key: 'reports', title: 'Sistema de Informes' },
    { key: 'backup', title: 'Sistema de Backup' },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setSystemLoading(true);
      const response = await apiClient.get('/admin/settings');
      const settings = response.data;
      
      if (settings.system) {
        setSystemConfig(settings.system);
        systemForm.setFieldsValue(settings.system);
      }
      if (settings.security) {
        setSecuritySettings(settings.security);
        securityForm.setFieldsValue(settings.security);
      }
      if (settings.backup) {
        setBackupSettings(settings.backup);
        backupForm.setFieldsValue(settings.backup);
      }
      if (settings.notifications) {
        setNotificationSettings(settings.notifications);
        notificationForm.setFieldsValue(settings.notifications);
      }
      if (settings.logs) {
        setLogSettings(settings.logs);
        logForm.setFieldsValue(settings.logs);
      }
    } catch (error: any) {
      console.error('Error loading admin settings:', error);
    } finally {
      setSystemLoading(false);
    }
  };

  const handleChangePassword = async (values: ChangePasswordForm) => {
    try {
      setPasswordLoading(true);
      
      await apiClient.patch('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      
      message.success('Contraseña cambiada exitosamente');
      passwordForm.resetFields();
    } catch (error: any) {
      console.error('Error changing password:', error);
      message.error(error.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveSystemSettings = async (values: any) => {
    try {
      await apiClient.patch('/admin/settings', { system: values });
      setSystemConfig(values);
      message.success('Configuración del sistema guardada');
    } catch (error: any) {
      console.error('Error saving system settings:', error);
      message.error('Error al guardar la configuración del sistema');
    }
  };

  const handleSaveSecuritySettings = async (values: any) => {
    try {
      await apiClient.patch('/admin/settings', { security: values });
      setSecuritySettings(values);
      message.success('Configuración de seguridad guardada');
    } catch (error: any) {
      console.error('Error saving security settings:', error);
      message.error('Error al guardar la configuración de seguridad');
    }
  };

  const handleSaveBackupSettings = async (values: any) => {
    try {
      await apiClient.patch('/admin/settings', { backup: values });
      setBackupSettings(values);
      message.success('Configuración de backup guardada');
    } catch (error: any) {
      console.error('Error saving backup settings:', error);
      message.error('Error al guardar la configuración de backup');
    }
  };

  const handleManualBackup = async () => {
    try {
      setBackupModalVisible(true);
      setBackupProgress(0);
      
      // Simulate backup progress
      const interval = setInterval(() => {
        setBackupProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            message.success('Backup completado exitosamente');
            setTimeout(() => setBackupModalVisible(false), 1000);
            return 100;
          }
          return prev + 10;
        });
      }, 500);
      
      await apiClient.post('/admin/backup/manual');
    } catch (error: any) {
      console.error('Error creating backup:', error);
      message.error('Error al crear el backup');
      setBackupModalVisible(false);
    }
  };

  const validatePassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('La nueva contraseña es obligatoria'));
    }

    const hasLowerCase = /[a-z]/.test(value);
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[@$!%*?&]/.test(value);
    const hasMinLength = value.length >= 8;

    if (!hasMinLength) return Promise.reject(new Error('La contraseña debe tener al menos 8 caracteres'));
    if (!hasLowerCase) return Promise.reject(new Error('La contraseña debe contener al menos una letra minúscula'));
    if (!hasUpperCase) return Promise.reject(new Error('La contraseña debe contener al menos una letra mayúscula'));
    if (!hasNumbers) return Promise.reject(new Error('La contraseña debe contener al menos un número'));
    if (!hasSpecialChar) return Promise.reject(new Error('La contraseña debe contener al menos un carácter especial (@$!%*?&)'));

    return Promise.resolve();
  };

  const validateConfirmPassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Confirma tu nueva contraseña'));
    }
    const newPassword = passwordForm.getFieldValue('newPassword');
    if (value !== newPassword) {
      return Promise.reject(new Error('Las contraseñas no coinciden'));
    }
    return Promise.resolve();
  };

  const tabItems = [
    {
      key: 'security',
      label: (
        <span>
          <LockOutlined />
          Seguridad
        </span>
      ),
      children: (
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Cambiar Contraseña">
                  <Alert
                    message="Requisitos de contraseña"
                    description={
                      <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        <li>Al menos 8 caracteres</li>
                        <li>Al menos una letra minúscula</li>
                        <li>Al menos una letra mayúscula</li>
                        <li>Al menos un número</li>
                        <li>Al menos un carácter especial (@$!%*?&)</li>
                      </ul>
                    }
                    type="info"
                    icon={<InfoCircleOutlined />}
                    style={{ marginBottom: 24 }}
                  />

                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleChangePassword}
                    autoComplete="off"
                  >
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          name="currentPassword"
                          label="Contraseña Actual"
                          rules={[{ required: true, message: 'Por favor ingresa tu contraseña actual' }]}
                        >
                          <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Ingresa tu contraseña actual"
                            iconRender={(visible) => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="newPassword"
                          label="Nueva Contraseña"
                          rules={[{ validator: validatePassword }]}
                        >
                          <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Ingresa tu nueva contraseña"
                            iconRender={(visible) => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="confirmPassword"
                          label="Confirmar Nueva Contraseña"
                          rules={[{ validator: validateConfirmPassword }]}
                        >
                          <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Confirma tu nueva contraseña"
                            iconRender={(visible) => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={passwordLoading}
                        size="large"
                      >
                        Cambiar Contraseña
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>

              <Col span={24}>
                <Card title="Configuración de Seguridad Global">
                  <Form
                    form={securityForm}
                    layout="vertical"
                    onFinish={handleSaveSecuritySettings}
                    initialValues={securitySettings}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="passwordMinLength" label="Longitud mínima de contraseña">
                          <InputNumber min={6} max={20} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="passwordExpiration" label="Expiración de contraseña (días)">
                          <InputNumber min={0} max={365} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="maxLoginAttempts" label="Intentos máximos de login">
                          <InputNumber min={3} max={10} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="lockoutDuration" label="Duración de bloqueo (minutos)">
                          <InputNumber min={5} max={120} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item name="requireTwoFactor" valuePropName="checked">
                      <Checkbox>Requerir autenticación de dos factores</Checkbox>
                    </Form.Item>
                    <Form.Item name="passwordRequireSpecialChars" valuePropName="checked">
                      <Checkbox>Requerir caracteres especiales en contraseñas</Checkbox>
                    </Form.Item>
                    <Form.Item name="passwordRequireNumbers" valuePropName="checked">
                      <Checkbox>Requerir números en contraseñas</Checkbox>
                    </Form.Item>
                    <Form.Item name="passwordRequireUppercase" valuePropName="checked">
                      <Checkbox>Requerir mayúsculas en contraseñas</Checkbox>
                    </Form.Item>
                    <Form.Item name="allowPasswordReset" valuePropName="checked">
                      <Checkbox>Permitir restablecimiento de contraseña</Checkbox>
                    </Form.Item>

                    <Form.Item>
                      <Button type="primary" htmlType="submit" size="large">
                        Guardar Configuración de Seguridad
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>
            </Row>
      ),
    },
    {
      key: 'system',
      label: (
        <span>
          <SettingOutlined />
          Sistema
        </span>
      ),
      children: (
            <Card title="Configuración General del Sistema">
              <Form
                form={systemForm}
                layout="vertical"
                onFinish={handleSaveSystemSettings}
                initialValues={systemConfig}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="systemName" label="Nombre del Sistema">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="systemEmail" label="Email del Sistema">
                      <Input type="email" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="defaultUserRole" label="Rol por defecto">
                      <Select>
                        <Option value="student">Estudiante</Option>
                        <Option value="teacher">Profesor</Option>
                        <Option value="family">Familia</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="sessionTimeout" label="Timeout de sesión (minutos)">
                      <InputNumber min={15} max={480} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="maxFileUploadSize" label="Tamaño máximo de archivo (MB)">
                      <InputNumber min={1} max={100} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="maxStudentsPerClass" label="Estudiantes máximo por clase">
                      <InputNumber min={10} max={50} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="academicYearStart" label="Inicio año académico">
                      <Input type="date" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="academicYearEnd" label="Final año académico">
                      <Input type="date" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="maintenanceMode" valuePropName="checked">
                  <Checkbox>Modo mantenimiento (bloquear acceso a usuarios)</Checkbox>
                </Form.Item>
                <Form.Item name="allowRegistrations" valuePropName="checked">
                  <Checkbox>Permitir auto-registros</Checkbox>
                </Form.Item>

                <Divider orientation="left">Módulos del Sistema</Divider>
                <Form.Item name="enabledModules" label="Módulos habilitados">
                  <Transfer
                    dataSource={availableModules}
                    targetKeys={systemConfig.enabledModules}
                    render={item => item.title}
                    onChange={(targetKeys) => {
                      setSystemConfig(prev => ({ ...prev, enabledModules: targetKeys }));
                    }}
                  />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" size="large">
                    Guardar Configuración del Sistema
                  </Button>
                </Form.Item>
              </Form>
            </Card>
      ),
    },
    {
      key: 'backup',
      label: (
        <span>
          <DatabaseOutlined />
          Backup
        </span>
      ),
      children: (
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Configuración de Backup Automático">
                  <Form
                    form={backupForm}
                    layout="vertical"
                    onFinish={handleSaveBackupSettings}
                    initialValues={backupSettings}
                  >
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name="backupFrequency" label="Frecuencia">
                          <Select>
                            <Option value="daily">Diario</Option>
                            <Option value="weekly">Semanal</Option>
                            <Option value="monthly">Mensual</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="backupTime" label="Hora de backup">
                          <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="retentionDays" label="Días de retención">
                          <InputNumber min={7} max={365} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="compressionLevel" label="Nivel de compresión">
                          <Slider min={0} max={9} marks={{ 0: '0', 9: '9' }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="cloudProvider" label="Proveedor de nube">
                          <Select allowClear>
                            <Option value="aws">Amazon S3</Option>
                            <Option value="google">Google Cloud</Option>
                            <Option value="azure">Microsoft Azure</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item name="enableAutoBackup" valuePropName="checked">
                      <Checkbox>Habilitar backup automático</Checkbox>
                    </Form.Item>
                    <Form.Item name="includeUploads" valuePropName="checked">
                      <Checkbox>Incluir archivos subidos por usuarios</Checkbox>
                    </Form.Item>
                    <Form.Item name="enableCloudBackup" valuePropName="checked">
                      <Checkbox>Habilitar backup en la nube</Checkbox>
                    </Form.Item>

                    <Form.Item>
                      <Space>
                        <Button type="primary" htmlType="submit" size="large">
                          Guardar Configuración de Backup
                        </Button>
                        <Button 
                          icon={<SyncOutlined />} 
                          onClick={handleManualBackup}
                          size="large"
                        >
                          Crear Backup Manual
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>
            </Row>
      ),
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined />
          Notificaciones
        </span>
      ),
      children: (
            <Card title="Configuración de Alertas del Sistema">
              <Alert
                message="Configuración de Alertas"
                description="Estas configuraciones determinan cuándo y cómo recibirás notificaciones sobre el estado del sistema."
                type="info"
                style={{ marginBottom: 24 }}
              />
              
              <Text>Esta funcionalidad está en desarrollo y estará disponible próximamente.</Text>
            </Card>
      ),
    },
    {
      key: 'logs',
      label: (
        <span>
          <FileTextOutlined />
          Logs
        </span>
      ),
      children: (
            <Card title="Configuración de Logs y Auditoría">
              <Alert
                message="Configuración de Logs"
                description="Gestiona cómo se registran y almacenan los eventos del sistema para auditoría y debugging."
                type="info"
                style={{ marginBottom: 24 }}
              />
              
              <Text>Esta funcionalidad está en desarrollo y estará disponible próximamente.</Text>
            </Card>
      ),
    },
  ];

  return (
    <div className="admin-settings-page">
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <SettingOutlined style={{ fontSize: '48px', color: '#722ed1', marginBottom: 16 }} />
          <Title level={2}>Configuración del Administrador</Title>
          <Text type="secondary">
            Gestiona la configuración global del sistema y la seguridad
          </Text>
        </div>

        <Tabs defaultActiveKey="security" size="large" items={tabItems} />

        {/* Manual Backup Progress Modal */}
        <Modal
          title="Creando Backup Manual"
          open={backupModalVisible}
          footer={null}
          closable={false}
          centered
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>Creando backup del sistema...</Text>
            <Progress percent={backupProgress} status={backupProgress === 100 ? 'success' : 'active'} />
            {backupProgress === 100 && (
              <Alert message="Backup completado exitosamente" type="success" showIcon />
            )}
          </Space>
        </Modal>
      </div>
    </div>
  );
};

export default AdminSettingsPage;