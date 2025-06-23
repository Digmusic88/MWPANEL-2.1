import React from 'react'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const LoadingPage: React.FC = () => {
  const antIcon = <LoadingOutlined style={{ fontSize: 48, color: '#2563eb' }} spin />

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <Spin indicator={antIcon} />
        <div className="mt-8">
          <div className="w-16 h-16 mx-auto mb-4">
            <img
              src="/logo.svg"
              alt="Mundo World School"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Mundo World School</h1>
          <p className="text-gray-600">Cargando plataforma de gestión educativa...</p>
        </div>
      </div>
    </div>
  )
}

export default LoadingPage