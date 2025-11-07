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

export const etiquetasPacienteService = {
  // Asignar etiqueta a paciente
  async asignar(idPaciente, idEtiqueta) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      // Convertir a números para asegurar el tipo correcto
      const body = {
        paciente_etiqueta: [parseInt(idPaciente), parseInt(idEtiqueta)]
      }

      console.log('📤 Asignando etiqueta a paciente:', body)

      const response = await apiFetch('paciente-etiquetas/add', {
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
      console.log('✅ Etiqueta asignada:', result)
      return result
    } catch (error) {
      console.error('Error en asignar etiqueta:', error)
      throw error
    }
  },

  // Desasignar etiqueta de paciente
  async desasignar(idPaciente, idEtiqueta) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      // Convertir a números para asegurar el tipo correcto
      const body = {
        paciente_etiqueta: [parseInt(idPaciente), parseInt(idEtiqueta)]
      }

      console.log('📤 Eliminando etiqueta de paciente:', body)

      const response = await apiFetch('paciente-etiquetas/delete', {
        method: 'DELETE',
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
      console.log('✅ Etiqueta eliminada:', result)
      return result
    } catch (error) {
      console.error('Error en desasignar etiqueta:', error)
      throw error
    }
  }
}
