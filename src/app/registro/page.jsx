'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Registro() {
  const [formData, setFormData] = useState({
    nombreClinica: '',
    nombreCompleto: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    aceptaTerminos: false
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validación básica
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }

    if (!formData.aceptaTerminos) {
      alert('Debes aceptar los términos y condiciones')
      return
    }

    // Aquí irá la lógica de registro
    console.log('Registro:', formData)
    alert('¡Registro exitoso! (Por ahora solo frontend)')
    window.location.href = '/login'
  }

  return (
    <div className="position-relative overflow-hidden min-vh-100 d-flex align-items-center justify-content-center py-5" 
         style={{background: 'linear-gradient(135deg, #43CED7 0%, #1B84FF 100%)'}}>
      
      {/* Decoración de fondo */}
      <div className="position-absolute w-100 h-100" style={{opacity: 0.1}}>
        <div className="position-absolute rounded-circle" 
             style={{
               width: '400px', 
               height: '400px', 
               background: 'white', 
               top: '-50px', 
               right: '-100px'
             }}></div>
        <div className="position-absolute rounded-circle" 
             style={{
               width: '250px', 
               height: '250px', 
               background: 'white', 
               bottom: '50px', 
               left: '-50px'
             }}></div>
      </div>

      <div className="container position-relative">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 col-xl-7 col-xxl-6">
            <div className="card mb-0 shadow-lg border-0" style={{borderRadius: '20px'}}>
              <div className="card-body p-4 p-sm-5">
                
                {/* Logo y Título */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <span style={{fontSize: '50px'}}>🦷</span>
                  </div>
                  <h2 className="fw-bold text-primary mb-2">Crear Cuenta</h2>
                  <p className="text-muted mb-0">Comienza a gestionar tu clínica dental hoy</p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                  
                  <div className="row">
                    {/* Nombre de la Clínica */}
                    <div className="col-12 mb-3">
                      <label htmlFor="nombreClinica" className="form-label fw-semibold">
                        Nombre de la Clínica *
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="ti ti-building"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0"
                          id="nombreClinica"
                          name="nombreClinica"
                          placeholder="Clínica Dental Sonrisa Perfecta"
                          value={formData.nombreClinica}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Nombre Completo */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="nombreCompleto" className="form-label fw-semibold">
                        Nombre Completo *
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="ti ti-user"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0"
                          id="nombreCompleto"
                          name="nombreCompleto"
                          placeholder="Dr. Juan Pérez"
                          value={formData.nombreCompleto}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Teléfono */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="telefono" className="form-label fw-semibold">
                        Teléfono *
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="ti ti-phone"></i>
                        </span>
                        <input
                          type="tel"
                          className="form-control border-start-0 ps-0"
                          id="telefono"
                          name="telefono"
                          placeholder="555-1234"
                          value={formData.telefono}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-12 mb-3">
                      <label htmlFor="email" className="form-label fw-semibold">
                        Correo Electrónico *
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
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="password" className="form-label fw-semibold">
                        Contraseña *
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
                          minLength={6}
                        />
                        <span 
                          className="input-group-text bg-light border-start-0 cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{cursor: 'pointer'}}
                        >
                          <i className={`ti ti-eye${showPassword ? '-off' : ''}`}></i>
                        </span>
                      </div>
                      <small className="text-muted">Mínimo 6 caracteres</small>
                    </div>

                    {/* Confirm Password */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="confirmPassword" className="form-label fw-semibold">
                        Confirmar Contraseña *
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="ti ti-lock-check"></i>
                        </span>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="form-control border-start-0 border-end-0 ps-0"
                          id="confirmPassword"
                          name="confirmPassword"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                        <span 
                          className="input-group-text bg-light border-start-0 cursor-pointer"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{cursor: 'pointer'}}
                        >
                          <i className={`ti ti-eye${showConfirmPassword ? '-off' : ''}`}></i>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Términos y Condiciones */}
                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="aceptaTerminos"
                        name="aceptaTerminos"
                        checked={formData.aceptaTerminos}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-check-label text-muted" htmlFor="aceptaTerminos">
                        Acepto los{' '}
                        <Link href="/terminos" className="text-primary">
                          términos y condiciones
                        </Link>
                        {' '}y la{' '}
                        <Link href="/privacidad" className="text-primary">
                          política de privacidad
                        </Link>
                      </label>
                    </div>
                  </div>

                  {/* Register Button */}
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 py-3 mb-4 fw-semibold"
                    style={{borderRadius: '10px'}}
                  >
                    Crear Cuenta
                  </button>

                  {/* Login Link */}
                  <div className="text-center">
                    <p className="text-muted mb-0">
                      ¿Ya tienes una cuenta?{' '}
                      <Link href="/login" className="text-primary fw-semibold">
                        Inicia sesión aquí
                      </Link>
                    </p>
                  </div>

                </form>

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
