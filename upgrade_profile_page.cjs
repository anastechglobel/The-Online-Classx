const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldProfileHTML = `<div id="page-profile" class="page px-5">
            <div class="bg-white p-8 rounded-[32px] text-center mb-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative">
                <button onclick="openEditProfile()" class="absolute top-6 right-6 w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-colors z-10 cursor-pointer"><i class="fa-solid fa-pen"></i></button>
                <div id="profileAvatar" class="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-4xl font-black text-white mx-auto mb-5 shadow-2xl shadow-indigo-100">U</div>
                <h2 id="profileName" class="text-2xl font-black text-slate-900 tracking-tight">User Name</h2>
                <p id="profilePhone" class="text-slate-400 font-bold mt-1 tracking-wider text-sm">+91 1234567890</p>
            </div>
            <div class="space-y-3">
                <div class="flex justify-between items-center p-5 bg-white rounded-2xl border border-slate-50 shadow-sm">
                    <span class="text-slate-400 font-bold text-xs uppercase tracking-widest">Gender</span>
                    <span id="profileGender" class="font-black text-slate-800">Male</span>
                </div>
                <div class="flex justify-between items-center p-5 bg-white rounded-2xl border border-slate-50 shadow-sm">
                    <span class="text-slate-400 font-bold text-xs uppercase tracking-widest">Age</span>
                    <span id="profileAge" class="font-black text-slate-800">20</span>
                </div>
                <div class="flex justify-between items-center p-5 bg-white rounded-2xl border border-slate-50 shadow-sm">
                    <span class="text-slate-400 font-bold text-xs uppercase tracking-widest">Email</span>
                    <div class="text-right">
                        <span id="profileEmail" class="font-black text-slate-800 text-xs block">email@example.com</span>
                    </div>
                </div>
            </div>
            <button onclick="logout()" class="w-full mt-10 bg-rose-50 text-rose-600 font-black py-4 rounded-2xl border border-rose-100 transition-all active:scale-95">LOGOUT ACCOUNT</button>
        </div>`;

const newProfileHTML = `<div id="page-profile" class="page px-5 pb-20">
            <div class="bg-white dark:bg-slate-900 p-8 rounded-2xl text-center mb-6 shadow-sm border border-slate-200/80 dark:border-slate-800 relative">
                <button onclick="openEditProfile()" class="absolute top-5 right-5 px-3.5 py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center gap-2 font-semibold text-xs hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors z-10 cursor-pointer border border-blue-100 dark:border-blue-900/40">
                    <i class="fa-solid fa-pen text-xs"></i>
                    <span>Edit Profile</span>
                </button>
                <div id="profileAvatar" class="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4 shadow-sm shadow-blue-500/20">U</div>
                <h2 id="profileName" class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">User Name</h2>
                <p id="profilePhone" class="text-slate-500 dark:text-slate-400 font-medium mt-1 tracking-wide text-sm">+91 1234567890</p>
            </div>
            <div class="space-y-3">
                <div class="flex justify-between items-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                    <span class="text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wider">Gender</span>
                    <span id="profileGender" class="font-bold text-slate-900 dark:text-white text-sm">Male</span>
                </div>
                <div class="flex justify-between items-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                    <span class="text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wider">Age</span>
                    <span id="profileAge" class="font-bold text-slate-900 dark:text-white text-sm">20</span>
                </div>
                <div class="flex justify-between items-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                    <span class="text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wider">Email</span>
                    <div class="text-right">
                        <span id="profileEmail" class="font-bold text-slate-900 dark:text-white text-xs block">email@example.com</span>
                    </div>
                </div>
            </div>
            <button onclick="logout()" class="w-full mt-8 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold py-3.5 rounded-xl border border-rose-200/60 dark:border-rose-900/40 transition-all hover:bg-rose-100 active:scale-[0.98] text-xs uppercase tracking-wider">Sign Out</button>
        </div>`;

if (html.includes('<div id="page-profile" class="page px-5">')) {
    const startP = html.indexOf('<div id="page-profile" class="page px-5">');
    const endP = html.indexOf('<!-- Admin Page -->');
    if (startP !== -1 && endP !== -1) {
        html = html.substring(0, startP) + newProfileHTML + '\n        ' + html.substring(endP);
    }
}

fs.writeFileSync('index.html', html);
console.log("Profile page upgrade complete!");
