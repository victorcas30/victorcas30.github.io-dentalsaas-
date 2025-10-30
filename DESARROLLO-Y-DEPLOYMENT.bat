@echo off
echo ========================================
echo GUIA RAPIDA - Desarrollo y Deployment
echo ========================================
echo.
echo [DESARROLLO LOCAL]
echo.
echo Para trabajar localmente:
echo   npm run dev
echo.
echo Tu app estara en: http://localhost:3000
echo (sin el prefijo /victorcas30.github.io-dentalsaas-)
echo.
echo ========================================
echo.
echo [DEPLOYMENT A GITHUB PAGES]
echo.
echo Para desplegar a produccion:
echo.
echo 1. Haz tus cambios en el codigo
echo 2. Abre GitHub Desktop
echo 3. Haz commit de tus cambios
echo 4. Push origin
echo 5. GitHub Actions desplegara automaticamente
echo.
echo Tu sitio en produccion:
echo https://victorcas30.github.io/victorcas30.github.io-dentalsaas-/
echo.
echo ========================================
echo.
echo [DIFERENCIAS]
echo.
echo DESARROLLO (npm run dev):
echo - Sin basePath
echo - Hot reload activado
echo - Errores detallados
echo - URL: localhost:3000
echo.
echo PRODUCCION (GitHub Pages):
echo - Con basePath: /victorcas30.github.io-dentalsaas-
echo - Archivos estaticos optimizados
echo - URL: victorcas30.github.io/victorcas30.github.io-dentalsaas-/
echo.
echo ========================================
echo.
echo [ARCHIVOS DE CONFIGURACION]
echo.
echo - .env.local = Variables para desarrollo (NO se sube a Git)
echo - next.config.mjs = Configuracion que detecta entorno
echo - .github/workflows/nextjs-deploy.yml = Workflow de deployment
echo.
echo ========================================
echo.
pause
