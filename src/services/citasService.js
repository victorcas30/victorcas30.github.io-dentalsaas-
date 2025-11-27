import API_CONFIG, { apiFetch, buildAppRoute } from '@/config/api'
import { authService } from './authService'

const parsearErrorAPI = async (response) => {
  try {
    const error = await response.json()
    return {
      message: error.message || 'Error en la operación',
      errors: error.errors || null
    }
  } catch (e) {
    return {
      message: 'Error de conexión con el servidor',
      errors: null
    }
  }
}

export const citasService = {
  // Listar citas de una clínica
  async listarPorClinica(idClinica) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch(`clinicas-citas/clinica/${idClinica}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await parsearErrorAPI(response)
        throw error
      }

      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error('Error en listarPorClinica:', error)
      throw error
    }
  },

  // Obtener una cita específica
  async obtenerPorId(idCita, idClinica) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch(`clinicas-citas/${idCita}/clinica/${idClinica}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await parsearErrorAPI(response)
        throw error
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Error en obtenerPorId:', error)
      throw error
    }
  },

  // Crear nueva cita
  async crear(datosCita) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      console.log('📤 Creando cita:', datosCita)

      const response = await apiFetch('clinicas-citas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosCita)
      })

      if (!response.ok) {
        const error = await parsearErrorAPI(response)
        throw error
      }

      const result = await response.json()
      console.log('✅ Cita creada:', result)
      return result
    } catch (error) {
      console.error('Error en crear cita:', error)
      throw error
    }
  },

  // Actualizar una cita
  async actualizar(idCita, idClinica, datosCita) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      console.log('📤 Actualizando cita:', idCita, datosCita)

      const response = await apiFetch(`clinicas-citas/${idCita}/clinica/${idClinica}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosCita)
      })

      if (!response.ok) {
        const error = await parsearErrorAPI(response)
        throw error
      }

      const result = await response.json()
      console.log('✅ Cita actualizada:', result)
      return result
    } catch (error) {
      console.error('Error en actualizar cita:', error)
      throw error
    }
  },

  // Generar token de confirmación para una cita
  async generarTokenConfirmacion(idCita) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      console.log('📤 Generando token de confirmación para cita:', idCita)

      const response = await apiFetch(`clinicas-citas/${idCita}/confirmacion-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await parsearErrorAPI(response)
        throw error
      }

      const result = await response.json()
      console.log('✅ Token de confirmación generado:', result)
      
      // Construir el link de confirmación correcto según el entorno
      const tokenData = result.data
      if (tokenData && tokenData.token) {
        // Construir la URL base según el entorno
        const isDev = process.env.NODE_ENV === 'development'
        let baseUrl
        
        if (isDev) {
          // Desarrollo: localhost
          baseUrl = typeof window !== 'undefined' 
            ? `${window.location.protocol}//${window.location.host}`
            : 'http://localhost:3000'
        } else {
          // Producción: GitHub Pages
          baseUrl = 'https://victorcas30.github.io'
        }
        
        // Construir el path completo con basePath
        const confirmPath = buildAppRoute('/confirmar-cita')
        const linkConfirmacion = `${baseUrl}${confirmPath}?token=${tokenData.token}`
        
        // Reemplazar el link_confirmacion con el correcto
        tokenData.link_confirmacion = linkConfirmacion
      }
      
      return tokenData
    } catch (error) {
      console.error('Error en generarTokenConfirmacion:', error)
      throw error
    }
  }
}

