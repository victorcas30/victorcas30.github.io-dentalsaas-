@echo off
echo ========================================
echo Limpiando credenciales de Git
echo ========================================
echo.

echo Eliminando credenciales guardadas de GitHub...
git credential-manager delete https://github.com 2>nul

echo.
echo Credenciales eliminadas.
echo.
echo ========================================
echo.
echo IMPORTANTE:
echo Git te pedira tus credenciales de GitHub.
echo.
echo Usuario: victorcas30
echo Contraseña: Usa tu PERSONAL ACCESS TOKEN (NO tu contraseña)
echo.
echo Si no tienes un token, generalo en:
echo https://github.com/settings/tokens
echo.
echo Presiona cualquier tecla para continuar con el deploy...
pause
echo.
echo Desplegando...
call npm run deploy

pause
