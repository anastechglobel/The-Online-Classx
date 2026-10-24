const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace setup inputs
html = html.replace(
    '<input id="setupName" type="text" placeholder="Enter your full name" class="w-full px-5 py-4 rounded-2xl outline-none font-bold">',
    '<input id="setupName" type="text" placeholder="Enter your full name" class="w-full px-5 py-4 rounded-2xl outline-none font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400">'
);
html = html.replace(
    '<select id="setupGender" class="flex-1 px-5 py-4 rounded-2xl font-bold appearance-auto dark:text-white">',
    '<select id="setupGender" class="flex-1 px-5 py-4 rounded-2xl font-bold appearance-auto bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">'
);
html = html.replace(
    '<input id="setupAge" type="number" placeholder="Age (Years)" class="w-1/3 px-5 py-4 rounded-2xl outline-none font-bold">',
    '<input id="setupAge" type="number" placeholder="Age (Years)" class="w-1/3 px-5 py-4 rounded-2xl outline-none font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400">'
);
html = html.replace(
    '<input id="setupEmail" type="email" placeholder="Email Address (Optional)" class="w-full px-5 py-4 rounded-2xl outline-none font-bold">',
    '<input id="setupEmail" type="email" placeholder="Email Address (Optional)" class="w-full px-5 py-4 rounded-2xl outline-none font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400">'
);
html = html.replace(
    '<input id="setupPhone" type="tel" placeholder="Phone Number (Mandatory)" class="w-full px-5 py-4 rounded-2xl outline-none font-bold">',
    '<input id="setupPhone" type="tel" placeholder="Phone Number (Mandatory)" class="w-full px-5 py-4 rounded-2xl outline-none font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400">'
);

fs.writeFileSync('index.html', html);
