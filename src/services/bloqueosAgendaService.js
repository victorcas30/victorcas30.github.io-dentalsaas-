import API_CONFIG, { apiFetch } from '@/config/api'
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

export const bloqueosAgendaService = {
  // Listar bloqueos por clínica
  async listarPorClinica(idClinica) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch(`bloqueos-agenda/clinica/${idClinica}`, {
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

  // Listar bloqueos por clínica y doctor
  async listarPorClinicaYDoctor(idClinica, idDoctor) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch(`bloqueos-agenda/clinica/${idClinica}/doctor/${idDoctor}`, {
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
      console.error('Error en listarPorClinicaYDoctor:', error)
      throw error
    }
  },

  // Crear nuevo bloqueo
  async crear(datosBloqueo) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      console.log('📤 Creando bloqueo:', datosBloqueo)

      const response = await apiFetch('bloqueos-agenda', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosBloqueo)
      })

      if (!response.ok) {
        const error = await parsearErrorAPI(response)
        throw error
      }

      const result = await response.json()
      console.log('✅ Bloqueo creado:', result)
      return result
    } catch (error) {
      console.error('Error en crear bloqueo:', error)
      throw error
    }
  },

  // Actualizar bloqueo
  async actualizar(idBloqueo, idClinica, datosBloqueo) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      console.log('📤 Actualizando bloqueo:', idBloqueo, datosBloqueo)

      const response = await apiFetch(`bloqueos-agenda/${idBloqueo}/clinica/${idClinica}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosBloqueo)
      })

      if (!response.ok) {
        const error = await parsearErrorAPI(response)
        throw error
      }

      const result = await response.json()
      console.log('✅ Bloqueo actualizado:', result)
      return result
    } catch (error) {
      console.error('Error en actualizar bloqueo:', error)
      throw error
    }
  },

  // Eliminar bloqueo (soft delete)
  async eliminar(idBloqueo, idClinica) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      console.log('📤 Eliminando bloqueo:', idBloqueo)

      const response = await apiFetch(`bloqueos-agenda/${idBloqueo}/clinica/${idClinica}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await parsearErrorAPI(response)
        throw error
      }

      const result = await response.json()
      console.log('✅ Bloqueo eliminado:', result)
      return result
    } catch (error) {
      console.error('Error en eliminar bloqueo:', error)
      throw error
    }
  }
}

