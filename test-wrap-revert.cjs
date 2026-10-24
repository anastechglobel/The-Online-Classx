const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('<body class="overflow-x-hidden bg-slate-100 dark:bg-slate-950 flex justify-center">\n    <div id="appWrapper" class="w-full max-w-full md:max-w-md lg:max-w-4xl xl:max-w-6xl min-h-screen bg-slate-50 dark:bg-slate-900 relative md:shadow-2xl md:my-6 md:rounded-[40px] md:max-h-[92vh] md:overflow-y-auto overflow-x-hidden border-0 md:border md:border-slate-200 dark:md:border-slate-800" style="transform: translateZ(0);">', '<body class="overflow-x-hidden bg-slate-50 dark:bg-slate-900">');
html = html.replace('    </div>\n</body>', '</body>');
fs.writeFileSync('index.html', html);
