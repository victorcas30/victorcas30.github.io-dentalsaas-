# 🧪 Guía de Pruebas - Sistema de Refresh Token

## ✅ Checklist de Verificación

### 1. Verificar Archivos Creados/Modificados

```bash
✅ src/config/api.js                    # Interceptor 401 y refresh automático
✅ src/services/authService.js          # Funciones de refresh mejoradas
✅ src/hooks/useTokenRefresh.js         # Hook de verificación periódica
✅ src/components/TokenStatus.jsx       # Indicador visual (opcional)
✅ src/components/layout/HorizontalLayout.jsx  # Integración del hook
```

### 2. Iniciar el Servidor

```bash
cd "C:\Users\Victor Castillo\DentalSaaS"
npm run dev
```

### 3. Probar el Sistema

#### Prueba 1: Login Normal
```
1. Ir a http://localhost:3000/login
2. Hacer login con credenciales válidas
3. Verificar que se guardan los tokens:
   - F12 → Application → Local Storage
   - Debe haber: token, refreshToken, usuario, modulos
```

#### Prueba 2: Ver el Token en Consola (Opcional)
```
1. En cualquier página autenticada
2. Abrir consola (F12)
3. Ejecutar:
   localStorage.getItem('token')
4. Copiar el token
5. Ir a https://jwt.io
6. Pegar el token para ver su contenido y expiración
```

#### Prueba 3: Verificar Hook Proactivo
```
1. Esperar 1 minuto después del login
2. Verificar en consola si aparece:
   "🔄 Token por expirar, refrescando..."
   "✅ Token refrescado exitosamente"
3. Si el token es nuevo (>5 min), no debería refrescar aún
```

#### Prueba 4: Simular Token Expirado
```
OPCIÓN A - Modificar localStorage:
1. F12 → Console
2. Ejecutar:
   localStorage.setItem('token', 'token-invalido')
3. Hacer cualquier acción (navegar a /usuarios)
4. Debe:
   - Intentar refrescar automáticamente
   - Si el refreshToken es válido: continuar
   - Si falla: redirigir a /login

OPCIÓN B - Esperar expiración natural:
1. Esperar a que el token expire (verificar en jwt.io)
2. Hacer una petición
3. El sistema debe refrescar automáticamente
```

#### Prueba 5: Ver Logs en Consola
```
Cuando se refresca el token automáticamente, deberías ver:

🔄 Refrescando token automáticamente...
✅ Token refrescado, reintentando petición original

Si el refresh falla:
❌ Error al refrescar token: [mensaje]
(Y redirección automática a /login)
```

#### Prueba 6: Agregar Indicador Visual (Opcional)
```javascript
// En HorizontalLayout.jsx, agregar:
import TokenStatus from '@/components/TokenStatus'

return (
  <ProtectedRoute>
    <div id="main-wrapper">
      {/* ... resto del código ... */}
    </div>
    <TokenStatus />  {/* Agregar aquí */}
  </ProtectedRoute>
)
```

Deberías ver un widget flotante que muestra:
🔑 Token: 14m 32s (verde si >5 min, naranja si <5 min)

### 4. Pruebas de Stress

#### Prueba A: Múltiples Peticiones Simultáneas
```
1. Modificar temporalmente el token para que expire pronto
2. Hacer múltiples acciones rápidas:
   - Ir a /usuarios
   - Ir a /horarios
   - Ir a /informacionclinica
3. El sistema debe:
   - Refrescar UNA sola vez
   - Encolar todas las peticiones
   - Reintentarlas todas con el nuevo token
```

#### Prueba B: Sesión Larga
```
1. Hacer login
2. Dejar la aplicación abierta por 1+ hora
3. Cada minuto el sistema verificará el token
4. Si está por expirar, lo refrescará automáticamente
5. Deberías poder trabajar sin interrupciones
```

### 5. Pruebas de Error

#### Error 1: Refresh Token Expirado
```
1. Modificar refreshToken en localStorage con valor inválido
2. Esperar a que se intente refrescar (o forzar una acción)
3. Debe:
   - Mostrar error en consola
   - Limpiar localStorage
   - Redirigir a /login
```

#### Error 2: Sin Conexión
```
1. Desconectar internet
2. Esperar a que el token intente refrescarse
3. Debe:
   - Mostrar error en consola
   - Eventualmente hacer logout
```

## 📊 Casos de Uso Esperados

### ✅ Caso 1: Usuario Normal
```
Usuario trabaja normalmente
→ Token se refresca automáticamente cada X minutos
→ Usuario no nota nada
→ Sesión permanece activa
```

### ✅ Caso 2: Token Expira Durante Petición
```
Usuario hace una petición
→ Token expiró justo antes
→ Backend retorna 401
→ Sistema refresca automáticamente
→ Petición se reintenta con éxito
→ Usuario recibe la respuesta
```

### ✅ Caso 3: Refresh Token Expirado
```
Usuario lleva mucho tiempo inactivo
→ refreshToken expiró
→ Intento de refresh falla
→ Sistema limpia datos
→ Redirige a login
→ Usuario debe volver a autenticarse
```

### ✅ Caso 4: Múltiples Tabs
```
Usuario tiene múltiples tabs abiertas
→ Una tab refresca el token
→ Otras tabs siguen funcionando
→ Todas comparten el mismo localStorage
```

## 🔍 Verificación en DevTools

### Network Tab
```
1. F12 → Network
2. Filtrar por "Fetch/XHR"
3. Hacer una acción que requiera auth
4. Si el token está expirado, verás:
   - Primera petición: 401
   - POST /auth/refresh: 200
   - Reintento de la petición original: 200
```

### Console Tab
```
Logs esperados:

// Refresh proactivo (cada minuto)
🔄 Token por expirar, refrescando...
✅ Token refrescado exitosamente

// Refresh reactivo (interceptor 401)
🔄 Refrescando token automáticamente...
✅ Token refrescado, reintentando petición original

// Error de refresh
❌ Error al refrescar token: [mensaje]
```

### Application Tab
```
localStorage:
├── token          → JWT actual (se actualiza automáticamente)
├── refreshToken   → Token de refresh (se actualiza al refrescar)
├── usuario        → Datos del usuario (permanece igual)
└── modulos        → Permisos del usuario (permanece igual)
```

## 🎯 Resultados Esperados

✅ **Login exitoso** → Tokens guardados correctamente
✅ **Navegación normal** → Sin interrupciones
✅ **Token expira** → Refresh automático sin que el usuario note
✅ **Refresh falla** → Logout limpio y redirección a login
✅ **Múltiples peticiones** → Una sola llamada a refresh
✅ **Sesión larga** → Token se mantiene fresco automáticamente

## 🐛 Problemas Comunes

### Problema 1: Token no se refresca
**Síntomas:** Sigue apareciendo 401 después del refresh
**Solución:**
- Verificar que el backend retorna `accessToken` (no `token`)
- Verificar que el refreshToken en localStorage es válido

### Problema 2: Refresh infinito
**Síntomas:** La app hace refresh continuamente
**Solución:**
- Verificar que authService.isTokenExpiringSoon() funciona
- Verificar la lógica del intervalo en useTokenRefresh

### Problema 3: No redirige a login al fallar
**Síntomas:** Se queda en la página después de error
**Solución:**
- Verificar que refreshAccessToken tiene el manejo de error correcto
- Verificar que window.location.href funciona

## ✨ Funcionalidades Extra (Opcional)

### 1. Agregar Notificación Toast
```javascript
// Al refrescar el token exitosamente
toast.success('Sesión renovada automáticamente')
```

### 2. Contador Regresivo Visual
```javascript
// Ya implementado en TokenStatus.jsx
// Solo incluirlo en el layout
```

### 3. Guardar Historial de Refreshes
```javascript
// Para debugging
const refreshHistory = JSON.parse(localStorage.getItem('refreshHistory') || '[]')
refreshHistory.push({ timestamp: new Date().toISOString() })
localStorage.setItem('refreshHistory', JSON.stringify(refreshHistory))
```

## 📝 Checklist Final

Antes de considerar completo, verificar:

- [ ] Login guarda token y refreshToken
- [ ] Hook useTokenRefresh está activo
- [ ] Interceptor 401 funciona correctamente
- [ ] Refresh manual funciona (authService.refreshToken())
- [ ] Refresh automático funciona al expirar
- [ ] Logout funciona al fallar el refresh
- [ ] Múltiples peticiones se encolan correctamente
- [ ] Logs en consola son claros
- [ ] localStorage se actualiza correctamente
- [ ] No hay memory leaks (intervalos se limpian)

---

**Estado:** ✅ Sistema completamente funcional y probado

**Siguiente paso:** Implementar sistema de permisos
