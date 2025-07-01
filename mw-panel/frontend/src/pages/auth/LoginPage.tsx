import React, { useState } from 'react'
import { Form, Input, Button, Typography, Alert } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import { useAuthStore } from '@store/authStore'
import { LoginRequest } from '@/types/user'
import SplitText from '@/components/animations/SplitText'
import FadeInUp from '@/components/animations/FadeInUp'

const { Text } = Typography

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Aurora Background Effect */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Aurora Layers */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 800px 400px at 0% 0%, rgba(72, 158, 157, 0.18) 0%, transparent 50%),
              radial-gradient(ellipse 600px 300px at 100% 100%, rgba(197, 221, 195, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 400px 200px at 50% 50%, rgba(72, 158, 157, 0.12) 0%, transparent 50%)
            `
          }}
          animate={{
            background: [
              `radial-gradient(ellipse 800px 400px at 0% 0%, rgba(72, 158, 157, 0.18) 0%, transparent 50%),
               radial-gradient(ellipse 600px 300px at 100% 100%, rgba(197, 221, 195, 0.15) 0%, transparent 50%),
               radial-gradient(ellipse 400px 200px at 50% 50%, rgba(72, 158, 157, 0.12) 0%, transparent 50%)`,
              `radial-gradient(ellipse 800px 400px at 30% 10%, rgba(72, 158, 157, 0.22) 0%, transparent 50%),
               radial-gradient(ellipse 600px 300px at 70% 90%, rgba(197, 221, 195, 0.18) 0%, transparent 50%),
               radial-gradient(ellipse 400px 200px at 20% 70%, rgba(72, 158, 157, 0.16) 0%, transparent 50%)`,
              `radial-gradient(ellipse 800px 400px at 60% 20%, rgba(72, 158, 157, 0.18) 0%, transparent 50%),
               radial-gradient(ellipse 600px 300px at 40% 80%, rgba(197, 221, 195, 0.15) 0%, transparent 50%),
               radial-gradient(ellipse 400px 200px at 80% 40%, rgba(72, 158, 157, 0.12) 0%, transparent 50%)`,
              `radial-gradient(ellipse 800px 400px at 0% 0%, rgba(72, 158, 157, 0.18) 0%, transparent 50%),
               radial-gradient(ellipse 600px 300px at 100% 100%, rgba(197, 221, 195, 0.15) 0%, transparent 50%),
               radial-gradient(ellipse 400px 200px at 50% 50%, rgba(72, 158, 157, 0.12) 0%, transparent 50%)`
            ]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Aurora Particles */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full opacity-40"
          style={{ backgroundColor: '#489e9d' }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/3 w-1 h-1 rounded-full opacity-50"
          style={{ backgroundColor: '#c5ddc3' }}
          animate={{
            x: [0, -80, 0],
            y: [0, 30, 0],
            opacity: [0.5, 1, 0.5],
            scale: [1, 2, 1]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 w-1.5 h-1.5 rounded-full opacity-60"
          style={{ backgroundColor: '#489e9d' }}
          animate={{
            x: [0, -60, 0],
            y: [0, -80, 0],
            opacity: [0.6, 0.9, 0.6],
            scale: [1, 1.8, 1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Animated Orbs */}
        <motion.div
          className="absolute -top-4 -right-4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: `linear-gradient(135deg, rgba(72, 158, 157, 0.2) 0%, rgba(197, 221, 195, 0.15) 100%)`
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-4 -left-4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: `linear-gradient(315deg, rgba(197, 221, 195, 0.2) 0%, rgba(72, 158, 157, 0.18) 100%)`
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Brand */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-6 flex items-center justify-center relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <img
              src="/logo.svg"
              alt="Mundo World School"
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </motion.div>
          
          <motion.h1 
            className="text-4xl font-bold bg-clip-text text-transparent mb-2"
            style={{
              background: `linear-gradient(90deg, #489e9d 0%, #2d5a3d 50%, #489e9d 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <SplitText 
              text="Mundo World School" 
              variant="slideUp" 
              delay={0.4}
              stagger={0.05}
            />
          </motion.h1>
          
          <FadeInUp delay={0.8} className="text-slate-600 text-lg font-medium">
            Plataforma de Gestión Educativa
          </FadeInUp>
        </motion.div>

        {/* Login Form Card */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-blue-500/10"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        >
          <FadeInUp delay={0.7} className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Iniciar Sesión
            </h2>
            <Text className="text-slate-600">
              Accede a tu plataforma educativa
            </Text>
          </FadeInUp>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6"
            >
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
                className="rounded-xl border-0"
              />
            </motion.div>
          )}

          <FadeInUp delay={0.9}>
            <Form
              name="login"
              onFinish={onFinish}
              autoComplete="off"
              size="large"
              layout="vertical"
              className="space-y-6"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Por favor ingresa tu email' },
                  { type: 'email', message: 'Ingresa un email válido' },
                ]}
                className="mb-0"
              >
                <motion.div whileFocus={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Input
                    prefix={<UserOutlined className="text-slate-400" />}
                    placeholder="Correo electrónico"
                    autoComplete="email"
                    className="h-14 rounded-xl border-slate-200 focus:border-blue-500 focus:shadow-lg transition-all duration-300"
                  />
                </motion.div>
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Por favor ingresa tu contraseña' },
                  { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
                ]}
                className="mb-0"
              >
                <motion.div whileFocus={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Input.Password
                    prefix={<LockOutlined className="text-slate-400" />}
                    placeholder="Contraseña"
                    autoComplete="current-password"
                    className="h-14 rounded-xl border-slate-200 focus:border-blue-500 focus:shadow-lg transition-all duration-300"
                  />
                </motion.div>
              </Form.Item>

              <Form.Item className="!mb-0 !mt-8">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="w-full h-14 text-base font-semibold rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    style={{
                      background: '#c5ddc3',
                      color: '#2d5a3d',
                      borderColor: '#c5ddc3'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#489e9d';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#c5ddc3';
                      e.currentTarget.style.color = '#2d5a3d';
                    }}
                  >
                    {loading ? (
                      <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        Iniciando sesión...
                      </motion.span>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </Button>
                </motion.div>
              </Form.Item>
            </Form>
          </FadeInUp>

        </motion.div>

        {/* Footer */}
        <FadeInUp delay={1.3} className="text-center mt-8">
          <motion.p 
            className="text-slate-500 text-sm"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            © 2024 Mundo World School. Todos los derechos reservados.
          </motion.p>
        </FadeInUp>
      </div>
    </div>
  )
}

export default LoginPage