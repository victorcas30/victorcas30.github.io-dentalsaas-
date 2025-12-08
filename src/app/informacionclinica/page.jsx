'use client'

import { useState, useEffect, useRef } from 'react'
import HorizontalLayout from '@/components/layout/HorizontalLayout'
import { clinicasService } from '@/services/clinicasService'
import { authService } from '@/services/authService'
import { mostrarErrorAPI, mostrarExito } from '@/utils/sweetAlertHelper'

export default function InformacionClinica() {
  const idClinica = authService.getClinicaId()
  const [clinica, setClinica] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingLogo, setLoadingLogo] = useState(false)
  const [loadingUbicacion, setLoadingUbicacion] = useState(false)
  const [previewLogo, setPreviewLogo] = useState(null)
  const fileInputRef = useRef(null)
  
  const [formDataUbicacion, setFormDataUbicacion] = useState({
    latitud: '',
    longitud: ''
  })

  useEffect(() => {
    if (idClinica) {
      cargarClinica()
    }
  }, [idClinica])

  const cargarClinica = async () => {
    try {
      setLoading(true)
      const data = await clinicasService.obtenerPorId(idClinica)
      setClinica(data)
      
      // Establecer preview del logo si existe
      if (data.logo_url) {
        setPreviewLogo(data.logo_url)
      }
      
      // Establecer ubicación si existe
      if (data.latitud && data.longitud) {
        setFormDataUbicacion({
          latitud: data.latitud.toString(),
          longitud: data.longitud.toString()
        })
      }
    } catch (err) {
      console.error('Error al cargar clínica:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tipo de archivo
      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!tiposPermitidos.includes(file.type)) {
        mostrarErrorAPI({ message: 'El archivo debe ser una imagen (JPEG, PNG o WEBP)' })
        return
      }

      // Validar tamaño (5MB)
      const tamañoMaximo = 5 * 1024 * 1024
      if (file.size > tamañoMaximo) {
        mostrarErrorAPI({ message: 'El archivo no puede ser mayor a 5MB' })
        return
      }

      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewLogo(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubirLogo = async () => {
    const file = fileInputRef.current?.files[0]
    if (!file) {
      await mostrarErrorAPI({ message: 'Por favor selecciona un archivo' })
      return
    }

    try {
      setLoadingLogo(true)
      const result = await clinicasService.actualizarLogo(idClinica, file)
      await mostrarExito('Logo actualizado correctamente')
      
      // Actualizar la información de la clínica
      if (result.data) {
        setClinica(prev => ({
          ...prev,
          ...result.data
        }))
        if (result.data.logo_url) {
          setPreviewLogo(result.data.logo_url)
        }
      }
      
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      console.error('Error al subir logo:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoadingLogo(false)
    }
  }

  const handleInputChangeUbicacion = (e) => {
    const { name, value } = e.target
    setFormDataUbicacion({
      ...formDataUbicacion,
      [name]: value
    })
  }

  const handleActualizarUbicacion = async (e) => {
    e.preventDefault()
    
    const latitud = parseFloat(formDataUbicacion.latitud)
    const longitud = parseFloat(formDataUbicacion.longitud)

    if (isNaN(latitud) || isNaN(longitud)) {
      await mostrarErrorAPI({ message: 'Por favor ingresa valores numéricos válidos' })
      return
    }

    try {
      setLoadingUbicacion(true)
      const result = await clinicasService.actualizarUbicacion(idClinica, latitud, longitud)
      await mostrarExito('Ubicación actualizada correctamente')
      
      // Actualizar la información de la clínica
      if (result.data) {
        setClinica(prev => ({
          ...prev,
          ...result.data
        }))
      }
    } catch (err) {
      console.error('Error al actualizar ubicación:', err)
      await mostrarErrorAPI(err)
    } finally {
      setLoadingUbicacion(false)
    }
  }

  const obtenerUbicacionActual = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormDataUbicacion({
            latitud: position.coords.latitude.toFixed(6),
            longitud: position.coords.longitude.toFixed(6)
          })
        },
        (error) => {
          console.error('Error al obtener ubicación:', error)
          mostrarErrorAPI({ message: 'No se pudo obtener tu ubicación actual' })
        }
      )
    } else {
      mostrarErrorAPI({ message: 'Tu navegador no soporta geolocalización' })
    }
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return '—'
    try {
      const date = new Date(fecha)
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return fecha
    }
  }

  return (
    <HorizontalLayout>
      {/* Header de la página */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="fw-bold mb-2">
                <i className="ti ti-building-hospital me-2"></i>
                Información de la Clínica
              </h2>
              <p className="text-muted mb-0">
                Gestiona toda la información y configuración de tu clínica
              </p>
            </div>
            {clinica && (
              <div className="d-flex align-items-center gap-2">
                <span className={`badge ${clinica.activo ? 'bg-success' : 'bg-secondary'} fs-6 px-3 py-2`}>
                  <i className={`ti ${clinica.activo ? 'ti-check' : 'ti-x'} me-1`}></i>
                  {clinica.activo ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3 text-muted mb-0">Cargando información de la clínica...</p>
              </div>
            </div>
          </div>
        </div>
      ) : clinica ? (
        <>
          {/* Header con Logo y Nombre */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm border-0" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <div className="card-body p-4">
                  <div className="row align-items-center">
                    <div className="col-auto">
                      {previewLogo ? (
                        <div className="bg-white rounded p-3 shadow" style={{width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <img 
                            src={previewLogo} 
                            alt="Logo de la clínica" 
                            className="img-fluid"
                            style={{maxHeight: '100%', maxWidth: '100%', objectFit: 'contain'}}
                          />
                        </div>
                      ) : (
                        <div className="bg-white rounded p-3 shadow" style={{width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <i className="ti ti-building-hospital text-muted" style={{fontSize: '48px'}}></i>
                        </div>
                      )}
                    </div>
                    <div className="col">
                      <h3 className="text-white mb-2 fw-bold">{clinica.nombre || 'Sin nombre'}</h3>
                      <p className="text-white-50 mb-0">
                        <i className="ti ti-map-pin me-1"></i>
                        {clinica.direccion || 'Sin dirección registrada'}
                      </p>
                      <div className="mt-2 d-flex gap-3 flex-wrap">
                        {clinica.telefono && (
                          <span className="text-white-50">
                            <i className="ti ti-phone me-1"></i>
                            {clinica.telefono}
                          </span>
                        )}
                        {clinica.email && (
                          <span className="text-white-50">
                            <i className="ti ti-mail me-1"></i>
                            {clinica.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Información de Contacto */}
            <div className="col-12 col-lg-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-white border-bottom">
                  <h5 className="mb-0 fw-semibold">
                    <i className="ti ti-address-book me-2 text-primary"></i>
                    Información de Contacto
                  </h5>
                </div>
                <div className="card-body">
                  <div className="mb-3 pb-3 border-bottom">
                    <label className="form-label text-muted small mb-1">
                      <i className="ti ti-building me-1"></i>
                      Nombre de la Clínica
                    </label>
                    <p className="fw-semibold mb-0 fs-6">{clinica.nombre || '—'}</p>
                  </div>
                  
                  <div className="mb-3 pb-3 border-bottom">
                    <label className="form-label text-muted small mb-1">
                      <i className="ti ti-map-pin me-1"></i>
                      Dirección
                    </label>
                    <p className="mb-0">{clinica.direccion || '—'}</p>
                  </div>

                  <div className="mb-3 pb-3 border-bottom">
                    <label className="form-label text-muted small mb-1">
                      <i className="ti ti-phone me-1"></i>
                      Teléfono
                    </label>
                    <p className="mb-0">
                      {clinica.telefono ? (
                        <a href={`tel:${clinica.telefono}`} className="text-decoration-none">
                          {clinica.telefono}
                        </a>
                      ) : '—'}
                    </p>
                  </div>

                  <div className="mb-0">
                    <label className="form-label text-muted small mb-1">
                      <i className="ti ti-mail me-1"></i>
                      Correo Electrónico
                    </label>
                    <p className="mb-0">
                      {clinica.email ? (
                        <a href={`mailto:${clinica.email}`} className="text-decoration-none">
                          {clinica.email}
                        </a>
                      ) : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Logo y Branding */}
            <div className="col-12 col-lg-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-white border-bottom">
                  <h5 className="mb-0 fw-semibold">
                    <i className="ti ti-photo me-2 text-primary"></i>
                    Logo y Branding
                  </h5>
                </div>
                <div className="card-body">
                  <div className="text-center mb-4">
                    {previewLogo ? (
                      <div className="mb-3 p-3 bg-light rounded">
                        <img 
                          src={previewLogo} 
                          alt="Logo de la clínica" 
                          className="img-fluid rounded shadow-sm"
                          style={{maxHeight: '180px', maxWidth: '100%', objectFit: 'contain'}}
                        />
                      </div>
                    ) : (
                      <div className="border rounded p-5 mb-3 bg-light" style={{minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <div className="text-muted">
                          <i className="ti ti-photo" style={{fontSize: '48px', opacity: 0.3}}></i>
                          <p className="mt-2 mb-0 small">No hay logo cargado</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {clinica.logo_nombre && (
                    <div className="mb-3 pb-3 border-bottom">
                      <label className="form-label text-muted small mb-1">
                        <i className="ti ti-file me-1"></i>
                        Nombre del Archivo
                      </label>
                      <p className="mb-0">
                        <code className="small">{clinica.logo_nombre}</code>
                      </p>
                    </div>
                  )}

                  {clinica.logo_nombre_sistema && (
                    <div className="mb-3 pb-3 border-bottom">
                      <label className="form-label text-muted small mb-1">
                        <i className="ti ti-file-code me-1"></i>
                        Nombre en Sistema
                      </label>
                      <p className="mb-0">
                        <code className="small">{clinica.logo_nombre_sistema}</code>
                      </p>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      <i className="ti ti-upload me-1"></i>
                      Actualizar Logo
                    </label>
                    <input 
                      type="file" 
                      className="form-control form-control-sm" 
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                    <small className="text-muted">
                      Formatos: JPEG, PNG, WEBP. Máx: 5MB
                    </small>
                  </div>
                  
                  <button 
                    className="btn btn-primary w-100"
                    onClick={handleSubirLogo}
                    disabled={loadingLogo || !fileInputRef.current?.files[0]}
                  >
                    {loadingLogo ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <i className="ti ti-upload me-2"></i>
                        Subir Logo
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Ubicación Geográfica */}
            <div className="col-12 col-lg-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-white border-bottom">
                  <h5 className="mb-0 fw-semibold">
                    <i className="ti ti-map-pin me-2 text-primary"></i>
                    Ubicación Geográfica
                  </h5>
                </div>
                <div className="card-body">
                  {clinica.latitud && clinica.longitud && (
                    <div className="mb-4 p-3 bg-light rounded">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="text-muted small">
                          <i className="ti ti-map me-1"></i>
                          Coordenadas actuales:
                        </span>
                        <a 
                          href={`https://www.google.com/maps?q=${clinica.latitud},${clinica.longitud}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="ti ti-external-link me-1"></i>
                          Ver en Maps
                        </a>
                      </div>
                      <div className="row">
                        <div className="col-6">
                          <small className="text-muted d-block">Latitud</small>
                          <strong>{clinica.latitud}</strong>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Longitud</small>
                          <strong>{clinica.longitud}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleActualizarUbicacion}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Latitud <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="number" 
                        step="any"
                        className="form-control" 
                        name="latitud"
                        value={formDataUbicacion.latitud}
                        onChange={handleInputChangeUbicacion}
                        placeholder="Ej: 13.6929"
                        required
                      />
                      <small className="text-muted">Valor entre -90 y 90</small>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Longitud <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="number" 
                        step="any"
                        className="form-control" 
                        name="longitud"
                        value={formDataUbicacion.longitud}
                        onChange={handleInputChangeUbicacion}
                        placeholder="Ej: -89.2182"
                        required
                      />
                      <small className="text-muted">Valor entre -180 y 180</small>
                    </div>

                    <div className="d-flex gap-2">
                      <button 
                        type="button"
                        className="btn btn-outline-secondary flex-fill"
                        onClick={obtenerUbicacionActual}
                        title="Obtener ubicación actual del navegador"
                      >
                        <i className="ti ti-crosshair me-2"></i>
                        Mi ubicación
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary flex-fill"
                        disabled={loadingUbicacion}
                      >
                        {loadingUbicacion ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <i className="ti ti-check me-2"></i>
                            Guardar
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Información Administrativa */}
            <div className="col-12 col-lg-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-white border-bottom">
                  <h5 className="mb-0 fw-semibold">
                    <i className="ti ti-info-circle me-2 text-primary"></i>
                    Información Administrativa
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label text-muted small mb-1">
                        <i className="ti ti-hash me-1"></i>
                        ID Clínica
                      </label>
                      <p className="fw-semibold mb-0">#{clinica.id_clinica}</p>
                    </div>
                    
                    <div className="col-6 mb-3">
                      <label className="form-label text-muted small mb-1">
                        <i className="ti ti-toggle-left me-1"></i>
                        Estado
                      </label>
                      <div>
                        <span className={`badge ${clinica.activo ? 'bg-success' : 'bg-secondary'}`}>
                          {clinica.activo ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </div>

                    {clinica.id_departamento && (
                      <div className="col-6 mb-3">
                        <label className="form-label text-muted small mb-1">
                          <i className="ti ti-map me-1"></i>
                          ID Departamento
                        </label>
                        <p className="mb-0">{clinica.id_departamento}</p>
                      </div>
                    )}

                    {clinica.id_municipio && (
                      <div className="col-6 mb-3">
                        <label className="form-label text-muted small mb-1">
                          <i className="ti ti-map-2 me-1"></i>
                          ID Municipio
                        </label>
                        <p className="mb-0">{clinica.id_municipio}</p>
                      </div>
                    )}

                    {clinica.id_distrito && (
                      <div className="col-6 mb-3">
                        <label className="form-label text-muted small mb-1">
                          <i className="ti ti-map-pin me-1"></i>
                          ID Distrito
                        </label>
                        <p className="mb-0">{clinica.id_distrito}</p>
                      </div>
                    )}
                  </div>

                  <hr className="my-3" />

                  <div className="mb-2">
                    <label className="form-label text-muted small mb-1">
                      <i className="ti ti-calendar-plus me-1"></i>
                      Fecha de Creación
                    </label>
                    <p className="mb-0 small">{formatearFecha(clinica.created_at)}</p>
                  </div>

                  <div className="mb-2">
                    <label className="form-label text-muted small mb-1">
                      <i className="ti ti-calendar-edit me-1"></i>
                      Última Actualización
                    </label>
                    <p className="mb-0 small">{formatearFecha(clinica.updated_at)}</p>
                  </div>

                  {clinica.updated_by && (
                    <div className="mb-0">
                      <label className="form-label text-muted small mb-1">
                        <i className="ti ti-user-edit me-1"></i>
                        Actualizado por
                      </label>
                      <p className="mb-0 small">Usuario ID: {clinica.updated_by}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <i className="ti ti-alert-circle text-warning" style={{fontSize: '48px'}}></i>
                <p className="mt-3 text-muted mb-0">No se pudo cargar la información de la clínica</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </HorizontalLayout>
  )
}
