import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

match = re.search(r'function renderNotes\(\).*?\}\);\s*\}\s*// Navigation', text, re.DOTALL)

if not match:
    print('Not found')
    exit(1)

old_text = match.group(0)

new_text = '''function renderNotes() {
            const list = document.getElementById('fullNotesList');
            const noNotes = document.getElementById('noNotesMsg');
            const catList = document.getElementById('notesCategoryList');
            if(!list) return;
            list.innerHTML = "";
            
            if(catList) {
                catList.innerHTML = `<button onclick="selectCategory('')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeCategory === '' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">All</button>`;
                allCategoriesCached.forEach(cat => {
                    catList.innerHTML += `<button onclick="selectCategory('${cat.name}')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeCategory === cat.name ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">${cat.name}</button>`;
                });
            }

            const searchInput = document.getElementById('notesSearchInput');
            const searchQ = searchInput ? searchInput.value.trim().toLowerCase() : '';
            const typeFilter = document.getElementById('notesTypeFilter');
            const typeQ = typeFilter ? typeFilter.value : 'All';

            let filtered = allNotesCached.filter(n => {
                const matchesCat = !activeCategory || n.category === activeCategory;
                const matchesSearch = !searchQ || (n.title && n.title.toLowerCase().includes(searchQ));
                const nType = (n.type === 'Free' || n.status === 'Free') ? 'Free' : 'Paid';
                const matchesType = typeQ === 'All' || nType === typeQ;
                return matchesCat && matchesSearch && matchesType;
            });
            
            if (filtered.length === 0) {
                if(noNotes) noNotes.classList.remove('hidden');
            } else {
                if(noNotes) noNotes.classList.add('hidden');
            }

            filtered.forEach(n => {
                let hasAccess = checkItemAccess(n, 'note');
                list.innerHTML += `
                    <div onclick="${hasAccess ? `viewPdf('${n.url}', '${n.title}')` : 'showToast(\\'Unlock Course to View PDF\\')'}" class="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-50 active:scale-95 transition-all cursor-pointer">
                        <div class="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-red-600 shrink-0"><i class="fa-solid fa-file-pdf text-2xl"></i></div>
                        <div class="flex-1">
                            <h3 class="text-sm font-black text-slate-800">${n.title}</h3>
                            <p class="text-[10px] text-slate-400 font-bold uppercase mt-0.5">PDF DOCUMENT ${!hasAccess && n.type !== 'Free' && n.status !== 'Free' ? '<span class="text-amber-500 ml-2"><i class="fa-solid fa-lock"></i> PAID</span>' : ''}</p>
                        </div>
                        <div class="text-slate-200"><i class="fa-solid fa-chevron-right"></i></div>
                    </div>`;
            });
        }
        // Navigation'''

text = text.replace(old_text, new_text)
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print('Done modifying renderNotes')
