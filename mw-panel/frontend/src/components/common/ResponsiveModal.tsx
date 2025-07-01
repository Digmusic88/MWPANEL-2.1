import React from 'react'
import { Modal, Drawer } from 'antd'
import { ModalProps } from 'antd/es/modal'
import { DrawerProps } from 'antd/es/drawer'
import { useResponsive } from '../../hooks/useResponsive'

interface ResponsiveModalProps extends Omit<ModalProps, 'width'> {
  // Props específicas para responsive
  mobileAsDrawer?: boolean
  mobileWidth?: string | number
  tabletWidth?: string | number
  desktopWidth?: string | number
  
  // Props adicionales para drawer en mobile
  drawerPlacement?: DrawerProps['placement']
  drawerProps?: Partial<DrawerProps>
}

const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  mobileAsDrawer = true,
  mobileWidth = '100%',
  tabletWidth = '90%',
  desktopWidth = 520,
  drawerPlacement = 'bottom',
  drawerProps,
  children,
  ...modalProps
}) => {
  const { isMobile, isTablet } = useResponsive()

  // Función para determinar el ancho según el dispositivo
  const getResponsiveWidth = () => {
    if (isMobile) return mobileWidth
    if (isTablet) return tabletWidth
    return desktopWidth
  }

  // Si es mobile y se debe mostrar como drawer
  if (isMobile && mobileAsDrawer) {
    const combinedDrawerProps: DrawerProps = {
      placement: drawerPlacement,
      height: drawerPlacement === 'bottom' ? '90%' : undefined,
      width: drawerPlacement === 'left' || drawerPlacement === 'right' ? mobileWidth : undefined,
      ...drawerProps,
      title: modalProps.title,
      open: modalProps.open,
      onClose: modalProps.onCancel,
      closable: true,
      destroyOnClose: modalProps.destroyOnClose,
    }

    return (
      <Drawer {...combinedDrawerProps}>
        {children}
      </Drawer>
    )
  }

  // Modal normal con ancho responsive
  const responsiveModalProps: ModalProps = {
    ...modalProps,
    width: getResponsiveWidth(),
    centered: isMobile || isTablet,
    style: {
      top: isMobile ? 20 : undefined,
      maxHeight: isMobile ? '90vh' : undefined,
      ...modalProps.style,
    },
    styles: {
      body: {
        maxHeight: isMobile ? '70vh' : '60vh',
        overflowY: 'auto',
        ...modalProps.styles?.body,
      },
    },
  }

  return (
    <Modal {...responsiveModalProps}>
      {children}
    </Modal>
  )
}

export default ResponsiveModal

// Hook para configurar props de modal responsive
export const useResponsiveModalProps = (baseProps: Partial<ResponsiveModalProps> = {}) => {
  const { isMobile, isTablet } = useResponsive()

  return {
    ...baseProps,
    width: isMobile ? '95%' : isTablet ? '80%' : baseProps.desktopWidth || 520,
    centered: isMobile || isTablet,
    style: {
      top: isMobile ? 20 : undefined,
      ...baseProps.style,
    },
    bodyStyle: {
      maxHeight: isMobile ? '70vh' : '60vh',
      overflowY: 'auto' as const,
      ...baseProps.bodyStyle,
    },
  }
}