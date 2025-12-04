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
                Toda la configuración de la clínica
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary"></div>
                <p className="mt-3 text-muted">Cargando información...</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row">
          {/* Sección Logo */}
          <div className="col-12 col-lg-6 mb-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="ti ti-photo me-2"></i>
                  Logo de la Clínica
                </h5>
              </div>
              <div className="card-body">
                <div className="text-center mb-4">
                  {previewLogo ? (
                    <div className="mb-3">
                      <img 
                        src={previewLogo} 
                        alt="Logo de la clínica" 
                        className="img-fluid rounded"
                        style={{maxHeight: '200px', maxWidth: '100%', objectFit: 'contain'}}
                      />
                    </div>
                  ) : (
                    <div className="border rounded p-5 mb-3" style={{minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <div className="text-muted">
                        <i className="ti ti-photo" style={{fontSize: '48px', opacity: 0.3}}></i>
                        <p className="mt-2 mb-0">No hay logo cargado</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label className="form-label">
                    Seleccionar archivo de imagen
                  </label>
                  <input 
                    type="file" 
                    className="form-control" 
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                  <small className="text-muted">
                    Formatos permitidos: JPEG, PNG, WEBP. Tamaño máximo: 5MB
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

          {/* Sección Ubicación */}
          <div className="col-12 col-lg-6 mb-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="ti ti-map-pin me-2"></i>
                  Ubicación de la Clínica
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleActualizarUbicacion}>
                  <div className="mb-3">
                    <label className="form-label">
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
                    <small className="text-muted">
                      Valor entre -90 y 90
                    </small>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">
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
                    <small className="text-muted">
                      Valor entre -180 y 180
                    </small>
                  </div>

                  <div className="d-flex gap-2">
                    <button 
                      type="button"
                      className="btn btn-outline-secondary flex-fill"
                      onClick={obtenerUbicacionActual}
                      title="Obtener ubicación actual del navegador"
                    >
                      <i className="ti ti-crosshair me-2"></i>
                      Usar mi ubicación
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
                          Guardar Ubicación
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {clinica?.latitud && clinica?.longitud && (
                  <div className="mt-3">
                    <div className="alert alert-info mb-0">
                      <i className="ti ti-info-circle me-2"></i>
                      <strong>Ubicación actual:</strong> {clinica.latitud}, {clinica.longitud}
                      <br />
                      <a 
                        href={`https://www.google.com/maps?q=${clinica.latitud},${clinica.longitud}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none"
                      >
                        <i className="ti ti-external-link me-1"></i>
                        Ver en Google Maps
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información General */}
          {clinica && (
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="ti ti-info-circle me-2"></i>
                    Información General
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Nombre de la Clínica</label>
                      <p className="fw-semibold mb-0">{clinica.nombre || '—'}</p>
                    </div>
                    {clinica.logo_nombre && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-muted">Logo Actual</label>
                        <p className="mb-0">
                          <code>{clinica.logo_nombre}</code>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </HorizontalLayout>
  )
}
