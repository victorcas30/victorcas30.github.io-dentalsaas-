// Configuración centralizada del API
const API_CONFIG = {
  // Base URL del API
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://backenddentalsaas-production.up.railway.app/dental_saas/api/v1',
  
  // Timeout para las peticiones (30 segundos)
  TIMEOUT: 30000,
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  }
}

// Variable para controlar si ya se está refrescando el token
let isRefreshing = false
let failedQueue = []

// Procesar la cola de peticiones fallidas después de refrescar el token
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

// Helper para construir URLs completas
export const buildUrl = (endpoint) => {
  // Si el endpoint ya tiene el protocolo, devolverlo tal cual
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint
  }
  
  // Remover slash inicial si existe
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  
  // Construir URL completa
  return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`
}

// Helper para construir rutas de la aplicación con basePath
export const buildAppRoute = (path) => {
  // Obtener el basePath de la variable de entorno
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  
  // Asegurar que el path comience con /
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  
  // Asegurar que el basePath no termine con /
  const cleanBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath
  
  // Construir la ruta completa
  return `${cleanBasePath}${cleanPath}`
}

// Helper para construir rutas de assets (imágenes, etc.) con basePath
export const buildAssetPath = (assetPath) => {
  // Obtener el basePath de la variable de entorno
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  
  // Asegurar que el path comience con /
  const cleanPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`
  
  // Asegurar que el basePath no termine con /
  const cleanBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath
  
  // Construir la ruta completa del asset
  return `${cleanBasePath}${cleanPath}`
}

// Helper para construir URL completa del frontend (con protocolo y dominio)
export const buildFrontendUrl = (path) => {
  if (typeof window === 'undefined') {
    // En el servidor, usar variable de entorno o valores por defecto
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    const isDev = process.env.NODE_ENV === 'development'
    const origin = isDev 
      ? 'http://localhost:3000'
      : 'https://victorcas30.github.io'
    
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    const cleanBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath
    
    return `${origin}${cleanBasePath}${cleanPath}`
  }
  
  // En el cliente, usar window.location.origin
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const cleanBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath
  
  return `${window.location.origin}${cleanBasePath}${cleanPath}`
}

// Helper para refrescar el token
const refreshAccessToken = async () => {
  try {
    if (typeof window === 'undefined') return null
    
    const refreshToken = localStorage.getItem('refreshToken')
    
    if (!refreshToken) {
      throw new Error('No hay refresh token disponible')
    }

    const response = await fetch(buildUrl('auth/refresh'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken })
    })

    if (!response.ok) {
      throw new Error('No se pudo refrescar el token')
    }

    const data = await response.json()
    
    if (data.accessToken) {
      localStorage.setItem('token', data.accessToken)
      return data.accessToken
    }
    
    throw new Error('Respuesta inválida del servidor')
  } catch (error) {
    console.error('❌ Error al refrescar token:', error)
    // Limpiar localStorage y redirigir al login
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('usuario')
    localStorage.removeItem('modulos')
    
    if (typeof window !== 'undefined') {
      window.location.href = buildAppRoute('/login/')
    }
    
    throw error
  }
}

// Helper para hacer peticiones fetch con configuración por defecto y auto-refresh
export const apiFetch = async (endpoint, options = {}) => {
  const url = buildUrl(endpoint)
  
  const config = {
    ...options,
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...options.headers,
    }
  }

  try {
    const response = await fetch(url, config)
    
    // Si la respuesta es 401 (no autorizado) y no es la ruta de login o refresh
    if (response.status === 401 && !endpoint.includes('auth/login') && !endpoint.includes('auth/refresh')) {
      
      if (isRefreshing) {
        // Si ya se está refrescando, agregar esta petición a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            // Reintentar la petición con el nuevo token
            config.headers.Authorization = `Bearer ${token}`
            return fetch(url, config)
          })
          .catch(err => {
            return Promise.reject(err)
          })
      }

      isRefreshing = true

      try {
        console.log('🔄 Refrescando token automáticamente...')
        
        // Intentar refrescar el token
        const newToken = await refreshAccessToken()
        
        console.log('✅ Token refrescado, reintentando petición original')
        
        // Procesar la cola de peticiones
        processQueue(null, newToken)
        
        isRefreshing = false
        
        // Reintentar la petición original con el nuevo token
        config.headers.Authorization = `Bearer ${newToken}`
        return fetch(url, config)
        
      } catch (refreshError) {
        processQueue(refreshError, null)
        isRefreshing = false
        throw refreshError
      }
    }
    
    return response
  } catch (error) {
    console.error('Error en apiFetch:', error)
    throw error
  }
}

export default API_CONFIG
