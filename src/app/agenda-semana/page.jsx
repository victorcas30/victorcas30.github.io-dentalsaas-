'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import HorizontalLayout from '@/components/layout/HorizontalLayout'
import CitaModal from '@/components/CitaModal'
import { citasService } from '@/services/citasService'
import { authService } from '@/services/authService'
import { mostrarErrorAPI } from '@/utils/sweetAlertHelper'

export default function AgendaSemana() {
  const router = useRouter()
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [fechaInicioSemana, setFechaInicioSemana] = useState(() => {
    const hoy = new Date()
    const lunes = new Date(hoy)
    const dia = hoy.getDay()
    const diff = hoy.getDate() - dia + (dia === 0 ? -6 : 1) // Ajustar al lunes
    lunes.setDate(diff)
    return lunes
  })
  const [showModal, setShowModal] = useState(false)
  const [citaSeleccionada, setCitaSeleccionada] = useState(null)
  const [fechaModal, setFechaModal] = useState(null)

  const idClinica = authService.getClinicaId()

  useEffect(() => {
    cargarCitas()
  }, [fechaInicioSemana])

  const cargarCitas = async () => {
    try {
      setLoading(true)
      const todasLasCitas = await citasService.listarPorClinica(idClinica)
      
      // Filtrar citas de la semana actual y activas
      const fechaFinSemana = new Date(fechaInicioSemana)
      fechaFinSemana.setDate(fechaFinSemana.getDate() + 6)
      
      const citasSemana = todasLasCitas.filter(cita => {
        if (cita.activo === false) return false
        const fechaCita = new Date(cita.fecha)
        return fechaCita >= fechaInicioSemana && fechaCita <= fechaFinSemana
      })
      
      setCitas(citasSemana)
    } catch (err) {
      console.error('Error al cargar citas:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoading(false)
    }
  }

  const cambiarSemana = (semanas) => {
    const nuevaFecha = new Date(fechaInicioSemana)
    nuevaFecha.setDate(nuevaFecha.getDate() + (semanas * 7))
    setFechaInicioSemana(nuevaFecha)
  }

  const irASemanaActual = () => {
    const hoy = new Date()
    const dia = hoy.getDay()
    const diff = hoy.getDate() - dia + (dia === 0 ? -6 : 1)
    const lunes = new Date(hoy)
    lunes.setDate(diff)
    setFechaInicioSemana(lunes)
  }

  const abrirModalNuevaCita = (fecha = null) => {
    setCitaSeleccionada(null)
    setFechaModal(fecha)
    setShowModal(true)
  }

  const abrirModalEditarCita = (cita) => {
    setCitaSeleccionada(cita)
    setFechaModal(null)
    setShowModal(true)
  }

  const cerrarModal = () => {
    setShowModal(false)
    setCitaSeleccionada(null)
    setFechaModal(null)
  }

  const handleGuardarCita = () => {
    cargarCitas()
  }

  const obtenerDiasSemana = () => {
    const dias = []
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(fechaInicioSemana)
      fecha.setDate(fecha.getDate() + i)
      dias.push(fecha)
    }
    return dias
  }

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

  const obtenerCitasDelDia = (fecha) => {
    const fechaStr = normalizarFecha(fecha)
    return citas.filter(cita => {
      const fechaCita = normalizarFecha(cita.fecha)
      return fechaCita === fechaStr
    })
      .sort((a, b) => {
        const horaA = a.hora_inicio || '00:00:00'
        const horaB = b.hora_inicio || '00:00:00'
        return horaA.localeCompare(horaB)
      })
  }

  const formatearFecha = (fecha) => {
    return fecha.toLocaleDateString('es-SV', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
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

  const esHoy = (fecha) => {
    const hoy = new Date()
    return fecha.toDateString() === hoy.toDateString()
  }

  const diasSemana = obtenerDiasSemana()

  return (
    <HorizontalLayout>
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="fw-bold mb-2">
                <i className="ti ti-calendar-week me-2"></i>
                Agenda - Semana
              </h2>
              <p className="text-muted mb-0">
                {diasSemana[0].toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' })} - {diasSemana[6].toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary" onClick={() => abrirModalNuevaCita()}>
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
                className="btn btn-outline-primary"
                onClick={() => router.push('/agenda-dia')}
              >
                <i className="ti ti-calendar me-2"></i>Día
              </button>
              <button
                type="button"
                className="btn btn-primary"
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
                onClick={() => cambiarSemana(-1)}
              >
                <i className="ti ti-chevron-left"></i>
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={irASemanaActual}
              >
                Esta semana
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => cambiarSemana(1)}
              >
                <i className="ti ti-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendario semanal */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-3 text-muted">Cargando citas...</p>
            </div>
          ) : (
            <div className="row g-0">
              {diasSemana.map((dia, index) => {
                const citasDelDia = obtenerCitasDelDia(dia)
                const esHoyDia = esHoy(dia)
                
                return (
                  <div key={index} className="col border-end" style={{minHeight: '500px'}}>
                    <div 
                      className={`p-3 border-bottom ${esHoyDia ? 'bg-primary text-white' : 'bg-light'}`}
                      style={{fontWeight: 'bold'}}
                    >
                      <div>{formatearFecha(dia)}</div>
                      <div className="small">{dia.toLocaleDateString('es-SV', { day: 'numeric' })}</div>
                    </div>
                    <div className="p-2" style={{maxHeight: '450px', overflowY: 'auto'}}>
                      {citasDelDia.length === 0 ? (
                        <div className="text-center text-muted small py-3">
                          Sin citas
                        </div>
                      ) : (
                        citasDelDia.map((cita) => (
                          <div
                            key={cita.id_cita}
                            className="card mb-2"
                            style={{cursor: 'pointer'}}
                            onClick={() => abrirModalEditarCita(cita)}
                          >
                            <div className="card-body p-2">
                              <div className="small fw-bold text-primary mb-1">
                                {formatearHora(cita.hora_inicio)} - {formatearHora(cita.hora_fin)}
                              </div>
                              <div className="small fw-semibold mb-1">
                                {cita.paciente_nombres} {cita.paciente_apellidos}
                              </div>
                              <div className="small text-muted mb-1">
                                {cita.doctor_titulo || 'Dr.'} {cita.doctor_nombres}
                              </div>
                              {cita.motivo_cita && (
                                <div className="small text-muted mb-1">
                                  {cita.motivo_cita}
                                </div>
                              )}
                              <div>
                                <span className={`badge bg-${getColorEstado(cita.estado)} small`}>
                                  {cita.estado}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      <button
                        className="btn btn-sm btn-outline-primary w-100 mt-2"
                        onClick={() => abrirModalNuevaCita(dia.toISOString().split('T')[0])}
                      >
                        <i className="ti ti-plus"></i>
                      </button>
                    </div>
                  </div>
                )
              })}
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
        fechaInicial={fechaModal || (citaSeleccionada ? citaSeleccionada.fecha : null)}
      />
    </HorizontalLayout>
  )
}

