const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The goal is to make all inputs visible. 
// We will force them to use text-slate-900 and a light background to contrast it.
html = html.replace(/dark:bg-slate-800/g, 'bg-white');
html = html.replace(/dark:text-white/g, ''); // We might remove it from labels too though, we should be careful.
fs.writeFileSync('index.html', html);
