@echo off
echo Eliminando carpeta API...
if exist "src\app\api" (
    rmdir /s /q "src\app\api"
    echo Carpeta API eliminada correctamente
) else (
    echo La carpeta API no existe
)

echo.
echo Limpiando cache...
if exist ".next" rmdir /s /q ".next"
if exist "out" rmdir /s /q "out"
echo Cache limpiado

echo.
echo Presiona cualquier tecla para continuar con el deploy...
pause
