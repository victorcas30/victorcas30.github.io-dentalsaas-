@echo off
echo ╔═══════════════════════════════════════════════╗
echo ║  Simulación Build GitHub Actions - Local     ║
echo ╚═══════════════════════════════════════════════╝
echo.
echo Este script simula el proceso de build que se ejecuta
echo en GitHub Actions para detectar problemas antes del deploy.
echo.
pause

echo.
echo ════════════════════════════════════════════════
echo PASO 1/5: Limpieza de caché (como GitHub Actions)
echo ════════════════════════════════════════════════
echo.

if exist .next (
    echo Eliminando .next...
    rmdir /s /q .next
)

if exist out (
    echo Eliminando out...
    rmdir /s /q out
)

if exist node_modules\.cache (
    echo Eliminando node_modules\.cache...
    rmdir /s /q node_modules\.cache
)

echo ✓ Caché limpiado

echo.
echo ════════════════════════════════════════════════
echo PASO 2/5: Instalación de dependencias (npm ci)
echo ════════════════════════════════════════════════
echo.

call npm ci
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ERROR en instalación de dependencias
    echo Solución: Ejecuta limpiar-completo.bat
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════
echo PASO 3/5: Build de producción
echo ════════════════════════════════════════════════
echo.
echo Configurando variables de entorno...
set NODE_ENV=production
set GITHUB_PAGES=true
set NEXT_PUBLIC_API_URL=https://backenddentalsaas-production.up.railway.app/dental_saas/api/v1

echo.
echo Ejecutando: npm run build
echo.

call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ERROR en el build
    echo.
    echo Posibles causas:
    echo 1. Existe una ruta dinámica [id]
    echo 2. Error de sintaxis en algún archivo
    echo 3. Dependencia faltante
    echo.
    echo Ejecuta diagnostico.bat para más información
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════
echo PASO 4/5: Verificación de salida
echo ════════════════════════════════════════════════
echo.

if exist out (
    echo ✓ Carpeta out/ generada correctamente
    echo.
    dir out /s | find "File(s)"
) else (
    echo ❌ ERROR: Carpeta out/ no fue generada
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════
echo PASO 5/5: Verificación de archivos críticos
echo ════════════════════════════════════════════════
echo.

if exist out\index.html (
    echo ✓ index.html existe
) else (
    echo ❌ index.html NO existe
)

if exist out\_next (
    echo ✓ Carpeta _next/ existe
) else (
    echo ❌ Carpeta _next/ NO existe
)

if exist out\pacientes (
    echo ✓ Carpeta pacientes/ existe
) else (
    echo ⚠ Carpeta pacientes/ NO existe
)

echo.
echo ════════════════════════════════════════════════
echo ✅ SIMULACIÓN COMPLETADA EXITOSAMENTE
echo ════════════════════════════════════════════════
echo.
echo El build funcionó correctamente. El deploy en GitHub
echo Actions debería funcionar sin problemas.
echo.
echo Siguiente paso: commit-fix.bat
echo.
pause
