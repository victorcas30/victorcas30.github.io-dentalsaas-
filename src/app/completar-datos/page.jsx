'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { completarDatosService } from '@/services/completarDatosService'
import { buildAppRoute } from '@/config/api'
import Swal from 'sweetalert2'

function CompletarDatosContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [paciente, setPaciente] = useState(null)
  const [clinica, setClinica] = useState(null)
  const [tokenInfo, setTokenInfo] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [logoError, setLogoError] = useState(false)

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
    consiente_tratamiento_datos: true
  })

  useEffect(() => {
    if (!token) {
      setError('No se proporcionó un token válido')
      setLoading(false)
      return
    }

    cargarDatos()
  }, [token])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await completarDatosService.obtenerDatosPorToken(token)
      
      if (data) {
        setPaciente(data.paciente)
        setClinica(data.clinica)
        setTokenInfo(data.token)
        setLogoError(false)

        // Prellenar formulario con datos existentes
        const fechaNacimiento = data.paciente.fecha_nacimiento 
          ? data.paciente.fecha_nacimiento.split('T')[0] 
          : ''
        
        setFormData({
          nombres: data.paciente.nombres || '',
          apellidos: data.paciente.apellidos || '',
          sexo: data.paciente.sexo || 'M',
          fecha_nacimiento: fechaNacimiento,
          dui: data.paciente.dui || '',
          celular_whatsapp: data.paciente.celular_whatsapp || '',
          telefono_secundario: data.paciente.telefono_secundario || '',
          email: data.paciente.email || '',
          direccion: data.paciente.direccion || '',
          nombre_contacto: data.paciente.nombre_contacto || '',
          telefono_contacto: data.paciente.telefono_contacto || '',
          es_paciente: data.paciente.es_paciente !== undefined ? data.paciente.es_paciente : true,
          consiente_tratamiento_datos: data.paciente.consiente_tratamiento_datos !== undefined 
            ? data.paciente.consiente_tratamiento_datos 
            : true
        })
      }
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setError(err.message || 'Error al cargar la información. El token puede haber expirado o ser inválido.')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!token) return

    try {
      setSubmitting(true)

      await completarDatosService.actualizarDatosPorToken(token, formData)
      
      setSuccess(true)
      
      await Swal.fire({
        icon: 'success',
        title: '¡Datos actualizados!',
        text: 'Sus datos han sido actualizados exitosamente.',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#28a745',
        customClass: {
          popup: 'animated fadeInDown'
        }
      })
    } catch (err) {
      console.error('Error al actualizar datos:', err)
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudieron actualizar los datos. Por favor, intente nuevamente.',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#d33',
        customClass: {
          popup: 'animated fadeInDown'
        }
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div className="text-center">
          <div className="spinner-border text-white" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-white">Cargando información...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card shadow-lg border-0" style={{
                borderRadius: '24px',
                overflow: 'hidden'
              }}>
                <div className="card-body text-center p-5">
                  <i className="ti ti-alert-circle text-danger" style={{fontSize: '4rem'}}></i>
                  <h3 className="mt-4 mb-3">Error</h3>
                  <p className="text-muted">{error}</p>
                  <p className="text-muted small">El token puede haber expirado o ser inválido.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success || tokenInfo?.usado) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem 0'
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-7">
              <div className="card shadow-lg border-0" style={{
                borderRadius: '24px',
                overflow: 'hidden',
                backgroundColor: '#ffffff'
              }}>
                {/* Header con Logo */}
                {clinica?.logo_url && !logoError && (
                  <div className="card-header border-0 text-center py-4" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}>
                    <div className="mb-2" style={{
                      animation: 'fadeInDown 0.6s ease-out',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        padding: '0.5rem',
                        borderRadius: '12px',
                        display: 'inline-block'
                      }}>
                        <img 
                          src={clinica.logo_url} 
                          alt={clinica?.nombre || 'Logo de la clínica'} 
                          style={{
                            maxHeight: '60px',
                            maxWidth: '150px',
                            objectFit: 'contain',
                            display: 'block'
                          }}
                          crossOrigin="anonymous"
                          onError={() => setLogoError(true)}
                        />
                      </div>
                    </div>
                    {clinica?.nombre && (
                      <p className="mb-0 opacity-90" style={{fontSize: '0.95rem'}}>
                        {clinica.nombre}
                      </p>
                    )}
                  </div>
                )}
                {(!clinica?.logo_url || logoError) && clinica?.nombre && (
                  <div className="card-header border-0 text-center py-4" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}>
                    <h2 className="mb-2 fw-bold" style={{fontSize: '1.75rem', letterSpacing: '-0.5px'}}>
                      {clinica.nombre}
                    </h2>
                  </div>
                )}
                
                <div className="card-body text-center p-5">
                  <div className="mb-4" style={{
                    animation: 'fadeInUp 0.6s ease-out'
                  }}>
                    <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{
                      width: '100px',
                      height: '100px'
                    }}>
                      <i className="ti ti-check text-success" style={{fontSize: '3rem'}}></i>
                    </div>
                  </div>
                  
                  <h2 className="mb-3" style={{
                    color: '#28a745',
                    fontWeight: '700',
                    fontSize: '2.5rem',
                    letterSpacing: '-0.5px'
                  }}>
                    ¡Muchas gracias!
                  </h2>
                  <p className="lead mb-5" style={{
                    color: '#495057',
                    fontSize: '1.15rem',
                    lineHeight: '1.7',
                    fontWeight: '400'
                  }}>
                    Sus datos han sido actualizados exitosamente.
                  </p>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '16px',
                    padding: '2rem',
                    border: '1px solid #e9ecef',
                    marginTop: '1.5rem'
                  }}>
                    <p className="mb-0" style={{
                      fontSize: '1rem',
                      color: '#6c757d',
                      lineHeight: '1.6'
                    }}>
                      Gracias por mantener su información actualizada. Esto nos ayuda a brindarle un mejor servicio.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    )
  }

  if (!paciente || !clinica) {
    return null
  }

  const normalizarLogoUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http://')) {
      return url.replace('http://', 'https://')
    }
    return url
  }

  const logoUrl = clinica?.logo_url ? normalizarLogoUrl(clinica.logo_url) : null

  return (
    <div className="min-vh-100" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 0'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-9">
            {/* Card Principal */}
            <div className="card shadow-lg border-0" style={{
              borderRadius: '24px',
              overflow: 'hidden',
              backgroundColor: '#ffffff'
            }}>
              {/* Header con Logo */}
              <div className="card-header border-0 text-center py-4" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}>
                {logoUrl && !logoError && (
                  <div className="mb-3" style={{
                    animation: 'fadeInDown 0.6s ease-out',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      padding: '0.75rem',
                      borderRadius: '12px',
                      display: 'inline-block'
                    }}>
                      <img 
                        src={logoUrl} 
                        alt={clinica?.nombre || 'Logo de la clínica'} 
                        style={{
                          maxHeight: '80px',
                          maxWidth: '200px',
                          objectFit: 'contain',
                          display: 'block'
                        }}
                        crossOrigin="anonymous"
                        onError={() => setLogoError(true)}
                      />
                    </div>
                  </div>
                )}
                <h2 className="mb-2 fw-bold" style={{fontSize: '2rem', letterSpacing: '-0.5px'}}>
                  <i className="ti ti-user-edit me-2"></i>
                  Completar Datos
                </h2>
                {clinica?.nombre && (
                  <p className="mb-0 opacity-90" style={{fontSize: '1.1rem'}}>
                    {clinica.nombre}
                  </p>
                )}
              </div>

              <div className="card-body p-4 p-md-5">
                <form onSubmit={handleSubmit}>
                  {/* Información Personal */}
                  <div className="mb-5">
                    <h4 className="mb-4 fw-bold d-flex align-items-center">
                      <span className="badge bg-primary rounded-pill me-2" style={{
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <i className="ti ti-user"></i>
                      </span>
                      Información Personal
                    </h4>
                    
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          <i className="ti ti-user me-2 text-primary"></i>
                          Nombres <span className="text-danger">*</span>
                        </label>
                        <input 
                          type="text" 
                          className="form-control form-control-lg" 
                          name="nombres" 
                          value={formData.nombres} 
                          onChange={handleInputChange} 
                          required
                          style={{borderRadius: '12px'}}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          <i className="ti ti-user me-2 text-primary"></i>
                          Apellidos <span className="text-danger">*</span>
                        </label>
                        <input 
                          type="text" 
                          className="form-control form-control-lg" 
                          name="apellidos" 
                          value={formData.apellidos} 
                          onChange={handleInputChange} 
                          required
                          style={{borderRadius: '12px'}}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          <i className="ti ti-gender-bigender me-2 text-info"></i>
                          Sexo <span className="text-danger">*</span>
                        </label>
                        <select 
                          className="form-select form-select-lg" 
                          name="sexo" 
                          value={formData.sexo} 
                          onChange={handleInputChange} 
                          required
                          style={{borderRadius: '12px'}}
                        >
                          <option value="M">Masculino</option>
                          <option value="F">Femenino</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          <i className="ti ti-calendar me-2 text-success"></i>
                          Fecha de Nacimiento <span className="text-danger">*</span>
                        </label>
                        <input 
                          type="date" 
                          className="form-control form-control-lg" 
                          name="fecha_nacimiento" 
                          value={formData.fecha_nacimiento} 
                          onChange={handleInputChange} 
                          required
                          style={{borderRadius: '12px'}}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          <i className="ti ti-id me-2 text-warning"></i>
                          DUI
                        </label>
                        <input 
                          type="text" 
                          className="form-control form-control-lg" 
                          name="dui" 
                          value={formData.dui} 
                          onChange={handleInputChange} 
                          placeholder="12345678-9"
                          style={{borderRadius: '12px'}}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          <i className="ti ti-map-pin me-2 text-danger"></i>
                          Dirección
                        </label>
                        <textarea 
                          className="form-control form-control-lg" 
                          name="direccion" 
                          value={formData.direccion} 
                          onChange={handleInputChange} 
                          rows="2"
                          style={{borderRadius: '12px'}}
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Información de Contacto */}
                  <div className="mb-5">
                    <h4 className="mb-4 fw-bold d-flex align-items-center">
                      <span className="badge bg-success rounded-pill me-2" style={{
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <i className="ti ti-phone"></i>
                      </span>
                      Información de Contacto
                    </h4>
                    
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          <i className="ti ti-device-mobile me-2 text-success"></i>
                          Celular/WhatsApp <span className="text-danger">*</span>
                        </label>
                        <input 
                          type="text" 
                          className="form-control form-control-lg" 
                          name="celular_whatsapp" 
                          value={formData.celular_whatsapp} 
                          onChange={handleInputChange} 
                          required
                          placeholder="7777-1234"
                          style={{borderRadius: '12px'}}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          <i className="ti ti-phone me-2 text-info"></i>
                          Teléfono Secundario
                        </label>
                        <input 
                          type="text" 
                          className="form-control form-control-lg" 
                          name="telefono_secundario" 
                          value={formData.telefono_secundario} 
                          onChange={handleInputChange} 
                          placeholder="2234-5678"
                          style={{borderRadius: '12px'}}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          <i className="ti ti-mail me-2 text-primary"></i>
                          Email
                        </label>
                        <input 
                          type="email" 
                          className="form-control form-control-lg" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleInputChange} 
                          placeholder="correo@ejemplo.com"
                          style={{borderRadius: '12px'}}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contacto de Emergencia */}
                  <div className="mb-5">
                    <h4 className="mb-4 fw-bold d-flex align-items-center">
                      <span className="badge bg-warning rounded-pill me-2" style={{
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <i className="ti ti-alert-triangle"></i>
                      </span>
                      Contacto de Emergencia
                    </h4>
                    
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          <i className="ti ti-user me-2 text-warning"></i>
                          Nombre del Contacto
                        </label>
                        <input 
                          type="text" 
                          className="form-control form-control-lg" 
                          name="nombre_contacto" 
                          value={formData.nombre_contacto} 
                          onChange={handleInputChange} 
                          style={{borderRadius: '12px'}}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          <i className="ti ti-phone me-2 text-warning"></i>
                          Teléfono del Contacto
                        </label>
                        <input 
                          type="text" 
                          className="form-control form-control-lg" 
                          name="telefono_contacto" 
                          value={formData.telefono_contacto} 
                          onChange={handleInputChange} 
                          placeholder="7777-9999"
                          style={{borderRadius: '12px'}}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Consentimientos */}
                  <div className="mb-5">
                    <h4 className="mb-4 fw-bold d-flex align-items-center">
                      <span className="badge bg-info rounded-pill me-2" style={{
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <i className="ti ti-shield-check"></i>
                      </span>
                      Consentimientos
                    </h4>
                    
                    <div className="row g-3">
                      <div className="col-12">
                        <div className="form-check p-3 rounded" style={{
                          backgroundColor: '#f8f9fa',
                          borderRadius: '12px'
                        }}>
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            name="es_paciente" 
                            checked={formData.es_paciente} 
                            onChange={handleInputChange}
                            style={{width: '1.25rem', height: '1.25rem', marginTop: '0.25rem'}}
                          />
                          <label className="form-check-label fw-semibold ms-2">
                            Es paciente activo
                          </label>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-check p-3 rounded" style={{
                          backgroundColor: '#f8f9fa',
                          borderRadius: '12px'
                        }}>
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            name="consiente_tratamiento_datos" 
                            checked={formData.consiente_tratamiento_datos} 
                            onChange={handleInputChange}
                            style={{width: '1.25rem', height: '1.25rem', marginTop: '0.25rem'}}
                          />
                          <label className="form-check-label fw-semibold ms-2">
                            Consiento el tratamiento de mis datos personales
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botón de Envío */}
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg d-flex align-items-center justify-content-center gap-2"
                      disabled={submitting}
                      style={{
                        borderRadius: '12px',
                        padding: '1rem',
                        fontWeight: '600',
                        fontSize: '1.1rem',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                      }}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm"></span>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <i className="ti ti-check" style={{fontSize: '1.5rem'}}></i>
                          Guardar Datos
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default function CompletarDatos() {
  return (
    <Suspense fallback={
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div className="text-center">
          <div className="spinner-border text-white" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-white">Cargando información...</p>
        </div>
      </div>
    }>
      <CompletarDatosContent />
    </Suspense>
  )
}

