'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import HorizontalLayout from '@/components/layout/HorizontalLayout'
import CitaModal from '@/components/CitaModal'
import { citasService } from '@/services/citasService'
import { authService } from '@/services/authService'
import { mostrarErrorAPI } from '@/utils/sweetAlertHelper'

export default function AgendaMes() {
  const router = useRouter()
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [fechaActual, setFechaActual] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [citaSeleccionada, setCitaSeleccionada] = useState(null)
  const [fechaModal, setFechaModal] = useState(null)

  const idClinica = authService.getClinicaId()

  useEffect(() => {
    cargarCitas()
  }, [fechaActual])

  const cargarCitas = async () => {
    try {
      setLoading(true)
      const todasLasCitas = await citasService.listarPorClinica(idClinica)
      
      // Filtrar citas del mes actual y activas
      const año = fechaActual.getFullYear()
      const mes = fechaActual.getMonth()
      
      const citasMes = todasLasCitas.filter(cita => {
        if (cita.activo === false) return false
        const fechaCita = new Date(cita.fecha)
        return fechaCita.getFullYear() === año && fechaCita.getMonth() === mes
      })
      
      setCitas(citasMes)
    } catch (err) {
      console.error('Error al cargar citas:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoading(false)
    }
  }

  const cambiarMes = (meses) => {
    const nuevaFecha = new Date(fechaActual)
    nuevaFecha.setMonth(nuevaFecha.getMonth() + meses)
    setFechaActual(nuevaFecha)
  }

  const irAMesActual = () => {
    setFechaActual(new Date())
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

  const obtenerDiasDelMes = () => {
    const año = fechaActual.getFullYear()
    const mes = fechaActual.getMonth()
    
    // Primer día del mes
    const primerDia = new Date(año, mes, 1)
    // Último día del mes
    const ultimoDia = new Date(año, mes + 1, 0)
    
    // Día de la semana del primer día (0 = domingo, 1 = lunes, etc.)
    const diaInicio = primerDia.getDay()
    // Ajustar para que la semana empiece en lunes
    const diaInicioAjustado = diaInicio === 0 ? 6 : diaInicio - 1
    
    const dias = []
    
    // Agregar días vacíos al inicio si el mes no empieza en lunes
    for (let i = 0; i < diaInicioAjustado; i++) {
      dias.push(null)
    }
    
    // Agregar todos los días del mes
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      dias.push(new Date(año, mes, dia))
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
    if (!fecha) return []
    const fechaStr = normalizarFecha(fecha)
    return citas.filter(cita => {
      const fechaCita = normalizarFecha(cita.fecha)
      return fechaCita === fechaStr
    })
  }

  const formatearMes = () => {
    return fechaActual.toLocaleDateString('es-SV', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const esHoy = (fecha) => {
    if (!fecha) return false
    const hoy = new Date()
    return fecha.toDateString() === hoy.toDateString()
  }

  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const diasDelMes = obtenerDiasDelMes()

  return (
    <HorizontalLayout>
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="fw-bold mb-2">
                <i className="ti ti-calendar-month me-2"></i>
                Agenda - Mes
              </h2>
              <p className="text-muted mb-0">
                {formatearMes()}
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
                className="btn btn-outline-primary"
                onClick={() => router.push('/agenda-semana')}
              >
                <i className="ti ti-calendar-week me-2"></i>Semana
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => router.push('/agenda-mes')}
              >
                <i className="ti ti-calendar-month me-2"></i>Mes
              </button>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => cambiarMes(-1)}
              >
                <i className="ti ti-chevron-left"></i>
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={irAMesActual}
              >
                Este mes
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => cambiarMes(1)}
              >
                <i className="ti ti-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendario mensual */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-3 text-muted">Cargando citas...</p>
            </div>
          ) : (
            <div>
              {/* Encabezados de días de la semana */}
              <div className="row g-0 border-bottom">
                {diasSemana.map((dia, index) => (
                  <div key={index} className="col border-end p-2 text-center fw-bold bg-light" style={{minHeight: '40px'}}>
                    {dia}
                  </div>
                ))}
              </div>

              {/* Días del mes */}
              <div className="row g-0">
                {diasDelMes.map((dia, index) => {
                  const citasDelDia = dia ? obtenerCitasDelDia(dia) : []
                  const esHoyDia = dia ? esHoy(dia) : false
                  const esOtroMes = dia && dia.getMonth() !== fechaActual.getMonth()
                  
                  return (
                    <div
                      key={index}
                      className="col border-end border-bottom"
                      style={{
                        minHeight: '120px',
                        backgroundColor: esHoyDia ? '#e7f3ff' : 'white'
                      }}
                    >
                      {dia ? (
                        <div className="p-2 h-100 d-flex flex-column">
                          <div className={`d-flex justify-content-between align-items-start mb-1 ${esHoyDia ? 'fw-bold text-primary' : ''}`}>
                            <span>{dia.getDate()}</span>
                            {citasDelDia.length > 0 && (
                              <span className="badge bg-primary rounded-pill">
                                {citasDelDia.length}
                              </span>
                            )}
                          </div>
                          <div className="flex-grow-1" style={{fontSize: '11px', overflow: 'hidden'}}>
                            {citasDelDia.slice(0, 3).map((cita) => (
                              <div
                                key={cita.id_cita}
                                className="mb-1 p-1 rounded bg-primary text-white"
                                style={{cursor: 'pointer', fontSize: '10px'}}
                                onClick={() => abrirModalEditarCita(cita)}
                                title={`${cita.paciente_nombres} ${cita.paciente_apellidos} - ${cita.hora_inicio?.substring(0, 5)}`}
                              >
                                <div className="text-truncate fw-semibold">
                                  {cita.hora_inicio?.substring(0, 5)} {cita.paciente_nombres}
                                </div>
                              </div>
                            ))}
                            {citasDelDia.length > 3 && (
                              <div className="text-muted small">
                                +{citasDelDia.length - 3} más
                              </div>
                            )}
                            {citasDelDia.length === 0 && (
                              <button
                                className="btn btn-sm btn-outline-primary w-100 mt-1"
                                style={{fontSize: '10px', padding: '2px'}}
                                onClick={() => abrirModalNuevaCita(dia.toISOString().split('T')[0])}
                              >
                                <i className="ti ti-plus"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2" style={{minHeight: '120px', backgroundColor: '#f8f9fa'}}></div>
                      )}
                    </div>
                  )
                })}
              </div>
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

