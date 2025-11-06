@echo off
echo ====================================
echo Limpieza completa del proyecto
echo ====================================

echo.
echo [1/4] Eliminando node_modules...
if exist node_modules rmdir /s /q node_modules

echo.
echo [2/4] Eliminando .next y out...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out

echo.
echo [3/4] Eliminando cache de npm...
npm cache clean --force

echo.
echo [4/4] Reinstalando dependencias...
npm install

echo.
echo ====================================
echo Limpieza completada exitosamente
echo ====================================
echo.
echo Ahora puedes ejecutar: npm run build
pause
