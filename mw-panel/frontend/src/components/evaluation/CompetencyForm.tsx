import React, { useState, useEffect } from 'react'
import { Form, InputNumber, Input, Button, Card, Space, Typography, Row, Col, Rate, Divider, Alert } from 'antd'
import { SaveOutlined, EyeOutlined, CheckOutlined } from '@ant-design/icons'
import EvaluationRadarChart from './RadarChart'

const { Title, Text } = Typography
const { TextArea } = Input

interface Competency {
  id: string
  code: string
  name: string
  description: string
}

interface CompetencyEvaluation {
  competencyId: string
  score: number
  observations?: string
}

interface CompetencyFormProps {
  competencies: Competency[]
  studentName: string
  subjectName: string
  period: string
  initialValues?: CompetencyEvaluation[]
  onSave: (evaluations: CompetencyEvaluation[], isDraft: boolean) => Promise<void>
  onSubmit: (evaluations: CompetencyEvaluation[]) => Promise<void>
  isLoading?: boolean
  readonly?: boolean
}

const CompetencyForm: React.FC<CompetencyFormProps> = ({
  competencies,
  studentName,
  subjectName,
  period,
  initialValues = [],
  onSave,
  onSubmit,
  isLoading = false,
  readonly = false,
}) => {
  const [form] = Form.useForm()
  const [evaluations, setEvaluations] = useState<CompetencyEvaluation[]>(initialValues)
  const [showPreview, setShowPreview] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    // Initialize form with existing values
    const formValues: Record<string, any> = {}
    initialValues.forEach(evaluation => {
      formValues[`score_${evaluation.competencyId}`] = evaluation.score
      formValues[`observations_${evaluation.competencyId}`] = evaluation.observations
    })
    form.setFieldsValue(formValues)
    setEvaluations(initialValues)
  }, [initialValues, form])

  const handleFormChange = () => {
    setIsDirty(true)
    
    // Update evaluations state
    const formValues = form.getFieldsValue()
    const newEvaluations: CompetencyEvaluation[] = competencies.map(competency => {
      const score = formValues[`score_${competency.id}`] || 0
      const observations = formValues[`observations_${competency.id}`] || ''
      
      return {
        competencyId: competency.id,
        score,
        observations,
      }
    })
    
    setEvaluations(newEvaluations)
  }

  const handleSaveDraft = async () => {
    try {
      await form.validateFields()
      await onSave(evaluations, true)
      setIsDirty(false)
    } catch (error) {
      console.error('Error saving draft:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      await form.validateFields()
      await onSubmit(evaluations)
      setIsDirty(false)
    } catch (error) {
      console.error('Error submitting evaluation:', error)
    }
  }

  const getRadarData = () => {
    return evaluations
      .filter(evaluation => evaluation.score > 0)
      .map(evaluation => {
        const competency = competencies.find(c => c.id === evaluation.competencyId)
        return {
          competency: competency?.name || '',
          code: competency?.code || '',
          score: evaluation.score,
          fullMark: 10,
          observations: evaluation.observations,
        }
      })
  }

  const getScoreColor = (score: number) => {
    if (score >= 9) return '#52c41a'
    if (score >= 7) return '#1890ff'
    if (score >= 5) return '#faad14'
    return '#f5222d'
  }

  const getScoreDescription = (score: number) => {
    if (score >= 9) return 'Excelente'
    if (score >= 7) return 'Bueno'
    if (score >= 5) return 'Satisfactorio'
    if (score > 0) return 'Necesita Mejorar'
    return 'Sin Evaluar'
  }

  const overallScore = evaluations.length > 0
    ? evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / evaluations.length
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="text-center">
          <Title level={3}>Evaluación por Competencias</Title>
          <Space direction="vertical" size="small">
            <Text className="text-lg font-medium">{studentName}</Text>
            <Text type="secondary">{subjectName} - {period}</Text>
            {overallScore > 0 && (
              <div className="mt-2">
                <Text>Puntuación Global: </Text>
                <Text 
                  strong 
                  style={{ color: getScoreColor(overallScore), fontSize: '18px' }}
                >
                  {overallScore.toFixed(1)} / 10
                </Text>
                <Text type="secondary" className="ml-2">
                  ({getScoreDescription(overallScore)})
                </Text>
              </div>
            )}
          </Space>
        </div>
      </Card>

      {/* Form and Preview Toggle */}
      {!readonly && (
        <div className="flex justify-center">
          <Button.Group>
            <Button 
              type={!showPreview ? 'primary' : 'default'}
              onClick={() => setShowPreview(false)}
              icon={<SaveOutlined />}
            >
              Formulario
            </Button>
            <Button 
              type={showPreview ? 'primary' : 'default'}
              onClick={() => setShowPreview(true)}
              icon={<EyeOutlined />}
            >
              Vista Previa
            </Button>
          </Button.Group>
        </div>
      )}

      {showPreview || readonly ? (
        // Preview Mode - Radar Chart
        <EvaluationRadarChart
          data={getRadarData()}
          title="Vista Previa de Evaluación"
          studentName={studentName}
          period={`${subjectName} - ${period}`}
          height={500}
          showObservations={true}
        />
      ) : (
        // Form Mode
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleFormChange}
          disabled={readonly}
        >
          <Card title="Evaluación de Competencias">
            {isDirty && (
              <Alert
                message="Hay cambios sin guardar"
                description="Recuerda guardar tu progreso o enviar la evaluación cuando hayas terminado."
                type="warning"
                showIcon
                className="mb-4"
              />
            )}

            <Row gutter={[16, 24]}>
              {competencies.map((competency) => (
                <Col xs={24} key={competency.id}>
                  <Card size="small" className="bg-gray-50">
                    <Space direction="vertical" className="w-full">
                      {/* Competency Header */}
                      <div>
                        <Text strong className="text-base">
                          {competency.code} - {competency.name}
                        </Text>
                        <Text className="block text-sm text-gray-600 mt-1">
                          {competency.description}
                        </Text>
                      </div>

                      <Divider className="my-3" />

                      <Row gutter={16}>
                        {/* Score Input */}
                        <Col xs={24} md={8}>
                          <Form.Item
                            label="Puntuación (1-10)"
                            name={`score_${competency.id}`}
                            rules={[
                              { required: true, message: 'La puntuación es obligatoria' },
                              { type: 'number', min: 1, max: 10, message: 'Debe estar entre 1 y 10' },
                            ]}
                          >
                            <InputNumber
                              min={1}
                              max={10}
                              step={0.1}
                              precision={1}
                              className="w-full"
                              placeholder="0.0"
                            />
                          </Form.Item>
                        </Col>

                        {/* Visual Score Rating */}
                        <Col xs={24} md={8}>
                          <div className="text-center">
                            <Text className="block mb-2">Valoración Visual</Text>
                            <Rate
                              count={5}
                              value={Math.round((evaluations.find(e => e.competencyId === competency.id)?.score || 0) / 2)}
                              disabled
                              style={{ color: getScoreColor(evaluations.find(e => e.competencyId === competency.id)?.score || 0) }}
                            />
                            <div className="mt-1">
                              <Text 
                                style={{ 
                                  color: getScoreColor(evaluations.find(e => e.competencyId === competency.id)?.score || 0),
                                  fontWeight: 'bold'
                                }}
                              >
                                {getScoreDescription(evaluations.find(e => e.competencyId === competency.id)?.score || 0)}
                              </Text>
                            </div>
                          </div>
                        </Col>

                        {/* Observations */}
                        <Col xs={24} md={8}>
                          <Form.Item
                            label="Observaciones (opcional)"
                            name={`observations_${competency.id}`}
                          >
                            <TextArea
                              rows={3}
                              placeholder="Observaciones sobre el desarrollo de esta competencia..."
                              maxLength={500}
                              showCount
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Action Buttons */}
          {!readonly && (
            <Card>
              <div className="flex justify-center gap-4">
                <Button
                  type="default"
                  icon={<SaveOutlined />}
                  onClick={handleSaveDraft}
                  loading={isLoading}
                  disabled={!isDirty}
                >
                  Guardar Borrador
                </Button>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={handleSubmit}
                  loading={isLoading}
                  disabled={evaluations.some(e => e.score === 0)}
                >
                  Enviar Evaluación
                </Button>
              </div>
              <div className="text-center mt-3">
                <Text type="secondary" className="text-sm">
                  El borrador se guarda automáticamente. Una vez enviada, la evaluación no se podrá modificar.
                </Text>
              </div>
            </Card>
          )}
        </Form>
      )}
    </div>
  )
}

export default CompetencyForm