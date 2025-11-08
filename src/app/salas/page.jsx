'use client'

import { useState, useEffect } from 'react'
import HorizontalLayout from '@/components/layout/HorizontalLayout'
import ConfirmModal from '@/components/ConfirmModal'
import { salasService } from '@/services/salasService'
import { authService } from '@/services/authService'
import { mostrarErrorAPI, mostrarExito } from '@/utils/sweetAlertHelper'

export default function Salas() {
  const [salas, setSalas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('crear')
  const [salaSeleccionada, setSalaSeleccionada] = useState(null)
  const [loadingAction, setLoadingAction] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [salaToDelete, setSalaToDelete] = useState(null)
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true
  })

  const idClinica = authService.getClinicaId()

  useEffect(() => {
    cargarSalas()
  }, [])

  const cargarSalas = async () => {
    try {
      setLoading(true)
      const data = await salasService.listarPorClinica(idClinica)
      setSalas(data)
    } catch (err) {
      console.error('Error al cargar salas:', err)
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
      activo: true
    })
    setSalaSeleccionada(null)
    setShowModal(true)
  }

  const abrirModalEditar = (sala) => {
    setModalMode('editar')
    setFormData({
      nombre: sala.nombre,
      descripcion: sala.descripcion || '',
      activo: sala.activo !== false
    })
    setSalaSeleccionada(sala)
    setShowModal(true)
  }

  const cerrarModal = () => {
    setShowModal(false)
    setSalaSeleccionada(null)
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
        await salasService.crear(body)
        await mostrarExito('Sala creada exitosamente')
      } else {
        await salasService.actualizar(salaSeleccionada.id_sala, idClinica, {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          activo: formData.activo
        })
        await mostrarExito('Sala actualizada exitosamente')
      }
      
      cargarSalas()
      cerrarModal()
    } catch (err) {
      console.error('Error al guardar sala:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoadingAction(false)
    }
  }

  const confirmarEliminar = (sala) => {
    setSalaToDelete(sala)
    setShowConfirmDelete(true)
  }

  const eliminarSala = async () => {
    try {
      await salasService.eliminar(salaToDelete.id_sala, idClinica)
      await mostrarExito('Sala eliminada exitosamente')
      cargarSalas()
    } catch (err) {
      console.error('Error al eliminar sala:', err)
      await mostrarErrorAPI(err)
    } finally {
      setShowConfirmDelete(false)
      setSalaToDelete(null)
    }
  }

  return (
    <HorizontalLayout>
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="fw-bold mb-2">
                <i className="ti ti-building me-2"></i>
                Salas
              </h2>
              <p className="text-muted mb-0">
                Gestiona las salas y consultorios de tu clínica
              </p>
            </div>
            <button className="btn btn-primary" onClick={abrirModalCrear}>
              <i className="ti ti-plus me-2"></i>
              Nueva Sala
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de salas */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-3 text-muted">Cargando salas...</p>
            </div>
          ) : salas.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-building-off" style={{fontSize: '64px', color: '#ccc'}}></i>
              <h4 className="mt-3 mb-2">No hay salas</h4>
              <p className="text-muted mb-3">
                Comienza registrando la primera sala de tu clínica
              </p>
              <button className="btn btn-primary" onClick={abrirModalCrear}>
                <i className="ti ti-plus me-2"></i>Registrar Sala
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Sala</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {salas.map((sala) => (
                    <tr key={sala.id_sala}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                               style={{width: '40px', height: '40px', fontSize: '18px'}}>
                            <i className="ti ti-building"></i>
                          </div>
                          <div className="fw-semibold">{sala.nombre}</div>
                        </div>
                      </td>
                      <td>
                        <span className="text-muted">
                          {sala.descripcion || 'Sin descripción'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${sala.activo ? 'bg-success' : 'bg-secondary'}`}>
                          {sala.activo ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group" role="group">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => abrirModalEditar(sala)}
                            title="Editar"
                          >
                            <i className="ti ti-edit"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => confirmarEliminar(sala)}
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

      {/* Modal Crear/Editar Sala */}
      {showModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={`ti ti-${modalMode === 'crear' ? 'plus' : 'edit'} me-2`}></i>
                  {modalMode === 'crear' ? 'Nueva Sala' : 'Editar Sala'}
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
                        placeholder="Ej: Sala de Ortodoncia, Sala Principal"
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
                        placeholder="Describe el propósito o características de la sala"
                      ></textarea>
                    </div>
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          name="activo" 
                          checked={formData.activo} 
                          onChange={handleInputChange}
                          id="activoSwitch"
                        />
                        <label className="form-check-label" htmlFor="activoSwitch">
                          Sala activa
                        </label>
                        <small className="text-muted d-block">
                          Las salas inactivas no aparecerán en los catálogos o selectores
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
        onConfirm={eliminarSala}
        onCancel={() => {
          setShowConfirmDelete(false)
          setSalaToDelete(null)
        }}
        title="¿Estás seguro?"
        message={`¿Deseas eliminar la sala "${salaToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        confirmColor="danger"
        icon="ti ti-alert-triangle"
      />
    </HorizontalLayout>
  )
}

