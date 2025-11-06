'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import HorizontalLayout from '@/components/layout/HorizontalLayout'
import ConfirmModal from '@/components/ConfirmModal'
import { pacientesService } from '@/services/pacientesService'
import { etiquetasService } from '@/services/etiquetasService'
import { authService } from '@/services/authService'
import { mostrarErrorAPI, mostrarExito } from '@/utils/sweetAlertHelper'

export default function Pacientes() {
  const router = useRouter()
  const [pacientes, setPacientes] = useState([])
  const [etiquetas, setEtiquetas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('crear')
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)
  const [loadingAction, setLoadingAction] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [pacienteToDelete, setPacienteToDelete] = useState(null)
  
  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [etiquetaFiltro, setEtiquetaFiltro] = useState('todas')

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
    consiente_tratamiento_datos: true,
    etiquetas: []
  })

  const idClinica = authService.getClinicaId()

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [pacientesData, etiquetasData] = await Promise.all([
        pacientesService.listarPorClinica(idClinica),
        etiquetasService.listarPorClinica(idClinica)
      ])
      setPacientes(pacientesData)
      setEtiquetas(etiquetasData)
    } catch (err) {
      console.error('Error al cargar datos:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleEtiquetaToggle = (idEtiqueta) => {
    const etiquetasActuales = formData.etiquetas || []
    const existe = etiquetasActuales.includes(idEtiqueta)
    
    setFormData({
      ...formData,
      etiquetas: existe 
        ? etiquetasActuales.filter(id => id !== idEtiqueta)
        : [...etiquetasActuales, idEtiqueta]
    })
  }

  const abrirModalCrear = () => {
    setModalMode('crear')
    setFormData({
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
      consiente_tratamiento_datos: true,
      etiquetas: []
    })
    setPacienteSeleccionado(null)
    setShowModal(true)
  }

  const abrirModalEditar = (paciente) => {
    setModalMode('editar')
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
      consiente_tratamiento_datos: paciente.consiente_tratamiento_datos,
      etiquetas: []
    })
    setPacienteSeleccionado(paciente)
    setShowModal(true)
  }

  const cerrarModal = () => {
    setShowModal(false)
    setPacienteSeleccionado(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoadingAction(true)

    try {
      const body = {
        ...formData,
        id_clinica: idClinica
      }

      if (modalMode === 'crear') {
        await pacientesService.crear(body)
        await mostrarExito('Paciente creado exitosamente')
      } else {
        const { etiquetas, ...datosActualizar } = body
        await pacientesService.actualizar(pacienteSeleccionado.id_paciente, idClinica, datosActualizar)
        await mostrarExito('Paciente actualizado exitosamente')
      }
      
      cargarDatos()
      cerrarModal()
    } catch (err) {
      console.error('Error al guardar paciente:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoadingAction(false)
    }
  }

  const confirmarEliminar = (paciente) => {
    setPacienteToDelete(paciente)
    setShowConfirmDelete(true)
  }

  const eliminarPaciente = async () => {
    try {
      await pacientesService.eliminar(pacienteToDelete.id_paciente, idClinica)
      await mostrarExito('Paciente eliminado exitosamente')
      cargarDatos()
    } catch (err) {
      console.error('Error al eliminar paciente:', err)
      await mostrarErrorAPI(err)
    } finally {
      setShowConfirmDelete(false)
      setPacienteToDelete(null)
    }
  }

  const verDetalle = (idPaciente) => {
    router.push(`/pacientes/${idPaciente}`)
  }

  const pacientesFiltrados = pacientes.filter(paciente => {
    const coincideBusqueda = busqueda === '' || 
      paciente.nombres?.toLowerCase().includes(busqueda.toLowerCase()) ||
      paciente.apellidos?.toLowerCase().includes(busqueda.toLowerCase()) ||
      paciente.celular_whatsapp?.includes(busqueda) ||
      paciente.email?.toLowerCase().includes(busqueda.toLowerCase())

    const coincideEtiqueta = etiquetaFiltro === 'todas' || 
      paciente.etiquetas?.some(e => e.id_etiqueta === parseInt(etiquetaFiltro))

    return coincideBusqueda && coincideEtiqueta
  })

  const formatearFecha = (fecha) => {
    if (!fecha) return '—'
    const date = new Date(fecha)
    return date.toLocaleDateString('es-SV', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <HorizontalLayout>
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="fw-bold mb-2">
                <i className="ti ti-users me-2"></i>
                Pacientes
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y acciones */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ti ti-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por nombre, teléfono o email"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select"
                value={etiquetaFiltro}
                onChange={(e) => setEtiquetaFiltro(e.target.value)}
              >
                <option value="todas">Etiqueta: Todas</option>
                {etiquetas.map(etiqueta => (
                  <option key={etiqueta.id_etiqueta} value={etiqueta.id_etiqueta}>
                    {etiqueta.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4 text-end">
              <button className="btn btn-outline-secondary me-2">
                <i className="ti ti-filter me-2"></i>
                Más filtros
              </button>
              <button className="btn btn-primary" onClick={abrirModalCrear}>
                <i className="ti ti-plus me-2"></i>
                Nuevo paciente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de pacientes */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-3 text-muted">Cargando pacientes...</p>
            </div>
          ) : pacientesFiltrados.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-users-off" style={{fontSize: '64px', color: '#ccc'}}></i>
              <h4 className="mt-3 mb-2">No hay pacientes</h4>
              <p className="text-muted mb-3">
                {busqueda || etiquetaFiltro !== 'todas' 
                  ? 'No se encontraron pacientes con los filtros aplicados'
                  : 'Comienza creando tu primer paciente'
                }
              </p>
              {!busqueda && etiquetaFiltro === 'todas' && (
                <button className="btn btn-primary" onClick={abrirModalCrear}>
                  <i className="ti ti-plus me-2"></i>Crear Paciente
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Última cita</th>
                    <th>Próxima cita</th>
                    <th>Etiquetas</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientesFiltrados.map((paciente) => (
                    <tr key={paciente.id_paciente}>
                      <td>
                        <div className="fw-semibold">{paciente.nombres} {paciente.apellidos}</div>
                      </td>
                      <td>{paciente.celular_whatsapp || '—'}</td>
                      <td>{paciente.email || '—'}</td>
                      <td>{formatearFecha(paciente.ultima_cita)}</td>
                      <td>{formatearFecha(paciente.proxima_cita)}</td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
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
                      </td>
                      <td className="text-end">
                        <div className="btn-group" role="group">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => abrirModalEditar(paciente)}
                            title="Editar"
                          >
                            <i className="ti ti-edit"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => verDetalle(paciente.id_paciente)}
                            title="Ver detalle"
                          >
                            <i className="ti ti-eye"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => confirmarEliminar(paciente)}
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

      {/* Modal Crear/Editar Paciente - Mejorado con iconos */}
      {showModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-primary">
                <h5 className="modal-title text-white">
                  <i className={`ti ti-${modalMode === 'crear' ? 'user-plus' : 'user-edit'} me-2`}></i>
                  {modalMode === 'crear' ? 'Nuevo Paciente' : 'Editar Paciente'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={cerrarModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* Sección: Información Personal */}
                  <h5 className="fs-4 fw-semibold mb-4 text-primary">
                    <i className="ti ti-user-circle me-2"></i>Información Personal
                  </h5>
                  
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <i className="ti ti-user me-2"></i>Nombres <span className="text-danger">*</span>
                      </label>
                      <div className="input-group border rounded-1">
                        <span className="input-group-text bg-transparent border-0">
                          <i className="ti ti-user fs-6"></i>
                        </span>
                        <input 
                          type="text" 
                          className="form-control border-0 ps-2" 
                          name="nombres" 
                          value={formData.nombres} 
                          onChange={handleInputChange} 
                          placeholder="Juan Carlos"
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <i className="ti ti-user me-2"></i>Apellidos <span className="text-danger">*</span>
                      </label>
                      <div className="input-group border rounded-1">
                        <span className="input-group-text bg-transparent border-0">
                          <i className="ti ti-user fs-6"></i>
                        </span>
                        <input 
                          type="text" 
                          className="form-control border-0 ps-2" 
                          name="apellidos" 
                          value={formData.apellidos} 
                          onChange={handleInputChange} 
                          placeholder="García López"
                          required 
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <i className="ti ti-gender-bigender me-2"></i>Sexo <span className="text-danger">*</span>
                      </label>
                      <div className="input-group border rounded-1">
                        <span className="input-group-text bg-transparent border-0">
                          <i className="ti ti-gender-bigender fs-6"></i>
                        </span>
                        <select 
                          className="form-select border-0 ps-2" 
                          name="sexo" 
                          value={formData.sexo} 
                          onChange={handleInputChange} 
                          required
                        >
                          <option value="M">Masculino</option>
                          <option value="F">Femenino</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <i className="ti ti-calendar me-2"></i>Fecha de Nacimiento <span className="text-danger">*</span>
                      </label>
                      <div className="input-group border rounded-1">
                        <span className="input-group-text bg-transparent border-0">
                          <i className="ti ti-calendar fs-6"></i>
                        </span>
                        <input 
                          type="date" 
                          className="form-control border-0 ps-2" 
                          name="fecha_nacimiento" 
                          value={formData.fecha_nacimiento} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <i className="ti ti-id me-2"></i>DUI
                      </label>
                      <div className="input-group border rounded-1">
                        <span className="input-group-text bg-transparent border-0">
                          <i className="ti ti-id fs-6"></i>
                        </span>
                        <input 
                          type="text" 
                          className="form-control border-0 ps-2" 
                          name="dui" 
                          value={formData.dui} 
                          onChange={handleInputChange} 
                          placeholder="12345678-9"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sección: Información de Contacto */}
                  <h5 className="fs-4 fw-semibold mb-4 mt-4 text-primary border-top pt-4">
                    <i className="ti ti-phone me-2"></i>Información de Contacto
                  </h5>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <i className="ti ti-brand-whatsapp me-2"></i>Celular/WhatsApp <span className="text-danger">*</span>
                      </label>
                      <div className="input-group border rounded-1">
                        <span className="input-group-text bg-transparent border-0">
                          <i className="ti ti-brand-whatsapp fs-6 text-success"></i>
                        </span>
                        <input 
                          type="text" 
                          className="form-control border-0 ps-2" 
                          name="celular_whatsapp" 
                          value={formData.celular_whatsapp} 
                          onChange={handleInputChange} 
                          required 
                          placeholder="7890-1234"
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <i className="ti ti-phone me-2"></i>Teléfono Secundario
                      </label>
                      <div className="input-group border rounded-1">
                        <span className="input-group-text bg-transparent border-0">
                          <i className="ti ti-phone fs-6"></i>
                        </span>
                        <input 
                          type="text" 
                          className="form-control border-0 ps-2" 
                          name="telefono_secundario" 
                          value={formData.telefono_secundario} 
                          onChange={handleInputChange} 
                          placeholder="2234-5678"
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <i className="ti ti-mail me-2"></i>Email
                      </label>
                      <div className="input-group border rounded-1">
                        <span className="input-group-text bg-transparent border-0">
                          <i className="ti ti-mail fs-6"></i>
                        </span>
                        <input 
                          type="email" 
                          className="form-control border-0 ps-2" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleInputChange} 
                          placeholder="correo@ejemplo.com"
                        />
                      </div>
                    </div>

                    <div className="col-md-12">
                      <label className="form-label fw-semibold">
                        <i className="ti ti-map-pin me-2"></i>Dirección
                      </label>
                      <div className="input-group border rounded-1">
                        <span className="input-group-text bg-transparent border-0 align-items-start pt-2">
                          <i className="ti ti-map-pin fs-6"></i>
                        </span>
                        <textarea 
                          className="form-control border-0 ps-2" 
                          name="direccion" 
                          value={formData.direccion} 
                          onChange={handleInputChange} 
                          rows="2"
                          placeholder="Calle, colonia, ciudad..."
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Sección: Contacto de Emergencia */}
                  <h5 className="fs-4 fw-semibold mb-4 mt-4 text-primary border-top pt-4">
                    <i className="ti ti-alert-circle me-2"></i>Contacto de Emergencia
                  </h5>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <i className="ti ti-user me-2"></i>Nombre del Contacto
                      </label>
                      <div className="input-group border rounded-1">
                        <span className="input-group-text bg-transparent border-0">
                          <i className="ti ti-user fs-6"></i>
                        </span>
                        <input 
                          type="text" 
                          className="form-control border-0 ps-2" 
                          name="nombre_contacto" 
                          value={formData.nombre_contacto} 
                          onChange={handleInputChange} 
                          placeholder="Nombre completo"
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <i className="ti ti-phone me-2"></i>Teléfono de Contacto
                      </label>
                      <div className="input-group border rounded-1">
                        <span className="input-group-text bg-transparent border-0">
                          <i className="ti ti-phone fs-6"></i>
                        </span>
                        <input 
                          type="text" 
                          className="form-control border-0 ps-2" 
                          name="telefono_contacto" 
                          value={formData.telefono_contacto} 
                          onChange={handleInputChange} 
                          placeholder="7890-1234"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Etiquetas (solo en crear) */}
                  {modalMode === 'crear' && etiquetas.length > 0 && (
                    <>
                      <h5 className="fs-4 fw-semibold mb-3 mt-4 text-primary border-top pt-4">
                        <i className="ti ti-tags me-2"></i>Etiquetas
                      </h5>
                      <div className="d-flex flex-wrap gap-2 mb-4">
                        {etiquetas.map(etiqueta => {
                          const seleccionada = formData.etiquetas?.includes(etiqueta.id_etiqueta)
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
                              <i className={`ti ti-${seleccionada ? 'check' : 'tag'} me-1`}></i>
                              {etiqueta.nombre}
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}

                  {/* Permisos y consentimientos */}
                  <h5 className="fs-4 fw-semibold mb-3 mt-4 text-primary border-top pt-4">
                    <i className="ti ti-shield-check me-2"></i>Permisos y Consentimientos
                  </h5>

                  <div className="row g-3">
                    <div className="col-12">
                      <div className="form-check form-switch d-flex align-items-center ps-0">
                        <input 
                          className="form-check-input ms-0 me-3" 
                          type="checkbox" 
                          name="es_paciente" 
                          checked={formData.es_paciente} 
                          onChange={handleInputChange} 
                          style={{ width: '48px', height: '24px' }}
                        />
                        <label className="form-check-label">
                          <i className="ti ti-user-check me-2"></i>
                          <strong>Es paciente activo</strong>
                        </label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-check form-switch d-flex align-items-center ps-0">
                        <input 
                          className="form-check-input ms-0 me-3" 
                          type="checkbox" 
                          name="consiente_tratamiento_datos" 
                          checked={formData.consiente_tratamiento_datos} 
                          onChange={handleInputChange} 
                          style={{ width: '48px', height: '24px' }}
                        />
                        <label className="form-check-label">
                          <i className="ti ti-file-certificate me-2"></i>
                          <strong>Consiente tratamiento de datos personales</strong>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-outline-secondary" onClick={cerrarModal}>
                    <i className="ti ti-x me-2"></i>Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loadingAction}>
                    {loadingAction ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className={`ti ti-${modalMode === 'crear' ? 'check' : 'device-floppy'} me-2`}></i>
                        {modalMode === 'crear' ? 'Crear Paciente' : 'Guardar Cambios'}
                      </>
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
        onCancel={() => {
          setShowConfirmDelete(false)
          setPacienteToDelete(null)
        }}
        title="¿Estás seguro?"
        message={`¿Deseas eliminar al paciente "${pacienteToDelete?.nombres} ${pacienteToDelete?.apellidos}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        confirmColor="danger"
        icon="ti ti-alert-triangle"
      />
    </HorizontalLayout>
  )
}
