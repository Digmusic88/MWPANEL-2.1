import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, LoginRequest, LoginResponse } from '@/types/user'
import { authService } from '@services/authService'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  refreshAuth: () => Promise<void>
  setUser: (user: User) => void
  checkAuth: () => Promise<void>
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,

      // Actions
      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true })
          
          const response: LoginResponse = await authService.login(credentials)
          
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        const { refreshToken } = get()
        
        // Clear auth data
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        })

        // Call logout API to invalidate tokens
        authService.logout(refreshToken || undefined).catch((error) => {
          // Don't log 401 errors during logout (token expired is expected)
          if (error?.response?.status !== 401) {
            console.error('Logout error:', error)
          }
        })
      },

      refreshAuth: async () => {
        try {
          const { refreshToken } = get()
          
          if (!refreshToken) {
            throw new Error('No refresh token available')
          }

          const response = await authService.refreshToken(refreshToken)
          
          set({
            accessToken: response.accessToken,
          })
        } catch (error) {
          // If refresh fails, logout user
          get().logout()
          throw error
        }
      },

      setUser: (user: User) => {
        set({ user })
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true })
          
          const { accessToken, refreshToken } = get()
          
          if (!accessToken || !refreshToken) {
            set({ isLoading: false })
            return
          }

          // Verify token is still valid
          const user = await authService.getCurrentUser()
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          // Token invalid, try to refresh
          try {
            await get().refreshAuth()
            await get().checkAuth()
          } catch (refreshError) {
            get().logout()
          }
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'mw-panel-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Initialize auth check when store is created
useAuthStore.getState().checkAuth()