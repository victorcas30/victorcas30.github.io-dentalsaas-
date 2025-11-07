import API_CONFIG, { apiFetch, buildAppRoute } from '@/config/api'

export const authService = {
  // Login
  async login(email, password) {
    try {
      const response = await apiFetch('auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error en el login')
      }

      const data = await response.json()

      // Guardar datos en localStorage
      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('refreshToken', data.refreshToken)
        localStorage.setItem('usuario', JSON.stringify(data.usuario))
        localStorage.setItem('modulos', JSON.stringify(data.modulos))
      }

      return data
    } catch (error) {
      console.error('Error en login:', error)
      throw error
    }
  },

  // Logout (cerrar sesión en dispositivo actual)
  async logout() {
    try {
      const refreshToken = this.getRefreshToken()
      
      // Si hay refresh token, invalidarlo en el backend
      if (refreshToken) {
        try {
          const response = await apiFetch('auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken })
          })

          if (!response.ok) {
            console.warn('Error al invalidar token en el servidor')
          }
        } catch (error) {
          console.warn('No se pudo invalidar el token en el servidor:', error)
          // Continuar con el logout local aunque falle el servidor
        }
      }

      // Limpiar localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('usuario')
      localStorage.removeItem('modulos')
      
      // Redirigir al login
      window.location.href = buildAppRoute('/login/')
    } catch (error) {
      console.error('Error en logout:', error)
      // Asegurar que se limpie localStorage aunque falle la petición
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('usuario')
      localStorage.removeItem('modulos')
      window.location.href = buildAppRoute('/login/')
    }
  },

  // Logout en todos los dispositivos
  async logoutAll() {
    try {
      const refreshToken = this.getRefreshToken()
      
      if (!refreshToken) {
        throw new Error('No hay refresh token')
      }

      console.log('📤 Cerrando sesión en todos los dispositivos...')

      const response = await apiFetch('auth/logoutall', {
        method: 'POST',
        body: JSON.stringify({ refreshToken })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al cerrar sesiones')
      }

      const data = await response.json()
      console.log('✅ Sesiones cerradas en todos los dispositivos')

      // Limpiar localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('usuario')
      localStorage.removeItem('modulos')
      
      // Redirigir al login
      window.location.href = buildAppRoute('/login/')
      
      return data
    } catch (error) {
      console.error('Error en logoutAll:', error)
      // Limpiar localStorage local aunque falle
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('usuario')
      localStorage.removeItem('modulos')
      window.location.href = buildAppRoute('/login/')
      throw error
    }
  },

  // Obtener token
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  },

  // Obtener refresh token
  getRefreshToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken')
    }
    return null
  },

  // Obtener usuario actual
  getCurrentUser() {
    if (typeof window !== 'undefined') {
      const usuario = localStorage.getItem('usuario')
      return usuario ? JSON.parse(usuario) : null
    }
    return null
  },

  // Obtener módulos del usuario
  getModulos() {
    if (typeof window !== 'undefined') {
      const modulos = localStorage.getItem('modulos')
      return modulos ? JSON.parse(modulos) : []
    }
    return []
  },

  // Obtener ID de la clínica del usuario actual
  getClinicaId() {
    const usuario = this.getCurrentUser()
    return usuario?.id_clinica || null
  },

  // Verificar si está autenticado
  isAuthenticated() {
    return !!this.getToken()
  },

  // Refrescar token manualmente
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken()
      
      if (!refreshToken) {
        throw new Error('No hay refresh token')
      }

      const response = await apiFetch('auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al refrescar token')
      }

      const data = await response.json()

      // El backend devuelve accessToken según la documentación
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken)
        return data.accessToken
      }

      throw new Error('No se recibió accessToken del servidor')
    } catch (error) {
      console.error('Error al refrescar token:', error)
      this.logout()
      throw error
    }
  },

  // Verificar si el token está por expirar (útil para refresh proactivo)
  isTokenExpiringSoon() {
    try {
      const token = this.getToken()
      if (!token) return true

      // Decodificar el token JWT (sin verificar, solo leer)
      const payload = JSON.parse(atob(token.split('.')[1]))
      const exp = payload.exp * 1000 // Convertir a milisegundos
      const now = Date.now()
      
      // Si expira en menos de 5 minutos, retornar true
      return (exp - now) < 5 * 60 * 1000
    } catch (error) {
      console.error('Error al verificar expiración del token:', error)
      return true
    }
  }
}
