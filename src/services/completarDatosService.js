import { buildUrl, buildFrontendUrl } from '@/config/api'
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

export const completarDatosService = {
  // Generar token para completar datos desde una cita
  async generarTokenDesdeCita(idCita) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await fetch(buildUrl(`pacientes-completar-datos/generar-token/cita/${idCita}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await parsearErrorAPI(response)
        throw error
      }

      const result = await response.json()
      const data = result.data
      
      // Reemplazar la URL del backend con la URL correcta del frontend
      if (data && data.link_completar_datos) {
        // Extraer el token de la URL que viene del backend
        try {
          const urlBackend = new URL(data.link_completar_datos)
          const tokenParam = urlBackend.searchParams.get('token')
          
          if (tokenParam) {
            // Construir la URL correcta usando buildFrontendUrl
            data.link_completar_datos = buildFrontendUrl(`/completar-datos/?token=${tokenParam}`)
          }
        } catch (e) {
          console.warn('No se pudo parsear la URL del backend, usando la original:', e)
        }
      }
      
      return data
    } catch (error) {
      console.error('Error en generarTokenDesdeCita:', error)
      throw error
    }
  },

  // Generar token para completar datos desde un paciente (por ID de paciente)
  async generarTokenDesdePaciente(idPaciente) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await fetch(buildUrl(`pacientes-completar-datos/generar-token/paciente/${idPaciente}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await parsearErrorAPI(response)
        throw error
      }

      const result = await response.json()
      const data = result.data
      
      // Reemplazar la URL del backend con la URL correcta del frontend
      if (data && data.link_completar_datos) {
        // Extraer el token de la URL que viene del backend
        try {
          const urlBackend = new URL(data.link_completar_datos)
          const tokenParam = urlBackend.searchParams.get('token')
          
          if (tokenParam) {
            // Construir la URL correcta usando buildFrontendUrl
            data.link_completar_datos = buildFrontendUrl(`/completar-datos/?token=${tokenParam}`)
          }
        } catch (e) {
          console.warn('No se pudo parsear la URL del backend, usando la original:', e)
        }
      }
      
      return data
    } catch (error) {
      console.error('Error en generarTokenDesdePaciente:', error)
      throw error
    }
  },

  // Obtener información del paciente y clínica por token (público)
  async obtenerDatosPorToken(token) {
    try {
      const response = await fetch(buildUrl(`pacientes-completar-datos/${token}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await parsearErrorAPI(response)
        throw error
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Error en obtenerDatosPorToken:', error)
      throw error
    }
  },

  // Actualizar datos del paciente por token (público)
  async actualizarDatosPorToken(token, datosPaciente) {
    try {
      const response = await fetch(buildUrl(`pacientes-completar-datos/${token}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosPaciente)
      })

      if (!response.ok) {
        const error = await parsearErrorAPI(response)
        throw error
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Error en actualizarDatosPorToken:', error)
      throw error
    }
  }
}

