'use client'

import HorizontalLayout from '@/components/layout/HorizontalLayout'

export default function PlantillasMensajes() {
  return (
    <HorizontalLayout>
      {/* Header de la página */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="fw-bold mb-2">
                <i className="ti ti-message me-2"></i>
                Plantillas de Mensajes
              </h2>
              <p className="text-muted mb-0">
                Plantillas de mensajes enviados por whatsapp
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center py-5">
              <i className="ti ti-message" style={{fontSize: '64px', color: '#1B84FF', opacity: 0.3}}></i>
              <h4 className="mt-3 mb-2">Plantillas de Mensajes WhatsApp</h4>
              <p className="text-muted">
                Crea y gestiona plantillas de mensajes para enviar a tus pacientes vía WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </HorizontalLayout>
  )
}
