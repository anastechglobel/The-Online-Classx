import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add dropdown filter to HTML
html_to_add = '''            <!-- Subject Filter Bar -->
            <div id="liveSubjectList" class="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-4"></div>
            
            <!-- Search & Filters -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="relative">
                    <input type="text" id="liveSearchInput" oninput="renderLive()" placeholder="Search live classes..." class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-150 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium">
                    <span class="absolute left-4 top-3 text-slate-400 text-xs"><i class="fa-solid fa-search"></i></span>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <select id="liveTypeFilter" onchange="renderLive()" class="bg-slate-50 border border-slate-150 text-slate-800 px-4 py-2.5 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-500">
                        <option value="All">All Classes</option>
                        <option value="Free">Free Access</option>
                        <option value="Paid">Paid Access</option>
                    </select>
                </div>
            </div>'''
text = text.replace('            <!-- Subject Filter Bar -->\n            <div id="liveSubjectList" class="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-4"></div>', html_to_add)

# 2. Update renderLive
old_filter = '''            const filtered = allLiveCached.filter(l => {
                const matchesCat = !activeCategory || l.category === activeCategory;
                const isFree = l.type === 'Free' || l.status === 'Free' || l.accessType === 'Free' || l.isFree;
                const lType = isFree ? 'Free' : 'Paid';
                const hasAccess = checkItemAccess(l, 'live');
                if (lType === 'Paid' && !hasAccess) return false;
                return matchesCat;
            });'''
new_filter = '''            const searchInput = document.getElementById('liveSearchInput');
            const searchQ = searchInput ? searchInput.value.trim().toLowerCase() : '';
            const typeFilter = document.getElementById('liveTypeFilter');
            const typeQ = typeFilter ? typeFilter.value : 'All';
            const filtered = allLiveCached.filter(l => {
                const matchesCat = !activeCategory || l.category === activeCategory;
                const matchesSearch = !searchQ || (l.title && l.title.toLowerCase().includes(searchQ));
                const isFree = l.type === 'Free' || l.status === 'Free' || l.accessType === 'Free' || l.isFree;
                const lType = isFree ? 'Free' : 'Paid';
                const matchesType = typeQ === 'All' || lType === typeQ;
                
                const hasAccess = checkItemAccess(l, 'live');
                if (lType === 'Paid' && !hasAccess) return false;
                return matchesCat && matchesSearch && matchesType;
            });'''
if old_filter in text:
    text = text.replace(old_filter, new_filter)
else:
    print("Could not find old_filter")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done fixing live")
