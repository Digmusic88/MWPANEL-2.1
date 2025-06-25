import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  Typography,
  Alert,
  Tabs,
  Card,
  Divider,
  Row,
  Col,
  message
} from 'antd';
import { CopyOutlined, FileTextOutlined, TableOutlined, EyeOutlined } from '@ant-design/icons';
import { Rubric, ImportRubricData, useRubrics } from '../../hooks/useRubrics';
import RubricGrid from './RubricGrid';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface RubricImporterProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (rubric: Rubric) => void;
  subjectAssignments?: Array<{ id: string; subject: { name: string; code: string } }>;
}

const RubricImporter: React.FC<RubricImporterProps> = ({
  visible,
  onCancel,
  onSuccess,
  subjectAssignments = []
}) => {
  const [form] = Form.useForm();
  const { importRubric, loading } = useRubrics();
  
  const [activeTab, setActiveTab] = useState('instructions');
  const [previewRubric, setPreviewRubric] = useState<Rubric | null>(null);
  const [importFormat, setImportFormat] = useState<'markdown' | 'csv'>('markdown');

  // Ejemplos de formato
  const markdownExample = `| Criterio | Insuficiente | Aceptable | Bueno | Excelente |
|----------|--------------|-----------|-------|-----------|
| Coherencia del texto | No coherente | Algo claro | Claro | Muy claro |
| Ortografía | Muchos fallos | Algunos fallos | Bien | Sin errores |
| Creatividad | Sin originalidad | Algo creativo | Creativo | Muy original |`;

  const csvExample = `Criterio,Insuficiente,Aceptable,Bueno,Excelente
Coherencia del texto,No coherente,Algo claro,Claro,Muy claro
Ortografía,Muchos fallos,Algunos fallos,Bien,Sin errores
Creatividad,Sin originalidad,Algo creativo,Creativo,Muy original`;

  // Prompt para ChatGPT
  const chatGPTPrompt = `Crea una rúbrica de evaluación en formato de tabla con los siguientes elementos:

1. Primera fila: Encabezados con "Criterio" y los niveles de desempeño (ej: Insuficiente, Aceptable, Bueno, Excelente)
2. Filas siguientes: Cada criterio con sus descriptores para cada nivel
3. Entre 3-6 criterios de evaluación
4. Entre 3-5 niveles de desempeño

Formato requerido: Tabla Markdown

Ejemplo de estructura:
| Criterio | Insuficiente | Aceptable | Bueno | Excelente |
|----------|--------------|-----------|-------|-----------|
| [Criterio 1] | [Descriptor] | [Descriptor] | [Descriptor] | [Descriptor] |

Tema de la rúbrica: [ESPECIFICA EL TEMA AQUÍ]`;

  // Instrucciones para el usuario
  const instructions = [
    {
      title: '1. Solicita a ChatGPT',
      content: 'Copia el prompt proporcionado y pégalo en ChatGPT especificando el tema de tu rúbrica.',
      icon: <CopyOutlined />
    },
    {
      title: '2. Obtén la tabla',
      content: 'ChatGPT generará una tabla en formato Markdown. Copia toda la tabla generada.',
      icon: <TableOutlined />
    },
    {
      title: '3. Pega e importa',
      content: 'Pega la tabla en el campo de datos y completa la información básica.',
      icon: <FileTextOutlined />
    },
    {
      title: '4. Revisa y guarda',
      content: 'Usa la vista previa para verificar que todo esté correcto antes de guardar.',
      icon: <EyeOutlined />
    }
  ];

  // Resetear formulario al abrir
  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        format: 'markdown',
        isTemplate: false,
        isVisibleToFamilies: true
      });
      setImportFormat('markdown');
      setPreviewRubric(null);
      setActiveTab('instructions');
    }
  }, [visible, form]);

  // Copiar prompt al portapapeles
  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(chatGPTPrompt);
      message.success('Prompt copiado al portapapeles');
    } catch (error) {
      message.error('Error al copiar. Selecciona y copia manualmente.');
    }
  };

  // Copiar ejemplo
  const copyExample = async (format: 'markdown' | 'csv') => {
    const example = format === 'markdown' ? markdownExample : csvExample;
    try {
      await navigator.clipboard.writeText(example);
      message.success('Ejemplo copiado al portapapeles');
    } catch (error) {
      message.error('Error al copiar. Selecciona y copia manualmente.');
    }
  };

  // Parsear tabla Markdown para preview
  const parseMarkdownForPreview = (data: string): Partial<Rubric> | null => {
    try {
      const lines = data.trim().split('\n').filter(line => line.trim());
      if (lines.length < 3) return null;

      // Obtener encabezados
      const headers = lines[0].split('|').map(h => h.trim()).filter(h => h);
      if (headers.length < 3) return null;

      const [, ...levelNames] = headers; // Saltar "Criterio"

      // Procesar filas de datos (saltar línea de separación)
      const dataRows = lines.slice(2);
      const criteria: Array<{ name: string; order: number; weight: number }> = [];
      
      dataRows.forEach((row, index) => {
        const cells = row.split('|').map(c => c.trim()).filter(c => c);
        if (cells.length > 0) {
          criteria.push({
            name: cells[0],
            order: index,
            weight: 1 / dataRows.length
          });
        }
      });

      const levels = levelNames.map((name, index) => ({
        name,
        order: index,
        scoreValue: index + 1,
        color: generatePreviewColor(index, levelNames.length)
      }));

      return {
        name: 'Vista Previa Importación',
        criteria: criteria as any,
        levels: levels as any,
        cells: [],
        criteriaCount: criteria.length,
        levelsCount: levels.length
      };
    } catch (error) {
      return null;
    }
  };

  // Generar color para preview
  const generatePreviewColor = (index: number, total: number): string => {
    if (total === 1) return '#4CAF50';
    
    const ratio = index / (total - 1);
    const startColor = { r: 255, g: 76, b: 76 }; // Rojo
    const endColor = { r: 76, g: 175, b: 80 };   // Verde

    const r = Math.round(startColor.r + (endColor.r - startColor.r) * ratio);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * ratio);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * ratio);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Generar vista previa
  const generatePreview = () => {
    const formValues = form.getFieldsValue();
    
    if (!formValues.data || !formValues.data.trim()) {
      message.warning('Pega los datos de la tabla para generar la vista previa');
      return;
    }

    if (formValues.format === 'markdown') {
      const parsedRubric = parseMarkdownForPreview(formValues.data);
      if (parsedRubric) {
        const mockRubric: Rubric = {
          id: 'preview',
          name: formValues.name || 'Vista Previa Importación',
          description: formValues.description || '',
          status: 'draft',
          isTemplate: formValues.isTemplate || false,
          isActive: true,
          isVisibleToFamilies: formValues.isVisibleToFamilies || false,
          maxScore: 100,
          teacherId: 'current-teacher',
          subjectAssignmentId: formValues.subjectAssignmentId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...parsedRubric
        } as Rubric;

        setPreviewRubric(mockRubric);
        setActiveTab('preview');
      } else {
        message.error('Error al parsear la tabla. Verifica el formato.');
      }
    } else {
      // Para CSV sería similar pero más simple
      message.info('Vista previa disponible para formato Markdown');
    }
  };

  // Importar rúbrica
  const handleImport = async () => {
    try {
      const formValues = await form.validateFields();
      
      if (!formValues.data || !formValues.data.trim()) {
        message.error('Debes pegar los datos de la tabla');
        return;
      }

      const importData: ImportRubricData = {
        name: formValues.name,
        description: formValues.description,
        format: formValues.format,
        data: formValues.data,
        isTemplate: formValues.isTemplate,
        isVisibleToFamilies: formValues.isVisibleToFamilies,
        subjectAssignmentId: formValues.subjectAssignmentId
      };

      const result = await importRubric(importData);
      
      if (result) {
        onSuccess(result);
        handleCancel();
      }
    } catch (error) {
      console.error('Error importing rubric:', error);
    }
  };

  // Cancelar y limpiar
  const handleCancel = () => {
    form.resetFields();
    setPreviewRubric(null);
    setActiveTab('instructions');
    onCancel();
  };

  return (
    <Modal
      title="Importar Rúbrica desde ChatGPT"
      open={visible}
      onCancel={handleCancel}
      width={1000}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
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
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Instrucciones" key="instructions">
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
        </TabPane>

        <TabPane tab="Importar Datos" key="import">
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

            <Form.Item name="description" label="Descripción">
              <TextArea 
                rows={2} 
                placeholder="Descripción opcional de la rúbrica"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="format" label="Formato de Datos">
                  <Select>
                    <Option value="markdown">Tabla Markdown</Option>
                    <Option value="csv">CSV</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="isTemplate" label="Es Plantilla" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="isVisibleToFamilies" label="Visible para Familias" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="data"
              label={`Datos de la Tabla (${importFormat === 'markdown' ? 'Markdown' : 'CSV'})`}
              rules={[{ required: true, message: 'Los datos son obligatorios' }]}
            >
              <TextArea
                rows={8}
                placeholder={
                  importFormat === 'markdown' 
                    ? 'Pega aquí la tabla en formato Markdown generada por ChatGPT...'
                    : 'Pega aquí los datos en formato CSV...'
                }
                style={{ fontFamily: 'monospace' }}
              />
            </Form.Item>

            <Alert
              message="Recomendación"
              description="Asegúrate de que la tabla tenga una estructura clara con criterios en las filas y niveles en las columnas. La primera fila debe contener los encabezados."
              type="info"
              showIcon
            />
          </Form>
        </TabPane>

        <TabPane tab="Vista Previa" key="preview">
          {previewRubric ? (
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
          )}
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default RubricImporter;