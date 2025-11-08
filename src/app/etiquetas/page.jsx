'use client'

import { useState, useEffect } from 'react'
import HorizontalLayout from '@/components/layout/HorizontalLayout'
import ConfirmModal from '@/components/ConfirmModal'
import { etiquetasService } from '@/services/etiquetasService'
import { authService } from '@/services/authService'
import { mostrarErrorAPI, mostrarExito } from '@/utils/sweetAlertHelper'

export default function Etiquetas() {
  const [etiquetas, setEtiquetas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('crear')
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState(null)
  const [loadingAction, setLoadingAction] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [etiquetaToDelete, setEtiquetaToDelete] = useState(null)
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    color: '#5d87ff',
    activa: true
  })

  const idClinica = authService.getClinicaId()

  // Colores predefinidos para el selector
  const coloresPredefinidos = [
    '#5d87ff', '#49beff', '#13deb9', '#ffae1f', '#fa896b',
    '#e74c3c', '#9b59b6', '#3498db', '#2ecc71', '#f39c12',
    '#e67e22', '#1abc9c', '#34495e', '#e91e63', '#00bcd4',
    '#4caf50', '#ff9800', '#795548', '#607d8b', '#ff5722'
  ]

  useEffect(() => {
    cargarEtiquetas()
  }, [])

  const cargarEtiquetas = async () => {
    try {
      setLoading(true)
      const data = await etiquetasService.listarPorClinica(idClinica)
      setEtiquetas(data)
    } catch (err) {
      console.error('Error al cargar etiquetas:', err)
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

  const abrirModalCrear = () => {
    setModalMode('crear')
    setFormData({
      nombre: '',
      descripcion: '',
      color: '#5d87ff',
      activa: true
    })
    setEtiquetaSeleccionada(null)
    setShowModal(true)
  }

  const abrirModalEditar = (etiqueta) => {
    setModalMode('editar')
    setFormData({
      nombre: etiqueta.nombre,
      descripcion: etiqueta.descripcion || '',
      color: etiqueta.color || '#5d87ff',
      activa: etiqueta.activa !== false
    })
    setEtiquetaSeleccionada(etiqueta)
    setShowModal(true)
  }

  const cerrarModal = () => {
    setShowModal(false)
    setEtiquetaSeleccionada(null)
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
        await etiquetasService.crear(body)
        await mostrarExito('Etiqueta creada exitosamente')
      } else {
        await etiquetasService.actualizar(etiquetaSeleccionada.id_etiqueta, idClinica, {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          color: formData.color,
          activa: formData.activa
        })
        await mostrarExito('Etiqueta actualizada exitosamente')
      }
      
      cargarEtiquetas()
      cerrarModal()
    } catch (err) {
      console.error('Error al guardar etiqueta:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoadingAction(false)
    }
  }

  const confirmarEliminar = (etiqueta) => {
    setEtiquetaToDelete(etiqueta)
    setShowConfirmDelete(true)
  }

  const eliminarEtiqueta = async () => {
    try {
      await etiquetasService.eliminar(etiquetaToDelete.id_etiqueta, idClinica)
      await mostrarExito('Etiqueta eliminada exitosamente')
      cargarEtiquetas()
    } catch (err) {
      console.error('Error al eliminar etiqueta:', err)
      await mostrarErrorAPI(err)
    } finally {
      setShowConfirmDelete(false)
      setEtiquetaToDelete(null)
    }
  }

  const etiquetasFiltradas = etiquetas.filter(etiqueta => 
    etiqueta.activa !== false
  )

  return (
    <HorizontalLayout>
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="fw-bold mb-2">
                <i className="ti ti-tags me-2"></i>
                Etiquetas
              </h2>
              <p className="text-muted mb-0">
                Gestiona las etiquetas para categorizar y organizar tus pacientes
              </p>
            </div>
            <button className="btn btn-primary" onClick={abrirModalCrear}>
              <i className="ti ti-plus me-2"></i>
              Nueva Etiqueta
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de etiquetas */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-3 text-muted">Cargando etiquetas...</p>
            </div>
          ) : etiquetas.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-tags-off" style={{fontSize: '64px', color: '#ccc'}}></i>
              <h4 className="mt-3 mb-2">No hay etiquetas</h4>
              <p className="text-muted mb-3">
                Comienza creando tu primera etiqueta para organizar mejor tus pacientes
              </p>
              <button className="btn btn-primary" onClick={abrirModalCrear}>
                <i className="ti ti-plus me-2"></i>Crear Etiqueta
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{width: '50px'}}>Color</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {etiquetas.map((etiqueta) => (
                    <tr key={etiqueta.id_etiqueta}>
                      <td>
                        <div 
                          className="rounded-circle" 
                          style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: etiqueta.color || '#6c757d',
                            border: '2px solid #e0e0e0'
                          }}
                          title={etiqueta.color}
                        ></div>
                      </td>
                      <td>
                        <div className="fw-semibold">{etiqueta.nombre}</div>
                      </td>
                      <td>
                        <span className="text-muted">
                          {etiqueta.descripcion || 'Sin descripción'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${etiqueta.activa ? 'bg-success' : 'bg-secondary'}`}>
                          {etiqueta.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group" role="group">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => abrirModalEditar(etiqueta)}
                            title="Editar"
                          >
                            <i className="ti ti-edit"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => confirmarEliminar(etiqueta)}
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

      {/* Vista previa de etiquetas */}
      {etiquetasFiltradas.length > 0 && (
        <div className="card mt-4">
          <div className="card-header bg-white">
            <h5 className="mb-0">
              <i className="ti ti-eye me-2"></i>
              Vista Previa
            </h5>
          </div>
          <div className="card-body">
            <p className="text-muted mb-3">
              Así se verán las etiquetas cuando se asignen a los pacientes:
            </p>
            <div className="d-flex flex-wrap gap-2">
              {etiquetasFiltradas.map(etiqueta => (
                <span 
                  key={etiqueta.id_etiqueta}
                  className="badge"
                  style={{
                    backgroundColor: etiqueta.color,
                    color: '#fff',
                    fontSize: '14px',
                    padding: '8px 12px'
                  }}
                >
                  {etiqueta.nombre}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear/Editar Etiqueta */}
      {showModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={`ti ti-${modalMode === 'crear' ? 'plus' : 'edit'} me-2`}></i>
                  {modalMode === 'crear' ? 'Nueva Etiqueta' : 'Editar Etiqueta'}
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">
                        Nombre <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="nombre" 
                        value={formData.nombre} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="Ej: Urgente, VIP, Nuevo"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Descripción</label>
                      <textarea 
                        className="form-control" 
                        name="descripcion" 
                        value={formData.descripcion} 
                        onChange={handleInputChange} 
                        rows="3"
                        placeholder="Describe el propósito de esta etiqueta"
                      ></textarea>
                    </div>
                    <div className="col-12">
                      <label className="form-label">
                        Color <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex gap-2 align-items-center mb-3">
                        <input 
                          type="color" 
                          className="form-control form-control-color" 
                          name="color" 
                          value={formData.color} 
                          onChange={handleInputChange}
                          style={{width: '60px', height: '40px'}}
                          title="Seleccionar color"
                        />
                        <input 
                          type="text" 
                          className="form-control" 
                          name="color" 
                          value={formData.color} 
                          onChange={handleInputChange}
                          placeholder="#5d87ff"
                          style={{maxWidth: '120px'}}
                        />
                        <div 
                          className="rounded-circle" 
                          style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: formData.color,
                            border: '2px solid #e0e0e0',
                            flexShrink: 0
                          }}
                          title="Vista previa"
                        ></div>
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        <small className="text-muted w-100 mb-2">Colores sugeridos:</small>
                        {coloresPredefinidos.map((color, index) => (
                          <button
                            key={index}
                            type="button"
                            className="btn btn-sm"
                            style={{
                              width: '32px',
                              height: '32px',
                              backgroundColor: color,
                              border: formData.color === color ? '3px solid #000' : '2px solid #e0e0e0',
                              borderRadius: '50%',
                              padding: 0
                            }}
                            onClick={() => setFormData({...formData, color})}
                            title={color}
                          ></button>
                        ))}
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          name="activa" 
                          checked={formData.activa} 
                          onChange={handleInputChange}
                          id="activaSwitch"
                        />
                        <label className="form-check-label" htmlFor="activaSwitch">
                          Etiqueta activa
                        </label>
                        <small className="text-muted d-block">
                          Las etiquetas inactivas no aparecerán al asignar a pacientes
                        </small>
                      </div>
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
        onConfirm={eliminarEtiqueta}
        onCancel={() => {
          setShowConfirmDelete(false)
          setEtiquetaToDelete(null)
        }}
        title="¿Estás seguro?"
        message={`¿Deseas eliminar la etiqueta "${etiquetaToDelete?.nombre}"? Esta acción no se puede deshacer y la etiqueta será eliminada de todos los pacientes que la tengan asignada.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        confirmColor="danger"
        icon="ti ti-alert-triangle"
      />
    </HorizontalLayout>
  )
}

