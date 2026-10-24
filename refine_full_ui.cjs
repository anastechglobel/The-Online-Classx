const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Refine generateCourseCard for Google/Coursera Blue & White theme
const oldCardFuncStart = `function generateCourseCard(c) {`;
const oldCardFuncEnd = `filtered.slice(0, 4).forEach(c => { list.innerHTML += generateCourseCard(c); });`;

const newCourseCardFunc = `        function generateCourseCard(c) {
            const id = c.id;
            const hasAccess = (userData && userData.purchased && userData.purchased[id]) || c.type === 'Free';
            const isPending = pendingPurchases.has(id);
            const priceVal = c.discount > 0 ? Math.round(c.price * (1 - c.discount/100)) : c.price;
            return \`
                <div onclick="openCourse('\${id}', '\${c.type}')" class="course-card group flex flex-col md:flex-row gap-5 p-5 cursor-pointer bg-white dark:bg-slate-900 rounded-2xl hover:shadow-xl hover:shadow-blue-500/10 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 transition-all duration-300">
                    <div class="relative w-full md:w-44 h-44 md:h-auto shrink-0 overflow-hidden rounded-xl shadow-sm">
                        <img src="\${c.thumbnail}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="\${c.title}">
                        <div class="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors"></div>
                        \${c.tag ? \`<span class="absolute top-3 left-3 \${c.tag === 'NEW' ? 'bg-emerald-600' : 'bg-blue-600'} text-[9px] font-bold px-2.5 py-1 rounded-md text-white shadow-sm uppercase tracking-wider z-10">\${c.tag}</span>\` : ''}
                        <div class="absolute bottom-3 right-3 bg-white/95 dark:bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-slate-100 dark:border-slate-800">
                            <i class="fa-solid fa-star text-xs text-amber-400"></i>
                            <span class="text-xs font-bold text-slate-800 dark:text-slate-200">\${c.rating || '4.8'}</span>
                        </div>
                    </div>
                    <div class="flex-1 flex flex-col justify-between py-1">
                        <div>
                            <div class="flex justify-between items-start mb-2 gap-2">
                                <div class="flex gap-2 items-center flex-wrap">
                                    <span class="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-semibold px-2.5 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/50">\${c.category}</span>
                                    <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">\${c.difficulty || 'Beginner'}</span>
                                </div>
                                <div class="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                                    <i class="fa-solid fa-user-tie text-xs"></i>
                                    <span class="text-xs font-medium text-slate-600 dark:text-slate-400 truncate max-w-[120px]">\${c.instructor || 'Faculty'}</span>
                                </div>
                            </div>
                            <h3 class="font-bold text-base md:text-lg leading-snug mb-1.5 line-clamp-2 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">\${c.title}</h3>
                            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal mb-3">\${c.description || 'Structured coaching course with comprehensive modules.'}</p>
                            
                            <div class="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                                <span class="flex items-center gap-1.5"><i class="fa-solid fa-play-circle text-blue-500"></i> Video Modules</span>
                                <span class="flex items-center gap-1.5"><i class="fa-solid fa-file-pdf text-rose-500"></i> PDF Notes</span>
                                <span class="flex items-center gap-1.5"><i class="fa-solid fa-circle-check text-emerald-500"></i> Full Access</span>
                            </div>
                        </div>
                        <div class="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <div class="flex flex-col">
                                \${c.discount > 0 ? \`
                                    <span class="text-slate-400 line-through text-xs font-normal">₹\${c.price}</span>
                                    <div class="flex items-center gap-2">
                                        <span class="text-blue-600 dark:text-blue-400 font-bold text-xl leading-none">₹\${priceVal}</span>
                                        <span class="bg-rose-50 text-rose-600 border border-rose-200/60 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-2xs">-\${c.discount}%</span>
                                    </div>
                                \` : \`
                                    <span class="text-blue-600 dark:text-blue-400 font-bold text-xl leading-none">\${c.price > 0 ? '₹' + c.price : 'FREE'}</span>
                                \`}
                            </div>
                            <div class="flex items-center gap-2">
                                \${hasAccess ? 
                                    '<span class="text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40"><i class="fa-solid fa-circle-check text-emerald-500"></i> Enrolled</span>' :
                                    (isPending ?
                                        '<span class="text-amber-600 dark:text-amber-400 font-semibold text-xs flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-4 py-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40"><i class="fa-solid fa-clock text-amber-500"></i> Pending</span>' :
                                        '<button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-sm hover:shadow-blue-500/20 transition-all active:scale-[0.98]"><i class="fa-solid fa-bolt text-xs"></i> Enroll Now</button>'
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
            \`;
        }`;

// Replace generateCourseCard function
const startCardIdx = html.indexOf('function generateCourseCard(c) {');
const endCardIdx = html.indexOf('// Force Clear if logout param found');

if (startCardIdx !== -1 && endCardIdx !== -1) {
    html = html.substring(0, startCardIdx) + newCourseCardFunc + '\n\n        ' + html.substring(endCardIdx);
}

// 2. Refine Home Screen grid menu cards to use clean blue accent icons and 16-20px rounded cards
const oldGrid = `<div class="grid grid-cols-3 gap-3 mb-12">`;
if (html.includes(oldGrid)) {
    const gridEndIdx = html.indexOf('</div>', html.indexOf(oldGrid) + 1500);
    const newGrid = `<div class="grid grid-cols-3 gap-3.5 mb-10">
                <!-- Paid Courses -->
                <div onclick="navigateTo('courses')" class="group bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center gap-2.5 transition-all duration-200 hover:border-blue-500 hover:shadow-md cursor-pointer active:scale-95">
                    <div class="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-transform group-hover:scale-105">
                        <i class="fa-solid fa-graduation-cap text-lg"></i>
                    </div>
                    <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 text-center leading-tight">Paid<br>Courses</span>
                </div>
                <!-- Free Courses -->
                <div onclick="navigateTo('courses')" class="group bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center gap-2.5 transition-all duration-200 hover:border-emerald-500 hover:shadow-md cursor-pointer active:scale-95">
                    <div class="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-transform group-hover:scale-105">
                        <i class="fa-solid fa-book-open text-lg"></i>
                    </div>
                    <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 text-center leading-tight">Free<br>Courses</span>
                </div>
                <!-- Live Classes -->
                <div onclick="navigateTo('live')" class="group bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center gap-2.5 transition-all duration-200 hover:border-rose-500 hover:shadow-md cursor-pointer active:scale-95">
                    <div class="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-transform group-hover:scale-105">
                        <i class="fa-solid fa-tower-broadcast text-lg"></i>
                    </div>
                    <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 text-center leading-tight">Live<br>Classes</span>
                </div>
                <!-- PDF Notes -->
                <div onclick="navigateTo('notes')" class="group bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center gap-2.5 transition-all duration-200 hover:border-amber-500 hover:shadow-md cursor-pointer active:scale-95">
                    <div class="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center transition-transform group-hover:scale-105">
                        <i class="fa-solid fa-file-pdf text-lg"></i>
                    </div>
                    <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 text-center leading-tight">PDF<br>Notes</span>
                </div>
                <!-- Paid Test -->
                <div onclick="navigateTo('tests')" class="group bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center gap-2.5 transition-all duration-200 hover:border-purple-500 hover:shadow-md cursor-pointer active:scale-95">
                    <div class="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center transition-transform group-hover:scale-105">
                        <i class="fa-solid fa-vial text-lg"></i>
                    </div>
                    <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 text-center leading-tight">Paid<br>Test</span>
                </div>
                <!-- Free Test -->
                <div onclick="navigateTo('tests')" class="group bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center gap-2.5 transition-all duration-200 hover:border-cyan-500 hover:shadow-md cursor-pointer active:scale-95">
                    <div class="w-11 h-11 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center transition-transform group-hover:scale-105">
                        <i class="fa-solid fa-clipboard-check text-lg"></i>
                    </div>
                    <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 text-center leading-tight">Free<br>Test</span>
                </div>
            </div>`;
    
    // Replace grid portion
    const searchIdx = html.indexOf(oldGrid);
    if (searchIdx !== -1) {
        const fullOldGrid = html.substring(searchIdx, html.indexOf('<!-- My Courses Page -->'));
        const newGridChunk = newGrid + '\n        </div>\n';
        html = html.replace(fullOldGrid, newGridChunk);
    }
}

fs.writeFileSync('index.html', html);
console.log("Full UI refinement completed!");
