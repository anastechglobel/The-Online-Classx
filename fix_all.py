import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Helper function string
safe_helpers = """
        function safeSetValue(id, val) {
            const el = document.getElementById(id);
            if (el) el.value = val !== undefined && val !== null ? val : '';
        }
        function safeSetText(id, text) {
            const el = document.getElementById(id);
            if (el) el.innerText = text !== undefined && text !== null ? text : '';
        }
        function safeClassAdd(id, cls) {
            const el = document.getElementById(id);
            if (el) el.classList.add(cls);
        }
        function safeClassRemove(id, cls) {
            const el = document.getElementById(id);
            if (el) el.classList.remove(cls);
        }
        function isItemFree(item) {
            if (!item) return true;
            if (item.isFree === true || item.isFree === 'true') return true;
            if (item.type === 'Free' || item.status === 'Free' || item.access === 'Free' || item.accessType === 'Free') return true;
            const isExplicitlyPaid = (item.type === 'Paid' || item.status === 'Paid' || item.access === 'Paid' || item.accessType === 'Paid' || item.isPaid === true || item.isPaid === 'true');
            if (isExplicitlyPaid) {
                if (item.price && Number(item.price) > 0) return false;
                return true;
            }
            if (item.price && Number(item.price) > 0) return false;
            return true;
        }
"""

# 1. Insert safe helpers in index.html if not present
if 'function isItemFree(' not in text:
    idx = text.find('function checkItemAccess(')
    if idx != -1:
        text = text[:idx] + safe_helpers + "\n" + text[idx:]

# 2. Update checkItemAccess to use isItemFree
check_access_old = "const isFree = item.type === 'Free' || item.status === 'Free' || item.accessType === 'Free' || item.isFree;\n            if (isFree) return true;"
check_access_new = "if (isItemFree(item)) return true;"
text = text.replace(check_access_old, check_access_new)

# 3. Fix setTestTab
set_test_tab_old_pattern = r'function setTestTab\(tab\)\s*\{[^}]+\}'
set_test_tab_new = """function setTestTab(tab) {
            activeTestTab = tab;
            const bAll = document.getElementById('tabTestAll');
            const bFree = document.getElementById('tabTestFree');
            const bPaid = document.getElementById('tabTestPaid');
            const activeCls = 'text-[9px] font-black uppercase px-4 py-2 rounded-lg bg-white text-indigo-600 shadow-sm transition-all';
            const inactiveCls = 'text-[9px] font-black uppercase px-4 py-2 rounded-lg text-slate-500 transition-all';
            if (bAll) bAll.className = tab === 'All' ? activeCls : inactiveCls;
            if (bFree) bFree.className = tab === 'Free' ? activeCls : inactiveCls;
            if (bPaid) bPaid.className = tab === 'Paid' ? activeCls : inactiveCls;
            renderTests();
        }"""
text = re.sub(set_test_tab_old_pattern, set_test_tab_new, text, count=1)

# 4. Replace renderTests completely
s_tests = text.find('function renderTests() {')
e_tests = text.find('window.renderTests = renderTests;', s_tests) + len('window.renderTests = renderTests;')

new_render_tests = """function renderTests() {
            if (!coursesLoaded) return;
            const list = document.getElementById('fullTestsList');
            const noTests = document.getElementById('noTestsMsg');
            const catList = document.getElementById('testCategoryList');
            if(!list) return;
            list.innerHTML = '';

            // Render test subject list
            if(catList) {
                catList.innerHTML = `<button onclick="selectTestSubject('')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeTestSubject === '' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">All</button>`;
                allSubjectsCached.forEach(sub => {
                    const subName = sub.name || sub.id || sub;
                    catList.innerHTML += `<button onclick="selectTestSubject('${subName}')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeTestSubject === subName ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">${subName}</button>`;
                });
            }

            let filtered = allTestsCached.filter(t => {
                const isFree = isItemFree(t);
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
                const isFree = isItemFree(t);
                const isPaid = !isFree;
                let hasPurchased = checkItemAccess(t, 'test');
                const canAccess = isFree || hasPurchased;

                const qCount = t.questionsCount || (t.questions ? t.questions.length : 0);

                list.innerHTML += `
                    <div class="card-white overflow-hidden group">
                        <div class="p-5 flex items-center gap-4">
                            <div class="w-14 h-14 ${isPaid ? 'bg-amber-50 text-amber-500' : 'bg-indigo-50 text-indigo-500'} rounded-2xl flex flex-shrink-0 items-center justify-center text-2xl transition-transform group-hover:scale-110">
                                <i class="fa-solid ${isPaid ? 'fa-crown' : 'fa-vials'}"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">${t.category || 'General'}</span>
                                    ${t.subject ? `<span class="bg-indigo-50 text-indigo-600 text-[8px] font-black px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-widest">${t.subject}</span>` : ''}
                                    ${isPaid ? '<span class="text-[8px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-widest"><i class="fa-solid fa-star text-[7px] mr-1"></i>PRO</span>' : '<span class="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">FREE TEST</span>'}
                                </div>
                                <h3 class="font-black text-slate-800 truncate">${t.title}</h3>
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
                                    class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${canAccess ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-amber-500 text-white shadow-amber-100'}">
                                    ${canAccess ? 'Attempt' : 'Buy Now'}
                                </button>
                            </div>
                        </div>
                        ${isPaid && !hasPurchased && t.description ? `<p class="px-5 pb-4 text-[10px] text-slate-500 font-medium leading-relaxed italic border-t border-slate-50 pt-3 mt-1">"${t.description}"</p>` : ''}
                    </div>`;
            });
        }
        window.renderTests = renderTests;"""

if s_tests != -1 and e_tests != -1:
    text = text[:s_tests] + new_render_tests + text[e_tests:]

# 5. Replace renderNotes completely
s_notes = text.find('function renderNotes() {')
e_notes = text.find('window.renderNotes = renderNotes;', s_notes) + len('window.renderNotes = renderNotes;')

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

                list.innerHTML += `
                    <div onclick="${canView ? `viewPdf('${n.url}', '${n.title}')` : 'showToast(\'Unlock Course to View PDF\')'}" class="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-50 active:scale-95 transition-all cursor-pointer">
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

if s_notes != -1 and e_notes != -1:
    text = text[:s_notes] + new_render_notes + text[e_notes:]

# 6. Replace renderLive filtering
s_live = text.find('function renderLive() {')
e_live = text.find('window.renderLive = renderLive;', s_live)
if e_live == -1:
    e_live = text.find('function generateLiveCard', s_live)

old_live_block = text[s_live:e_live]
# Fix type filter in renderLive
old_live_filter = """const filtered = allLiveCached.filter(l => {
                const matchesCat = !activeCategory || l.category === activeCategory;
                const matchesSub = !activeLiveSubject || (l.subject && l.subject === activeLiveSubject);
                const matchesSearch = !searchQ || (l.title && l.title.toLowerCase().includes(searchQ));
                const isFree = l.type === 'Free' || l.status === 'Free' || l.accessType === 'Free' || l.isFree;
                const lType = isFree ? 'Free' : 'Paid';
                const matchesType = typeQ === 'All' || lType === typeQ;
                
                const hasAccess = checkItemAccess(l, 'live');
                if (lType === 'Paid' && !hasAccess) return false;
                return matchesCat && matchesSub && matchesSearch && matchesType;
            });"""

new_live_filter = """const filtered = allLiveCached.filter(l => {
                const matchesCat = !activeCategory || !l.category || l.category === activeCategory || l.category === 'General';
                const matchesSub = !activeLiveSubject || (l.subject && l.subject === activeLiveSubject);
                const matchesSearch = !searchQ || (l.title && l.title.toLowerCase().includes(searchQ));
                const isFree = isItemFree(l);
                const matchesType = typeQ === 'All' || (typeQ === 'Free' && isFree) || (typeQ === 'Paid' && !isFree);
                return matchesCat && matchesSub && matchesSearch && matchesType;
            });"""

text = text.replace(old_live_filter, new_live_filter)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("fix_all applied to index.html successfully!")
