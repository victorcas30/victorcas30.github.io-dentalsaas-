'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { buildAssetPath } from '@/config/api'

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname()

  return (
    <>
      <aside className={`left-sidebar with-vertical ${isOpen ? 'show-sidebar' : ''}`}>
        <div>
          {/* Logo */}
          <div className="brand-logo d-flex align-items-center justify-content-between px-4 py-3">
            <Link href="/" className="text-nowrap logo-img d-flex align-items-center">
              <span style={{fontSize: '30px', marginRight: '10px'}}>🦷</span>
              <h4 className="fw-bold text-primary m-0 hide-menu">DentalSaaS</h4>
            </Link>
            <div className="close-btn d-lg-none d-block sidebartoggler cursor-pointer" 
                 onClick={onClose}>
              <i className="ti ti-x fs-6"></i>
            </div>
          </div>

          {/* Sidebar scroll */}
          <nav className="sidebar-nav scroll-sidebar" data-simplebar="">
            {/* User Profile */}
            <div className="user-profile position-relative" 
                 style={{
                   background: 'linear-gradient(135deg, #1B84FF 0%, #43CED7 100%)',
                   padding: '25px 20px',
                   textAlign: 'center',
                   borderRadius: '0 0 12px 12px',
                   margin: '15px'
                 }}>
              <div className="profile-img mb-2">
                <img src={buildAssetPath('/assets/images/profile/user-1.jpg')} 
                     alt="user" 
                     className="rounded-circle" 
                     style={{width: '60px', height: '60px', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)'}} />
              </div>
              <div className="profile-text hide-menu">
                <a href="#" className="text-white d-block fw-semibold">
                  Dr. Juan Pérez
                </a>
                <small className="text-white-50">Administrador</small>
              </div>
            </div>

            {/* Sidebar Menu */}
            <ul id="sidebarnav" className="px-3">
              {/* Dashboard */}
              <li className="nav-small-cap">
                <i className="ti ti-dots nav-small-cap-icon fs-4"></i>
                <span className="hide-menu">Principal</span>
              </li>
              <li className="sidebar-item">
                <Link 
                  className={`sidebar-link ${pathname === '/' ? 'active' : ''}`}
                  href="/"
                >
                  <span className="d-flex">
                    <i className="ti ti-layout-dashboard"></i>
                  </span>
                  <span className="hide-menu">Dashboard</span>
                </Link>
              </li>

              {/* Gestión */}
              <li className="nav-small-cap">
                <i className="ti ti-dots nav-small-cap-icon fs-4"></i>
                <span className="hide-menu">Gestión</span>
              </li>
              <li className="sidebar-item">
                <Link 
                  className={`sidebar-link ${pathname === '/pacientes' ? 'active' : ''}`}
                  href="/pacientes"
                >
                  <span className="d-flex">
                    <i className="ti ti-users"></i>
                  </span>
                  <span className="hide-menu">Pacientes</span>
                </Link>
              </li>
              <li className="sidebar-item">
                <Link 
                  className={`sidebar-link ${pathname === '/citas' ? 'active' : ''}`}
                  href="/citas"
                >
                  <span className="d-flex">
                    <i className="ti ti-calendar"></i>
                  </span>
                  <span className="hide-menu">Citas</span>
                </Link>
              </li>
              <li className="sidebar-item">
                <Link 
                  className={`sidebar-link ${pathname === '/tratamientos' ? 'active' : ''}`}
                  href="/tratamientos"
                >
                  <span className="d-flex">
                    <i className="ti ti-dental"></i>
                  </span>
                  <span className="hide-menu">Tratamientos</span>
                </Link>
              </li>
              <li className="sidebar-item">
                <Link 
                  className={`sidebar-link ${pathname === '/facturacion' ? 'active' : ''}`}
                  href="/facturacion"
                >
                  <span className="d-flex">
                    <i className="ti ti-file-invoice"></i>
                  </span>
                  <span className="hide-menu">Facturación</span>
                </Link>
              </li>

              {/* Sistema */}
              <li className="nav-small-cap">
                <i className="ti ti-dots nav-small-cap-icon fs-4"></i>
                <span className="hide-menu">Sistema</span>
              </li>
              <li className="sidebar-item">
                <Link 
                  className={`sidebar-link ${pathname === '/configuracion' ? 'active' : ''}`}
                  href="/configuracion"
                >
                  <span className="d-flex">
                    <i className="ti ti-settings"></i>
                  </span>
                  <span className="hide-menu">Configuración</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}
