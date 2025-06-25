import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Switch,
  Select,
  InputNumber,
  Button,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Card,
  Tag,
  message,
  Tabs,
  Alert
} from 'antd';
import { PlusOutlined, DeleteOutlined, BgColorsOutlined } from '@ant-design/icons';
import { Rubric, RubricCriterion, RubricLevel, CreateRubricData, useRubrics } from '../../hooks/useRubrics';
import RubricGrid from './RubricGrid';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface RubricEditorProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (rubric: Rubric) => void;
  editingRubric?: Rubric | null;
  subjectAssignments?: Array<{ id: string; subject: { name: string; code: string } }>;
}

interface FormRubricData extends Omit<CreateRubricData, 'criteria' | 'levels' | 'cells'> {
  criteriaCount: number;
  levelsCount: number;
}

const RubricEditor: React.FC<RubricEditorProps> = ({
  visible,
  onCancel,
  onSuccess,
  editingRubric,
  subjectAssignments = []
}) => {
  const [form] = Form.useForm();
  const { createRubric, updateRubric, generateColors, loading } = useRubrics();
  
  const [criteria, setCriteria] = useState<Array<Omit<RubricCriterion, 'id' | 'isActive'>>>([]);
  const [levels, setLevels] = useState<Array<Omit<RubricLevel, 'id' | 'isActive'>>>([]);
  const [previewRubric, setPreviewRubric] = useState<Rubric | null>(null);
  const [activeTab, setActiveTab] = useState('config');
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar formulario cuando se edita una rúbrica
  useEffect(() => {
    if (editingRubric && visible && !isInitialized) {
      form.setFieldsValue({
        name: editingRubric.name,
        description: editingRubric.description,
        isTemplate: editingRubric.isTemplate,
        isVisibleToFamilies: editingRubric.isVisibleToFamilies,
        subjectAssignmentId: editingRubric.subjectAssignmentId,
        maxScore: editingRubric.maxScore,
        criteriaCount: editingRubric.criteriaCount,
        levelsCount: editingRubric.levelsCount
      });

      setCriteria(editingRubric.criteria.map(c => ({
        name: c.name,
        description: c.description,
        order: c.order,
        weight: c.weight
      })));

      setLevels(editingRubric.levels.map(l => ({
        name: l.name,
        description: l.description,
        order: l.order,
        scoreValue: l.scoreValue,
        color: l.color
      })));
      
      setIsInitialized(true);
    } else if (visible && !editingRubric && !isInitialized) {
      // Valores por defecto para nueva rúbrica
      form.setFieldsValue({
        isTemplate: false,
        isVisibleToFamilies: true,
        maxScore: 100,
        criteriaCount: 3,
        levelsCount: 4
      });
      initializeDefaultStructure();
      setIsInitialized(true);
    } else if (!visible) {
      // Reset del flag cuando se cierre el modal
      setIsInitialized(false);
      setPreviewRubric(null);
      setActiveTab('config');
    }
  }, [editingRubric, visible, isInitialized, form]);

  // Inicializar estructura por defecto
  const initializeDefaultStructure = () => {
    const defaultCriteria = [
      { name: 'Criterio 1', description: '', order: 0, weight: 0.33 },
      { name: 'Criterio 2', description: '', order: 1, weight: 0.33 },
      { name: 'Criterio 3', description: '', order: 2, weight: 0.34 }
    ];

    const defaultColors = generateColors(4);
    const defaultLevels = [
      { name: 'Insuficiente', description: 'Nivel insuficiente', order: 0, scoreValue: 1, color: defaultColors[0] },
      { name: 'Aceptable', description: 'Nivel aceptable', order: 1, scoreValue: 2, color: defaultColors[1] },
      { name: 'Bueno', description: 'Buen nivel', order: 2, scoreValue: 3, color: defaultColors[2] },
      { name: 'Excelente', description: 'Nivel excelente', order: 3, scoreValue: 4, color: defaultColors[3] }
    ];

    setCriteria(defaultCriteria);
    setLevels(defaultLevels);
  };

  // Actualizar cantidad de criterios
  const updateCriteriaCount = (count: number) => {
    const currentCount = criteria.length;
    
    if (count > currentCount) {
      // Añadir criterios
      const newCriteria = [...criteria];
      for (let i = currentCount; i < count; i++) {
        newCriteria.push({
          name: `Criterio ${i + 1}`,
          description: '',
          order: i,
          weight: 1 / count
        });
      }
      // Reajustar pesos
      const adjustedCriteria = newCriteria.map(c => ({ ...c, weight: 1 / count }));
      setCriteria(adjustedCriteria);
    } else if (count < currentCount) {
      // Eliminar criterios
      const trimmedCriteria = criteria.slice(0, count);
      // Reajustar pesos
      const adjustedCriteria = trimmedCriteria.map(c => ({ ...c, weight: 1 / count }));
      setCriteria(adjustedCriteria);
    }
  };

  // Actualizar cantidad de niveles
  const updateLevelsCount = (count: number) => {
    const currentCount = levels.length;
    const colors = generateColors(count);
    
    if (count > currentCount) {
      // Añadir niveles
      const newLevels = [...levels];
      for (let i = currentCount; i < count; i++) {
        newLevels.push({
          name: `Nivel ${i + 1}`,
          description: '',
          order: i,
          scoreValue: i + 1,
          color: colors[i]
        });
      }
      setLevels(newLevels);
    } else if (count < currentCount) {
      // Eliminar niveles y recolorear
      const trimmedLevels = levels.slice(0, count).map((level, index) => ({
        ...level,
        color: colors[index]
      }));
      setLevels(trimmedLevels);
    }
  };

  // Actualizar criterio
  const updateCriterion = (index: number, updates: Partial<Omit<RubricCriterion, 'id' | 'isActive'>>) => {
    const updatedCriteria = criteria.map((criterion, i) => 
      i === index ? { ...criterion, ...updates } : criterion
    );
    setCriteria(updatedCriteria);
  };

  // Actualizar nivel
  const updateLevel = (index: number, updates: Partial<Omit<RubricLevel, 'id' | 'isActive'>>) => {
    const updatedLevels = levels.map((level, i) => 
      i === index ? { ...level, ...updates } : level
    );
    setLevels(updatedLevels);
  };

  // Generar vista previa
  const generatePreview = async () => {
    try {
      // Validar solo los campos necesarios para la vista previa
      await form.validateFields(['name']);
      
      const formValues = form.getFieldsValue();
      
      // Validar que hay criterios y niveles
      if (criteria.length === 0) {
        message.error('Debe tener al menos un criterio para generar la vista previa');
        return;
      }
      
      if (levels.length === 0) {
        message.error('Debe tener al menos un nivel para generar la vista previa');
        return;
      }
      
      const mockRubric: Rubric = {
        id: 'preview',
        name: formValues.name || 'Vista Previa',
        description: formValues.description || '',
        status: 'draft',
        isTemplate: formValues.isTemplate || false,
        isActive: true,
        isVisibleToFamilies: formValues.isVisibleToFamilies || false,
        criteriaCount: criteria.length,
        levelsCount: levels.length,
        maxScore: formValues.maxScore || 100,
        teacherId: 'current-teacher',
        subjectAssignmentId: formValues.subjectAssignmentId,
        criteria: criteria.map((c, i) => ({ ...c, id: `preview-c-${i}`, isActive: true })),
        levels: levels.map((l, i) => ({ ...l, id: `preview-l-${i}`, isActive: true })),
        cells: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setPreviewRubric(mockRubric);
      setActiveTab('preview');
    } catch (error) {
      console.error('Error generating preview:', error);
      message.error('Complete el nombre de la rúbrica para generar vista previa');
    }
  };

  // Guardar rúbrica
  const handleSave = async () => {
    try {
      const formValues = await form.validateFields();
      
      // Validar que hay criterios y niveles
      if (criteria.length === 0) {
        message.error('Debe tener al menos un criterio');
        return;
      }
      
      if (levels.length === 0) {
        message.error('Debe tener al menos un nivel');
        return;
      }

      const rubricData: CreateRubricData = {
        name: formValues.name,
        description: formValues.description,
        isTemplate: formValues.isTemplate,
        isVisibleToFamilies: formValues.isVisibleToFamilies,
        subjectAssignmentId: formValues.subjectAssignmentId,
        maxScore: formValues.maxScore,
        criteria: criteria,
        levels: levels,
        cells: [] // Las células se crearán vacías inicialmente
      };

      let result: Rubric | null = null;

      if (editingRubric) {
        result = await updateRubric(editingRubric.id, rubricData);
      } else {
        result = await createRubric(rubricData);
      }

      if (result) {
        onSuccess(result);
        handleCancel();
      }
    } catch (error) {
      console.error('Error saving rubric:', error);
    }
  };

  // Cancelar y limpiar
  const handleCancel = () => {
    form.resetFields();
    setCriteria([]);
    setLevels([]);
    setPreviewRubric(null);
    setActiveTab('config');
    onCancel();
  };

  return (
    <Modal
      title={editingRubric ? 'Editar Rúbrica' : 'Nueva Rúbrica'}
      open={visible}
      onCancel={handleCancel}
      width={1200}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancelar
        </Button>,
        <Button key="preview" onClick={generatePreview}>
          Vista Previa
        </Button>,
        <Button key="save" type="primary" loading={loading} onClick={handleSave}>
          {editingRubric ? 'Actualizar' : 'Crear'} Rúbrica
        </Button>
      ]}
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'config',
            label: 'Configuración',
            children: (
              <Form form={form} layout="vertical" onValuesChange={(changedFields) => {
                if (changedFields.criteriaCount) {
                  updateCriteriaCount(changedFields.criteriaCount);
                }
                if (changedFields.levelsCount) {
                  updateLevelsCount(changedFields.levelsCount);
                }
              }}>
                {/* Información básica */}
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
                        {/* Mostrar la asignatura actual de la rúbrica si existe */}
                        {editingRubric?.subjectAssignmentId && 
                         !subjectAssignments.some(sa => sa.id === editingRubric.subjectAssignmentId) && (
                          <Option key={editingRubric.subjectAssignmentId} value={editingRubric.subjectAssignmentId}>
                            Asignatura Existente
                          </Option>
                        )}
                        {/* Mostrar asignaturas disponibles del profesor */}
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
                  <Col span={6}>
                    <Form.Item name="maxScore" label="Puntuación Máxima">
                      <InputNumber min={1} max={1000} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item name="criteriaCount" label="Número de Criterios">
                      <InputNumber min={1} max={20} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item name="levelsCount" label="Número de Niveles">
                      <InputNumber min={1} max={10} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item name="isTemplate" label="Es Plantilla" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="isVisibleToFamilies" label="Visible para Familias" valuePropName="checked">
                  <Switch />
                </Form.Item>

                <Divider>Criterios de Evaluación</Divider>
                
                {criteria.map((criterion, index) => (
                  <Card key={index} size="small" style={{ marginBottom: '8px' }}>
                    <Row gutter={8} align="middle">
                      <Col span={8}>
                        <Input
                          value={criterion.name}
                          onChange={(e) => updateCriterion(index, { name: e.target.value })}
                          placeholder="Nombre del criterio"
                          size="small"
                        />
                      </Col>
                      <Col span={10}>
                        <Input
                          value={criterion.description}
                          onChange={(e) => updateCriterion(index, { description: e.target.value })}
                          placeholder="Descripción (opcional)"
                          size="small"
                        />
                      </Col>
                      <Col span={4}>
                        <InputNumber
                          value={Math.round(criterion.weight * 100)}
                          onChange={(value) => updateCriterion(index, { weight: (value || 0) / 100 })}
                          min={1}
                          max={100}
                          formatter={value => `${value}%`}
                          parser={(value) => parseInt(value!.replace('%', ''), 10)}
                          size="small"
                          style={{ width: '100%' }}
                        />
                      </Col>
                      <Col span={2}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          #{index + 1}
                        </Text>
                      </Col>
                    </Row>
                  </Card>
                ))}

                <Divider>Niveles de Desempeño</Divider>
                
                <Row gutter={8}>
                  {levels.map((level, index) => (
                    <Col key={index} span={24 / levels.length}>
                      <Card size="small" style={{ marginBottom: '8px' }}>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                width: '16px',
                                height: '16px',
                                backgroundColor: level.color,
                                borderRadius: '2px',
                                border: '1px solid #d9d9d9'
                              }}
                            />
                            <Input
                              value={level.name}
                              onChange={(e) => updateLevel(index, { name: e.target.value })}
                              placeholder="Nombre"
                              size="small"
                              style={{ flex: 1 }}
                            />
                          </div>
                          
                          <InputNumber
                            value={level.scoreValue}
                            onChange={(value) => updateLevel(index, { scoreValue: value || 0 })}
                            min={0}
                            max={10}
                            size="small"
                            style={{ width: '100%' }}
                            addonAfter="pts"
                          />
                          
                          <Input
                            value={level.description}
                            onChange={(e) => updateLevel(index, { description: e.target.value })}
                            placeholder="Descripción"
                            size="small"
                          />
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>

                <Alert
                  message="Recomendación"
                  description="Los pesos de los criterios deben sumar 100%. Los colores se generan automáticamente de rojo (bajo) a verde (alto)."
                  type="info"
                  showIcon
                  style={{ marginTop: '16px' }}
                />
              </Form>
            )
          },
          {
            key: 'preview',
            label: 'Vista Previa',
            children: (
              previewRubric ? (
                <RubricGrid
                  rubric={previewRubric}
                  editable={false}
                  viewMode="view"
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Text type="secondary">
                    Completa la configuración y haz clic en "Vista Previa" para ver cómo quedará la rúbrica
                  </Text>
                </div>
              )
            )
          }
        ]}
      />
    </Modal>
  );
};

export default RubricEditor;