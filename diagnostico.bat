@echo off
echo ====================================
echo Diagnóstico del Proyecto Next.js
echo ====================================

echo.
echo [1] Verificando estructura de rutas...
echo.
dir /s /b src\app\*.jsx | findstr /C:"[" && (
    echo ¡ERROR! Se encontraron rutas dinámicas con corchetes [id]
    echo Estas rutas NO son compatibles con output: 'export'
) || (
    echo ✓ No se encontraron rutas dinámicas problemáticas
)

echo.
echo [2] Verificando archivos page...
echo.
dir /s /b src\app\page.jsx 2>nul | find /c "page.jsx"
echo archivos page.jsx encontrados

echo.
echo [3] Verificando next.config.mjs...
echo.
type next.config.mjs | findstr /C:"output:" && echo ✓ Configuración de output encontrada

echo.
echo [4] Verificando package.json...
echo.
type package.json | findstr /C:"next" && echo ✓ Next.js configurado

echo.
echo [5] Estado de carpetas de build...
echo.
if exist .next (
    echo ⚠ Carpeta .next existe - ejecuta limpiar-completo.bat
) else (
    echo ✓ No hay carpeta .next
)

if exist out (
    echo ⚠ Carpeta out existe - ejecuta limpiar-completo.bat
) else (
    echo ✓ No hay carpeta out
)

echo.
echo [6] Verificando node_modules...
echo.
if exist node_modules (
    echo ✓ node_modules existe
) else (
    echo ⚠ node_modules NO existe - ejecuta: npm install
)

echo.
echo ====================================
echo Diagnóstico completado
echo ====================================
pause
