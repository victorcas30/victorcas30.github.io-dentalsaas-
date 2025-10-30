'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { authService } from '@/services/authService'

export default function PageHeader() {
  const pathname = usePathname()
  const [pageInfo, setPageInfo] = useState(null)

  useEffect(() => {
    // Obtener módulos del usuario
    const modulos = authService.getModulos()
    
    // Buscar la ruta actual en los módulos
    let rutaEncontrada = null
    
    modulos.forEach(modulo => {
      if (modulo.rutas) {
        const ruta = modulo.rutas.find(r => r.path === pathname)
        if (ruta) {
          rutaEncontrada = {
            ...ruta,
            modulo: modulo.modulo,
            modulo_descripcion: modulo.modulo_descripcion
          }
        }
      }
    })

    setPageInfo(rutaEncontrada)
  }, [pathname])

  if (!pageInfo) {
    return (
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="fw-bold mb-2">Cargando...</h2>
              <p className="text-muted mb-0">Un momento por favor</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="row">
      <div className="col-12">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <div className="d-flex align-items-center mb-2">
              <i className={getRutaIcon(pageInfo.nombre)} style={{fontSize: '28px', color: '#1B84FF', marginRight: '12px'}}></i>
              <h2 className="fw-bold mb-0">{pageInfo.nombre}</h2>
            </div>
            <p className="text-muted mb-0">{pageInfo.descripcion}</p>
            <small className="text-muted">
              <i className="ti ti-folder me-1"></i>
              {pageInfo.modulo}
            </small>
          </div>
        </div>
      </div>
    </div>
  )
}

// Función para obtener iconos según el nombre de la ruta
function getRutaIcon(nombreRuta) {
  const iconMap = {
    'Horarios': 'ti ti-clock',
    'Usuarios y permisos': 'ti ti-user-shield',
    'Plantillas de mensajes': 'ti ti-message',
    'Políticas de descuento': 'ti ti-discount',
    'Información de la clinica': 'ti ti-building-hospital',
    'Información de la clínica': 'ti ti-building-hospital'
  }
  return iconMap[nombreRuta] || 'ti ti-file'
}
