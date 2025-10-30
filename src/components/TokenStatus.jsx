'use client'

import { useState, useEffect } from 'react'
import { authService } from '@/services/authService'

/**
 * Componente para mostrar el estado del token (solo en desarrollo)
 * Muestra cuánto tiempo falta para que expire el token
 */
export default function TokenStatus() {
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [isExpiringSoon, setIsExpiringSoon] = useState(false)

  useEffect(() => {
    const updateTokenStatus = () => {
      try {
        const token = authService.getToken()
        if (!token) {
          setTimeRemaining(null)
          return
        }

        // Decodificar el token
        const payload = JSON.parse(atob(token.split('.')[1]))
        const exp = payload.exp * 1000
        const now = Date.now()
        const remaining = exp - now

        if (remaining <= 0) {
          setTimeRemaining('Expirado')
          setIsExpiringSoon(true)
        } else {
          const minutes = Math.floor(remaining / 60000)
          const seconds = Math.floor((remaining % 60000) / 1000)
          setTimeRemaining(`${minutes}m ${seconds}s`)
          setIsExpiringSoon(remaining < 5 * 60 * 1000) // Menos de 5 minutos
        }
      } catch (error) {
        setTimeRemaining('Error')
      }
    }

    updateTokenStatus()
    const interval = setInterval(updateTokenStatus, 1000)

    return () => clearInterval(interval)
  }, [])

  // No mostrar en producción
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  if (!timeRemaining) return null

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 15px',
        backgroundColor: isExpiringSoon ? '#ff9800' : '#4caf50',
        color: 'white',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 'bold',
        zIndex: 9999,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        userSelect: 'none'
      }}
      title="Token expira en"
    >
      🔑 Token: {timeRemaining}
    </div>
  )
}
