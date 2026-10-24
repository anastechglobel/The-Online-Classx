const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace all instances of `color: #f8fafc;` for inputs with `color: #0f172a;`
html = html.replace(/\.dark input, \.dark select, \.dark textarea \{ background: #1e293b; border-color: #334155; color: #f8fafc; \}/g, '.dark input, .dark select, .dark textarea { background: #f8fafc; border-color: #334155; color: #0f172a; }');

// Make focus in dark mode match the light background.
html = html.replace(/\.dark input:focus, \.dark select:focus, \.dark textarea:focus \{\n            background: #1e293b;/g, '.dark input:focus, .dark select:focus, .dark textarea:focus {\n            background: #ffffff;');

fs.writeFileSync('index.html', html);
