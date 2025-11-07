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

export const rolRutasService = {
  // Asignar o eliminar ruta de un rol
  async toggleRutaRol(idRol, idRuta, activo) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      // Convertir a boolean (activo puede venir como 0, 1, true, false)
      const activoBoolean = Boolean(activo)

      const body = {
        activo: activoBoolean,
        rol_ruta: [idRol, idRuta]
      }

      console.log('📤 Toggle ruta-rol:', body)

      const response = await apiFetch('rol-rutas/adddeleterolruta', {
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
      console.log('✅ Resultado toggle:', result)
      return result
    } catch (error) {
      console.error('Error en toggleRutaRol:', error)
      throw error
    }
  },

  // Asignar múltiples rutas a un rol
  async asignarMultiplesRutas(idRol, idsRutas) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      // Crear array de promesas para asignar todas las rutas
      const promesas = idsRutas.map(idRuta => 
        this.toggleRutaRol(idRol, idRuta, true)
      )

      await Promise.all(promesas)
      
      return {
        success: true,
        message: 'Rutas asignadas correctamente'
      }
    } catch (error) {
      console.error('Error en asignarMultiplesRutas:', error)
      throw error
    }
  },

  // Eliminar ruta de un rol (hard delete)
  async eliminarRutaRol(idRol, idRuta) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      console.log('📤 Eliminando ruta-rol:', idRol, idRuta)

      const response = await apiFetch(`rol-rutas/${idRol}/${idRuta}`, {
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
      console.log('✅ Ruta-rol eliminada:', result)
      return result
    } catch (error) {
      console.error('Error en eliminarRutaRol:', error)
      throw error
    }
  }
}
