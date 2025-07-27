import {readFile} from 'node:fs/promises';

console.log('empezamos a leer el archivo');

const text = await readFile('./archivo.txt', 'utf-8')
  .then(data => {
    console.log('Contenido del archivo:', data);
  }).catch(err => {
    console.error('Error al leer el archivo:', err);
  });

console.log('Texto del primer archivo:', text);
console.log('----> estoy empezando a leer otro archivo');

const text2 = await readFile('./archivo2.txt', 'utf-8')
  .then(data => {
    console.log('Contenido del segundo archivo:', data);
  }).catch(err => {
    console.error('Error al leer el segundo archivo:', err);
  });

console.log('Texto del segundo archivo:', text2);