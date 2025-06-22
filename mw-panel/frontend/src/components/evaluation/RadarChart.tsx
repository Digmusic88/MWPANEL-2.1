import React from 'react'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts'
import { Card, Typography, Space, Tag } from 'antd'

const { Title, Text } = Typography

interface RadarData {
  competency: string
  code: string
  score: number
  fullMark: number
  observations?: string
}

interface EvaluationRadarChartProps {
  data: RadarData[]
  title?: string
  studentName?: string
  period?: string
  className?: string
  height?: number
  showLegend?: boolean
  showObservations?: boolean
}

const EvaluationRadarChart: React.FC<EvaluationRadarChartProps> = ({
  data,
  title = 'Evaluación por Competencias',
  studentName,
  period,
  className,
  height = 400,
  showLegend = true,
  showObservations = false,
}) => {
  // Calculate overall score
  const overallScore = data.length > 0 
    ? (data.reduce((sum, item) => sum + item.score, 0) / data.length)
    : 0

  // Get score color based on value
  const getScoreColor = (score: number, fullMark: number = 10) => {
    const percentage = (score / fullMark) * 100
    if (percentage >= 90) return '#52c41a' // Green - Excellent
    if (percentage >= 75) return '#1890ff' // Blue - Good
    if (percentage >= 60) return '#faad14' // Orange - Satisfactory
    return '#f5222d' // Red - Needs Improvement
  }

  // Get score label
  const getScoreLabel = (score: number, fullMark: number = 10) => {
    const percentage = (score / fullMark) * 100
    if (percentage >= 90) return 'Excelente'
    if (percentage >= 75) return 'Bueno'
    if (percentage >= 60) return 'Satisfactorio'
    return 'Necesita Mejorar'
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <Text strong className="block mb-1">{data.competency}</Text>
          <Text className="block text-sm text-gray-600 mb-2">Código: {data.code}</Text>
          <div className="flex items-center gap-2">
            <Text>Puntuación:</Text>
            <Text 
              strong 
              style={{ color: getScoreColor(data.score, data.fullMark) }}
            >
              {data.score.toFixed(1)} / {data.fullMark}
            </Text>
          </div>
          <Tag color={getScoreColor(data.score, data.fullMark)} className="mt-1">
            {getScoreLabel(data.score, data.fullMark)}
          </Tag>
          {data.observations && showObservations && (
            <Text className="block text-sm text-gray-600 mt-2">
              {data.observations}
            </Text>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card className={`radar-chart-container ${className || ''}`}>
      <Space direction="vertical" className="w-full">
        {/* Header */}
        <div className="text-center mb-4">
          <Title level={4} className="!mb-2">{title}</Title>
          {studentName && (
            <Text className="text-lg font-medium text-gray-700 block">
              {studentName}
            </Text>
          )}
          {period && (
            <Text type="secondary" className="block">
              Período: {period}
            </Text>
          )}
        </div>

        {/* Overall Score */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Text className="text-lg">Puntuación Global:</Text>
            <div 
              className="text-3xl font-bold competency-score"
              style={{ color: getScoreColor(overallScore) }}
            >
              {overallScore.toFixed(1)}
            </div>
            <Text type="secondary">/ 10</Text>
            <Tag 
              color={getScoreColor(overallScore)}
              className="ml-2"
            >
              {getScoreLabel(overallScore)}
            </Tag>
          </div>
        </div>

        {/* Radar Chart */}
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <RadarChart data={data}>
              <PolarGrid gridType="polygon" radialLines={true} />
              <PolarAngleAxis 
                dataKey="code" 
                tick={{ fontSize: 12, fill: '#666' }}
                className="text-xs"
              />
              <PolarRadiusAxis 
                domain={[0, 'dataMax']} 
                tick={{ fontSize: 10, fill: '#999' }}
                tickCount={6}
              />
              <Radar
                name="Puntuación"
                dataKey="score"
                stroke="#1890ff"
                fill="#1890ff"
                fillOpacity={0.2}
                strokeWidth={2}
                dot={{ fill: '#1890ff', strokeWidth: 1, r: 4 }}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && (
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
              )}
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Competencies List */}
        <div className="mt-4">
          <Title level={5}>Detalle por Competencias</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.map((item, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <Text strong className="block text-sm">
                    {item.code} - {item.competency}
                  </Text>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="text-lg font-bold"
                    style={{ color: getScoreColor(item.score, item.fullMark) }}
                  >
                    {item.score.toFixed(1)}
                  </div>
                  <Text type="secondary" className="text-sm">
                    / {item.fullMark}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Observations */}
        {showObservations && data.some(item => item.observations) && (
          <div className="mt-4">
            <Title level={5}>Observaciones</Title>
            <Space direction="vertical" className="w-full">
              {data
                .filter(item => item.observations)
                .map((item, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg">
                    <Text strong className="block mb-1">
                      {item.code} - {item.competency}
                    </Text>
                    <Text className="text-sm text-gray-700">
                      {item.observations}
                    </Text>
                  </div>
                ))}
            </Space>
          </div>
        )}
      </Space>
    </Card>
  )
}

export default EvaluationRadarChart