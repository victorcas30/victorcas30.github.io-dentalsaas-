# 🦷 DentalSaaS - Sistema de Gestión Dental

Sistema integral para la gestión de clínicas dentales desarrollado con Next.js 15.

## 🚀 Desarrollo Local

### Requisitos
- Node.js 20 o superior
- npm

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/victorcas30/victorcas30.github.io-dentalsaas-.git

# Entrar al directorio
cd victorcas30.github.io-dentalsaas-

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

Tu aplicación estará disponible en: **http://localhost:3000**

## 📦 Deployment a GitHub Pages

### Configuración Automática

Este proyecto está configurado para deployment automático:

1. **Haz cambios** en tu código
2. **Commit** tus cambios con GitHub Desktop
3. **Push** a la rama `main`
4. **GitHub Actions** automáticamente:
   - Construye el proyecto
   - Despliega a GitHub Pages
   - ✅ Listo en 1-2 minutos

### URL de Producción

🌐 **https://victorcas30.github.io/victorcas30.github.io-dentalsaas-/**

## 🔧 Configuración

### Variables de Entorno

**Desarrollo (.env.local - no se sube a Git):**
```env
NEXT_PUBLIC_API_URL=https://backenddentalsaas-production.up.railway.app/dental_saas/api/v1
NODE_ENV=development
```

**Producción (configurado en GitHub Actions):**
- Las variables se configuran automáticamente en el workflow

### Diferencias entre Entornos

| Aspecto | Desarrollo | Producción |
|---------|-----------|-----------|
| **URL Base** | `localhost:3000` | `victorcas30.github.io/victorcas30.github.io-dentalsaas-/` |
| **BasePath** | Sin prefijo | Con prefijo `/victorcas30.github.io-dentalsaas-` |
| **Hot Reload** | ✅ Activado | ❌ No disponible |
| **Optimización** | Mínima | ✅ Completa |
| **Source Maps** | ✅ Completos | ⚠️ Limitados |

## 📁 Estructura del Proyecto

```
.
├── .github/
│   └── workflows/
│       └── nextjs-deploy.yml    # Workflow de deployment
├── public/                       # Archivos estáticos
├── src/
│   ├── app/                     # Rutas y páginas
│   ├── components/              # Componentes React
│   ├── services/                # Servicios de API
│   ├── config/                  # Configuración
│   └── utils/                   # Utilidades
├── .env.local                   # Variables de entorno (local)
├── .gitignore                   # Archivos ignorados por Git
├── next.config.mjs              # Configuración de Next.js
└── package.json                 # Dependencias
```

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye para producción
npm run start        # Inicia servidor de producción (local)

# Deployment
npm run deploy       # Despliega a GitHub Pages (manual)
```

## 🔄 Workflow de Desarrollo

### Para trabajar localmente:

1. **Inicia el servidor:**
   ```bash
   npm run dev
   ```

2. **Haz tus cambios**

3. **Prueba localmente** en `http://localhost:3000`

4. **Commit y Push:**
   - Abre GitHub Desktop
   - Commit tus cambios
   - Push origin

5. **GitHub Actions despliega automáticamente** 🚀

### Ver el progreso del deployment:

1. Ve a tu repositorio en GitHub
2. Click en la pestaña **"Actions"**
3. Verás el workflow en ejecución
4. Espera a que termine (1-2 minutos)
5. Visita tu sitio: https://victorcas30.github.io/victorcas30.github.io-dentalsaas-/

## ⚙️ Configuración de GitHub Pages

El proyecto ya está configurado, pero si necesitas verificar:

1. **Settings** → **Pages**
2. **Source**: GitHub Actions
3. **Custom domain**: (opcional)

## 🐛 Solución de Problemas

### El sitio muestra README.md en lugar de la aplicación

**Solución:**
- Verifica que el archivo `.nojekyll` exista en la raíz
- Asegúrate de que solo el workflow `nextjs-deploy.yml` esté activo
- Elimina o desactiva `jekyll-gh-pages.yml`

### npm run dev no funciona

**Solución:**
```bash
# Limpia caché
rm -rf .next node_modules

# Reinstala
npm install

# Intenta de nuevo
npm run dev
```

### Cambios no se reflejan en producción

**Solución:**
1. Verifica que hayas hecho push a `main`
2. Revisa la pestaña "Actions" en GitHub
3. Espera a que termine el workflow
4. Limpia caché del navegador (Ctrl + Shift + R)

## 📝 Notas Importantes

- ⚠️ **No uses rutas API de Next.js** - No son compatibles con exportación estática
- ✅ **El backend está en Railway** - Todas las llamadas API van al backend externo
- 📦 **GitHub Pages solo sirve archivos estáticos** - No hay server-side rendering
- 🔒 **Variables de entorno** - Solo las que empiezan con `NEXT_PUBLIC_` están disponibles en el cliente

## 🤝 Contribuir

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👨‍💻 Autor

**Victor Castillo**
- GitHub: [@victorcas30](https://github.com/victorcas30)
- Email: vcastillo.mancia@gmail.com

---

**Última actualización:** Octubre 2024
