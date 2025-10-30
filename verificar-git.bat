@echo off
echo ========================================
echo Verificando configuracion de Git
echo ========================================
echo.

echo Usuario de Git configurado:
git config user.name
echo.

echo Email de Git configurado:
git config user.email
echo.

echo Repositorio remoto configurado:
git remote -v
echo.

echo ========================================
echo.
echo Si el usuario no es "victorcas30", ejecuta:
echo git config user.name "victorcas30"
echo git config user.email "tu-email@example.com"
echo.
echo Luego vuelve a ejecutar: npm run deploy
echo.
pause
