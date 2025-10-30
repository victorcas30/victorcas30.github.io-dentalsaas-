const fs = require('fs');
const path = require('path');

// Leer el archivo .eml original
const emlPath = path.join(__dirname, 'Escenario 6.eml');
const emlContent = fs.readFileSync(emlPath, 'utf8');

console.log('📧 Leyendo .eml original...');
console.log('   Tamaño:', emlContent.length, 'caracteres');

// Leer el nuevo archivo Excel
const newExcelPath = path.join(__dirname, 'SE-01266 Check List.xlsx');
const newExcelBuffer = fs.readFileSync(newExcelPath);

console.log('\n📊 Leyendo nuevo Excel...');
console.log('   Tamaño:', newExcelBuffer.length, 'bytes');

// Convertir el nuevo Excel a base64
const newExcelBase64 = newExcelBuffer.toString('base64');
console.log('   Base64 generado:', newExcelBase64.length, 'caracteres');

// Encontrar el boundary del email
const boundaryMatch = emlContent.match(/boundary="([^"]+)"/);
if (!boundaryMatch) {
  console.error('❌ No se encontró el boundary en el .eml');
  process.exit(1);
}

const boundary = boundaryMatch[1];
console.log('\n🔍 Boundary encontrado:', boundary);

// Dividir el contenido por boundaries
const parts = emlContent.split(`--${boundary}`);
console.log('\n📦 Partes del email:', parts.length);

// Encontrar la parte que contiene el Excel adjunto
let attachmentPartIndex = -1;
for (let i = 0; i < parts.length; i++) {
  if (parts[i].includes('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
      parts[i].includes('Content-Type: application/vnd.ms-excel')) {
    attachmentPartIndex = i;
    console.log('📎 Excel encontrado en parte:', i);
    break;
  }
}

if (attachmentPartIndex === -1) {
  console.error('❌ No se encontró el adjunto Excel en el .eml');
  process.exit(1);
}

// Extraer los headers de la parte del adjunto (antes del contenido base64)
const attachmentPart = parts[attachmentPartIndex];
const headerEndMatch = attachmentPart.match(/Content-Transfer-Encoding:\s*base64\s*[\r\n]+/i);

if (!headerEndMatch) {
  console.error('❌ No se encontró el header de codificación');
  process.exit(1);
}

// Obtener solo los headers (antes del contenido)
const headerEnd = attachmentPart.indexOf(headerEndMatch[0]) + headerEndMatch[0].length;
const headers = attachmentPart.substring(0, headerEnd);

console.log('\n📋 Headers del adjunto extraídos');

// Dividir el base64 en líneas de 76 caracteres (estándar de email)
const base64Lines = [];
for (let i = 0; i < newExcelBase64.length; i += 76) {
  base64Lines.push(newExcelBase64.substring(i, i + 76));
}

// Crear la nueva parte del adjunto
const newAttachmentPart = headers + base64Lines.join('\r\n');

console.log('\n✅ Nueva parte del adjunto creada');
console.log('   Líneas de base64:', base64Lines.length);

// Reemplazar la parte del adjunto
parts[attachmentPartIndex] = newAttachmentPart;

// Reconstruir el .eml
const newEmlContent = parts.join(`--${boundary}`);

// Guardar el nuevo .eml
const newEmlPath = path.join(__dirname, 'Escenario 6 - MODIFICADO.eml');
fs.writeFileSync(newEmlPath, newEmlContent, 'utf8');

console.log('\n✅ Nuevo .eml creado exitosamente!');
console.log('📁 Archivo guardado como:', newEmlPath);
console.log('📏 Tamaño:', newEmlContent.length, 'caracteres');

console.log('\n🎉 PROCESO COMPLETADO');
console.log('   Puedes abrir el archivo "Escenario 6 - MODIFICADO.eml" con tu cliente de correo');
