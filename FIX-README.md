# 🔧 Fix Aplicado: Error de Build en GitHub Pages

## ✅ Cambios Realizados

### 1. Configuración Actualizada
- ✅ `next.config.mjs`: Limpiado y optimizado para export mode
- ✅ `.github/workflows/nextjs-deploy.yml`: Agregado paso de limpieza de caché
- ✅ `limpiar-completo.bat`: Script para limpieza local completa

### 2. Documentación
- ✅ `SOLUCION-ERROR-BUILD.md`: Guía completa del problema y solución

## 🚀 Próximos Pasos

### Paso 1: Limpiar Localmente
Ejecuta el script de limpieza:
```bash
limpiar-completo.bat
```

### Paso 2: Verificar Build Local
```bash
npm run build
```

Si el build es exitoso, verás:
```
✓ Compiled successfully
✓ Generating static pages  
✓ Finalizing page optimization
```

### Paso 3: Commit y Push
```bash
git add .
git commit -m "fix: Actualizar configuración para export mode correcto"
git push origin main
```

### Paso 4: Verificar GitHub Actions
1. Ve a tu repositorio en GitHub
2. Click en la pestaña "Actions"
3. Verifica que el workflow se ejecute sin errores

## ⚠️ Importante

**NO uses rutas dinámicas** como `/pacientes/[id]` porque Next.js con `output: 'export'` no las soporta.

✅ **Usa esto**:
```jsx
router.push(`/pacientes/detalle?id=${idPaciente}`)
```

❌ **No uses esto**:
```jsx
router.push(`/pacientes/${idPaciente}`)
```

## 📋 Resumen del Error Original

El error era:
```
Page "/pacientes/[id]/page" cannot use both "use client" and export function "generateStaticParams()"
```

**Causa**: Intentar usar rutas dinámicas (`[id]`) con `output: 'export'`, que solo genera sitios estáticos.

**Solución**: Usar query parameters (`?id=123`) en lugar de dynamic routes.

---

## 🆘 Si el Error Persiste

1. Elimina la carpeta `.next` y `out` localmente
2. Limpia el caché de GitHub Actions (re-run workflow)
3. Verifica que no existan archivos o carpetas con `[id]` en `src/app`
