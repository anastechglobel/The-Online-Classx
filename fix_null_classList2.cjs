const fs = require('fs');
let indexHtml = fs.readFileSync('index.html', 'utf8');

const regex = /document\.getElementById\('([^']+)'\)\.classList\.(add|remove|toggle)\('([^']+)'\);/g;

indexHtml = indexHtml.replace(regex, (match, id, action, className) => {
    return `const el_${id.replace(/-/g, '_')} = document.getElementById('${id}'); if(el_${id.replace(/-/g, '_')}) el_${id.replace(/-/g, '_')}.classList.${action}('${className}');`;
});

fs.writeFileSync('index.html', indexHtml);
console.log("index.html fixed null references phase 2");
