# 📋 Menú Dinámico desde API

## ✅ **Implementación Completada**

El menú ahora se genera dinámicamente desde los módulos y rutas que vienen del API de login.

---

## 🎯 **Cómo Funciona**

### 1. **Al hacer Login**
El API devuelve los módulos y rutas del usuario:

```json
{
  "modulos": [
    {
      "id_modulo": 2,
      "modulo": "Configuración",
      "modulo_descripcion": "Configuraciones del sistema",
      "rutas": [
        {
          "id_ruta": 1,
          "nombre": "Horarios",
          "path": "/horarios",
          "descripcion": "Configuración de horarios de la clínica"
        },
        ...
      ]
    }
  ]
}
```

### 2. **Se Guarda en localStorage**
```javascript
localStorage.setItem('modulos', JSON.stringify(data.modulos))
```

### 3. **El Menú se Genera Automáticamente**
- Lee los módulos desde localStorage
- Crea un dropdown por cada módulo
- Cada dropdown contiene las rutas del módulo
- Los iconos se asignan automáticamente según el nombre

---

## 🎨 **Estructura del Menú**

```
┌─────────────────────────────────────────┐
│  🦷 DentalSaaS    👤 Victor Castillo   │
├─────────────────────────────────────────┤
│ Dashboard | Configuración ▼ | ...       │
│             ├─ Horarios                 │
│             ├─ Usuarios y permisos      │
│             ├─ Plantillas de mensajes   │
│             ├─ Políticas de descuento   │
│             └─ Información de la clínica│
└─────────────────────────────────────────┘
```

---

## 📱 **Características**

### Desktop
- ✅ Dashboard siempre visible
- ✅ Cada módulo es un dropdown
- ✅ Al hacer hover, se muestra el submenu
- ✅ Iconos automáticos por módulo y ruta
- ✅ Ruta activa se resalta

### Móvil (Offcanvas)
- ✅ Dashboard al inicio
- ✅ Módulos agrupados con título
- ✅ Rutas indentadas debajo de cada módulo
- ✅ Iconos en cada ruta
- ✅ Botón de logout al final

---

## 🎨 **Iconos Automáticos**

### Por Módulo:
```javascript
{
  'Configuración': 'ti ti-settings',
  'Pacientes': 'ti ti-users',
  'Citas': 'ti ti-calendar',
  'Tratamientos': 'ti ti-dental',
  'Facturación': 'ti ti-file-invoice',
  'Reportes': 'ti ti-chart-bar',
  'Inventario': 'ti ti-package'
}
```

### Por Ruta:
```javascript
{
  'Horarios': 'ti ti-clock',
  'Usuarios y permisos': 'ti ti-user-shield',
  'Plantillas de mensajes': 'ti ti-message',
  'Políticas de descuento': 'ti ti-discount',
  'Información de la clinica': 'ti ti-building-hospital'
}
```

Si no encuentra el icono, usa uno por defecto.

---

## 🔧 **Agregar Más Iconos**

### Para un Nuevo Módulo:
Edita `HorizontalSidebar.js`:

```javascript
function getModuloIcon(nombreModulo) {
  const iconMap = {
    'Configuración': 'ti ti-settings',
    'TuNuevoModulo': 'ti ti-tu-icono', // ← Agregar aquí
    ...
  }
  return iconMap[nombreModulo] || 'ti ti-folder'
}
```

### Para una Nueva Ruta:
Edita ambos archivos (`HorizontalSidebar.js` y `HorizontalHeader.js`):

```javascript
function getRutaIcon(nombreRuta) {
  const iconMap = {
    'Horarios': 'ti ti-clock',
    'TuNuevaRuta': 'ti ti-tu-icono', // ← Agregar aquí
    ...
  }
  return iconMap[nombreRuta] || 'ti ti-point'
}
```

---

## 📝 **Iconos Disponibles**

Puedes usar cualquier icono de **Tabler Icons**:
https://tabler-icons.io/

Ejemplos:
- `ti ti-users` - Usuarios
- `ti ti-calendar` - Calendario
- `ti ti-settings` - Configuración
- `ti ti-file` - Archivo
- `ti ti-chart-bar` - Gráfica
- `ti ti-dental` - Dental
- `ti ti-clock` - Reloj
- `ti ti-message` - Mensaje
- `ti ti-discount` - Descuento

---

## 🧪 **Cómo Probar**

### 1. **Inicia Sesión**
```
http://localhost:3000/login
```

### 2. **Verifica el Menú**
- Deberías ver "Dashboard"
- Deberías ver "Configuración" con un dropdown
- Al hacer hover o click, se despliegan las 5 rutas

### 3. **En Móvil**
- Abre el menú hamburguesa
- Deberías ver:
  - Dashboard
  - CONFIGURACIÓN (título)
    - Horarios
    - Usuarios y permisos
    - Plantillas de mensajes
    - Políticas de descuento
    - Información de la clínica

### 4. **Verificar localStorage**
F12 → Application → Local Storage → `modulos`

Deberías ver el JSON con tus módulos y rutas.

---

## 🔄 **Actualizar Menú**

El menú se actualiza automáticamente:
1. Cada vez que haces login
2. Los datos vienen del API
3. Se guardan en localStorage
4. El componente los lee y genera el menú

**Para actualizar el menú:**
- Haz logout
- Vuelve a hacer login
- El menú se regenerará con los nuevos datos

---

## 🎯 **Rutas Protegidas**

Todas las rutas que crees estarán automáticamente protegidas si usas `HorizontalLayout`:

```javascript
// Ejemplo: crear /horarios/page.js
import HorizontalLayout from '@/components/layout/HorizontalLayout'

export default function Horarios() {
  return (
    <HorizontalLayout>
      <h1>Configuración de Horarios</h1>
      {/* Tu contenido aquí */}
    </HorizontalLayout>
  )
}
```

---

## 🔑 **Permisos por Usuario**

El menú se adapta automáticamente según el usuario:
- **Admin** → Ve todos los módulos
- **Usuario normal** → Solo ve sus módulos asignados
- **Rol específico** → Solo ve módulos de su rol

Todo esto lo controla el backend en la respuesta del login.

---

## 📦 **Archivos Modificados**

1. **HorizontalSidebar.js**
   - Ahora lee módulos desde localStorage
   - Genera dropdowns dinámicamente
   - Asigna iconos automáticamente

2. **HorizontalHeader.js**
   - Menú móvil dinámico
   - Lee módulos desde localStorage
   - Agrupa rutas por módulo

3. **horizontal-styles.css**
   - Estilos para dropdowns
   - Hover effects
   - Active states

---

## ✨ **Resultado Final**

```
LOGIN (/login)
  ↓
API devuelve módulos y rutas
  ↓
Se guardan en localStorage
  ↓
Menú se genera automáticamente
  ↓
Usuario ve solo sus módulos asignados
  ↓
Click en módulo → despliega rutas
  ↓
Click en ruta → navega a la página
```

---

## 🎉 **¡Listo!**

Tu menú ahora es completamente dinámico y se adapta a cada usuario según los permisos que tenga en el sistema.

**Para probar:**
1. Recarga: `Ctrl + Shift + R`
2. Haz login
3. Verifica que el menú "Configuración" tiene dropdown
4. Verifica que aparecen las 5 rutas

---

**¡Menú dinámico implementado con éxito! 🚀**
