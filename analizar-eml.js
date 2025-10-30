const fs = require('fs');
const path = require('path');

// Leer el archivo .eml
const emlPath = path.join(__dirname, 'Escenario 6.eml');
const emlContent = fs.readFileSync(emlPath, 'utf8');

console.log('📧 Tamaño del .eml:', emlContent.length, 'caracteres');
console.log('\n--- PRIMEROS 8000 CARACTERES ---\n');
console.log(emlContent.substring(0, 8000));
console.log('\n--- BUSCANDO PATRONES DE ADJUNTOS ---\n');

// Buscar diferentes patrones
const patterns = [
  /Content-Type:\s*application\/[^;\r\n]*/gi,
  /Content-Disposition:\s*attachment/gi,
  /filename[^;\r\n]*=\s*"?([^";\r\n]+)"?/gi,
  /name[^;\r\n]*=\s*"?([^";\r\n]+)"?/gi,
  /boundary="([^"]+)"/gi
];

patterns.forEach((pattern, i) => {
  const matches = emlContent.match(pattern);
  if (matches) {
    console.log(`Patrón ${i + 1}:`, matches);
  }
});
