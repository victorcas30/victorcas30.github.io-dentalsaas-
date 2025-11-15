/**
 * Utilidades para manejo seguro de fechas sin problemas de zona horaria
 */

/**
 * Normaliza una fecha a formato YYYY-MM-DD sin problemas de zona horaria
 * @param {string|Date} fecha - Fecha a normalizar
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const normalizarFecha = (fecha) => {
  if (!fecha) return null
  
  if (typeof fecha === 'string') {
    // Extraer solo la parte de la fecha sin la hora
    return fecha.split('T')[0].split(' ')[0]
  }
  
  if (fecha instanceof Date) {
    // Usar métodos locales para evitar problemas de zona horaria
    const año = fecha.getFullYear()
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const dia = String(fecha.getDate()).padStart(2, '0')
    return `${año}-${mes}-${dia}`
  }
  
  return fecha
}

/**
 * Parsea una fecha de forma segura sin problemas de zona horaria
 * Usa el constructor local en lugar de interpretar como UTC
 * @param {string|Date} fechaStr - Fecha a parsear
 * @returns {Date|null} Objeto Date parseado o null si no es válida
 */
export const parsearFechaSegura = (fechaStr) => {
  if (!fechaStr) return null
  
  // Si ya es un Date, retornarlo
  if (fechaStr instanceof Date) {
    return fechaStr
  }
  
  // Extraer solo la parte de la fecha
  const fechaParte = typeof fechaStr === 'string' ? fechaStr.split('T')[0].split(' ')[0] : fechaStr
  
  // Intentar parsear como YYYY-MM-DD
  const partes = fechaParte.split('-')
  if (partes.length === 3) {
    const año = parseInt(partes[0], 10)
    const mes = parseInt(partes[1], 10) - 1 // Los meses en JS son 0-indexed
    const dia = parseInt(partes[2], 10)
    
    // Validar que sean números válidos
    if (isNaN(año) || isNaN(mes) || isNaN(dia)) {
      return null
    }
    
    // Crear fecha usando constructor local (evita problemas de zona horaria)
    return new Date(año, mes, dia)
  }
  
  // Fallback: intentar parsear normalmente
  const fecha = new Date(fechaStr)
  return isNaN(fecha.getTime()) ? null : fecha
}

/**
 * Formatea una fecha para mostrar al usuario
 * @param {string|Date} fecha - Fecha a formatear
 * @param {Object} opciones - Opciones de formato (locale, formato, etc.)
 * @returns {string} Fecha formateada
 */
export const formatearFecha = (fecha, opciones = {}) => {
  if (!fecha) return opciones.valorPorDefecto || '—'
  
  const fechaDate = fecha instanceof Date ? fecha : parsearFechaSegura(fecha)
  if (!fechaDate) return opciones.valorPorDefecto || '—'
  
  const {
    locale = 'es-SV',
    formato = 'completo' // 'completo', 'corto', 'solo-fecha'
  } = opciones
  
  if (formato === 'completo') {
    return fechaDate.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  if (formato === 'corto') {
    return fechaDate.toLocaleDateString(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }
  
  if (formato === 'solo-fecha') {
    return fechaDate.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  return fechaDate.toLocaleDateString(locale)
}

/**
 * Extrae solo la parte de la fecha de un string ISO o Date
 * Útil para inputs type="date" que requieren formato YYYY-MM-DD
 * @param {string|Date} fecha - Fecha a extraer
 * @returns {string} Fecha en formato YYYY-MM-DD o string vacío
 */
export const extraerFechaParaInput = (fecha) => {
  if (!fecha) return ''
  
  if (typeof fecha === 'string') {
    // Si viene como string con T o espacio, tomar solo la parte de la fecha
    return fecha.split('T')[0].split(' ')[0]
  }
  
  if (fecha instanceof Date) {
    return normalizarFecha(fecha)
  }
  
  return ''
}

/**
 * Compara dos fechas ignorando la hora
 * @param {string|Date} fecha1 - Primera fecha
 * @param {string|Date} fecha2 - Segunda fecha
 * @returns {number} -1 si fecha1 < fecha2, 0 si son iguales, 1 si fecha1 > fecha2
 */
export const compararFechas = (fecha1, fecha2) => {
  const fecha1Str = normalizarFecha(fecha1)
  const fecha2Str = normalizarFecha(fecha2)
  
  if (fecha1Str < fecha2Str) return -1
  if (fecha1Str > fecha2Str) return 1
  return 0
}

/**
 * Verifica si una fecha está dentro de un rango
 * @param {string|Date} fecha - Fecha a verificar
 * @param {string|Date} fechaInicio - Fecha de inicio del rango
 * @param {string|Date} fechaFin - Fecha de fin del rango
 * @returns {boolean} true si la fecha está en el rango
 */
export const fechaEnRango = (fecha, fechaInicio, fechaFin) => {
  const fechaStr = normalizarFecha(fecha)
  const inicioStr = normalizarFecha(fechaInicio)
  const finStr = normalizarFecha(fechaFin)
  
  return fechaStr >= inicioStr && fechaStr <= finStr
}

