import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, Space, Alert } from 'antd'
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons'
import { useAuthStore } from '@store/authStore'
import { LoginRequest } from '@/types/user'

const { Title, Text } = Typography

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuthStore()

  const onFinish = async (values: LoginRequest) => {
    try {
      setLoading(true)
      setError(null)
      await login(values)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">MW</span>
          </div>
          <Title level={2} className="!mb-2 !text-gray-800">
            MW Panel
          </Title>
          <Text className="text-gray-600">
            Sistema de Gestión Escolar
          </Text>
        </div>

        {/* Login Form */}
        <Card 
          className="shadow-xl border-0"
          style={{ borderRadius: '16px' }}
        >
          <Space direction="vertical" size="large" className="w-full">
            <div className="text-center">
              <Title level={4} className="!mb-1">
                Iniciar Sesión
              </Title>
              <Text type="secondary">
                Accede a tu cuenta
              </Text>
            </div>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
              />
            )}

            <Form
              name="login"
              onFinish={onFinish}
              autoComplete="off"
              size="large"
              layout="vertical"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Por favor ingresa tu email' },
                  { type: 'email', message: 'Ingresa un email válido' },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Email"
                  autoComplete="email"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Por favor ingresa tu contraseña' },
                  { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Contraseña"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item className="!mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<LoginOutlined />}
                  className="w-full h-12 text-base font-medium"
                  style={{ borderRadius: '8px' }}
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </Form.Item>
            </Form>

            {/* Demo Credentials */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <Text className="text-sm text-gray-600 block mb-2">
                <strong>Credenciales de prueba:</strong>
              </Text>
              <Space direction="vertical" size="small" className="text-xs text-gray-600">
                <div>👨‍💼 Admin: admin@mwpanel.com / Admin123!</div>
                <div>👨‍🏫 Profesor: profesor@mwpanel.com / Profesor123!</div>
                <div>👨‍🎓 Estudiante: estudiante@mwpanel.com / Estudiante123!</div>
                <div>👨‍👩‍👧‍👦 Familia: familia@mwpanel.com / Familia123!</div>
              </Space>
            </div>
          </Space>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <Text type="secondary" className="text-sm">
            © 2024 MW Panel. Todos los derechos reservados.
          </Text>
        </div>
      </div>
    </div>
  )
}

export default LoginPage