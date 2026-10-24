with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()

idx = text.find("function renderNotes()")
end_idx = text.find("window.renderNotes = renderNotes;", idx) + len("window.renderNotes = renderNotes;")

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
                const isFree = isItemFree(n);
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
                const isFree = isItemFree(n);
                let hasAccess = checkItemAccess(n, 'note');
                const canView = isFree || hasAccess;
                const clickAction = canView ? `viewPdf('${n.url}', '${n.title}')` : `showToast('Unlock Course to View PDF')`;

                list.innerHTML += `
                    <div onclick="${clickAction}" class="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-50 active:scale-95 transition-all cursor-pointer">
                        <div class="w-14 h-14 ${isFree ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-500'} rounded-xl flex items-center justify-center text-xl shrink-0">
                            <i class="fa-solid ${isFree ? 'fa-file-pdf' : 'fa-lock'}"></i>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-0.5">
                                <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">${n.category || 'General'}</span>
                                ${n.subject ? `<span class="bg-indigo-50 text-indigo-600 text-[8px] font-black px-1.5 py-0.5 rounded border border-indigo-100 uppercase tracking-widest">${n.subject}</span>` : ''}
                                ${isFree ? '<span class="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">FREE</span>' : '<span class="text-[8px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-widest">PRO</span>'}
                            </div>
                            <h3 class="text-sm font-black text-slate-800">${n.title}</h3>
                        </div>
                        <div class="text-slate-300"><i class="fa-solid fa-chevron-right"></i></div>
                    </div>`;
            });
        }
        window.renderNotes = renderNotes;"""

text = text[:idx] + new_render_notes + text[end_idx:]

with open("index.html", "w", encoding="utf-8") as f:
    f.write(text)

print("Updated renderNotes successfully")
