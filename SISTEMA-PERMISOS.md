# 🔐 Sistema de Permisos (Rol-Rutas) - Implementación Completa

## ✅ Archivos Creados

```
✅ src/services/rolRutasService.js       # Servicio API para rol-rutas
✅ src/app/permisos/page.jsx             # Página de gestión de permisos
```

## ✅ Archivos Modificados

```
✅ src/services/rolesService.js          # Agregado método obtenerPorIdConRutas()
✅ src/components/layout/HorizontalSidebar.jsx  # Agregado link "Permisos"
```

## 🎯 Concepto de Diseño

Sistema visual e intuitivo para asignar permisos (rutas) a roles:

```
┌─────────────────────────────────────────────────┐
│  [Roles]     │     [Permisos del Rol]           │
│  ──────────  │  ─────────────────────────────   │
│  ✓ Admin     │  Módulo: Configuración           │
│    Doctor    │    ☑ Horarios      /horarios     │
│    Recep.    │    ☑ Usuarios      /usuarios     │
│              │  Módulo: Pacientes               │
│              │    ☐ Listado       /pacientes    │
└─────────────────────────────────────────────────┘
```

## 📋 Funcionalidades Implementadas

### 1. **Selección de Rol**
- Lista de roles en sidebar izquierdo
- Click en rol muestra sus permisos
- Rol seleccionado destacado en azul

### 2. **Visualización de Permisos**
- Permisos agrupados por módulo
- Cada ruta con checkbox
- Muestra: nombre, path, descripción
- Rutas inactivas deshabilitadas

### 3. **Asignar/Quitar Permiso Individual**
- Click en checkbox de ruta
- Toggle automático (agregar/quitar)
- SweetAlert2 de confirmación
- Actualización instantánea

### 4. **Seleccionar Todas las Rutas de un Módulo**
- Checkbox "Todas" en header del módulo
- Asigna/quita todas las rutas del módulo
- Estado indeterminado si solo algunas están asignadas
- Operación en batch

### 5. **Estados Visuales**
- Ruta asignada: checkbox marcado + borde azul
- Ruta no asignada: checkbox vacío
- Ruta inactiva: deshabilitada + badge rojo
- Módulo completo: checkbox principal marcado
- Módulo parcial: checkbox indeterminado

## 🔧 API Endpoints Usados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/rol-rutas/adddeleterolruta` | Agregar o eliminar ruta de rol según activo |
| DELETE | `/rol-rutas/{id_rol}/{id_ruta}` | Eliminar ruta de rol (hard delete) |

## 📱 Servicio rolRutasService

```javascript
// Toggle ruta (asignar si activo=1, quitar si activo=0)
rolRutasService.toggleRutaRol(idRol, idRuta, activo)

// Asignar múltiples rutas a un rol
rolRutasService.asignarMultiplesRutas(idRol, [idRuta1, idRuta2, ...])

// Eliminar ruta de rol (hard delete)
rolRutasService.eliminarRutaRol(idRol, idRuta)
```

## 🎯 Formato de Petición

### POST /rol-rutas/adddeleterolruta

```json
{
  "activo": "1",        // "1" = asignar, "0" = eliminar
  "rol_ruta": [1, 5]    // [id_rol, id_ruta]
}
```

### Respuesta (200)

```json
{
  "success": true,
  "message": "Ruta asignada al rol correctamente",
  "data": {
    "action": "inserted",  // o "deleted"
    "activo": "1",
    "registro": {
      "id_rol": 1,
      "id_ruta": 5
    }
  }
}
```

## 🎨 Diseño Visual

### Layout de la Página

```
┌────────────────────────────────────────────────┐
│  Gestión de Permisos                           │
│  Asigna rutas a los roles del sistema         │
└────────────────────────────────────────────────┘

┌──────────┐ ┌────────────────────────────────┐
│ ROLES    │ │ Permisos de: Administrador     │
│──────────│ │────────────────────────────────│
│ ► Admin  │ │ Módulo: Configuración  [Todas] │
│   Doctor │ │ ├─ ☑ Horarios    /horarios     │
│   Recep. │ │ ├─ ☑ Usuarios    /usuarios     │
│          │ │ └─ ☐ Plantillas  /plantillas   │
│          │ │                                 │
│          │ │ Módulo: Pacientes      [Todas] │
│          │ │ ├─ ☐ Listado     /pacientes    │
│          │ │ └─ ☐ Historias   /historias    │
└──────────┘ └────────────────────────────────┘
```

### Cards de Rutas

```
┌─────────────────────────────────────┐
│ ☑ Usuarios y permisos               │
│   /usuarios                         │
│   Gestión de usuarios del sistema   │
└─────────────────────────────────────┘
  ↑ Border azul si está asignada
```

### Estados del Checkbox Principal

```
[ ] = Ninguna ruta asignada
[■] = Algunas rutas asignadas (indeterminado)
[✓] = Todas las rutas asignadas
```

## 🚀 Flujo de Uso

### 1. Acceder a Permisos
```
1. Ir a /permisos desde el menú
2. Ver lista de roles en sidebar
3. Ver permisos del primer rol por defecto
```

### 2. Asignar Permiso Individual
```
1. Seleccionar un rol (ej: "Doctor")
2. Buscar un módulo (ej: "Pacientes")
3. Click en checkbox de una ruta (ej: "Listado de Pacientes")
4. Ver SweetAlert de éxito
5. Checkbox se marca y card toma borde azul
```

### 3. Asignar Todos los Permisos de un Módulo
```
1. Seleccionar un rol
2. Click en checkbox "Todas" de un módulo
3. Ver loading mientras se procesan todas las rutas
4. Ver SweetAlert de éxito
5. Todas las rutas del módulo se marcan
```

### 4. Quitar Permiso
```
1. Click en checkbox de ruta asignada
2. Ver SweetAlert de confirmación
3. Checkbox se desmarca y se quita borde azul
```

## 📊 Lógica de Estado

### Estado Local (Set)
```javascript
rutasAsignadas = new Set([1, 3, 5, 7])
// Contiene los IDs de rutas asignadas al rol seleccionado
```

### Verificaciones
```javascript
// ¿Está asignada esta ruta?
const estaAsignada = rutasAsignadas.has(idRuta)

// ¿Todas las rutas del módulo están asignadas?
const todasAsignadas = rutasDelModulo.every(r => 
  rutasAsignadas.has(r.id_ruta)
)

// ¿Alguna ruta del módulo está asignada?
const algunaAsignada = rutasDelModulo.some(r => 
  rutasAsignadas.has(r.id_ruta)
)
```

## 🎨 Características Visuales

✅ **Sidebar fijo** - Roles siempre visibles
✅ **Rol activo destacado** - Background azul
✅ **Agrupación por módulo** - Headers con iconos
✅ **Checkbox indeterminado** - Estado parcial visual
✅ **Rutas inactivas** - Deshabilitadas con badge
✅ **Grid responsive** - 2 columnas en desktop
✅ **Bordes dinámicos** - Azul si está asignada
✅ **Loading states** - Spinners durante guardado
✅ **SweetAlert2** - Feedback en cada acción

## 🧪 Cómo Probar

### Escenario 1: Asignar Permisos a Nuevo Rol

```
1. Ir a /permisos

2. Crear rol nuevo (si no existe):
   - Ir a /usuarios → tab Roles
   - Crear "Recepcionista"
   - Volver a /permisos

3. Seleccionar "Recepcionista"

4. Asignar permisos:
   - Módulo Configuración → Marcar "Horarios"
   - Ver éxito
   - Módulo Pacientes → Click "Todas"
   - Ver éxito

5. Verificar:
   - Checkboxes marcados
   - Bordes azules
   - "Todas" del módulo marcado
```

### Escenario 2: Modificar Permisos Existentes

```
1. Seleccionar rol "Administrador"

2. Ver permisos actuales

3. Quitar un permiso:
   - Desmarcar "Plantillas"
   - Ver éxito
   - Checkbox se desmarca

4. Agregar permiso:
   - Marcar "Historias Clínicas"
   - Ver éxito
   - Checkbox se marca
```

### Escenario 3: Gestionar por Módulo Completo

```
1. Seleccionar rol "Doctor"

2. Módulo "Configuración":
   - Click en "Todas"
   - Ver loading
   - Ver éxito
   - Todas marcadas

3. Módulo "Reportes":
   - Click en "Todas" (desmarcar)
   - Ver loading
   - Ver éxito
   - Todas desmarcadas
```

## 🔍 Manejo de Errores

### Error: Ruta ya asignada
```json
{
  "message": "La ruta ya está asignada a este rol"
}
```
Se muestra en SweetAlert, pero normalmente esto no debería pasar por el uso de Set.

### Error: Rol no encontrado
```json
{
  "message": "Rol no encontrado"
}
```

### Error: Validación
```json
{
  "message": "Error de validación",
  "errors": [
    {"field": "activo", "message": "Debe ser '0' o '1'"}
  ]
}
```

## 💡 Optimizaciones Implementadas

✅ **Set para búsqueda O(1)** - Verificación instant ánea de permisos
✅ **Batch operations** - Seleccionar todo usa promesas paralelas
✅ **Estado local** - No recarga desde API cada vez
✅ **Checkboxes controlados** - Estado sincronizado
✅ **Disabled durante guardado** - Previene doble-click

## 🔄 Sincronización de Estado

```javascript
// Al seleccionar un rol:
1. cargarRutasDelRol(id_rol)
2. rolesService.obtenerPorIdConRutas(id_rol)
3. Crear Set con IDs de rutas asignadas
4. setRutasAsignadas(new Set(...))

// Al toggle una ruta:
1. rolRutasService.toggleRutaRol(...)
2. Actualizar Set local
3. Re-render con nuevo estado
```

## 🎯 Integración con el Sistema

### Navegación
```
Menú → Permisos → /permisos
```

### Relación con otros módulos
- **Usuarios**: Define qué rol tiene cada usuario
- **Roles**: Define los roles disponibles
- **Módulos**: Agrupa las rutas
- **Rutas**: Son los permisos asignables
- **Permisos**: Une roles con rutas

### Flujo Completo
```
1. Crear módulos (/modulos)
2. Crear rutas para cada módulo (/modulos → Ver Rutas)
3. Crear roles (/usuarios → tab Roles)
4. Asignar permisos (/permisos)
5. Crear usuarios con roles (/usuarios)
6. Usuarios tienen acceso según su rol
```

## 📦 Dependencias entre Tablas

```
Usuarios
  └─ tienen → Roles
       └─ tienen → Permisos (Rol-Rutas)
            └─ apuntan a → Rutas
                 └─ pertenecen a → Módulos
```

## 🎓 Conceptos Clave

### Soft Delete vs Hard Delete
- **Soft Delete**: Marca como eliminado (deleted_at) pero mantiene el registro
- **Hard Delete**: Elimina físicamente el registro de la BD
- **Rol-Rutas usa Hard Delete** según la API

### Toggle Pattern
```javascript
// En lugar de dos endpoints separados:
// POST /rol-rutas (asignar)
// DELETE /rol-rutas/{id} (eliminar)

// Usamos un solo endpoint con campo activo:
// POST /rol-rutas/adddeleterolruta
// activo="1" → asignar
// activo="0" → eliminar
```

---

**Estado:** ✅ COMPLETADO y FUNCIONANDO
**Actualizado:** Octubre 2025
