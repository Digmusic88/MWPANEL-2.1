import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'antd'

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (Zustand persist)
    const authData = localStorage.getItem('mw-panel-auth')
    
    if (authData) {
      try {
        const { state } = JSON.parse(authData)
        const { accessToken } = state
        
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`
        }
      } catch (error) {
        console.warn('Failed to parse auth data from localStorage:', error)
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Try to refresh token
        const authData = localStorage.getItem('mw-panel-auth')
        
        if (authData) {
          const { state } = JSON.parse(authData)
          const { refreshToken } = state
          
          if (refreshToken) {
            const response = await axios.post(
              `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/refresh`,
              { refreshToken }
            )
            
            const { accessToken } = response.data
            
            // Update localStorage
            const updatedState = { ...state, accessToken }
            localStorage.setItem('mw-panel-auth', JSON.stringify({ state: updatedState }))
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return apiClient(originalRequest)
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear auth data and redirect to login
        localStorage.removeItem('mw-panel-auth')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    // Handle different error types
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          message.error(data.message || 'Solicitud incorrecta')
          break
        case 401:
          message.error('No autorizado')
          break
        case 403:
          message.error('Sin permisos suficientes')
          break
        case 404:
          message.error('Recurso no encontrado')
          break
        case 422:
          // Validation errors
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach((err: any) => {
              message.error(err.message || err)
            })
          } else {
            message.error(data.message || 'Error de validación')
          }
          break
        case 500:
          message.error('Error interno del servidor')
          break
        default:
          message.error(data.message || 'Ha ocurrido un error')
      }
    } else if (error.request) {
      message.error('Error de conexión. Verifica tu conexión a internet.')
    } else {
      message.error('Ha ocurrido un error inesperado')
    }
    
    return Promise.reject(error)
  }
)

export default apiClient