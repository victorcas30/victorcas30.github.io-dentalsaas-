@echo off
echo ========================================
echo Desplegando proyecto a GitHub Pages
echo ========================================
echo.

echo [1/3] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo Error al instalar dependencias
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Construyendo proyecto...
call npm run build
if %errorlevel% neq 0 (
    echo Error al construir el proyecto
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Desplegando a GitHub Pages...
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
