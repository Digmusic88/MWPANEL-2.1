import { Routes, Route, Navigate } from 'react-router-dom'
import { App as AntdApp } from 'antd'
import { useAuthStore } from '@store/authStore'
import LoginPage from '@pages/auth/LoginPage'
import DashboardLayout from '@components/layout/DashboardLayout'
import AdminDashboard from '@pages/admin/AdminDashboard'
import TeacherDashboard from '@pages/teacher/TeacherDashboard'
import StudentDashboard from '@pages/student/StudentDashboard'
import FamilyDashboard from '@pages/family/FamilyDashboard'
import LoadingPage from '@components/common/LoadingPage'
import { UserRole } from '@/types/user'

function App() {
  const { user, isLoading, isAuthenticated } = useAuthStore()

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingPage />
  }

  // Redirect to dashboard based on user role
  const getDashboardPath = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return '/admin'
      case UserRole.TEACHER:
        return '/teacher'
      case UserRole.STUDENT:
        return '/student'
      case UserRole.FAMILY:
        return '/family'
      default:
        return '/login'
    }
  }

  return (
    <AntdApp>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to={getDashboardPath(user?.role!)} replace /> : 
              <LoginPage />
          } 
        />

        {/* Admin routes */}
        {isAuthenticated && user?.role === UserRole.ADMIN && (
          <Route path="/admin/*" element={
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          } />
        )}

        {/* Teacher routes */}
        {isAuthenticated && user?.role === UserRole.TEACHER && (
          <Route path="/teacher/*" element={
            <DashboardLayout>
              <TeacherDashboard />
            </DashboardLayout>
          } />
        )}

        {/* Student routes */}
        {isAuthenticated && user?.role === UserRole.STUDENT && (
          <Route path="/student/*" element={
            <DashboardLayout>
              <StudentDashboard />
            </DashboardLayout>
          } />
        )}

        {/* Family routes */}
        {isAuthenticated && user?.role === UserRole.FAMILY && (
          <Route path="/family/*" element={
            <DashboardLayout>
              <FamilyDashboard />
            </DashboardLayout>
          } />
        )}

        {/* Root redirect */}
        <Route path="/" element={
          isAuthenticated ? 
            <Navigate to={getDashboardPath(user?.role!)} replace /> : 
            <Navigate to="/login" replace />
        } />

        {/* Fallback */}
        <Route path="*" element={
          isAuthenticated ? (
            <div style={{ padding: '20px', backgroundColor: '#ffaaaa' }}>
              <h1>PÁGINA NO ENCONTRADA</h1>
              <p>Usuario: {user?.role}</p>
              <p>Ruta actual: {window.location.pathname}</p>
              <button onClick={() => window.location.href = getDashboardPath(user?.role!)}>
                Ir al Dashboard
              </button>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </AntdApp>
  )
}

export default App