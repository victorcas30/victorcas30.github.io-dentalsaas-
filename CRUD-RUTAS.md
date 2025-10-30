# 🛣️ CRUD de Rutas - Implementación Completa

## ✅ Archivos Creados/Modificados

```
✅ src/services/rutasService.js          # Servicio API para rutas
✅ src/app/modulos/page.jsx              # Actualizado con gestión de rutas
```

## 🎯 Concepto de Diseño

En lugar de una página separada, las **rutas se gestionan dentro de cada módulo**:

```
Módulos
  ├─ Ver listado de módulos (cards)
  └─ Hacer clic en "Ver Rutas" de un módulo
       └─ Ver/Crear/Editar/Eliminar rutas de ese módulo
```

## 📋 Funcionalidades Implementadas

### 1. **Vista de Módulos**
- Grid de cards con módulos
- Botón "Ver Rutas" en cada módulo
- Botón "Editar" módulo
- Botón "Eliminar" módulo

### 2. **Vista de Rutas** (dentro de un módulo)
- Tabla con todas las rutas del módulo
- Botón "Volver a Módulos"
- Botón "Nueva Ruta"
- Columnas: ID, Nombre, Path, Descripción, Estado, Acciones

### 3. **Crear Ruta**
- POST `/rutas`
- Modal con formulario
- Campos:
  - Nombre (requerido)
  - Path (requerido, debe empezar con /)
  - Descripción (opcional)
  - Activo (switch, default: true)
  - id_modulo (automático del módulo seleccionado)

### 4. **Editar Ruta**
- PUT `/rutas/{id}`
- Modal precargado con datos actuales
- Mismas validaciones que crear

### 5. **Eliminar Ruta**
- DELETE `/rutas/{id}` (soft delete)
- Modal de confirmación
- SweetAlert2 para éxito/error

### 6. **Listar Rutas por Módulo**
- GET `/rutas/modulo/{id_modulo}`
- Tabla responsive con todas las rutas
- Estados de loading y vacío

## 🎨 Diseño Visual

### Vista de Módulos
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   🎨 Icono  │ │   🎨 Icono  │ │   🎨 Icono  │
│   Módulo 1  │ │   Módulo 2  │ │   Módulo 3  │
│ Descripción │ │ Descripción │ │ Descripción │
│             │ │             │ │             │
│ [Ver Rutas] │ │ [Ver Rutas] │ │ [Ver Rutas] │
│[Edit] [Del] │ │[Edit] [Del] │ │[Edit] [Del] │
└─────────────┘ └─────────────┘ └─────────────┘
```

### Vista de Rutas
```
[← Volver a Módulos]        [Nueva Ruta]

Rutas de: Configuración

┌─────────────────────────────────────────────┐
│ ID │ Nombre  │ Path      │ Estado │ Acciones│
├─────────────────────────────────────────────┤
│ 1  │ Horarios│ /horarios │ Activo │ [E][D]  │
│ 2  │ Usuarios│ /usuarios │ Activo │ [E][D]  │
└─────────────────────────────────────────────┘
```

## 🔧 API Endpoints Usados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/rutas/modulo/{id_modulo}` | Listar rutas por módulo |
| GET | `/rutas/{id}` | Obtener ruta por ID |
| POST | `/rutas` | Crear nueva ruta |
| PUT | `/rutas/{id}` | Actualizar ruta |
| DELETE | `/rutas/{id}` | Eliminar ruta (soft delete) |

## 📱 Estructura del Servicio

```javascript
rutasService.listarPorModulo(idModulo)  // Lista rutas del módulo
rutasService.obtenerPorId(id)           // Obtiene una ruta
rutasService.crear(datos)               // Crea nueva ruta
rutasService.actualizar(id, datos)      // Actualiza ruta
rutasService.eliminar(id)               // Elimina ruta (soft)
```

## 🎯 Validaciones

### Campo "activo"
⚠️ **IMPORTANTE**: El campo `activo` debe enviarse como **string** ("0" o "1")

```javascript
// ✅ CORRECTO
body: {
  activo: "1"  // String
}

// ❌ INCORRECTO
body: {
  activo: 1    // Number
}
```

### Otros Campos
- **nombre**: requerido (string)
- **path**: requerido, debe comenzar con `/` (string único)
- **descripcion**: opcional (string)
- **id_modulo**: requerido (integer)

## 🚀 Flujo de Uso

### Paso 1: Ver Módulos
```
1. Ir a /modulos
2. Ver listado de módulos en cards
```

### Paso 2: Ver Rutas de un Módulo
```
1. Click en "Ver Rutas" de un módulo
2. Se cambia a vista de rutas
3. Ver tabla con rutas del módulo
```

### Paso 3: Crear Ruta
```
1. Click en "Nueva Ruta"
2. Llenar formulario:
   - Nombre: "Gestión de Horarios"
   - Path: "/horarios"
   - Descripción: "Configuración de horarios"
   - Activo: ✓
3. Click en "Crear"
4. Ver SweetAlert de éxito
5. Ruta aparece en la tabla
```

### Paso 4: Editar/Eliminar Ruta
```
1. Click en botón Editar o Eliminar
2. Confirmar acción
3. Ver SweetAlert de éxito
```

### Paso 5: Volver a Módulos
```
1. Click en "← Volver a Módulos"
2. Regresa a vista de módulos
```

## 📊 Estados de la Aplicación

```javascript
// Estado global
vistaActual: 'modulos' | 'rutas'

// Vista de Módulos
modulos: []
loadingModulos: boolean
moduloSeleccionado: object | null

// Vista de Rutas
rutas: []
loadingRutas: boolean
moduloRutasSeleccionado: object | null
rutaSeleccionada: object | null
```

## 🎨 Características Visuales

✅ **Navegación fluida** - Transición suave entre vistas
✅ **Breadcrumb visual** - Botón "Volver" claro
✅ **Estados claros** - Loading, vacío, con datos
✅ **Tabla responsive** - Se adapta a móviles
✅ **Path en código** - Estilo `<code>` para URLs
✅ **Badges de estado** - Verde (activo) / Rojo (inactivo)
✅ **Iconos consistentes** - ti-route para rutas
✅ **SweetAlert2** - Mensajes elegantes

## 🧪 Cómo Probar

### Flujo Completo
```
1. Ir a http://localhost:3000/modulos

2. Crear un módulo:
   - Click "Nuevo Módulo"
   - Nombre: "Configuración"
   - Descripción: "Configuración del sistema"
   - Crear

3. Ver rutas del módulo:
   - Click "Ver Rutas" en el módulo creado
   - Ver tabla vacía

4. Crear primera ruta:
   - Click "Nueva Ruta"
   - Nombre: "Horarios"
   - Path: "/horarios"
   - Descripción: "Gestión de horarios"
   - Activo: ✓
   - Crear

5. Crear segunda ruta:
   - Click "Nueva Ruta"
   - Nombre: "Usuarios"
   - Path: "/usuarios"
   - Crear

6. Ver tabla con 2 rutas

7. Editar ruta:
   - Click "Editar" en una ruta
   - Cambiar descripción
   - Guardar

8. Eliminar ruta:
   - Click "Eliminar"
   - Confirmar
   - Ver que desaparece

9. Volver a módulos:
   - Click "← Volver a Módulos"
```

## 🔍 Manejo de Errores

### Error: Path duplicado
```json
{
  "message": "El path ya existe",
  "errors": [
    {"field": "path", "message": "El path /usuarios ya está en uso"}
  ]
}
```

### Error: Campo activo inválido
```json
{
  "message": "Error de validación",
  "errors": [
    {"field": "activo", "message": "El campo activo debe ser '0' o '1'"}
  ]
}
```

## 💡 Ventajas del Diseño Integrado

✅ **Contexto claro** - Siempre sabes en qué módulo estás
✅ **Menos navegación** - No hay página separada de rutas
✅ **Relación visual** - Fácil ver qué rutas pertenecen a qué módulo
✅ **Menos clics** - Workflow más directo
✅ **Estado consistente** - No se pierde el contexto del módulo

## 🔄 Navegación

```
/modulos
   │
   ├─ [Ver Rutas] → Vista de Rutas (mismo componente)
   │                    │
   │                    └─ [← Volver] → Vista de Módulos
   │
   ├─ [Editar] → Modal de Módulo
   │
   └─ [Eliminar] → Confirmar → Eliminar
```

## 📦 Ejemplo de Datos

### Módulo
```json
{
  "id_modulo": 1,
  "nombre": "Configuración",
  "descripcion": "Configuración del sistema"
}
```

### Ruta
```json
{
  "id_ruta": 1,
  "nombre": "Horarios",
  "path": "/horarios",
  "descripcion": "Configuración de horarios de la clínica",
  "id_modulo": 1,
  "activo": "1"
}
```

## 🎯 Patrón de Código

Este CRUD sigue el mismo patrón establecido:
- ✅ SweetAlert2 para mensajes
- ✅ Manejo de errores consistente
- ✅ Estados de loading
- ✅ Modales para crear/editar
- ✅ ConfirmModal para eliminar
- ✅ Responsive design

---

**Estado:** ✅ COMPLETADO y FUNCIONANDO
**Actualizado:** Octubre 2025
