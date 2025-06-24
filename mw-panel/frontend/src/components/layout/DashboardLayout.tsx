import React, { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Typography, Button, Space, Badge } from 'antd'
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
} from '@ant-design/icons'
import { useAuthStore } from '@store/authStore'
import { UserRole } from '@/types/user'
import { useLocation, useNavigate } from 'react-router-dom'
import NotificationCenter from '../NotificationCenter'
import { useUnreadMessages } from '../../hooks/useUnreadMessages'

const { Header, Sider, Content } = Layout
const { Text } = Typography

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const { unreadCount } = useUnreadMessages()

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
            key: 'attendance',
            icon: <CalendarOutlined />,
            label: 'Control de Asistencia',
            onClick: () => navigate('/teacher/attendance'),
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
        ]

      case UserRole.FAMILY:
        return [
          ...baseItems,
          {
            key: 'children',
            icon: <TeamOutlined />,
            label: 'Mis Hijos',
            onClick: () => navigate('/family/children'),
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
          createMessageMenuItem('messages', 'Mensajes', '/family/messages'),
        ]

      default:
        return baseItems
    }
  }

  // User dropdown menu
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Mi Perfil',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configuración',
      onClick: () => navigate('/settings'),
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


  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="light"
        width={256}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <img
                src="/logo.svg"
                alt="Mundo World School"
                className="w-full h-full object-contain"
              />
            </div>
            {!collapsed && (
              <div>
                <Text strong className="text-base">Mundo World School</Text>
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
        />
      </Sider>

      <Layout>
        <Header className="bg-white px-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center justify-center w-8 h-8"
            />
          </div>

          <Space size="middle">
            <NotificationCenter />

            <Dropdown 
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-50">
                <Avatar 
                  size="small" 
                  icon={<UserOutlined />}
                  src={user?.profile?.avatarUrl}
                />
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.profile?.fullName || user?.email}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getRoleLabel(user?.role!)}
                  </div>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        <Content className="p-6 bg-gray-50">
          <div className="fade-in">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default DashboardLayout