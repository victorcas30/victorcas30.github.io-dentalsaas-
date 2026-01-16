'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('') // Limpiar error al escribir
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authService.login(formData.email, formData.password)

      if (response.success) {
        // Mostrar mensaje de éxito
        console.log('Login exitoso:', response)
        
        // Redirigir a la agenda
        router.push('/agenda-semana')
      }
    } catch (err) {
      console.error('Error en login:', err)
      setError(err.message || 'Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="position-relative overflow-hidden min-vh-100 d-flex align-items-center justify-content-center py-5" 
         style={{background: 'linear-gradient(135deg, #1B84FF 0%, #43CED7 100%)'}}>
      
      {/* Decoración de fondo */}
      <div className="position-absolute w-100 h-100" style={{opacity: 0.1}}>
        <div className="position-absolute rounded-circle" 
             style={{
               width: '500px', 
               height: '500px', 
               background: 'white', 
               top: '-100px', 
               left: '-100px'
             }}></div>
        <div className="position-absolute rounded-circle" 
             style={{
               width: '300px', 
               height: '300px', 
               background: 'white', 
               bottom: '-50px', 
               right: '-50px'
             }}></div>
      </div>

      <div className="container position-relative">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4">
            <div className="card mb-0 shadow-lg border-0" style={{borderRadius: '20px'}}>
              <div className="card-body p-4 p-sm-5">
                
                {/* Logo y Título */}
                <div className="text-center mb-4 mb-sm-5">
                  <div className="mb-3">
                    <span style={{fontSize: '60px'}}>🦷</span>
                  </div>
                  <h2 className="fw-bold text-primary mb-2">DentalSaaS</h2>
                  <p className="text-muted mb-0">Sistema de Gestión Dental</p>
                </div>

                {/* Mensaje de Error */}
                {error && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <i className="ti ti-alert-circle me-2"></i>
                    <div>{error}</div>
                  </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                  
                  {/* Email */}
                  <div className="mb-3 mb-sm-4">
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
                        name="email"
                        placeholder="ejemplo@dentalsaas.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-3 mb-sm-4">
                    <label htmlFor="password" className="form-label fw-semibold">
                      Contraseña
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="ti ti-lock"></i>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control border-start-0 border-end-0 ps-0"
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                      <span 
                        className="input-group-text bg-light border-start-0 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{cursor: 'pointer'}}
                      >
                        <i className={`ti ti-eye${showPassword ? '-off' : ''}`}></i>
                      </span>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={loading}
                      />
                      <label className="form-check-label text-muted" htmlFor="rememberMe">
                        Recordarme
                      </label>
                    </div>
                    <Link href="/recuperar-password" className="text-primary fw-medium text-decoration-none" style={{fontSize: '14px'}}>
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>

                  {/* Login Button */}
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 py-3 fw-semibold"
                    style={{borderRadius: '10px'}}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Iniciando sesión...
                      </>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </button>

                </form>

              </div>
            </div>

            {/* Footer Info */}
            <div className="text-center mt-3 mt-sm-4">
              <p className="text-white mb-2">
                <small>© 2025 DentalSaaS. Todos los derechos reservados.</small>
              </p>
              <div className="d-flex justify-content-center gap-2 gap-sm-3 flex-wrap">
                <Link href="/terminos" className="text-white text-decoration-none">
                  <small>Términos</small>
                </Link>
                <span className="text-white">•</span>
                <Link href="/privacidad" className="text-white text-decoration-none">
                  <small>Privacidad</small>
                </Link>
                <span className="text-white">•</span>
                <Link href="/soporte" className="text-white text-decoration-none">
                  <small>Soporte</small>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
