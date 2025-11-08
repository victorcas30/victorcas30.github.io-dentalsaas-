'use client'

import { useState, useEffect } from 'react'
import HorizontalLayout from '@/components/layout/HorizontalLayout'
import ConfirmModal from '@/components/ConfirmModal'
import { doctoresService } from '@/services/doctoresService'
import { authService } from '@/services/authService'
import { mostrarErrorAPI, mostrarExito } from '@/utils/sweetAlertHelper'

export default function Doctores() {
  const [doctores, setDoctores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('crear')
  const [doctorSeleccionado, setDoctorSeleccionado] = useState(null)
  const [loadingAction, setLoadingAction] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [doctorToDelete, setDoctorToDelete] = useState(null)
  
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    sexo: 'M',
    celular_whatsapp: '',
    email: ''
  })

  const idClinica = authService.getClinicaId()

  useEffect(() => {
    cargarDoctores()
  }, [])

  const cargarDoctores = async () => {
    try {
      setLoading(true)
      const data = await doctoresService.listarPorClinica(idClinica)
      setDoctores(data)
    } catch (err) {
      console.error('Error al cargar doctores:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const abrirModalCrear = () => {
    setModalMode('crear')
    setFormData({
      nombres: '',
      apellidos: '',
      sexo: 'M',
      celular_whatsapp: '',
      email: ''
    })
    setDoctorSeleccionado(null)
    setShowModal(true)
  }

  const abrirModalEditar = (doctor) => {
    setModalMode('editar')
    setFormData({
      nombres: doctor.nombres,
      apellidos: doctor.apellidos,
      sexo: doctor.sexo,
      celular_whatsapp: doctor.celular_whatsapp || '',
      email: doctor.email || ''
    })
    setDoctorSeleccionado(doctor)
    setShowModal(true)
  }

  const cerrarModal = () => {
    setShowModal(false)
    setDoctorSeleccionado(null)
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
        await doctoresService.crear(body)
        await mostrarExito('Doctor creado exitosamente')
      } else {
        await doctoresService.actualizar(doctorSeleccionado.id_doctor, idClinica, {
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          sexo: formData.sexo,
          celular_whatsapp: formData.celular_whatsapp,
          email: formData.email
        })
        await mostrarExito('Doctor actualizado exitosamente')
      }
      
      cargarDoctores()
      cerrarModal()
    } catch (err) {
      console.error('Error al guardar doctor:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoadingAction(false)
    }
  }

  const confirmarEliminar = (doctor) => {
    setDoctorToDelete(doctor)
    setShowConfirmDelete(true)
  }

  const eliminarDoctor = async () => {
    try {
      await doctoresService.eliminar(doctorToDelete.id_doctor, idClinica)
      await mostrarExito('Doctor eliminado exitosamente')
      cargarDoctores()
    } catch (err) {
      console.error('Error al eliminar doctor:', err)
      await mostrarErrorAPI(err)
    } finally {
      setShowConfirmDelete(false)
      setDoctorToDelete(null)
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
                <i className="ti ti-user-doctor me-2"></i>
                Doctores
              </h2>
              <p className="text-muted mb-0">
                Gestiona los doctores de tu clínica
              </p>
            </div>
            <button className="btn btn-primary" onClick={abrirModalCrear}>
              <i className="ti ti-plus me-2"></i>
              Nuevo Doctor
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de doctores */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-3 text-muted">Cargando doctores...</p>
            </div>
          ) : doctores.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-user-off" style={{fontSize: '64px', color: '#ccc'}}></i>
              <h4 className="mt-3 mb-2">No hay doctores</h4>
              <p className="text-muted mb-3">
                Comienza registrando el primer doctor de tu clínica
              </p>
              <button className="btn btn-primary" onClick={abrirModalCrear}>
                <i className="ti ti-plus me-2"></i>Registrar Doctor
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Doctor</th>
                    <th>Sexo</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {doctores.map((doctor) => (
                    <tr key={doctor.id_doctor}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                               style={{width: '40px', height: '40px', fontSize: '18px'}}>
                            <i className="ti ti-user-doctor"></i>
                          </div>
                          <div>
                            <div className="fw-semibold">{doctor.nombre_titulo || doctor.nombre}</div>
                            {doctor.nombre_titulo && doctor.nombre !== doctor.nombre_titulo && (
                              <small className="text-muted">{doctor.nombre}</small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-info">
                          {doctor.sexo === 'M' ? 'Masculino' : 'Femenino'}
                        </span>
                      </td>
                      <td>{doctor.celular_whatsapp || '—'}</td>
                      <td>{doctor.email || '—'}</td>
                      <td className="text-end">
                        <div className="btn-group" role="group">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => abrirModalEditar(doctor)}
                            title="Editar"
                          >
                            <i className="ti ti-edit"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => confirmarEliminar(doctor)}
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

      {/* Modal Crear/Editar Doctor */}
      {showModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={`ti ti-${modalMode === 'crear' ? 'plus' : 'edit'} me-2`}></i>
                  {modalMode === 'crear' ? 'Nuevo Doctor' : 'Editar Doctor'}
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Nombres <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="nombres" 
                        value={formData.nombres} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="Ej: Juan Carlos"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Apellidos <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="apellidos" 
                        value={formData.apellidos} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="Ej: Ramírez López"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Sexo <span className="text-danger">*</span>
                      </label>
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
                      <small className="text-muted">
                        El título (Dr./Dra.) se asignará automáticamente según el sexo
                      </small>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Celular/WhatsApp <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="celular_whatsapp" 
                        value={formData.celular_whatsapp} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="+50371234567"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">
                        Email <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="email" 
                        className="form-control" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="doctor@clinicadental.com"
                      />
                    </div>
                    {modalMode === 'editar' && doctorSeleccionado && (
                      <div className="col-12">
                        <div className="alert alert-info mb-0">
                          <i className="ti ti-info-circle me-2"></i>
                          <strong>Vista previa:</strong> {doctorSeleccionado.sexo === 'M' ? 'Dr.' : 'Dra.'} {formData.nombres} {formData.apellidos}
                        </div>
                      </div>
                    )}
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
        onConfirm={eliminarDoctor}
        onCancel={() => {
          setShowConfirmDelete(false)
          setDoctorToDelete(null)
        }}
        title="¿Estás seguro?"
        message={`¿Deseas eliminar al doctor "${doctorToDelete?.nombre_titulo || doctorToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        confirmColor="danger"
        icon="ti ti-alert-triangle"
      />
    </HorizontalLayout>
  )
}

