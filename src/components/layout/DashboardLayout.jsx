'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detectar si es móvil
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992) // Bootstrap lg breakpoint
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div id="main-wrapper" className={!sidebarOpen && !isMobile ? 'mini-sidebar' : ''}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Page Wrapper */}
      <div className="page-wrapper">
        {/* Header */}
        <Header onToggleSidebar={toggleSidebar} />

        {/* Body */}
        <div className="body-wrapper">
          <div className="container-fluid">
            {children}
          </div>
        </div>
      </div>

      {/* Dark overlay cuando sidebar está abierto en móvil */}
      {sidebarOpen && isMobile && (
        <div 
          className="dark-transparent sidebartoggler"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  )
}
