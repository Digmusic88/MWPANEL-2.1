import React, { useState, useEffect } from 'react';
import {
  Card,
  Calendar,
  Badge,
  Typography,
  Space,
  Tag,
  List,
  Avatar,
  Tooltip,
  Button,
  Modal,
  Descriptions,
  Alert,
  Spin,
  Collapse,
  Row,
  Col,
  Form,
  Input,
  Select,
  TimePicker,
  message,
} from 'antd';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveModal from '../common/ResponsiveModal';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  BookOutlined,
  BellOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  FileTextOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import apiClient from '@services/apiClient';
import { useCalendar } from '../../hooks/useCalendar';
import useClassGroups from '../../hooks/useClassGroups';
import useSubjects from '../../hooks/useSubjects';
import { useAuthStore } from '@store/authStore';

const { Text, Title } = Typography;

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: 'class' | 'exam' | 'meeting' | 'event' | 'assignment' | 'holiday' | 'reminder' | 'maintenance';
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  participants?: string[];
  priority: 'low' | 'medium' | 'high';
  status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdBy?: string;
  metadata?: {
    subjectName?: string;
    className?: string;
    teacherName?: string;
    studentName?: string;
    assignmentType?: string;
  };
}

interface CalendarWidgetProps {
  userRole: 'admin' | 'teacher' | 'student' | 'family';
  height?: number;
  showEventList?: boolean;
  maxEvents?: number;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  userRole,
  height = 700,
  showEventList = true,
  maxEvents = 5,
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calendarMode, setCalendarMode] = useState<'month' | 'year'>('month');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDateForEvent, setSelectedDateForEvent] = useState<Dayjs | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [selectedVisibility, setSelectedVisibility] = useState<string>('');
  const [currentTeacherId, setCurrentTeacherId] = useState<string | null>(null);
  
  // Responsive hook
  const { isMobile, isTablet, screenSize } = useResponsive();
  
  // Calendar hook for permissions and utilities
  const { 
    getAllowedEventTypes, 
    getAllowedVisibilityLevels, 
    getDefaultVisibility,
    getEventTypeLabel 
  } = useCalendar();

  // Auth store to get current user
  const { user } = useAuthStore();

  // Class groups and subjects hooks
  const { classGroups, fetchClassGroups } = useClassGroups();
  const { subjects, teacherSubjects, fetchTeacherSubjects } = useSubjects();

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'Público - Visible para todos';
      case 'teachers_only': return 'Solo Profesores';
      case 'students_only': return 'Solo Estudiantes';
      case 'families_only': return 'Solo Familias';
      case 'admin_only': return 'Solo Administradores';
      case 'class_specific': return 'Clases Específicas';
      case 'subject_specific': return 'Asignaturas Específicas';
      case 'private': return 'Privado - Solo yo';
      default: return 'Privado';
    }
  };
  
  // Responsive configurations
  const responsiveHeight = isMobile ? 'auto' : height;
  const responsiveMaxEvents = isMobile ? 3 : maxEvents;
  const showEventListResponsive = isMobile ? false : showEventList;
  
  // Calculate inner height for content
  const contentHeight = isMobile ? 'auto' : height - 120; // Account for card header and padding

  useEffect(() => {
    loadEvents();
  }, [userRole, selectedDate]);

  // Get current teacher ID and load their data
  useEffect(() => {
    const getCurrentTeacher = async () => {
      if (userRole === 'teacher' && user) {
        try {
          const teachersResponse = await apiClient.get('/teachers');
          const teachers = teachersResponse.data;
          const currentTeacher = teachers.find((teacher: any) => teacher.user.id === user.id);
          
          if (currentTeacher) {
            setCurrentTeacherId(currentTeacher.id);
            await fetchTeacherSubjects(currentTeacher.id);
          }
        } catch (error) {
          console.error('Error fetching current teacher:', error);
        }
      }
    };

    getCurrentTeacher();
  }, [userRole, user, fetchTeacherSubjects]);

  // Load all class groups and subjects for admin
  useEffect(() => {
    if (userRole === 'admin') {
      fetchClassGroups();
    }
  }, [userRole, fetchClassGroups]);

  // Handle editing an existing event
  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setSelectedDateForEvent(dayjs(event.date));
    setShowEventModal(true);
    setModalVisible(false); // Close the details modal
  };

  // Handle deleting an event
  const handleDeleteEvent = async (eventId: string) => {
    try {
      // En implementación real, hacer llamada API
      // await apiClient.delete(`/calendar/events/${eventId}`);

      setEvents(prev => prev.filter(event => event.id !== eventId));
      setModalVisible(false);
      message.success('Evento eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting event:', error);
      message.error('Error al eliminar el evento');
    }
  };

  // Reset when changing months manually
  const handlePanelChange = (value: Dayjs, mode: 'month' | 'year') => {
    setSelectedDate(value);
    setCalendarMode(mode);
  };

  // Touch navigation for mobile/tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMobile || isTablet) {
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
      setTouchEnd(null);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isMobile || isTablet) {
      const touch = e.touches[0];
      setTouchEnd({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || (!isMobile && !isTablet)) return;

    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    const minSwipeDistance = 50;

    // Horizontal swipe for week navigation
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      const direction = deltaX > 0 ? 1 : -1; // swipe left = next week, swipe right = previous week
      const newDate = selectedDate.add(direction * 7, 'day');
      
      // Check bounds
      const selectedMonth = selectedDate.month();
      const selectedYear = selectedDate.year();
      const minDate = dayjs().year(selectedYear).month(selectedMonth).startOf('month').subtract(1, 'week');
      const maxDate = dayjs().year(selectedYear).month(selectedMonth).endOf('month').add(1, 'week');
      
      if (newDate.isAfter(minDate) && newDate.isBefore(maxDate)) {
        setSelectedDate(newDate);
      }
    }

    // Vertical swipe for month navigation
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDistance) {
      const direction = deltaY > 0 ? 1 : -1; // swipe up = next month, swipe down = previous month
      const newDate = selectedDate.add(direction, 'month');
      setSelectedDate(newDate);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Handle date cell click to create event
  const handleDateClick = (date: Dayjs) => {
    setSelectedDateForEvent(date);
    setShowEventModal(true);
  };

  // Handle event creation and editing
  const handleCreateEvent = async (formData: any) => {
    try {
      if (!selectedDateForEvent) return;

      // Convert TimePicker values to string format
      const startTime = formData.startTime ? formData.startTime.format('HH:mm') : undefined;
      const endTime = formData.endTime ? formData.endTime.format('HH:mm') : undefined;

      if (editingEvent) {
        // Edit existing event
        // En implementación real, hacer llamada API
        // const response = await apiClient.put(`/calendar/events/${editingEvent.id}`, {
        //   ...formData,
        //   date: selectedDateForEvent.format('YYYY-MM-DD'),
        //   startTime,
        //   endTime
        // });

        // Update existing event
        const updatedEvent: CalendarEvent = {
          ...editingEvent,
          title: formData.title || 'Evento',
          description: formData.description || '',
          type: formData.type || editingEvent.type,
          date: selectedDateForEvent.format('YYYY-MM-DD'),
          startTime,
          endTime,
          location: formData.location,
          priority: formData.priority || 'medium',
          visibility: formData.visibility || editingEvent.visibility || getDefaultVisibility(userRole),
          classGroups: formData.classGroups || editingEvent.classGroups || [],
          subjects: formData.subjects || editingEvent.subjects || [],
        };

        setEvents(prev => prev.map(event => 
          event.id === editingEvent.id ? updatedEvent : event
        ));
        message.success('Evento actualizado exitosamente');
        console.log('Evento actualizado:', updatedEvent);
      } else {
        // Create new event
        // En implementación real, hacer llamada API
        // const response = await apiClient.post('/calendar/events', {
        //   ...formData,
        //   date: selectedDateForEvent.format('YYYY-MM-DD'),
        //   startTime,
        //   endTime
        // });

        const newEvent: CalendarEvent = {
          id: `new-${Date.now()}`,
          title: formData.title || 'Nuevo Evento',
          description: formData.description || '',
          type: formData.type || getAllowedEventTypes(userRole)[0] || 'reminder',
          date: selectedDateForEvent.format('YYYY-MM-DD'),
          startTime,
          endTime,
          location: formData.location,
          priority: formData.priority || 'medium',
          status: 'scheduled',
          createdBy: userRole,
          visibility: formData.visibility || getDefaultVisibility(userRole),
          classGroups: formData.classGroups || [],
          subjects: formData.subjects || [],
        };

        setEvents(prev => [...prev, newEvent]);
        message.success('Evento creado exitosamente');
        console.log('Evento creado:', newEvent);
      }

      // Reset form state
      setShowEventModal(false);
      setSelectedDateForEvent(null);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
      message.error('Error al guardar el evento');
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Simular eventos basados en el rol
      const mockEvents = generateMockEvents(userRole, selectedDate);
      setEvents(mockEvents);
      
      // En implementación real, hacer llamada API específica por rol
      // const response = await apiClient.get(`/calendar/${userRole}/events`, {
      //   params: {
      //     month: selectedDate.month() + 1,
      //     year: selectedDate.year()
      //   }
      // });
      // setEvents(response.data);
      
    } catch (error) {
      console.error('Error loading calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockEvents = (role: string, date: Dayjs): CalendarEvent[] => {
    const currentMonth = date.month();
    const currentYear = date.year();
    const daysInMonth = date.daysInMonth();
    
    const baseEvents: CalendarEvent[] = [];
    
    // Eventos comunes
    baseEvents.push(
      {
        id: '1',
        title: 'Inicio de trimestre',
        type: 'event',
        date: dayjs(`${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`).format('YYYY-MM-DD'),
        priority: 'high',
        status: 'scheduled',
        description: 'Inicio del segundo trimestre académico',
      },
      {
        id: '2',
        title: 'Reunión de profesores',
        type: 'meeting',
        date: dayjs(`${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-15`).format('YYYY-MM-DD'),
        startTime: '16:00',
        endTime: '18:00',
        priority: 'medium',
        status: 'scheduled',
        location: 'Sala de profesores',
      }
    );

    // Eventos específicos por rol
    switch (role) {
      case 'admin':
        baseEvents.push(
          {
            id: 'admin-1',
            title: 'Revisión sistema',
            type: 'maintenance',
            date: dayjs(`${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-10`).format('YYYY-MM-DD'),
            startTime: '22:00',
            endTime: '02:00',
            priority: 'high',
            status: 'scheduled',
            description: 'Mantenimiento programado del sistema',
          },
          {
            id: 'admin-2',
            title: 'Junta directiva',
            type: 'meeting',
            date: dayjs(`${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-20`).format('YYYY-MM-DD'),
            startTime: '10:00',
            endTime: '12:00',
            priority: 'high',
            status: 'scheduled',
            location: 'Sala de juntas',
          },
          {
            id: 'admin-3',
            title: 'Evaluación trimestral',
            type: 'event',
            date: dayjs(`${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-25`).format('YYYY-MM-DD'),
            priority: 'medium',
            status: 'scheduled',
            description: 'Revisión de resultados del trimestre',
          }
        );
        break;

      case 'teacher':
        baseEvents.push(
          {
            id: 'teacher-1',
            title: 'Matemáticas - 3º A',
            type: 'class',
            date: dayjs().format('YYYY-MM-DD'),
            startTime: '09:00',
            endTime: '10:00',
            priority: 'medium',
            status: 'scheduled',
            location: 'Aula 301',
            metadata: {
              subjectName: 'Matemáticas',
              className: '3º A',
            },
          },
          {
            id: 'teacher-2',
            title: 'Examen Lengua - 2º B',
            type: 'exam',
            date: dayjs(`${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-18`).format('YYYY-MM-DD'),
            startTime: '11:00',
            endTime: '12:00',
            priority: 'high',
            status: 'scheduled',
            location: 'Aula 201',
            metadata: {
              subjectName: 'Lengua Castellana',
              className: '2º B',
            },
          },
          {
            id: 'teacher-3',
            title: 'Entrega evaluaciones',
            type: 'assignment',
            date: dayjs(`${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-22`).format('YYYY-MM-DD'),
            priority: 'high',
            status: 'scheduled',
            description: 'Fecha límite para entregar evaluaciones del trimestre',
          }
        );
        break;

      case 'student':
        baseEvents.push(
          {
            id: 'student-1',
            title: 'Entrega proyecto Ciencias',
            type: 'assignment',
            date: dayjs(`${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-12`).format('YYYY-MM-DD'),
            priority: 'high',
            status: 'scheduled',
            description: 'Proyecto final de Ciencias Naturales',
            metadata: {
              subjectName: 'Ciencias Naturales',
              teacherName: 'Prof. García',
            },
          },
          {
            id: 'student-2',
            title: 'Examen Historia',
            type: 'exam',
            date: dayjs(`${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-16`).format('YYYY-MM-DD'),
            startTime: '10:00',
            endTime: '11:30',
            priority: 'high',
            status: 'scheduled',
            location: 'Aula 102',
            metadata: {
              subjectName: 'Historia',
              teacherName: 'Prof. Rodríguez',
            },
          },
          {
            id: 'student-3',
            title: 'Excursión museo',
            type: 'event',
            date: dayjs(`${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-28`).format('YYYY-MM-DD'),
            startTime: '09:00',
            endTime: '15:00',
            priority: 'medium',
            status: 'scheduled',
            location: 'Museo de Ciencias',
            description: 'Visita educativa al museo con 4º ESO',
          }
        );
        break;

      case 'family':
        baseEvents.push(
          {
            id: 'family-1',
            title: 'Reunión padres 3º A',
            type: 'meeting',
            date: dayjs(`${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-14`).format('YYYY-MM-DD'),
            startTime: '17:00',
            endTime: '18:30',
            priority: 'high',
            status: 'scheduled',
            location: 'Aula 301',
            metadata: {
              className: '3º A',
              teacherName: 'Prof. Martínez',
            },
          },
          {
            id: 'family-2',
            title: 'Entrega notas Juan',
            type: 'reminder',
            date: dayjs(`${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-21`).format('YYYY-MM-DD'),
            priority: 'medium',
            status: 'scheduled',
            description: 'Consultar las calificaciones del segundo trimestre',
            metadata: {
              studentName: 'Juan Pérez',
            },
          },
          {
            id: 'family-3',
            title: 'Festival fin de curso',
            type: 'event',
            date: dayjs(`${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-30`).format('YYYY-MM-DD'),
            startTime: '18:00',
            endTime: '21:00',
            priority: 'low',
            status: 'scheduled',
            location: 'Patio principal',
            description: 'Celebración de fin de curso con actuaciones',
          }
        );
        break;
    }

    return baseEvents;
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'class': return <BookOutlined style={{ color: '#1890ff' }} />;
      case 'exam': return <FileTextOutlined style={{ color: '#ff4d4f' }} />;
      case 'meeting': return <TeamOutlined style={{ color: '#722ed1' }} />;
      case 'event': return <CalendarOutlined style={{ color: '#52c41a' }} />;
      case 'assignment': return <EditOutlined style={{ color: '#faad14' }} />;
      case 'holiday': return <CalendarOutlined style={{ color: '#eb2f96' }} />;
      case 'reminder': return <BellOutlined style={{ color: '#13c2c2' }} />;
      case 'maintenance': return <ExclamationCircleOutlined style={{ color: '#ff7a45' }} />;
      default: return <CalendarOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'class': return '#1890ff';
      case 'exam': return '#ff4d4f';
      case 'meeting': return '#722ed1';
      case 'event': return '#52c41a';
      case 'assignment': return '#faad14';
      case 'holiday': return '#eb2f96';
      case 'reminder': return '#13c2c2';
      case 'maintenance': return '#ff7a45';
      default: return '#d9d9d9';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4d4f';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getEventTypeName = (type: string) => {
    switch (type) {
      case 'class': return 'Clase';
      case 'exam': return 'Examen';
      case 'meeting': return 'Reunión';
      case 'event': return 'Evento';
      case 'assignment': return 'Tarea';
      case 'holiday': return 'Festividad';
      case 'reminder': return 'Recordatorio';
      case 'maintenance': return 'Mantenimiento';
      default: return 'Otro';
    }
  };

  const dateCellRender = (value: Dayjs) => {
    const dateEvents = events.filter(event => 
      dayjs(event.date).isSame(value, 'day')
    );

    // Responsive cell configurations
    const cellHeight = isMobile ? '40px' : isTablet ? '50px' : '60px';
    const maxEventsToShow = isMobile ? 1 : isTablet ? 2 : 3;
    const fontSize = isMobile ? '8px' : '10px';
    const padding = isMobile ? '1px 2px' : '1px 4px';

    return (
      <div 
        style={{ 
          minHeight: cellHeight, 
          position: 'relative',
          cursor: 'pointer',
          borderRadius: '4px',
          transition: 'background-color 0.2s ease'
        }}
        onClick={(e) => {
          // Only handle click if not clicking on an event
          if ((e.target as HTMLElement).closest('.calendar-event')) return;
          handleDateClick(value);
        }}
        onMouseEnter={(e) => {
          if (!isMobile && !isTablet) {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(24, 144, 255, 0.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isMobile && !isTablet) {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
          }
        }}
        title={`Haz clic para crear evento el ${value.format('DD/MM/YYYY')}`}
      >
        {dateEvents.slice(0, maxEventsToShow).map(event => (
          <div
            key={event.id}
            className="calendar-event"
            style={{
              fontSize: fontSize,
              padding: padding,
              margin: '1px 0',
              borderRadius: '2px',
              backgroundColor: getEventTypeColor(event.type),
              color: 'white',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              zIndex: 2,
              position: 'relative'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedEvent(event);
              setModalVisible(true);
            }}
            title={event.title} // Tooltip for mobile
          >
            {isMobile && event.title.length > 8 
              ? `${event.title.substring(0, 8)}...` 
              : event.title
            }
          </div>
        ))}
        {dateEvents.length > maxEventsToShow && (
          <div style={{ 
            fontSize: fontSize, 
            color: '#666', 
            textAlign: 'center',
            position: isMobile ? 'absolute' : 'static',
            bottom: isMobile ? '2px' : 'auto',
            right: isMobile ? '2px' : 'auto',
            backgroundColor: isMobile ? 'rgba(255,255,255,0.8)' : 'transparent',
            borderRadius: '2px',
            padding: isMobile ? '1px' : '0'
          }}>
            +{dateEvents.length - maxEventsToShow}
          </div>
        )}
        {/* Add event indicator on hover for desktop */}
        {!isMobile && !isTablet && (
          <div 
            className="add-event-indicator"
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#1890ff',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              opacity: 0,
              transition: 'opacity 0.2s ease',
              zIndex: 1
            }}
          >
            +
          </div>
        )}
      </div>
    );
  };

  const monthCellRender = (value: Dayjs) => {
    const monthEvents = events.filter(event => 
      dayjs(event.date).isSame(value, 'month')
    );
    
    return monthEvents.length > 0 ? (
      <div style={{ textAlign: 'center' }}>
        <Badge count={monthEvents.length} style={{ backgroundColor: '#52c41a' }} />
      </div>
    ) : null;
  };

  const getTodayEvents = () => {
    return events.filter(event => 
      dayjs(event.date).isSame(dayjs(), 'day')
    ).slice(0, maxEvents);
  };

  const getUpcomingEvents = () => {
    return events
      .filter(event => dayjs(event.date).isAfter(dayjs(), 'day'))
      .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
      .slice(0, maxEvents);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const getWidgetTitle = () => {
    switch (userRole) {
      case 'admin': return 'Calendario Institucional';
      case 'teacher': return 'Mi Calendario de Clases';
      case 'student': return 'Mi Calendario Académico';
      case 'family': return 'Calendario Familiar';
      default: return 'Calendario';
    }
  };

  if (loading) {
    return (
      <Card 
        title={getWidgetTitle()} 
        style={{ height: isMobile ? 'auto' : height }}
        className={isMobile ? 'mobile-calendar-loading' : ''}
      >
        <div style={{ textAlign: 'center', padding: isMobile ? '20px' : '50px' }}>
          <Spin size={isMobile ? 'default' : 'large'} />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card 
        title={
          <Space size={isMobile ? 'small' : 'middle'}>
            <CalendarOutlined />
            <span className={isMobile ? 'text-sm' : ''}>{getWidgetTitle()}</span>
            <Tag color="blue" className={isMobile ? 'text-xs' : ''}>{events.length} eventos</Tag>
          </Space>
        }
        extra={
          <Space>
            {(isMobile || isTablet) && (
              <div className="text-xs text-gray-500" style={{ marginRight: 8 }}>
                👆 Desliza para navegar
              </div>
            )}
            {getAllowedEventTypes(userRole).length > 0 && (
              <Button
                icon={<PlusOutlined />}
                type="primary"
                size={isMobile ? 'small' : 'middle'}
                onClick={() => {
                  setSelectedDateForEvent(dayjs());
                  setShowEventModal(true);
                }}
                title={
                  userRole === 'family' ? 'Crear recordatorio familiar' : 
                  userRole === 'student' ? 'Crear recordatorio personal' : 
                  'Crear nuevo evento'
                }
              >
                {isMobile ? '' : 
                  userRole === 'family' ? 'Recordatorio' : 
                  userRole === 'student' ? 'Recordatorio' : 
                  'Nuevo'
                }
              </Button>
            )}
          </Space>
        }
        style={{ height: responsiveHeight }}
        className={`calendar-widget ${isMobile ? 'mobile-calendar' : ''}`}
      >
        {isMobile ? (
          // Layout mobile: Calendar + Collapse para eventos
          <div className="mobile-calendar-layout">
            <div 
              className="mobile-calendar-container"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <Calendar
                cellRender={calendarMode === 'month' ? dateCellRender : monthCellRender}
                mode={calendarMode}
                value={selectedDate}
                onPanelChange={handlePanelChange}
                className="mobile-calendar-widget"
              />
            </div>
            
            {showEventList && (
              <Collapse 
                ghost 
                className="mobile-events-collapse"
                items={[
                  {
                    key: 'today',
                    label: (
                      <Space>
                        <ClockCircleOutlined />
                        <span>Hoy ({getTodayEvents().length})</span>
                      </Space>
                    ),
                    children: getTodayEvents().length > 0 ? (
                      <List
                        size="small"
                        dataSource={getTodayEvents()}
                        renderItem={(event) => (
                          <List.Item
                            className="mobile-event-item"
                            onClick={() => handleEventClick(event)}
                          >
                            <List.Item.Meta
                              avatar={getEventTypeIcon(event.type)}
                              title={<Text strong className="text-sm">{event.title}</Text>}
                              description={
                                <Text type="secondary" className="text-xs">
                                  {event.startTime && `${event.startTime}`}
                                  {event.location && ` • ${event.location}`}
                                </Text>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Text type="secondary" className="text-sm">No hay eventos para hoy</Text>
                    )
                  },
                  {
                    key: 'upcoming',
                    label: (
                      <Space>
                        <BellOutlined />
                        <span>Próximos ({getUpcomingEvents().length})</span>
                      </Space>
                    ),
                    children: getUpcomingEvents().length > 0 ? (
                      <List
                        size="small"
                        dataSource={getUpcomingEvents()}
                        renderItem={(event) => (
                          <List.Item
                            className="mobile-event-item"
                            onClick={() => handleEventClick(event)}
                          >
                            <List.Item.Meta
                              avatar={getEventTypeIcon(event.type)}
                              title={<Text strong className="text-sm">{event.title}</Text>}
                              description={
                                <Text type="secondary" className="text-xs">
                                  {dayjs(event.date).format('DD/MM')}
                                  {event.startTime && ` • ${event.startTime}`}
                                </Text>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Text type="secondary" className="text-sm">No hay eventos próximos</Text>
                    )
                  }
                ]}
              />
            )}
          </div>
        ) : (
          // Layout desktop/tablet: Grid layout
          <Row 
            gutter={16} 
            style={{ 
              height: typeof contentHeight === 'number' ? `${contentHeight}px` : 'auto',
              minHeight: typeof contentHeight === 'number' ? `${contentHeight}px` : '350px'
            }}
          >
            {/* Desktop Calendar Navigation Scrollbar */}
            {!isMobile && !isTablet && (
              <Col span={1} style={{ height: '100%' }}>
                <div className="calendar-navigation-scrollbar">
                  <div className="calendar-nav-controls">
                    <Button
                      icon={<ArrowUpOutlined />}
                      size="small"
                      onClick={() => {
                        const newDate = selectedDate.subtract(1, 'week');
                        setSelectedDate(newDate);
                      }}
                      className="calendar-nav-btn"
                    />
                    <div className="calendar-nav-indicator">
                      <div className="nav-month-indicator">
                        {selectedDate.format('MMM')}
                      </div>
                      <div className="nav-week-indicator">
                        S{Math.ceil(selectedDate.date() / 7)}
                      </div>
                    </div>
                    <Button
                      icon={<ArrowDownOutlined />}
                      size="small"
                      onClick={() => {
                        const newDate = selectedDate.add(1, 'week');
                        setSelectedDate(newDate);
                      }}
                      className="calendar-nav-btn"
                    />
                  </div>
                </div>
              </Col>
            )}

            <Col 
              xs={24} 
              lg={showEventListResponsive ? (isMobile || isTablet ? 24 : 17) : (isMobile || isTablet ? 24 : 23)}
              style={{ height: '100%' }}
            >
              <div 
                className="calendar-scroll-container"
                style={{ height: '100%', position: 'relative' }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <Calendar
                  cellRender={calendarMode === 'month' ? dateCellRender : monthCellRender}
                  mode={calendarMode}
                  value={selectedDate}
                  onPanelChange={handlePanelChange}
                  style={{ 
                    height: '100%',
                    backgroundColor: '#fff'
                  }}
                />
              </div>
            </Col>

            {showEventListResponsive && (
              <Col 
                xs={24} 
                lg={6}
                style={{ height: '100%' }}
              >
                <div 
                  style={{ 
                    borderLeft: '1px solid #f0f0f0',
                    paddingLeft: '16px',
                    height: '100%',
                    overflow: 'auto'
                  }}
                >
                  <div style={{ marginBottom: '16px' }}>
                    <Title level={5} style={{ fontSize: '14px', marginBottom: '8px' }}>
                      <ClockCircleOutlined style={{ marginRight: '8px' }} />
                      Hoy ({getTodayEvents().length})
                    </Title>
                    {getTodayEvents().length > 0 ? (
                      <List
                        size="small"
                        dataSource={getTodayEvents()}
                        renderItem={(event) => (
                          <List.Item
                            className="event-item"
                            onClick={() => handleEventClick(event)}
                          >
                            <List.Item.Meta
                              avatar={getEventTypeIcon(event.type)}
                              title={
                                <Space>
                                  <Text strong style={{ fontSize: '12px' }}>
                                    {event.title}
                                  </Text>
                                  <Badge 
                                    color={getPriorityColor(event.priority)} 
                                    style={{ marginLeft: '4px' }} 
                                  />
                                </Space>
                              }
                              description={
                                <Text type="secondary" style={{ fontSize: '11px' }}>
                                  {event.startTime && `${event.startTime} - ${event.endTime || ''}`}
                                  {event.location && ` • ${event.location}`}
                                </Text>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        No hay eventos para hoy
                      </Text>
                    )}
                  </div>

                  <div>
                    <Title level={5} style={{ fontSize: '14px', marginBottom: '8px' }}>
                      <BellOutlined style={{ marginRight: '8px' }} />
                      Próximos ({getUpcomingEvents().length})
                    </Title>
                    {getUpcomingEvents().length > 0 ? (
                      <List
                        size="small"
                        dataSource={getUpcomingEvents()}
                        renderItem={(event) => (
                          <List.Item
                            className="event-item"
                            onClick={() => handleEventClick(event)}
                          >
                            <List.Item.Meta
                              avatar={getEventTypeIcon(event.type)}
                              title={
                                <Space>
                                  <Text strong style={{ fontSize: '12px' }}>
                                    {event.title}
                                  </Text>
                                  <Badge 
                                    color={getPriorityColor(event.priority)} 
                                    style={{ marginLeft: '4px' }} 
                                  />
                                </Space>
                              }
                              description={
                                <Text type="secondary" style={{ fontSize: '11px' }}>
                                  {dayjs(event.date).format('DD/MM')}
                                  {event.startTime && ` • ${event.startTime}`}
                                </Text>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        No hay eventos próximos
                      </Text>
                    )}
                  </div>
                </div>
              </Col>
            )}
          </Row>
        )}
      </Card>

      {/* Modal para crear nuevo evento */}
      <ResponsiveModal
        title={
          <Space>
            {editingEvent ? <EditOutlined /> : <PlusOutlined />}
            <span className={isMobile ? 'text-sm' : ''}>
              {editingEvent ? 'Editar Evento' : 'Crear Evento'} - {selectedDateForEvent?.format('DD/MM/YYYY')}
            </span>
          </Space>
        }
        open={showEventModal}
        onCancel={() => {
          setShowEventModal(false);
          setSelectedDateForEvent(null);
          setEditingEvent(null);
        }}
        footer={null}
        desktopWidth={600}
        tabletWidth="90%"
        mobileAsDrawer={true}
        drawerPlacement="bottom"
      >
        <Form
          key={editingEvent ? editingEvent.id : 'new'}
          layout="vertical"
          onFinish={handleCreateEvent}
          initialValues={editingEvent ? {
            title: editingEvent.title,
            description: editingEvent.description,
            type: editingEvent.type,
            priority: editingEvent.priority,
            location: editingEvent.location,
            visibility: editingEvent.visibility || getDefaultVisibility(userRole),
            startTime: editingEvent.startTime ? dayjs(editingEvent.startTime, 'HH:mm') : undefined,
            endTime: editingEvent.endTime ? dayjs(editingEvent.endTime, 'HH:mm') : undefined,
          } : {
            type: getAllowedEventTypes(userRole)[0] || 'reminder',
            priority: 'medium',
            visibility: getDefaultVisibility(userRole)
          }}
        >
          <Form.Item
            label="Título del evento"
            name="title"
            rules={[{ required: true, message: 'El título es obligatorio' }]}
          >
            <Input placeholder="Ingresa el título del evento" />
          </Form.Item>

          <Form.Item
            label="Tipo de evento"
            name="type"
            rules={[{ required: true, message: 'Selecciona un tipo' }]}
          >
            <Select placeholder="Selecciona el tipo de evento">
              {getAllowedEventTypes(userRole).map(type => (
                <Select.Option key={type} value={type}>
                  {getEventTypeLabel(type)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Descripción"
            name="description"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Descripción opcional del evento"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Hora de inicio"
                name="startTime"
              >
                <TimePicker 
                  format="HH:mm" 
                  placeholder="Hora inicio"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Hora de fin"
                name="endTime"
              >
                <TimePicker 
                  format="HH:mm" 
                  placeholder="Hora fin"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Ubicación"
            name="location"
          >
            <Input placeholder="Ubicación del evento (opcional)" />
          </Form.Item>

          <Form.Item
            label="Prioridad"
            name="priority"
          >
            <Select>
              <Select.Option value="low">Baja</Select.Option>
              <Select.Option value="medium">Media</Select.Option>
              <Select.Option value="high">Alta</Select.Option>
            </Select>
          </Form.Item>

          {/* Campo de visibilidad solo para admin y teachers */}
          {(userRole === 'admin' || userRole === 'teacher') && (
            <Form.Item
              label="Visibilidad"
              name="visibility"
              rules={[{ required: true, message: 'Selecciona la visibilidad' }]}
            >
              <Select 
                placeholder="¿Quién puede ver este evento?"
                onChange={(value) => setSelectedVisibility(value)}
              >
                {getAllowedVisibilityLevels(userRole).map(visibility => (
                  <Select.Option key={visibility} value={visibility}>
                    {getVisibilityLabel(visibility)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {/* Campo para seleccionar clases específicas */}
          {(userRole === 'admin' || userRole === 'teacher') && selectedVisibility === 'class_specific' && (
            <Form.Item
              label="Clases específicas"
              name="classGroups"
              rules={[{ required: true, message: 'Selecciona al menos una clase' }]}
            >
              <Select
                mode="multiple"
                placeholder="Selecciona las clases que verán este evento"
                style={{ width: '100%' }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {userRole === 'admin' ? (
                  // Admin puede ver todas las clases
                  classGroups.map(classGroup => (
                    <Select.Option key={classGroup.id} value={classGroup.id}>
                      {classGroup.name} {classGroup.educationalLevel && `- ${classGroup.educationalLevel.name}`}
                    </Select.Option>
                  ))
                ) : (
                  // Teacher solo ve sus clases asignadas
                  teacherSubjects.map(assignment => (
                    <Select.Option key={assignment.classGroup.id} value={assignment.classGroup.id}>
                      {assignment.classGroup.name}
                    </Select.Option>
                  ))
                )}
              </Select>
            </Form.Item>
          )}

          {/* Campo para seleccionar asignaturas específicas */}
          {(userRole === 'admin' || userRole === 'teacher') && selectedVisibility === 'subject_specific' && (
            <Form.Item
              label="Asignaturas específicas"
              name="subjects"
              rules={[{ required: true, message: 'Selecciona al menos una asignatura' }]}
            >
              <Select
                mode="multiple"
                placeholder="Selecciona las asignaturas relacionadas con este evento"
                style={{ width: '100%' }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {userRole === 'admin' ? (
                  // Admin puede ver todas las asignaturas
                  subjects.map(subject => (
                    <Select.Option key={subject.id} value={subject.id}>
                      {subject.code} - {subject.name}
                    </Select.Option>
                  ))
                ) : (
                  // Teacher solo ve sus asignaturas asignadas
                  teacherSubjects.map(assignment => (
                    <Select.Option key={assignment.subject.id} value={assignment.subject.id}>
                      {assignment.subject.code} - {assignment.subject.name}
                    </Select.Option>
                  ))
                )}
              </Select>
            </Form.Item>
          )}

          {/* Información para familias y estudiantes */}
          {(userRole === 'family' || userRole === 'student') && (
            <Alert
              message="Evento Privado"
              description={`Este evento será privado y solo tú podrás verlo. ${userRole === 'family' ? 'Puedes crear recordatorios para actividades familiares.' : 'Puedes crear recordatorios personales y fechas límite.'}`}
              type="info"
              showIcon
              className="mb-4"
            />
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button 
              onClick={() => {
                setShowEventModal(false);
                setSelectedDateForEvent(null);
                setEditingEvent(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit">
              {editingEvent ? 'Actualizar Evento' : 'Crear Evento'}
            </Button>
          </div>
        </Form>
      </ResponsiveModal>

      {/* Modal de detalles del evento */}
      <ResponsiveModal
        title={
          <Space>
            {selectedEvent && getEventTypeIcon(selectedEvent.type)}
            <span className={isMobile ? 'text-sm' : ''}>Detalles del evento</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={
          <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-between gap-2'}`}>
            <Button 
              onClick={() => setModalVisible(false)}
              block={isMobile}
            >
              Cerrar
            </Button>
            <div className={`flex ${isMobile ? 'flex-col gap-2' : 'gap-2'}`}>
              <Button 
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  if (selectedEvent) {
                    handleDeleteEvent(selectedEvent.id);
                  }
                }}
                block={isMobile}
              >
                Eliminar
              </Button>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => {
                  if (selectedEvent) {
                    handleEditEvent(selectedEvent);
                  }
                }}
                block={isMobile}
              >
                Editar
              </Button>
            </div>
          </div>
        }
        desktopWidth={600}
        tabletWidth="90%"
        mobileAsDrawer={true}
        drawerPlacement="bottom"
      >
        {selectedEvent && (
          <Descriptions 
            column={1} 
            bordered={!isMobile}
            size={isMobile ? 'small' : 'middle'}
            className={isMobile ? 'mobile-event-details' : ''}
          >
            <Descriptions.Item label="Título">
              <Space direction={isMobile ? 'vertical' : 'horizontal'} size="small">
                <Text strong className={isMobile ? 'text-sm' : ''}>{selectedEvent.title}</Text>
                <div className="flex flex-wrap gap-1">
                  <Tag 
                    color={getEventTypeColor(selectedEvent.type)}
                    className={isMobile ? 'text-xs' : ''}
                  >
                    {getEventTypeName(selectedEvent.type)}
                  </Tag>
                  <Badge 
                    color={getPriorityColor(selectedEvent.priority)} 
                    text={
                      selectedEvent.priority === 'high' ? 'Alta' :
                      selectedEvent.priority === 'medium' ? 'Media' : 'Baja'
                    }
                    className={isMobile ? 'text-xs' : ''}
                  />
                </div>
              </Space>
            </Descriptions.Item>
            
            <Descriptions.Item label="Fecha">
              <Text className={isMobile ? 'text-sm' : ''}>
                {dayjs(selectedEvent.date).format(isMobile ? 'DD/MM/YYYY' : 'dddd, DD [de] MMMM [de] YYYY')}
              </Text>
            </Descriptions.Item>
            
            {selectedEvent.startTime && (
              <Descriptions.Item label="Horario">
                <Text className={isMobile ? 'text-sm' : ''}>
                  {selectedEvent.startTime} - {selectedEvent.endTime || 'Sin fin definido'}
                </Text>
              </Descriptions.Item>
            )}
            
            {selectedEvent.location && (
              <Descriptions.Item label="Ubicación">
                <Text className={isMobile ? 'text-sm' : ''}>{selectedEvent.location}</Text>
              </Descriptions.Item>
            )}
            
            {selectedEvent.description && (
              <Descriptions.Item label="Descripción">
                <Text className={isMobile ? 'text-sm' : ''}>{selectedEvent.description}</Text>
              </Descriptions.Item>
            )}
            
            {selectedEvent.metadata?.subjectName && (
              <Descriptions.Item label="Asignatura">
                <Text className={isMobile ? 'text-sm' : ''}>{selectedEvent.metadata.subjectName}</Text>
              </Descriptions.Item>
            )}
            
            {selectedEvent.metadata?.className && (
              <Descriptions.Item label="Clase">
                <Text className={isMobile ? 'text-sm' : ''}>{selectedEvent.metadata.className}</Text>
              </Descriptions.Item>
            )}
            
            {selectedEvent.metadata?.teacherName && (
              <Descriptions.Item label="Profesor">
                <Text className={isMobile ? 'text-sm' : ''}>{selectedEvent.metadata.teacherName}</Text>
              </Descriptions.Item>
            )}
            
            {selectedEvent.metadata?.studentName && (
              <Descriptions.Item label="Estudiante">
                <Text className={isMobile ? 'text-sm' : ''}>{selectedEvent.metadata.studentName}</Text>
              </Descriptions.Item>
            )}
            
            <Descriptions.Item label="Estado">
              <Badge 
                status={
                  selectedEvent.status === 'completed' ? 'success' :
                  selectedEvent.status === 'ongoing' ? 'processing' :
                  selectedEvent.status === 'cancelled' ? 'error' : 'default'
                }
                text={
                  selectedEvent.status === 'completed' ? 'Completado' :
                  selectedEvent.status === 'ongoing' ? 'En curso' :
                  selectedEvent.status === 'cancelled' ? 'Cancelado' : 'Programado'
                }
                className={isMobile ? 'text-sm' : ''}
              />
            </Descriptions.Item>
          </Descriptions>
        )}
      </ResponsiveModal>
    </>
  );
};

export default CalendarWidget;