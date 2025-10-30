'use client'

import { useState, useEffect } from 'react'
import HorizontalLayout from '@/components/layout/HorizontalLayout'
import ConfirmModal from '@/components/ConfirmModal'
import { usuariosService } from '@/services/usuariosService'
import { rolesService } from '@/services/rolesService'
import { mostrarErrorAPI, mostrarExito } from '@/utils/sweetAlertHelper'

export default function Usuarios() {
  // Estado de pestañas
  const [activeTab, setActiveTab] = useState('usuarios')
  
  // Estados para Usuarios
  const [usuarios, setUsuarios] = useState([])
  const [loadingUsuarios, setLoadingUsuarios] = useState(true)
  const [showModalUsuario, setShowModalUsuario] = useState(false)
  const [modalModeUsuario, setModalModeUsuario] = useState('crear')
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null)
  const [formDataUsuario, setFormDataUsuario] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    id_rol: 2,
    activo: 1
  })

  // Estados para Roles
  const [roles, setRoles] = useState([])
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [showModalRol, setShowModalRol] = useState(false)
  const [modalModeRol, setModalModeRol] = useState('crear')
  const [rolSeleccionado, setRolSeleccionado] = useState(null)
  const [formDataRol, setFormDataRol] = useState({
    nombre: '',
    descripcion: '',
    default_home: 1
  })

  // Estados de confirmación
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [deleteType, setDeleteType] = useState('') // 'usuario' o 'rol'

  // Estados globales
  const [loadingAction, setLoadingAction] = useState(false)

  useEffect(() => {
    cargarUsuarios()
    cargarRoles()
  }, [])

  // ==================== USUARIOS ====================
  
  const cargarUsuarios = async () => {
    try {
      setLoadingUsuarios(true)
      const data = await usuariosService.listarPorClinica()
      setUsuarios(data)
    } catch (err) {
      console.error('Error al cargar usuarios:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoadingUsuarios(false)
    }
  }

  const handleInputChangeUsuario = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name === 'activo') {
      setFormDataUsuario({
        ...formDataUsuario,
        [name]: checked ? 1 : 0
      })
    } else if (name === 'id_rol') {
      setFormDataUsuario({
        ...formDataUsuario,
        [name]: parseInt(value)
      })
    } else {
      setFormDataUsuario({
        ...formDataUsuario,
        [name]: value
      })
    }
  }

  const abrirModalCrearUsuario = () => {
    setModalModeUsuario('crear')
    setFormDataUsuario({
      nombre: '',
      email: '',
      telefono: '',
      password: '',
      id_rol: roles.length > 0 ? roles[0].id_rol : 2,
      activo: 1
    })
    setUsuarioSeleccionado(null)
    setShowModalUsuario(true)
  }

  const abrirModalEditarUsuario = (usuario) => {
    setModalModeUsuario('editar')
    setFormDataUsuario({
      nombre: usuario.nombre,
      email: usuario.email,
      telefono: usuario.telefono || '',
      password: '',
      id_rol: usuario.id_rol,
      activo: usuario.activo === null ? 1 : usuario.activo
    })
    setUsuarioSeleccionado(usuario)
    setShowModalUsuario(true)
  }

  const cerrarModalUsuario = () => {
    setShowModalUsuario(false)
    setUsuarioSeleccionado(null)
  }

  const handleSubmitUsuario = async (e) => {
    e.preventDefault()
    setLoadingAction(true)

    try {
      if (modalModeUsuario === 'crear') {
        await usuariosService.crear(formDataUsuario)
        await mostrarExito('Usuario creado exitosamente')
        cargarUsuarios()
        cerrarModalUsuario()
      } else {
        const datosActualizar = { ...formDataUsuario }
        if (!datosActualizar.password) {
          delete datosActualizar.password
        }
        await usuariosService.actualizar(usuarioSeleccionado.id_usuario, datosActualizar)
        await mostrarExito('Usuario actualizado exitosamente')
        cargarUsuarios()
        cerrarModalUsuario()
      }
    } catch (err) {
      console.error('Error al guardar usuario:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoadingAction(false)
    }
  }

  const confirmarEliminarUsuario = (usuario) => {
    setItemToDelete(usuario)
    setDeleteType('usuario')
    setShowConfirmDelete(true)
  }

  const eliminarUsuario = async () => {
    try {
      await usuariosService.eliminar(itemToDelete.id_usuario)
      await mostrarExito('Usuario eliminado exitosamente')
      cargarUsuarios()
    } catch (err) {
      console.error('Error al eliminar usuario:', err)
      await mostrarErrorAPI(err)
    } finally {
      setShowConfirmDelete(false)
      setItemToDelete(null)
    }
  }

  // ==================== ROLES ====================

  const cargarRoles = async () => {
    try {
      setLoadingRoles(true)
      const data = await rolesService.listarPorClinica()
      setRoles(data)
    } catch (err) {
      console.error('Error al cargar roles:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoadingRoles(false)
    }
  }

  const handleInputChangeRol = (e) => {
    const { name, value } = e.target
    
    if (name === 'default_home') {
      setFormDataRol({
        ...formDataRol,
        [name]: parseInt(value)
      })
    } else {
      setFormDataRol({
        ...formDataRol,
        [name]: value
      })
    }
  }

  const abrirModalCrearRol = () => {
    setModalModeRol('crear')
    setFormDataRol({
      nombre: '',
      descripcion: '',
      default_home: 1
    })
    setRolSeleccionado(null)
    setShowModalRol(true)
  }

  const abrirModalEditarRol = (rol) => {
    setModalModeRol('editar')
    setFormDataRol({
      nombre: rol.nombre,
      descripcion: rol.descripcion || '',
      default_home: rol.default_home || 1
    })
    setRolSeleccionado(rol)
    setShowModalRol(true)
  }

  const cerrarModalRol = () => {
    setShowModalRol(false)
    setRolSeleccionado(null)
  }

  const handleSubmitRol = async (e) => {
    e.preventDefault()
    setLoadingAction(true)

    try {
      if (modalModeRol === 'crear') {
        await rolesService.crear(formDataRol)
        await mostrarExito('Rol creado exitosamente')
        cargarRoles()
        cerrarModalRol()
      } else {
        await rolesService.actualizar(rolSeleccionado.id_rol, formDataRol)
        await mostrarExito('Rol actualizado exitosamente')
        cargarRoles()
        cerrarModalRol()
      }
    } catch (err) {
      console.error('Error al guardar rol:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoadingAction(false)
    }
  }

  const confirmarEliminarRol = (rol) => {
    setItemToDelete(rol)
    setDeleteType('rol')
    setShowConfirmDelete(true)
  }

  const eliminarRol = async () => {
    try {
      await rolesService.eliminar(itemToDelete.id_rol)
      await mostrarExito('Rol eliminado exitosamente')
      cargarRoles()
      cargarUsuarios()
    } catch (err) {
      console.error('Error al eliminar rol:', err)
      await mostrarErrorAPI(err)
    } finally {
      setShowConfirmDelete(false)
      setItemToDelete(null)
    }
  }

  // ==================== HELPERS ====================

  const getRolNombre = (idRol) => {
    const rol = roles.find(r => r.id_rol === idRol)
    return rol ? rol.nombre : 'Desconocido'
  }

  const getRolBadgeClass = (idRol) => {
    const colores = [
      'bg-danger', 'bg-info', 'bg-success', 'bg-warning', 'bg-secondary', 'bg-primary'
    ]
    return colores[idRol % colores.length] || 'bg-secondary'
  }

  return (
    <HorizontalLayout>
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="fw-bold mb-2">
                <i className="ti ti-user-shield me-2"></i>
                Usuarios y Permisos
              </h2>
              <p className="text-muted mb-0">Gestión de usuarios y roles del sistema</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mensajes - Ya no necesarios, SweetAlert2 los maneja */}

      {/* Card con pestañas */}
      <div className="card">
        <div className="card-header bg-white border-bottom">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'usuarios' ? 'active' : ''}`}
                onClick={() => setActiveTab('usuarios')}
              >
                <i className="ti ti-users me-2"></i>Usuarios
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'roles' ? 'active' : ''}`}
                onClick={() => setActiveTab('roles')}
              >
                <i className="ti ti-shield-lock me-2"></i>Roles
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body">
          {/* Tab Usuarios */}
          {activeTab === 'usuarios' && (
            <div>
              <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-primary" onClick={abrirModalCrearUsuario}>
                  <i className="ti ti-plus me-2"></i>Nuevo Usuario
                </button>
              </div>

              {loadingUsuarios ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                  <p className="mt-3 text-muted">Cargando usuarios...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th className="text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((usuario) => (
                        <tr key={usuario.id_usuario}>
                          <td><span className="badge bg-light text-dark">{usuario.id_usuario}</span></td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                   style={{width: '40px', height: '40px'}}>
                                {usuario.nombre.charAt(0).toUpperCase()}
                              </div>
                              <span className="fw-semibold">{usuario.nombre}</span>
                            </div>
                          </td>
                          <td><i className="ti ti-mail me-2 text-muted"></i>{usuario.email}</td>
                          <td>{usuario.telefono || <span className="text-muted">-</span>}</td>
                          <td>
                            <span className={`badge ${getRolBadgeClass(usuario.id_rol)}`}>
                              {getRolNombre(usuario.id_rol)}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${usuario.activo ? 'bg-success' : 'bg-danger'}`}>
                              {usuario.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="text-end">
                            <button className="btn btn-sm btn-outline-primary me-1" onClick={() => abrirModalEditarUsuario(usuario)}>
                              <i className="ti ti-edit"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => confirmarEliminarUsuario(usuario)}>
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
          )}

          {/* Tab Roles */}
          {activeTab === 'roles' && (
            <div>
              <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-primary" onClick={abrirModalCrearRol}>
                  <i className="ti ti-plus me-2"></i>Nuevo Rol
                </button>
              </div>

              {loadingRoles ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                  <p className="mt-3 text-muted">Cargando roles...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Vista Inicial</th>
                        <th className="text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map((rol) => (
                        <tr key={rol.id_rol}>
                          <td><span className="badge bg-light text-dark">{rol.id_rol}</span></td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <i className="ti ti-shield-lock text-primary" style={{fontSize: '24px'}}></i>
                              <span className="fw-semibold">{rol.nombre}</span>
                            </div>
                          </td>
                          <td className="text-muted">{rol.descripcion}</td>
                          <td>
                            <span className="badge bg-info">
                              {rol.default_home === 1 ? 'Dashboard' : `Módulo ${rol.default_home}`}
                            </span>
                          </td>
                          <td className="text-end">
                            <button className="btn btn-sm btn-outline-primary me-1" onClick={() => abrirModalEditarRol(rol)}>
                              <i className="ti ti-edit"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => confirmarEliminarRol(rol)}>
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
          )}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        show={showConfirmDelete}
        onConfirm={deleteType === 'usuario' ? eliminarUsuario : eliminarRol}
        onCancel={() => {
          setShowConfirmDelete(false)
          setItemToDelete(null)
        }}
        title="¿Estás seguro?"
        message={
          deleteType === 'usuario' 
            ? `¿Deseas eliminar al usuario "${itemToDelete?.nombre}"? Esta acción no se puede deshacer.`
            : `¿Deseas eliminar el rol "${itemToDelete?.nombre}"? Los usuarios con este rol podrían verse afectados.`
        }
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        confirmColor="danger"
        icon="ti ti-alert-triangle"
      />

      {/* Modal Usuario */}
      {showModalUsuario && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={`ti ti-${modalModeUsuario === 'crear' ? 'user-plus' : 'user-edit'} me-2`}></i>
                  {modalModeUsuario === 'crear' ? 'Crear Usuario' : 'Editar Usuario'}
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModalUsuario}></button>
              </div>
              <form onSubmit={handleSubmitUsuario}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nombre <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="nombre" value={formDataUsuario.nombre} onChange={handleInputChangeUsuario} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email <span className="text-danger">*</span></label>
                    <input type="email" className="form-control" name="email" value={formDataUsuario.email} onChange={handleInputChangeUsuario} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input type="tel" className="form-control" name="telefono" value={formDataUsuario.telefono} onChange={handleInputChangeUsuario} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Contraseña {modalModeUsuario === 'crear' && <span className="text-danger">*</span>}</label>
                    <input type="password" className="form-control" name="password" value={formDataUsuario.password} onChange={handleInputChangeUsuario} 
                           required={modalModeUsuario === 'crear'} placeholder={modalModeUsuario === 'editar' ? 'Dejar vacío para no cambiar' : ''} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Rol <span className="text-danger">*</span></label>
                    <select className="form-select" name="id_rol" value={formDataUsuario.id_rol} onChange={handleInputChangeUsuario} required>
                      {roles.map(rol => (
                        <option key={rol.id_rol} value={rol.id_rol}>{rol.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" name="activo" checked={formDataUsuario.activo === 1} onChange={handleInputChangeUsuario} />
                    <label className="form-check-label">Usuario Activo</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cerrarModalUsuario}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={loadingAction}>
                    {loadingAction ? 'Guardando...' : (modalModeUsuario === 'crear' ? 'Crear' : 'Guardar')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rol */}
      {showModalRol && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={`ti ti-shield-${modalModeRol === 'crear' ? 'plus' : 'edit'} me-2`}></i>
                  {modalModeRol === 'crear' ? 'Crear Rol' : 'Editar Rol'}
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModalRol}></button>
              </div>
              <form onSubmit={handleSubmitRol}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nombre del Rol <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="nombre" 
                      value={formDataRol.nombre} 
                      onChange={handleInputChangeRol} 
                      required 
                      placeholder="Ej: Recepcionista"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea 
                      className="form-control" 
                      name="descripcion" 
                      value={formDataRol.descripcion} 
                      onChange={handleInputChangeRol} 
                      rows="3"
                      placeholder="Describe las responsabilidades de este rol"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Vista Inicial <span className="text-danger">*</span></label>
                    <select 
                      className="form-select" 
                      name="default_home" 
                      value={formDataRol.default_home} 
                      onChange={handleInputChangeRol} 
                      required
                    >
                      <option value="1">Dashboard</option>
                      <option value="2">Módulo 2</option>
                      <option value="3">Módulo 3</option>
                      <option value="4">Módulo 4</option>
                    </select>
                    <small className="text-muted">Página que verá el usuario al iniciar sesión</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cerrarModalRol}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={loadingAction}>
                    {loadingAction ? 'Guardando...' : (modalModeRol === 'crear' ? 'Crear' : 'Guardar')}
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
