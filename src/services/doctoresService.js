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

export const doctoresService = {
  // Listar doctores por clínica
  async listarPorClinica(idClinica) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch(`doctores/clinica/${idClinica}`, {
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

  // Listar doctores activos para catálogo
  async listarCatalogo(idClinica) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch(`doctores/clinica/${idClinica}/catalog`, {
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

  // Obtener doctor por ID
  async obtenerPorId(id, idClinica) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch(`doctores/${id}/clinica/${idClinica}`, {
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

  // Crear nuevo doctor
  async crear(datosDoctor) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      console.log('📤 Creando doctor:', datosDoctor)

      const response = await apiFetch('doctores', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosDoctor)
      })

      if (!response.ok) {
        const error = await parsearErrorAPI(response)
        throw error
      }

      const result = await response.json()
      console.log('✅ Doctor creado:', result)
      return result
    } catch (error) {
      console.error('Error en crear doctor:', error)
      throw error
    }
  },

  // Actualizar doctor
  async actualizar(id, idClinica, datosDoctor) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      console.log('📤 Actualizando doctor:', id, datosDoctor)

      const response = await apiFetch(`doctores/${id}/clinica/${idClinica}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosDoctor)
      })

      if (!response.ok) {
        const error = await parsearErrorAPI(response)
        throw error
      }

      const result = await response.json()
      console.log('✅ Doctor actualizado:', result)
      return result
    } catch (error) {
      console.error('Error en actualizar:', error)
      throw error
    }
  },

  // Eliminar doctor (soft delete)
  async eliminar(id, idClinica) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      console.log('📤 Eliminando doctor:', id)

      const response = await apiFetch(`doctores/${id}/clinica/${idClinica}`, {
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
      console.log('✅ Doctor eliminado:', result)
      return result
    } catch (error) {
      console.error('Error en eliminar:', error)
      throw error
    }
  }
}

