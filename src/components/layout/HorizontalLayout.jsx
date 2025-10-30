'use client'

import { useEffect, useState } from 'react'
import HorizontalHeader from './HorizontalHeader'
import HorizontalSidebar from './HorizontalSidebar'
import ProtectedRoute from '../ProtectedRoute'
import { authService } from '@/services/authService'
import { useTokenRefresh } from '@/hooks/useTokenRefresh'

export default function HorizontalLayout({ children }) {
  const [usuario, setUsuario] = useState(null)

  // Hook para refrescar el token automáticamente
  useTokenRefresh()

  useEffect(() => {
    // Obtener usuario actual
    const currentUser = authService.getCurrentUser()
    setUsuario(currentUser)
  }, [])

  return (
    <ProtectedRoute>
      <div id="main-wrapper" data-layout="horizontal">
        
        {/* Header con Logo y User */}
        <HorizontalHeader usuario={usuario} />

        {/* Horizontal Navigation Menu */}
        <HorizontalSidebar />

        {/* Page Wrapper */}
        <div className="page-wrapper-horizontal">
          {/* Body */}
          <div className="body-wrapper">
            <div className="container-fluid">
              {children}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
