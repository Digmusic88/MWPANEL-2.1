import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, App as AntApp } from 'antd'
import esES from 'antd/locale/es_ES'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import './index.css'
import './styles/responsive.css'
import App from './App'

// Configure dayjs
dayjs.locale('es')

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

// Ant Design theme configuration with responsive considerations
const theme = {
  token: {
    colorPrimary: '#2563eb',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#3b82f6',
    borderRadius: 8,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    // Mobile-friendly sizing
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 32,
    // Responsive padding
    paddingXS: 8,
    paddingSM: 12,
    padding: 16,
    paddingLG: 24,
    paddingXL: 32,
  },
  components: {
    Layout: {
      bodyBg: '#f8fafc',
      headerBg: '#ffffff',
      siderBg: '#ffffff',
    },
    Menu: {
      itemBg: 'transparent',
      subMenuItemBg: 'transparent',
      itemHeight: 48, // Touch-friendly menu items
      itemPaddingInline: 16,
    },
    Button: {
      controlHeight: 36,
      controlHeightLG: 44,
      paddingInline: 16,
    },
    Input: {
      controlHeight: 36,
      paddingInline: 12,
    },
    Select: {
      controlHeight: 36,
    },
    Card: {
      paddingLG: 16, // Responsive card padding
    },
    Table: {
      cellPaddingBlock: 12,
      cellPaddingInline: 8,
    },
    Modal: {
      contentBg: '#ffffff',
    },
  },
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter 
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ConfigProvider 
          locale={esES}
          theme={theme}
        >
          <AntApp>
            <App />
          </AntApp>
        </ConfigProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)