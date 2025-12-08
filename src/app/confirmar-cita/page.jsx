'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { buildUrl, buildFrontendUrl } from '@/config/api'
import { completarDatosService } from '@/services/completarDatosService'
import { formatearFecha } from '@/utils/dateHelper'
import Swal from 'sweetalert2'

function ConfirmarCitaContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [loading, setLoading] = useState(true)
  const [cita, setCita] = useState(null)
  const [clinica, setClinica] = useState(null)
  const [tokenInfo, setTokenInfo] = useState(null)
  const [error, setError] = useState(null)
  const [error410, setError410] = useState(false) // Error 410: URL ya no disponible
  const [procesando, setProcesando] = useState(false)
  const [accionExitosa, setAccionExitosa] = useState(null) // 'CONFIRMAR' o 'CANCELAR' cuando fue exitosa
  const [logoError, setLogoError] = useState(false)
  const [generandoLinkDatos, setGenerandoLinkDatos] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('No se proporcionó un token de confirmación')
      setLoading(false)
      return
    }

    cargarInformacionCita()
  }, [token])

  const cargarInformacionCita = async (mostrarError = true) => {
    try {
      setLoading(true)
      if (mostrarError) {
        setError(null)
        setError410(false)
      }

      const response = await fetch(buildUrl(`citas-confirmacion/${token}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Manejar error 410 específicamente (URL ya no disponible - cita pasada)
        if (response.status === 410) {
          if (mostrarError) {
            setError410(true)
            setError(errorData.message || 'Esta URL ya no está disponible. La cita ya ha pasado.')
          }
          setLoading(false)
          return
        }
        
        // Si el token fue usado pero ya tenemos la cita cargada, no mostrar error
        if (cita && tokenInfo?.usado) {
          setLoading(false)
          return
        }
        if (mostrarError) {
          throw new Error(errorData.message || 'Token inválido o expirado')
        }
        return
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        console.log('📋 Datos recibidos:', result.data)
        console.log('🏥 Información de clínica:', result.data.clinica)
        setCita(result.data.cita)
        setClinica(result.data.clinica)
        setTokenInfo(result.data.token)
        setLogoError(false) // Resetear error del logo al cargar nueva clínica
      } else {
        if (mostrarError) {
          throw new Error('No se pudo obtener la información de la cita')
        }
      }
    } catch (err) {
      console.error('Error al cargar información de la cita:', err)
      if (mostrarError) {
        setError(err.message || 'Error al cargar la información de la cita')
      }
    } finally {
      setLoading(false)
    }
  }

  const confirmarOCancelarCita = async (accion) => {
    if (!token) return

    try {
      setProcesando(true)

      const response = await fetch(buildUrl(`citas-confirmacion/${token}/accion`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accion })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al procesar la acción')
      }

      const result = await response.json()

      if (result.success) {
        // Guardar la acción exitosa
        setAccionExitosa(accion)
        
        // Actualizar el estado de la cita localmente sin recargar
        if (cita) {
          setCita({
            ...cita,
            estado: accion === 'CONFIRMAR' ? 'Confirmada' : 'Cancelada'
          })
        }
        
        // Marcar el token como usado
        if (tokenInfo) {
          setTokenInfo({
            ...tokenInfo,
            usado: true
          })
        }

        // No mostrar SweetAlert, el mensaje bonito ya está en la página
      }
    } catch (err) {
      console.error('Error al procesar la acción:', err)
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo procesar la acción',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#d33',
        customClass: {
          popup: 'animated fadeInDown'
        }
      })
    } finally {
      setProcesando(false)
    }
  }

  const generarLinkYActualizarDatos = async () => {
    // Intentar obtener el ID del paciente (puede ser id_paciente o paciente_id)
    const idPaciente = cita?.id_paciente || cita?.paciente_id
    
    if (!idPaciente) {
      console.error('Objeto cita:', cita)
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener el ID del paciente',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#d33'
      })
      return
    }

    try {
      setGenerandoLinkDatos(true)

      // Generar token desde el paciente (el servicio ya construye la URL correcta)
      const tokenData = await completarDatosService.generarTokenDesdePaciente(idPaciente)
      
      if (!tokenData || !tokenData.link_completar_datos) {
        throw new Error('No se pudo generar el link')
      }
      
      // El servicio ya devuelve la URL correcta con buildFrontendUrl
      const urlCorrecta = tokenData.link_completar_datos
      
      // Abrir el link en una nueva pestaña
      window.open(urlCorrecta, '_blank')
      
      await Swal.fire({
        icon: 'success',
        title: '¡Perfecto!',
        text: 'Se ha abierto la página para actualizar tus datos',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#28a745',
        customClass: {
          popup: 'animated fadeInDown'
        }
      })
    } catch (err) {
      console.error('Error al generar link:', err)
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo generar el link para actualizar datos',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#d33',
        customClass: {
          popup: 'animated fadeInDown'
        }
      })
    } finally {
      setGenerandoLinkDatos(false)
    }
  }

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando información de la cita...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card shadow">
                <div className="card-body text-center p-5">
                  {error410 ? (
                    <>
                      <i className="ti ti-clock-off text-warning" style={{fontSize: '4rem'}}></i>
                      <h3 className="mt-4 mb-3">URL no disponible</h3>
                      <p className="text-muted">{error}</p>
                      <p className="text-muted small">Esta URL ya no está disponible porque la fecha de la cita ha pasado.</p>
                    </>
                  ) : (
                    <>
                      <i className="ti ti-alert-circle text-danger" style={{fontSize: '4rem'}}></i>
                      <h3 className="mt-4 mb-3">Error</h3>
                      <p className="text-muted">{error}</p>
                      <p className="text-muted small">El token puede haber expirado o ser inválido.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!cita) {
    return null
  }

  const fechaFormateada = formatearFecha(cita.fecha, { formato: 'completo' })
  const horaInicio = cita.hora_inicio ? cita.hora_inicio.substring(0, 5) : ''
  const horaFin = cita.hora_fin ? cita.hora_fin.substring(0, 5) : ''
  const nombrePaciente = `${cita.paciente_nombres || ''} ${cita.paciente_apellidos || ''}`.trim()
  const nombreDoctor = `${cita.doctor_titulo || 'Dr.'} ${cita.doctor_nombres || ''} ${cita.doctor_apellidos || ''}`.trim()
  const tokenUsado = tokenInfo?.usado || false
  const citaPasada = tokenInfo?.cita_pasada || false
  const estadoCita = cita.estado

  // Función para normalizar la URL del logo (convertir HTTP a HTTPS si es necesario)
  const normalizarLogoUrl = (url) => {
    if (!url) return null
    // Si la URL es HTTP, intentar convertirla a HTTPS
    if (url.startsWith('http://')) {
      return url.replace('http://', 'https://')
    }
    return url
  }

  const logoUrl = clinica?.logo_url ? normalizarLogoUrl(clinica.logo_url) : null

  // Si el token está usado pero la cita aún no ha pasado, mostrar vista de confirmación con Maps/Waze
  // Si ya se procesó la acción (recién confirmada/cancelada), mostrar mensaje de éxito
  if (tokenUsado && !citaPasada && !accionExitosa) {
    // Token usado, cita futura: mostrar vista de confirmación (sin botones de acción)
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
                {logoUrl && !logoError && (
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
                          src={logoUrl} 
                          alt={clinica?.nombre || 'Logo de la clínica'} 
                          style={{
                            maxHeight: '60px',
                            maxWidth: '150px',
                            objectFit: 'contain',
                            display: 'block'
                          }}
                          crossOrigin="anonymous"
                          onError={(e) => {
                            console.warn('⚠️ Error al cargar logo, mostrando placeholder:', logoUrl)
                            setLogoError(true)
                            e.target.style.display = 'none'
                          }}
                          onLoad={() => {
                            console.log('✅ Logo cargado correctamente:', logoUrl)
                            setLogoError(false)
                          }}
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
                {/* Header sin logo o con error */}
                {(!logoUrl || logoError) && (
                  <div className="card-header border-0 text-center py-4" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}>
                    {clinica?.nombre && (
                      <h2 className="mb-2 fw-bold" style={{fontSize: '1.75rem', letterSpacing: '-0.5px'}}>
                        {clinica.nombre}
                      </h2>
                    )}
                  </div>
                )}
                
                <div className="card-body text-center p-5">
                  <h2 className="mb-3" style={{
                    color: '#28a745',
                    fontWeight: '700',
                    fontSize: '2.5rem',
                    letterSpacing: '-0.5px'
                  }}>
                    ¡Cita Confirmada!
                  </h2>
                  <p className="lead mb-5" style={{
                    color: '#495057',
                    fontSize: '1.15rem',
                    lineHeight: '1.7',
                    fontWeight: '400'
                  }}>
                    Su cita ha sido confirmada exitosamente.
                  </p>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '16px',
                    padding: '2rem',
                    border: '1px solid #e9ecef',
                    marginTop: '1.5rem'
                  }}>
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <i className="ti ti-calendar-check" style={{
                        fontSize: '2rem',
                        color: '#28a745',
                        marginRight: '0.75rem'
                      }}></i>
                      <p className="mb-0" style={{
                        fontSize: '1.25rem',
                        color: '#212529',
                        fontWeight: '600',
                        margin: 0
                      }}>
                        Nos vemos el {fechaFormateada} a las {horaInicio}
                      </p>
                    </div>
                    <p className="mb-0" style={{
                      fontSize: '1rem',
                      color: '#6c757d',
                      lineHeight: '1.6',
                      marginTop: '1rem'
                    }}>
                      Le esperamos en nuestra clínica. Si tiene alguna pregunta, no dude en contactarnos.
                    </p>
                    
                    {/* Botón para actualizar datos */}
                    <div className="mt-4 pt-3">
                      <button
                        className="btn btn-primary btn-lg d-flex align-items-center justify-content-center gap-2 mx-auto"
                        onClick={generarLinkYActualizarDatos}
                        disabled={generandoLinkDatos}
                        style={{
                          borderRadius: '12px',
                          padding: '0.75rem 2rem',
                          fontWeight: '600',
                          fontSize: '1.1rem',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                        }}
                      >
                        {generandoLinkDatos ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Generando link...
                          </>
                        ) : (
                          <>
                            <i className="ti ti-user-edit" style={{fontSize: '1.25rem'}}></i>
                            Actualiza tus datos
                          </>
                        )}
                      </button>
                      <p className="text-muted small mt-2 mb-0">
                        Completa o actualiza tu información personal
                      </p>
                    </div>
                    
                    {/* Información de contacto de la clínica */}
                    {clinica && (
                      <div className="mt-4 pt-4 border-top">
                        <div className="row g-3 text-start">
                          {clinica.direccion && (
                            <div className="col-12">
                              <div className="d-flex align-items-center gap-2">
                                <i className="ti ti-map-pin text-primary"></i>
                                <span style={{fontSize: '0.95rem'}}>{clinica.direccion}</span>
                              </div>
                            </div>
                          )}
                          {clinica.telefono && (
                            <div className="col-12 col-md-6">
                              <div className="d-flex align-items-center gap-2">
                                <i className="ti ti-phone text-info"></i>
                                <a href={`tel:${clinica.telefono}`} className="text-decoration-none" style={{fontSize: '0.95rem'}}>
                                  {clinica.telefono}
                                </a>
                              </div>
                            </div>
                          )}
                          {clinica.email && (
                            <div className="col-12 col-md-6">
                              <div className="d-flex align-items-center gap-2">
                                <i className="ti ti-mail text-success"></i>
                                <a href={`mailto:${clinica.email}`} className="text-decoration-none" style={{fontSize: '0.95rem'}}>
                                  {clinica.email}
                                </a>
                              </div>
                            </div>
                          )}
                          {clinica.latitud && clinica.longitud && (
                            <div className="col-12">
                              <div className="d-flex flex-wrap gap-2 mt-2">
                                <a
                                  href={`https://www.waze.com/ul?ll=${clinica.latitud},${clinica.longitud}&navigate=yes`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-primary d-flex align-items-center gap-2"
                                  style={{borderRadius: '8px'}}
                                >
                                  <i className="ti ti-navigation"></i>
                                  Waze
                                </a>
                                <a
                                  href={`https://www.google.com/maps?q=${clinica.latitud},${clinica.longitud}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2"
                                  style={{borderRadius: '8px'}}
                                >
                                  <i className="ti ti-map"></i>
                                  Google Maps
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
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

  // Si ya se procesó la acción (recién confirmada/cancelada), mostrar mensaje de éxito
  if (accionExitosa) {
    const imagenSrc = accionExitosa === 'CONFIRMAR' 
      ? '/assets/images/confirmacion/confirmar.svg'
      : accionExitosa === 'CANCELAR'
      ? '/assets/images/confirmacion/cancelar.svg'
      : null

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
                {logoUrl && !logoError && (
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
                          src={logoUrl} 
                          alt={clinica?.nombre || 'Logo de la clínica'} 
                          style={{
                            maxHeight: '60px',
                            maxWidth: '150px',
                            objectFit: 'contain',
                            display: 'block'
                          }}
                          crossOrigin="anonymous"
                          onError={(e) => {
                            console.warn('⚠️ Error al cargar logo, mostrando placeholder:', logoUrl)
                            setLogoError(true)
                            e.target.style.display = 'none'
                          }}
                          onLoad={() => {
                            console.log('✅ Logo cargado correctamente:', logoUrl)
                            setLogoError(false)
                          }}
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
                {/* Header sin logo o con error */}
                {(!logoUrl || logoError) && (
                  <div className="card-header border-0 text-center py-4" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}>
                    {clinica?.nombre && (
                      <h2 className="mb-2 fw-bold" style={{fontSize: '1.75rem', letterSpacing: '-0.5px'}}>
                        {clinica.nombre}
                      </h2>
                    )}
                  </div>
                )}
                
                <div className="card-body text-center p-5">
                  {imagenSrc && (
                    <div className="mb-4" style={{
                      animation: 'fadeInUp 0.6s ease-out'
                    }}>
                      <img 
                        src={imagenSrc} 
                        alt={accionExitosa === 'CONFIRMAR' ? 'Cita confirmada' : 'Cita cancelada'}
                        style={{
                          width: '200px',
                          height: '200px',
                          objectFit: 'contain'
                        }}
                        onError={(e) => {
                          // Si la imagen no existe, ocultar el elemento
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  
                  {accionExitosa === 'CONFIRMAR' ? (
                    <>
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
                        Su cita ha sido confirmada exitosamente.
                      </p>
                      <div style={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: '16px',
                        padding: '2rem',
                        border: '1px solid #e9ecef',
                        marginTop: '1.5rem'
                      }}>
                        <div className="d-flex align-items-center justify-content-center mb-3">
                          <i className="ti ti-calendar-check" style={{
                            fontSize: '2rem',
                            color: '#28a745',
                            marginRight: '0.75rem'
                          }}></i>
                          <p className="mb-0" style={{
                            fontSize: '1.25rem',
                            color: '#212529',
                            fontWeight: '600',
                            margin: 0
                          }}>
                            Nos vemos el {fechaFormateada} a las {horaInicio}
                          </p>
                        </div>
                        <p className="mb-0" style={{
                          fontSize: '1rem',
                          color: '#6c757d',
                          lineHeight: '1.6',
                          marginTop: '1rem'
                        }}>
                          Le esperamos en nuestra clínica. Si tiene alguna pregunta, no dude en contactarnos.
                        </p>
                        
                        {/* Botón para actualizar datos */}
                        <div className="mt-4 pt-3">
                          <button
                            className="btn btn-primary btn-lg d-flex align-items-center justify-content-center gap-2 mx-auto"
                            onClick={generarLinkYActualizarDatos}
                            disabled={generandoLinkDatos}
                            style={{
                              borderRadius: '12px',
                              padding: '0.75rem 2rem',
                              fontWeight: '600',
                              fontSize: '1.1rem',
                              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                            }}
                          >
                            {generandoLinkDatos ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Generando link...
                              </>
                            ) : (
                              <>
                                <i className="ti ti-user-edit" style={{fontSize: '1.25rem'}}></i>
                                Actualiza tus datos
                              </>
                            )}
                          </button>
                          <p className="text-muted small mt-2 mb-0">
                            Completa o actualiza tu información personal
                          </p>
                        </div>
                        
                        {/* Información de contacto de la clínica */}
                        {clinica && (
                          <div className="mt-4 pt-4 border-top">
                            <div className="row g-3 text-start">
                              {clinica.direccion && (
                                <div className="col-12">
                                  <div className="d-flex align-items-center gap-2">
                                    <i className="ti ti-map-pin text-primary"></i>
                                    <span style={{fontSize: '0.95rem'}}>{clinica.direccion}</span>
                                  </div>
                                </div>
                              )}
                              {clinica.telefono && (
                                <div className="col-12 col-md-6">
                                  <div className="d-flex align-items-center gap-2">
                                    <i className="ti ti-phone text-info"></i>
                                    <a href={`tel:${clinica.telefono}`} className="text-decoration-none" style={{fontSize: '0.95rem'}}>
                                      {clinica.telefono}
                                    </a>
                                  </div>
                                </div>
                              )}
                              {clinica.email && (
                                <div className="col-12 col-md-6">
                                  <div className="d-flex align-items-center gap-2">
                                    <i className="ti ti-mail text-success"></i>
                                    <a href={`mailto:${clinica.email}`} className="text-decoration-none" style={{fontSize: '0.95rem'}}>
                                      {clinica.email}
                                    </a>
                                  </div>
                                </div>
                              )}
                              {clinica.latitud && clinica.longitud && (
                                <div className="col-12">
                                  <div className="d-flex flex-wrap gap-2 mt-2">
                                    <a
                                      href={`https://www.waze.com/ul?ll=${clinica.latitud},${clinica.longitud}&navigate=yes`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-sm btn-primary d-flex align-items-center gap-2"
                                      style={{borderRadius: '8px'}}
                                    >
                                      <i className="ti ti-navigation"></i>
                                      Waze
                                    </a>
                                    <a
                                      href={`https://www.google.com/maps?q=${clinica.latitud},${clinica.longitud}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2"
                                      style={{borderRadius: '8px'}}
                                    >
                                      <i className="ti ti-map"></i>
                                      Google Maps
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : accionExitosa === 'CANCELAR' ? (
                    <>
                      <h2 className="mb-3" style={{
                        color: '#ffc107',
                        fontWeight: '700',
                        fontSize: '2.5rem',
                        letterSpacing: '-0.5px'
                      }}>
                        Cita cancelada
                      </h2>
                      <p className="lead mb-5" style={{
                        color: '#495057',
                        fontSize: '1.15rem',
                        lineHeight: '1.7',
                        fontWeight: '400'
                      }}>
                        Su cita ha sido cancelada exitosamente.
                      </p>
                      <div style={{
                        backgroundColor: '#fffbf0',
                        borderRadius: '16px',
                        padding: '2rem',
                        border: '1px solid #ffeaa7',
                        marginTop: '1.5rem'
                      }}>
                        <div className="d-flex align-items-center justify-content-center mb-3">
                          <i className="ti ti-calendar-x" style={{
                            fontSize: '2rem',
                            color: '#ffc107',
                            marginRight: '0.75rem'
                          }}></i>
                          <p className="mb-0" style={{
                            fontSize: '1.25rem',
                            color: '#212529',
                            fontWeight: '600',
                            margin: 0
                          }}>
                            Si necesita reagendar su cita, por favor contáctenos
                          </p>
                        </div>
                        <p className="mb-0" style={{
                          fontSize: '1rem',
                          color: '#856404',
                          lineHeight: '1.6',
                          marginTop: '1rem'
                        }}>
                          Estaremos encantados de ayudarle a encontrar un nuevo horario que se ajuste a sus necesidades.
                        </p>
                        
                        {/* Información de contacto de la clínica */}
                        {clinica && (
                          <div className="mt-4 pt-4 border-top">
                            <div className="row g-3 text-start">
                              {clinica.telefono && (
                                <div className="col-12 col-md-6">
                                  <div className="d-flex align-items-center gap-2">
                                    <i className="ti ti-phone text-info"></i>
                                    <a href={`tel:${clinica.telefono}`} className="text-decoration-none" style={{fontSize: '0.95rem'}}>
                                      {clinica.telefono}
                                    </a>
                                  </div>
                                </div>
                              )}
                              {clinica.email && (
                                <div className="col-12 col-md-6">
                                  <div className="d-flex align-items-center gap-2">
                                    <i className="ti ti-mail text-success"></i>
                                    <a href={`mailto:${clinica.email}`} className="text-decoration-none" style={{fontSize: '0.95rem'}}>
                                      {clinica.email}
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : null}
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

  // Vista normal con información de la cita y botones
  return (
    <div className="min-vh-100" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 0'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            {/* Card Principal */}
            <div className="card shadow-lg border-0" style={{
              borderRadius: '24px',
              overflow: 'hidden',
              backgroundColor: '#ffffff'
            }}>
              {/* Header con Logo de Clínica */}
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
                        onError={(e) => {
                          console.warn('⚠️ Error al cargar logo, mostrando placeholder:', logoUrl)
                          setLogoError(true)
                          e.target.style.display = 'none'
                        }}
                        onLoad={() => {
                          console.log('✅ Logo cargado correctamente:', logoUrl)
                          setLogoError(false)
                        }}
                      />
                    </div>
                  </div>
                )}
                <h2 className="mb-2 fw-bold" style={{fontSize: '2rem', letterSpacing: '-0.5px'}}>
                  <i className="ti ti-calendar-check me-2"></i>
                  Confirmación de Cita
                </h2>
                {clinica?.nombre && (
                  <p className="mb-0 opacity-90" style={{fontSize: '1.1rem'}}>
                    {clinica.nombre}
                  </p>
                )}
              </div>

              <div className="card-body p-4 p-md-5">
                {/* Información de la Cita */}
                <div className="mb-5">
                  <h4 className="mb-4 fw-bold d-flex align-items-center">
                    <span className="badge bg-primary rounded-pill me-2" style={{
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <i className="ti ti-calendar"></i>
                    </span>
                    Detalles de la Cita
                  </h4>
                  
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <div className="d-flex align-items-start gap-3 p-3 rounded" style={{backgroundColor: '#f8f9fa'}}>
                        <div className="flex-shrink-0">
                          <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{
                            width: '48px',
                            height: '48px'
                          }}>
                            <i className="ti ti-user text-primary" style={{fontSize: '1.5rem'}}></i>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <small className="text-muted d-block mb-1" style={{fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Paciente</small>
                          <p className="mb-0 fw-semibold" style={{fontSize: '1.1rem'}}>{nombrePaciente || 'No especificado'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="d-flex align-items-start gap-3 p-3 rounded" style={{backgroundColor: '#f8f9fa'}}>
                        <div className="flex-shrink-0">
                          <div className="rounded-circle bg-info bg-opacity-10 d-flex align-items-center justify-content-center" style={{
                            width: '48px',
                            height: '48px'
                          }}>
                            <i className="ti ti-calendar text-info" style={{fontSize: '1.5rem'}}></i>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <small className="text-muted d-block mb-1" style={{fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Fecha</small>
                          <p className="mb-0 fw-semibold" style={{fontSize: '1.1rem'}}>{fechaFormateada}</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="d-flex align-items-start gap-3 p-3 rounded" style={{backgroundColor: '#f8f9fa'}}>
                        <div className="flex-shrink-0">
                          <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center" style={{
                            width: '48px',
                            height: '48px'
                          }}>
                            <i className="ti ti-clock text-success" style={{fontSize: '1.5rem'}}></i>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <small className="text-muted d-block mb-1" style={{fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Horario</small>
                          <p className="mb-0 fw-semibold" style={{fontSize: '1.1rem'}}>{horaInicio} - {horaFin}</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="d-flex align-items-start gap-3 p-3 rounded" style={{backgroundColor: '#f8f9fa'}}>
                        <div className="flex-shrink-0">
                          <div className="rounded-circle bg-warning bg-opacity-10 d-flex align-items-center justify-content-center" style={{
                            width: '48px',
                            height: '48px'
                          }}>
                            <i className="ti ti-user-doctor text-warning" style={{fontSize: '1.5rem'}}></i>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <small className="text-muted d-block mb-1" style={{fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Profesional</small>
                          <p className="mb-0 fw-semibold" style={{fontSize: '1.1rem'}}>{nombreDoctor || 'No especificado'}</p>
                        </div>
                      </div>
                    </div>

                    {cita.sala_nombre && (
                      <div className="col-12 col-md-6">
                        <div className="d-flex align-items-start gap-3 p-3 rounded" style={{backgroundColor: '#f8f9fa'}}>
                          <div className="flex-shrink-0">
                            <div className="rounded-circle bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center" style={{
                              width: '48px',
                              height: '48px'
                            }}>
                              <i className="ti ti-building text-secondary" style={{fontSize: '1.5rem'}}></i>
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <small className="text-muted d-block mb-1" style={{fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Sala</small>
                            <p className="mb-0 fw-semibold" style={{fontSize: '1.1rem'}}>{cita.sala_nombre}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {cita.motivo_cita && (
                      <div className="col-12">
                        <div className="d-flex align-items-start gap-3 p-3 rounded" style={{backgroundColor: '#f8f9fa'}}>
                          <div className="flex-shrink-0">
                            <div className="rounded-circle bg-danger bg-opacity-10 d-flex align-items-center justify-content-center" style={{
                              width: '48px',
                              height: '48px'
                            }}>
                              <i className="ti ti-file-text text-danger" style={{fontSize: '1.5rem'}}></i>
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <small className="text-muted d-block mb-1" style={{fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Motivo</small>
                            <p className="mb-0 fw-semibold" style={{fontSize: '1.1rem'}}>{cita.motivo_cita}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="col-12">
                      <div className="alert alert-info mb-0 d-flex align-items-center gap-2" style={{
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: '#e7f3ff'
                      }}>
                        <i className="ti ti-info-circle" style={{fontSize: '1.25rem'}}></i>
                        <span><strong>Estado actual:</strong> {estadoCita}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información de la Clínica */}
                {clinica && (
                  <div className="mb-5">
                    <h4 className="mb-4 fw-bold d-flex align-items-center">
                      <span className="badge bg-success rounded-pill me-2" style={{
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <i className="ti ti-building-hospital"></i>
                      </span>
                      Información de la Clínica
                    </h4>
                    
                    <div className="row g-3">
                      {clinica.direccion && (
                        <div className="col-12 col-md-6">
                          <div className="d-flex align-items-start gap-3 p-3 rounded" style={{backgroundColor: '#f8f9fa'}}>
                            <div className="flex-shrink-0">
                              <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{
                                width: '48px',
                                height: '48px'
                              }}>
                                <i className="ti ti-map-pin text-primary" style={{fontSize: '1.5rem'}}></i>
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <small className="text-muted d-block mb-1" style={{fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Dirección</small>
                              <p className="mb-0 fw-semibold" style={{fontSize: '1rem'}}>{clinica.direccion}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {clinica.telefono && (
                        <div className="col-12 col-md-6">
                          <div className="d-flex align-items-start gap-3 p-3 rounded" style={{backgroundColor: '#f8f9fa'}}>
                            <div className="flex-shrink-0">
                              <div className="rounded-circle bg-info bg-opacity-10 d-flex align-items-center justify-content-center" style={{
                                width: '48px',
                                height: '48px'
                              }}>
                                <i className="ti ti-phone text-info" style={{fontSize: '1.5rem'}}></i>
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <small className="text-muted d-block mb-1" style={{fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Teléfono</small>
                              <p className="mb-0 fw-semibold" style={{fontSize: '1rem'}}>
                                <a href={`tel:${clinica.telefono}`} className="text-decoration-none">
                                  {clinica.telefono}
                                </a>
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {clinica.email && (
                        <div className="col-12 col-md-6">
                          <div className="d-flex align-items-start gap-3 p-3 rounded" style={{backgroundColor: '#f8f9fa'}}>
                            <div className="flex-shrink-0">
                              <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center" style={{
                                width: '48px',
                                height: '48px'
                              }}>
                                <i className="ti ti-mail text-success" style={{fontSize: '1.5rem'}}></i>
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <small className="text-muted d-block mb-1" style={{fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Email</small>
                              <p className="mb-0 fw-semibold" style={{fontSize: '1rem'}}>
                                <a href={`mailto:${clinica.email}`} className="text-decoration-none">
                                  {clinica.email}
                                </a>
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Botones de Ubicación */}
                      {clinica.latitud && clinica.longitud && (
                        <div className="col-12">
                          <div className="p-3 rounded" style={{backgroundColor: '#f8f9fa'}}>
                            <small className="text-muted d-block mb-3" style={{fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Ubicación</small>
                            <div className="d-flex flex-wrap gap-2">
                              <a
                                href={`https://www.waze.com/ul?ll=${clinica.latitud},${clinica.longitud}&navigate=yes`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary d-flex align-items-center gap-2"
                                style={{
                                  borderRadius: '12px',
                                  padding: '0.75rem 1.5rem',
                                  fontWeight: '600',
                                  textDecoration: 'none'
                                }}
                              >
                                <i className="ti ti-navigation" style={{fontSize: '1.25rem'}}></i>
                                Abrir en Waze
                              </a>
                              <a
                                href={`https://www.google.com/maps?q=${clinica.latitud},${clinica.longitud}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-danger d-flex align-items-center gap-2"
                                style={{
                                  borderRadius: '12px',
                                  padding: '0.75rem 1.5rem',
                                  fontWeight: '600',
                                  textDecoration: 'none'
                                }}
                              >
                                <i className="ti ti-map" style={{fontSize: '1.25rem'}}></i>
                                Abrir en Google Maps
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Botones de Acción */}
                <div className="d-grid gap-3">
                  <button
                    className="btn btn-success btn-lg d-flex align-items-center justify-content-center gap-2"
                    onClick={() => confirmarOCancelarCita('CONFIRMAR')}
                    disabled={procesando || estadoCita === 'Confirmada' || estadoCita === 'Cancelada'}
                    style={{
                      borderRadius: '12px',
                      padding: '1rem',
                      fontWeight: '600',
                      fontSize: '1.1rem',
                      boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
                    }}
                  >
                    <i className="ti ti-check" style={{fontSize: '1.5rem'}}></i>
                    {procesando ? 'Procesando...' : 'Confirmar Cita'}
                  </button>
                  <button
                    className="btn btn-outline-danger btn-lg d-flex align-items-center justify-content-center gap-2"
                    onClick={() => confirmarOCancelarCita('CANCELAR')}
                    disabled={procesando || estadoCita === 'Confirmada' || estadoCita === 'Cancelada'}
                    style={{
                      borderRadius: '12px',
                      padding: '1rem',
                      fontWeight: '600',
                      fontSize: '1.1rem',
                      borderWidth: '2px'
                    }}
                  >
                    <i className="ti ti-x" style={{fontSize: '1.5rem'}}></i>
                    {procesando ? 'Procesando...' : 'Cancelar Cita'}
                  </button>
                </div>
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

export default function ConfirmarCita() {
  return (
    <Suspense fallback={
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando información de la cita...</p>
        </div>
      </div>
    }>
      <ConfirmarCitaContent />
    </Suspense>
  )
}

