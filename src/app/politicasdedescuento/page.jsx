'use client'

import HorizontalLayout from '@/components/layout/HorizontalLayout'

export default function PoliticasDescuento() {
  return (
    <HorizontalLayout>
      {/* Header de la página */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="fw-bold mb-2">
                <i className="ti ti-discount me-2"></i>
                Políticas de Descuento
              </h2>
              <p className="text-muted mb-0">
                Los descuentos a realizar
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
              <i className="ti ti-discount" style={{fontSize: '64px', color: '#1B84FF', opacity: 0.3}}></i>
              <h4 className="mt-3 mb-2">Políticas de Descuento</h4>
              <p className="text-muted">
                Configura las políticas de descuento para tus tratamientos y servicios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </HorizontalLayout>
  )
}
