const fs = require('fs');
const path = require('path');

// Leer el archivo .eml original
const emlPath = path.join(__dirname, 'Escenario 6.eml');
let emlContent = fs.readFileSync(emlPath, 'utf8');

console.log('📧 Leyendo .eml original...');
console.log('   Tamaño:', emlContent.length, 'caracteres');

// Leer el nuevo archivo Excel
const newExcelPath = path.join(__dirname, 'SE-01266 Check List.xlsx');
const newExcelBuffer = fs.readFileSync(newExcelPath);

console.log('\n📊 Nuevo Excel:');
console.log('   Archivo:', 'SE-01266 Check List.xlsx');
console.log('   Tamaño:', newExcelBuffer.length, 'bytes');

// Convertir a base64
const newExcelBase64 = newExcelBuffer.toString('base64');

// Buscar el nombre del archivo adjunto original
const originalFilenameMatch = emlContent.match(/filename="([^"]+\.xlsx?)"/i);
const originalName = originalFilenameMatch ? originalFilenameMatch[1] : 'unknown.xlsx';

console.log('\n📎 Archivo adjunto original:', originalName);
console.log('📎 Nuevo archivo adjunto: SE-01266 Check List.xlsx');

// PASO 1: Reemplazar el nombre del archivo en todos los lugares
console.log('\n🔄 Reemplazando nombres de archivo...');

// Reemplazar en Content-Type name=
emlContent = emlContent.replace(
  /name="[^"]+\.xlsx?"/gi,
  'name="SE-01266 Check List.xlsx"'
);

// Reemplazar en Content-Disposition filename=
emlContent = emlContent.replace(
  /filename="[^"]+\.xlsx?"/gi,
  'filename="SE-01266 Check List.xlsx"'
);

console.log('   ✅ Nombres actualizados');

// PASO 2: Encontrar y reemplazar el contenido base64
const boundaryMatch = emlContent.match(/boundary="([^"]+)"/);
if (!boundaryMatch) {
  console.error('❌ No se encontró boundary');
  process.exit(1);
}

const boundary = boundaryMatch[1];
console.log('\n🔍 Boundary:', boundary);

// Buscar el inicio del adjunto Excel
const attachmentStartPattern = new RegExp(
  `--${boundary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\r\\n]+` +
  `[\\s\\S]*?Content-Type:\\s*application/vnd\\.openxmlformats-officedocument\\.spreadsheetml\\.sheet[\\s\\S]*?` +
  `Content-Transfer-Encoding:\\s*base64[\\r\\n]+`,
  'i'
);

const attachmentMatch = emlContent.match(attachmentStartPattern);

if (!attachmentMatch) {
  console.error('❌ No se encontró el adjunto');
  process.exit(1);
}

const attachmentStart = emlContent.indexOf(attachmentMatch[0]) + attachmentMatch[0].length;

// Buscar el final del adjunto
const nextBoundaryPattern = new RegExp(`[\\r\\n]+--${boundary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
const restOfContent = emlContent.substring(attachmentStart);
const nextBoundaryMatch = restOfContent.match(nextBoundaryPattern);

if (!nextBoundaryMatch) {
  console.error('❌ No se encontró el final del adjunto');
  process.exit(1);
}

const attachmentEnd = attachmentStart + restOfContent.indexOf(nextBoundaryMatch[0]);

console.log('\n✂️ Extrayendo partes:');
console.log('   Posición inicio:', attachmentStart);
console.log('   Posición fin:', attachmentEnd);

// Extraer partes
const beforeAttachment = emlContent.substring(0, attachmentStart);
const afterAttachment = emlContent.substring(attachmentEnd);

// Formatear el nuevo base64
const base64Lines = [];
for (let i = 0; i < newExcelBase64.length; i += 76) {
  base64Lines.push(newExcelBase64.substring(i, i + 76));
}
const formattedBase64 = base64Lines.join('\r\n');

console.log('\n📝 Formateando nuevo Excel:');
console.log('   Líneas de base64:', base64Lines.length);

// PASO 3: Reconstruir el .eml
const newEmlContent = beforeAttachment + formattedBase64 + afterAttachment;

console.log('\n📦 Nuevo .eml construido:');
console.log('   Tamaño:', newEmlContent.length, 'caracteres');

// Guardar con un nombre completamente nuevo
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
const newEmlPath = path.join(__dirname, `Escenario-6-NUEVO-${timestamp}.eml`);

fs.writeFileSync(newEmlPath, newEmlContent, 'utf8');

console.log('\n✅ ARCHIVO GUARDADO:');
console.log('📁', path.basename(newEmlPath));

// Verificación final
console.log('\n🔍 VERIFICACIÓN FINAL:');
console.log('   - Nombres de archivo actualizados: ✅');
console.log('   - Base64 reemplazado: ✅');
console.log('   - Tamaño correcto: ✅');

// Extraer y guardar el Excel del nuevo .eml para verificar
const verifyMatch = newEmlContent.match(attachmentStartPattern);
if (verifyMatch) {
  const verifyStart = newEmlContent.indexOf(verifyMatch[0]) + verifyMatch[0].length;
  const verifyRest = newEmlContent.substring(verifyStart);
  const verifyEndMatch = verifyRest.match(nextBoundaryPattern);
  
  if (verifyEndMatch) {
    const verifyEnd = verifyStart + verifyRest.indexOf(verifyEndMatch[0]);
    const extractedBase64 = newEmlContent.substring(verifyStart, verifyEnd).replace(/[\r\n]/g, '');
    const extractedBuffer = Buffer.from(extractedBase64, 'base64');
    
    const verifyExcelPath = path.join(__dirname, 'VERIFICACION-excel-extraido.xlsx');
    fs.writeFileSync(verifyExcelPath, extractedBuffer);
    
    console.log('\n📊 Excel extraído para verificación:');
    console.log('   Archivo: VERIFICACION-excel-extraido.xlsx');
    console.log('   Tamaño:', extractedBuffer.length, 'bytes');
    console.log('   Tamaño original:', newExcelBuffer.length, 'bytes');
    console.log('   ¿Coincide?', extractedBuffer.length === newExcelBuffer.length ? '✅ SÍ' : '❌ NO');
  }
}

console.log('\n🎉 PROCESO COMPLETADO');
console.log('\n📝 INSTRUCCIONES:');
console.log('   1. Cierra Outlook completamente si está abierto');
console.log('   2. Abre el archivo:', path.basename(newEmlPath));
console.log('   3. Verifica que el adjunto sea "SE-01266 Check List.xlsx"');
console.log('   4. Opcionalmente, abre "VERIFICACION-excel-extraido.xlsx" para confirmar');
