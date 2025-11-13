'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import HorizontalLayout from '@/components/layout/HorizontalLayout'
import CitaModal from '@/components/CitaModal'
import { citasService } from '@/services/citasService'
import { authService } from '@/services/authService'
import { mostrarErrorAPI, mostrarExito } from '@/utils/sweetAlertHelper'

export default function AgendaDia() {
  const router = useRouter()
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [fechaActual, setFechaActual] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [citaSeleccionada, setCitaSeleccionada] = useState(null)

  const idClinica = authService.getClinicaId()

  useEffect(() => {
    cargarCitas()
  }, [fechaActual])

  const normalizarFecha = (fecha) => {
    // Si la fecha viene como string ISO completo, extraer solo la parte de fecha
    if (typeof fecha === 'string') {
      return fecha.split('T')[0]
    }
    // Si es un objeto Date, convertir a string YYYY-MM-DD usando hora local
    if (fecha instanceof Date) {
      const año = fecha.getFullYear()
      const mes = String(fecha.getMonth() + 1).padStart(2, '0')
      const dia = String(fecha.getDate()).padStart(2, '0')
      return `${año}-${mes}-${dia}`
    }
    return fecha
  }

  const cargarCitas = async () => {
    try {
      setLoading(true)
      const todasLasCitas = await citasService.listarPorClinica(idClinica)
      
      // Filtrar citas del día actual y activas
      // Usar fecha local sin conversión a UTC para evitar problemas de zona horaria
      const fechaStr = normalizarFecha(fechaActual)
      const citasDelDia = todasLasCitas.filter(cita => {
        const fechaCita = normalizarFecha(cita.fecha)
        return fechaCita === fechaStr && cita.activo !== false
      })
      
      // Ordenar por hora de inicio
      citasDelDia.sort((a, b) => {
        const horaA = a.hora_inicio || '00:00:00'
        const horaB = b.hora_inicio || '00:00:00'
        return horaA.localeCompare(horaB)
      })
      
      setCitas(citasDelDia)
    } catch (err) {
      console.error('Error al cargar citas:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoading(false)
    }
  }

  const cambiarFecha = (dias) => {
    const nuevaFecha = new Date(fechaActual)
    nuevaFecha.setDate(nuevaFecha.getDate() + dias)
    setFechaActual(nuevaFecha)
  }

  const irAHoy = () => {
    setFechaActual(new Date())
  }

  const abrirModalNuevaCita = () => {
    setCitaSeleccionada(null)
    setShowModal(true)
  }

  const abrirModalEditarCita = (cita) => {
    setCitaSeleccionada(cita)
    setShowModal(true)
  }

  const cerrarModal = () => {
    setShowModal(false)
    setCitaSeleccionada(null)
  }

  const handleGuardarCita = () => {
    cargarCitas()
  }

  const formatearFecha = (fecha) => {
    return fecha.toLocaleDateString('es-SV', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatearHora = (hora) => {
    if (!hora) return ''
    return hora.substring(0, 5)
  }

  const getColorEstado = (estado) => {
    const colores = {
      'Programada': 'primary',
      'Confirmada': 'info',
      'En Proceso': 'warning',
      'Completada': 'success',
      'Cancelada': 'danger',
      'No Asistió': 'secondary'
    }
    return colores[estado] || 'secondary'
  }

  return (
    <HorizontalLayout>
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="fw-bold mb-2">
                <i className="ti ti-calendar me-2"></i>
                Agenda - Día
              </h2>
              <p className="text-muted mb-0">
                {formatearFecha(fechaActual)}
              </p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary" onClick={abrirModalNuevaCita}>
                <i className="ti ti-plus me-2"></i>
                Nueva cita
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación entre vistas */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between">
            <div className="btn-group" role="group">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => router.push('/agenda-dia')}
              >
                <i className="ti ti-calendar me-2"></i>Día
              </button>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => router.push('/agenda-semana')}
              >
                <i className="ti ti-calendar-week me-2"></i>Semana
              </button>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => router.push('/agenda-mes')}
              >
                <i className="ti ti-calendar-month me-2"></i>Mes
              </button>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => cambiarFecha(-1)}
              >
                <i className="ti ti-chevron-left"></i>
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={irAHoy}
              >
                Hoy
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => cambiarFecha(1)}
              >
                <i className="ti ti-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de citas del día */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-3 text-muted">Cargando citas...</p>
            </div>
          ) : citas.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-calendar-off" style={{fontSize: '64px', color: '#ccc'}}></i>
              <h4 className="mt-3 mb-2">No hay citas programadas</h4>
              <p className="text-muted mb-3">
                No hay citas programadas para este día
              </p>
              <button className="btn btn-primary" onClick={abrirModalNuevaCita}>
                <i className="ti ti-plus me-2"></i>Crear primera cita
              </button>
            </div>
          ) : (
            <div className="list-group">
              {citas.map((cita) => (
                <div
                  key={cita.id_cita}
                  className="list-group-item list-group-item-action"
                  style={{cursor: 'pointer'}}
                  onClick={() => abrirModalEditarCita(cita)}
                >
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <div className="fw-bold text-primary" style={{minWidth: '80px'}}>
                          {formatearHora(cita.hora_inicio)} - {formatearHora(cita.hora_fin)}
                        </div>
                        <div>
                          <h6 className="mb-1">
                            {cita.paciente_nombres} {cita.paciente_apellidos}
                          </h6>
                          <div className="text-muted small">
                            {cita.doctor_titulo || 'Dr.'} {cita.doctor_nombres} {cita.doctor_apellidos}
                            {cita.sala_nombre && ` • ${cita.sala_nombre}`}
                          </div>
                        </div>
                      </div>
                      {cita.motivo_cita && (
                        <div className="text-muted small mb-1">
                          <i className="ti ti-file-text me-1"></i>
                          {cita.motivo_cita}
                        </div>
                      )}
                      {cita.notas && (
                        <div className="text-muted small">
                          <i className="ti ti-note me-1"></i>
                          {cita.notas}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className={`badge bg-${getColorEstado(cita.estado)}`}>
                        {cita.estado}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de cita */}
      <CitaModal
        show={showModal}
        onClose={cerrarModal}
        cita={citaSeleccionada}
        onSave={handleGuardarCita}
        fechaInicial={normalizarFecha(fechaActual)}
      />
    </HorizontalLayout>
  )
}

