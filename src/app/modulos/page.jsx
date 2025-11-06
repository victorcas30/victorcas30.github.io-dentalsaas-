'use client'

import { useState, useEffect } from 'react'
import HorizontalLayout from '@/components/layout/HorizontalLayout'
import ConfirmModal from '@/components/ConfirmModal'
import { modulosService } from '@/services/modulosService'
import { rutasService } from '@/services/rutasService'
import { mostrarErrorAPI, mostrarExito } from '@/utils/sweetAlertHelper'

export default function Modulos() {
  // Estados para Módulos
  const [modulos, setModulos] = useState([])
  const [loadingModulos, setLoadingModulos] = useState(true)
  const [showModalModulo, setShowModalModulo] = useState(false)
  const [modalModeModulo, setModalModeModulo] = useState('crear')
  const [moduloSeleccionado, setModuloSeleccionado] = useState(null)
  const [formDataModulo, setFormDataModulo] = useState({
    nombre: '',
    descripcion: '',
    activo: 1
  })

  // Estados para Rutas
  const [rutas, setRutas] = useState([])
  const [loadingRutas, setLoadingRutas] = useState(false)
  const [showModalRuta, setShowModalRuta] = useState(false)
  const [modalModeRuta, setModalModeRuta] = useState('crear')
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null)
  const [moduloRutasSeleccionado, setModuloRutasSeleccionado] = useState(null)
  const [formDataRuta, setFormDataRuta] = useState({
    nombre: '',
    path: '',
    descripcion: '',
    id_modulo: null,
    activo: 1,
    es_homepage: 0
  })

  // Estados de confirmación
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [deleteType, setDeleteType] = useState('') // 'modulo' o 'ruta'

  // Estados globales
  const [loadingAction, setLoadingAction] = useState(false)
  const [vistaActual, setVistaActual] = useState('modulos') // 'modulos' o 'rutas'

  useEffect(() => {
    cargarModulos()
  }, [])

  // ==================== MÓDULOS ====================
  
  const cargarModulos = async () => {
    try {
      setLoadingModulos(true)
      const data = await modulosService.listar()
      setModulos(data)
    } catch (err) {
      console.error('Error al cargar módulos:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoadingModulos(false)
    }
  }

  const handleInputChangeModulo = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name === 'activo') {
      setFormDataModulo({
        ...formDataModulo,
        [name]: checked ? 1 : 0
      })
    } else {
      setFormDataModulo({
        ...formDataModulo,
        [name]: value
      })
    }
  }

  const abrirModalCrearModulo = () => {
    setModalModeModulo('crear')
    setFormDataModulo({
      nombre: '',
      descripcion: '',
      activo: 1
    })
    setModuloSeleccionado(null)
    setShowModalModulo(true)
  }

  const abrirModalEditarModulo = (modulo) => {
    setModalModeModulo('editar')
    setFormDataModulo({
      nombre: modulo.nombre,
      descripcion: modulo.descripcion || '',
      activo: modulo.activo ? 1 : 0
    })
    setModuloSeleccionado(modulo)
    setShowModalModulo(true)
  }

  const cerrarModalModulo = () => {
    setShowModalModulo(false)
    setModuloSeleccionado(null)
  }

  const handleSubmitModulo = async (e) => {
    e.preventDefault()
    setLoadingAction(true)

    try {
      if (modalModeModulo === 'crear') {
        await modulosService.crear(formDataModulo)
        await mostrarExito('Módulo creado exitosamente')
        cargarModulos()
        cerrarModalModulo()
      } else {
        await modulosService.actualizar(moduloSeleccionado.id_modulo, formDataModulo)
        await mostrarExito('Módulo actualizado exitosamente')
        cargarModulos()
        cerrarModalModulo()
      }
    } catch (err) {
      console.error('Error al guardar módulo:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoadingAction(false)
    }
  }

  const confirmarEliminarModulo = (modulo) => {
    setItemToDelete(modulo)
    setDeleteType('modulo')
    setShowConfirmDelete(true)
  }

  const eliminarModulo = async () => {
    try {
      await modulosService.eliminar(itemToDelete.id_modulo)
      await mostrarExito('Módulo eliminado exitosamente')
      cargarModulos()
    } catch (err) {
      console.error('Error al eliminar módulo:', err)
      await mostrarErrorAPI(err)
    } finally {
      setShowConfirmDelete(false)
      setItemToDelete(null)
    }
  }

  const verRutasModulo = async (modulo) => {
    setModuloRutasSeleccionado(modulo)
    setVistaActual('rutas')
    await cargarRutasModulo(modulo.id_modulo)
  }

  // ==================== RUTAS ====================

  const cargarRutasModulo = async (idModulo) => {
    try {
      setLoadingRutas(true)
      const data = await rutasService.listarPorModulo(idModulo)
      setRutas(data)
    } catch (err) {
      console.error('Error al cargar rutas:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoadingRutas(false)
    }
  }

  const handleInputChangeRuta = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name === 'activo' || name === 'es_homepage') {
      setFormDataRuta({
        ...formDataRuta,
        [name]: checked ? 1 : 0
      })
    } else {
      setFormDataRuta({
        ...formDataRuta,
        [name]: value
      })
    }
  }

  const abrirModalCrearRuta = () => {
    setModalModeRuta('crear')
    setFormDataRuta({
      nombre: '',
      path: '',
      descripcion: '',
      id_modulo: moduloRutasSeleccionado.id_modulo,
      activo: 1,
      es_homepage: 0
    })
    setRutaSeleccionada(null)
    setShowModalRuta(true)
  }

  const abrirModalEditarRuta = (ruta) => {
    setModalModeRuta('editar')
    setFormDataRuta({
      nombre: ruta.nombre,
      path: ruta.path,
      descripcion: ruta.descripcion || '',
      id_modulo: ruta.id_modulo,
      activo: ruta.activo ? 1 : 0,
      es_homepage: ruta.es_homepage ? 1 : 0
    })
    setRutaSeleccionada(ruta)
    setShowModalRuta(true)
  }

  const cerrarModalRuta = () => {
    setShowModalRuta(false)
    setRutaSeleccionada(null)
  }

  const handleSubmitRuta = async (e) => {
    e.preventDefault()
    setLoadingAction(true)

    try {
      if (modalModeRuta === 'crear') {
        await rutasService.crear(formDataRuta)
        await mostrarExito('Ruta creada exitosamente')
        cargarRutasModulo(moduloRutasSeleccionado.id_modulo)
        cerrarModalRuta()
      } else {
        await rutasService.actualizar(rutaSeleccionada.id_ruta, formDataRuta)
        await mostrarExito('Ruta actualizada exitosamente')
        cargarRutasModulo(moduloRutasSeleccionado.id_modulo)
        cerrarModalRuta()
      }
    } catch (err) {
      console.error('Error al guardar ruta:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoadingAction(false)
    }
  }

  const confirmarEliminarRuta = (ruta) => {
    setItemToDelete(ruta)
    setDeleteType('ruta')
    setShowConfirmDelete(true)
  }

  const eliminarRuta = async () => {
    try {
      await rutasService.eliminar(itemToDelete.id_ruta)
      await mostrarExito('Ruta eliminada exitosamente')
      cargarRutasModulo(moduloRutasSeleccionado.id_modulo)
    } catch (err) {
      console.error('Error al eliminar ruta:', err)
      await mostrarErrorAPI(err)
    } finally {
      setShowConfirmDelete(false)
      setItemToDelete(null)
    }
  }

  const volverAModulos = () => {
    setVistaActual('modulos')
    setModuloRutasSeleccionado(null)
    setRutas([])
  }

  // ==================== HELPERS ====================

  const getModuloIconClass = (idModulo) => {
    const iconos = [
      'ti-settings',
      'ti-users',
      'ti-calendar',
      'ti-stethoscope',
      'ti-file-invoice',
      'ti-dashboard',
      'ti-clipboard',
      'ti-pill',
      'ti-message',
      'ti-chart-bar'
    ]
    return iconos[idModulo % iconos.length] || 'ti-layout'
  }

  const getModuloBadgeClass = (idModulo) => {
    const colores = [
      'bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-danger', 
      'bg-secondary', 'bg-dark'
    ]
    return colores[idModulo % colores.length] || 'bg-primary'
  }

  return (
    <HorizontalLayout>
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              {vistaActual === 'modulos' ? (
                <>
                  <h2 className="fw-bold mb-2">
                    <i className="ti ti-layout-grid me-2"></i>
                    Módulos del Sistema
                  </h2>
                  <p className="text-muted mb-0">Gestión de módulos y funcionalidades</p>
                </>
              ) : (
                <>
                  <button 
                    className="btn btn-sm btn-outline-secondary mb-2" 
                    onClick={volverAModulos}
                  >
                    <i className="ti ti-arrow-left me-2"></i>Volver a Módulos
                  </button>
                  <h2 className="fw-bold mb-2">
                    <i className="ti ti-route me-2"></i>
                    Rutas de: {moduloRutasSeleccionado?.nombre}
                  </h2>
                  <p className="text-muted mb-0">Gestión de rutas del módulo</p>
                </>
              )}
            </div>
            {vistaActual === 'modulos' ? (
              <button className="btn btn-primary" onClick={abrirModalCrearModulo}>
                <i className="ti ti-plus me-2"></i>Nuevo Módulo
              </button>
            ) : (
              <button className="btn btn-primary" onClick={abrirModalCrearRuta}>
                <i className="ti ti-plus me-2"></i>Nueva Ruta
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Vista de Módulos */}
      {vistaActual === 'modulos' && (
        <div className="card">
          <div className="card-body">
            {loadingModulos ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
                <p className="mt-3 text-muted">Cargando módulos...</p>
              </div>
            ) : modulos.length === 0 ? (
              <div className="text-center py-5">
                <i className="ti ti-layout-grid" style={{fontSize: '64px', color: '#ccc'}}></i>
                <h4 className="mt-3 mb-2">No hay módulos</h4>
                <p className="text-muted mb-3">Comienza creando tu primer módulo del sistema</p>
                <button className="btn btn-primary" onClick={abrirModalCrearModulo}>
                  <i className="ti ti-plus me-2"></i>Crear Módulo
                </button>
              </div>
            ) : (
              <div className="row">
                {modulos.map((modulo) => (
                  <div key={modulo.id_modulo} className="col-md-6 col-lg-4 mb-4">
                    <div className="card border shadow-sm h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-start justify-content-between mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <div className={`rounded-circle ${getModuloBadgeClass(modulo.id_modulo)} text-white d-flex align-items-center justify-content-center`}
                                 style={{width: '48px', height: '48px', fontSize: '24px'}}>
                              <i className={`ti ${getModuloIconClass(modulo.id_modulo)}`}></i>
                            </div>
                            <div>
                              <span className="badge bg-light text-dark mb-2">
                                ID: {modulo.id_modulo}
                              </span>
                              <h5 className="fw-bold mb-0">{modulo.nombre}</h5>
                            </div>
                          </div>
                          <span className={`badge ${modulo.activo ? 'bg-success' : 'bg-danger'}`}>
                            {modulo.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        
                        <p className="text-muted mb-3" style={{minHeight: '60px'}}>
                          {modulo.descripcion || 'Sin descripción'}
                        </p>
                        
                        <div className="d-flex gap-2 mb-2">
                          <button 
                            className="btn btn-sm btn-outline-info flex-fill" 
                            onClick={() => verRutasModulo(modulo)}
                          >
                            <i className="ti ti-route me-1"></i>Ver Rutas
                          </button>
                        </div>
                        
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-outline-primary flex-fill" 
                            onClick={() => abrirModalEditarModulo(modulo)}
                          >
                            <i className="ti ti-edit me-1"></i>Editar
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            onClick={() => confirmarEliminarModulo(modulo)}
                          >
                            <i className="ti ti-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vista de Rutas */}
      {vistaActual === 'rutas' && (
        <div className="card">
          <div className="card-body">
            {loadingRutas ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
                <p className="mt-3 text-muted">Cargando rutas...</p>
              </div>
            ) : rutas.length === 0 ? (
              <div className="text-center py-5">
                <i className="ti ti-route" style={{fontSize: '64px', color: '#ccc'}}></i>
                <h4 className="mt-3 mb-2">No hay rutas</h4>
                <p className="text-muted mb-3">Comienza creando la primera ruta para este módulo</p>
                <button className="btn btn-primary" onClick={abrirModalCrearRuta}>
                  <i className="ti ti-plus me-2"></i>Crear Ruta
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Path</th>
                      <th>Descripción</th>
                      <th>Estado</th>
                      <th>Homepage</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rutas.map((ruta) => (
                      <tr key={ruta.id_ruta}>
                        <td>
                          <span className="badge bg-light text-dark">{ruta.id_ruta}</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <i className="ti ti-route text-primary" style={{fontSize: '20px'}}></i>
                            <span className="fw-semibold">{ruta.nombre}</span>
                          </div>
                        </td>
                        <td>
                          <code className="bg-light px-2 py-1 rounded">{ruta.path}</code>
                        </td>
                        <td className="text-muted">
                          {ruta.descripcion || '-'}
                        </td>
                        <td>
                          <span className={`badge ${ruta.activo ? 'bg-success' : 'bg-danger'}`}>
                            {ruta.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td>
                          {ruta.es_homepage ? (
                            <span className="badge bg-warning text-dark">
                              <i className="ti ti-home me-1"></i>Sí
                            </span>
                          ) : (
                            <span className="badge bg-light text-muted">No</span>
                          )}
                        </td>
                        <td className="text-end">
                          <button 
                            className="btn btn-sm btn-outline-primary me-1" 
                            onClick={() => abrirModalEditarRuta(ruta)}
                          >
                            <i className="ti ti-edit"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            onClick={() => confirmarEliminarRuta(ruta)}
                          >
                            <i className="ti ti-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        show={showConfirmDelete}
        onConfirm={deleteType === 'modulo' ? eliminarModulo : eliminarRuta}
        onCancel={() => {
          setShowConfirmDelete(false)
          setItemToDelete(null)
        }}
        title="¿Estás seguro?"
        message={
          deleteType === 'modulo'
            ? `¿Deseas eliminar el módulo "${itemToDelete?.nombre}"? Esto también eliminará todas sus rutas.`
            : `¿Deseas eliminar la ruta "${itemToDelete?.nombre}"? Esta acción no se puede deshacer.`
        }
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        confirmColor="danger"
        icon="ti ti-alert-triangle"
      />

      {/* Modal Módulo */}
      {showModalModulo && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={`ti ti-${modalModeModulo === 'crear' ? 'plus' : 'edit'} me-2`}></i>
                  {modalModeModulo === 'crear' ? 'Crear Módulo' : 'Editar Módulo'}
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModalModulo}></button>
              </div>
              <form onSubmit={handleSubmitModulo}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">
                      Nombre del Módulo <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="nombre" 
                      value={formDataModulo.nombre} 
                      onChange={handleInputChangeModulo} 
                      required 
                      maxLength="100"
                      placeholder="Ej: Gestión de Pacientes"
                    />
                    <small className="text-muted">Máximo 100 caracteres</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea 
                      className="form-control" 
                      name="descripcion" 
                      value={formDataModulo.descripcion} 
                      onChange={handleInputChangeModulo} 
                      rows="4"
                      placeholder="Describe la funcionalidad de este módulo..."
                    ></textarea>
                  </div>
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      name="activo" 
                      checked={formDataModulo.activo === 1} 
                      onChange={handleInputChangeModulo} 
                    />
                    <label className="form-check-label">Módulo Activo</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cerrarModalModulo}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loadingAction}>
                    {loadingAction ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Guardando...
                      </>
                    ) : (
                      modalModeModulo === 'crear' ? 'Crear' : 'Guardar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ruta */}
      {showModalRuta && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={`ti ti-${modalModeRuta === 'crear' ? 'plus' : 'edit'} me-2`}></i>
                  {modalModeRuta === 'crear' ? 'Crear Ruta' : 'Editar Ruta'}
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModalRuta}></button>
              </div>
              <form onSubmit={handleSubmitRuta}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">
                      Nombre de la Ruta <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="nombre" 
                      value={formDataRuta.nombre} 
                      onChange={handleInputChangeRuta} 
                      required 
                      placeholder="Ej: Usuarios y permisos"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Path (URL) <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="path" 
                      value={formDataRuta.path} 
                      onChange={handleInputChangeRuta} 
                      required 
                      placeholder="Ej: /usuarios"
                    />
                    <small className="text-muted">Debe comenzar con /</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea 
                      className="form-control" 
                      name="descripcion" 
                      value={formDataRuta.descripcion} 
                      onChange={handleInputChangeRuta} 
                      rows="3"
                      placeholder="Describe la funcionalidad de esta ruta..."
                    ></textarea>
                  </div>
                  <div className="form-check form-switch mb-2">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      name="activo" 
                      checked={formDataRuta.activo === 1} 
                      onChange={handleInputChangeRuta} 
                    />
                    <label className="form-check-label">Ruta Activa</label>
                  </div>
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      name="es_homepage" 
                      checked={formDataRuta.es_homepage === 1} 
                      onChange={handleInputChangeRuta} 
                    />
                    <label className="form-check-label">Es página de inicio (Homepage)</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cerrarModalRuta}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loadingAction}>
                    {loadingAction ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Guardando...
                      </>
                    ) : (
                      modalModeRuta === 'crear' ? 'Crear' : 'Guardar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </HorizontalLayout>
  )
}
