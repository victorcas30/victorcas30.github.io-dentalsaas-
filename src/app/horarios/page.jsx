'use client'

import { useState, useEffect } from 'react'
import HorizontalLayout from '@/components/layout/HorizontalLayout'
import { horariosService } from '@/services/horariosService'
import { authService } from '@/services/authService'
import { mostrarErrorAPI, mostrarExito } from '@/utils/sweetAlertHelper'

export default function Horarios() {
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({})

  const idClinica = authService.getClinicaId()

  // Días de la semana en orden
  const diasSemana = [
    { numero: 1, nombre: 'Lunes', nombreCorto: 'Lun' },
    { numero: 2, nombre: 'Martes', nombreCorto: 'Mar' },
    { numero: 3, nombre: 'Miércoles', nombreCorto: 'Mié' },
    { numero: 4, nombre: 'Jueves', nombreCorto: 'Jue' },
    { numero: 5, nombre: 'Viernes', nombreCorto: 'Vie' },
    { numero: 6, nombre: 'Sábado', nombreCorto: 'Sáb' },
    { numero: 7, nombre: 'Domingo', nombreCorto: 'Dom' }
  ]

  useEffect(() => {
    cargarHorarios()
  }, [])

  const cargarHorarios = async () => {
    try {
      setLoading(true)
      const data = await horariosService.listarPorClinica(idClinica)
      
      // Ordenar por dia_numero
      const horariosOrdenados = data.sort((a, b) => a.dia_numero - b.dia_numero)
      setHorarios(horariosOrdenados)

      // Inicializar formData con los horarios cargados
      const initialFormData = {}
      horariosOrdenados.forEach(horario => {
        // Extraer solo HH:mm del formato HH:mm:ss
        const horaInicio = horario.hora_inicio ? horario.hora_inicio.substring(0, 5) : '08:00'
        const horaFin = horario.hora_fin ? horario.hora_fin.substring(0, 5) : '17:00'
        
        initialFormData[horario.dia_numero] = {
          id_horario: horario.id_horario,
          id_clinica: horario.id_clinica,
          hora_inicio: horario.activo ? horaInicio : (horaInicio === '00:00' ? '08:00' : horaInicio),
          hora_fin: horario.activo ? horaFin : (horaFin === '00:00' ? '17:00' : horaFin),
          activo: horario.activo
        }
      })
      
      // Asegurar que todos los días de la semana estén presentes
      diasSemana.forEach(dia => {
        if (!initialFormData[dia.numero]) {
          // Si falta un día, crear un horario por defecto inactivo
          initialFormData[dia.numero] = {
            id_horario: null,
            id_clinica: idClinica,
            hora_inicio: '08:00',
            hora_fin: '17:00',
            activo: false
          }
        }
      })
      
      setFormData(initialFormData)
    } catch (err) {
      console.error('Error al cargar horarios:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (diaNumero, field, value) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [diaNumero]: {
          ...prev[diaNumero],
          [field]: value
        }
      }

      // Si se desactiva un día, establecer horas a 00:00
      if (field === 'activo' && !value) {
        updated[diaNumero].hora_inicio = '00:00'
        updated[diaNumero].hora_fin = '00:00'
      }

      // Si se activa un día y las horas están en 00:00, establecer valores por defecto
      if (field === 'activo' && value && 
          updated[diaNumero].hora_inicio === '00:00' && 
          updated[diaNumero].hora_fin === '00:00') {
        updated[diaNumero].hora_inicio = '08:00'
        updated[diaNumero].hora_fin = '17:00'
      }

      return updated
    })
  }

  const validarHorarios = () => {
    const errores = []

    Object.keys(formData).forEach(diaNumero => {
      const horario = formData[diaNumero]
      
      if (horario.activo) {
        const horaInicio = horario.hora_inicio
        const horaFin = horario.hora_fin

        if (!horaInicio || !horaFin) {
          errores.push(`El día ${diasSemana.find(d => d.numero === parseInt(diaNumero))?.nombre} debe tener hora de inicio y fin`)
          return
        }

        // Convertir horas a minutos para comparar
        const [hInicio, mInicio] = horaInicio.split(':').map(Number)
        const [hFin, mFin] = horaFin.split(':').map(Number)
        const minutosInicio = hInicio * 60 + mInicio
        const minutosFin = hFin * 60 + mFin

        if (minutosFin <= minutosInicio) {
          errores.push(`En ${diasSemana.find(d => d.numero === parseInt(diaNumero))?.nombre}, la hora de fin debe ser mayor que la hora de inicio`)
        }
      }
    })

    return errores
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const errores = validarHorarios()
    if (errores.length > 0) {
      await mostrarErrorAPI({
        message: 'Errores de validación',
        errors: errores.map((msg, index) => ({
          field: `dia_${index}`,
          message: msg
        }))
      })
      return
    }

    setSaving(true)

    try {
      // Preparar el array de horarios para enviar
      const horariosParaEnviar = Object.keys(formData)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(diaNumero => {
          const horario = formData[diaNumero]
          
          // Validar que tenga id_horario
          if (!horario.id_horario) {
            throw new Error(`El día ${diasSemana.find(d => d.numero === parseInt(diaNumero))?.nombre} no tiene un horario configurado. Por favor, recarga la página.`)
          }
          
          return {
            id_horario: horario.id_horario,
            id_clinica: horario.id_clinica,
            hora_inicio: horario.activo ? `${horario.hora_inicio}:00` : '00:00:00',
            hora_fin: horario.activo ? `${horario.hora_fin}:00` : '00:00:00',
            activo: horario.activo
          }
        })

      await horariosService.actualizarHorarios(idClinica, horariosParaEnviar)
      await mostrarExito('Horarios actualizados exitosamente')
      cargarHorarios()
    } catch (err) {
      console.error('Error al guardar horarios:', err)
      await mostrarErrorAPI(err)
    } finally {
      setSaving(false)
    }
  }

  const getHorarioPorDia = (diaNumero) => {
    return formData[diaNumero] || null
  }

  return (
    <HorizontalLayout>
      {/* Header de la página */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="fw-bold mb-2">
                <i className="ti ti-clock me-2"></i>
                Horarios
              </h2>
              <p className="text-muted mb-0">
                Configura los horarios de atención de tu clínica
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                  <p className="mt-3 text-muted">Cargando horarios...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '200px' }}>Día</th>
                          <th>Hora de Inicio</th>
                          <th>Hora de Fin</th>
                          <th style={{ width: '120px' }}>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diasSemana.map((dia) => {
                          const horario = getHorarioPorDia(dia.numero)
                          if (!horario) return null

                          return (
                            <tr key={dia.numero}>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                       style={{width: '40px', height: '40px', fontSize: '16px', fontWeight: 'bold'}}>
                                    {dia.nombreCorto}
                                  </div>
                                  <div className="fw-semibold">{dia.nombre}</div>
                                </div>
                              </td>
                              <td>
                                <input
                                  type="time"
                                  className="form-control"
                                  value={horario.hora_inicio}
                                  onChange={(e) => handleInputChange(dia.numero, 'hora_inicio', e.target.value)}
                                  disabled={!horario.activo}
                                  required={horario.activo}
                                />
                              </td>
                              <td>
                                <input
                                  type="time"
                                  className="form-control"
                                  value={horario.hora_fin}
                                  onChange={(e) => handleInputChange(dia.numero, 'hora_fin', e.target.value)}
                                  disabled={!horario.activo}
                                  required={horario.activo}
                                />
                              </td>
                              <td>
                                <div className="form-check form-switch">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={horario.activo}
                                    onChange={(e) => handleInputChange(dia.numero, 'activo', e.target.checked)}
                                    id={`activo-${dia.numero}`}
                                  />
                                  <label className="form-check-label" htmlFor={`activo-${dia.numero}`}>
                                    {horario.activo ? (
                                      <span className="badge bg-success">Activo</span>
                                    ) : (
                                      <span className="badge bg-secondary">Inactivo</span>
                                    )}
                                  </label>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <i className="ti ti-device-floppy me-2"></i>
                          Guardar Horarios
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="card mt-3">
            <div className="card-body">
              <div className="d-flex align-items-start gap-3">
                <i className="ti ti-info-circle text-primary" style={{fontSize: '24px', marginTop: '2px'}}></i>
                <div>
                  <h6 className="fw-semibold mb-2">Información sobre los horarios</h6>
                  <ul className="mb-0 text-muted" style={{paddingLeft: '20px'}}>
                    <li>Los días marcados como inactivos no estarán disponibles para agendar citas</li>
                    <li>La hora de fin debe ser mayor que la hora de inicio</li>
                    <li>Los cambios se aplicarán a todos los horarios de la clínica</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HorizontalLayout>
  )
}
