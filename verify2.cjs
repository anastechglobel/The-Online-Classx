const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

const closeModal = html.substring(html.indexOf('function closeModal()'), html.indexOf('let editingCourseId = null;'));
console.log(closeModal);
