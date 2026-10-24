import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add Subject variables
injection = """
        let activeTestSubject = '';
        let activeLiveSubject = '';
        let activeNoteSubject = '';

        window.selectTestSubject = function(sub) {
            activeTestSubject = sub;
            renderTests();
        };
        window.selectLiveSubject = function(sub) {
            activeLiveSubject = sub;
            renderLive();
        };
        window.selectNoteSubject = function(sub) {
            activeNoteSubject = sub;
            renderNotes();
        };
        
        // Test Filtering State"""
text = text.replace('// Test Filtering State', injection)


# 2. Patch renderTests
old_test_cat = """            if(catList) {
                catList.innerHTML = `<button onclick="selectCategory('')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeCategory === '' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">All</button>`;
                allCategoriesCached.forEach(cat => {
                    catList.innerHTML += `<button onclick="selectCategory('${cat.name}')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeCategory === cat.name ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">${cat.name}</button>`;
                });
            }"""
new_test_cat = """            if(catList) {
                catList.innerHTML = `<button onclick="selectTestSubject('')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeTestSubject === '' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">All</button>`;
                allSubjectsCached.forEach(sub => {
                    catList.innerHTML += `<button onclick="selectTestSubject('${sub.name}')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeTestSubject === sub.name ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">${sub.name}</button>`;
                });
            }"""
text = text.replace(old_test_cat, new_test_cat)

old_test_filter = """            let filtered = allTestsCached.filter(t => {
                const isFree = t.status === 'Free' || t.accessType === 'Free' || t.isFree;
                const tType = isFree ? 'Free' : 'Paid';
                const matchesTab = (tType === activeTestTab) || (activeTestTab === 'All');
                const matchesCat = !activeCategory || t.category === activeCategory;
                
                const hasAccess = checkItemAccess(t, 'test');
                if (tType === 'Paid' && !hasAccess) return false;
                
                return matchesTab && matchesCat;
            });"""
new_test_filter = """            let filtered = allTestsCached.filter(t => {
                const isFree = t.status === 'Free' || t.accessType === 'Free' || t.isFree || t.type === 'Free';
                if (!isFree) return false; // ONLY Free tests are allowed here
                
                const matchesCat = !activeCategory || t.category === activeCategory;
                const matchesSub = !activeTestSubject || (t.subject && t.subject === activeTestSubject);
                
                return matchesCat && matchesSub;
            });"""
text = text.replace(old_test_filter, new_test_filter)

# 3. Patch renderLive
old_live_cat = """            if(catList) {
                catList.innerHTML = `<button onclick="selectCategory('')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeCategory === '' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">All</button>`;
                allCategoriesCached.forEach(cat => {
                    catList.innerHTML += `<button onclick="selectCategory('${cat.name}')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeCategory === cat.name ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">${cat.name}</button>`;
                });
            }"""
new_live_cat = """            if(catList) {
                catList.innerHTML = `<button onclick="selectLiveSubject('')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeLiveSubject === '' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">All</button>`;
                allSubjectsCached.forEach(sub => {
                    catList.innerHTML += `<button onclick="selectLiveSubject('${sub.name}')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeLiveSubject === sub.name ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">${sub.name}</button>`;
                });
            }"""
text = text.replace(old_live_cat, new_live_cat)

old_live_filter = """            const filtered = allLiveCached.filter(l => {
                const matchesCat = !activeCategory || l.category === activeCategory;
                const matchesSearch = !searchQ || (l.title && l.title.toLowerCase().includes(searchQ));
                const isFree = l.type === 'Free' || l.status === 'Free' || l.accessType === 'Free' || l.isFree;
                const lType = isFree ? 'Free' : 'Paid';
                const matchesType = typeQ === 'All' || lType === typeQ;
                
                const hasAccess = checkItemAccess(l, 'live');
                if (lType === 'Paid' && !hasAccess) return false;
                return matchesCat && matchesSearch && matchesType;
            });"""
new_live_filter = """            const filtered = allLiveCached.filter(l => {
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
text = text.replace(old_live_filter, new_live_filter)

# 4. Patch renderNotes
old_notes_cat = """            if(catList) {
                catList.innerHTML = `<button onclick="selectCategory('')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeCategory === '' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">All</button>`;
                allCategoriesCached.forEach(cat => {
                    catList.innerHTML += `<button onclick="selectCategory('${cat.name}')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeCategory === cat.name ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">${cat.name}</button>`;
                });
            }"""
new_notes_cat = """            if(catList) {
                catList.innerHTML = `<button onclick="selectNoteSubject('')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeNoteSubject === '' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">All</button>`;
                allSubjectsCached.forEach(sub => {
                    catList.innerHTML += `<button onclick="selectNoteSubject('${sub.name}')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeNoteSubject === sub.name ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">${sub.name}</button>`;
                });
            }"""
text = text.replace(old_notes_cat, new_notes_cat)

old_notes_filter = """            let filtered = allNotesCached.filter(n => {
                const matchesCat = !activeCategory || n.category === activeCategory;
                const matchesSearch = !searchQ || (n.title && n.title.toLowerCase().includes(searchQ));
                const nType = (n.type === 'Free' || n.status === 'Free' || n.accessType === 'Free' || n.isFree) ? 'Free' : 'Paid';
                const matchesType = typeQ === 'All' || nType === typeQ;
                
                const hasAccess = checkItemAccess(n, 'note');
                if (nType === 'Paid' && !hasAccess) return false;
                
                return matchesCat && matchesSearch && matchesType;
            });"""
new_notes_filter = """            let filtered = allNotesCached.filter(n => {
                const matchesCat = !activeCategory || n.category === activeCategory;
                const matchesSub = !activeNoteSubject || (n.subject && n.subject === activeNoteSubject);
                const matchesSearch = !searchQ || (n.title && n.title.toLowerCase().includes(searchQ));
                const nType = (n.type === 'Free' || n.status === 'Free' || n.accessType === 'Free' || n.isFree) ? 'Free' : 'Paid';
                const matchesType = typeQ === 'All' || nType === typeQ;
                
                const hasAccess = checkItemAccess(n, 'note');
                if (nType === 'Paid' && !hasAccess) return false;
                
                return matchesCat && matchesSub && matchesSearch && matchesType;
            });"""
text = text.replace(old_notes_filter, new_notes_filter)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Patch index applied")
