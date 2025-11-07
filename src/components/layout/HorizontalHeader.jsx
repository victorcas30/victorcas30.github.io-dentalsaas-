'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { authService } from '@/services/authService'
import { buildAssetPath } from '@/config/api'
import Swal from 'sweetalert2'

export default function HorizontalHeader({ onToggleSidebar, usuario }) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [modulos, setModulos] = useState([])
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    // Obtener módulos del usuario
    const userModulos = authService.getModulos()
    setModulos(userModulos)
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.setAttribute('data-bs-theme', isDarkMode ? 'light' : 'dark')
  }

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      
      // Mostrar alerta estética de loading
      Swal.fire({
        title: '<strong>Cerrando sesión</strong>',
        html: `
          <div style="padding: 20px 0;">
            <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mb-0 text-muted">Invalidando tu sesión de forma segura...</p>
          </div>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        background: '#fff',
        customClass: {
          popup: 'rounded-4 shadow-lg',
          title: 'text-primary'
        }
      })

      await authService.logout()
      
      // El logout redirige automáticamente, pero por si acaso:
      Swal.close()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      setLoggingOut(false)
      
      Swal.fire({
        icon: 'error',
        title: '<strong>Error al cerrar sesión</strong>',
        html: `<p class="mb-0">${error.message || 'Ocurrió un error inesperado'}</p>`,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#5d87ff',
        customClass: {
          popup: 'rounded-4 shadow-lg',
          confirmButton: 'btn btn-primary rounded-pill px-4'
        }
      })
    }
  }

  const handleLogoutAll = async () => {
    const result = await Swal.fire({
      title: '<strong>¿Cerrar todas las sesiones?</strong>',
      html: `
        <div style="padding: 10px 0;">
          <p class="mb-3">Se cerrarán tus sesiones activas en todos los dispositivos:</p>
          <div class="d-flex flex-wrap justify-content-center gap-3 mb-3">
            <div class="text-center" style="min-width: 80px;">
              <div class="bg-primary-subtle rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                <i class="ti ti-device-laptop" style="font-size: 24px; color: #5d87ff;"></i>
              </div>
              <small class="d-block mt-2 text-muted">Computadoras</small>
            </div>
            <div class="text-center" style="min-width: 80px;">
              <div class="bg-info-subtle rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                <i class="ti ti-device-tablet" style="font-size: 24px; color: #49beff;"></i>
              </div>
              <small class="d-block mt-2 text-muted">Tablets</small>
            </div>
            <div class="text-center" style="min-width: 80px;">
              <div class="bg-success-subtle rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                <i class="ti ti-device-mobile" style="font-size: 24px; color: #13deb9;"></i>
              </div>
              <small class="d-block mt-2 text-muted">Móviles</small>
            </div>
          </div>
          <p class="text-muted small mb-0">Esta acción no se puede deshacer</p>
        </div>
      `,
      icon: 'warning',
      iconColor: '#fa896b',
      showCancelButton: true,
      confirmButtonColor: '#fa896b',
      cancelButtonColor: '#5d87ff',
      confirmButtonText: '<i class="ti ti-device-mobile-off me-2"></i>Sí, cerrar todas',
      cancelButtonText: '<i class="ti ti-x me-2"></i>Cancelar',
      focusCancel: true,
      customClass: {
        popup: 'rounded-4 shadow-lg',
        confirmButton: 'btn rounded-pill px-4',
        cancelButton: 'btn rounded-pill px-4'
      },
      buttonsStyling: true
    })

    if (result.isConfirmed) {
      try {
        setLoggingOut(true)
        
        // Mostrar alerta estética de loading
        Swal.fire({
          title: '<strong>Cerrando todas las sesiones</strong>',
          html: `
            <div style="padding: 20px 0;">
              <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="mb-2">Esto puede tomar unos segundos</p>
              <small class="text-muted">Invalidando tokens en todos tus dispositivos...</small>
            </div>
          `,
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-4 shadow-lg',
            title: 'text-primary'
          }
        })

        await authService.logoutAll()
        
        // Mostrar éxito con animación
        await Swal.fire({
          icon: 'success',
          title: '<strong>¡Sesiones cerradas!</strong>',
          html: '<p class="mb-0">Todas tus sesiones han sido cerradas exitosamente</p>',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-4 shadow-lg',
            title: 'text-success'
          }
        })
        
        // El logoutAll redirige automáticamente
      } catch (error) {
        console.error('Error al cerrar todas las sesiones:', error)
        setLoggingOut(false)
        
        Swal.fire({
          icon: 'error',
          title: '<strong>Error al cerrar sesiones</strong>',
          html: `<p class="mb-2">${error.message || 'No se pudieron cerrar todas las sesiones'}</p><small class="text-muted">Intenta nuevamente en unos momentos</small>`,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#5d87ff',
          customClass: {
            popup: 'rounded-4 shadow-lg',
            confirmButton: 'btn btn-primary rounded-pill px-4'
          }
        })
      }
    }
  }

  return (
    <header className="topbar rounded-0 border-0">
      <div className="app-header with-horizontal">
        <nav className="navbar navbar-expand-xl navbar-light px-0">
          <div className="container-fluid px-lg-3">
            
            {/* Logo */}
            <Link href="/" className="text-nowrap navbar-brand d-flex align-items-center">
              <span style={{fontSize: '30px', marginRight: '10px'}}>🦷</span>
              <h4 className="fw-bold text-white m-0">DentalSaaS</h4>
            </Link>

            {/* Mobile Toggle - Solo visible en móvil */}
            <button
              className="navbar-toggler border-0 p-0 d-xl-none"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#mobilenavbar"
              aria-controls="mobilenavbar"
              disabled={loggingOut}
            >
              <i className="ti ti-menu-2 text-white fs-7"></i>
            </button>

            {/* Horizontal Menu - Solo visible en desktop */}
            <div className="collapse navbar-collapse justify-content-between d-none d-xl-flex" id="navbarNav">
              
              {/* Menu Items - se cargarán desde HorizontalSidebar */}
              <div></div>

              {/* Right Side Icons */}
              <ul className="navbar-nav flex-row ms-auto align-items-center">
                
                {/* Búsqueda - Desktop */}
                <li className="nav-item">
                  <a className="nav-link text-white" href="#" data-bs-toggle="modal">
                    <i className="ti ti-search fs-6"></i>
                  </a>
                </li>

                {/* Dark Mode Toggle - Desktop */}
                <li className="nav-item">
                  <a 
                    className="nav-link text-white" 
                    onClick={toggleDarkMode}
                    style={{cursor: 'pointer'}}
                  >
                    <i className={`ti ti-${isDarkMode ? 'sun' : 'moon'} fs-6`}></i>
                  </a>
                </li>

                {/* Notificaciones - Desktop */}
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link text-white position-relative" 
                    href="#" 
                    id="notificationDropdown" 
                    data-bs-toggle="dropdown"
                  >
                    <i className="ti ti-bell fs-6"></i>
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      3
                      <span className="visually-hidden">notificaciones</span>
                    </span>
                  </a>
                  <div className="dropdown-menu dropdown-menu-end dropdown-menu-animate-up" aria-labelledby="notificationDropdown" style={{zIndex: 100}}>
                    <div className="p-3 border-bottom">
                      <h6 className="mb-0">Notificaciones</h6>
                    </div>
                    <div className="message-body">
                      <a href="#" className="dropdown-item px-3 d-flex align-items-start gap-3 py-3">
                        <span className="flex-shrink-0 bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                          <i className="ti ti-calendar text-primary"></i>
                        </span>
                        <div className="w-75">
                          <h6 className="mb-1 fw-semibold">Nueva cita programada</h6>
                          <span className="fs-2 d-block text-muted">Hace 5 minutos</span>
                        </div>
                      </a>
                    </div>
                  </div>
                </li>

                {/* Mensajes - Desktop */}
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link text-white position-relative" 
                    href="#" 
                    id="messageDropdown" 
                    data-bs-toggle="dropdown"
                  >
                    <i className="ti ti-message fs-6"></i>
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-info">
                      5
                      <span className="visually-hidden">mensajes</span>
                    </span>
                  </a>
                  <div className="dropdown-menu dropdown-menu-end dropdown-menu-animate-up" aria-labelledby="messageDropdown" style={{zIndex: 100}}>
                    <div className="p-3 border-bottom">
                      <h6 className="mb-0">Mensajes</h6>
                    </div>
                    <div className="message-body">
                      <a href="#" className="dropdown-item px-3 d-flex align-items-start gap-3 py-3">
                        <span className="flex-shrink-0">
                          <img src={buildAssetPath('/assets/images/profile/user-1.jpg')} alt="user" className="rounded-circle" width="40" height="40" />
                        </span>
                        <div className="w-75">
                          <h6 className="mb-1 fw-semibold">María García</h6>
                          <span className="fs-2 d-block text-muted">Consulta sobre cita...</span>
                        </div>
                      </a>
                    </div>
                  </div>
                </li>

                {/* Perfil de Usuario - Desktop */}
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link text-white pe-0" 
                    href="#" 
                    id="userDropdown" 
                    data-bs-toggle="dropdown"
                    style={{
                      cursor: loggingOut ? 'not-allowed' : 'pointer',
                      opacity: loggingOut ? 0.6 : 1,
                      position: 'relative',
                      zIndex: 1050
                    }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <div className="position-relative">
                        <img 
                          src={buildAssetPath('/assets/images/profile/user-1.jpg')} 
                          alt="user" 
                          className="rounded-circle" 
                          width="35" 
                          height="35"
                          style={{objectFit: 'cover'}}
                        />
                        {loggingOut && (
                          <span 
                            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 rounded-circle"
                          >
                            <span className="spinner-border spinner-border-sm text-white" role="status">
                              <span className="visually-hidden">Cargando...</span>
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="d-none d-xl-block">
                        <span className="fw-semibold d-block" style={{fontSize: '14px'}}>
                          {usuario?.nombre || 'Usuario'}
                        </span>
                        <small className="text-white-50" style={{fontSize: '12px'}}>
                          {usuario?.rol || 'Rol'}
                        </small>
                      </div>
                      <i className="ti ti-chevron-down fs-4 d-none d-xl-block"></i>
                    </div>
                  </a>
                  <div className="dropdown-menu dropdown-menu-end dropdown-menu-animate-up" aria-labelledby="userDropdown" style={{zIndex: 9999}}>
                    <div className="p-3 border-bottom">
                      <h6 className="mb-0">{usuario?.nombre || 'Usuario'}</h6>
                      <span className="text-muted small">{usuario?.email || 'email@ejemplo.com'}</span>
                    </div>
                    <a className="dropdown-item" href="/perfil">
                      <i className="ti ti-user me-2 fs-5"></i>
                      Mi Perfil
                    </a>
                    <a className="dropdown-item" href="/configuracion">
                      <i className="ti ti-settings me-2 fs-5"></i>
                      Configuración
                    </a>
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item text-danger d-flex align-items-center" 
                      onClick={handleLogout}
                      disabled={loggingOut}
                      style={{
                        cursor: loggingOut ? 'not-allowed' : 'pointer',
                        opacity: loggingOut ? 0.6 : 1,
                        border: 'none',
                        background: 'none',
                        width: '100%',
                        textAlign: 'left'
                      }}
                    >
                      {loggingOut ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Cargando...</span>
                          </span>
                          Cerrando sesión...
                        </>
                      ) : (
                        <>
                          <i className="ti ti-logout me-2 fs-5"></i>
                          Cerrar Sesión
                        </>
                      )}
                    </button>
                    <button 
                      className="dropdown-item text-danger d-flex align-items-center" 
                      onClick={handleLogoutAll}
                      disabled={loggingOut}
                      style={{
                        cursor: loggingOut ? 'not-allowed' : 'pointer',
                        opacity: loggingOut ? 0.6 : 1,
                        border: 'none',
                        background: 'none',
                        width: '100%',
                        textAlign: 'left'
                      }}
                    >
                      {loggingOut ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Cargando...</span>
                          </span>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <i className="ti ti-device-mobile-off me-2 fs-5"></i>
                          Cerrar todas las sesiones
                        </>
                      )}
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>

      {/* Nota: El overlay de loading se maneja con SweetAlert para evitar duplicados */}

      {/* Mobile Offcanvas Menu */}
      <div 
        className="offcanvas offcanvas-start" 
        tabIndex="-1" 
        id="mobilenavbar"
        aria-labelledby="mobilenavbarLabel"
      >
        <div className="offcanvas-header">
          <Link href="/" className="text-nowrap d-flex align-items-center">
            <span style={{fontSize: '30px', marginRight: '10px'}}>🦷</span>
            <h4 className="fw-bold text-primary m-0">DentalSaaS</h4>
          </Link>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
            disabled={loggingOut}
          ></button>
        </div>
        <div className="offcanvas-body pt-0">
          {/* User Profile en móvil */}
          <div className="text-center border-bottom pb-3 mb-3">
            <div className="position-relative d-inline-block">
              <img 
                src={buildAssetPath('/assets/images/profile/user-1.jpg')} 
                alt="user" 
                className="rounded-circle mb-2" 
                width="60" 
                height="60"
                style={{objectFit: 'cover'}}
              />
              {loggingOut && (
                <span 
                  className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 rounded-circle"
                >
                  <span className="spinner-border spinner-border-sm text-white" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </span>
                </span>
              )}
            </div>
            <h6 className="mb-0">{usuario?.nombre || 'Usuario'}</h6>
            <small className="text-muted">{usuario?.rol || 'Rol'}</small>
          </div>

          {/* Mobile Navigation Dinámica */}
          <ul className="navbar-nav">
            {/* Dashboard */}
            <li className="nav-item">
              <Link className="nav-link" href="/">
                <i className="ti ti-layout-dashboard me-2"></i>
                Dashboard
              </Link>
            </li>

            {/* Módulos y Rutas Dinámicas */}
            {modulos.map((modulo) => (
              <div key={modulo.id_modulo}>
                {/* Título del Módulo */}
                <li className="nav-item mt-3">
                  <div className="text-muted text-uppercase small px-3 py-2 fw-semibold">
                    {modulo.modulo}
                  </div>
                </li>
                
                {/* Rutas del Módulo */}
                {modulo.rutas && modulo.rutas.map((ruta) => (
                  <li className="nav-item" key={ruta.id_ruta}>
                    <Link className="nav-link ps-4" href={ruta.path}>
                      <i className={getRutaIcon(ruta.nombre)} style={{marginRight: '8px'}}></i>
                      {ruta.nombre}
                    </Link>
                  </li>
                ))}
              </div>
            ))}

            {/* Logout */}
            <li className="nav-item border-top mt-3 pt-3">
              <button 
                className="nav-link text-danger w-100 text-start d-flex align-items-center"
                onClick={handleLogout}
                disabled={loggingOut}
                style={{
                  cursor: loggingOut ? 'not-allowed' : 'pointer',
                  opacity: loggingOut ? 0.6 : 1,
                  border: 'none',
                  background: 'none'
                }}
              >
                {loggingOut ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </span>
                    Cerrando sesión...
                  </>
                ) : (
                  <>
                    <i className="ti ti-logout me-2"></i>
                    Cerrar Sesión
                  </>
                )}
              </button>
            </li>
            <li className="nav-item">
              <button 
                className="nav-link text-danger w-100 text-start d-flex align-items-center"
                onClick={handleLogoutAll}
                disabled={loggingOut}
                style={{
                  cursor: loggingOut ? 'not-allowed' : 'pointer',
                  opacity: loggingOut ? 0.6 : 1,
                  border: 'none',
                  background: 'none'
                }}
              >
                {loggingOut ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </span>
                    Procesando...
                  </>
                ) : (
                  <>
                    <i className="ti ti-device-mobile-off me-2"></i>
                    Cerrar todas las sesiones
                  </>
                )}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}

// Función para obtener iconos según el nombre de la ruta
function getRutaIcon(nombreRuta) {
  const iconMap = {
    'Horarios': 'ti ti-clock',
    'Usuarios y permisos': 'ti ti-user-shield',
    'Plantillas de mensajes': 'ti ti-message',
    'Políticas de descuento': 'ti ti-discount',
    'Información de la clinica': 'ti ti-building-hospital'
  }
  
  return iconMap[nombreRuta] || 'ti ti-point'
}
