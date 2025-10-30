import Swal from 'sweetalert2'

/**
 * Muestra un error de la API usando SweetAlert2
 * @param {Object} error - Objeto de error de la API
 */
export const mostrarErrorAPI = (error) => {
  let mensaje = 'Ocurrió un error inesperado'
  let detalles = ''

  // Si el error tiene un mensaje directo
  if (error.message) {
    mensaje = error.message
  }

  // Si el error tiene errores de validación (array de errores)
  if (error.errors && Array.isArray(error.errors)) {
    const listaErrores = error.errors
      .map(err => `• ${err.field}: ${err.message}`)
      .join('<br>')
    
    detalles = `<div style="text-align: left; margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
      <strong>Errores de validación:</strong><br>
      ${listaErrores}
    </div>`
  }

  return Swal.fire({
    icon: 'error',
    title: '¡Error!',
    html: `${mensaje}${detalles}`,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#d33',
    customClass: {
      popup: 'animated fadeInDown'
    }
  })
}

/**
 * Muestra un mensaje de éxito usando SweetAlert2
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} titulo - Título del mensaje (opcional)
 */
export const mostrarExito = (mensaje, titulo = '¡Éxito!') => {
  return Swal.fire({
    icon: 'success',
    title: titulo,
    text: mensaje,
    confirmButtonText: 'OK',
    confirmButtonColor: '#28a745',
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      popup: 'animated fadeInDown'
    }
  })
}

/**
 * Muestra una confirmación antes de una acción
 * @param {string} mensaje - Mensaje de confirmación
 * @param {string} titulo - Título de la confirmación
 */
export const mostrarConfirmacion = (mensaje, titulo = '¿Estás seguro?') => {
  return Swal.fire({
    icon: 'warning',
    title: titulo,
    text: mensaje,
    showCancelButton: true,
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    customClass: {
      popup: 'animated fadeInDown'
    }
  })
}

/**
 * Muestra un mensaje de advertencia
 * @param {string} mensaje - Mensaje de advertencia
 * @param {string} titulo - Título de la advertencia
 */
export const mostrarAdvertencia = (mensaje, titulo = 'Advertencia') => {
  return Swal.fire({
    icon: 'warning',
    title: titulo,
    text: mensaje,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#ffc107',
    customClass: {
      popup: 'animated fadeInDown'
    }
  })
}

/**
 * Muestra un mensaje de información
 * @param {string} mensaje - Mensaje informativo
 * @param {string} titulo - Título del mensaje
 */
export const mostrarInfo = (mensaje, titulo = 'Información') => {
  return Swal.fire({
    icon: 'info',
    title: titulo,
    text: mensaje,
    confirmButtonText: 'OK',
    confirmButtonColor: '#17a2b8',
    customClass: {
      popup: 'animated fadeInDown'
    }
  })
}
