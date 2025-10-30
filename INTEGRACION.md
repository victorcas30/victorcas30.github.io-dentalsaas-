# DentalSaaS - Integración MaterialPro

## ✅ Lo que ya está hecho

1. ✅ Estructura de componentes React creada
2. ✅ Layout principal con Sidebar y Header
3. ✅ Dashboard con estadísticas y tablas
4. ✅ CSS personalizado con tema dental
5. ✅ Bootstrap 5 y Tabler Icons integrados desde CDN

## 📋 Pasos para completar la integración

### Paso 1: Copiar imágenes de perfil

Necesitas copiar algunas imágenes de MaterialPro a tu proyecto:

**Origen:**
```
C:\Users\Victor Castillo\materialpro-bt5-v8\materialpro-bt5-v8\package\starterkit\src\assets\images\profile\
```

**Destino:**
```
C:\Users\Victor Castillo\DentalSaaS\public\assets\images\profile\
```

Copia al menos el archivo `user-1.jpg` para que los avatares funcionen.

### Paso 2: (Opcional) Copiar CSS completo de MaterialPro

Si quieres usar todos los estilos de MaterialPro en lugar del CSS personalizado:

**Origen:**
```
C:\Users\Victor Castillo\materialpro-bt5-v8\materialpro-bt5-v8\package\starterkit\src\assets\css\styles.css
```

**Destino:**
```
C:\Users\Victor Castillo\DentalSaaS\public\assets\css\styles.min.css
```

Luego actualiza `src/app/layout.js` para incluir:
```javascript
<link rel="stylesheet" href="/assets/css/styles.min.css" />
```

### Paso 3: Iniciar el servidor de desarrollo

```bash
cd "C:\Users\Victor Castillo\DentalSaaS"
npm run dev
```

Abre tu navegador en [http://localhost:3000](http://localhost:3000)

## 🎨 Estructura del Proyecto

```
DentalSaaS/
├── src/
│   ├── app/
│   │   ├── layout.js          # Layout principal de Next.js
│   │   ├── page.js             # Dashboard principal
│   │   └── globals.css         # Estilos globales personalizados
│   └── components/
│       └── layout/
│           ├── DashboardLayout.js  # Layout del dashboard
│           ├── Sidebar.js          # Menú lateral
│           └── Header.js           # Barra superior
├── public/
│   └── assets/
│       └── images/
│           └── profile/        # Imágenes de perfil (copiar aquí)
└── package.json
```

## 🚀 Características Implementadas

### Layout Principal
- ✅ Sidebar responsive con menú de navegación
- ✅ Header con notificaciones, mensajes y perfil de usuario
- ✅ Toggle para mostrar/ocultar sidebar
- ✅ Soporte para modo oscuro
- ✅ Responsive para móviles y tablets

### Dashboard
- ✅ 4 tarjetas de estadísticas con iconos
- ✅ Tabla de próximas citas
- ✅ Panel de alertas y recordatorios
- ✅ Accesos rápidos
- ✅ Badges de estado

### Menú de Navegación
- Dashboard
- Pacientes
- Citas
- Tratamientos
- Facturación
- Configuración

## 🎯 Próximos Pasos

1. **Crear páginas adicionales:**
   - `/pacientes` - Lista y gestión de pacientes
   - `/citas` - Calendario de citas
   - `/tratamientos` - Gestión de tratamientos
   - `/facturacion` - Sistema de facturación

2. **Conectar con backend:**
   - Integrar API para datos reales
   - Autenticación de usuarios
   - Base de datos

3. **Funcionalidades adicionales:**
   - Sistema de búsqueda
   - Filtros avanzados
   - Gráficas y reportes
   - Exportar datos

## 🛠 Personalización

### Cambiar colores del tema

Edita las variables en `src/app/globals.css`:

```css
:root {
  --dental-primary: #1B84FF;      /* Azul principal */
  --dental-secondary: #43CED7;    /* Cyan secundario */
  --dental-success: #2cd07e;      /* Verde éxito */
  --dental-danger: #F8285A;       /* Rojo peligro */
  --dental-warning: #F6C000;      /* Amarillo advertencia */
  --dental-info: #2cabe3;         /* Azul información */
}
```

### Modificar el menú lateral

Edita `src/components/layout/Sidebar.js` para agregar o quitar elementos del menú.

### Personalizar el header

Edita `src/components/layout/Header.js` para modificar las notificaciones y opciones del usuario.

## 📝 Notas Importantes

- El proyecto usa **Next.js 15** con **App Router**
- Bootstrap 5.3.2 se carga desde CDN
- Los iconos son de **Tabler Icons**
- La fuente es **Poppins** de Google Fonts
- El CSS personalizado complementa Bootstrap sin conflictos

## 🐛 Solución de Problemas

### Las imágenes no cargan
- Verifica que hayas copiado las imágenes a `public/assets/images/profile/`
- Asegúrate de que el servidor de desarrollo esté corriendo

### Los estilos no se aplican
- Limpia la caché de Next.js: `rm -rf .next`
- Reinicia el servidor: `npm run dev`

### El sidebar no responde
- Verifica que Bootstrap JS esté cargando correctamente
- Revisa la consola del navegador para errores

## 📞 Soporte

Si encuentras algún problema o necesitas ayuda con la integración, revisa:
- La documentación de Next.js: https://nextjs.org/docs
- La documentación de Bootstrap: https://getbootstrap.com/docs/5.3/
- Los iconos de Tabler: https://tabler-icons.io/

---

**¡Bienvenido a DentalSaaS! 🦷✨**
