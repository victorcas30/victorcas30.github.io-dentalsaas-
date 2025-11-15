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

export default function AgendaMes() {
  const router = useRouter()
  const [citas, setCitas] = useState([])
  const [bloqueos, setBloqueos] = useState([])
  const [loading, setLoading] = useState(true)
  // Inicializar con la fecha actual en formato seguro - solo se usa para initialDate
  const fechaInicial = useMemo(() => {
    const hoy = new Date()
    // Asegurar que usamos la fecha local, no UTC
    return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  }, [])
  // Estado para el título del mes (no afecta al calendario)
  const [mesTitulo, setMesTitulo] = useState(() => {
    const hoy = new Date()
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  })
  const [showModal, setShowModal] = useState(false)
  const [citaSeleccionada, setCitaSeleccionada] = useState(null)
  const [fechaModal, setFechaModal] = useState(null)
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

  // Cargar todas las citas solo al montar
  useEffect(() => {
    cargarCitas()
    cargarBloqueos()
  }, [])


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
            title: `${nombreCompleto} - ${horaInicio}`,
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
      
      console.log('Total de citas recibidas:', todasLasCitas?.length || 0)
      
      // Filtrar solo las citas activas, pero NO filtrar por mes
      // FullCalendar se encargará de mostrar solo las del mes visible
      const citasActivas = todasLasCitas.filter(cita => {
        if (!cita || cita.activo === false) return false
        return true
      })
      
      console.log('Citas activas:', citasActivas.length)
      console.log('Citas:', citasActivas.map(c => ({
        id: c.id_cita,
        paciente: `${c.paciente_nombres} ${c.paciente_apellidos}`,
        fecha: c.fecha
      })))
      
      setCitas(citasActivas)
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

  const handleGuardarCita = async () => {
    // Recargar todas las citas después de guardar
    await cargarCitas()
  }

  const handleEventClick = useCallback((info) => {
    const cita = info.event.extendedProps.cita
    if (cita) {
      abrirModalEditarCita(cita)
    }
  }, [])

  const handleDateChange = useCallback((info) => {
    // Actualizar solo el título del mes sin causar re-renderizados del calendario
    const fechaStr = normalizarFecha(info.start)
    const nuevaFecha = parsearFechaSegura(fechaStr)
    
    setMesTitulo(prev => {
      const prevAño = prev.getFullYear()
      const prevMes = prev.getMonth()
      const nuevaAño = nuevaFecha.getFullYear()
      const nuevaMes = nuevaFecha.getMonth()
      
      // Solo actualizar si realmente cambió el mes/año para el título
      if (prevAño !== nuevaAño || prevMes !== nuevaMes) {
        // Crear nueva fecha sin hora para evitar problemas de zona horaria
        return new Date(nuevaAño, nuevaMes, 1)
      }
      return prev
    })
  }, [])

  const handleSelect = useCallback((info) => {
    const fechaSeleccionada = normalizarFecha(info.start)
    abrirModalNuevaCita(fechaSeleccionada)
  }, [])

  const formatearMes = () => {
    return mesTitulo.toLocaleDateString('es-SV', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  return (
    <HorizontalLayout>
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4 gap-3">
            <div>
              <h2 className="fw-bold mb-2">
                <i className="ti ti-calendar-month me-2"></i>
                Agenda - Mes
              </h2>
              <p className="text-muted mb-0">
                {formatearMes()}
              </p>
            </div>
            <div className="d-flex gap-2 w-100 w-md-auto">
              <button className="btn btn-outline-primary w-100 w-md-auto" onClick={() => abrirModalNuevaCita()}>
                <i className="ti ti-plus me-2"></i>
                <span className="d-none d-sm-inline">Nueva cita</span>
                <span className="d-sm-none">Nueva</span>
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
                className="nav-link"
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
                className="nav-link active"
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
                initialView="dayGridMonth"
                initialDate={normalizarFecha(fechaInicial)}
                headerToolbar={headerToolbarConfig}
                titleFormat={isMobile ? { 
                  month: 'short', 
                  year: 'numeric' 
                } : { 
                  month: 'long', 
                  year: 'numeric'
                }}
                events={eventosCalendario}
                eventClick={handleEventClick}
                selectable={true}
                selectMirror={true}
                select={handleSelect}
                datesSet={handleDateChange}
                height="auto"
                firstDay={1}
                eventDisplay="block"
                dayHeaderFormat={isMobile ? { weekday: 'narrow' } : { weekday: 'short' }}
                moreLinkClick="popover"
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
        bloqueos={bloqueos}
      />
    </HorizontalLayout>
  )
}
