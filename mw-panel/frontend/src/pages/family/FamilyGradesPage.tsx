import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Empty,
  Alert,
  Progress,
  Tag,
  Select,
  Statistic,
  Button,
  Space,
  Tabs,
  Timeline,
  Badge,
  Descriptions,
  Avatar,
  Tooltip,
  List,
} from 'antd';
import {
  TrophyOutlined,
  BookOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  UserOutlined,
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
  CalendarOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import useGrades, { StudentGrades, SubjectGrade, GradeDetail } from '../../hooks/useGrades';
import { useResponsive } from '../../hooks/useResponsive';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { Line, Radar } from '@ant-design/plots';

dayjs.locale('es');

const { Title, Text } = Typography;
const { Option } = Select;

const FamilyGradesPage: React.FC = () => {
  const [childrenGrades, setChildrenGrades] = useState<StudentGrades[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { getFamilyChildrenGrades, exportStudentGrades, loading } = useGrades();
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    fetchChildrenGrades();
  }, []);

  const fetchChildrenGrades = async () => {
    const grades = await getFamilyChildrenGrades();
    if (grades && grades.length > 0) {
      setChildrenGrades(grades);
      setSelectedChildId(grades[0].student.id);
    }
  };

  const getGradeColor = (grade: number): string => {
    if (grade >= 9) return '#52c41a';
    if (grade >= 7) return '#1890ff';
    if (grade >= 5) return '#faad14';
    return '#ff4d4f';
  };

  const getGradeLabel = (grade: number): string => {
    if (grade >= 9) return 'Excelente';
    if (grade >= 7) return 'Notable';
    if (grade >= 5) return 'Aprobado';
    return 'Necesita Mejorar';
  };

  const getProgressStatus = (grade: number): 'success' | 'normal' | 'exception' | 'active' => {
    if (grade >= 9) return 'success';
    if (grade >= 5) return 'normal';
    return 'exception';
  };

  const getGradeTrend = (grades: GradeDetail[]): 'up' | 'down' | 'stable' => {
    if (grades.length < 2) return 'stable';
    
    const recentGrades = grades.slice(0, 5);
    const avgRecent = recentGrades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 10, 0) / recentGrades.length;
    const avgOlder = grades.slice(5, 10).reduce((sum, g) => sum + (g.grade / g.maxGrade) * 10, 0) / Math.min(grades.length - 5, 5);
    
    if (avgRecent > avgOlder + 0.5) return 'up';
    if (avgRecent < avgOlder - 0.5) return 'down';
    return 'stable';
  };

  const selectedChild = childrenGrades.find(c => c.student.id === selectedChildId);
  const selectedSubject = selectedChild?.subjectGrades.find(s => s.subjectId === selectedSubjectId);

  // Prepare data for radar chart
  const prepareRadarData = (grades: SubjectGrade[]) => {
    if (!grades || grades.length === 0) return [];
    
    return grades
      .filter(subject => subject && subject.subjectCode && typeof subject.averageGrade === 'number')
      .map(subject => ({
        subject: subject.subjectCode,
        grade: isNaN(subject.averageGrade) ? 0 : Number(subject.averageGrade) || 0,
        fullMark: 10,
      }));
  };

  // Prepare data for line chart
  const prepareLineData = (grades: GradeDetail[]) => {
    if (!grades || grades.length === 0) return [];
    
    return grades
      .filter(grade => 
        grade && 
        grade.gradedAt && 
        typeof grade.grade === 'number' && 
        typeof grade.maxGrade === 'number' && 
        grade.maxGrade > 0 &&
        grade.subject &&
        grade.subject.code
      )
      .slice(0, 10)
      .reverse()
      .map(grade => {
        const value = (grade.grade / grade.maxGrade) * 10;
        return {
          date: dayjs(grade.gradedAt).format('DD/MM'),
          value: isNaN(value) ? 0 : Number(value) || 0,
          type: grade.subject.code || 'Unknown',
        };
      });
  };

  const renderChildCard = (child: StudentGrades) => {
    const isSelected = child.student.id === selectedChildId;
    const trend = getGradeTrend(child.recentGrades);

    return (
      <Card
        key={child.student.id}
        hoverable
        onClick={() => {
          setSelectedChildId(child.student.id);
          setSelectedSubjectId(null);
          setActiveTab('overview');
        }}
        style={{
          borderColor: isSelected ? '#1890ff' : undefined,
          borderWidth: isSelected ? 2 : 1,
        }}
      >
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Avatar size={64} icon={<UserOutlined />} />
          </Col>
          <Col span={18}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ fontSize: '16px' }}>
                  {child.student.firstName} {child.student.lastName}
                </Text>
                <br />
                <Text type="secondary">{child.student.classGroup?.name}</Text>
              </div>
              <Row gutter={8}>
                <Col span={12}>
                  <Statistic
                    title="Promedio"
                    value={child.summary.overallAverage}
                    precision={1}
                    valueStyle={{
                      fontSize: '20px',
                      color: getGradeColor(child.summary.overallAverage),
                    }}
                    suffix={
                      trend === 'up' ? <RiseOutlined style={{ color: '#52c41a' }} /> :
                      trend === 'down' ? <FallOutlined style={{ color: '#ff4d4f' }} /> :
                      null
                    }
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Pendientes"
                    value={child.summary.totalPendingTasks}
                    valueStyle={{ fontSize: '20px', color: '#faad14' }}
                  />
                </Col>
              </Row>
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };

  const renderSubjectCard = (subject: SubjectGrade) => {
    const isSelected = subject.subjectId === selectedSubjectId;

    return (
      <Card
        key={subject.subjectId}
        hoverable
        onClick={() => setSelectedSubjectId(subject.subjectId)}
        style={{
          borderColor: isSelected ? '#1890ff' : undefined,
          marginBottom: 8,
        }}
      >
        <Row gutter={16} align="middle">
          <Col span={16}>
            <Space direction="vertical">
              <Text strong>{subject.subjectName}</Text>
              <Text type="secondary">{subject.subjectCode}</Text>
            </Space>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <div>
              <Text style={{ fontSize: '24px', fontWeight: 'bold', color: getGradeColor(subject.averageGrade || 0) }}>
                {(subject.averageGrade || 0).toFixed(1)}
              </Text>
              <br />
              <Tag color={getGradeColor(subject.averageGrade || 0)} style={{ marginTop: 4 }}>
                {getGradeLabel(subject.averageGrade || 0)}
              </Tag>
            </div>
          </Col>
        </Row>
        <Progress
          percent={(subject.averageGrade || 0) * 10}
          status={getProgressStatus(subject.averageGrade || 0)}
          showInfo={false}
          style={{ marginTop: 12 }}
        />
      </Card>
    );
  };

  const renderGradeTimeline = (grades: GradeDetail[]) => {
    return (
      <Timeline mode={isMobile ? 'left' : 'alternate'}>
        {grades.map(grade => {
          const percentage = (grade.grade / grade.maxGrade) * 100;
          return (
            <Timeline.Item
              key={grade.id}
              color={getGradeColor((grade.grade / grade.maxGrade) * 10)}
              dot={
                grade.type === 'task' ? <FileTextOutlined /> :
                grade.type === 'activity' ? <BookOutlined /> :
                <TrophyOutlined />
              }
            >
              <Card size="small">
                <Row gutter={[16, 8]}>
                  <Col xs={24} sm={16}>
                    <Space direction="vertical">
                      <Text strong>{grade.title}</Text>
                      <Space>
                        <Tag color="blue">{grade.subject.code}</Tag>
                        <Tag>
                          {grade.type === 'task' ? 'Tarea' :
                           grade.type === 'activity' ? 'Actividad' :
                           grade.type === 'evaluation' ? 'Evaluación' : 'Examen'}
                        </Tag>
                      </Space>
                      <Text type="secondary">
                        <CalendarOutlined /> {dayjs(grade.gradedAt).format('DD MMM YYYY')}
                      </Text>
                      {grade.feedback && (
                        <Alert
                          message={grade.feedback}
                          type="info"
                          showIcon={false}
                        />
                      )}
                    </Space>
                  </Col>
                  <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                    <div>
                      <Text style={{ fontSize: '20px', fontWeight: 'bold', color: getGradeColor((grade.grade / grade.maxGrade) * 10) }}>
                        {grade.grade}
                      </Text>
                      <Text type="secondary">/{grade.maxGrade}</Text>
                    </div>
                    <Progress
                      percent={percentage}
                      status={getProgressStatus((grade.grade / grade.maxGrade) * 10)}
                      size="small"
                    />
                  </Col>
                </Row>
              </Card>
            </Timeline.Item>
          );
        })}
      </Timeline>
    );
  };

  if (loading && childrenGrades.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large">
          <div className="text-center p-4">Cargando calificaciones...</div>
        </Spin>
      </div>
    );
  }

  if (childrenGrades.length === 0) {
    return (
      <Empty
        description="No hay calificaciones disponibles"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div style={{ padding: isMobile ? '16px' : '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>
            <TrophyOutlined style={{ marginRight: 8 }} />
            Calificaciones
          </Title>
          <Text type="secondary">
            Seguimiento académico de tus hijos
          </Text>
        </Col>
      </Row>

      {/* Children Selector */}
      {childrenGrades.length > 1 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {childrenGrades.map(child => (
            <Col xs={24} sm={12} md={8} key={child.student.id}>
              {renderChildCard(child)}
            </Col>
          ))}
        </Row>
      )}

      {/* Selected Child Content */}
      {selectedChild && (
        <>
          {/* Child Header */}
          <Card style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={16}>
                <Space size="large">
                  <Avatar size={64} icon={<UserOutlined />} />
                  <div>
                    <Title level={4} style={{ margin: 0 }}>
                      {selectedChild.student.firstName} {selectedChild.student.lastName}
                    </Title>
                    <Space>
                      <Text>{selectedChild.student.classGroup?.name}</Text>
                      <Text type="secondary">•</Text>
                      <Text>{selectedChild.student.educationalLevel?.name}</Text>
                      <Text type="secondary">•</Text>
                      <Text>{selectedChild.student.enrollmentNumber}</Text>
                    </Space>
                  </div>
                </Space>
              </Col>
              <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => exportStudentGrades(selectedChild.student.id)}
                >
                  Exportar Boletín
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Summary Statistics */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Promedio General"
                  value={selectedChild.summary.overallAverage}
                  precision={1}
                  suffix="/ 10"
                  valueStyle={{ color: getGradeColor(selectedChild.summary.overallAverage) }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Asignaturas"
                  value={selectedChild.summary.totalSubjects}
                  prefix={<BookOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Evaluaciones"
                  value={selectedChild.summary.totalGradedItems}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Pendientes"
                  value={selectedChild.summary.totalPendingTasks}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Content Tabs */}
          <Card>
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              items={[
                {
                  key: 'overview',
                  label: 'Vista General',
                  children: (
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Card title="Calificaciones por Asignatura" size="small">
                      <List
                        dataSource={selectedChild.subjectGrades}
                        renderItem={subject => renderSubjectCard(subject)}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title="Rendimiento Visual" size="small">
                      {(() => {
                        const radarData = prepareRadarData(selectedChild.subjectGrades || []);
                        
                        if (radarData.length === 0) {
                          return (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                              <Empty 
                                description="No hay datos suficientes para mostrar el gráfico" 
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                              />
                            </div>
                          );
                        }
                        
                        return (
                          <Radar
                            data={radarData}
                            xField="subject"
                            yField="grade"
                            meta={{
                              grade: {
                                alias: 'Calificación',
                                min: 0,
                                max: 10,
                              },
                            }}
                            xAxis={{
                              line: null,
                              tickLine: null,
                              grid: null,
                            }}
                            yAxis={{
                              min: 0,
                              max: 10,
                              tickCount: 6,
                              grid: {
                                alternateColor: 'rgba(0, 0, 0, 0.04)',
                              },
                            }}
                            point={{
                              size: 4,
                            }}
                            area={{
                              style: {
                                fillOpacity: 0.2,
                              },
                            }}
                            tooltip={{
                              formatter: (datum: any) => {
                                return {
                                  name: 'Calificación',
                                  value: `${datum.grade?.toFixed(1) || '0.0'} / 10`,
                                };
                              },
                            }}
                          />
                        );
                      })()}
                    </Card>
                  </Col>
                </Row>
                  )
                },
                {
                  key: 'timeline',
                  label: 'Historial',
                  children: (
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={8}>
                    <Card title="Filtrar por Asignatura" size="small">
                      <Select
                        style={{ width: '100%' }}
                        placeholder="Todas las asignaturas"
                        value={selectedSubjectId}
                        onChange={setSelectedSubjectId}
                        allowClear
                      >
                        {selectedChild.subjectGrades.map(subject => (
                          <Option key={subject.subjectId} value={subject.subjectId}>
                            {subject.subjectName}
                          </Option>
                        ))}
                      </Select>
                      
                      {selectedSubject && (
                        <div style={{ marginTop: 24 }}>
                          <Descriptions column={1} size="small">
                            <Descriptions.Item label="Promedio">
                              <Text strong style={{ color: getGradeColor(selectedSubject.averageGrade || 0) }}>
                                {selectedSubject.averageGrade !== null && selectedSubject.averageGrade !== undefined ? 
                                  selectedSubject.averageGrade.toFixed(1) : 
                                  'N/A'
                                }
                              </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Evaluaciones">
                              {selectedSubject.gradedTasks || 0}
                            </Descriptions.Item>
                            <Descriptions.Item label="Pendientes">
                              {selectedSubject.pendingTasks || 0}
                            </Descriptions.Item>
                            <Descriptions.Item label="Última actualización">
                              {selectedSubject.lastUpdated ? 
                                dayjs(selectedSubject.lastUpdated).format('DD/MM/YYYY') : 
                                'Sin datos'
                              }
                            </Descriptions.Item>
                          </Descriptions>
                        </div>
                      )}
                    </Card>
                  </Col>
                  <Col xs={24} lg={16}>
                    <Card title="Calificaciones Recientes" size="small">
                      {(() => {
                        const filteredGrades = selectedSubjectId
                          ? selectedChild.recentGrades.filter(g => g.subject.id === selectedSubjectId)
                          : selectedChild.recentGrades;
                        
                        return filteredGrades.length > 0 ? (
                          renderGradeTimeline(filteredGrades)
                        ) : (
                          <Empty description="No hay calificaciones para mostrar" />
                        );
                      })()}
                    </Card>
                  </Col>
                </Row>
                  )
                },
                {
                  key: 'progress',
                  label: 'Progreso',
                  children: (
                <Card title="Evolución de Calificaciones" size="small">
                  {(() => {
                    const lineData = prepareLineData(selectedChild.recentGrades || []);
                    
                    if (lineData.length === 0) {
                      return (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                          <Empty 
                            description="No hay datos de calificaciones para mostrar la evolución" 
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                          />
                        </div>
                      );
                    }
                    
                    return (
                      <Line
                        data={lineData}
                        xField="date"
                        yField="value"
                        seriesField="type"
                        yAxis={{
                          min: 0,
                          max: 10,
                          tickCount: 6,
                          title: {
                            text: 'Calificación',
                          },
                          grid: {
                            line: {
                              style: {
                                stroke: '#f0f0f0',
                                lineWidth: 1,
                              },
                            },
                          },
                        }}
                        xAxis={{
                          title: {
                            text: 'Fecha',
                          },
                          grid: null,
                        }}
                        smooth
                        point={{
                          size: 4,
                          shape: 'circle',
                        }}
                        tooltip={{
                          formatter: (datum: any) => {
                            return {
                              name: datum.type || 'Calificación',
                              value: `${datum.value?.toFixed(1) || '0.0'} / 10`,
                            };
                          },
                        }}
                        animation={{
                          appear: {
                            animation: 'path-in',
                            duration: 1000,
                          },
                        }}
                      />
                    );
                  })()}
                </Card>
                  )
                }
              ]}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default FamilyGradesPage;