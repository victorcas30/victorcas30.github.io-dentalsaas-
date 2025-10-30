# 🔐 Integración de Login con Backend

## ✅ **Integración Completada**

Se ha integrado el sistema de login con tu API backend en Railway.

---

## 📡 **API Configurada**

**Endpoint:** `https://backenddentalsaas-production.up.railway.app/dental_saas/api/v1/auth/login`

**Método:** POST

**Body:**
```json
{
  "email": "",
  "password": ""
}
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "usuario": {
    "id_usuario": 3,
    "id_clinica": 1,
    "nombre": "Victor Castillo",
    "email": "vcastillo.mancia@gmail.com",
    "rol": "Admin",
    "clinica": "Clínica Dental Demo",
    "default_home": 1
  },
  "modulos": [...],
  "token": "...",
  "refreshToken": "..."
}
```

---

## 🗂️ **Archivos Creados**

### 1. **Servicio de Autenticación**
`src/services/authService.js`
- ✅ Función `login(email, password)`
- ✅ Función `logout()`
- ✅ Función `isAuthenticated()`
- ✅ Función `getToken()`
- ✅ Función `getCurrentUser()`
- ✅ Función `getModulos()`
- ✅ Función `refreshToken()`
- ✅ Helper `fetchWithAuth()` para peticiones autenticadas

### 2. **Componente ProtectedRoute**
`src/components/ProtectedRoute.js`
- ✅ Protege rutas que requieren autenticación
- ✅ Redirige a /login si no está autenticado
- ✅ Muestra spinner mientras verifica sesión

### 3. **Login Actualizado**
`src/app/login/page.js`
- ✅ Integrado con API real
- ✅ Manejo de errores
- ✅ Loading state con spinner
- ✅ Mensajes de error visuales
- ✅ Guarda token y datos del usuario en localStorage

### 4. **Layout Protegido**
`src/components/layout/HorizontalLayout.js`
- ✅ Usa ProtectedRoute
- ✅ Carga datos del usuario
- ✅ Pasa datos al Header

### 5. **Header Actualizado**
`src/components/layout/HorizontalHeader.js`
- ✅ Muestra nombre real del usuario
- ✅ Muestra rol del usuario
- ✅ Muestra email del usuario
- ✅ Botón de logout funcional

---

## 🔒 **Datos Guardados en localStorage**

Después de un login exitoso, se guardan:

```javascript
localStorage.setItem('token', data.token)
localStorage.setItem('refreshToken', data.refreshToken)
localStorage.setItem('usuario', JSON.stringify(data.usuario))
localStorage.setItem('modulos', JSON.stringify(data.modulos))
```

---

## 🚀 **Cómo Probar**

### 1. **Ir al Login**
```
http://localhost:3000/login
```

### 2. **Ingresar Credenciales**
Usa las credenciales de tu sistema:
- Email: `vcastillo.mancia@gmail.com`
- Password: Tu contraseña

### 3. **Verificar**
- ✅ Debería mostrar spinner mientras carga
- ✅ Si las credenciales son correctas, redirige al dashboard
- ✅ Si son incorrectas, muestra mensaje de error en rojo
- ✅ En el dashboard, deberías ver tu nombre real en el header

### 4. **Verificar localStorage**
Abre DevTools (F12) → Application → Local Storage → localhost:3000

Deberías ver:
- `token`
- `refreshToken`
- `usuario`
- `modulos`

### 5. **Probar Logout**
- Haz clic en tu avatar en el header
- Click en "Cerrar Sesión"
- Debería limpiar localStorage y redirigir a /login

---

## 🔄 **Flujo de Autenticación**

```
1. Usuario ingresa email y password
   ↓
2. Click en "Iniciar Sesión"
   ↓
3. Se muestra spinner "Iniciando sesión..."
   ↓
4. POST a la API con credenciales
   ↓
5a. Si es exitoso:
    - Guarda token, refreshToken, usuario, módulos
    - Redirige a /
    
5b. Si falla:
    - Muestra mensaje de error
    - Permite reintentar
```

---

## 🛡️ **Protección de Rutas**

Todas las páginas que usen `HorizontalLayout` o `DashboardLayout` están protegidas:

```javascript
// Esto ya está protegido automáticamente
<HorizontalLayout>
  {/* Tu contenido aquí */}
</HorizontalLayout>
```

Si el usuario no está autenticado:
1. Se muestra spinner "Verificando sesión..."
2. Se redirige automáticamente a /login

---

## 🔑 **Obtener Datos del Usuario**

En cualquier componente:

```javascript
import { authService } from '@/services/authService'

// Obtener usuario actual
const usuario = authService.getCurrentUser()
console.log(usuario.nombre) // "Victor Castillo"
console.log(usuario.email) // "vcastillo.mancia@gmail.com"
console.log(usuario.rol) // "Admin"

// Obtener módulos y rutas
const modulos = authService.getModulos()
console.log(modulos) // Array de módulos con rutas

// Verificar si está autenticado
const estaAutenticado = authService.isAuthenticated()

// Obtener token
const token = authService.getToken()
```

---

## 📡 **Hacer Peticiones Autenticadas**

Para hacer peticiones a otras APIs protegidas:

```javascript
import { fetchWithAuth } from '@/services/authService'

// Ejemplo: Obtener pacientes
const getPacientes = async () => {
  const response = await fetchWithAuth(
    'https://backenddentalsaas-production.up.railway.app/dental_saas/api/v1/pacientes'
  )
  const data = await response.json()
  return data
}
```

El `fetchWithAuth`:
- ✅ Agrega automáticamente el header `Authorization: Bearer TOKEN`
- ✅ Si el token expiró (401), intenta renovarlo automáticamente
- ✅ Si falla la renovación, hace logout

---

## ⚠️ **Manejo de Errores**

### Error de Credenciales Incorrectas
```javascript
// Se muestra en pantalla:
"Email o contraseña incorrectos"
```

### Error de Red
```javascript
// Se muestra en consola y en pantalla:
"Error en el login"
```

### Token Expirado
- Se intenta renovar automáticamente con refreshToken
- Si falla, hace logout y redirige a /login

---

## 🎨 **Personalización**

### Cambiar URL del API
Edita `src/services/authService.js`:

```javascript
const API_BASE_URL = 'TU_NUEVA_URL'
```

### Agregar Más Datos al localStorage
En `src/services/authService.js` → función `login()`:

```javascript
if (data.success) {
  localStorage.setItem('token', data.token)
  localStorage.setItem('tus_datos', JSON.stringify(data.tus_datos))
}
```

---

## 🐛 **Solución de Problemas**

### Error: CORS
Si ves errores de CORS en la consola, el backend debe permitir peticiones desde `http://localhost:3000`

### No redirige después del login
1. Abre DevTools (F12) → Console
2. Busca errores
3. Verifica que el token se guardó en localStorage

### Muestra "Verificando sesión..." indefinidamente
1. Limpia localStorage: DevTools → Application → Clear storage
2. Recarga la página
3. Intenta hacer login de nuevo

### El nombre no aparece en el header
1. Verifica que el login fue exitoso
2. Abre DevTools → Application → Local Storage
3. Verifica que existe la key `usuario`
4. Recarga la página

---

## ✅ **Checklist de Verificación**

- [ ] El login muestra el formulario correctamente
- [ ] Al ingresar credenciales incorrectas, muestra error
- [ ] Al ingresar credenciales correctas, muestra spinner
- [ ] Después del login exitoso, redirige al dashboard
- [ ] En el dashboard, se ve el nombre real del usuario
- [ ] localStorage contiene: token, refreshToken, usuario, modulos
- [ ] Al hacer clic en "Cerrar Sesión", limpia todo y va a /login
- [ ] Si intentas ir a / sin estar autenticado, te redirige a /login

---

## 🎉 **¡Listo!**

Tu sistema de login está completamente integrado con el backend.

**Credenciales de prueba:**
- Email: `vcastillo.mancia@gmail.com`
- Password: [Tu contraseña]

**Para probar:**
```bash
# 1. Asegúrate que el servidor está corriendo
npm run dev

# 2. Abre el navegador
http://localhost:3000/login

# 3. Ingresa tus credenciales

# 4. Verifica que funciona todo
```

---

**¡Tu login está funcionando con el backend real! 🚀**
