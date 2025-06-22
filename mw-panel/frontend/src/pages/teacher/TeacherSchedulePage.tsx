import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Typography,
  Row,
  Col,
  Tag,
  Empty,
  Spin,
  message,
  Descriptions,
} from 'antd';
import {
  ClockCircleOutlined,
  HomeOutlined,
  BookOutlined,
  TeamOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import apiClient from '@services/apiClient';

dayjs.locale('es');

const { Title, Text } = Typography;

interface ScheduleSession {
  id: string;
  dayOfWeek: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  notes?: string;
  subjectAssignment: {
    id: string;
    weeklyHours: number;
    subject: {
      id: string;
      name: string;
      code: string;
    };
    classGroup: {
      id: string;
      name: string;
      section: string;
    };
  };
  classroom: {
    id: string;
    name: string;
    code: string;
    capacity: number;
    type: string;
    building?: string;
    floor?: number;
  };
  timeSlot: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    order: number;
    isBreak: boolean;
  };
  academicYear: {
    id: string;
    name: string;
    isCurrent: boolean;
  };
}

interface Teacher {
  id: string;
  employeeNumber: string;
  specialties: string[];
  user: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

const TeacherSchedulePage: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  // Días de la semana en español
  const daysOfWeek = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
  };

  // Fetch teacher data and schedule
  const fetchTeacherSchedule = async () => {
    try {
      setLoading(true);

      // Get current user info
      const userResponse = await apiClient.get('/auth/me');
      const currentUser = userResponse.data;

      if (currentUser.role !== 'teacher') {
        message.error('Acceso denegado: Solo profesores pueden acceder a este horario');
        return;
      }

      // Find teacher record
      const teachersResponse = await apiClient.get('/teachers');
      const teachers = teachersResponse.data;
      const currentTeacher = teachers.find(
        (t: Teacher) => t.user.id === currentUser.id
      );

      if (!currentTeacher) {
        message.error('No se encontró el registro de profesor para este usuario');
        return;
      }

      setTeacher(currentTeacher);

      // Get teacher's schedule
      const scheduleResponse = await apiClient.get(`/schedules/sessions/by-teacher/${currentTeacher.id}`);
      setSchedule(scheduleResponse.data);

    } catch (error) {
      console.error('Error fetching teacher schedule:', error);
      message.error('Error al cargar el horario del profesor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherSchedule();
  }, []);

  // Group schedule by day of week
  const scheduleByDay = schedule.reduce((acc, session) => {
    const day = session.dayOfWeek;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(session);
    return acc;
  }, {} as Record<number, ScheduleSession[]>);

  // Sort sessions by time slot order
  Object.keys(scheduleByDay).forEach(day => {
    scheduleByDay[Number(day)].sort((a, b) => a.timeSlot.order - b.timeSlot.order);
  });

  // Table columns for detailed view
  const columns: ColumnsType<ScheduleSession> = [
    {
      title: 'Día',
      dataIndex: 'dayOfWeek',
      key: 'dayOfWeek',
      render: (day: number) => (
        <Tag color="blue">{daysOfWeek[day as keyof typeof daysOfWeek]}</Tag>
      ),
      sorter: (a, b) => a.dayOfWeek - b.dayOfWeek,
    },
    {
      title: 'Hora',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
      render: (timeSlot) => (
        <div>
          <div className="font-medium">{timeSlot.name}</div>
          <div className="text-sm text-gray-500">
            {timeSlot.startTime.slice(0, 5)} - {timeSlot.endTime.slice(0, 5)}
          </div>
        </div>
      ),
      sorter: (a, b) => a.timeSlot.order - b.timeSlot.order,
    },
    {
      title: 'Asignatura',
      dataIndex: ['subjectAssignment', 'subject'],
      key: 'subject',
      render: (subject) => (
        <div>
          <div className="font-medium">{subject.name}</div>
          <div className="text-sm text-gray-500">{subject.code}</div>
        </div>
      ),
    },
    {
      title: 'Grupo',
      dataIndex: ['subjectAssignment', 'classGroup'],
      key: 'classGroup',
      render: (classGroup) => (
        <Tag color="green">{classGroup.name}</Tag>
      ),
    },
    {
      title: 'Aula',
      dataIndex: 'classroom',
      key: 'classroom',
      render: (classroom) => (
        <div>
          <div className="font-medium flex items-center gap-1">
            <HomeOutlined className="text-blue-500" />
            {classroom.name}
          </div>
          <div className="text-sm text-gray-500">
            {classroom.building && `${classroom.building}, `}
            {classroom.floor !== null && `Planta ${classroom.floor}, `}
            Capacidad: {classroom.capacity}
          </div>
        </div>
      ),
    },
    {
      title: 'Notas',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => notes || '-',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="text-center p-8">
        <Empty description="No se pudo cargar la información del profesor" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="!mb-2">
            Mi Horario de Clases
          </Title>
          <Text type="secondary">
            Horario académico del curso {schedule[0]?.academicYear?.name || '2024-2025'}
          </Text>
        </div>
      </div>

      {/* Teacher Info */}
      <Card>
        <Descriptions title="Información del Profesor" bordered column={2}>
          <Descriptions.Item label="Nombre">
            {teacher.user.profile.firstName} {teacher.user.profile.lastName}
          </Descriptions.Item>
          <Descriptions.Item label="Número de Empleado">
            {teacher.employeeNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Especialidades" span={2}>
            <div className="flex gap-1 flex-wrap">
              {teacher.specialties.map((specialty, index) => (
                <Tag key={index} color="purple">{specialty}</Tag>
              ))}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Total de Clases">
            {schedule.length} sesiones semanales
          </Descriptions.Item>
          <Descriptions.Item label="Horas Lectivas">
            {schedule.reduce((total, session) => {
              const startTime = dayjs(`2000-01-01 ${session.timeSlot.startTime}`, 'YYYY-MM-DD HH:mm:ss');
              const endTime = dayjs(`2000-01-01 ${session.timeSlot.endTime}`, 'YYYY-MM-DD HH:mm:ss');
              return total + endTime.diff(startTime, 'hour', true);
            }, 0).toFixed(1)} horas/semana
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Weekly Schedule Grid */}
      <Card title={
        <div className="flex items-center gap-2">
          <CalendarOutlined />
          <span>Horario Semanal</span>
        </div>
      }>
        {schedule.length === 0 ? (
          <Empty description="No tienes clases asignadas aún" />
        ) : (
          <Row gutter={[16, 16]}>
            {[1, 2, 3, 4, 5].map(day => (
              <Col key={day} xs={24} md={12} lg={8} xl={4.8}>
                <Card
                  size="small"
                  title={
                    <div className="text-center">
                      <Text strong>{daysOfWeek[day as keyof typeof daysOfWeek]}</Text>
                    </div>
                  }
                  className="h-full"
                >
                  {scheduleByDay[day] ? (
                    <div className="space-y-2">
                      {scheduleByDay[day].map(session => (
                        <div
                          key={session.id}
                          className="p-2 border border-gray-200 rounded-md bg-gray-50 hover:bg-blue-50 transition-colors"
                        >
                          <div className="text-xs text-gray-500 mb-1">
                            <ClockCircleOutlined className="mr-1" />
                            {session.timeSlot.startTime.slice(0, 5)} - {session.timeSlot.endTime.slice(0, 5)}
                          </div>
                          <div className="font-medium text-sm text-blue-700">
                            {session.subjectAssignment.subject.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            <TeamOutlined className="mr-1" />
                            {session.subjectAssignment.classGroup.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            <HomeOutlined className="mr-1" />
                            {session.classroom.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400">
                      <Text type="secondary">Sin clases</Text>
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* Detailed Schedule Table */}
      <Card title={
        <div className="flex items-center gap-2">
          <BookOutlined />
          <span>Horario Detallado</span>
        </div>
      }>
        <Table
          columns={columns}
          dataSource={schedule}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} sesiones`,
          }}
          className="w-full"
        />
      </Card>
    </div>
  );
};

export default TeacherSchedulePage;