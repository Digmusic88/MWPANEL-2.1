import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  InputNumber,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Alert,
  Progress,
  message
} from 'antd';
import { PercentageOutlined } from '@ant-design/icons';
import { Rubric, useRubrics } from '../../hooks/useRubrics';

const { Title, Text } = Typography;

interface RubricWeightEditorProps {
  visible: boolean;
  onCancel: () => void;
  rubric: Rubric | null;
  onSuccess?: (rubric: Rubric) => void;
}

const RubricWeightEditor: React.FC<RubricWeightEditorProps> = ({
  visible,
  onCancel,
  rubric,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const { updateRubric, loading } = useRubrics();
  const [totalWeight, setTotalWeight] = useState(100);

  useEffect(() => {
    if (visible && rubric) {
      // Inicializar formulario con los pesos actuales
      const initialValues: any = {};
      rubric.criteria.forEach(criterion => {
        initialValues[`weight_${criterion.id}`] = Math.round(criterion.weight * 100);
      });
      
      form.setFieldsValue(initialValues);
      calculateTotalWeight(initialValues);
    }
  }, [visible, rubric, form]);

  const calculateTotalWeight = (values: any) => {
    const total = Object.values(values).reduce((sum: number, weight: any) => {
      return sum + (parseFloat(String(weight)) || 0);
    }, 0);
    setTotalWeight(Number(total));
  };

  const handleValuesChange = (changedValues: any, allValues: any) => {
    calculateTotalWeight(allValues);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (Math.abs(totalWeight - 100) > 0.1) {
        message.error('Los pesos deben sumar exactamente 100%');
        return;
      }

      if (!rubric) return;

      // Preparar datos de actualización
      const updatedCriteria = rubric.criteria.map(criterion => ({
        id: criterion.id,
        name: criterion.name,
        description: criterion.description,
        order: criterion.order,
        weight: (values[`weight_${criterion.id}`] || 0) / 100 // Convertir a decimal
      }));

      const updateData = {
        criteria: updatedCriteria
      };

      const result = await updateRubric(rubric.id, updateData);
      
      if (result) {
        onSuccess?.(result);
        handleCancel();
        message.success('Pesos actualizados exitosamente');
      }
    } catch (error: any) {
      console.error('Error updating weights:', error);
      message.error('Error al actualizar los pesos');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setTotalWeight(100);
    onCancel();
  };

  const distributeEqually = () => {
    if (!rubric) return;
    
    const equalWeight = Math.round(100 / rubric.criteria.length);
    const values: any = {};
    
    rubric.criteria.forEach((criterion, index) => {
      // El último criterio lleva el resto para llegar exactamente a 100
      const weight = index === rubric.criteria.length - 1
        ? 100 - (equalWeight * (rubric.criteria.length - 1))
        : equalWeight;
      values[`weight_${criterion.id}`] = weight;
    });
    
    form.setFieldsValue(values);
    calculateTotalWeight(values);
  };

  const getProgressColor = () => {
    const diff = Math.abs(totalWeight - 100);
    if (diff <= 0.1) return '#52c41a'; // Verde
    if (diff <= 5) return '#faad14'; // Amarillo
    return '#ff4d4f'; // Rojo
  };

  if (!rubric) return null;

  return (
    <Modal
      title={
        <Space>
          <PercentageOutlined />
          <span>Editar Pesos de Criterios: {rubric.name}</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancelar
        </Button>,
        <Button key="distribute" onClick={distributeEqually}>
          Distribuir Igualmente
        </Button>,
        <Button 
          key="save" 
          type="primary" 
          loading={loading}
          onClick={handleSave}
          disabled={Math.abs(totalWeight - 100) > 0.1}
        >
          Guardar Cambios
        </Button>
      ]}
    >
      <div style={{ marginBottom: '16px' }}>
        <Alert
          message="Edición de Pesos de Criterios"
          description="Ajusta el peso (porcentaje) de cada criterio para la evaluación. Los pesos deben sumar exactamente 100%."
          type="info"
          showIcon
        />
      </div>

      {/* Indicador de total */}
      <div style={{ marginBottom: '24px' }}>
        <Row align="middle" gutter={16}>
          <Col span={12}>
            <Text strong>Total: {totalWeight.toFixed(1)}%</Text>
          </Col>
          <Col span={12}>
            <Progress
              percent={totalWeight}
              strokeColor={getProgressColor()}
              showInfo={false}
              size="small"
            />
          </Col>
        </Row>
        {Math.abs(totalWeight - 100) > 0.1 && (
          <Text type="danger" style={{ fontSize: '12px' }}>
            Los pesos deben sumar exactamente 100%
          </Text>
        )}
      </div>

      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
      >
        <Row gutter={16}>
          {rubric.criteria.map((criterion, index) => (
            <Col key={criterion.id} span={24} style={{ marginBottom: '16px' }}>
              <div style={{ 
                padding: '12px', 
                border: '1px solid #d9d9d9', 
                borderRadius: '6px',
                backgroundColor: '#fafafa'
              }}>
                <Row align="middle" gutter={16}>
                  <Col span={16}>
                    <div>
                      <Text strong>{criterion.name}</Text>
                      {criterion.description && (
                        <div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {criterion.description}
                          </Text>
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name={`weight_${criterion.id}`}
                      rules={[
                        { required: true, message: 'Requerido' },
                        { type: 'number', min: 0, max: 100, message: 'Entre 0 y 100' }
                      ]}
                      style={{ margin: 0 }}
                    >
                      <InputNumber
                        min={0}
                        max={100}
                        precision={1}
                        addonAfter="%"
                        style={{ width: '100%' }}
                        placeholder="0"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </Col>
          ))}
        </Row>
      </Form>

      <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
        <p><strong>Consejos:</strong></p>
        <ul style={{ marginLeft: '16px' }}>
          <li>Los criterios más importantes deben tener mayor peso</li>
          <li>Usa el botón "Distribuir Igualmente" como punto de partida</li>
          <li>Los cambios se aplicarán a futuras evaluaciones</li>
        </ul>
      </div>
    </Modal>
  );
};

export default RubricWeightEditor;