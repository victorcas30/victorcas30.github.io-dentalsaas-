'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RecuperarPassword() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aquí irá la lógica de recuperación
    console.log('Recuperar password para:', email)
    setEnviado(true)
  }

  return (
    <div className="position-relative overflow-hidden min-vh-100 d-flex align-items-center justify-content-center" 
         style={{background: 'linear-gradient(135deg, #2cd07e 0%, #1B84FF 100%)'}}>
      
      {/* Decoración de fondo */}
      <div className="position-absolute w-100 h-100" style={{opacity: 0.1}}>
        <div className="position-absolute rounded-circle" 
             style={{
               width: '350px', 
               height: '350px', 
               background: 'white', 
               top: '100px', 
               left: '-100px'
             }}></div>
        <div className="position-absolute rounded-circle" 
             style={{
               width: '200px', 
               height: '200px', 
               background: 'white', 
               bottom: '100px', 
               right: '-50px'
             }}></div>
      </div>

      <div className="container position-relative">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4">
            <div className="card mb-0 shadow-lg border-0" style={{borderRadius: '20px'}}>
              <div className="card-body p-4 p-sm-5">
                
                {!enviado ? (
                  <>
                    {/* Icono */}
                    <div className="text-center mb-4">
                      <div className="bg-primary-subtle rounded-circle d-inline-flex p-4 mb-3">
                        <i className="ti ti-lock-question fs-1 text-primary"></i>
                      </div>
                      <h2 className="fw-bold text-dark mb-2">¿Olvidaste tu contraseña?</h2>
                      <p className="text-muted mb-0">
                        No te preocupes. Te enviaremos instrucciones para recuperarla.
                      </p>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit}>
                      
                      {/* Email */}
                      <div className="mb-4">
                        <label htmlFor="email" className="form-label fw-semibold">
                          Correo Electrónico
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="ti ti-mail"></i>
                          </span>
                          <input
                            type="email"
                            className="form-control border-start-0 ps-0"
                            id="email"
                            placeholder="ejemplo@dentalsaas.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <small className="text-muted">
                          Ingresa el correo asociado a tu cuenta
                        </small>
                      </div>

                      {/* Submit Button */}
                      <button 
                        type="submit" 
                        className="btn btn-primary w-100 py-3 mb-4 fw-semibold"
                        style={{borderRadius: '10px'}}
                      >
                        Enviar Instrucciones
                      </button>

                      {/* Back to Login */}
                      <div className="text-center">
                        <Link href="/login" className="text-primary fw-medium">
                          <i className="ti ti-arrow-left me-2"></i>
                          Volver al inicio de sesión
                        </Link>
                      </div>

                    </form>
                  </>
                ) : (
                  <>
                    {/* Mensaje de Éxito */}
                    <div className="text-center">
                      <div className="bg-success-subtle rounded-circle d-inline-flex p-4 mb-3">
                        <i className="ti ti-mail-check fs-1 text-success"></i>
                      </div>
                      <h2 className="fw-bold text-dark mb-2">¡Correo Enviado!</h2>
                      <p className="text-muted mb-4">
                        Hemos enviado las instrucciones para recuperar tu contraseña a:
                      </p>
                      <div className="alert alert-light mb-4">
                        <strong>{email}</strong>
                      </div>
                      <p className="text-muted mb-4">
                        Revisa tu bandeja de entrada y sigue los pasos para restablecer tu contraseña.
                      </p>
                      
                      <div className="d-grid gap-2">
                        <button 
                          onClick={() => window.location.href = '/login'}
                          className="btn btn-primary py-3 fw-semibold"
                          style={{borderRadius: '10px'}}
                        >
                          Ir al Inicio de Sesión
                        </button>
                        <button 
                          onClick={() => setEnviado(false)}
                          className="btn btn-outline-secondary py-3"
                          style={{borderRadius: '10px'}}
                        >
                          Enviar de Nuevo
                        </button>
                      </div>
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* Footer Info */}
            <div className="text-center mt-4">
              <p className="text-white mb-2">
                <small>© 2025 DentalSaaS. Todos los derechos reservados.</small>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
