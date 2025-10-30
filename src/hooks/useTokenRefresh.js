'use client'

import { useEffect, useRef } from 'react'
import { authService } from '@/services/authService'

/**
 * Hook para manejar el refresh automático del token
 * Verifica cada minuto si el token está por expirar y lo refresca automáticamente
 */
export function useTokenRefresh() {
  const intervalRef = useRef(null)

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return

    const checkAndRefreshToken = async () => {
      try {
        // Verificar si hay sesión activa
        if (!authService.isAuthenticated()) {
          return
        }

        // Verificar si el token está por expirar
        if (authService.isTokenExpiringSoon()) {
          console.log('🔄 Token por expirar, refrescando...')
          await authService.refreshToken()
          console.log('✅ Token refrescado exitosamente')
        }
      } catch (error) {
        console.error('❌ Error al refrescar token automáticamente:', error)
        // El authService.refreshToken() ya maneja el logout si falla
      }
    }

    // Verificar inmediatamente al montar
    checkAndRefreshToken()

    // Verificar cada 1 minuto
    intervalRef.current = setInterval(checkAndRefreshToken, 60 * 1000)

    // Limpiar interval al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])
}
