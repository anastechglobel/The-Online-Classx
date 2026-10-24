import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

match = re.search(r'function renderLive\(\).*?const ongoing = filtered\.filter', text, re.DOTALL)

if not match:
    print('Not found')
    exit(1)

old_text = match.group(0)

new_text = '''function renderLive() {
            const homeLive = document.getElementById('homeLiveList');
            const fullLive = document.getElementById('fullLiveList');
            const scheduledLive = document.getElementById('scheduledLiveList');
            const recordedLive = document.getElementById('recordedLiveList');
            const noLiveMsg = document.getElementById('noLiveMsg');
            const catList = document.getElementById('liveSubjectList');
            
            if(homeLive) homeLive.innerHTML = '';
            if(fullLive) fullLive.innerHTML = '';
            if(scheduledLive) scheduledLive.innerHTML = '';
            if(recordedLive) recordedLive.innerHTML = '';
            
            if(catList) {
                catList.innerHTML = `<button onclick="selectCategory('')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeCategory === '' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">All</button>`;
                allCategoriesCached.forEach(cat => {
                    catList.innerHTML += `<button onclick="selectCategory('${cat.name}')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeCategory === cat.name ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">${cat.name}</button>`;
                });
            }

            const filtered = allLiveCached.filter(l => !activeCategory || l.category === activeCategory);
            
            const ongoing = filtered.filter'''

text = text.replace(old_text, new_text)
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print('Done modifying renderLive categories')
