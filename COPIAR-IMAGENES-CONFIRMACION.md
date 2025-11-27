# 📸 Instrucciones para Copiar Imágenes de Confirmación

## 📁 Ubicación de las Imágenes

Las imágenes deben copiarse desde tu carpeta de **Descargas** a la carpeta del proyecto.

### Origen (Descargas):
```
C:\Users\Victor Castillo\Downloads\confirmar.svg
C:\Users\Victor Castillo\Downloads\cancelar.svg
```

### Destino (Proyecto):
```
C:\Users\Victor Castillo\DentalSaaS\victorcas30.github.io-dentalsaas-\public\assets\images\confirmacion\confirmar.svg
C:\Users\Victor Castillo\DentalSaaS\victorcas30.github.io-dentalsaas-\public\assets\images\confirmacion\cancelar.svg
```

## 🚀 Opción 1: Copiar Manualmente

1. Abre el Explorador de Archivos
2. Ve a: `C:\Users\Victor Castillo\Downloads`
3. Copia los archivos:
   - `confirmar.svg`
   - `cancelar.svg`
4. Ve a: `C:\Users\Victor Castillo\DentalSaaS\victorcas30.github.io-dentalsaas-\public\assets\images\confirmacion`
5. Pega los archivos aquí

## 🚀 Opción 2: Usar PowerShell (Más Rápido)

Abre PowerShell y ejecuta:

```powershell
Copy-Item "C:\Users\Victor Castillo\Downloads\confirmar.svg" -Destination "public\assets\images\confirmacion\confirmar.svg" -Force
Copy-Item "C:\Users\Victor Castillo\Downloads\cancelar.svg" -Destination "public\assets\images\confirmacion\cancelar.svg" -Force
```

## ✅ Verificación

Después de copiar, verifica que los archivos existan:

```powershell
Test-Path "public\assets\images\confirmacion\confirmar.svg"
Test-Path "public\assets\images\confirmacion\cancelar.svg"
```

Ambos deben devolver `True`.

## 🎨 Resultado

Una vez copiadas las imágenes, cuando un paciente confirme o cancele su cita, verá:
- ✅ Un diseño profesional y bonito
- ✅ La imagen correspondiente (confirmar.svg o cancelar.svg)
- ✅ Un mensaje amable de agradecimiento
- ✅ Sin mostrar todos los datos de la cita (solo el mensaje)

