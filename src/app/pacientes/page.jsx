'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import HorizontalLayout from '@/components/layout/HorizontalLayout'
import ConfirmModal from '@/components/ConfirmModal'
import { pacientesService } from '@/services/pacientesService'
import { etiquetasService } from '@/services/etiquetasService'
import { etiquetasPacienteService } from '@/services/etiquetasPacienteService'
import { authService } from '@/services/authService'
import { mostrarErrorAPI, mostrarExito } from '@/utils/sweetAlertHelper'
import { formatearFecha } from '@/utils/dateHelper'

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
  const [loadingEtiqueta, setLoadingEtiqueta] = useState(null)
  const [etiquetasPaciente, setEtiquetasPaciente] = useState([]) // Etiquetas del paciente con estado asignada
  
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
      
      // Debug: verificar si las etiquetas vienen en el listado
      console.log('📋 Pacientes cargados:', pacientesData)
      if (pacientesData.length > 0) {
        console.log('🏷️ Etiquetas del primer paciente:', pacientesData[0].etiquetas)
      }
      
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

  // Toggle de etiqueta para modo crear (solo en memoria)
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

  // Toggle de etiqueta para modo editar (en tiempo real en BD)
  const handleEtiquetaToggleEditar = async (etiqueta) => {
    if (!pacienteSeleccionado) return
    
    const estaAsignada = etiqueta.asignada
    
    try {
      setLoadingEtiqueta(etiqueta.id_etiqueta)
      
      if (estaAsignada) {
        // Desasignar etiqueta
        await etiquetasPacienteService.desasignar(pacienteSeleccionado.id_paciente, etiqueta.id_etiqueta)
        await mostrarExito(`Etiqueta "${etiqueta.nombre}" eliminada`)
      } else {
        // Asignar etiqueta
        await etiquetasPacienteService.asignar(pacienteSeleccionado.id_paciente, etiqueta.id_etiqueta)
        await mostrarExito(`Etiqueta "${etiqueta.nombre}" asignada`)
      }
      
      // Actualizar estado local
      setEtiquetasPaciente(prev => 
        prev.map(e => 
          e.id_etiqueta === etiqueta.id_etiqueta 
            ? { ...e, asignada: !estaAsignada }
            : e
        )
      )
      
      // Recargar lista de pacientes para actualizar la vista
      await cargarDatos()
      
    } catch (err) {
      console.error('Error al toggle etiqueta:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoadingEtiqueta(null)
    }
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

  const abrirModalEditar = async (paciente) => {
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
    
    // Cargar paciente completo con etiquetas para el modo editar
    try {
      const pacienteCompleto = await pacientesService.obtenerPorId(paciente.id_paciente, idClinica)
      // Combinar etiquetas disponibles con las del paciente
      const etiquetasCombinadas = etiquetas.map(etiqueta => {
        const etiquetaPaciente = pacienteCompleto.etiquetas?.find(e => e.id_etiqueta === etiqueta.id_etiqueta)
        return {
          ...etiqueta,
          asignada: etiquetaPaciente?.asignada || false
        }
      })
      setEtiquetasPaciente(etiquetasCombinadas)
    } catch (err) {
      console.error('Error al cargar etiquetas del paciente:', err)
      // Si falla, usar solo las etiquetas disponibles sin estado
      setEtiquetasPaciente(etiquetas.map(e => ({ ...e, asignada: false })))
    }
    
    setShowModal(true)
  }

  const cerrarModal = () => {
    setShowModal(false)
    setPacienteSeleccionado(null)
    setEtiquetasPaciente([])
    setLoadingEtiqueta(null)
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
    router.push(`/pacientes/detalle?id=${idPaciente}`)
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
                          {paciente.etiquetas && paciente.etiquetas.length > 0 ? (
                            paciente.etiquetas
                              .filter(etiqueta => etiqueta.asignada !== false) // Filtrar solo las asignadas
                              .map(etiqueta => (
                                <span 
                                  key={etiqueta.id_etiqueta}
                                  className="badge"
                                  style={{
                                    backgroundColor: etiqueta.color || '#6c757d',
                                    color: '#fff'
                                  }}
                                >
                                  {etiqueta.nombre}
                                </span>
                              ))
                          ) : (
                            <span className="text-muted small">Sin etiquetas</span>
                          )}
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

      {/* Modal Crear/Editar Paciente */}
      {showModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{maxHeight: '90vh', display: 'flex', flexDirection: 'column'}}>
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={`ti ti-${modalMode === 'crear' ? 'plus' : 'edit'} me-2`}></i>
                  {modalMode === 'crear' ? 'Nuevo Paciente' : 'Editar Paciente'}
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModal}></button>
              </div>
              <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0}}>
                <div className="modal-body" style={{overflowY: 'auto', flex: 1}}>
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
                      <hr />
                      <label className="form-label fw-bold">
                        Etiquetas
                        {modalMode === 'editar' && (
                          <small className="text-muted ms-2">(Los cambios se guardan automáticamente)</small>
                        )}
                      </label>
                      <div className="d-flex flex-wrap gap-2">
                        {modalMode === 'crear' ? (
                          // Modo crear: etiquetas en memoria
                          etiquetas.map(etiqueta => {
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
                                {etiqueta.nombre}
                              </button>
                            )
                          })
                        ) : (
                          // Modo editar: etiquetas en tiempo real
                          etiquetasPaciente.length > 0 ? (
                            etiquetasPaciente.map(etiqueta => {
                              const estaAsignada = etiqueta.asignada
                              const estaCargando = loadingEtiqueta === etiqueta.id_etiqueta
                              
                              return (
                                <button
                                  key={etiqueta.id_etiqueta}
                                  type="button"
                                  className={`btn btn-sm ${estaAsignada ? '' : 'btn-outline-secondary'}`}
                                  style={estaAsignada ? {
                                    backgroundColor: etiqueta.color,
                                    borderColor: etiqueta.color,
                                    color: '#fff'
                                  } : {}}
                                  onClick={() => handleEtiquetaToggleEditar(etiqueta)}
                                  disabled={estaCargando || loadingEtiqueta !== null}
                                >
                                  {estaCargando && (
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                  )}
                                  {etiqueta.nombre}
                                </button>
                              )
                            })
                          ) : (
                            <span className="text-muted">Cargando etiquetas...</span>
                          )
                        )}
                      </div>
                      {modalMode === 'editar' && (
                        <small className="text-muted d-block mt-2">
                          Haz clic en una etiqueta para asignarla o quitarla del paciente
                        </small>
                      )}
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
                  </div>
                </div>
                <div className="modal-footer" style={{flexShrink: 0}}>
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
