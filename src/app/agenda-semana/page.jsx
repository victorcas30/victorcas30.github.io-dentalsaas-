'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import HorizontalLayout from '@/components/layout/HorizontalLayout'
import CitaModal from '@/components/CitaModal'
import FullCalendarWrapper from '@/components/FullCalendarWrapper'
import { citasService } from '@/services/citasService'
import { bloqueosAgendaService } from '@/services/bloqueosAgendaService'
import { authService } from '@/services/authService'
import { mostrarErrorAPI } from '@/utils/sweetAlertHelper'
import { normalizarFecha, parsearFechaSegura } from '@/utils/dateHelper'
import '@/app/agenda-calendar.css'

export default function AgendaSemana() {
  const router = useRouter()
  const [citas, setCitas] = useState([])
  const [bloqueos, setBloqueos] = useState([])
  const [loading, setLoading] = useState(true)
  const [fechaInicioSemana, setFechaInicioSemana] = useState(() => {
    const hoy = new Date()
    const dia = hoy.getDay()
    const diff = hoy.getDate() - dia + (dia === 0 ? -6 : 1)
    const lunes = new Date(hoy)
    lunes.setDate(diff)
    return lunes
  })
  const [showModal, setShowModal] = useState(false)
  const [citaSeleccionada, setCitaSeleccionada] = useState(null)
  const [fechaModal, setFechaModal] = useState(null)
  const [horaInicialModal, setHoraInicialModal] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const idClinica = authService.getClinicaId()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    cargarCitas()
    cargarBloqueos()
  }, [fechaInicioSemana])


  const convertirBloqueosAEventos = useCallback((bloqueos) => {
    if (!bloqueos || bloqueos.length === 0) {
      return []
    }

    return bloqueos.map(bloqueo => {
      try {
        let fechaInicio = bloqueo.fecha_inicio
        let fechaFin = bloqueo.fecha_fin
        if (typeof fechaInicio === 'string') {
          fechaInicio = fechaInicio.split('T')[0].split(' ')[0]
        }
        if (typeof fechaFin === 'string') {
          fechaFin = fechaFin.split('T')[0].split(' ')[0]
        }

        const obtenerNombreBloqueo = () => {
          if (bloqueo.tipo_bloqueo === 'CLINICA') {
            return 'BLOQUEO CLÍNICA'
          }
          if (bloqueo.doctor_nombres && bloqueo.doctor_apellidos) {
            const titulo = bloqueo.doctor_titulo || 'Dr.'
            return `BLOQUEO: ${titulo} ${bloqueo.doctor_nombres} ${bloqueo.doctor_apellidos}`
          }
          return 'BLOQUEO'
        }

        if (bloqueo.dia_completo) {
          const eventos = []
          const fechaInicioDate = parsearFechaSegura(fechaInicio)
          const fechaFinDate = parsearFechaSegura(fechaFin)
          
          for (let fecha = new Date(fechaInicioDate); fecha <= fechaFinDate; fecha.setDate(fecha.getDate() + 1)) {
            const fechaStr = normalizarFecha(fecha)
            const fechaFinStr = normalizarFecha(new Date(fecha.getTime() + 24 * 60 * 60 * 1000))
            
            eventos.push({
              id: `bloqueo-${bloqueo.id_bloqueo}-${fechaStr}`,
              title: obtenerNombreBloqueo(),
              start: fechaStr,
              end: fechaFinStr,
              allDay: true,
              extendedProps: {
                bloqueo: bloqueo,
                tipo: 'bloqueo',
                motivo: bloqueo.motivo || 'Sin motivo'
              },
              className: 'event-fc-color fc-bg-danger',
              backgroundColor: 'rgba(220, 53, 69, 0.15)',
              borderColor: '#dc3545',
              textColor: '#dc3545',
              'data-tooltip': `${obtenerNombreBloqueo()}\n${fechaStr}\n${bloqueo.motivo || 'Sin motivo'}`
            })
          }
          
          return eventos
        } else {
          const eventos = []
          const fechaInicioDate = parsearFechaSegura(fechaInicio)
          const fechaFinDate = parsearFechaSegura(fechaFin)
          
          let horaInicio = bloqueo.hora_inicio ? bloqueo.hora_inicio.substring(0, 5) : '00:00'
          let horaFin = bloqueo.hora_fin ? bloqueo.hora_fin.substring(0, 5) : '23:59'
          
          for (let fecha = new Date(fechaInicioDate); fecha <= fechaFinDate; fecha.setDate(fecha.getDate() + 1)) {
            const fechaStr = normalizarFecha(fecha)
            const startDateTime = `${fechaStr}T${horaInicio}:00`
            const endDateTime = `${fechaStr}T${horaFin}:00`
            
            eventos.push({
              id: `bloqueo-${bloqueo.id_bloqueo}-${fechaStr}`,
              title: obtenerNombreBloqueo(),
              start: startDateTime,
              end: endDateTime,
              allDay: false,
              extendedProps: {
                bloqueo: bloqueo,
                tipo: 'bloqueo',
                motivo: bloqueo.motivo || 'Sin motivo'
              },
              className: 'event-fc-color fc-bg-danger',
              backgroundColor: 'rgba(220, 53, 69, 0.15)',
              borderColor: '#dc3545',
              textColor: '#dc3545',
              'data-tooltip': `${obtenerNombreBloqueo()}\n${fechaStr} ${horaInicio} - ${horaFin}\n${bloqueo.motivo || 'Sin motivo'}`
            })
          }
          
          return eventos
        }
      } catch (error) {
        console.error('Error al convertir bloqueo a evento:', error, bloqueo)
        return null
      }
    })
    .filter(evento => evento !== null)
    .flat()
  }, [])

  const convertirCitasAEventos = useCallback((citas) => {
    if (!citas || citas.length === 0) {
      return []
    }

    return citas
      .filter(cita => cita && cita.activo !== false)
      .map(cita => {
        try {
          let fechaCita = normalizarFecha(cita.fecha)
          
          if (typeof fechaCita === 'string' && fechaCita.includes('T')) {
            fechaCita = fechaCita.split('T')[0]
          }
          
          let horaInicio = '09:00'
          let horaFin = '10:00'
          
          if (cita.hora_inicio) {
            const horaInicioStr = cita.hora_inicio.toString()
            if (horaInicioStr.includes(':')) {
              horaInicio = horaInicioStr.substring(0, 5)
            } else {
              horaInicio = horaInicioStr.padStart(5, '0')
            }
          }
          
          if (cita.hora_fin) {
            const horaFinStr = cita.hora_fin.toString()
            if (horaFinStr.includes(':')) {
              horaFin = horaFinStr.substring(0, 5)
            } else {
              horaFin = horaFinStr.padStart(5, '0')
            }
          }
          
          // Mapear estado a colores específicos
          const coloresPorEstado = {
            'Programada': {
              className: 'primary',
              backgroundColor: 'rgba(13, 110, 253, 0.15)',
              borderColor: '#0d6efd',
              textColor: '#0d6efd'
            },
            'Confirmada': {
              className: 'info',
              backgroundColor: 'rgba(13, 202, 240, 0.15)',
              borderColor: '#0dcaf0',
              textColor: '#0dcaf0'
            },
            'Cancelada': {
              className: 'secondary',
              backgroundColor: 'rgba(108, 117, 125, 0.15)',
              borderColor: '#6c757d',
              textColor: '#6c757d'
            },
            'Atendida': {
              className: 'success',
              backgroundColor: 'rgba(25, 135, 84, 0.15)',
              borderColor: '#198754',
              textColor: '#198754'
            }
          }

          const colores = coloresPorEstado[cita.estado] || coloresPorEstado['Programada']

          const startDateTime = `${fechaCita}T${horaInicio}:00`
          const endDateTime = `${fechaCita}T${horaFin}:00`

          const nombreCompleto = `${cita.paciente_nombres || ''} ${cita.paciente_apellidos || ''}`.trim() || 'Sin nombre'
          const doctorCompleto = `${cita.doctor_titulo || 'Dr.'} ${cita.doctor_nombres || ''} ${cita.doctor_apellidos || ''}`.trim()
          const tooltipText = `${nombreCompleto}\n${horaInicio} - ${horaFin}\n${doctorCompleto}\n${cita.sala_nombre || 'Sin sala'}\n${cita.estado || 'Programada'}`

          return {
            id: cita.id_cita?.toString() || `cita-${Date.now()}-${Math.random()}`,
            title: nombreCompleto,
            start: startDateTime,
            end: endDateTime,
            allDay: false,
            extendedProps: {
              cita: cita,
              estado: cita.estado,
              doctor: doctorCompleto,
              sala: cita.sala_nombre || 'Sin sala',
              motivo: cita.motivo_cita || 'Sin motivo',
              notas: cita.notas || '',
              horaInicio: horaInicio,
              horaFin: horaFin
            },
            className: `event-fc-color fc-bg-${colores.className}`,
            backgroundColor: colores.backgroundColor,
            borderColor: colores.borderColor,
            textColor: colores.textColor,
            'data-tooltip': tooltipText
          }
        } catch (error) {
          console.error('Error al convertir cita a evento:', error, cita)
          return null
        }
      })
      .filter(evento => evento !== null)
  }, [])

  const eventosCalendario = useMemo(() => {
    const eventosCitas = convertirCitasAEventos(citas)
    const eventosBloqueos = convertirBloqueosAEventos(bloqueos)
    return [...eventosCitas, ...eventosBloqueos]
  }, [citas, bloqueos, convertirCitasAEventos, convertirBloqueosAEventos])

  const headerToolbarConfig = useMemo(() => {
    if (isMobile) {
      return {
        left: 'prev,next',
        center: 'title',
        right: 'today'
      }
    }
    return {
      left: 'prev,next today',
      center: 'title',
      right: ''
    }
  }, [isMobile])

  const cargarCitas = async () => {
    try {
      setLoading(true)
      const todasLasCitas = await citasService.listarPorClinica(idClinica)
      
      const fechaFinSemana = new Date(fechaInicioSemana)
      fechaFinSemana.setDate(fechaFinSemana.getDate() + 6)
      
      const fechaInicioStr = normalizarFecha(fechaInicioSemana)
      const fechaFinStr = normalizarFecha(fechaFinSemana)
      
      const citasSemana = todasLasCitas.filter(cita => {
        if (cita.activo === false) return false
        const fechaCita = normalizarFecha(cita.fecha)
        return fechaCita >= fechaInicioStr && fechaCita <= fechaFinStr
      })
      
      setCitas(citasSemana)
    } catch (err) {
      console.error('Error al cargar citas:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoading(false)
    }
  }

  const cargarBloqueos = async () => {
    try {
      const bloqueosData = await bloqueosAgendaService.listarPorClinica(idClinica)
      setBloqueos(bloqueosData)
    } catch (err) {
      console.error('Error al cargar bloqueos:', err)
    }
  }

  const abrirModalNuevaCita = (fecha = null, horaInicio = null) => {
    setCitaSeleccionada(null)
    setFechaModal(fecha)
    setHoraInicialModal(horaInicio)
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
    setHoraInicialModal(null)
  }

  const handleGuardarCita = () => {
    cargarCitas()
  }

  const handleEventClick = useCallback((info) => {
    const cita = info.event.extendedProps.cita
    if (cita) {
      abrirModalEditarCita(cita)
    }
  }, [])

  const handleDateChange = useCallback((info) => {
    // Extraer solo la fecha sin la hora para evitar problemas de zona horaria
    // info.start es el lunes de la semana mostrada
    const fechaStr = normalizarFecha(info.start)
    const nuevaFecha = parsearFechaSegura(fechaStr)
    
    // Calcular el lunes de la semana
    const dia = nuevaFecha.getDay()
    const diff = nuevaFecha.getDate() - dia + (dia === 0 ? -6 : 1)
    const lunes = new Date(nuevaFecha)
    lunes.setDate(diff)
    
    // Solo actualizar si la fecha realmente cambió
    setFechaInicioSemana(prev => {
      const prevStr = normalizarFecha(prev)
      const nuevaStr = normalizarFecha(lunes)
      if (prevStr !== nuevaStr) {
        return lunes
      }
      return prev
    })
  }, [])

  const handleSelect = useCallback((info) => {
    const fechaSeleccionada = normalizarFecha(info.start)
    
    // Extraer la hora del click
    const fechaHora = new Date(info.start)
    const horas = String(fechaHora.getHours()).padStart(2, '0')
    const minutos = String(fechaHora.getMinutes()).padStart(2, '0')
    const horaInicio = `${horas}:${minutos}`
    
    abrirModalNuevaCita(fechaSeleccionada, horaInicio)
  }, [])

  const handleDateClick = useCallback((info) => {
    // Prevenir que se abra si se hace clic en un evento existente
    if (info.event) {
      return
    }
    
    const fechaSeleccionada = normalizarFecha(info.date)
    
    // Extraer la hora del click
    const fechaHora = new Date(info.date)
    const horas = String(fechaHora.getHours()).padStart(2, '0')
    const minutos = String(fechaHora.getMinutes()).padStart(2, '0')
    const horaInicio = `${horas}:${minutos}`
    
    abrirModalNuevaCita(fechaSeleccionada, horaInicio)
  }, [])

  return (
    <HorizontalLayout>
      {/* Header Móvil - Se mantiene igual */}
      <div className="row d-md-none">
        <div className="col-12">
          <div className="d-flex flex-column align-items-start justify-content-between mb-4 gap-3">
            <div>
              <h2 className="fw-bold mb-2">
                <i className="ti ti-calendar-week me-2"></i>
                Agenda - Semana
              </h2>
              <p className="text-muted mb-0">
                {fechaInicioSemana.toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' })} - {new Date(fechaInicioSemana.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="d-flex gap-2 w-100">
              <button className="btn btn-outline-primary w-100" onClick={() => abrirModalNuevaCita()}>
                <i className="ti ti-plus me-2"></i>
                <span className="d-sm-none">Nueva</span>
                <span className="d-none d-sm-inline">Nueva cita</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Header Desktop - Mejorado para PC */}
      <div className="row d-none d-md-block">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="flex-grow-1">
              <h2 className="fw-bold mb-1">
                <i className="ti ti-calendar-week me-2"></i>
                Agenda - Semana
              </h2>
              <p className="text-muted mb-0 fs-6">
                {fechaInicioSemana.toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' })} - {new Date(fechaInicioSemana.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="d-flex gap-2 ms-3">
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
        <div className="card-header bg-white border-bottom p-0">
          <ul className="nav nav-tabs card-header-tabs flex-nowrap overflow-x-auto scrollbar-hide" role="tablist">
            <li className="nav-item flex-shrink-0">
              <button
                type="button"
                className="nav-link"
                onClick={() => router.push('/agenda-dia')}
                role="tab"
              >
                <i className="ti ti-calendar me-2"></i>
                <span className="d-none d-sm-inline">Día</span>
                <span className="d-sm-none">D</span>
              </button>
            </li>
            <li className="nav-item flex-shrink-0">
              <button
                type="button"
                className="nav-link active"
                onClick={() => router.push('/agenda-semana')}
                role="tab"
              >
                <i className="ti ti-calendar-week me-2"></i>
                <span className="d-none d-sm-inline">Semana</span>
                <span className="d-sm-none">S</span>
              </button>
            </li>
            <li className="nav-item flex-shrink-0">
              <button
                type="button"
                className="nav-link"
                onClick={() => router.push('/agenda-mes')}
                role="tab"
              >
                <i className="ti ti-calendar-month me-2"></i>
                <span className="d-none d-sm-inline">Mes</span>
                <span className="d-sm-none">M</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Calendario FullCalendar */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-3 text-muted">Cargando citas...</p>
            </div>
          ) : (
            <div className="p-2 p-md-4 calender-sidebar app-calendar">
              <FullCalendarWrapper
                initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
                initialDate={fechaInicioSemana}
                headerToolbar={headerToolbarConfig}
                titleFormat={isMobile ? { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                } : { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric',
                  weekday: 'long'
                }}
                events={eventosCalendario}
                eventClick={handleEventClick}
                selectable={true}
                selectMirror={true}
                select={handleSelect}
                dateClick={handleDateClick}
                datesSet={handleDateChange}
                height="auto"
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                slotDuration="00:30:00"
                firstDay={1}
                eventDisplay="block"
                dayHeaderFormat={isMobile ? { weekday: 'short' } : { weekday: 'long' }}
                slotLabelFormat={{
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: false
                }}
                locale="es"
              />
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
        horaInicial={horaInicialModal}
        bloqueos={bloqueos}
      />
    </HorizontalLayout>
  )
}
