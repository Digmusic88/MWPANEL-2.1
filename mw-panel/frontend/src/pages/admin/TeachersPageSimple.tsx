import React from 'react'
import { Typography } from 'antd'

const { Title } = Typography

const TeachersPageSimple: React.FC = () => {
  console.log('TeachersPageSimple rendering...')
  
  return (
    <div>
      <Title level={2}>Gestión de Profesores - Versión Simple</Title>
      <p>Esta es una versión simplificada para debuggear.</p>
      <p>Si ves este mensaje, el componente se está renderizando correctamente.</p>
    </div>
  )
}

export default TeachersPageSimple