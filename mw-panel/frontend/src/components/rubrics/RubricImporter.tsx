import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Tabs,
  Row,
  Col,
  Card,
  Alert,
  Space,
  Typography,
  Divider,
  Radio,
  Checkbox,
  message,
} from 'antd';
import {
  ExperimentOutlined,
  CopyOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { useRubrics, ImportRubricData, Rubric } from '../../hooks/useRubrics';
import RubricGrid from './RubricGrid';
import apiClient from '../../services/apiClient';

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface RubricImporterProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (rubric: Rubric) => void;
}

const RubricImporter: React.FC<RubricImporterProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('instructions');
  const [loading, setLoading] = useState(false);
  const [importFormat, setImportFormat] = useState<'markdown' | 'csv'>('markdown');
  const [previewRubric, setPreviewRubric] = useState<Rubric | null>(null);
  const [subjectAssignments, setSubjectAssignments] = useState<any[]>([]);
  const { importRubric } = useRubrics();

  // Cargar asignaturas del profesor al abrir el modal
  useEffect(() => {
    if (visible) {
      fetchSubjectAssignments();
    }
  }, [visible]);

  const fetchSubjectAssignments = async () => {
    try {
      const dashboardResponse = await apiClient.get('/teachers/dashboard/my-dashboard');
      const teacherId = dashboardResponse.data.teacher.id;
      const response = await apiClient.get(`/subjects/assignments/teacher/${teacherId}`);
      setSubjectAssignments(response.data);
    } catch (error) {
      console.error('Error fetching subject assignments:', error);
    }
  };

  const handleImport = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const importData: ImportRubricData = {
        name: values.name,
        description: values.description,
        format: values.format,
        data: values.data,
        subjectAssignmentId: values.subjectAssignmentId,
        isTemplate: values.isTemplate || false,
        isVisibleToFamilies: values.isVisibleToFamilies || false,
      };

      const rubric = await importRubric(importData);
      
      if (rubric) {
        onSuccess?.(rubric);
        form.resetFields();
        setPreviewRubric(null);
        setActiveTab('instructions');
        onClose();
      }
    } catch (error) {
      // Error ya manejado en el hook
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = async () => {
    try {
      const values = await form.validateFields(['name', 'format', 'data']);
      setLoading(true);

      const response = await apiClient.post('/rubrics/preview-import', {
        format: values.format,
        data: values.data,
      });

      setPreviewRubric({
        ...response.data,
        name: values.name,
        description: values.description || '',
      });
      
      setActiveTab('preview');
      message.success('Vista previa generada exitosamente');
    } catch (error: any) {
      console.error('Error generating preview:', error);
      message.error(error.response?.data?.message || 'Error al generar vista previa');
    } finally {
      setLoading(false);
    }
  };

  const chatGPTPrompt = `Crea una rúbrica de evaluación en formato de tabla para [TEMA/ASIGNATURA].
La tabla debe tener:
- Primera columna: Criterios de evaluación
- Columnas siguientes: Niveles de desempeño con puntuación entre paréntesis, ordenados de PEOR a MEJOR (izquierda a derecha)
- Cada celda debe describir claramente qué se espera en ese nivel

Formato la tabla así (IMPORTANTE: orden de peor a mejor):
| Criterios | Necesita mejorar (1) | Regular (2) | Bueno (3) | Excelente (4) |
|-----------|---------------------|-------------|-----------|---------------|
| [Criterio 1] | [Descripción nivel más bajo] | [Descripción nivel medio-bajo] | [Descripción nivel medio-alto] | [Descripción nivel más alto] |
| [Criterio 2] | [Descripción nivel más bajo] | [Descripción nivel medio-bajo] | [Descripción nivel medio-alto] | [Descripción nivel más alto] |

Incluye al menos 4-5 criterios relevantes. El orden debe ser siempre de PEOR (1) a MEJOR (4).`;

  const markdownExample = `| Criterios | Necesita mejorar (1) | Regular (2) | Bueno (3) | Excelente (4) |
|-----------|---------------------|-------------|-----------|---------------|
| Claridad | Muy confuso | Algo confuso | El texto es claro | El texto es muy claro |
| Gramática | Muchos errores | Varios errores | Pocos errores | Sin errores |`;

  const csvExample = `Criterios,Necesita mejorar (1),Regular (2),Bueno (3),Excelente (4)
Claridad,Muy confuso,Algo confuso,El texto es claro,El texto es muy claro
Gramática,Muchos errores,Varios errores,Pocos errores,Sin errores`;

  const instructions = [
    {
      icon: <BulbOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      title: 'Paso 1: Prepara el prompt',
      content: 'Copia el prompt sugerido y personalízalo con tu tema o asignatura específica',
    },
    {
      icon: <ExperimentOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      title: 'Paso 2: Genera con ChatGPT',
      content: 'Pega el prompt en ChatGPT y pide que genere la rúbrica en formato tabla',
    },
    {
      icon: <FileTextOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
      title: 'Paso 3: Copia la tabla',
      content: 'Copia la tabla completa generada por ChatGPT (incluye los encabezados)',
    },
    {
      icon: <ExportOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
      title: 'Paso 4: Importa aquí',
      content: 'Pega la tabla en el campo de importación y haz clic en Vista Previa',
    },
  ];

  const copyToClipboard = (text: string, successMessage: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success(successMessage);
    }).catch(() => {
      message.error('Error al copiar al portapapeles');
    });
  };

  const copyPrompt = () => copyToClipboard(chatGPTPrompt, 'Prompt copiado al portapapeles');
  const copyExample = (type: 'markdown' | 'csv') => {
    const example = type === 'markdown' ? markdownExample : csvExample;
    copyToClipboard(example, 'Ejemplo copiado al portapapeles');
  };

  const tabItems = [
    {
      key: 'instructions',
      label: 'Instrucciones',
      children: (
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <Alert
            message="Importación desde ChatGPT"
            description="Sigue estos pasos para importar una rúbrica generada por ChatGPT"
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />

          {/* Instrucciones paso a paso */}
          <Row gutter={16}>
            {instructions.map((instruction, index) => (
              <Col key={index} span={12} style={{ marginBottom: '16px' }}>
                <Card size="small">
                  <Space>
                    {instruction.icon}
                    <div>
                      <Text strong>{instruction.title}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {instruction.content}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          <Divider>Prompt para ChatGPT</Divider>
          
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>Copia este prompt y pégalo en ChatGPT:</Text>
                <Button size="small" icon={<CopyOutlined />} onClick={copyPrompt}>
                  Copiar
                </Button>
              </div>
              <div 
                style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '12px', 
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {chatGPTPrompt}
              </div>
            </Space>
          </Card>

          <Divider>Ejemplos de Formato</Divider>
          
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Formato Markdown" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    size="small" 
                    icon={<CopyOutlined />} 
                    onClick={() => copyExample('markdown')}
                    style={{ alignSelf: 'flex-end' }}
                  >
                    Copiar
                  </Button>
                  <div 
                    style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '8px', 
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      whiteSpace: 'pre'
                    }}
                  >
                    {markdownExample}
                  </div>
                </Space>
              </Card>
            </Col>
            
            <Col span={12}>
              <Card title="Formato CSV" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    size="small" 
                    icon={<CopyOutlined />} 
                    onClick={() => copyExample('csv')}
                    style={{ alignSelf: 'flex-end' }}
                  >
                    Copiar
                  </Button>
                  <div 
                    style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '8px', 
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      whiteSpace: 'pre'
                    }}
                  >
                    {csvExample}
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'import',
      label: 'Importar Datos',
      children: (
        <Form form={form} layout="vertical" onValuesChange={(changedFields) => {
          if (changedFields.format) {
            setImportFormat(changedFields.format);
          }
        }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Nombre de la Rúbrica"
                rules={[{ required: true, message: 'El nombre es obligatorio' }]}
              >
                <Input placeholder="Ej: Rúbrica de Redacción" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="subjectAssignmentId" label="Asignatura">
                <Select placeholder="Seleccionar asignatura (opcional)" allowClear>
                  {subjectAssignments.map(assignment => (
                    <Option key={assignment.id} value={assignment.id}>
                      {assignment.subject.name} ({assignment.subject.code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Descripción"
          >
            <TextArea 
              rows={2} 
              placeholder="Describe brevemente el propósito de esta rúbrica"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="isTemplate" valuePropName="checked">
                <Checkbox>Guardar como plantilla reutilizable</Checkbox>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isVisibleToFamilies" valuePropName="checked">
                <Checkbox>Visible para las familias</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Datos de la Rúbrica</Divider>

          <Form.Item 
            name="format" 
            label="Formato de Importación"
            rules={[{ required: true, message: 'Selecciona el formato' }]}
          >
            <Radio.Group>
              <Radio value="markdown">Markdown (tabla con |)</Radio>
              <Radio value="csv">CSV (separado por comas)</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="data"
            label="Pega aquí la tabla generada por ChatGPT"
            rules={[
              { required: true, message: 'Los datos son obligatorios' },
              {
                validator: (_, value) => {
                  if (!value || value.trim() === '') {
                    return Promise.reject('Debes pegar la tabla generada por ChatGPT');
                  }
                  
                  // Validación básica según el formato
                  const format = form.getFieldValue('format');
                  if (format === 'markdown') {
                    if (!value.includes('|')) {
                      return Promise.reject('El formato Markdown debe contener tablas con |');
                    }
                  } else if (format === 'csv') {
                    if (!value.includes(',')) {
                      return Promise.reject('El formato CSV debe contener valores separados por comas');
                    }
                  }
                  
                  return Promise.resolve();
                }
              }
            ]}
          >
            <TextArea
              rows={10}
              placeholder={importFormat === 'markdown' ? 
                "| Criterios | Necesita mejorar (1) | Regular (2) | Bueno (3) | Excelente (4) |\n|-----------|---------------------|-------------|-----------|---------------|\n| ..." :
                "Criterios,Necesita mejorar (1),Regular (2),Bueno (3),Excelente (4)\n..."
              }
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
          </Form.Item>

          <Alert
            message="Consejo"
            description="Asegúrate de que la tabla tenga una fila de encabezado con los niveles y sus puntuaciones entre paréntesis"
            type="warning"
            showIcon
          />
        </Form>
      )
    },
    {
      key: 'preview',
      label: 'Vista Previa',
      children: previewRubric ? (
        <RubricGrid
          rubric={previewRubric}
          editable={false}
          viewMode="view"
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="secondary">
            Completa los datos de importación y haz clic en "Vista Previa" para ver cómo quedará la rúbrica
          </Text>
        </div>
      )
    }
  ];

  return (
    <Modal
      title="Importar Rúbrica desde ChatGPT"
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        <Button key="preview" onClick={generatePreview}>
          Vista Previa
        </Button>,
        <Button key="import" type="primary" loading={loading} onClick={handleImport}>
          Importar Rúbrica
        </Button>
      ]}
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={tabItems}
      />
    </Modal>
  );
};

export default RubricImporter;