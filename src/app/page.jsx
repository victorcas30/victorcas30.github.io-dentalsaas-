'use client'

import HorizontalLayout from '@/components/layout/HorizontalLayout'
import { buildAssetPath } from '@/config/api'

export default function Home() {
  return (
    <HorizontalLayout>
      {/* TODO: Contenido del Dashboard - Comentado temporalmente */}
      
      {/* Título de la página */}
      {/* <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h2 className="mb-0">Dashboard</h2>
            <button className="btn btn-primary">
              <i className="ti ti-plus me-2"></i>
              Nueva Cita
            </button>
          </div>
        </div>
      </div> */}

      {/* Tarjetas de estadísticas */}
      {/* <div className="row">
        <div className="col-xl-3 col-lg-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="fw-semibold text-muted mb-2">Pacientes Hoy</h6>
                  <h2 className="mb-0">24</h2>
                  <span className="badge bg-success-subtle text-success">
                    <i className="ti ti-arrow-up"></i> +5.2%
                  </span>
                </div>
                <div className="bg-primary-subtle rounded p-3">
                  <i className="ti ti-users fs-7 text-primary"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="fw-semibold text-muted mb-2">Citas Pendientes</h6>
                  <h2 className="mb-0">12</h2>
                  <span className="badge bg-warning-subtle text-warning">
                    <i className="ti ti-clock"></i> En espera
                  </span>
                </div>
                <div className="bg-warning-subtle rounded p-3">
                  <i className="ti ti-calendar fs-7 text-warning"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="fw-semibold text-muted mb-2">Ingresos Mes</h6>
                  <h2 className="mb-0">$45,890</h2>
                  <span className="badge bg-success-subtle text-success">
                    <i className="ti ti-arrow-up"></i> +12.3%
                  </span>
                </div>
                <div className="bg-success-subtle rounded p-3">
                  <i className="ti ti-currency-dollar fs-7 text-success"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="fw-semibold text-muted mb-2">Tratamientos Activos</h6>
                  <h2 className="mb-0">38</h2>
                  <span className="badge bg-info-subtle text-info">
                    <i className="ti ti-dental"></i> En proceso
                  </span>
                </div>
                <div className="bg-info-subtle rounded p-3">
                  <i className="ti ti-dental fs-7 text-info"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Próximas citas */}
      {/* <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="card-title mb-0">Próximas Citas</h5>
                <a href="/citas" className="btn btn-sm btn-light-primary">Ver todas</a>
              </div>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Paciente</th>
                      <th>Hora</th>
                      <th>Tratamiento</th>
                      <th>Doctor</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center">
                          <img src={buildAssetPath('/assets/images/profile/user-1.jpg')} className="rounded-circle me-2" width="35" height="35" alt="user" />
                          <span>María García</span>
                        </div>
                      </td>
                      <td>09:00 AM</td>
                      <td>Limpieza Dental</td>
                      <td>Dr. Pérez</td>
                      <td><span className="badge bg-success">Confirmada</span></td>
                    </tr>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center">
                          <img src={buildAssetPath('/assets/images/profile/user-1.jpg')} className="rounded-circle me-2" width="35" height="35" alt="user" />
                          <span>Carlos López</span>
                        </div>
                      </td>
                      <td>10:30 AM</td>
                      <td>Ortodoncia</td>
                      <td>Dr. Martínez</td>
                      <td><span className="badge bg-warning">Pendiente</span></td>
                    </tr>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center">
                          <img src={buildAssetPath('/assets/images/profile/user-1.jpg')} className="rounded-circle me-2" width="35" height="35" alt="user" />
                          <span>Ana Rodríguez</span>
                        </div>
                      </td>
                      <td>11:00 AM</td>
                      <td>Extracción</td>
                      <td>Dr. Pérez</td>
                      <td><span className="badge bg-success">Confirmada</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div> */}

        {/* Alertas y recordatorios */}
        {/* <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Alertas y Recordatorios</h5>
              <div className="alert alert-warning d-flex align-items-center" role="alert">
                <i className="ti ti-alert-triangle me-2 fs-5"></i>
                <div>
                  <strong>3 pacientes</strong> sin confirmar cita
                </div>
              </div>
              <div className="alert alert-info d-flex align-items-center" role="alert">
                <i className="ti ti-info-circle me-2 fs-5"></i>
                <div>
                  <strong>5 tratamientos</strong> próximos a vencer
                </div>
              </div>
              <div className="alert alert-success d-flex align-items-center" role="alert">
                <i className="ti ti-check me-2 fs-5"></i>
                <div>
                  <strong>12 facturas</strong> pagadas hoy
                </div>
              </div>
            </div>
          </div> */}

          {/* Accesos rápidos */}
          {/* <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Accesos Rápidos</h5>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary">
                  <i className="ti ti-user-plus me-2"></i>
                  Nuevo Paciente
                </button>
                <button className="btn btn-outline-success">
                  <i className="ti ti-calendar-plus me-2"></i>
                  Agendar Cita
                </button>
                <button className="btn btn-outline-info">
                  <i className="ti ti-file-invoice me-2"></i>
                  Nueva Factura
                </button>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </HorizontalLayout>
  )
}
