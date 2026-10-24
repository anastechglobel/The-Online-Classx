import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix renderTests
def repl_tests(m):
    return '''let filtered = allTestsCached.filter(t => {
                const isFree = t.status === 'Free' || t.accessType === 'Free' || t.isFree;
                const tType = isFree ? 'Free' : 'Paid';
                const matchesTab = (tType === activeTestTab) || (activeTestTab === 'All');
                const matchesCat = !activeCategory || t.category === activeCategory;
                
                const hasAccess = checkItemAccess(t, 'test');
                if (tType === 'Paid' && !hasAccess) return false;
                
                return matchesTab && matchesCat;
            });
            
            if(filtered.length === 0) {
                noTests.classList.remove('hidden');
                return;
            }
            noTests.classList.add('hidden');
            
            filtered.forEach(t => {
                const isFree = t.status === 'Free' || t.accessType === 'Free' || t.isFree;
                const isPaid = !isFree;'''

text = re.sub(r"let filtered = allTestsCached\.filter\(t => \{.*?filtered\.forEach\(t => \{\s*const isPaid = \(t\.status === 'Paid'\);", repl_tests, text, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done fixing tests filter")
