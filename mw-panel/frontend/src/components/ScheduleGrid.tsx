import React from 'react';
import { Card, Typography, Tag, Tooltip, Empty } from 'antd';
import { ClockCircleOutlined, UserOutlined, HomeOutlined } from '@ant-design/icons';
import { getSubjectStyles } from '../utils/subjectColors';

const { Title, Text } = Typography;

// Tipos para el horario
export interface ScheduleSession {
  id: string;
  dayOfWeek: number;
  timeSlot: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    order: number;
  };
  subjectAssignment: {
    id: string;
    subject: {
      id: string;
      name: string;
    };
    teacher: {
      id: string;
      user: {
        profile: {
          firstName: string;
          lastName: string;
        };
      };
    };
  };
  classroom: {
    id: string;
    name: string;
    code: string;
  };
  startDate: string;
  endDate: string;
  isActive: boolean;
  notes?: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  section: string;
  courses: Array<{
    id: string;
    name: string;
  }>;
  academicYear: {
    id: string;
    name: string;
  };
}

interface ScheduleGridProps {
  classGroup: ClassGroup;
  sessions: ScheduleSession[];
  loading?: boolean;
}

// Días de la semana
const WEEKDAYS = [
  { key: 1, label: 'Lunes', short: 'L' },
  { key: 2, label: 'Martes', short: 'M' },
  { key: 3, label: 'Miércoles', short: 'X' },
  { key: 4, label: 'Jueves', short: 'J' },
  { key: 5, label: 'Viernes', short: 'V' },
];

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ 
  classGroup, 
  sessions, 
  loading = false 
}) => {
  // Agrupar sesiones por día y franja horaria
  const scheduleMatrix = React.useMemo(() => {
    const matrix: Record<number, Record<number, ScheduleSession>> = {};
    
    sessions.forEach(session => {
      if (!matrix[session.dayOfWeek]) {
        matrix[session.dayOfWeek] = {};
      }
      matrix[session.dayOfWeek][session.timeSlot.order] = session;
    });
    
    return matrix;
  }, [sessions]);

  // Obtener todas las franjas horarias únicas y ordenarlas
  const timeSlots = React.useMemo(() => {
    const slots = new Map();
    sessions.forEach(session => {
      slots.set(session.timeSlot.order, session.timeSlot);
    });
    return Array.from(slots.values()).sort((a, b) => a.order - b.order);
  }, [sessions]);

  // Función para renderizar una celda de la clase
  const renderScheduleCell = (dayOfWeek: number, timeSlotOrder: number) => {
    const session = scheduleMatrix[dayOfWeek]?.[timeSlotOrder];
    
    if (!session) {
      return (
        <div 
          style={{
            height: '80px',
            border: '1px dashed #d9d9d9',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fafafa'
          }}
        >
          <Text type="secondary" style={{ fontSize: '12px' }}>Libre</Text>
        </div>
      );
    }

    const subject = session.subjectAssignment.subject;
    const teacher = session.subjectAssignment.teacher.user.profile;
    const classroom = session.classroom;

    return (
      <Tooltip
        title={
          <div>
            <div><strong>{subject.name}</strong></div>
            <div><UserOutlined /> {teacher.firstName} {teacher.lastName}</div>
            <div><HomeOutlined /> {classroom.name} ({classroom.code})</div>
            <div><ClockCircleOutlined /> {session.timeSlot.startTime} - {session.timeSlot.endTime}</div>
            {session.notes && <div>📝 {session.notes}</div>}
          </div>
        }
        placement="top"
      >
        <div 
          style={{
            ...getSubjectStyles(subject.name),
            height: '80px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden'
          }}
        >
          <div style={{ fontWeight: '600', fontSize: '13px', lineHeight: '1.2' }}>
            {subject.name}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.8 }}>
            {teacher.firstName} {teacher.lastName.charAt(0)}.
          </div>
          <div style={{ fontSize: '10px', opacity: 0.7 }}>
            {classroom.code}
          </div>
        </div>
      </Tooltip>
    );
  };

  if (!sessions.length) {
    return (
      <Card>
        <Empty 
          description="No hay horarios programados para este grupo"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            Horario de {classGroup.name}
          </Title>
          <div>
            <Tag color="blue">{classGroup.academicYear.name}</Tag>
            {classGroup.courses.map(course => (
              <Tag key={course.id} color="green">{course.name}</Tag>
            ))}
          </div>
        </div>
      }
      loading={loading}
      style={{ marginBottom: '24px' }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '8px' }}>
          <thead>
            <tr>
              <th style={{ 
                width: '120px', 
                textAlign: 'center',
                padding: '8px',
                backgroundColor: '#fafafa',
                borderRadius: '6px',
                fontWeight: '600'
              }}>
                Horario
              </th>
              {WEEKDAYS.map(day => (
                <th 
                  key={day.key}
                  style={{ 
                    textAlign: 'center',
                    padding: '8px',
                    backgroundColor: '#fafafa',
                    borderRadius: '6px',
                    fontWeight: '600',
                    minWidth: '150px'
                  }}
                >
                  <div>{day.label}</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                    {day.short}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(timeSlot => (
              <tr key={timeSlot.order}>
                <td style={{ 
                  textAlign: 'center',
                  padding: '8px',
                  backgroundColor: '#f0f2f5',
                  borderRadius: '6px',
                  verticalAlign: 'middle'
                }}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>
                    {timeSlot.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {timeSlot.startTime} - {timeSlot.endTime}
                  </div>
                </td>
                {WEEKDAYS.map(day => (
                  <td 
                    key={`${day.key}-${timeSlot.order}`}
                    style={{ 
                      verticalAlign: 'top',
                      padding: '4px'
                    }}
                  >
                    {renderScheduleCell(day.key, timeSlot.order)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Leyenda de colores */}
      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#fafafa', borderRadius: '6px' }}>
        <Title level={5} style={{ marginBottom: '12px' }}>Leyenda de Asignaturas:</Title>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[
            { name: 'Matemáticas', color: 'matematicas' },
            { name: 'Lengua', color: 'lengua' },
            { name: 'Ciencias Naturales', color: 'ciencias-naturales' },
            { name: 'Ciencias Sociales', color: 'ciencias-sociales' },
            { name: 'Inglés', color: 'ingles' },
            { name: 'Educación Física', color: 'educacion-fisica' },
            { name: 'Educación Artística', color: 'educacion-artistica' },
            { name: 'Música', color: 'musica' },
          ].map(item => (
            <div 
              key={item.color}
              style={{
                ...getSubjectStyles(item.name),
                minWidth: '120px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px'
              }}
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ScheduleGrid;