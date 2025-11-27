'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { buildUrl } from '@/config/api'
import { formatearFecha } from '@/utils/dateHelper'
import Swal from 'sweetalert2'

function ConfirmarCitaContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [loading, setLoading] = useState(true)
  const [cita, setCita] = useState(null)
  const [tokenInfo, setTokenInfo] = useState(null)
  const [error, setError] = useState(null)
  const [procesando, setProcesando] = useState(false)
  const [accionExitosa, setAccionExitosa] = useState(null) // 'CONFIRMAR' o 'CANCELAR' cuando fue exitosa

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
      }

      const response = await fetch(buildUrl(`citas-confirmacion/${token}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
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
        setCita(result.data.cita)
        setTokenInfo(result.data.token)
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

  if (!cita) {
    return null
  }

  const fechaFormateada = formatearFecha(cita.fecha, { formato: 'completo' })
  const horaInicio = cita.hora_inicio ? cita.hora_inicio.substring(0, 5) : ''
  const horaFin = cita.hora_fin ? cita.hora_fin.substring(0, 5) : ''
  const nombrePaciente = `${cita.paciente_nombres || ''} ${cita.paciente_apellidos || ''}`.trim()
  const nombreDoctor = `${cita.doctor_titulo || 'Dr.'} ${cita.doctor_nombres || ''} ${cita.doctor_apellidos || ''}`.trim()
  const tokenUsado = tokenInfo?.usado || false
  const estadoCita = cita.estado

  // Si ya se procesó la acción, mostrar solo el mensaje bonito con la imagen
  if (tokenUsado || accionExitosa) {
    const imagenSrc = accionExitosa === 'CONFIRMAR' 
      ? '/assets/images/confirmacion/confirmar.svg'
      : accionExitosa === 'CANCELAR'
      ? '/assets/images/confirmacion/cancelar.svg'
      : null

    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
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
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="mb-3" style={{
                        color: '#6c757d',
                        fontWeight: 'bold',
                        fontSize: '2rem'
                      }}>
                        Link utilizado
                      </h2>
                      <p className="lead mb-4" style={{
                        color: '#6c757d',
                        fontSize: '1.1rem'
                      }}>
                        Este link ya ha sido utilizado. La cita ya fue {estadoCita === 'Confirmada' ? 'confirmada' : estadoCita === 'Cancelada' ? 'cancelada' : 'procesada'}.
                      </p>
                    </>
                  )}
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
        `}</style>
      </div>
    )
  }

  // Vista normal con información de la cita y botones
  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow">
              <div className="card-header bg-primary text-white text-center py-4">
                <i className="ti ti-calendar-check" style={{fontSize: '3rem'}}></i>
                <h2 className="mt-3 mb-0">Confirmación de Cita</h2>
              </div>
              <div className="card-body p-4">
                <div className="mb-4">
                  <h4 className="mb-3">Información de la Cita</h4>
                  
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="d-flex align-items-start gap-3">
                        <i className="ti ti-user text-primary" style={{fontSize: '1.5rem', marginTop: '0.25rem'}}></i>
                        <div>
                          <strong>Paciente:</strong>
                          <p className="mb-0">{nombrePaciente || 'No especificado'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="d-flex align-items-start gap-3">
                        <i className="ti ti-calendar text-primary" style={{fontSize: '1.5rem', marginTop: '0.25rem'}}></i>
                        <div>
                          <strong>Fecha:</strong>
                          <p className="mb-0">{fechaFormateada}</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="d-flex align-items-start gap-3">
                        <i className="ti ti-clock text-primary" style={{fontSize: '1.5rem', marginTop: '0.25rem'}}></i>
                        <div>
                          <strong>Horario:</strong>
                          <p className="mb-0">{horaInicio} - {horaFin}</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="d-flex align-items-start gap-3">
                        <i className="ti ti-user-doctor text-primary" style={{fontSize: '1.5rem', marginTop: '0.25rem'}}></i>
                        <div>
                          <strong>Profesional:</strong>
                          <p className="mb-0">{nombreDoctor || 'No especificado'}</p>
                        </div>
                      </div>
                    </div>

                    {cita.sala_nombre && (
                      <div className="col-12">
                        <div className="d-flex align-items-start gap-3">
                          <i className="ti ti-building text-primary" style={{fontSize: '1.5rem', marginTop: '0.25rem'}}></i>
                          <div>
                            <strong>Sala:</strong>
                            <p className="mb-0">{cita.sala_nombre}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {cita.motivo_cita && (
                      <div className="col-12">
                        <div className="d-flex align-items-start gap-3">
                          <i className="ti ti-file-text text-primary" style={{fontSize: '1.5rem', marginTop: '0.25rem'}}></i>
                          <div>
                            <strong>Motivo:</strong>
                            <p className="mb-0">{cita.motivo_cita}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="col-12">
                      <div className="alert alert-info mb-0">
                        <strong>Estado actual:</strong> {estadoCita}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button
                    className="btn btn-success btn-lg"
                    onClick={() => confirmarOCancelarCita('CONFIRMAR')}
                    disabled={procesando || estadoCita === 'Confirmada' || estadoCita === 'Cancelada'}
                  >
                    <i className="ti ti-check me-2"></i>
                    {procesando ? 'Procesando...' : 'Confirmar Cita'}
                  </button>
                  <button
                    className="btn btn-outline-danger btn-lg"
                    onClick={() => confirmarOCancelarCita('CANCELAR')}
                    disabled={procesando || estadoCita === 'Confirmada' || estadoCita === 'Cancelada'}
                  >
                    <i className="ti ti-x me-2"></i>
                    {procesando ? 'Procesando...' : 'Cancelar Cita'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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

