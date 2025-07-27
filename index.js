const os = require('node:os');

console.log('Informacion del sistema operativo');

console.log('-----------------');
console.log('Tipo de SO: ' + os.type());
console.log('Plataforma: ' + os.platform());
console.log('Version del SO: ' + os.release());
console.log('Arquitectura: ' + os.arch());
console.log('Memoria libre: ' + os.freemem() / 1024 / 1024 + ' MB');
console.log('Memoria total: ' + os.totalmem() / 1024 / 1024 + ' MB');