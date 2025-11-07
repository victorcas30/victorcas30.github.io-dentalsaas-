'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import HorizontalLayout from '@/components/layout/HorizontalLayout'
import ConfirmModal from '@/components/ConfirmModal'
import { pacientesService } from '@/services/pacientesService'
import { authService } from '@/services/authService'
import { mostrarErrorAPI, mostrarExito } from '@/utils/sweetAlertHelper'

function DetallePacienteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const idPaciente = searchParams.get('id')
  const idClinica = authService.getClinicaId()

  const [paciente, setPaciente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModalEditar, setShowModalEditar] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [etiquetas, setEtiquetas] = useState([])
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState([])
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    sexo: 'M',
    fecha_nacimiento: '',
    dui: '',
    celular_whatsapp: '',
    telefono_secundario: '',
    email: '',
    direccion: '',
    nombre_contacto: '',
    telefono_contacto: '',
    es_paciente: true,
    consiente_tratamiento_datos: true
  })

  useEffect(() => {
    if (idPaciente) {
      cargarPaciente()
      cargarEtiquetas()
    }
  }, [idPaciente])

  const cargarEtiquetas = async () => {
    try {
      const etiquetasService = await import('@/services/etiquetasService').then(m => m.etiquetasService)
      const data = await etiquetasService.listarPorClinica(idClinica)
      setEtiquetas(data)
    } catch (err) {
      console.error('Error al cargar etiquetas:', err)
    }
  }

  const cargarPaciente = async () => {
    try {
      setLoading(true)
      const data = await pacientesService.obtenerPorId(idPaciente, idClinica)
      setPaciente(data)
    } catch (err) {
      console.error('Error al cargar paciente:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoading(false)
    }
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible'
    const date = new Date(fecha)
    return date.toLocaleDateString('es-SV', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'N/A'
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    return `${edad} años`
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const abrirModalEditar = () => {
    const fechaNacimiento = paciente.fecha_nacimiento ? paciente.fecha_nacimiento.split('T')[0] : ''
    
    setFormData({
      nombres: paciente.nombres,
      apellidos: paciente.apellidos,
      sexo: paciente.sexo,
      fecha_nacimiento: fechaNacimiento,
      dui: paciente.dui || '',
      celular_whatsapp: paciente.celular_whatsapp,
      telefono_secundario: paciente.telefono_secundario || '',
      email: paciente.email || '',
      direccion: paciente.direccion || '',
      nombre_contacto: paciente.nombre_contacto || '',
      telefono_contacto: paciente.telefono_contacto || '',
      es_paciente: paciente.es_paciente,
      consiente_tratamiento_datos: paciente.consiente_tratamiento_datos
    })
    const etiquetasAsignadas = paciente.etiquetas?.filter(e => e.asignada).map(e => e.id_etiqueta) || []
    setEtiquetasSeleccionadas(etiquetasAsignadas)
    setShowModalEditar(true)
  }

  const handleEtiquetaToggle = (idEtiqueta) => {
    setEtiquetasSeleccionadas(prev => {
      if (prev.includes(idEtiqueta)) {
        return prev.filter(id => id !== idEtiqueta)
      } else {
        return [...prev, idEtiqueta]
      }
    })
  }

  const cerrarModalEditar = () => {
    setShowModalEditar(false)
  }

  const handleSubmitEditar = async (e) => {
    e.preventDefault()
    setLoadingAction(true)

    try {
      await pacientesService.actualizar(idPaciente, idClinica, formData)
      
      const etiquetasPacienteService = await import('@/services/etiquetasPacienteService').then(m => m.etiquetasPacienteService)
      const etiquetasOriginales = paciente.etiquetas?.filter(e => e.asignada).map(e => e.id_etiqueta) || []
      
      const etiquetasAgregar = etiquetasSeleccionadas.filter(id => !etiquetasOriginales.includes(id))
      for (const idEtiqueta of etiquetasAgregar) {
        await etiquetasPacienteService.asignar(idPaciente, idEtiqueta, idClinica)
      }
      
      const etiquetasRemover = etiquetasOriginales.filter(id => !etiquetasSeleccionadas.includes(id))
      for (const idEtiqueta of etiquetasRemover) {
        await etiquetasPacienteService.desasignar(idPaciente, idEtiqueta, idClinica)
      }
      
      await mostrarExito('Paciente actualizado exitosamente')
      await cargarPaciente()
      cerrarModalEditar()
    } catch (err) {
      console.error('Error al actualizar paciente:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoadingAction(false)
    }
  }

  const confirmarEliminar = () => {
    setShowConfirmDelete(true)
  }

  const eliminarPaciente = async () => {
    try {
      await pacientesService.eliminar(idPaciente, idClinica)
      await mostrarExito('Paciente eliminado exitosamente')
      router.push('/pacientes')
    } catch (err) {
      console.error('Error al eliminar paciente:', err)
      await mostrarErrorAPI(err)
    } finally {
      setShowConfirmDelete(false)
    }
  }

  if (!idPaciente) {
    return (
      <HorizontalLayout>
        <div className="text-center py-5">
          <i className="ti ti-alert-circle" style={{fontSize: '64px', color: '#ccc'}}></i>
          <h4 className="mt-3">ID de paciente no especificado</h4>
          <button className="btn btn-primary mt-3" onClick={() => router.push('/pacientes')}>
            Volver a Pacientes
          </button>
        </div>
      </HorizontalLayout>
    )
  }

  if (loading) {
    return (
      <HorizontalLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-3 text-muted">Cargando información del paciente...</p>
        </div>
      </HorizontalLayout>
    )
  }

  if (!paciente) {
    return (
      <HorizontalLayout>
        <div className="text-center py-5">
          <i className="ti ti-user-off" style={{fontSize: '64px', color: '#ccc'}}></i>
          <h4 className="mt-3">Paciente no encontrado</h4>
          <button className="btn btn-primary mt-3" onClick={() => router.push('/pacientes')}>
            Volver a Pacientes
          </button>
        </div>
      </HorizontalLayout>
    )
  }

  return (
    <HorizontalLayout>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <button 
            className="btn btn-sm btn-outline-secondary mb-3" 
            onClick={() => router.push('/pacientes')}
          >
            <i className="ti ti-arrow-left me-2"></i>Volver a Pacientes
          </button>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                   style={{width: '64px', height: '64px', fontSize: '24px'}}>
                <i className="ti ti-user"></i>
              </div>
              <div>
                <h2 className="fw-bold mb-1">
                  {paciente.nombres} {paciente.apellidos}
                </h2>
                <div className="d-flex gap-2 flex-wrap">
                  {paciente.etiquetas?.map(etiqueta => (
                    <span 
                      key={etiqueta.id_etiqueta}
                      className="badge"
                      style={{
                        backgroundColor: etiqueta.color,
                        color: '#fff'
                      }}
                    >
                      {etiqueta.nombre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <button className="btn btn-primary me-2" onClick={abrirModalEditar}>
                <i className="ti ti-edit me-2"></i>Editar
              </button>
              <button className="btn btn-outline-danger" onClick={confirmarEliminar}>
                <i className="ti ti-trash me-2"></i>Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Editar Paciente */}
      {showModalEditar && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="ti ti-edit me-2"></i>
                  Editar Paciente
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModalEditar}></button>
              </div>
              <form onSubmit={handleSubmitEditar}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Nombres <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="nombres" 
                        value={formData.nombres} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Apellidos <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="apellidos" 
                        value={formData.apellidos} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Sexo <span className="text-danger">*</span></label>
                      <select 
                        className="form-select" 
                        name="sexo" 
                        value={formData.sexo} 
                        onChange={handleInputChange} 
                        required
                      >
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Fecha de Nacimiento <span className="text-danger">*</span></label>
                      <input 
                        type="date" 
                        className="form-control" 
                        name="fecha_nacimiento" 
                        value={formData.fecha_nacimiento} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">DUI</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="dui" 
                        value={formData.dui} 
                        onChange={handleInputChange} 
                        placeholder="12345678-9"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Celular/WhatsApp <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="celular_whatsapp" 
                        value={formData.celular_whatsapp} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="7890-1234"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Teléfono Secundario</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="telefono_secundario" 
                        value={formData.telefono_secundario} 
                        onChange={handleInputChange} 
                        placeholder="2234-5678"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Dirección</label>
                      <textarea 
                        className="form-control" 
                        name="direccion" 
                        value={formData.direccion} 
                        onChange={handleInputChange} 
                        rows="2"
                      ></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Nombre Contacto Emergencia</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="nombre_contacto" 
                        value={formData.nombre_contacto} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Teléfono Contacto Emergencia</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="telefono_contacto" 
                        value={formData.telefono_contacto} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          name="es_paciente" 
                          checked={formData.es_paciente} 
                          onChange={handleInputChange} 
                        />
                        <label className="form-check-label">Es paciente</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          name="consiente_tratamiento_datos" 
                          checked={formData.consiente_tratamiento_datos} 
                          onChange={handleInputChange} 
                        />
                        <label className="form-check-label">Consiente tratamiento de datos</label>
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <hr />
                      <label className="form-label fw-bold">Etiquetas</label>
                      <div className="d-flex flex-wrap gap-2">
                        {etiquetas.map(etiqueta => {
                          const seleccionada = etiquetasSeleccionadas.includes(etiqueta.id_etiqueta)
                          return (
                            <button
                              key={etiqueta.id_etiqueta}
                              type="button"
                              className={`btn btn-sm ${seleccionada ? '' : 'btn-outline-secondary'}`}
                              style={seleccionada ? {
                                backgroundColor: etiqueta.color,
                                borderColor: etiqueta.color,
                                color: '#fff'
                              } : {}}
                              onClick={() => handleEtiquetaToggle(etiqueta.id_etiqueta)}
                            >
                              {etiqueta.nombre}
                            </button>
                          )
                        })}
                      </div>
                      <small className="text-muted">Selecciona las etiquetas para este paciente</small>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cerrarModalEditar}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loadingAction}>
                    {loadingAction ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Guardando...
                      </>
                    ) : (
                      'Guardar Cambios'
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
        onConfirm={eliminarPaciente}
        onCancel={() => setShowConfirmDelete(false)}
        title="¿Estás seguro?"
        message={`¿Deseas eliminar al paciente "${paciente?.nombres} ${paciente?.apellidos}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        confirmColor="danger"
        icon="ti ti-alert-triangle"
      />

      <div className="row">
        {/* Información Personal */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="ti ti-user-circle me-2"></i>
                Información Personal
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-6">
                  <small className="text-muted d-block">Sexo</small>
                  <span className="fw-semibold">{paciente.sexo === 'M' ? 'Masculino' : 'Femenino'}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Fecha de Nacimiento</small>
                  <span className="fw-semibold">{formatearFecha(paciente.fecha_nacimiento)}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Edad</small>
                  <span className="fw-semibold">{calcularEdad(paciente.fecha_nacimiento)}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">DUI</small>
                  <span className="fw-semibold">{paciente.dui || 'No registrado'}</span>
                </div>
                <div className="col-12">
                  <small className="text-muted d-block">Dirección</small>
                  <span className="fw-semibold">{paciente.direccion || 'No registrada'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="ti ti-phone me-2"></i>
                Información de Contacto
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-6">
                  <small className="text-muted d-block">Celular/WhatsApp</small>
                  <span className="fw-semibold">{paciente.celular_whatsapp || 'No registrado'}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Teléfono Secundario</small>
                  <span className="fw-semibold">{paciente.telefono_secundario || 'No registrado'}</span>
                </div>
                <div className="col-12">
                  <small className="text-muted d-block">Email</small>
                  <span className="fw-semibold">{paciente.email || 'No registrado'}</span>
                </div>
                <div className="col-12">
                  <hr />
                  <h6 className="fw-bold mb-3">Contacto de Emergencia</h6>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Nombre</small>
                  <span className="fw-semibold">{paciente.nombre_contacto || 'No registrado'}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Teléfono</small>
                  <span className="fw-semibold">{paciente.telefono_contacto || 'No registrado'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estado y Consentimientos */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="ti ti-shield-check me-2"></i>
                Estado y Consentimientos
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span>Es paciente activo</span>
                <span className={`badge ${paciente.es_paciente ? 'bg-success' : 'bg-danger'}`}>
                  {paciente.es_paciente ? 'Sí' : 'No'}
                </span>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <span>Consiente tratamiento de datos</span>
                <span className={`badge ${paciente.consiente_tratamiento_datos ? 'bg-success' : 'bg-danger'}`}>
                  {paciente.consiente_tratamiento_datos ? 'Sí' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fechas de Registro */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="ti ti-clock me-2"></i>
                Información de Registro
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <small className="text-muted d-block">Fecha de Creación</small>
                <span className="fw-semibold">{formatearFecha(paciente.created_at)}</span>
              </div>
              <div>
                <small className="text-muted d-block">Última Actualización</small>
                <span className="fw-semibold">{formatearFecha(paciente.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs para futuras funcionalidades */}
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs" role="tablist">
            <li className="nav-item">
              <a className="nav-link active" href="#" role="tab">
                <i className="ti ti-calendar me-2"></i>Citas
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#" role="tab">
                <i className="ti ti-file-text me-2"></i>Historia Clínica
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#" role="tab">
                <i className="ti ti-receipt me-2"></i>Facturación
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#" role="tab">
                <i className="ti ti-photo me-2"></i>Imágenes
              </a>
            </li>
          </ul>
        </div>
        <div className="card-body">
          <div className="text-center py-5">
            <i className="ti ti-calendar-off" style={{fontSize: '48px', color: '#ccc'}}></i>
            <p className="mt-3 text-muted">Esta funcionalidad estará disponible próximamente</p>
          </div>
        </div>
      </div>
    </HorizontalLayout>
  )
}

export default function DetallePaciente() {
  return (
    <Suspense fallback={
      <HorizontalLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-3 text-muted">Cargando...</p>
        </div>
      </HorizontalLayout>
    }>
      <DetallePacienteContent />
    </Suspense>
  )
}
