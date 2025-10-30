'use client'

import { useState, useEffect } from 'react'
import HorizontalLayout from '@/components/layout/HorizontalLayout'
import { rolesService } from '@/services/rolesService'
import { modulosRutasService } from '@/services/modulosRutasService'
import { rolRutasService } from '@/services/rolRutasService'
import { mostrarErrorAPI, mostrarExito } from '@/utils/sweetAlertHelper'

export default function Permisos() {
  // Estados
  const [roles, setRoles] = useState([])
  const [modulosConRutas, setModulosConRutas] = useState([])
  const [rolSeleccionado, setRolSeleccionado] = useState(null)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    cargarRoles()
  }, [])

  useEffect(() => {
    if (rolSeleccionado) {
      cargarModulosConRutas(rolSeleccionado.id_rol)
    }
  }, [rolSeleccionado])

  const cargarRoles = async () => {
    try {
      setLoading(true)
      const rolesData = await rolesService.listarPorClinica()
      setRoles(rolesData)
      
      // Seleccionar el primer rol por defecto
      if (rolesData.length > 0) {
        setRolSeleccionado(rolesData[0])
      }
    } catch (err) {
      console.error('Error al cargar roles:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoading(false)
    }
  }

  const cargarModulosConRutas = async (idRol) => {
    try {
      setLoading(true)
      const data = await modulosRutasService.obtenerModulosConRutasPorRol(idRol)
      setModulosConRutas(data)
    } catch (err) {
      console.error('Error al cargar módulos con rutas:', err)
      await mostrarErrorAPI(err)
      setModulosConRutas([])
    } finally {
      setLoading(false)
    }
  }

  const handleToggleRuta = async (idRuta, estaAsignada) => {
    try {
      setGuardando(true)
      
      // Toggle: si está asignada, desasignar (0), si no, asignar (1)
      const activo = estaAsignada ? 0 : 1
      
      await rolRutasService.toggleRutaRol(
        rolSeleccionado.id_rol,
        idRuta,
        activo
      )
      
      // Actualizar estado local: cambiar el campo 'activa' de la ruta
      const nuevosModulos = modulosConRutas.map(modulo => ({
        ...modulo,
        rutas: modulo.rutas.map(ruta => 
          ruta.id_ruta === idRuta 
            ? { ...ruta, activa: activo === 1 ? "1" : "0" }
            : ruta
        )
      }))
      setModulosConRutas(nuevosModulos)
      
      await mostrarExito(
        estaAsignada 
          ? 'Permiso eliminado exitosamente' 
          : 'Permiso asignado exitosamente'
      )
    } catch (err) {
      console.error('Error al toggle ruta:', err)
      await mostrarErrorAPI(err)
    } finally {
      setGuardando(false)
    }
  }

  const handleSelectAllModulo = async (modulo, seleccionar) => {
    try {
      setGuardando(true)
      
      const rutasActivas = modulo.rutas.filter(r => r.activo === "1")
      
      for (const ruta of rutasActivas) {
        await rolRutasService.toggleRutaRol(
          rolSeleccionado.id_rol,
          ruta.id_ruta,
          seleccionar ? 1 : 0
        )
      }
      
      // Actualizar estado local
      const nuevosModulos = modulosConRutas.map(m => 
        m.id_modulo === modulo.id_modulo
          ? {
              ...m,
              rutas: m.rutas.map(ruta => 
                ruta.activo === "1"
                  ? { ...ruta, activa: seleccionar ? "1" : "0" }
                  : ruta
              )
            }
          : m
      )
      setModulosConRutas(nuevosModulos)
      
      await mostrarExito(
        seleccionar 
          ? 'Todos los permisos del módulo asignados' 
          : 'Todos los permisos del módulo eliminados'
      )
    } catch (err) {
      console.error('Error al seleccionar todo:', err)
      await mostrarErrorAPI(err)
    } finally {
      setGuardando(false)
    }
  }

  const todasLasRutasDelModuloAsignadas = (modulo) => {
    const rutasActivas = modulo.rutas.filter(r => r.activo === "1")
    if (rutasActivas.length === 0) return false
    return rutasActivas.every(ruta => ruta.activa === "1")
  }

  const algunaRutaDelModuloAsignada = (modulo) => {
    return modulo.rutas.some(ruta => ruta.activa === "1")
  }

  const contarRutasAsignadas = (modulo) => {
    return modulo.rutas.filter(r => r.activa === "1").length
  }

  const contarRutasActivas = (modulo) => {
    return modulo.rutas.filter(r => r.activo === "1").length
  }

  return (
    <HorizontalLayout>
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="fw-bold mb-2">
                <i className="ti ti-lock-access me-2"></i>
                Gestión de Permisos
              </h2>
              <p className="text-muted mb-0">Asigna rutas a los roles del sistema</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary"></div>
            <p className="mt-3 text-muted">Cargando datos...</p>
          </div>
        </div>
      ) : (
        <div className="row">
          {/* Sidebar de Roles */}
          <div className="col-md-3">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="ti ti-shield me-2"></i>
                  Roles
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {roles.map((rol) => (
                    <button
                      key={rol.id_rol}
                      className={`list-group-item list-group-item-action ${
                        rolSeleccionado?.id_rol === rol.id_rol ? 'active' : ''
                      }`}
                      onClick={() => setRolSeleccionado(rol)}
                      disabled={guardando}
                    >
                      <div className="d-flex align-items-center">
                        <i className="ti ti-shield-lock me-2"></i>
                        <div className="flex-grow-1">
                          <div className="fw-bold">{rol.nombre}</div>
                          {rol.descripcion && (
                            <small className={rolSeleccionado?.id_rol === rol.id_rol ? 'text-white-50' : 'text-muted'}>
                              {rol.descripcion}
                            </small>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Panel de Permisos */}
          <div className="col-md-9">
            {rolSeleccionado ? (
              <div className="card">
                <div className="card-header bg-white border-bottom">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h5 className="mb-0">
                        Permisos de: <span className="text-primary">{rolSeleccionado.nombre}</span>
                      </h5>
                      <small className="text-muted">
                        Selecciona las rutas a las que este rol tendrá acceso
                      </small>
                    </div>
                    {guardando && (
                      <div className="spinner-border spinner-border-sm text-primary"></div>
                    )}
                  </div>
                </div>
                <div className="card-body">
                  {modulosConRutas.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="ti ti-folder-off" style={{fontSize: '64px', color: '#ccc'}}></i>
                      <p className="mt-3 text-muted">No hay módulos disponibles</p>
                    </div>
                  ) : (
                    modulosConRutas.map((modulo) => {
                      const todasAsignadas = todasLasRutasDelModuloAsignadas(modulo)
                      const algunaAsignada = algunaRutaDelModuloAsignada(modulo)
                      const rutasAsignadas = contarRutasAsignadas(modulo)
                      const rutasActivas = contarRutasActivas(modulo)
                      
                      return (
                        <div key={modulo.id_modulo} className="mb-4">
                          {/* Header del Módulo */}
                          <div className="d-flex align-items-center justify-content-between mb-3 p-3 bg-light rounded">
                            <div className="d-flex align-items-center gap-2">
                              <i className="ti ti-layout-grid text-primary" style={{fontSize: '24px'}}></i>
                              <div>
                                <h6 className="mb-0 fw-bold">{modulo.modulo}</h6>
                                {modulo.modulo_descripcion && (
                                  <small className="text-muted">{modulo.modulo_descripcion}</small>
                                )}
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                              <small className="text-muted">
                                {rutasAsignadas} de {rutasActivas} asignadas
                              </small>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={todasAsignadas && rutasActivas > 0}
                                  onChange={(e) => handleSelectAllModulo(modulo, e.target.checked)}
                                  disabled={guardando || rutasActivas === 0}
                                  ref={input => {
                                    if (input) {
                                      input.indeterminate = algunaAsignada && !todasAsignadas
                                    }
                                  }}
                                />
                                <label className="form-check-label fw-semibold">
                                  Todas
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Lista de Rutas */}
                          {modulo.rutas.length === 0 ? (
                            <div className="alert alert-info">
                              <i className="ti ti-info-circle me-2"></i>
                              Este módulo no tiene rutas configuradas
                            </div>
                          ) : (
                            <div className="row g-2">
                              {modulo.rutas.map((ruta) => {
                                const estaAsignada = ruta.activa === "1"
                                const estaActiva = ruta.activo === "1"
                                
                                return (
                                  <div key={ruta.id_ruta} className="col-md-6">
                                    <div className={`card h-100 ${estaAsignada ? 'border-primary' : ''}`}>
                                      <div className="card-body p-3">
                                        <div className="form-check">
                                          <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={`ruta-${ruta.id_ruta}`}
                                            checked={estaAsignada}
                                            onChange={() => handleToggleRuta(ruta.id_ruta, estaAsignada)}
                                            disabled={guardando || !estaActiva}
                                          />
                                          <label 
                                            className="form-check-label w-100" 
                                            htmlFor={`ruta-${ruta.id_ruta}`}
                                            style={{cursor: estaActiva ? 'pointer' : 'not-allowed'}}
                                          >
                                            <div className="d-flex align-items-start justify-content-between">
                                              <div className="flex-grow-1">
                                                <div className="fw-semibold">{ruta.nombre}</div>
                                                <code className="small bg-light px-2 py-1 rounded">
                                                  {ruta.path}
                                                </code>
                                                {ruta.descripcion && (
                                                  <div className="small text-muted mt-1">
                                                    {ruta.descripcion}
                                                  </div>
                                                )}
                                              </div>
                                              {!estaActiva && (
                                                <span className="badge bg-danger ms-2">
                                                  Inactiva
                                                </span>
                                              )}
                                            </div>
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-body text-center py-5">
                  <i className="ti ti-arrow-left" style={{fontSize: '64px', color: '#ccc'}}></i>
                  <p className="mt-3 text-muted">Selecciona un rol para gestionar sus permisos</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </HorizontalLayout>
  )
}
