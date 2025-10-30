# Script para copiar assets de MaterialPro a DentalSaaS
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Copiando assets a DentalSaaS   " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Rutas
$materialProPath = "C:\Users\Victor Castillo\materialpro-bt5-v8\materialpro-bt5-v8\package\starterkit\src\assets"
$dentalSaasPath = "C:\Users\Victor Castillo\DentalSaaS\public\assets"

# Verificar si existe la carpeta de origen
if (-Not (Test-Path $materialProPath)) {
    Write-Host "Error: No se encuentra la carpeta de MaterialPro" -ForegroundColor Red
    Write-Host "Ruta esperada: $materialProPath" -ForegroundColor Yellow
    exit 1
}

# Crear directorios si no existen
Write-Host "Creando directorios..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "$dentalSaasPath\images\profile" | Out-Null
New-Item -ItemType Directory -Force -Path "$dentalSaasPath\images\backgrounds" | Out-Null
New-Item -ItemType Directory -Force -Path "$dentalSaasPath\images\logos" | Out-Null

# Copiar imágenes de perfil
Write-Host "Copiando imágenes de perfil..." -ForegroundColor Yellow
Copy-Item -Path "$materialProPath\images\profile\*" -Destination "$dentalSaasPath\images\profile\" -Force
Write-Host "  ✓ Imágenes de perfil copiadas" -ForegroundColor Green

# Copiar imágenes de fondos
Write-Host "Copiando imágenes de fondo..." -ForegroundColor Yellow
Copy-Item -Path "$materialProPath\images\backgrounds\*" -Destination "$dentalSaasPath\images\backgrounds\" -Force
Write-Host "  ✓ Imágenes de fondo copiadas" -ForegroundColor Green

# Copiar logos
Write-Host "Copiando logos..." -ForegroundColor Yellow
Copy-Item -Path "$materialProPath\images\logos\*" -Destination "$dentalSaasPath\images\logos\" -Force
Write-Host "  ✓ Logos copiados" -ForegroundColor Green

# Resumen
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  ✓ Copia completada con éxito   " -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Assets copiados a:" -ForegroundColor White
Write-Host "  $dentalSaasPath" -ForegroundColor Gray
Write-Host ""
Write-Host "Ahora puedes iniciar el servidor:" -ForegroundColor White
Write-Host "  cd DentalSaaS" -ForegroundColor Gray
Write-Host "  npm run dev" -ForegroundColor Gray
Write-Host ""
