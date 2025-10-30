const fs = require('fs');
const path = require('path');

// Leer el archivo .eml
const emlPath = path.join(__dirname, 'Escenario 6.eml');
const emlContent = fs.readFileSync(emlPath, 'utf8');

console.log('📧 Archivo .eml leído:', emlContent.length, 'caracteres');

// Buscar el nombre del archivo Excel adjunto
const filenameMatch = emlContent.match(/filename[^;\r\n]*=\s*"?([^";\r\n]+\.xlsx?)"?/i);
if (filenameMatch) {
  console.log('📎 Archivo adjunto encontrado:', filenameMatch[1]);
}

// Buscar el contenido en base64
// Los archivos adjuntos en .eml suelen estar entre boundary markers
const boundaryMatch = emlContent.match(/boundary="([^"]+)"/);
if (boundaryMatch) {
  console.log('🔍 Boundary encontrado:', boundaryMatch[1]);
}

// Extraer el contenido base64
const base64Match = emlContent.match(/Content-Transfer-Encoding:\s*base64[\r\n]+((?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?)/i);

if (base64Match) {
  console.log('✅ Contenido base64 encontrado');
  
  // Limpiar el base64 (remover saltos de línea)
  const base64Clean = base64Match[1].replace(/[\r\n]/g, '');
  console.log('📏 Tamaño del base64:', base64Clean.length, 'caracteres');
  
  // Convertir de base64 a buffer
  const excelBuffer = Buffer.from(base64Clean, 'base64');
  console.log('💾 Tamaño del Excel:', excelBuffer.length, 'bytes');
  
  // Guardar el archivo Excel
  const outputPath = path.join(__dirname, 'excel-extraido.xlsx');
  fs.writeFileSync(outputPath, excelBuffer);
  console.log('✅ Excel guardado en:', outputPath);
} else {
  console.log('❌ No se encontró contenido base64');
  
  // Mostrar una muestra del contenido para debug
  console.log('\n--- Muestra del contenido (primeros 5000 caracteres) ---');
  console.log(emlContent.substring(0, 5000));
}
