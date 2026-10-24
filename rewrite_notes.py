import re

with open('index.html', 'r') as f:
    content = f.read()

# Replace logic in renderNotes
sig_start = "            // message check moved to end"
sig_end = "            if (noNotesMsg) {"

if sig_start in content and sig_end in content:
    idx_start = content.find(sig_start)
    idx_end = content.find(sig_end)
    
    old_block = content[idx_start:idx_end]
    
    new_block = '''            const coursesMap = {};
            allCoursesCached.forEach(c => coursesMap[c.id] = c);
            
            let visibleCountNotes = 0;
            const grouped = {};
            
            filtered.forEach(n => {
                let isFree = !n.type || n.type === 'Free' || n.type === 'free' || n.type === 'FREE' || n.type === 'Public' || n.type === 'public';
                let isAdmin = userData && (userData.role === 'admin' || userData.role === 'staff' || userData.isAdmin);
                let hasAccess = isFree || isAdmin;
                
                if (!hasAccess && userData && userData.purchased) {
                    if (n.courseId && userData.purchased[n.courseId]) hasAccess = true;
                    Object.keys(userData.purchased).forEach(cid => {
                        const course = coursesMap[cid];
                        if (course && (course.linkedNoteId === n.id || (course.linkedNoteIds && course.linkedNoteIds.includes(n.id)) || course.id === n.courseId)) hasAccess = true;
                    });
                }
                if (!hasAccess) return;
                visibleCountNotes++;
                
                let subject = n.subject || n.category || 'General';
                if (!grouped[subject]) grouped[subject] = [];
                grouped[subject].push(n);
            });
            
            list.className = "flex flex-col gap-4"; // override grid
            
            Object.keys(grouped).sort().forEach((subject, sIdx) => {
                const accId = 'acc-notes-' + sIdx;
                let html = `
                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div onclick="toggleAccordion('${accId}')" class="flex justify-between items-center p-5 cursor-pointer hover:bg-slate-50 transition-colors">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                                <i class="fa-solid fa-folder-open"></i>
                            </div>
                            <h3 class="font-black text-slate-800 tracking-tight">${subject}</h3>
                            <span class="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-lg">${grouped[subject].length}</span>
                        </div>
                        <i id="${accId}-icon" class="fa-solid fa-chevron-down text-slate-400 transition-transform"></i>
                    </div>
                    <div id="${accId}" class="hidden border-t border-slate-100 p-4 bg-slate-50/50">
                        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                `;
                
                grouped[subject].forEach(n => {
                    const safeTitle = (n.title || 'Study Note').replace(/"/g, '&quot;');
                    const noteTypeLabel = isFree ? '<span class="text-emerald-500 font-black">FREE</span>' : '<span class="text-rose-500 font-black">PREMIUM</span>';
                    html += `
                        <div onclick="openNote('${n.id}')" class="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 active:scale-95 transition-all cursor-pointer group">
                            <div class="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <i class="fa-solid fa-file-pdf text-xl"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h3 class="text-xs font-black text-slate-800 truncate">${safeTitle}</h3>
                                <p class="text-[9px] text-slate-400 font-bold uppercase mt-0.5">${noteTypeLabel} PDF</p>
                            </div>
                            <div class="text-slate-300 group-hover:text-indigo-400 transition-colors"><i class="fa-solid fa-chevron-right"></i></div>
                        </div>`;
                });
                
                html += `</div></div></div>`;
                list.innerHTML += html;
            });\n'''
    content = content.replace(old_block, new_block)
    with open('index.html', 'w') as f:
        f.write(content)
    print("Notes replaced successfully")
else:
    print("Signatures not found for notes")
