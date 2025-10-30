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

export const usuariosService = {
  // Listar usuarios por clínica
  async listarPorClinica() {
    try {
      const usuario = authService.getCurrentUser()
      const token = authService.getToken()
      
      if (!usuario || !token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch(`usuarios/clinica/${usuario.id_clinica}`, {
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

  // Obtener usuario por ID
  async obtenerPorId(id) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch(`usuarios/${id}`, {
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

  // Crear nuevo usuario
  async crear(datosUsuario) {
    try {
      const usuario = authService.getCurrentUser()
      const token = authService.getToken()
      
      if (!usuario || !token) {
        throw new Error('No hay sesión activa')
      }

      // Preparar datos con el formato correcto
      const body = {
        id_clinica: usuario.id_clinica,
        id_rol: datosUsuario.id_rol,
        nombre: datosUsuario.nombre,
        email: datosUsuario.email,
        password: datosUsuario.password,
        telefono: datosUsuario.telefono || '',
        activo: String(datosUsuario.activo) // ⚠️ Convertir a string
      }

      console.log('📤 Enviando datos de usuario:', body)

      const response = await apiFetch('usuarios', {
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
      console.log('✅ Usuario creado:', result)
      return result
    } catch (error) {
      console.error('Error en crear:', error)
      throw error
    }
  },

  // Actualizar usuario
  async actualizar(id, datosUsuario) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      // Preparar datos con el formato correcto
      const body = {
        nombre: datosUsuario.nombre,
        email: datosUsuario.email,
        telefono: datosUsuario.telefono || '',
        id_rol: datosUsuario.id_rol,
        activo: String(datosUsuario.activo) // ⚠️ Convertir a string
      }

      // Solo incluir password si se proporcionó
      if (datosUsuario.password) {
        body.password = datosUsuario.password
      }

      console.log('📤 Actualizando usuario:', id, body)

      const response = await apiFetch(`usuarios/${id}`, {
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
      console.log('✅ Usuario actualizado:', result)
      return result
    } catch (error) {
      console.error('Error en actualizar:', error)
      throw error
    }
  },

  // Eliminar usuario (soft delete)
  async eliminar(id) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch(`usuarios/${id}`, {
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
      return result
    } catch (error) {
      console.error('Error en eliminar:', error)
      throw error
    }
  }
}
