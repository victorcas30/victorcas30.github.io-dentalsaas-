'use client'

import { useState, useEffect } from 'react'
import HorizontalLayout from '@/components/layout/HorizontalLayout'
import ConfirmModal from '@/components/ConfirmModal'
import { bloqueosAgendaService } from '@/services/bloqueosAgendaService'
import { doctoresService } from '@/services/doctoresService'
import { authService } from '@/services/authService'
import { mostrarErrorAPI, mostrarExito } from '@/utils/sweetAlertHelper'
import { extraerFechaParaInput, formatearFecha } from '@/utils/dateHelper'

export default function AgendaBloqueo() {
  const [bloqueos, setBloqueos] = useState([])
  const [doctores, setDoctores] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingDoctores, setLoadingDoctores] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('crear')
  const [bloqueoSeleccionado, setBloqueoSeleccionado] = useState(null)
  const [loadingAction, setLoadingAction] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [bloqueoToDelete, setBloqueoToDelete] = useState(null)
  const [filtroTipo, setFiltroTipo] = useState('TODOS') // TODOS, CLINICA, DOCTOR
  
  const [formData, setFormData] = useState({
    tipo_bloqueo: 'CLINICA',
    id_doctor: '',
    fecha_inicio: '',
    fecha_fin: '',
    dia_completo: true,
    hora_inicio: '',
    hora_fin: '',
    motivo: ''
  })

  const idClinica = authService.getClinicaId()

  useEffect(() => {
    cargarBloqueos()
    cargarDoctores()
  }, [])

  const cargarDoctores = async () => {
    try {
      setLoadingDoctores(true)
      const data = await doctoresService.listarPorClinica(idClinica)
      setDoctores(data)
    } catch (err) {
      console.error('Error al cargar doctores:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoadingDoctores(false)
    }
  }

  const cargarBloqueos = async () => {
    try {
      setLoading(true)
      const data = await bloqueosAgendaService.listarPorClinica(idClinica)
      setBloqueos(data)
    } catch (err) {
      console.error('Error al cargar bloqueos:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      })
    } else if (name === 'tipo_bloqueo') {
      // Si cambia el tipo, limpiar id_doctor si es CLINICA
      setFormData({
        ...formData,
        [name]: value,
        id_doctor: value === 'CLINICA' ? '' : formData.id_doctor
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const abrirModalCrear = () => {
    setModalMode('crear')
    setFormData({
      tipo_bloqueo: 'CLINICA',
      id_doctor: '',
      fecha_inicio: '',
      fecha_fin: '',
      dia_completo: true,
      hora_inicio: '',
      hora_fin: '',
      motivo: ''
    })
    setBloqueoSeleccionado(null)
    setShowModal(true)
  }

  const abrirModalEditar = (bloqueo) => {
    setModalMode('editar')
    
    setFormData({
      tipo_bloqueo: bloqueo.tipo_bloqueo,
      id_doctor: bloqueo.id_doctor ? bloqueo.id_doctor.toString() : '',
      fecha_inicio: extraerFechaParaInput(bloqueo.fecha_inicio),
      fecha_fin: extraerFechaParaInput(bloqueo.fecha_fin),
      dia_completo: bloqueo.dia_completo,
      hora_inicio: bloqueo.hora_inicio ? bloqueo.hora_inicio.substring(0, 5) : '',
      hora_fin: bloqueo.hora_fin ? bloqueo.hora_fin.substring(0, 5) : '',
      motivo: bloqueo.motivo || ''
    })
    setBloqueoSeleccionado(bloqueo)
    setShowModal(true)
  }

  const cerrarModal = () => {
    setShowModal(false)
    setBloqueoSeleccionado(null)
  }

  const validarFormulario = () => {
    // Validar tipo_bloqueo e id_doctor
    if (formData.tipo_bloqueo === 'CLINICA' && formData.id_doctor) {
      throw new Error('Si el tipo de bloqueo es CLINICA, no debe seleccionar un doctor')
    }
    if (formData.tipo_bloqueo === 'DOCTOR' && !formData.id_doctor) {
      throw new Error('Si el tipo de bloqueo es DOCTOR, debe seleccionar un doctor')
    }

    // Validar fechas
    if (!formData.fecha_inicio || !formData.fecha_fin) {
      throw new Error('Las fechas de inicio y fin son requeridas')
    }

    if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
      throw new Error('La fecha de fin debe ser mayor o igual a la fecha de inicio')
    }

    // Validar horas si no es día completo
    if (!formData.dia_completo) {
      if (!formData.hora_inicio || !formData.hora_fin) {
        throw new Error('Las horas de inicio y fin son requeridas cuando no es día completo')
      }

      const horaInicio = formData.hora_inicio.split(':')
      const horaFin = formData.hora_fin.split(':')
      const minutosInicio = parseInt(horaInicio[0]) * 60 + parseInt(horaInicio[1])
      const minutosFin = parseInt(horaFin[0]) * 60 + parseInt(horaFin[1])

      if (minutosFin <= minutosInicio) {
        throw new Error('La hora de fin debe ser mayor que la hora de inicio')
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoadingAction(true)

    try {
      validarFormulario()

      const body = {
        id_clinica: idClinica,
        tipo_bloqueo: formData.tipo_bloqueo,
        id_doctor: formData.tipo_bloqueo === 'CLINICA' ? null : parseInt(formData.id_doctor),
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        dia_completo: formData.dia_completo,
        hora_inicio: formData.dia_completo ? null : `${formData.hora_inicio}:00`,
        hora_fin: formData.dia_completo ? null : `${formData.hora_fin}:00`,
        motivo: formData.motivo || null
      }

      if (modalMode === 'crear') {
        await bloqueosAgendaService.crear(body)
        await mostrarExito('Bloqueo creado exitosamente')
      } else {
        await bloqueosAgendaService.actualizar(bloqueoSeleccionado.id_bloqueo, idClinica, body)
        await mostrarExito('Bloqueo actualizado exitosamente')
      }
      
      cargarBloqueos()
      cerrarModal()
    } catch (err) {
      console.error('Error al guardar bloqueo:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoadingAction(false)
    }
  }

  const confirmarEliminar = (bloqueo) => {
    setBloqueoToDelete(bloqueo)
    setShowConfirmDelete(true)
  }

  const eliminarBloqueo = async () => {
    try {
      await bloqueosAgendaService.eliminar(bloqueoToDelete.id_bloqueo, idClinica)
      await mostrarExito('Bloqueo eliminado exitosamente')
      cargarBloqueos()
    } catch (err) {
      console.error('Error al eliminar bloqueo:', err)
      await mostrarErrorAPI(err)
    } finally {
      setShowConfirmDelete(false)
      setBloqueoToDelete(null)
    }
  }


  const formatearHora = (hora) => {
    if (!hora) return '—'
    const horaStr = hora.toString()
    if (horaStr.includes(':')) {
      return horaStr.substring(0, 5)
    }
    return horaStr
  }

  const obtenerNombreDoctor = (bloqueo) => {
    if (bloqueo.tipo_bloqueo === 'CLINICA') {
      return 'Toda la clínica'
    }
    if (bloqueo.doctor_nombres && bloqueo.doctor_apellidos) {
      const titulo = bloqueo.doctor_titulo || 'Dr.'
      return `${titulo} ${bloqueo.doctor_nombres} ${bloqueo.doctor_apellidos}`
    }
    return 'Doctor no especificado'
  }

  const bloqueosFiltrados = bloqueos.filter(bloqueo => {
    if (filtroTipo === 'TODOS') return true
    return bloqueo.tipo_bloqueo === filtroTipo
  })

  return (
    <HorizontalLayout>
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="fw-bold mb-2">
                <i className="ti ti-calendar-off me-2"></i>
                Bloqueos de Agenda
              </h2>
              <p className="text-muted mb-0">
                Gestiona los bloqueos de agenda para la clínica y doctores
              </p>
            </div>
            <button className="btn btn-primary" onClick={abrirModalCrear}>
              <i className="ti ti-plus me-2"></i>
              Nuevo Bloqueo
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Filtrar por tipo</label>
              <select 
                className="form-select" 
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="TODOS">Todos los bloqueos</option>
                <option value="CLINICA">Solo bloqueos de clínica</option>
                <option value="DOCTOR">Solo bloqueos de doctor</option>
              </select>
            </div>
            <div className="col-md-8">
              <div className="d-flex gap-2">
                <span className="badge bg-info">
                  Total: {bloqueosFiltrados.length}
                </span>
                <span className="badge bg-warning">
                  Clínica: {bloqueos.filter(b => b.tipo_bloqueo === 'CLINICA').length}
                </span>
                <span className="badge bg-primary">
                  Doctor: {bloqueos.filter(b => b.tipo_bloqueo === 'DOCTOR').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de bloqueos */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-3 text-muted">Cargando bloqueos...</p>
            </div>
          ) : bloqueosFiltrados.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-calendar-off" style={{fontSize: '64px', color: '#ccc'}}></i>
              <h4 className="mt-3 mb-2">No hay bloqueos</h4>
              <p className="text-muted mb-3">
                {filtroTipo === 'TODOS' 
                  ? 'Comienza creando el primer bloqueo de agenda'
                  : `No hay bloqueos de tipo ${filtroTipo}`
                }
              </p>
              {filtroTipo === 'TODOS' && (
                <button className="btn btn-primary" onClick={abrirModalCrear}>
                  <i className="ti ti-plus me-2"></i>Crear Bloqueo
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Tipo</th>
                    <th>Doctor/Clínica</th>
                    <th>Fecha Inicio</th>
                    <th>Fecha Fin</th>
                    <th>Horario</th>
                    <th>Motivo</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {bloqueosFiltrados.map((bloqueo) => (
                    <tr key={bloqueo.id_bloqueo}>
                      <td>
                        <span className={`badge ${bloqueo.tipo_bloqueo === 'CLINICA' ? 'bg-warning' : 'bg-primary'}`}>
                          {bloqueo.tipo_bloqueo === 'CLINICA' ? 'Clínica' : 'Doctor'}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold">
                          {obtenerNombreDoctor(bloqueo)}
                        </div>
                      </td>
                      <td>{formatearFecha(bloqueo.fecha_inicio, { formato: 'solo-fecha' })}</td>
                      <td>{formatearFecha(bloqueo.fecha_fin, { formato: 'solo-fecha' })}</td>
                      <td>
                        {bloqueo.dia_completo ? (
                          <span className="badge bg-success">Día completo</span>
                        ) : (
                          <span>
                            {formatearHora(bloqueo.hora_inicio)} - {formatearHora(bloqueo.hora_fin)}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="text-muted">
                          {bloqueo.motivo || 'Sin motivo'}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group" role="group">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => abrirModalEditar(bloqueo)}
                            title="Editar"
                          >
                            <i className="ti ti-edit"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => confirmarEliminar(bloqueo)}
                            title="Eliminar"
                          >
                            <i className="ti ti-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar Bloqueo */}
      {showModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={`ti ti-${modalMode === 'crear' ? 'plus' : 'edit'} me-2`}></i>
                  {modalMode === 'crear' ? 'Nuevo Bloqueo' : 'Editar Bloqueo'}
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Tipo de Bloqueo <span className="text-danger">*</span>
                      </label>
                      <select 
                        className="form-select" 
                        name="tipo_bloqueo"
                        value={formData.tipo_bloqueo} 
                        onChange={handleInputChange} 
                        required
                      >
                        <option value="CLINICA">Clínica (afecta toda la clínica)</option>
                        <option value="DOCTOR">Doctor (afecta solo un doctor)</option>
                      </select>
                    </div>
                    {formData.tipo_bloqueo === 'DOCTOR' && (
                      <div className="col-md-6">
                        <label className="form-label">
                          Doctor <span className="text-danger">*</span>
                        </label>
                        {loadingDoctores ? (
                          <div className="form-control">
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Cargando doctores...
                          </div>
                        ) : (
                          <select 
                            className="form-select" 
                            name="id_doctor"
                            value={formData.id_doctor} 
                            onChange={handleInputChange} 
                            required={formData.tipo_bloqueo === 'DOCTOR'}
                          >
                            <option value="">Seleccione un doctor</option>
                            {doctores.map((doctor) => (
                              <option key={doctor.id_doctor} value={doctor.id_doctor}>
                                {doctor.nombre_titulo || doctor.nombre}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}
                    <div className="col-md-6">
                      <label className="form-label">
                        Fecha Inicio <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="date" 
                        className="form-control" 
                        name="fecha_inicio" 
                        value={formData.fecha_inicio} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Fecha Fin <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="date" 
                        className="form-control" 
                        name="fecha_fin" 
                        value={formData.fecha_fin} 
                        onChange={handleInputChange} 
                        required 
                        min={formData.fecha_inicio}
                      />
                    </div>
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          name="dia_completo"
                          id="dia_completo"
                          checked={formData.dia_completo} 
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="dia_completo">
                          Día completo
                        </label>
                      </div>
                      <small className="text-muted">
                        Si está activado, el bloqueo aplica para todo el día. Si no, especifique las horas.
                      </small>
                    </div>
                    {!formData.dia_completo && (
                      <>
                        <div className="col-md-6">
                          <label className="form-label">
                            Hora Inicio <span className="text-danger">*</span>
                          </label>
                          <input 
                            type="time" 
                            className="form-control" 
                            name="hora_inicio" 
                            value={formData.hora_inicio} 
                            onChange={handleInputChange} 
                            required={!formData.dia_completo}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">
                            Hora Fin <span className="text-danger">*</span>
                          </label>
                          <input 
                            type="time" 
                            className="form-control" 
                            name="hora_fin" 
                            value={formData.hora_fin} 
                            onChange={handleInputChange} 
                            required={!formData.dia_completo}
                          />
                        </div>
                      </>
                    )}
                    <div className="col-12">
                      <label className="form-label">Motivo</label>
                      <textarea 
                        className="form-control" 
                        name="motivo" 
                        value={formData.motivo} 
                        onChange={handleInputChange} 
                        rows="3"
                        placeholder="Ej: Vacaciones, Mantenimiento, Capacitación..."
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loadingAction}>
                    {loadingAction ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Guardando...
                      </>
                    ) : (
                      modalMode === 'crear' ? 'Crear' : 'Guardar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        show={showConfirmDelete}
        onConfirm={eliminarBloqueo}
        onCancel={() => {
          setShowConfirmDelete(false)
          setBloqueoToDelete(null)
        }}
        title="¿Estás seguro?"
        message={`¿Deseas eliminar este bloqueo de agenda? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        confirmColor="danger"
        icon="ti ti-alert-triangle"
      />
    </HorizontalLayout>
  )
}

