'use client'

import { useState, useEffect } from 'react'
import { pacientesService } from '@/services/pacientesService'
import { doctoresService } from '@/services/doctoresService'
import { salasService } from '@/services/salasService'
import { citasService } from '@/services/citasService'
import { authService } from '@/services/authService'
import { mostrarErrorAPI } from '@/utils/sweetAlertHelper'

export default function CitaModal({ show, onClose, cita = null, onSave, fechaInicial = null, horaInicial = null }) {
  const [loading, setLoading] = useState(false)
  const [pacientes, setPacientes] = useState([])
  const [doctores, setDoctores] = useState([])
  const [salas, setSalas] = useState([])
  const [busquedaPaciente, setBusquedaPaciente] = useState('')
  const [pacientesFiltrados, setPacientesFiltrados] = useState([])
  const [mostrarListaPacientes, setMostrarListaPacientes] = useState(false)
  const [conflictoHorario, setConflictoHorario] = useState(null)

  const idClinica = authService.getClinicaId()

  const [formData, setFormData] = useState({
    id_paciente: '',
    id_doctor: '',
    id_sala: '',
    fecha: fechaInicial || new Date().toISOString().split('T')[0],
    hora_inicio: '10:00',
    hora_fin: '10:45',
    motivo_cita: '',
    notas: '',
    estado: 'Programada',
    recordatorio_automatico: false
  })

  const motivosRapidos = ['Limpieza', 'Dolor', 'Control', 'Urgencia']
  const estados = ['Programada', 'Confirmada', 'En Proceso', 'Completada', 'Cancelada', 'No Asistió']

  useEffect(() => {
    if (show) {
      cargarDatos()
      if (cita) {
        // Modo editar
        // Normalizar fecha si viene como string ISO completo
        let fechaNormalizada = cita.fecha
        if (typeof fechaNormalizada === 'string' && fechaNormalizada.includes('T')) {
          fechaNormalizada = fechaNormalizada.split('T')[0]
        }
        
        setFormData({
          id_paciente: cita.id_paciente || '',
          id_doctor: cita.id_doctor || '',
          id_sala: cita.id_sala || '',
          fecha: fechaNormalizada || new Date().toISOString().split('T')[0],
          hora_inicio: cita.hora_inicio ? cita.hora_inicio.substring(0, 5) : '10:00',
          hora_fin: cita.hora_fin ? cita.hora_fin.substring(0, 5) : '10:45',
          motivo_cita: cita.motivo_cita || '',
          notas: cita.notas || '',
          estado: cita.estado || 'Programada',
          recordatorio_automatico: cita.recordatorio_automatico || false
        })
        if (cita.paciente_nombres) {
          setBusquedaPaciente(`${cita.paciente_nombres} ${cita.paciente_apellidos}`)
        }
      } else {
        // Modo crear
        // Calcular hora fin (una hora después de la hora inicial)
        let horaInicio = '10:00'
        let horaFin = '11:00'
        
        if (horaInicial) {
          horaInicio = horaInicial
          // Calcular hora fin: una hora después
          const [horas, minutos] = horaInicial.split(':').map(Number)
          const fechaHora = new Date()
          fechaHora.setHours(horas, minutos, 0, 0)
          fechaHora.setHours(fechaHora.getHours() + 1)
          const horasFin = String(fechaHora.getHours()).padStart(2, '0')
          const minutosFin = String(fechaHora.getMinutes()).padStart(2, '0')
          horaFin = `${horasFin}:${minutosFin}`
        }
        
        setFormData({
          id_paciente: '',
          id_doctor: '',
          id_sala: '',
          fecha: fechaInicial || new Date().toISOString().split('T')[0],
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          motivo_cita: '',
          notas: '',
          estado: 'Programada',
          recordatorio_automatico: false
        })
        setBusquedaPaciente('')
      }
      setConflictoHorario(null)
    }
  }, [show, cita, fechaInicial, horaInicial])

  useEffect(() => {
    if (busquedaPaciente) {
      const filtrados = pacientes.filter(p => {
        const nombreCompleto = `${p.nombres} ${p.apellidos}`.toLowerCase()
        const busqueda = busquedaPaciente.toLowerCase()
        return nombreCompleto.includes(busqueda) || 
               p.celular_whatsapp?.includes(busqueda) ||
               p.email?.toLowerCase().includes(busqueda)
      })
      setPacientesFiltrados(filtrados)
      setMostrarListaPacientes(true)
    } else {
      setPacientesFiltrados([])
      setMostrarListaPacientes(false)
    }
  }, [busquedaPaciente, pacientes])

  useEffect(() => {
    // Verificar conflictos de horario cuando cambian fecha, hora o doctor
    if (formData.fecha && formData.hora_inicio && formData.id_doctor && !cita) {
      verificarConflicto()
    } else {
      setConflictoHorario(null)
    }
  }, [formData.fecha, formData.hora_inicio, formData.id_doctor])

  const cargarDatos = async () => {
    try {
      const [pacientesData, doctoresData, salasData] = await Promise.all([
        pacientesService.listarPorClinica(idClinica),
        doctoresService.listarCatalogo(idClinica),
        salasService.listarCatalogo(idClinica)
      ])
      setPacientes(pacientesData)
      setDoctores(doctoresData)
      setSalas(salasData)
    } catch (err) {
      console.error('Error al cargar datos:', err)
      await mostrarErrorAPI(err)
    }
  }

  const verificarConflicto = async () => {
    try {
      const citas = await citasService.listarPorClinica(idClinica)
      const horaInicio = formData.hora_inicio
      const fecha = formData.fecha
      const idDoctor = formData.id_doctor

      const conflicto = citas.find(c => {
        if (!c.activo || c.id_cita === cita?.id_cita) return false
        
        // Normalizar fecha de la cita para comparar
        let fechaCita = c.fecha
        if (typeof fechaCita === 'string' && fechaCita.includes('T')) {
          fechaCita = fechaCita.split('T')[0]
        }
        
        if (fechaCita !== fecha || c.id_doctor !== parseInt(idDoctor)) return false

        const citaHoraInicio = c.hora_inicio ? c.hora_inicio.substring(0, 5) : ''
        return citaHoraInicio === horaInicio
      })

      if (conflicto) {
        const doctor = doctores.find(d => d.id_doctor === parseInt(idDoctor))
        const nombreDoctor = doctor ? `${doctor.titulo || ''} ${doctor.nombres} ${doctor.apellidos}`.trim() : 'el profesional'
        
        // Generar sugerencias de horarios
        const [h, m] = horaInicio.split(':').map(Number)
        const sugerencias = []
        for (let i = 1; i <= 3; i++) {
          const nuevaHora = new Date(2000, 0, 1, h, m + (i * 30))
          sugerencias.push(nuevaHora.toTimeString().substring(0, 5))
        }

        setConflictoHorario({
          mensaje: `${nombreDoctor} ya tiene cita a las ${horaInicio}.`,
          sugerencias
        })
      } else {
        setConflictoHorario(null)
      }
    } catch (err) {
      console.error('Error al verificar conflicto:', err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const seleccionarPaciente = (paciente) => {
    setFormData({
      ...formData,
      id_paciente: paciente.id_paciente
    })
    setBusquedaPaciente(`${paciente.nombres} ${paciente.apellidos}`)
    setMostrarListaPacientes(false)
  }

  const seleccionarMotivoRapido = (motivo) => {
    setFormData({
      ...formData,
      motivo_cita: motivo
    })
  }

  const seleccionarSugerencia = (hora) => {
    setFormData({
      ...formData,
      hora_inicio: hora
    })
    setConflictoHorario(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.id_paciente) {
      await mostrarErrorAPI({ message: 'Debe seleccionar un paciente' })
      return
    }

    if (!formData.id_doctor) {
      await mostrarErrorAPI({ message: 'Debe seleccionar un profesional' })
      return
    }

    if (!formData.id_sala) {
      await mostrarErrorAPI({ message: 'Debe seleccionar una sala' })
      return
    }

    setLoading(true)

    try {
      const datosEnviar = {
        ...formData,
        id_clinica: idClinica,
        hora_inicio: `${formData.hora_inicio}:00`,
        hora_fin: `${formData.hora_fin}:00`,
        id_paciente: parseInt(formData.id_paciente),
        id_doctor: parseInt(formData.id_doctor),
        id_sala: parseInt(formData.id_sala),
        activo: true
      }

      if (cita) {
        await citasService.actualizar(cita.id_cita, idClinica, datosEnviar)
      } else {
        await citasService.crear(datosEnviar)
      }

      onSave()
      onClose()
    } catch (err) {
      console.error('Error al guardar cita:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className={`ti ti-${cita ? 'edit' : 'plus'} me-2`}></i>
              Cita - {cita ? 'Editar' : 'Crear'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Advertencia de conflicto */}
              {conflictoHorario && (
                <div className="alert alert-warning d-flex align-items-start gap-2 mb-3">
                  <i className="ti ti-alert-triangle" style={{fontSize: '20px', marginTop: '2px'}}></i>
                  <div className="flex-grow-1">
                    <strong>Conflicto de horario:</strong> {conflictoHorario.mensaje}
                    <div className="mt-2">
                      <span className="me-2">Sugerir:</span>
                      {conflictoHorario.sugerencias.map((hora, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="btn btn-sm btn-link p-0 me-2"
                          onClick={() => seleccionarSugerencia(hora)}
                          style={{textDecoration: 'underline'}}
                        >
                          {hora}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="row g-3">
                {/* Paciente */}
                <div className="col-md-6">
                  <label className="form-label">
                    Paciente <span className="text-danger">*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar o agregar..."
                      value={busquedaPaciente}
                      onChange={(e) => setBusquedaPaciente(e.target.value)}
                      onFocus={() => setMostrarListaPacientes(true)}
                    />
                    {mostrarListaPacientes && pacientesFiltrados.length > 0 && (
                      <div className="position-absolute w-100 bg-white border rounded shadow-lg" style={{zIndex: 1000, maxHeight: '200px', overflowY: 'auto', top: '100%', marginTop: '2px'}}>
                        {pacientesFiltrados.map(paciente => (
                          <div
                            key={paciente.id_paciente}
                            className="p-2 border-bottom cursor-pointer"
                            style={{cursor: 'pointer'}}
                            onClick={() => seleccionarPaciente(paciente)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          >
                            <div className="fw-semibold">{paciente.nombres} {paciente.apellidos}</div>
                            {paciente.celular_whatsapp && (
                              <small className="text-muted">{paciente.celular_whatsapp}</small>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Profesional */}
                <div className="col-md-6">
                  <label className="form-label">
                    Profesional <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    name="id_doctor"
                    value={formData.id_doctor}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar profesional</option>
                    {doctores.map(doctor => (
                      <option key={doctor.id_doctor} value={doctor.id_doctor}>
                        {doctor.titulo || 'Dr.'} {doctor.nombres} {doctor.apellidos}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha */}
                <div className="col-md-4">
                  <label className="form-label">
                    Fecha <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="ti ti-calendar"></i>
                    </span>
                    <input
                      type="date"
                      className="form-control"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Hora inicio */}
                <div className="col-md-4">
                  <label className="form-label">
                    Hora inicio <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="ti ti-clock"></i>
                    </span>
                    <input
                      type="time"
                      className="form-control"
                      name="hora_inicio"
                      value={formData.hora_inicio}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Hora fin */}
                <div className="col-md-4">
                  <label className="form-label">
                    Hora fin <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="ti ti-clock"></i>
                    </span>
                    <input
                      type="time"
                      className="form-control"
                      name="hora_fin"
                      value={formData.hora_fin}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Motivo de la cita */}
                <div className="col-md-6">
                  <label className="form-label">
                    Motivo de la cita
                  </label>
                  <textarea
                    className="form-control"
                    name="motivo_cita"
                    value={formData.motivo_cita}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Ej.: Limpieza / Dolor / Control"
                  ></textarea>
                  <div className="d-flex gap-2 mt-2">
                    {motivosRapidos.map(motivo => (
                      <button
                        key={motivo}
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => seleccionarMotivoRapido(motivo)}
                      >
                        {motivo}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notas */}
                <div className="col-md-6">
                  <label className="form-label">Notas</label>
                  <textarea
                    className="form-control"
                    name="notas"
                    value={formData.notas}
                    onChange={handleInputChange}
                    rows="3"
                  ></textarea>
                </div>

                {/* Estado */}
                <div className="col-md-6">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-select"
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                  >
                    {estados.map(estado => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                </div>

                {/* Sala */}
                <div className="col-md-6">
                  <label className="form-label">
                    Sala <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    name="id_sala"
                    value={formData.id_sala}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar sala</option>
                    {salas.map(sala => (
                      <option key={sala.id_sala} value={sala.id_sala}>
                        {sala.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recordatorio automático */}
                <div className="col-12">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="recordatorio_automatico"
                      checked={formData.recordatorio_automatico}
                      onChange={handleInputChange}
                      id="recordatorioCheck"
                    />
                    <label className="form-check-label" htmlFor="recordatorioCheck">
                      Enviar recordatorio automático
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

