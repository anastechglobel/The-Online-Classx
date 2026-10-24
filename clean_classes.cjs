const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// clean up messy classes
html = html.replace(/bg-slate-50 bg-white/g, 'bg-white');
html = html.replace(/dark:border-slate-700/g, 'border-slate-200'); // Force light borders on these since bg is white now
html = html.replace(/text-slate-900  placeholder-slate-400/g, 'text-slate-900 placeholder-slate-400');

fs.writeFileSync('index.html', html);
