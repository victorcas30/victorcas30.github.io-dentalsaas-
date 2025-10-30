# 🔧 Debugging: Dropdown No Funciona

## 🚨 **Pasos para Verificar y Arreglar**

---

## Paso 1: Recarga Fuerte del Navegador

```bash
Ctrl + Shift + R
```

O borra la caché:
1. F12 (DevTools)
2. Click derecho en el botón de recargar
3. "Vaciar caché y recargar de forma forzada"

---

## Paso 2: Verifica la Consola

1. **Abre DevTools:** `F12`
2. **Ve a la pestaña Console**
3. **Busca estos mensajes cuando hagas hover:**
   ```
   Módulos cargados: [...]
   Mouse enter: 2
   Mouse leave
   ```

### ¿Qué deberías ver?

#### Al Cargar la Página:
```javascript
Módulos cargados: Array(1)
  0: {id_modulo: 2, modulo: "Configuración", rutas: Array(5)}
```

#### Al Pasar el Mouse sobre "Configuración":
```javascript
Mouse enter: 2
```

#### Al Salir del Mouse:
```javascript
Mouse leave
```

---

## Paso 3: Verifica que Tienes Módulos en localStorage

1. **DevTools (F12) → Application**
2. **Local Storage → localhost:3000**
3. **Busca la key:** `modulos`
4. **Click en ella**

### ¿Qué deberías ver?
```json
[
  {
    "id_modulo": 2,
    "modulo": "Configuración",
    "rutas": [
      {"id_ruta": 1, "nombre": "Horarios", "path": "/horarios"},
      ...
    ]
  }
]
```

### ❌ Si NO ves esto:
**Problema:** No has hecho login o los datos no se guardaron

**Solución:**
1. Ve a `/login`
2. Haz login de nuevo
3. Verifica que se guardaron los módulos

---

## Paso 4: Prueba Manualmente en la Consola

En DevTools → Console, escribe:

```javascript
// Verificar que existe authService
import { authService } from '@/services/authService'

// Ver módulos
authService.getModulos()

// Debería devolver un array con tus módulos
```

---

## Paso 5: Verificar Estilos CSS

1. **DevTools (F12) → Elements**
2. **Busca:** `<li class="sidebar-item dropdown-hover">`
3. **Cuando hagas hover, busca:** `<div class="dropdown-menu-wrapper">`
4. **Dentro debería haber:** `<ul class="dropdown-menu show">`

### CSS que debería aplicarse:
```css
.dropdown-menu-wrapper {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
}

.dropdown-menu {
  display: block;
  background: white;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}
```

---

## Paso 6: Si AÚN No Funciona - Versión Simple

Voy a crear una versión ultra simple del dropdown:

### Reemplaza HorizontalSidebar.js con esto:

```javascript
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { authService } from '@/services/authService'

export default function HorizontalSidebar() {
  const [modulos, setModulos] = useState([])
  const [hover, setHover] = useState(false)

  useEffect(() => {
    const m = authService.getModulos()
    setModulos(m)
    console.log('MODULOS:', m)
  }, [])

  return (
    <aside className="left-sidebar with-horizontal">
      <nav className="sidebar-nav">
        <ul style={{display: 'flex', listStyle: 'none', padding: 0, margin: 0}}>
          
          <li>
            <Link href="/" style={{padding: '15px 20px', display: 'block'}}>
              Dashboard
            </Link>
          </li>

          <li 
            style={{position: 'relative'}}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <a 
              href="#" 
              onClick={(e) => e.preventDefault()}
              style={{padding: '15px 20px', display: 'block', cursor: 'pointer'}}
            >
              Configuración ▼
            </a>

            {hover && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '10px 0',
                minWidth: '250px',
                boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
                zIndex: 1000
              }}>
                <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                  {modulos[0]?.rutas?.map(ruta => (
                    <li key={ruta.id_ruta}>
                      <Link 
                        href={ruta.path}
                        style={{
                          padding: '10px 20px',
                          display: 'block',
                          color: '#333',
                          textDecoration: 'none'
                        }}
                      >
                        {ruta.nombre}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>

        </ul>
      </nav>
    </aside>
  )
}
```

### ¿Qué hace esta versión?
- **Estilos inline** - No depende de CSS externo
- **Lógica ultra simple** - Solo hover true/false
- **Visible en consola** - Console.log de módulos
- **Sin animaciones** - Para descartar problemas de CSS

---

## 🔍 **Resultados Esperados:**

### ✅ Si funciona:
El problema era el CSS. Usa esta versión simple y mejórala poco a poco.

### ❌ Si NO funciona:
1. Verifica que `modulos` tiene datos (console.log)
2. Verifica que el hover se activa (agrega console.log en onMouseEnter)
3. Verifica que no hay errores en la consola

---

## 📞 **Dame los Resultados:**

Por favor revisa:

1. ¿Qué ves en la consola cuando cargas la página?
2. ¿Qué ves en localStorage → modulos?
3. ¿El hover se activa? (deberías ver "Mouse enter: 2")
4. ¿Aparece el dropdown aunque sea por un instante?
5. ¿Hay algún error en la consola?

Con esta información puedo darte la solución exacta.

---

## 🎯 **Mientras Tanto:**

Usa la versión simple del código que te di arriba. Cópiala y pégala en HorizontalSidebar.js.

Esa versión SÍ debería funcionar porque no depende de clases CSS complejas.

---

**¿Probaste la versión simple? ¿Qué mensajes ves en la consola? 🔍**
