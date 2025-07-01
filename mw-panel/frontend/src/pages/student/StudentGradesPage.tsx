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
  Timeline,
  Statistic,
  Button,
  Space,
  Tooltip,
  Descriptions,
  Badge,
  List,
  Avatar,
} from 'antd';
import {
  TrophyOutlined,
  BookOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  RiseOutlined,
  FallOutlined,
  BarChartOutlined,
  CalendarOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import useGrades, { StudentGrades, SubjectGrade, GradeDetail } from '../../hooks/useGrades';
import { useResponsive } from '../../hooks/useResponsive';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

const { Title, Text } = Typography;

const StudentGradesPage: React.FC = () => {
  const [studentGrades, setStudentGrades] = useState<StudentGrades | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const { getMyGrades, exportStudentGrades, loading } = useGrades();
  const { isMobile } = useResponsive();

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    const grades = await getMyGrades();
    if (grades) {
      setStudentGrades(grades);
      // Select first subject with grades by default
      const firstSubjectWithGrades = grades.subjectGrades.find(sg => sg.averageGrade > 0);
      if (firstSubjectWithGrades) {
        setSelectedSubject(firstSubjectWithGrades.subjectId);
      }
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

  const renderSubjectCard = (subject: SubjectGrade) => {
    const isSelected = selectedSubject === subject.subjectId;
    const hasGrades = subject.averageGrade > 0;

    return (
      <Card
        key={subject.subjectId}
        hoverable={hasGrades}
        className={`subject-card ${isSelected ? 'selected' : ''} ${!hasGrades ? 'no-grades' : ''}`}
        onClick={() => hasGrades && setSelectedSubject(subject.subjectId)}
        style={{
          borderColor: isSelected ? '#1890ff' : undefined,
          opacity: hasGrades ? 1 : 0.6,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Avatar
            size={64}
            style={{
              backgroundColor: hasGrades ? getGradeColor(subject.averageGrade) : '#d9d9d9',
              fontSize: '24px',
              fontWeight: 'bold',
            }}
          >
            {hasGrades ? subject.averageGrade.toFixed(1) : '-'}
          </Avatar>
          <Title level={5} style={{ marginTop: 12, marginBottom: 4 }}>
            {subject.subjectName}
          </Title>
          <Text type="secondary">{subject.subjectCode}</Text>
          
          {hasGrades && (
            <>
              <div style={{ marginTop: 12 }}>
                <Tag color={getGradeColor(subject.averageGrade)}>
                  {getGradeLabel(subject.averageGrade)}
                </Tag>
              </div>
              <Row gutter={8} style={{ marginTop: 12 }}>
                <Col span={12}>
                  <Statistic
                    title="Completadas"
                    value={subject.gradedTasks}
                    valueStyle={{ fontSize: '16px', color: '#52c41a' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Pendientes"
                    value={subject.pendingTasks}
                    valueStyle={{ fontSize: '16px', color: '#faad14' }}
                  />
                </Col>
              </Row>
            </>
          )}
          
          {!hasGrades && (
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Sin calificaciones</Text>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const renderGradeDetail = (grade: GradeDetail) => {
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
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 8]}>
            <Col xs={24} sm={16}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>{grade.title}</Text>
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    {grade.type === 'task' ? 'Tarea' :
                     grade.type === 'activity' ? 'Actividad' :
                     grade.type === 'evaluation' ? 'Evaluación' : 'Examen'}
                  </Tag>
                </div>
                <Text type="secondary">
                  <CalendarOutlined /> {dayjs(grade.gradedAt).format('DD MMM YYYY')}
                </Text>
                {grade.feedback && (
                  <Alert
                    message="Comentario del profesor"
                    description={grade.feedback}
                    type="info"
                    showIcon
                    icon={<FileTextOutlined />}
                  />
                )}
              </Space>
            </Col>
            <Col xs={24} sm={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: '24px', fontWeight: 'bold', color: getGradeColor((grade.grade / grade.maxGrade) * 10) }}>
                    {grade.grade}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '16px' }}>
                    /{grade.maxGrade}
                  </Text>
                </div>
                <Progress
                  percent={percentage}
                  status={getProgressStatus((grade.grade / grade.maxGrade) * 10)}
                  strokeColor={getGradeColor((grade.grade / grade.maxGrade) * 10)}
                  size="small"
                />
                {grade.weight && (
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Peso: {grade.weight}%
                  </Text>
                )}
              </div>
            </Col>
          </Row>
        </Card>
      </Timeline.Item>
    );
  };

  if (loading && !studentGrades) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Cargando calificaciones..." />
      </div>
    );
  }

  if (!studentGrades) {
    return (
      <Alert
        message="Error al cargar calificaciones"
        description="No se pudieron cargar las calificaciones. Por favor, intenta nuevamente."
        type="error"
        showIcon
      />
    );
  }

  const selectedSubjectData = studentGrades.subjectGrades.find(s => s.subjectId === selectedSubject);
  const subjectRecentGrades = selectedSubject
    ? studentGrades.recentGrades.filter(g => g.subject.id === selectedSubject)
    : studentGrades.recentGrades;

  return (
    <div style={{ padding: isMobile ? '16px' : '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>
            <TrophyOutlined style={{ marginRight: 8 }} />
            Mis Calificaciones
          </Title>
          <Text type="secondary">
            {studentGrades.academicPeriod.current} - {studentGrades.academicPeriod.year}
          </Text>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => exportStudentGrades(studentGrades.student.id)}
          >
            Exportar PDF
          </Button>
        </Col>
      </Row>

      {/* Student Info */}
      <Card style={{ marginBottom: 24 }}>
        <Descriptions column={isMobile ? 1 : 3}>
          <Descriptions.Item label="Estudiante">
            {studentGrades.student.firstName} {studentGrades.student.lastName}
          </Descriptions.Item>
          <Descriptions.Item label="Matrícula">
            {studentGrades.student.enrollmentNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Clase">
            {studentGrades.student.classGroup?.name || 'Sin asignar'}
          </Descriptions.Item>
          <Descriptions.Item label="Nivel">
            {studentGrades.student.educationalLevel?.name || 'Sin asignar'}
          </Descriptions.Item>
          <Descriptions.Item label="Última actividad">
            {studentGrades.summary.lastActivityDate
              ? dayjs(studentGrades.summary.lastActivityDate).format('DD/MM/YYYY')
              : 'Sin actividad'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Promedio General"
              value={studentGrades.summary.overallAverage}
              precision={1}
              prefix={<TrophyOutlined />}
              suffix="/ 10"
              valueStyle={{ color: getGradeColor(studentGrades.summary.overallAverage) }}
            />
            <Progress
              percent={studentGrades.summary.overallAverage * 10}
              status={getProgressStatus(studentGrades.summary.overallAverage)}
              showInfo={false}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Asignaturas"
              value={studentGrades.summary.totalSubjects}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Evaluaciones Completadas"
              value={studentGrades.summary.totalGradedItems}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tareas Pendientes"
              value={studentGrades.summary.totalPendingTasks}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Subjects Grid */}
      <Card
        title="Calificaciones por Asignatura"
        style={{ marginBottom: 24 }}
        extra={
          <Text type="secondary">
            Haz clic en una asignatura para ver el detalle
          </Text>
        }
      >
        <Row gutter={[16, 16]}>
          {studentGrades.subjectGrades.map(subject => (
            <Col xs={24} sm={12} md={8} lg={6} key={subject.subjectId}>
              {renderSubjectCard(subject)}
            </Col>
          ))}
        </Row>
      </Card>

      {/* Selected Subject Details */}
      {selectedSubjectData && (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <Card title="Resumen de la Asignatura">
              <Title level={4}>{selectedSubjectData.subjectName}</Title>
              <Text type="secondary">{selectedSubjectData.subjectCode}</Text>
              
              <div style={{ marginTop: 24 }}>
                <div style={{ marginBottom: 16 }}>
                  <Text>Promedio General</Text>
                  <Progress
                    percent={selectedSubjectData.averageGrade * 10}
                    status={getProgressStatus(selectedSubjectData.averageGrade)}
                    format={() => selectedSubjectData.averageGrade.toFixed(1)}
                  />
                </div>

                {selectedSubjectData.taskAverage !== undefined && (
                  <div style={{ marginBottom: 16 }}>
                    <Text>Promedio de Tareas</Text>
                    <Progress
                      percent={selectedSubjectData.taskAverage * 10}
                      status={getProgressStatus(selectedSubjectData.taskAverage)}
                      format={() => selectedSubjectData.taskAverage!.toFixed(1)}
                    />
                  </div>
                )}

                {selectedSubjectData.activityAverage !== undefined && (
                  <div style={{ marginBottom: 16 }}>
                    <Text>Promedio de Actividades</Text>
                    <Progress
                      percent={selectedSubjectData.activityAverage * 10}
                      status={getProgressStatus(selectedSubjectData.activityAverage)}
                      format={() => selectedSubjectData.activityAverage!.toFixed(1)}
                    />
                  </div>
                )}

                <Row gutter={16} style={{ marginTop: 24 }}>
                  <Col span={12}>
                    <Statistic
                      title="Evaluaciones"
                      value={selectedSubjectData.gradedTasks}
                      suffix={`de ${selectedSubjectData.gradedTasks + selectedSubjectData.pendingTasks}`}
                      valueStyle={{ fontSize: '20px' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Última actualización"
                      value={dayjs(selectedSubjectData.lastUpdated).format('DD/MM')}
                      valueStyle={{ fontSize: '20px' }}
                    />
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card
              title="Historial de Calificaciones"
              extra={
                <Badge
                  count={subjectRecentGrades.length}
                  style={{ backgroundColor: '#1890ff' }}
                />
              }
            >
              {subjectRecentGrades.length > 0 ? (
                <Timeline mode={isMobile ? 'left' : 'alternate'}>
                  {subjectRecentGrades.map(grade => renderGradeDetail(grade))}
                </Timeline>
              ) : (
                <Empty
                  description="No hay calificaciones registradas para esta asignatura"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </Col>
        </Row>
      )}

      {/* Recent Grades (when no subject selected) */}
      {!selectedSubject && studentGrades.recentGrades.length > 0 && (
        <Card title="Calificaciones Recientes">
          <Timeline mode={isMobile ? 'left' : 'alternate'}>
            {studentGrades.recentGrades.slice(0, 5).map(grade => renderGradeDetail(grade))}
          </Timeline>
        </Card>
      )}

      <style jsx>{`
        .subject-card {
          transition: all 0.3s;
          cursor: pointer;
        }
        .subject-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .subject-card.selected {
          border-width: 2px;
          background-color: #f0f5ff;
        }
        .subject-card.no-grades {
          cursor: not-allowed;
        }
        .subject-card.no-grades:hover {
          transform: none;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
};

export default StudentGradesPage;