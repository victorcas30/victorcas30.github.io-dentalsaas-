'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { authService } from '@/services/authService'
import { getModuloIcon, getRutaIcon } from '@/utils/menuIcons'

export default function HorizontalSidebar() {
  const pathname = usePathname()
  const [modulos, setModulos] = useState([])
  const [openMenu, setOpenMenu] = useState(null)

  useEffect(() => {
    const userModulos = authService.getModulos()
    setModulos(userModulos)
    console.log('📦 MÓDULOS:', userModulos)
  }, [])

  return (
    <div className="d-none d-xl-block" style={{
      position: 'sticky',
      top: 0,
      zIndex: 90,
      background: 'white',
      borderBottom: '1px solid #ebf1f6',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <div style={{
        display: 'flex',
        padding: '0 20px',
        gap: '5px',
        alignItems: 'center'
      }}>
        
        {/* Dashboard */}
        <Link 
          href="/"
          style={{
            padding: '15px 20px',
            textDecoration: 'none',
            color: pathname === '/' ? '#1B84FF' : '#768B9E',
            borderBottom: pathname === '/' ? '3px solid #1B84FF' : '3px solid transparent',
            fontWeight: pathname === '/' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <i className="ti ti-layout-dashboard" style={{fontSize: '18px'}}></i>
          Dashboard
        </Link>

        {/* Módulos dinámicos de la API */}
        {modulos.map((modulo) => (
          <div 
            key={modulo.id_modulo}
            style={{ position: 'relative' }}
            onMouseEnter={() => {
              console.log('✅ HOVER EN:', modulo.modulo)
              setOpenMenu(modulo.id_modulo)
            }}
            onMouseLeave={() => {
              console.log('❌ SALIÓ DE:', modulo.modulo)
              setTimeout(() => setOpenMenu(null), 100)
            }}
          >
            <button
              onClick={() => setOpenMenu(openMenu === modulo.id_modulo ? null : modulo.id_modulo)}
              style={{
                padding: '15px 20px',
                background: 'none',
                border: 'none',
                borderBottom: openMenu === modulo.id_modulo ? '3px solid #1B84FF' : '3px solid transparent',
                color: openMenu === modulo.id_modulo ? '#1B84FF' : '#768B9E',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: openMenu === modulo.id_modulo ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <i className={getModuloIcon(modulo.modulo)} style={{fontSize: '18px'}}></i>
              {modulo.modulo}
              <i 
                className="ti ti-chevron-down" 
                style={{
                  fontSize: '14px',
                  transform: openMenu === modulo.id_modulo ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}
              ></i>
            </button>

            {/* DROPDOWN */}
            {openMenu === modulo.id_modulo && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: 'white',
                border: '1px solid #ebf1f6',
                borderRadius: '8px',
                boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
                minWidth: '280px',
                padding: '8px 0',
                zIndex: 50,
                marginTop: '0px',
                animation: 'fadeIn 0.2s ease'
              }}>
                {modulo.rutas && modulo.rutas.length > 0 ? (
                  modulo.rutas.map((ruta) => (
                    <Link
                      key={ruta.id_ruta}
                      href={ruta.path}
                      onClick={() => setOpenMenu(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 20px',
                        color: pathname === ruta.path ? '#1B84FF' : '#768B9E',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        background: pathname === ruta.path ? 'rgba(27, 132, 255, 0.1)' : 'transparent',
                        fontWeight: pathname === ruta.path ? 600 : 400
                      }}
                      onMouseEnter={(e) => {
                        if (pathname !== ruta.path) {
                          e.currentTarget.style.background = '#f8f9fa'
                          e.currentTarget.style.paddingLeft = '25px'
                          e.currentTarget.style.color = '#1B84FF'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (pathname !== ruta.path) {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.paddingLeft = '20px'
                          e.currentTarget.style.color = '#768B9E'
                        }
                      }}
                    >
                      <i className={getRutaIcon(ruta.nombre)} style={{fontSize: '18px'}}></i>
                      {ruta.nombre}
                    </Link>
                  ))
                ) : (
                  <div style={{ padding: '12px 20px', color: '#999' }}>
                    Sin rutas disponibles
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Mensaje si no hay módulos */}
        {modulos.length === 0 && (
          <div style={{
            padding: '15px 20px',
            color: '#999',
            fontStyle: 'italic',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="ti ti-alert-circle"></i>
            No hay módulos cargados. Haz login primero.
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

