# Script para copiar imágenes de confirmación desde Descargas
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Copiando imágenes de confirmación" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Rutas
$descargasPath = "C:\Users\Victor Castillo\Downloads"
$destinoPath = "public\assets\images\confirmacion"

# Verificar si existe la carpeta de destino
if (-Not (Test-Path $destinoPath)) {
    Write-Host "Creando carpeta de destino..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $destinoPath | Out-Null
}

# Archivos a copiar
$archivos = @("confirmar.svg", "cancelar.svg")

$copiados = 0
$noEncontrados = 0

foreach ($archivo in $archivos) {
    $origen = Join-Path $descargasPath $archivo
    $destino = Join-Path $destinoPath $archivo
    
    if (Test-Path $origen) {
        Copy-Item -Path $origen -Destination $destino -Force
        Write-Host "  ✓ $archivo copiado" -ForegroundColor Green
        $copiados++
    } else {
        Write-Host "  ✗ $archivo no encontrado en Descargas" -ForegroundColor Red
        $noEncontrados++
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Resumen:" -ForegroundColor Cyan
Write-Host "  Copiados: $copiados" -ForegroundColor Green
Write-Host "  No encontrados: $noEncontrados" -ForegroundColor $(if ($noEncontrados -gt 0) { "Red" } else { "Green" })
Write-Host "==================================" -ForegroundColor Cyan

if ($noEncontrados -eq 0) {
    Write-Host ""
    Write-Host "¡Todo listo! Las imágenes están en su lugar." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Por favor, verifica que las imágenes estén en:" -ForegroundColor Yellow
    Write-Host "  $descargasPath" -ForegroundColor Yellow
}

