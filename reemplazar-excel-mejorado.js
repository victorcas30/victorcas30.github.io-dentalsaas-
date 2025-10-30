const fs = require('fs');
const path = require('path');

// Leer el archivo .eml original
const emlPath = path.join(__dirname, 'Escenario 6.eml');
const emlContent = fs.readFileSync(emlPath, 'utf8');

console.log('📧 Analizando .eml original...');
console.log('   Tamaño total:', emlContent.length, 'caracteres');

// Leer el nuevo archivo Excel
const newExcelPath = path.join(__dirname, 'SE-01266 Check List.xlsx');
const newExcelBuffer = fs.readFileSync(newExcelPath);

console.log('\n📊 Excel modificado:');
console.log('   Tamaño:', newExcelBuffer.length, 'bytes');

// Convertir el nuevo Excel a base64
const newExcelBase64 = newExcelBuffer.toString('base64');
console.log('   Base64:', newExcelBase64.length, 'caracteres');

// Encontrar el boundary
const boundaryMatch = emlContent.match(/boundary="([^"]+)"/);
if (!boundaryMatch) {
  console.error('❌ No se encontró boundary');
  process.exit(1);
}

const boundary = boundaryMatch[1];
console.log('\n🔍 Boundary:', boundary);

// Buscar donde empieza el adjunto Excel
const attachmentStartPattern = new RegExp(
  `--${boundary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\r\\n]+` +
  `[\\s\\S]*?Content-Type:\\s*application/vnd\\.openxmlformats-officedocument\\.spreadsheetml\\.sheet[\\s\\S]*?` +
  `Content-Transfer-Encoding:\\s*base64[\\r\\n]+`,
  'i'
);

const attachmentMatch = emlContent.match(attachmentStartPattern);

if (!attachmentMatch) {
  console.error('❌ No se encontró el adjunto Excel');
  console.log('\n--- Buscando patrones alternativos ---');
  
  // Buscar cualquier Content-Type de Excel
  const excelTypes = emlContent.match(/Content-Type:\s*application\/[^\r\n]*(excel|spreadsheet)[^\r\n]*/gi);
  if (excelTypes) {
    console.log('Tipos de Excel encontrados:', excelTypes);
  }
  
  process.exit(1);
}

console.log('\n✅ Adjunto encontrado');
const attachmentStart = emlContent.indexOf(attachmentMatch[0]) + attachmentMatch[0].length;

// Buscar el final del adjunto (siguiente boundary)
const nextBoundaryPattern = new RegExp(`[\\r\\n]+--${boundary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
const restOfContent = emlContent.substring(attachmentStart);
const nextBoundaryMatch = restOfContent.match(nextBoundaryPattern);

if (!nextBoundaryMatch) {
  console.error('❌ No se encontró el final del adjunto');
  process.exit(1);
}

const attachmentEnd = attachmentStart + restOfContent.indexOf(nextBoundaryMatch[0]);

console.log('\n📍 Posiciones:');
console.log('   Inicio del base64:', attachmentStart);
console.log('   Fin del base64:', attachmentEnd);
console.log('   Tamaño del adjunto original:', attachmentEnd - attachmentStart, 'caracteres');

// Extraer el contenido antes y después del adjunto
const beforeAttachment = emlContent.substring(0, attachmentStart);
const afterAttachment = emlContent.substring(attachmentEnd);

console.log('\n✂️ Partes del email:');
console.log('   Antes del adjunto:', beforeAttachment.length, 'caracteres');
console.log('   Después del adjunto:', afterAttachment.length, 'caracteres');

// Dividir el base64 en líneas de 76 caracteres (estándar RFC 2045)
const base64Lines = [];
for (let i = 0; i < newExcelBase64.length; i += 76) {
  base64Lines.push(newExcelBase64.substring(i, i + 76));
}

const formattedBase64 = base64Lines.join('\r\n');

console.log('\n📝 Nuevo base64 formateado:');
console.log('   Líneas:', base64Lines.length);
console.log('   Tamaño total:', formattedBase64.length, 'caracteres');

// Reconstruir el .eml con el nuevo Excel
const newEmlContent = beforeAttachment + formattedBase64 + afterAttachment;

console.log('\n📦 Nuevo .eml:');
console.log('   Tamaño:', newEmlContent.length, 'caracteres');
console.log('   Diferencia:', newEmlContent.length - emlContent.length, 'caracteres');

// Guardar el nuevo .eml
const newEmlPath = path.join(__dirname, 'Escenario 6 - MODIFICADO.eml');
fs.writeFileSync(newEmlPath, newEmlContent, 'utf8');

console.log('\n✅ ARCHIVO CREADO EXITOSAMENTE');
console.log('📁 Ubicación:', newEmlPath);

// Verificación: Extraer el Excel del nuevo .eml para confirmar
console.log('\n🔍 VERIFICANDO...');
const verifyMatch = newEmlContent.match(attachmentStartPattern);
if (verifyMatch) {
  const verifyStart = newEmlContent.indexOf(verifyMatch[0]) + verifyMatch[0].length;
  const verifyRest = newEmlContent.substring(verifyStart);
  const verifyEnd = verifyRest.match(nextBoundaryPattern);
  
  if (verifyEnd) {
    const verifyEndPos = verifyStart + verifyRest.indexOf(verifyEnd[0]);
    const extractedBase64 = newEmlContent.substring(verifyStart, verifyEndPos).replace(/[\r\n]/g, '');
    
    console.log('   Base64 extraído del nuevo .eml:', extractedBase64.length, 'caracteres');
    console.log('   Base64 original del Excel:', newExcelBase64.length, 'caracteres');
    console.log('   ¿Coinciden?', extractedBase64 === newExcelBase64 ? '✅ SÍ' : '❌ NO');
    
    if (extractedBase64 === newExcelBase64) {
      console.log('\n🎉 ¡PERFECTO! El Excel modificado está correctamente insertado en el .eml');
    } else {
      console.log('\n⚠️ ADVERTENCIA: Los base64 no coinciden exactamente');
      console.log('   Diferencia:', Math.abs(extractedBase64.length - newExcelBase64.length), 'caracteres');
    }
  }
}

console.log('\n✅ PROCESO COMPLETADO');
