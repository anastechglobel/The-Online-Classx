import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add allSubjectsCached variable declaration
text = text.replace(
    "let allCategoriesCached = [];",
    "let allCategoriesCached = [];\n        let allSubjectsCached = [];"
)

# 2. Add subjects listener inside loadAppData()
load_app_data_anchor = "// Load Categories"
subjects_listener = """            // Load Subjects
            fb.onValue(fb.ref(db, 'subjects'), snapshot => {
                allSubjectsCached = [];
                if (snapshot.exists()) {
                    snapshot.forEach(child => {
                        allSubjectsCached.push({ id: child.key, ...child.val() });
                    });
                }
                renderTests();
                renderNotes();
                renderLive();
            });

            // Load Categories"""

text = text.replace(load_app_data_anchor, subjects_listener)

# 3. Replace renderTests function completely with robust implementation
old_render_tests_start = text.find('function renderTests() {')
old_render_tests_end = text.find('window.renderTests = renderTests;', old_render_tests_start) + len('window.renderTests = renderTests;')

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
                const isPaid = (t.status === 'Paid' || t.access === 'Paid' || t.accessType === 'Paid' || t.type === 'Paid' || t.isPaid === true);
                const isFree = !isPaid;

                const matchesTab = (activeTestTab === 'All') || (activeTestTab === 'Free' && isFree) || (activeTestTab === 'Paid' && isPaid);
                const matchesCat = !activeCategory || t.category === activeCategory;
                const matchesSub = !activeTestSubject || (t.subject && t.subject === activeTestSubject);

                return matchesTab && matchesCat && matchesSub;
            });

            if(filtered.length === 0) {
                if(noTests) noTests.classList.remove('hidden');
                return;
            }
            if(noTests) noTests.classList.add('hidden');

            filtered.forEach(t => {
                const isPaid = (t.status === 'Paid' || t.access === 'Paid' || t.accessType === 'Paid' || t.type === 'Paid' || t.isPaid === true);
                let hasPurchased = checkItemAccess(t, 'test');
                const canAccess = !isPaid || hasPurchased;

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

if old_render_tests_start != -1 and old_render_tests_end != -1:
    text = text[:old_render_tests_start] + new_render_tests + text[old_render_tests_end:]

# 4. Replace renderNotes function completely
old_render_notes_start = text.find('function renderNotes() {')
old_render_notes_end = text.find('window.renderNotes = renderNotes;', old_render_notes_start) + len('window.renderNotes = renderNotes;')

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
                const isPaid = (n.type === 'Paid' || n.status === 'Paid' || n.accessType === 'Paid' || n.isPaid === true);
                const isFree = !isPaid;

                const matchesType = typeQ === 'All' || (typeQ === 'Free' && isFree) || (typeQ === 'Paid' && isPaid);
                const matchesCat = !activeCategory || n.category === activeCategory;
                const matchesSub = !activeNoteSubject || (n.subject && n.subject === activeNoteSubject);
                const matchesSearch = !searchQ || (n.title && n.title.toLowerCase().includes(searchQ));

                const hasAccess = checkItemAccess(n, 'note');
                if (isPaid && !hasAccess) return false;

                return matchesCat && matchesSub && matchesSearch && matchesType;
            });

            if (filtered.length === 0) {
                if(noNotes) noNotes.classList.remove('hidden');
                return;
            }
            if(noNotes) noNotes.classList.add('hidden');

            filtered.forEach(n => {
                const isPaid = (n.type === 'Paid' || n.status === 'Paid' || n.accessType === 'Paid' || n.isPaid === true);
                
                list.innerHTML += `
                    <div class="card-white p-5 flex items-center justify-between gap-4 group hover:border-indigo-100 transition-all">
                        <div class="flex items-center gap-4 min-w-0 flex-1">
                            <div class="w-12 h-12 ${isPaid ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-600'} rounded-2xl flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                                <i class="fa-solid ${isPaid ? 'fa-lock' : 'fa-file-pdf'}"></i>
                            </div>
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">${n.category || 'General'}</span>
                                    ${n.subject ? `<span class="bg-indigo-50 text-indigo-600 text-[8px] font-black px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-widest">${n.subject}</span>` : ''}
                                    ${isPaid ? '<span class="text-[8px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-widest">PRO</span>' : '<span class="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">FREE</span>'}
                                </div>
                                <h3 class="font-black text-slate-800 text-sm truncate">${n.title}</h3>
                            </div>
                        </div>
                        <a href="${n.url}" target="_blank" class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all flex items-center gap-2 flex-shrink-0">
                            <i class="fa-solid fa-download text-xs"></i> Open
                        </a>
                    </div>
                `;
            });
        }
        window.renderNotes = renderNotes;"""

if old_render_notes_start != -1 and old_render_notes_end != -1:
    text = text[:old_render_notes_start] + new_render_notes + text[old_render_notes_end:]

# 5. Replace renderLive catList subject generator
old_live_catlist = """if(catList) {
                catList.innerHTML = `<button onclick="selectTestSubject('')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeTestSubject === '' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">All</button>`;
                allSubjectsCached.forEach(sub => {
                    catList.innerHTML += `<button onclick="selectTestSubject('${sub.name}')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeTestSubject === sub.name ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">${sub.name}</button>`;
                });
            }"""

new_live_catlist = """if(catList) {
                catList.innerHTML = `<button onclick="selectLiveSubject('')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeLiveSubject === '' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">All</button>`;
                allSubjectsCached.forEach(sub => {
                    const subName = sub.name || sub.id || sub;
                    catList.innerHTML += `<button onclick="selectLiveSubject('${subName}')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeLiveSubject === subName ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">${subName}</button>`;
                });
            }"""

text = text.replace(old_live_catlist, new_live_catlist)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fix index applied successfully!")
