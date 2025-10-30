@echo off
echo ========================================
echo Limpiando cache y desplegando
echo ========================================
echo.

echo [1/4] Limpiando cache de Next.js...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo Cache limpiado correctamente

echo.
echo [2/4] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo Error al instalar dependencias
    pause
    exit /b %errorlevel%
)

echo.
echo [3/4] Construyendo proyecto...
call npm run build
if %errorlevel% neq 0 (
    echo Error al construir el proyecto
    pause
    exit /b %errorlevel%
)

echo.
echo [4/4] Desplegando a GitHub Pages...
call npm run deploy
if %errorlevel% neq 0 (
    echo Error al desplegar
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo ¡Despliegue completado exitosamente!
echo ========================================
echo.
echo Tu sitio estara disponible en unos minutos en:
echo https://victorcas30.github.io/victorcas30.github.io-dentalsaas-/
echo.
echo Pasos siguientes:
echo 1. Ve a tu repositorio en GitHub
echo 2. Settings ^> Pages
echo 3. Selecciona la rama 'gh-pages'
echo 4. Espera 2-5 minutos
echo.
pause
