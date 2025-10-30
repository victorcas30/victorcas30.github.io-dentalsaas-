# 🔄 Sistema de Refresh Token - DentalSaaS

## 📋 Descripción

Sistema automático de renovación de tokens JWT que mantiene la sesión del usuario activa sin interrupciones.

## 🎯 Características Implementadas

### 1. **Refresh Automático Reactivo** (401 Interceptor)
- Intercepta todas las peticiones que retornan 401
- Refresca el token automáticamente
- Reintenta la petición original con el nuevo token
- Maneja cola de peticiones durante el refresh

### 2. **Refresh Proactivo** (Hook)
- Verifica cada minuto el estado del token
- Refresca antes de que expire (5 minutos antes)
- Evita interrupciones en la experiencia del usuario

### 3. **Gestión de Errores**
- Logout automático si el refresh falla
- Limpieza completa de localStorage
- Redirección al login

## 📁 Archivos Modificados/Creados

```
src/
├── config/
│   └── api.js                      ✅ Actualizado con interceptor 401
├── services/
│   └── authService.js              ✅ Mejorado con funciones de refresh
├── hooks/
│   └── useTokenRefresh.js          ✨ NUEVO - Hook de refresh proactivo
├── components/
│   ├── layout/
│   │   └── HorizontalLayout.jsx    ✅ Integrado useTokenRefresh
│   └── TokenStatus.jsx             ✨ NUEVO - Indicador visual (dev)
```

## 🔧 Implementación

### 1. API Config (src/config/api.js)

**Interceptor 401:**
```javascript
// Si recibe 401, intenta refrescar el token
if (response.status === 401) {
  const newToken = await refreshAccessToken()
  // Reintenta la petición con el nuevo token
  config.headers.Authorization = `Bearer ${newToken}`
  return fetch(url, config)
}
```

**Sistema de Cola:**
```javascript
// Evita múltiples refresh simultáneos
let isRefreshing = false
let failedQueue = []

// Encola peticiones mientras se refresca
if (isRefreshing) {
  return new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject })
  })
}
```

### 2. Auth Service (src/services/authService.js)

**Función de Refresh:**
```javascript
async refreshToken() {
  const refreshToken = this.getRefreshToken()
  
  const response = await apiFetch('auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  })
  
  const data = await response.json()
  localStorage.setItem('token', data.accessToken)
  return data.accessToken
}
```

**Verificación de Expiración:**
```javascript
isTokenExpiringSoon() {
  const token = this.getToken()
  const payload = JSON.parse(atob(token.split('.')[1]))
  const exp = payload.exp * 1000
  const now = Date.now()
  
  // Retorna true si expira en menos de 5 minutos
  return (exp - now) < 5 * 60 * 1000
}
```

### 3. Hook de Refresh (src/hooks/useTokenRefresh.js)

**Verificación Periódica:**
```javascript
export function useTokenRefresh() {
  useEffect(() => {
    const checkAndRefreshToken = async () => {
      if (authService.isTokenExpiringSoon()) {
        await authService.refreshToken()
      }
    }
    
    // Verificar cada 1 minuto
    const interval = setInterval(checkAndRefreshToken, 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])
}
```

### 4. Integración en Layout

```javascript
export default function HorizontalLayout({ children }) {
  // Activa el refresh automático
  useTokenRefresh()
  
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  )
}
```

## 🚀 Cómo Funciona

### Escenario 1: Token Expira Durante una Petición

```
1. Usuario hace una petición (ej: GET /usuarios)
2. Token está expirado → Backend retorna 401
3. apiFetch intercepta el 401
4. Llama automáticamente a /auth/refresh
5. Guarda el nuevo accessToken
6. Reintenta la petición original con el nuevo token
7. Usuario recibe la respuesta sin darse cuenta
```

### Escenario 2: Token Por Expirar (Proactivo)

```
1. useTokenRefresh se ejecuta cada 1 minuto
2. Verifica si el token expira en < 5 minutos
3. Si es así, refresca el token automáticamente
4. Usuario continúa trabajando sin interrupciones
```

### Escenario 3: Refresh Falla

```
1. Intenta refrescar el token
2. Backend retorna error (401/403)
3. authService detecta el fallo
4. Limpia localStorage
5. Redirige automáticamente a /login
6. Usuario ve un mensaje limpio de sesión expirada
```

## 📊 API Endpoint Usado

**POST /auth/refresh**

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**
- `401` - Token no proporcionado
- `403` - Token inválido o caducado
- `429` - Demasiadas solicitudes

## 🎨 Componente de Debug (Opcional)

**TokenStatus** - Muestra tiempo restante del token

```javascript
// Agregar al layout para ver el estado (solo en desarrollo)
import TokenStatus from '@/components/TokenStatus'

return (
  <>
    {children}
    <TokenStatus />
  </>
)
```

## ✅ Beneficios

1. **Transparente** - El usuario no nota nada
2. **Seguro** - Tokens de corta duración
3. **Eficiente** - Refresca solo cuando es necesario
4. **Robusto** - Maneja errores automáticamente
5. **Sin Interrupciones** - Experiencia fluida

## 🔒 Seguridad

- ✅ Tokens de acceso de corta duración
- ✅ Refresh tokens seguros y renovables
- ✅ Logout automático ante fallos
- ✅ Limpieza completa de datos sensibles
- ✅ No expone tokens en logs

## 📝 Notas Importantes

1. **Refresh Token** se guarda en localStorage
   - Considera usar httpOnly cookies para mayor seguridad en producción

2. **Verificación cada 1 minuto**
   - Ajustable según necesidades (cambiar en useTokenRefresh.js)

3. **Ventana de 5 minutos**
   - Refresca si expira en menos de 5 min
   - Ajustable en authService.isTokenExpiringSoon()

4. **Cola de Peticiones**
   - Evita múltiples refreshes simultáneos
   - Reintenta todas las peticiones pendientes

## 🧪 Testing

**Probar el sistema:**

```javascript
// 1. Login normal
await authService.login(email, password)

// 2. Esperar a que el token esté por expirar
// (o modificar temporalmente el tiempo de expiración)

// 3. Hacer una petición
const usuarios = await usuariosService.listarPorClinica()

// 4. Verificar en DevTools:
// - Network → Ver llamada a /auth/refresh
// - Application → localStorage → Ver nuevo token
// - Console → Ver logs de refresh

// 5. Verificar que la petición original se completó exitosamente
```

## 🎯 Estado: ✅ COMPLETADO

El sistema de refresh token está completamente implementado y funcionando.

---

**Última actualización:** Octubre 2025
**Versión:** 1.0
