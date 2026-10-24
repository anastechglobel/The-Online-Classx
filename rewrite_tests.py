import re

with open('index.html', 'r') as f:
    content = f.read()

sig_start = "            // checks moved below"
sig_end = "            if (noTests) {"

if sig_start in content and sig_end in content:
    idx_start = content.find(sig_start)
    idx_end = content.find(sig_end)
    
    old_block = content[idx_start:idx_end]
    
    new_block = '''
            let visibleCount = 0;
            const grouped = {};
            
            filtered.forEach(t => {
                const isPaid = (t.status === 'Paid');
                
                let hasPurchased = userData && userData.purchased && (userData.purchased[t.id] || (t.courseId && userData.purchased[t.courseId]));
                if (!hasPurchased && userData && userData.purchased && typeof allCoursesCached !== 'undefined') {
                    allCoursesCached.forEach(c => {
                        if (userData.purchased[c.id] && c.linkedTestIds && c.linkedTestIds.includes(t.id)) {
                            hasPurchased = true;
                        }
                    });
                }
                const isAdmin = userData && (userData.role === 'admin' || userData.isAdmin);
                const canAccess = !isPaid || hasPurchased || isAdmin; 
                
                if (!canAccess) return;
                visibleCount++;
                
                let subject = t.subject || t.category || 'General';
                if (!grouped[subject]) grouped[subject] = [];
                grouped[subject].push({t, canAccess, isPaid, hasPurchased});
            });
            
            list.className = "flex flex-col gap-4"; // Ensure we don't use grid for accordions
            
            Object.keys(grouped).sort().forEach((subject, sIdx) => {
                const accId = 'acc-tests-' + sIdx;
                let html = `
                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div onclick="toggleAccordion('${accId}')" class="flex justify-between items-center p-5 cursor-pointer hover:bg-slate-50 transition-colors">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                                <i class="fa-solid fa-vial"></i>
                            </div>
                            <h3 class="font-black text-slate-800 tracking-tight">${subject}</h3>
                            <span class="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-lg">${grouped[subject].length}</span>
                        </div>
                        <i id="${accId}-icon" class="fa-solid fa-chevron-down text-slate-400 transition-transform"></i>
                    </div>
                    <div id="${accId}" class="hidden border-t border-slate-100 p-4 bg-slate-50/50">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                `;
                
                grouped[subject].forEach(item => {
                    const {t, canAccess, isPaid, hasPurchased} = item;
                    const qCount = t.questionsCount || (t.questions ? t.questions.length : 0);
                    const discountText = t.discount ? `<span class="bg-emerald-50 text-emerald-600 text-[8px] font-black px-1.5 py-0.5 rounded ml-2">${t.discount}% OFF</span>` : '';
                    html += `
                        <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col gap-3 transition-all hover:shadow-md hover:border-indigo-100 group">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 ${isPaid ? 'bg-amber-50 text-amber-500' : 'bg-indigo-50 text-indigo-500'} rounded-xl flex flex-shrink-0 items-center justify-center text-xl transition-transform group-hover:scale-110">
                                    <i class="fa-solid ${isPaid ? 'fa-crown' : 'fa-vials'}"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h3 class="text-xs font-black text-slate-800 truncate">${t.title}</h3>
                                    <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">${qCount} Questions • ${t.timer || 20}s/Q</p>
                                </div>
                                <div class="text-right">
                                    ${isPaid && !hasPurchased ? `
                                        <div class="mb-2">
                                            <p class="text-[9px] font-black text-slate-400 line-through">₹${t.price || 0}</p>
                                            <p class="text-xs font-black text-slate-900">₹${Math.round((t.price || 0) * (1 - (t.discount || 0)/100))}</p>
                                        </div>
                                    ` : ''}
                                    <button onclick="${canAccess ? `startQuiz('${t.id}')` : `openPurchaseModal('${t.id}', 'test')`}" 
                                        class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95 ${canAccess ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-amber-500 text-white hover:bg-amber-600'}">
                                        ${canAccess ? 'Attempt' : 'Buy Now'}
                                    </button>
                                </div>
                            </div>
                        </div>`;
                });
                
                html += `</div></div></div>`;
                list.innerHTML += html;
            });\n'''
    content = content.replace(old_block, new_block)
    with open('index.html', 'w') as f:
        f.write(content)
    print("Tests replaced successfully")
else:
    print("Signatures not found for tests")
