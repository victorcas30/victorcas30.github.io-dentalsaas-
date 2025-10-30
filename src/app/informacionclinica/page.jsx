'use client'

import HorizontalLayout from '@/components/layout/HorizontalLayout'

export default function InformacionClinica() {
  return (
    <HorizontalLayout>
      {/* Header de la página */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="fw-bold mb-2">
                <i className="ti ti-building-hospital me-2"></i>
                Información de la Clínica
              </h2>
              <p className="text-muted mb-0">
                Toda la configuración de la clinica
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
              <i className="ti ti-building-hospital" style={{fontSize: '64px', color: '#1B84FF', opacity: 0.3}}></i>
              <h4 className="mt-3 mb-2">Información de la Clínica</h4>
              <p className="text-muted">
                Administra toda la información y configuración general de tu clínica dental.
              </p>
            </div>
          </div>
        </div>
      </div>
    </HorizontalLayout>
  )
}
