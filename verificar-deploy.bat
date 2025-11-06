@echo off
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════╗
echo ║   Verificación Pre-Deploy - DentalSaaS        ║
echo ╚════════════════════════════════════════════════╝
echo.

set ERRORS=0
set WARNINGS=0

echo [CHECK 1/7] Verificando rutas dinámicas...
dir /s /b src\app 2>nul | findstr /C:"[" >nul
if !ERRORLEVEL! == 0 (
    echo ✗ FALLO: Se encontraron rutas dinámicas [id]
    set /a ERRORS+=1
) else (
    echo ✓ PASS: No hay rutas dinámicas
)

echo.
echo [CHECK 2/7] Verificando next.config.mjs...
if exist next.config.mjs (
    type next.config.mjs | findstr /C:"output:" >nul
    if !ERRORLEVEL! == 0 (
        echo ✓ PASS: next.config.mjs configurado
    ) else (
        echo ✗ FALLO: output no configurado en next.config.mjs
        set /a ERRORS+=1
    )
) else (
    echo ✗ FALLO: next.config.mjs no existe
    set /a ERRORS+=1
)

echo.
echo [CHECK 3/7] Verificando package.json...
if exist package.json (
    type package.json | findstr /C:"next" >nul
    if !ERRORLEVEL! == 0 (
        echo ✓ PASS: package.json válido
    ) else (
        echo ✗ FALLO: Next.js no encontrado en package.json
        set /a ERRORS+=1
    )
) else (
    echo ✗ FALLO: package.json no existe
    set /a ERRORS+=1
)

echo.
echo [CHECK 4/7] Verificando carpetas de build...
if exist .next (
    echo ⚠ WARNING: Carpeta .next existe - recomienda limpiar
    set /a WARNINGS+=1
) else (
    echo ✓ PASS: No hay carpeta .next
)

if exist out (
    echo ⚠ WARNING: Carpeta out existe - recomienda limpiar
    set /a WARNINGS+=1
) else (
    echo ✓ PASS: No hay carpeta out
)

echo.
echo [CHECK 5/7] Verificando node_modules...
if exist node_modules (
    echo ✓ PASS: node_modules existe
) else (
    echo ✗ FALLO: node_modules no existe - ejecuta: npm install
    set /a ERRORS+=1
)

echo.
echo [CHECK 6/7] Verificando estructura src/app...
if exist src\app (
    echo ✓ PASS: Carpeta src/app existe
) else (
    echo ✗ FALLO: Carpeta src/app no existe
    set /a ERRORS+=1
)

echo.
echo [CHECK 7/7] Verificando workflow GitHub Actions...
if exist .github\workflows\nextjs-deploy.yml (
    echo ✓ PASS: Workflow configurado
) else (
    echo ✗ FALLO: Workflow no existe
    set /a ERRORS+=1
)

echo.
echo ═══════════════════════════════════════════════════
echo  RESUMEN DE VERIFICACIÓN
echo ═══════════════════════════════════════════════════
echo  Errores críticos: %ERRORS%
echo  Advertencias: %WARNINGS%
echo ═══════════════════════════════════════════════════
echo.

if %ERRORS% == 0 (
    if %WARNINGS% == 0 (
        echo ✅ TODO OK - Listo para deploy
        echo.
        echo Ejecuta: commit-fix.bat
    ) else (
        echo ⚠ HAY ADVERTENCIAS - Recomendado limpiar
        echo.
        echo Ejecuta: limpiar-completo.bat
        echo Luego: commit-fix.bat
    )
) else (
    echo ❌ HAY ERRORES - NO APTO PARA DEPLOY
    echo.
    echo Revisa los errores anteriores y corrígelos
    echo Luego ejecuta este script nuevamente
)

echo.
pause
