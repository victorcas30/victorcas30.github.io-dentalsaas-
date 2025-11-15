'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { authService } from '@/services/authService'
import { getModuloIcon, getRutaIcon } from '@/utils/menuIcons'

export default function HorizontalSidebar() {
  const pathname = usePathname()
  const [modulos, setModulos] = useState([])
  const [openMenu, setOpenMenu] = useState(null)
  const closeTimeoutRef = useRef(null)

  useEffect(() => {
    const userModulos = authService.getModulos()
    setModulos(userModulos)
  }, [])

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  const cancelCloseMenu = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  const queueCloseMenu = (event) => {
    const currentTarget = event?.currentTarget
    const relatedTarget = event?.relatedTarget

    if (
      currentTarget instanceof Node &&
      relatedTarget instanceof Node &&
      currentTarget.contains(relatedTarget)
    ) {
      return
    }

    if (currentTarget instanceof HTMLElement) {
      const rect = currentTarget.getBoundingClientRect()
      const isDropdown = currentTarget.dataset?.dropdown === 'true'
      const leavingBottom = event.clientY >= rect.bottom

      if (!isDropdown && leavingBottom) {
        const dropdownEl = currentTarget.querySelector('[data-dropdown="true"]')

        if (dropdownEl instanceof HTMLElement) {
          const dropdownRect = dropdownEl.getBoundingClientRect()

          const withinDropdownHorizontal =
            event.clientX >= dropdownRect.left - 32 &&
            event.clientX <= dropdownRect.right + 32

          if (withinDropdownHorizontal) {
            cancelCloseMenu()
            return
          }
        }

        // Si no hay dropdown o el cursor sale fuera del rango esperado, continuar con el cierre
      }

      if (isDropdown && leavingBottom) {
        // Permitir que el dropdown maneje el cierre normalmente
      }

      if (!isDropdown && event.clientY <= rect.top) {
        return
      }

      if (isDropdown) {
        const leavingTop = event.clientY <= rect.top
        const relatedElement = relatedTarget instanceof HTMLElement ? relatedTarget : null
        const relatedMenuRoot = relatedElement?.closest('[data-menu-root="true"]')
        const currentMenuRoot = currentTarget.parentElement

        if (leavingTop && relatedElement) {
          const isSameMenuRoot = relatedMenuRoot === currentMenuRoot
          const isButton = relatedElement.tagName === 'BUTTON'

          if (isSameMenuRoot || isButton) {
            cancelCloseMenu()
            return
          }
        }
      }
    }

    cancelCloseMenu()
    closeTimeoutRef.current = setTimeout(() => {
      setOpenMenu(null)
      closeTimeoutRef.current = null
    }, 220)
  }

  return (
    <div className="d-none d-xl-block" style={{
      position: 'sticky',
      top: 0,
      zIndex: 90,
      background: 'var(--horizontal-menu-bg)',
      borderBottom: '1px solid var(--horizontal-menu-border)',
      boxShadow: '0 2px 4px var(--horizontal-menu-shadow)'
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
            color: pathname === '/' ? 'var(--horizontal-menu-text-active)' : 'var(--horizontal-menu-text)',
            borderBottom: pathname === '/' ? '3px solid var(--horizontal-menu-text-active)' : '3px solid transparent',
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
            style={{ 
              position: 'relative',
              paddingBottom: openMenu === modulo.id_modulo ? '16px' : '0px'
            }}
            data-menu-root="true"
            onMouseEnter={() => {
              cancelCloseMenu()
              setOpenMenu(modulo.id_modulo)
            }}
            onMouseLeave={(event) => {
              queueCloseMenu(event)
            }}
          >
            <button
              onClick={() => setOpenMenu(openMenu === modulo.id_modulo ? null : modulo.id_modulo)}
              style={{
                padding: '15px 20px',
                background: 'none',
                border: 'none',
                borderBottom: openMenu === modulo.id_modulo ? '3px solid var(--horizontal-menu-text-active)' : '3px solid transparent',
                color: openMenu === modulo.id_modulo ? 'var(--horizontal-menu-text-active)' : 'var(--horizontal-menu-text)',
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
              <div
                data-dropdown="true"
                onMouseEnter={cancelCloseMenu}
                onMouseLeave={(event) => queueCloseMenu(event)}
                style={{
                position: 'absolute',
                  top: 'calc(100% - 16px)',
                left: 0,
                background: 'var(--horizontal-menu-dropdown-bg)',
                border: '1px solid var(--horizontal-menu-dropdown-border)',
                borderRadius: '8px',
                boxShadow: '0 5px 20px var(--horizontal-menu-dropdown-shadow)',
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
                        color: pathname === ruta.path ? 'var(--horizontal-menu-text-active)' : 'var(--horizontal-menu-text)',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        background: pathname === ruta.path ? 'var(--horizontal-menu-dropdown-active-bg)' : 'transparent',
                        fontWeight: pathname === ruta.path ? 600 : 400
                      }}
                      onMouseEnter={(e) => {
                        if (pathname !== ruta.path) {
                          e.currentTarget.style.background = 'var(--horizontal-menu-dropdown-hover-bg)'
                          e.currentTarget.style.paddingLeft = '25px'
                          e.currentTarget.style.color = 'var(--horizontal-menu-text-active)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (pathname !== ruta.path) {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.paddingLeft = '20px'
                          e.currentTarget.style.color = 'var(--horizontal-menu-text)'
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

