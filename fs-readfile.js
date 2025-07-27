const fs = require('node:fs')

console.log('empezamos a leer el archivo');

fs.readFile('./archivo.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error al leer el archivo:', err);
    return;
  }
  console.log('Contenido del archivo:', data);
});

console.log('----> estoy empezando a leer otro archivo');


fs.readFile('./archivo2.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error al leer el segundo archivo:', err);
    return;
  }
  console.log('Contenido del segundo archivo:', data);
});

