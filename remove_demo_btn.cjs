const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const demoBtn = `                        <button onclick="loginAsDemo()" class="w-full bg-slate-100 text-slate-500 font-bold py-3 rounded-2xl transition-all hover:bg-slate-200 active:scale-95 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                            <i class="fa-solid fa-vial"></i> Quick Demo Login (If Google Fails)
                        </button>`;

html = html.replace(demoBtn, '');
fs.writeFileSync('index.html', html);
console.log('Button removed');
