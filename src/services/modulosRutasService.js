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

export const modulosRutasService = {
  // Obtener todos los módulos con sus rutas y estado de asignación por rol
  async obtenerModulosConRutasPorRol(idRol) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      console.log('📤 Obteniendo módulos-rutas para rol:', idRol)

      const response = await apiFetch(`modulos-rutas/rol/${idRol}`, {
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
      console.log('✅ Módulos-rutas obtenidos:', result)
      return result.data || []
    } catch (error) {
      console.error('Error en obtenerModulosConRutasPorRol:', error)
      throw error
    }
  }
}
