# 🚀 Guía Rápida de Inicio - DentalSaaS

## Paso 1: Copiar las Imágenes

### Opción A: Con PowerShell (Más Fácil) ⭐

1. Abre **PowerShell** (botón derecho en Inicio → Windows PowerShell)

2. Navega a tu proyecto:
```powershell
cd "C:\Users\Victor Castillo\DentalSaaS"
```

3. Ejecuta el script:
```powershell
.\copiar-assets.ps1
```

Si te da error de permisos, ejecuta primero:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\copiar-assets.ps1
```

### Opción B: Manual (Explorador de Windows)

1. Abre dos ventanas del Explorador de Windows

2. En la primera ventana, ve a:
```
C:\Users\Victor Castillo\materialpro-bt5-v8\materialpro-bt5-v8\package\starterkit\src\assets\images\profile
```

3. En la segunda ventana, ve a:
```
C:\Users\Victor Castillo\DentalSaaS\public\assets\images\profile
```

4. Copia todos los archivos de la primera a la segunda carpeta

---

## Paso 2: Iniciar el Servidor

1. Abre una terminal (PowerShell, CMD o Git Bash)

2. Navega al proyecto:
```bash
cd "C:\Users\Victor Castillo\DentalSaaS"
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

4. Espera a ver este mensaje:
```
✓ Ready in 2.5s
○ Local:   http://localhost:3000
```

---

## Paso 3: Abrir en el Navegador

1. Abre tu navegador favorito (Chrome, Firefox, Edge)

2. Ve a: **http://localhost:3000**

3. ¡Deberías ver tu dashboard de DentalSaaS! 🎉

---

## ¿Qué Verás?

### Dashboard Principal
- **4 Tarjetas de estadísticas** en la parte superior
- **Tabla de próximas citas** con información de pacientes
- **Panel de alertas** a la derecha
- **Botones de acceso rápido** en la parte inferior derecha

### Menú Lateral (Sidebar)
- Logo de DentalSaaS
- Perfil del doctor
- Opciones de navegación:
  - Dashboard
  - Pacientes
  - Citas
  - Tratamientos
  - Facturación
  - Configuración

### Barra Superior (Header)
- Botón para ocultar/mostrar menú
- Icono de búsqueda
- Toggle de modo oscuro/claro (luna/sol)
- Notificaciones (campana con número)
- Mensajes (sobre con número)
- Avatar del usuario con menú desplegable

---

## Prueba las Funcionalidades

### 1. Toggle del Sidebar
- Haz clic en el icono de menú (☰) en la barra superior
- El sidebar se ocultará/mostrará

### 2. Modo Oscuro
- Haz clic en el icono de luna (🌙) en la barra superior
- La interfaz cambiará a modo oscuro
- Haz clic en el sol (☀️) para volver al modo claro

### 3. Responsive
- Reduce el tamaño de la ventana del navegador
- Verás cómo se adapta para móviles
- El sidebar se convierte en un menú hamburguesa

### 4. Dropdowns
- Haz clic en las notificaciones (🔔)
- Haz clic en los mensajes (✉️)
- Haz clic en tu avatar para ver el menú de perfil

---

## Atajos de Teclado Útiles

### En el Navegador
- `Ctrl + R` - Recargar página
- `F12` - Abrir DevTools (consola)
- `Ctrl + Shift + C` - Inspeccionar elemento

### En la Terminal
- `Ctrl + C` - Detener el servidor
- `npm run dev` - Iniciar nuevamente

---

## Comandos Importantes

```bash
# Iniciar servidor
npm run dev

# Construir para producción
npm run build

# Iniciar en producción
npm start

# Verificar errores
npm run lint

# Limpiar caché
rm -rf .next
```

---

## Estructura de URLs

Una vez que el servidor esté corriendo:

- `http://localhost:3000/` - Dashboard
- `http://localhost:3000/pacientes` - Pacientes (crear esta página)
- `http://localhost:3000/citas` - Citas (crear esta página)
- `http://localhost:3000/tratamientos` - Tratamientos (crear esta página)
- `http://localhost:3000/facturacion` - Facturación (crear esta página)
- `http://localhost:3000/configuracion` - Configuración (crear esta página)

---

## Problemas Comunes y Soluciones

### ❌ Error: "npm: command not found"
**Solución:** Instala Node.js desde https://nodejs.org/

### ❌ Error: "Module not found"
**Solución:**
```bash
npm install
```

### ❌ Las imágenes no cargan
**Solución:** Ejecuta el script `copiar-assets.ps1` o copia las imágenes manualmente

### ❌ Puerto 3000 en uso
**Solución:**
```bash
# Next.js te preguntará si quieres usar otro puerto
# O puedes especificar uno diferente:
npm run dev -- -p 3001
```

### ❌ Cambios no se reflejan
**Solución:**
```bash
# Detén el servidor (Ctrl + C)
rm -rf .next
npm run dev
```

---

## Siguiente Paso: Crear Nuevas Páginas

### Ejemplo: Crear la página de Pacientes

1. Crea una carpeta en `src/app/`:
```bash
mkdir src/app/pacientes
```

2. Crea el archivo `page.js` dentro:
```javascript
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function Pacientes() {
  return (
    <DashboardLayout>
      <h2 className="mb-4">Gestión de Pacientes</h2>
      
      <div className="card">
        <div className="card-body">
          <p>Aquí irá la lista de pacientes</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
```

3. Guarda el archivo

4. Visita: `http://localhost:3000/pacientes`

---

## Tips Profesionales 💡

### Desarrollo Eficiente
1. Mantén el servidor corriendo mientras desarrollas
2. Los cambios se actualizan automáticamente (Hot Reload)
3. Revisa la consola del navegador para errores
4. Usa React DevTools para debugging

### Organización
1. Crea componentes reutilizables en `src/components/`
2. Usa nombres descriptivos para tus archivos
3. Comenta tu código cuando sea necesario
4. Mantén los componentes pequeños y enfocados

### Best Practices
1. Siempre usa `'use client'` en componentes con interactividad
2. Importa solo lo que necesitas
3. Usa variables CSS para colores consistentes
4. Mantén el código limpio y organizado

---

## Recursos Adicionales 📚

### Archivos de Documentación
- `README.md` - Información general del proyecto
- `INTEGRACION.md` - Guía detallada de integración
- `RESUMEN.md` - Resumen completo de características
- `INICIO-RAPIDO.md` - Este archivo

### Enlaces Útiles
- Next.js: https://nextjs.org/docs
- React: https://react.dev/
- Bootstrap: https://getbootstrap.com/
- Tabler Icons: https://tabler-icons.io/

---

## Checklist de Verificación ✅

Antes de comenzar a desarrollar, verifica:

- [ ] Node.js está instalado (`node --version`)
- [ ] Las dependencias están instaladas (`npm install`)
- [ ] Las imágenes están copiadas (ejecutaste `copiar-assets.ps1`)
- [ ] El servidor se inicia sin errores (`npm run dev`)
- [ ] Puedes ver el dashboard en http://localhost:3000
- [ ] El sidebar responde al hacer clic
- [ ] El modo oscuro funciona
- [ ] Las imágenes de perfil se muestran correctamente

---

## 🎉 ¡Estás Listo!

Si todos los checks están marcados, **¡felicidades!** 
Tu proyecto DentalSaaS está configurado correctamente y listo para desarrollar.

### ¿Qué hacer ahora?

1. **Explora** todas las funcionalidades del dashboard
2. **Experimenta** con el código
3. **Crea** nuevas páginas para cada módulo
4. **Personaliza** los colores y el diseño
5. **Desarrolla** las funcionalidades de tu clínica dental

---

**¡Mucha suerte con tu proyecto! 🦷✨**

*Si tienes dudas, revisa los archivos de documentación o la consola del navegador para mensajes de error.*
