import React, { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Typography, Button, Space, Badge } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  DashboardOutlined,
  TeamOutlined,
  BookOutlined,
  FileTextOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@store/authStore'
import { UserRole } from '@/types/user'
import { useLocation, useNavigate } from 'react-router-dom'

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
            key: 'communications',
            icon: <BellOutlined />,
            label: 'Comunicaciones',
            onClick: () => navigate('/family/communications'),
          },
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

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return '#ef4444'
      case UserRole.TEACHER:
        return '#3b82f6'
      case UserRole.STUDENT:
        return '#10b981'
      case UserRole.FAMILY:
        return '#f59e0b'
      default:
        return '#6b7280'
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
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: getRoleColor(user?.role!) }}
            >
              MW
            </div>
            {!collapsed && (
              <div>
                <Text strong className="text-base">MW Panel</Text>
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
            <Badge count={3} size="small">
              <Button 
                type="text" 
                icon={<BellOutlined />} 
                className="flex items-center justify-center w-8 h-8"
              />
            </Badge>

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