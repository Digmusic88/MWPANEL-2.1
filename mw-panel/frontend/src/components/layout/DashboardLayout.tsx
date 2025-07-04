import React, { useState, useEffect } from 'react'
import { Layout, Menu, Avatar, Dropdown, Typography, Button, Space, Badge, Drawer } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  DashboardOutlined,
  TeamOutlined,
  BookOutlined,
  FileTextOutlined,
  BarChartOutlined,
  MessageOutlined,
  CalendarOutlined,
  ProjectOutlined,
  TableOutlined,
  ShareAltOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@store/authStore'
import { UserRole } from '@/types/user'
import { useLocation, useNavigate } from 'react-router-dom'
import NotificationCenter from '../NotificationCenter'
import { useUnreadMessages } from '../../hooks/useUnreadMessages'
import { usePendingAttendanceRequests } from '../../hooks/usePendingAttendanceRequests'
import { useResponsive } from '../../hooks/useResponsive'

const { Header, Sider, Content } = Layout
const { Text } = Typography

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false)
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const { unreadCount } = useUnreadMessages()
  const { pendingCount } = usePendingAttendanceRequests()
  const { isMobile, isTablet, screenSize } = useResponsive()

  // Auto-collapse sidebar on mobile/tablet
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true)
      setMobileMenuVisible(false)
    } else if (isTablet) {
      setCollapsed(true)
    } else {
      setCollapsed(false)
    }
  }, [isMobile, isTablet])

  // Close mobile menu on navigation
  useEffect(() => {
    if (isMobile) {
      setMobileMenuVisible(false)
    }
  }, [location.pathname, isMobile])

  // Helper para crear item de menú con badge
  const createMessageMenuItem = (key: string, label: string, path: string) => ({
    key,
    icon: collapsed ? (
      <Badge 
        count={unreadCount} 
        size="small" 
        offset={[8, 8]}
        style={{ 
          backgroundColor: '#ff4d4f',
          fontSize: '10px',
          height: '16px',
          minWidth: '16px',
          lineHeight: '16px',
          borderRadius: '8px'
        }}
      >
        <MessageOutlined />
      </Badge>
    ) : (
      <MessageOutlined />
    ),
    label: (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{label}</span>
        {!collapsed && unreadCount > 0 && (
          <Badge 
            count={unreadCount} 
            size="small" 
            style={{ 
              backgroundColor: '#ff4d4f',
              fontSize: '11px',
              height: '18px',
              minWidth: '18px',
              lineHeight: '18px',
              borderRadius: '9px'
            }}
          />
        )}
      </div>
    ),
    onClick: () => navigate(path),
  })

  // Helper para crear item de menú de asistencia con badge
  const createAttendanceMenuItem = (key: string, label: string, path: string) => ({
    key,
    icon: collapsed ? (
      <Badge 
        count={pendingCount} 
        size="small" 
        offset={[8, 8]}
        style={{ 
          backgroundColor: '#faad14',
          fontSize: '10px',
          height: '16px',
          minWidth: '16px',
          lineHeight: '16px',
          borderRadius: '8px'
        }}
      >
        <CalendarOutlined />
      </Badge>
    ) : (
      <CalendarOutlined />
    ),
    label: (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{label}</span>
        {!collapsed && pendingCount > 0 && (
          <Badge 
            count={pendingCount} 
            size="small" 
            style={{ 
              backgroundColor: '#faad14',
              fontSize: '11px',
              height: '18px',
              minWidth: '18px',
              lineHeight: '18px',
              borderRadius: '9px'
            }}
          />
        )}
      </div>
    ),
    onClick: () => navigate(path),
  });

  // Get menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
        onClick: () => navigate(`/${user?.role}`),
      },
    ]

    switch (user?.role) {
      case UserRole.ADMIN:
        return [
          ...baseItems,
          {
            key: 'users',
            icon: <TeamOutlined />,
            label: 'Usuarios',
            children: [
              {
                key: 'enrollment',
                label: 'Inscripción',
                onClick: () => navigate('/admin/enrollment'),
              },
              {
                key: 'teachers',
                label: 'Profesores',
                onClick: () => navigate('/admin/teachers'),
              },
              {
                key: 'students',
                label: 'Estudiantes',
                onClick: () => navigate('/admin/students'),
              },
              {
                key: 'families',
                label: 'Familias',
                onClick: () => navigate('/admin/families'),
              },
            ],
          },
          {
            key: 'academic',
            icon: <BookOutlined />,
            label: 'Académico',
            children: [
              {
                key: 'class-groups',
                label: 'Grupos de Clase',
                onClick: () => navigate('/admin/class-groups'),
              },
              {
                key: 'levels',
                label: 'Niveles Educativos',
                onClick: () => navigate('/admin/levels'),
              },
              {
                key: 'subjects',
                label: 'Asignaturas',
                onClick: () => navigate('/admin/subjects'),
              },
              {
                key: 'schedules',
                label: 'Horarios',
                onClick: () => navigate('/admin/schedules'),
              },
              {
                key: 'class-schedules',
                label: 'Horarios por Grupo',
                onClick: () => navigate('/admin/class-schedules'),
              },
              {
                key: 'calendar',
                label: 'Calendario Escolar',
                onClick: () => navigate('/admin/calendar'),
              },
              {
                key: 'competencies',
                label: 'Competencias',
                onClick: () => navigate('/admin/competencies'),
              },
            ],
          },
          {
            key: 'evaluations',
            icon: <FileTextOutlined />,
            label: 'Evaluaciones',
            onClick: () => navigate('/admin/evaluations'),
          },
          {
            key: 'communications',
            icon: collapsed ? (
              <Badge 
                count={unreadCount} 
                size="small" 
                offset={[8, 8]}
                style={{ 
                  backgroundColor: '#ff4d4f',
                  fontSize: '10px',
                  height: '16px',
                  minWidth: '16px',
                  lineHeight: '16px',
                  borderRadius: '8px'
                }}
              >
                <MessageOutlined />
              </Badge>
            ) : (
              <MessageOutlined />
            ),
            label: (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Comunicaciones</span>
                {!collapsed && unreadCount > 0 && (
                  <Badge 
                    count={unreadCount} 
                    size="small" 
                    style={{ 
                      backgroundColor: '#ff4d4f',
                      fontSize: '11px',
                      height: '18px',
                      minWidth: '18px',
                      lineHeight: '18px',
                      borderRadius: '9px'
                    }}
                  />
                )}
              </div>
            ),
            children: [
              {
                key: 'messages',
                label: 'Mensajes',
                onClick: () => navigate('/admin/messages'),
              },
              {
                key: 'notifications',
                label: 'Notificaciones',
                onClick: () => navigate('/admin/notifications'),
              },
            ],
          },
          {
            key: 'reports',
            icon: <BarChartOutlined />,
            label: 'Informes',
            onClick: () => navigate('/admin/reports'),
          },
          {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Configuración',
            onClick: () => navigate('/admin/settings'),
          },
        ]

      case UserRole.TEACHER:
        return [
          ...baseItems,
          {
            key: 'classes',
            icon: <TeamOutlined />,
            label: 'Mis Clases',
            onClick: () => navigate('/teacher/classes'),
          },
          {
            key: 'schedule',
            icon: <BookOutlined />,
            label: 'Mi Horario',
            onClick: () => navigate('/teacher/schedule'),
          },
          {
            key: 'calendar',
            icon: <CalendarOutlined />,
            label: 'Calendario',
            onClick: () => navigate('/teacher/calendar'),
          },
          createAttendanceMenuItem('attendance', 'Control de Asistencia', '/teacher/attendance'),
          {
            key: 'activities',
            icon: <BarChartOutlined />,
            label: 'Actividades Diarias',
            onClick: () => navigate('/teacher/activities'),
          },
          {
            key: 'tasks',
            icon: <ProjectOutlined />,
            label: 'Tareas/Deberes',
            onClick: () => navigate('/teacher/tasks'),
          },
          {
            key: 'tasks-dashboard',
            icon: <BarChartOutlined />,
            label: 'Dashboard Tareas',
            onClick: () => navigate('/teacher/tasks-dashboard'),
          },
          {
            key: 'rubrics',
            icon: <TableOutlined />,
            label: 'Rúbricas',
            onClick: () => navigate('/teacher/rubrics'),
          },
          {
            key: 'shared-rubrics',
            icon: <ShareAltOutlined />,
            label: 'Rúbricas Compartidas',
            onClick: () => navigate('/teacher/shared-rubrics'),
          },
          {
            key: 'evaluations',
            icon: <FileTextOutlined />,
            label: 'Evaluaciones',
            onClick: () => navigate('/teacher/evaluations'),
          },
          {
            key: 'students',
            icon: <TeamOutlined />,
            label: 'Estudiantes',
            onClick: () => navigate('/teacher/students'),
          },
          createMessageMenuItem('messages', 'Mensajes', '/teacher/messages'),
          {
            key: 'reports',
            icon: <BarChartOutlined />,
            label: 'Informes',
            onClick: () => navigate('/teacher/reports'),
          },
        ]

      case UserRole.STUDENT:
        return [
          ...baseItems,
          {
            key: 'tasks',
            icon: <ProjectOutlined />,
            label: 'Mis Tareas',
            onClick: () => navigate('/student/tasks'),
          },
          {
            key: 'grades',
            icon: <FileTextOutlined />,
            label: 'Mis Calificaciones',
            onClick: () => navigate('/student/grades'),
          },
          {
            key: 'competencies',
            icon: <BarChartOutlined />,
            label: 'Competencias',
            onClick: () => navigate('/student/competencies'),
          },
          {
            key: 'schedule',
            icon: <BookOutlined />,
            label: 'Horario',
            onClick: () => navigate('/student/schedule'),
          },
          {
            key: 'calendar',
            icon: <CalendarOutlined />,
            label: 'Calendario',
            onClick: () => navigate('/student/calendar'),
          },
        ]

      case UserRole.FAMILY:
        return [
          ...baseItems,
          {
            key: 'children',
            icon: <TeamOutlined />,
            label: 'Mis Hijos',
            onClick: () => navigate('/family/my-children'),
          },
          {
            key: 'grades',
            icon: <FileTextOutlined />,
            label: 'Calificaciones',
            onClick: () => navigate('/family/grades'),
          },
          {
            key: 'attendance',
            icon: <CalendarOutlined />,
            label: 'Asistencia',
            onClick: () => navigate('/family/attendance'),
          },
          {
            key: 'activities',
            icon: <BookOutlined />,
            label: 'Actividades Diarias',
            onClick: () => navigate('/family/activities'),
          },
          {
            key: 'tasks',
            icon: <ProjectOutlined />,
            label: 'Tareas/Deberes',
            onClick: () => navigate('/family/tasks'),
          },
          {
            key: 'calendar',
            icon: <CalendarOutlined />,
            label: 'Calendario',
            onClick: () => navigate('/family/calendar'),
          },
          createMessageMenuItem('messages', 'Mensajes', '/family/messages'),
        ]

      default:
        return baseItems
    }
  }

  // Helper to get role-specific paths
  const getRoleBasePath = () => {
    switch (user?.role) {
      case UserRole.ADMIN:
        return '/admin'
      case UserRole.TEACHER:
        return '/teacher'
      case UserRole.STUDENT:
        return '/student'
      case UserRole.FAMILY:
        return '/family'
      default:
        return ''
    }
  }

  // User dropdown menu
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Mi Perfil',
      onClick: () => navigate(`${getRoleBasePath()}/profile`),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configuración',
      onClick: () => navigate(`${getRoleBasePath()}/settings`),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      onClick: logout,
    },
  ]

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrador'
      case UserRole.TEACHER:
        return 'Profesor'
      case UserRole.STUDENT:
        return 'Estudiante'
      case UserRole.FAMILY:
        return 'Familia'
      default:
        return role
    }
  }

  // Toggle sidebar/mobile menu
  const toggleMenu = () => {
    if (isMobile) {
      setMobileMenuVisible(!mobileMenuVisible)
    } else {
      setCollapsed(!collapsed)
    }
  }

  // Sidebar content component
  const SidebarContent = () => (
    <>
      <div className={`${isMobile ? 'p-3 border-b border-gray-200' : 'p-4 border-b border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <img
              src="/logo.svg"
              alt="Mundo World School"
              className="w-full h-full object-contain"
            />
          </div>
          {(!collapsed || isMobile) && (
            <div>
              <Text strong className={`${isMobile ? 'text-sm' : 'text-base'}`}>Mundo World School</Text>
              <div className="text-xs text-gray-500">
                {getRoleLabel(user?.role!)}
              </div>
            </div>
          )}
        </div>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname.split('/')[2] || 'dashboard']}
        items={getMenuItems()}
        className="border-r-0 h-full"
        inlineIndent={isMobile ? 16 : 24}
      />
    </>
  )


  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          theme="light"
          width={256}
          collapsedWidth={80}
          breakpoint="lg"
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
          }}
        >
          <SidebarContent />
        </Sider>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          title={null}
          placement="left"
          onClose={() => setMobileMenuVisible(false)}
          open={mobileMenuVisible}
          closable={false}
          width={280}
          styles={{ body: { padding: 0 }, header: { display: 'none' } }}
          style={{ zIndex: 1000 }}
        >
          <SidebarContent />
        </Drawer>
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : collapsed ? 80 : 256 }}>
        <Header className={`bg-white shadow-sm ${isMobile ? 'px-3' : 'px-4'} flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
              onClick={toggleMenu}
              className="flex items-center justify-center w-8 h-8"
            />
          </div>

          <Space size={isMobile ? "small" : "middle"}>
            <NotificationCenter />

            <Dropdown 
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div className="flex items-center gap-2 cursor-pointer px-2 py-2 rounded-lg hover:bg-gray-50">
                <Avatar 
                  size={isMobile ? "small" : "default"} 
                  icon={<UserOutlined />}
                  src={user?.profile?.avatarUrl}
                />
                {!isMobile && (
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.profile?.fullName || user?.email}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getRoleLabel(user?.role!)}
                    </div>
                  </div>
                )}
              </div>
            </Dropdown>
          </Space>
        </Header>

        <Content className={`${isMobile ? 'p-3' : isTablet ? 'p-4' : 'p-6'} bg-gray-50`}>
          <div className="fade-in">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default DashboardLayout