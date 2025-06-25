import { apiClient } from './apiClient'
import { User, LoginRequest, LoginResponse, RefreshTokenResponse } from '@/types/user'

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials)
    return response.data
  },

  async logout(refreshToken?: string): Promise<void> {
    try {
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken })
      }
    } catch (error: any) {
      // Continue with logout even if API call fails
      // Don't show error for 401 (token expired) during logout
      if (error?.response?.status !== 401) {
        console.warn('Logout API call failed:', error)
      }
    }
  },

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    })
    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me')
    return response.data
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.patch<User>('/auth/profile', data)
    return response.data
  },

  async changePassword(data: {
    currentPassword: string
    newPassword: string
  }): Promise<void> {
    await apiClient.post('/auth/change-password', data)
  },

  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email })
  },

  async resetPassword(data: {
    token: string
    newPassword: string
  }): Promise<void> {
    await apiClient.post('/auth/reset-password', data)
  },
}