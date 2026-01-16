import { apiFetch, buildUrl } from '@/config/api'
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

export const clinicasService = {
  // Obtener información de la clínica
  async obtenerPorId(idClinica) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const response = await apiFetch(`clinicas/${idClinica}`, {
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

  // Actualizar logo de la clínica
  async actualizarLogo(idClinica, archivoLogo) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      // Validar que sea un archivo de imagen
      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!tiposPermitidos.includes(archivoLogo.type)) {
        throw new Error('El archivo debe ser una imagen (JPEG, PNG o WEBP)')
      }

      // Validar tamaño máximo (5MB)
      const tamañoMaximo = 5 * 1024 * 1024 // 5MB en bytes
      if (archivoLogo.size > tamañoMaximo) {
        throw new Error('El archivo no puede ser mayor a 5MB')
      }

      // Crear FormData para multipart/form-data
      const formData = new FormData()
      formData.append('logo', archivoLogo)

      console.log('📤 Actualizando logo de clínica:', idClinica)

      // Para FormData, NO incluir Content-Type header - el navegador lo establecerá automáticamente
      const url = buildUrl(`clinicas/${idClinica}/logo`)
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // NO incluir 'Content-Type' - el navegador lo establecerá con el boundary correcto
        },
        body: formData
      })

      if (!response.ok) {
        const error = await parsearErrorAPI(response)
        throw error
      }

      const result = await response.json()
      console.log('✅ Logo de clínica actualizado:', result)
      return result
    } catch (error) {
      console.error('Error en actualizarLogo:', error)
      throw error
    }
  },

  // Actualizar ubicación de la clínica
  async actualizarUbicacion(idClinica, latitud, longitud) {
    try {
      const token = authService.getToken()
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      // Validar coordenadas
      if (typeof latitud !== 'number' || typeof longitud !== 'number') {
        throw new Error('Latitud y longitud deben ser números válidos')
      }

      if (latitud < -90 || latitud > 90) {
        throw new Error('La latitud debe estar entre -90 y 90')
      }

      if (longitud < -180 || longitud > 180) {
        throw new Error('La longitud debe estar entre -180 y 180')
      }

      console.log('📤 Actualizando ubicación de clínica:', idClinica, { latitud, longitud })

      const response = await apiFetch(`clinicas/${idClinica}/ubicacion`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          latitud,
          longitud
        })
      })

      if (!response.ok) {
        const error = await parsearErrorAPI(response)
        throw error
      }

      const result = await response.json()
      console.log('✅ Ubicación de clínica actualizada:', result)
      return result
    } catch (error) {
      console.error('Error en actualizarUbicacion:', error)
      throw error
    }
  }
}



