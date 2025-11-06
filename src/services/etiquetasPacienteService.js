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
  async asignar(idPaciente, idEtiqueta, idClinica) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch('etiquetas-paciente', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_paciente: idPaciente,
          id_etiqueta: idEtiqueta,
          id_clinica: idClinica
        })
      })

      if (!response.ok) {
        const error = await parsearErrorAPI(response)
        throw error
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error en asignar etiqueta:', error)
      throw error
    }
  },

  // Desasignar etiqueta de paciente
  async desasignar(idPaciente, idEtiqueta, idClinica) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch(`etiquetas-paciente/${idPaciente}/${idEtiqueta}/clinica/${idClinica}`, {
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
      console.error('Error en desasignar etiqueta:', error)
      throw error
    }
  }
}
