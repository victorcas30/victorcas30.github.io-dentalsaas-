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

export const rolesService = {
  // Listar roles por clínica
  async listarPorClinica() {
    try {
      const usuario = authService.getCurrentUser()
      const token = authService.getToken()
      
      if (!usuario || !token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch(`roles/clinica/${usuario.id_clinica}`, {
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

  // Obtener rol por ID con sus rutas
  async obtenerPorIdConRutas(id) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch(`roles/${id}`, {
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
      
      // Si el rol tiene rutas en el response, las retornamos
      // Si no, retornamos el rol con un array vacío de rutas
      return {
        ...result.data,
        rutas: result.data.rutas || []
      }
    } catch (error) {
      console.error('Error en obtenerPorIdConRutas:', error)
      throw error
    }
  },

  // Obtener rol por ID
  async obtenerPorId(id) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch(`roles/${id}`, {
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

  // Crear nuevo rol
  async crear(datosRol) {
    try {
      const usuario = authService.getCurrentUser()
      const token = authService.getToken()
      
      if (!usuario || !token) {
        throw new Error('No hay sesión activa')
      }

      const body = {
        id_clinica: usuario.id_clinica,
        nombre: datosRol.nombre,
        descripcion: datosRol.descripcion || '',
        default_home: datosRol.default_home
      }

      console.log('📤 Enviando datos de rol:', body)

      const response = await apiFetch('roles', {
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
      console.log('✅ Rol creado:', result)
      return result
    } catch (error) {
      console.error('Error en crear rol:', error)
      throw error
    }
  },

  // Actualizar rol
  async actualizar(id, datosRol) {
    try {
      const usuario = authService.getCurrentUser()
      const token = authService.getToken()
      
      if (!usuario || !token) {
        throw new Error('No hay sesión activa')
      }

      const body = {
        id_clinica: usuario.id_clinica,
        nombre: datosRol.nombre,
        descripcion: datosRol.descripcion || '',
        default_home: datosRol.default_home
      }

      console.log('📤 Actualizando rol:', id, body)

      const response = await apiFetch(`roles/${id}`, {
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
      console.log('✅ Rol actualizado:', result)
      return result
    } catch (error) {
      console.error('Error en actualizar:', error)
      throw error
    }
  },

  // Eliminar rol (soft delete)
  async eliminar(id) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      console.log('📤 Eliminando rol:', id)

      const response = await apiFetch(`roles/${id}`, {
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
      console.log('✅ Rol eliminado:', result)
      return result
    } catch (error) {
      console.error('Error en eliminar:', error)
      throw error
    }
  }
}
