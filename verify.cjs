const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

const openModal = html.substring(html.indexOf('function openModal(modalId)'), html.indexOf('function closeModal()'));
console.log(openModal);
