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

export const rutasService = {
  // Listar rutas por módulo
  async listarPorModulo(idModulo) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch(`rutas/modulo/${idModulo}`, {
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
      console.error('Error en listarPorModulo:', error)
      throw error
    }
  },

  // Listar rutas homepage
  async listarHomepage() {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch('rutas/homepage', {
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
      console.error('Error en listarHomepage:', error)
      throw error
    }
  },

  // Obtener ruta por ID
  async obtenerPorId(id) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch(`rutas/${id}`, {
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

  // Crear nueva ruta
  async crear(datosRuta) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const body = {
        nombre: datosRuta.nombre,
        path: datosRuta.path,
        descripcion: datosRuta.descripcion || '',
        id_modulo: datosRuta.id_modulo,
        activo: datosRuta.activo ? '1' : '0',
        es_homepage: Boolean(datosRuta.es_homepage)
      }

      console.log('📤 Enviando datos de ruta:', body)

      const response = await apiFetch('rutas', {
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
      console.log('✅ Ruta creada:', result)
      return result
    } catch (error) {
      console.error('Error en crear ruta:', error)
      throw error
    }
  },

  // Actualizar ruta
  async actualizar(id, datosRuta) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const body = {
        nombre: datosRuta.nombre,
        path: datosRuta.path,
        descripcion: datosRuta.descripcion || '',
        id_modulo: datosRuta.id_modulo,
        activo: datosRuta.activo ? '1' : '0',
        es_homepage: Boolean(datosRuta.es_homepage)
      }

      console.log('📤 Actualizando ruta:', id, body)

      const response = await apiFetch(`rutas/${id}`, {
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
      console.log('✅ Ruta actualizada:', result)
      return result
    } catch (error) {
      console.error('Error en actualizar:', error)
      throw error
    }
  },

  // Eliminar ruta (soft delete)
  async eliminar(id) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      console.log('📤 Eliminando ruta:', id)

      const response = await apiFetch(`rutas/${id}`, {
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
      console.log('✅ Ruta eliminada:', result)
      return result
    } catch (error) {
      console.error('Error en eliminar:', error)
      throw error
    }
  }
}
