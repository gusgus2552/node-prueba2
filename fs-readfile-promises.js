const fs = require('node:fs/promises')

console.log('empezamos a leer el archivo');

fs.readFile('./archivo.txt', 'utf8')
  .then(data => {
    console.log('Contenido del archivo:', data);
  }).catch(err => {
    console.error('Error al leer el archivo:', err);
  });

console.log('----> estoy empezando a leer otro archivo');


fs.readFile('./archivo2.txt', 'utf8')
  .then(data => {
    console.log('Contenido del segundo archivo:', data);
  }).catch(err => {
    console.error('Error al leer el segundo archivo:', err);
  });

