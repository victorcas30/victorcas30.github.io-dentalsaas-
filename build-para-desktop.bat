@echo off
echo ========================================
echo Build para GitHub Desktop
echo ========================================
echo.

echo [1/2] Construyendo proyecto...
call npm run build
if %errorlevel% neq 0 (
    echo Error al construir el proyecto
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Preparando para GitHub Desktop...
echo.
echo ========================================
echo Build completado exitosamente!
echo ========================================
echo.
echo La carpeta "out" contiene tu sitio compilado.
echo.
echo PASOS SIGUIENTES CON GITHUB DESKTOP:
echo.
echo 1. Abre GitHub Desktop
echo 2. Selecciona este repositorio
echo 3. Veras los cambios en la carpeta "out"
echo 4. Escribe un mensaje de commit: "Deploy to GitHub Pages"
echo 5. Click en "Commit to main"
echo 6. Click en "Push origin"
echo.
echo Luego en GitHub:
echo 1. Ve a Settings ^> Pages
echo 2. Source: Deploy from a branch
echo 3. Branch: main
echo 4. Folder: /out
echo 5. Save
echo.
pause
