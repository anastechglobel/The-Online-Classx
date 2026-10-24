const fs = require('fs');
let adminHtml = fs.readFileSync('admin.html', 'utf8');

const regex = /document\.getElementById\('([^']+)'\)\.classList\.(add|remove|toggle)\(([^)]+)\);/g;

adminHtml = adminHtml.replace(regex, (match, id, action, classNames) => {
    return `const el_${id.replace(/-/g, '_')} = document.getElementById('${id}'); if(el_${id.replace(/-/g, '_')}) el_${id.replace(/-/g, '_')}.classList.${action}(${classNames});`;
});

fs.writeFileSync('admin.html', adminHtml);
console.log("admin.html fixed null references");
