const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('<body class="overflow-x-hidden">', '<body class="overflow-x-hidden bg-slate-100 dark:bg-slate-950 flex justify-center">\n    <div id="appWrapper" class="w-full max-w-[480px] md:max-w-[768px] lg:max-w-[1100px] xl:max-w-[1300px] min-h-screen bg-slate-50 dark:bg-slate-900 relative shadow-2xl md:my-6 md:rounded-[40px] md:max-h-[95vh] md:overflow-y-auto overflow-x-hidden border border-slate-200 dark:border-slate-800" style="transform: translateZ(0);">');
html = html.replace('</body>', '    </div>\n</body>');
fs.writeFileSync('index.html', html);
