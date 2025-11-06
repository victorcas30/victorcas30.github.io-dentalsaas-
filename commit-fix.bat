@echo off
echo ====================================
echo Preparando commit para GitHub
echo ====================================

echo.
echo [1/4] Verificando cambios...
git status

echo.
echo [2/4] Agregando archivos...
git add .

echo.
echo [3/4] Creando commit...
git commit -m "fix: Actualizar configuración Next.js para export mode sin rutas dinámicas"

echo.
echo [4/4] Enviando a GitHub...
git push origin main

echo.
echo ====================================
echo Proceso completado
echo ====================================
echo.
echo Verifica el build en: https://github.com/victorcas30/victorcas30.github.io-dentalsaas-/actions
echo.
pause
