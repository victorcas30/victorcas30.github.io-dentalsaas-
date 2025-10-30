import API_CONFIG, { apiFetch } from '@/config/api'
import { authService } from './authService'

/**
 * Helper para parsear errores de la API
 */
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

export const modulosService = {
  // Listar todos los módulos
  async listar() {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch('modulos', {
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
      console.error('Error en listar módulos:', error)
      throw error
    }
  },

  // Obtener módulo por ID
  async obtenerPorId(id) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch(`modulos/${id}`, {
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

  // Crear nuevo módulo
  async crear(datosModulo) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const body = {
        nombre: datosModulo.nombre,
        descripcion: datosModulo.descripcion || ''
      }

      console.log('📤 Enviando datos de módulo:', body)

      const response = await apiFetch('modulos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const error = await parsearErrorAPI(response)
        throw error
      }

      const result = await response.json()
      console.log('✅ Módulo creado:', result)
      return result
    } catch (error) {
      console.error('Error en crear módulo:', error)
      throw error
    }
  },

  // Actualizar módulo
  async actualizar(id, datosModulo) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const body = {
        nombre: datosModulo.nombre,
        descripcion: datosModulo.descripcion || ''
      }

      console.log('📤 Actualizando módulo:', id, body)

      const response = await apiFetch(`modulos/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const error = await parsearErrorAPI(response)
        throw error
      }

      const result = await response.json()
      console.log('✅ Módulo actualizado:', result)
      return result
    } catch (error) {
      console.error('Error en actualizar:', error)
      throw error
    }
  },

  // Eliminar módulo (soft delete)
  async eliminar(id) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      console.log('📤 Eliminando módulo:', id)

      const response = await apiFetch(`modulos/${id}`, {
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
      console.log('✅ Módulo eliminado:', result)
      return result
    } catch (error) {
      console.error('Error en eliminar:', error)
      throw error
    }
  }
}
