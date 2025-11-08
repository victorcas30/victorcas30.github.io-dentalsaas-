/**
 * Diccionario de iconos para módulos y rutas del menú
 * Basado en Tabler Icons (ti ti-*)
 */

// Diccionario de iconos para módulos
export const MODULO_ICONS = {
  'Configuración': 'ti ti-settings',
  'Pacientes': 'ti ti-users',
  'Citas': 'ti ti-calendar',
  'Tratamientos': 'ti ti-dental',
  'Facturación': 'ti ti-file-invoice',
  'Reportes': 'ti ti-chart-bar',
  'Inventario': 'ti ti-package',
  'Agenda': 'ti ti-calendar-event',
  'Clínica': 'ti ti-building-hospital',
  'Administración': 'ti ti-settings-cog',
  'Finanzas': 'ti ti-currency-dollar',
  'Recursos Humanos': 'ti ti-users-group',
  'Marketing': 'ti ti-speakerphone',
  'Comunicación': 'ti ti-message',
  'Seguridad': 'ti ti-shield-lock',
  'Sistema': 'ti ti-server',
  'Backup': 'ti ti-database',
  'Auditoría': 'ti ti-file-search',
  'Notificaciones': 'ti ti-bell',
  'Documentos': 'ti ti-files',
  'Estadísticas': 'ti ti-chart-line',
  'Dashboard': 'ti ti-layout-dashboard'
}

// Diccionario de iconos para rutas
export const RUTA_ICONS = {
  // Configuración
  'Horarios': 'ti ti-clock',
  'Usuarios y permisos': 'ti ti-user-shield',
  'Usuarios y Roles': 'ti ti-user-shield',
  'Plantillas de mensajes': 'ti ti-message',
  'Políticas de descuento': 'ti ti-discount',
  'Información de la clinica': 'ti ti-building-hospital',
  'Información de la clínica': 'ti ti-building-hospital',
  'Modulos': 'ti ti-layout-grid',
  'Módulos': 'ti ti-layout-grid',
  'Permisos': 'ti ti-lock-access',
  
  // Pacientes
  'Pacientes': 'ti ti-users',
  'Lista de pacientes': 'ti ti-list',
  'Nuevo paciente': 'ti ti-user-plus',
  'Historial': 'ti ti-history',
  'Documentos': 'ti ti-files',
  'Fotos': 'ti ti-photo',
  
  // Citas
  'Citas': 'ti ti-calendar',
  'Agendar cita': 'ti ti-calendar-plus',
  'Calendario': 'ti ti-calendar-event',
  'Recordatorios': 'ti ti-bell',
  
  // Tratamientos
  'Tratamientos': 'ti ti-dental',
  'Planes de tratamiento': 'ti ti-clipboard-list',
  'Catálogo': 'ti ti-package',
  'Presupuestos': 'ti ti-file-dollar',
  
  // Facturación
  'Facturación': 'ti ti-file-invoice',
  'Facturas': 'ti ti-receipt',
  'Pagos': 'ti ti-credit-card',
  'Métodos de pago': 'ti ti-credit-card',
  'Reportes financieros': 'ti ti-chart-bar',
  
  // Servicios y Clínica
  'Servicios': 'ti ti-medical-cross',
  'Especialidades': 'ti ti-stethoscope',
  'Doctores': 'ti ti-user-doctor',
  'Consultorios': 'ti ti-building',
  'Equipos': 'ti ti-tools',
  
  // Inventario
  'Inventario': 'ti ti-package',
  'Productos': 'ti ti-box',
  'Stock': 'ti ti-archive',
  'Proveedores': 'ti ti-truck',
  'Compras': 'ti ti-shopping-cart',
  
  // Reportes
  'Reportes': 'ti ti-chart-bar',
  'Estadísticas': 'ti ti-chart-line',
  'Gráficos': 'ti ti-chart-pie',
  'Exportar': 'ti ti-download',
  
  // Sistema
  'Usuarios': 'ti ti-users',
  'Roles': 'ti ti-user-shield',
  'Configuración': 'ti ti-settings',
  'Backup': 'ti ti-database',
  'Logs': 'ti ti-file-text',
  'Auditoría': 'ti ti-file-search',
  
  // Comunicación
  'Mensajes': 'ti ti-message',
  'Notificaciones': 'ti ti-bell',
  'Email': 'ti ti-mail',
  'WhatsApp': 'ti ti-brand-whatsapp',
  
  // General
  'Dashboard': 'ti ti-layout-dashboard',
  'Inicio': 'ti ti-home',
  'Ayuda': 'ti ti-help',
  'Soporte': 'ti ti-headset',
  'Perfil': 'ti ti-user',
  'Configuración de cuenta': 'ti ti-user-cog'
}

/**
 * Obtiene el icono para un módulo
 * @param {string} nombreModulo - Nombre del módulo
 * @returns {string} Clase CSS del icono
 */
export function getModuloIcon(nombreModulo) {
  if (!nombreModulo) return 'ti ti-folder'
  
  // Buscar coincidencia exacta
  if (MODULO_ICONS[nombreModulo]) {
    return MODULO_ICONS[nombreModulo]
  }
  
  // Buscar coincidencia parcial (case insensitive)
  const nombreLower = nombreModulo.toLowerCase()
  for (const [key, icon] of Object.entries(MODULO_ICONS)) {
    if (key.toLowerCase() === nombreLower) {
      return icon
    }
  }
  
  // Icono por defecto
  return 'ti ti-folder'
}

/**
 * Obtiene el icono para una ruta
 * @param {string} nombreRuta - Nombre de la ruta
 * @returns {string} Clase CSS del icono
 */
export function getRutaIcon(nombreRuta) {
  if (!nombreRuta) return 'ti ti-point'
  
  // Buscar coincidencia exacta
  if (RUTA_ICONS[nombreRuta]) {
    return RUTA_ICONS[nombreRuta]
  }
  
  // Buscar coincidencia parcial (case insensitive)
  const nombreLower = nombreRuta.toLowerCase()
  for (const [key, icon] of Object.entries(RUTA_ICONS)) {
    if (key.toLowerCase() === nombreLower) {
      return icon
    }
  }
  
  // Buscar por palabras clave
  const palabrasClave = {
    'usuario': 'ti ti-user',
    'rol': 'ti ti-user-shield',
    'permiso': 'ti ti-lock-access',
    'mensaje': 'ti ti-message',
    'plantilla': 'ti ti-file-text',
    'horario': 'ti ti-clock',
    'clinica': 'ti ti-building-hospital',
    'modulo': 'ti ti-layout-grid',
    'paciente': 'ti ti-users',
    'cita': 'ti ti-calendar',
    'tratamiento': 'ti ti-dental',
    'factura': 'ti ti-file-invoice',
    'pago': 'ti ti-credit-card',
    'reporte': 'ti ti-chart-bar',
    'inventario': 'ti ti-package',
    'servicio': 'ti ti-medical-cross',
    'configuración': 'ti ti-settings',
    'configuracion': 'ti ti-settings'
  }
  
  for (const [palabra, icon] of Object.entries(palabrasClave)) {
    if (nombreLower.includes(palabra)) {
      return icon
    }
  }
  
  // Icono por defecto
  return 'ti ti-point'
}

