# Solución: Error de Build con Rutas Dinámicas

## Problema
GitHub Actions reportaba el error:
```
Page "/pacientes/[id]/page" cannot use both "use client" and export function "generateStaticParams()".
```

## Causa
Con `output: 'export'` en Next.js (necesario para GitHub Pages), **no se pueden usar rutas dinámicas** como `/pacientes/[id]`. Este modo genera archivos estáticos sin servidor.

## Solución Implementada

### 1. Configuración Actualizada
- ✅ `next.config.mjs`: Configuración limpia para export mode
- ✅ Workflow GitHub Actions con limpieza de caché
- ✅ Script de limpieza local (`limpiar-completo.bat`)

### 2. Patrón de Rutas Correcto
Para páginas con parámetros, usa **query parameters** en lugar de dynamic routes:

❌ **Incorrecto** (no funciona con `output: 'export'`):
```
/pacientes/[id]/page.jsx → /pacientes/123
```

✅ **Correcto** (funciona con `output: 'export'`):
```
/pacientes/detalle/page.jsx → /pacientes/detalle?id=123
```

### 3. Ejemplo de Uso
```jsx
// En el listado
router.push(`/pacientes/detalle?id=${idPaciente}`)

// En la página de detalle
const searchParams = useSearchParams()
const idPaciente = searchParams.get('id')
```

## Pasos para Resolver

1. **Limpiar localmente** (ejecutar en el proyecto):
   ```bash
   limpiar-completo.bat
   ```

2. **Verificar build local**:
   ```bash
   npm run build
   ```

3. **Commit y push** para activar el workflow actualizado:
   ```bash
   git add .
   git commit -m "fix: Configuración para export mode sin rutas dinámicas"
   git push origin main
   ```

## Reglas para GitHub Pages

✅ **Permitido**:
- Páginas estáticas
- Query parameters (`?id=123`)
- Client Components (`'use client'`)
- Server Components (sin hooks de React)

❌ **No Permitido**:
- Dynamic routes (`[id]`)
- `generateStaticParams()` con `'use client'`
- API Routes (`/api/*`)
- Server Actions
- Middleware con redirecciones dinámicas

## Verificación
El build debe completarse sin errores mostrando:
```
✓ Compiled successfully
✓ Generating static pages
✓ Finalizing page optimization
```
