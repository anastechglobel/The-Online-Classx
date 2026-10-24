with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()

# Update renderNotes
notes_idx = text.find("function renderNotes()")
notes_end = text.find("window.renderNotes = renderNotes;", notes_idx) + len("window.renderNotes = renderNotes;")

new_render_notes = """function renderNotes() {
            if (!coursesLoaded) return;
            const list = document.getElementById('fullNotesList');
            const noNotes = document.getElementById('noNotesMsg');
            const catList = document.getElementById('notesCategoryList');
            if(!list) return;
            list.innerHTML = "";

            if(catList) {
                catList.innerHTML = `<button onclick="selectNoteSubject('')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeNoteSubject === '' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">All</button>`;
                allSubjectsCached.forEach(sub => {
                    const subName = sub.name || sub.id || sub;
                    catList.innerHTML += `<button onclick="selectNoteSubject('${subName}')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeNoteSubject === subName ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">${subName}</button>`;
                });
            }

            const searchInput = document.getElementById('notesSearchInput');
            const searchQ = searchInput ? searchInput.value.trim().toLowerCase() : '';
            const typeFilter = document.getElementById('notesTypeFilter');
            const typeQ = typeFilter ? typeFilter.value : 'All';

            let filtered = allNotesCached.filter(n => {
                const isFree = isItemFree(n, 'note');
                const matchesType = typeQ === 'All' || (typeQ === 'Free' && isFree) || (typeQ === 'Paid' && !isFree);
                const matchesCat = !activeCategory || !n.category || n.category === activeCategory || n.category === 'General';
                const matchesSub = !activeNoteSubject || (n.subject && n.subject === activeNoteSubject);
                const matchesSearch = !searchQ || (n.title && n.title.toLowerCase().includes(searchQ));

                return matchesCat && matchesSub && matchesSearch && matchesType;
            });

            if (filtered.length === 0) {
                safeClassRemove('noNotesMsg', 'hidden');
            } else {
                safeClassAdd('noNotesMsg', 'hidden');
            }

            filtered.forEach(n => {
                const isFree = isItemFree(n, 'note');
                let hasAccess = checkItemAccess(n, 'note');
                const canView = isFree || hasAccess;
                const clickAction = canView ? `viewPdf('${n.url}', '${n.title}')` : `handleLockedItemClick('${n.id}', 'note')`;

                list.innerHTML += `
                    <div onclick="${clickAction}" class="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-50 active:scale-95 transition-all cursor-pointer">
                        <div class="w-14 h-14 ${isFree ? 'bg-emerald-50 text-emerald-600' : (hasAccess ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-500')} rounded-xl flex items-center justify-center text-xl shrink-0">
                            <i class="fa-solid ${isFree ? 'fa-file-pdf' : (hasAccess ? 'fa-file-pdf text-emerald-600' : 'fa-lock')}"></i>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-0.5">
                                <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">${n.category || 'General'}</span>
                                ${n.subject ? `<span class="bg-indigo-50 text-indigo-600 text-[8px] font-black px-1.5 py-0.5 rounded border border-indigo-100 uppercase tracking-widest">${n.subject}</span>` : ''}
                                ${isFree ? '<span class="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">FREE</span>' : (hasAccess ? '<span class="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">UNLOCKED</span>' : '<span class="text-[8px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-widest">PRO</span>')}
                            </div>
                            <h3 class="text-sm font-black text-slate-800">${n.title}</h3>
                        </div>
                        <div class="text-slate-300"><i class="fa-solid fa-chevron-right"></i></div>
                    </div>`;
            });
        }
        window.renderNotes = renderNotes;"""

text = text[:notes_idx] + new_render_notes + text[notes_end:]

# Update renderTests
tests_idx = text.find("function renderTests()")
tests_end = text.find("window.renderTests = renderTests;", tests_idx) + len("window.renderTests = renderTests;")

new_render_tests = """function renderTests() {
            if (!coursesLoaded) return;
            const list = document.getElementById('fullTestsList');
            const noTests = document.getElementById('noTestsMsg');
            const catList = document.getElementById('testCategoryList');
            if(!list) return;
            list.innerHTML = '';
            
            if(catList) {
                catList.innerHTML = `<button onclick="selectTestSubject('')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeTestSubject === '' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">All</button>`;
                allSubjectsCached.forEach(sub => {
                    const subName = sub.name || sub.id || sub;
                    catList.innerHTML += `<button onclick="selectTestSubject('${subName}')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeTestSubject === subName ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">${subName}</button>`;
                });
            }

            let filtered = allTestsCached.filter(t => {
                const isFree = isItemFree(t, 'test');
                const isPaid = !isFree;
                const matchesTab = (activeTestTab === 'All') || (activeTestTab === 'Free' && isFree) || (activeTestTab === 'Paid' && isPaid);
                const matchesCat = !activeCategory || !t.category || t.category === activeCategory || t.category === 'General';
                const matchesSub = !activeTestSubject || (t.subject && t.subject === activeTestSubject);
                return matchesTab && matchesCat && matchesSub;
            });

            if(filtered.length === 0) {
                if(noTests) safeClassRemove('noTestsMsg', 'hidden');
                return;
            }
            if(noTests) safeClassAdd('noTestsMsg', 'hidden');

            filtered.forEach(t => {
                const isFree = isItemFree(t, 'test');
                const isPaid = !isFree;
                let hasPurchased = checkItemAccess(t, 'test');
                const canAccess = isFree || hasPurchased;
                const qCount = t.questionsCount || (t.questions ? t.questions.length : 0);
                const clickAction = canAccess ? `startQuiz('${t.id}')` : `handleLockedItemClick('${t.id}', 'test')`;

                list.innerHTML += `
                    <div class="card-white overflow-hidden group">
                        <div class="p-5 flex items-center gap-4">
                            <div class="w-14 h-14 ${isPaid && !hasPurchased ? 'bg-amber-50 text-amber-500' : 'bg-indigo-50 text-indigo-500'} rounded-2xl flex flex-shrink-0 items-center justify-center text-2xl transition-transform group-hover:scale-110">
                                <i class="fa-solid ${isPaid && !hasPurchased ? 'fa-crown' : 'fa-vials'}"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">${t.category || 'General'}</span>
                                    ${t.subject ? `<span class="bg-indigo-50 text-indigo-600 text-[8px] font-black px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-widest">${t.subject}</span>` : ''}
                                    ${isPaid ? (hasPurchased ? '<span class="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">UNLOCKED</span>' : '<span class="text-[8px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-widest"><i class="fa-solid fa-star text-[7px] mr-1"></i>PRO</span>') : '<span class="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">FREE TEST</span>'}
                                </div>
                                <h3 class="font-black text-slate-800 truncate">${t.title}</h3>
                                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">${qCount} Questions • ${t.timer || 20}s/Q</p>
                            </div>
                            <div class="text-right">
                                ${isPaid && !hasPurchased && t.price > 0 ? `
                                    <div class="mb-2">
                                        <p class="text-[9px] font-black text-slate-400 line-through">₹${t.price || 0}</p>
                                        <p class="text-xs font-black text-slate-900">₹${Math.round((t.price || 0) * (1 - (t.discount || 0)/100))}</p>
                                    </div>
                                ` : ''}
                                <button onclick="${clickAction}"
                                     class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${canAccess ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-amber-500 text-white shadow-amber-100'}">
                                    ${canAccess ? 'Attempt' : 'Buy Course'}
                                </button>
                            </div>
                        </div>
                        ${isPaid && !hasPurchased && t.description ? `<p class="px-5 pb-4 text-[10px] text-slate-500 font-medium leading-relaxed italic border-t border-slate-50 pt-3 mt-1">"${t.description}"</p>` : ''}
                    </div>`;
            });
        }
        window.renderTests = renderTests;"""

text = text[:tests_idx] + new_render_tests + text[tests_end:]

with open("index.html", "w", encoding="utf-8") as f:
    f.write(text)

print("Updated renderNotes and renderTests successfully!")
