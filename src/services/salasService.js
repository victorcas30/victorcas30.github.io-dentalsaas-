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

export const salasService = {
  // Listar salas por clínica
  async listarPorClinica(idClinica) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch(`salas/clinica/${idClinica}`, {
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

  // Listar salas activas para catálogo
  async listarCatalogo(idClinica) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch(`salas/clinica/${idClinica}/catalog`, {
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
      console.error('Error en listarCatalogo:', error)
      throw error
    }
  },

  // Obtener sala por ID
  async obtenerPorId(id, idClinica) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch(`salas/${id}/clinica/${idClinica}`, {
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

  // Crear nueva sala
  async crear(datosSala) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      console.log('📤 Creando sala:', datosSala)

      const response = await apiFetch('salas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosSala)
      })

      if (!response.ok) {
        const error = await parsearErrorAPI(response)
        throw error
      }

      const result = await response.json()
      console.log('✅ Sala creada:', result)
      return result
    } catch (error) {
      console.error('Error en crear sala:', error)
      throw error
    }
  },

  // Actualizar sala
  async actualizar(id, idClinica, datosSala) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      console.log('📤 Actualizando sala:', id, datosSala)

      const response = await apiFetch(`salas/${id}/clinica/${idClinica}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosSala)
      })

      if (!response.ok) {
        const error = await parsearErrorAPI(response)
        throw error
      }

      const result = await response.json()
      console.log('✅ Sala actualizada:', result)
      return result
    } catch (error) {
      console.error('Error en actualizar:', error)
      throw error
    }
  },

  // Eliminar sala (soft delete)
  async eliminar(id, idClinica) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      console.log('📤 Eliminando sala:', id)

      const response = await apiFetch(`salas/${id}/clinica/${idClinica}`, {
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
      console.log('✅ Sala eliminada:', result)
      return result
    } catch (error) {
      console.error('Error en eliminar:', error)
      throw error
    }
  }
}

