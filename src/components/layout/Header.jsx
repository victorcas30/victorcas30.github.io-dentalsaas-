'use client'

import { useState } from 'react'

export default function Header({ onToggleSidebar }) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.setAttribute('data-bs-theme', isDarkMode ? 'light' : 'dark')
  }

  return (
    <header className="topbar rounded-0 border-0 bg-primary">
      <div className="with-vertical">
        <nav className="navbar navbar-expand-lg px-lg-0 px-3 py-0">
          {/* Botón de toggle sidebar */}
          <ul className="navbar-nav">
            <li className="nav-item">
              <a 
                className="nav-link nav-icon-hover sidebartoggler text-white" 
                onClick={onToggleSidebar}
                style={{cursor: 'pointer'}}
              >
                <i className="ti ti-menu-2 fs-7"></i>
              </a>
            </li>

            {/* Buscar */}
            <li className="nav-item d-none d-lg-block">
              <a className="nav-link text-white" href="#" data-bs-toggle="modal">
                <i className="ti ti-search fs-6"></i>
              </a>
            </li>
          </ul>

          {/* Menú derecho */}
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav flex-row ms-auto align-items-center justify-content-center">
              
              {/* Dark Mode Toggle */}
              <li className="nav-item">
                <a 
                  className="nav-link nav-icon-hover text-white" 
                  onClick={toggleDarkMode}
                  style={{cursor: 'pointer'}}
                >
                  <i className={`ti ti-${isDarkMode ? 'sun' : 'moon'} fs-6`}></i>
                </a>
              </li>

              {/* Notificaciones */}
              <li className="nav-item dropdown d-none d-lg-block">
                <a 
                  className="nav-link nav-icon-hover text-white position-relative" 
                  href="#" 
                  id="notificationDropdown" 
                  data-bs-toggle="dropdown"
                >
                  <i className="ti ti-bell fs-6"></i>
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    3
                  </span>
                </a>
                <div className="dropdown-menu dropdown-menu-end" aria-labelledby="notificationDropdown">
                  <div className="p-3">
                    <h6>Notificaciones</h6>
                  </div>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href="#">
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <h6 className="mb-1">Nueva cita programada</h6>
                        <span className="text-muted small">Hace 5 minutos</span>
                      </div>
                    </div>
                  </a>
                </div>
              </li>

              {/* Mensajes */}
              <li className="nav-item dropdown d-none d-lg-block">
                <a 
                  className="nav-link nav-icon-hover text-white position-relative" 
                  href="#" 
                  id="messageDropdown" 
                  data-bs-toggle="dropdown"
                >
                  <i className="ti ti-message fs-6"></i>
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-info">
                    5
                  </span>
                </a>
                <div className="dropdown-menu dropdown-menu-end" aria-labelledby="messageDropdown">
                  <div className="p-3">
                    <h6>Mensajes</h6>
                  </div>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href="#">
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <h6 className="mb-1">Paciente: María García</h6>
                        <span className="text-muted small">Consulta sobre cita</span>
                      </div>
                    </div>
                  </a>
                </div>
              </li>

              {/* Perfil de Usuario */}
              <li className="nav-item dropdown">
                <a 
                  className="nav-link nav-icon-hover text-white" 
                  href="#" 
                  id="userDropdown" 
                  data-bs-toggle="dropdown"
                >
                  <img 
                    src="/assets/images/profile/user-1.jpg" 
                    alt="user" 
                    className="rounded-circle" 
                    width="35" 
                    height="35"
                    style={{objectFit: 'cover'}}
                  />
                </a>
                <div className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <div className="p-3 border-bottom">
                    <h6 className="mb-0">Dr. Juan Pérez</h6>
                    <span className="text-muted small">admin@dentalsaas.com</span>
                  </div>
                  <a className="dropdown-item" href="/perfil">
                    <i className="ti ti-user me-2"></i>
                    Mi Perfil
                  </a>
                  <a className="dropdown-item" href="/configuracion">
                    <i className="ti ti-settings me-2"></i>
                    Configuración
                  </a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item text-danger" href="/logout">
                    <i className="ti ti-logout me-2"></i>
                    Cerrar Sesión
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  )
}
