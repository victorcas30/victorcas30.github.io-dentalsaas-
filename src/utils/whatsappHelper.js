/**
 * Utilidades para generar URLs de WhatsApp
 */

/**
 * Obtiene el saludo según la hora del día
 * @returns {string} Saludo (Buenos días, Buenas tardes, Buenas noches)
 */
export const obtenerSaludo = () => {
  const hora = new Date().getHours()
  
  if (hora >= 5 && hora < 12) {
    return 'Buenos días'
  } else if (hora >= 12 && hora < 19) {
    return 'Buenas tardes'
  } else {
    return 'Buenas noches'
  }
}

/**
 * Formatea una fecha para el mensaje de WhatsApp
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha formateada (ej: "20 de noviembre de 2025")
 */
export const formatearFechaParaWhatsApp = (fecha) => {
  if (!fecha) return ''
  
  try {
    const fechaDate = new Date(fecha + 'T12:00:00') // Agregar hora para evitar problemas de zona horaria
    const opciones = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    return fechaDate.toLocaleDateString('es-SV', opciones)
  } catch (error) {
    console.error('Error al formatear fecha:', error)
    return fecha
  }
}

/**
 * Formatea una hora para el mensaje de WhatsApp
 * @param {string} hora - Hora en formato HH:mm o HH:mm:ss
 * @returns {string} Hora formateada (ej: "09:30")
 */
export const formatearHoraParaWhatsApp = (hora) => {
  if (!hora) return ''
  
  // Extraer solo HH:mm
  return hora.substring(0, 5)
}

/**
 * Genera el mensaje de WhatsApp para confirmación de cita
 * @param {Object} datosCita - Datos de la cita
 * @param {string} datosCita.fecha - Fecha de la cita
 * @param {string} datosCita.hora_inicio - Hora de inicio
 * @param {string} linkConfirmacion - Link de confirmación
 * @returns {string} Mensaje formateado
 */
export const generarMensajeWhatsApp = (datosCita, linkConfirmacion) => {
  const saludo = obtenerSaludo()
  const fechaFormateada = formatearFechaParaWhatsApp(datosCita.fecha)
  const horaFormateada = formatearHoraParaWhatsApp(datosCita.hora_inicio)
  
  const mensaje = `${saludo}.\n\nTe escribimos para notificar tu cita el día ${fechaFormateada} a las ${horaFormateada} en la clínica.\n\nHaz click aquí para confirmar tu cita:\n${linkConfirmacion}`
  
  return mensaje
}

/**
 * Genera la URL de WhatsApp con el mensaje codificado
 * @param {string} numeroTelefono - Número de teléfono con código de país (ej: +50371001234)
 * @param {string} mensaje - Mensaje a enviar
 * @returns {string} URL de WhatsApp
 */
export const generarUrlWhatsApp = (numeroTelefono, mensaje) => {
  if (!numeroTelefono) {
    throw new Error('El número de teléfono es requerido')
  }
  
  // Limpiar el número de teléfono (remover espacios, guiones, paréntesis)
  const numeroLimpio = numeroTelefono.replace(/[\s\-\(\)]/g, '')
  
  // Codificar el mensaje para URL
  const mensajeCodificado = encodeURIComponent(mensaje)
  
  // Construir la URL de WhatsApp
  return `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`
}

/**
 * Genera la URL completa de WhatsApp para confirmación de cita
 * @param {Object} datosCita - Datos de la cita con información del paciente
 * @param {string} datosCita.fecha - Fecha de la cita
 * @param {string} datosCita.hora_inicio - Hora de inicio
 * @param {string} datosCita.paciente_celular_whatsapp - Número de WhatsApp del paciente
 * @param {string} linkConfirmacion - Link de confirmación de la cita
 * @returns {string} URL de WhatsApp completa
 */
export const generarUrlWhatsAppConfirmacion = (datosCita, linkConfirmacion) => {
  if (!datosCita.paciente_celular_whatsapp) {
    throw new Error('El paciente no tiene número de WhatsApp registrado')
  }
  
  const mensaje = generarMensajeWhatsApp(datosCita, linkConfirmacion)
  return generarUrlWhatsApp(datosCita.paciente_celular_whatsapp, mensaje)
}

