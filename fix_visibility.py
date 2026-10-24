import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

helper = '''        function checkItemAccess(item, itemType) {'''
new_helper = '''        function isItemLinkedToAnyCourse(item, itemType) {
            if (item.courseId) return true;
            if (!allCoursesCached) return false;
            for (let c of allCoursesCached) {
                if (itemType === 'test' && (c.linkedTestId === item.id || (c.linkedTestIds && c.linkedTestIds.includes(item.id)))) return true;
                if (itemType === 'note' && (c.linkedNoteId === item.id || (c.linkedNoteIds && c.linkedNoteIds.includes(item.id)))) return true;
                if (itemType === 'live' && (c.linkedLiveId === item.id || (c.linkedLiveIds && c.linkedLiveIds.includes(item.id)))) return true;
            }
            return false;
        }

        function checkItemAccess(item, itemType) {'''

if helper in text:
    text = text.replace(helper, new_helper)

# Notes filter
notes_old = '''            let filtered = allNotesCached.filter(n => {
                const matchesCat = !activeCategory || n.category === activeCategory;
                const matchesSearch = !searchQ || (n.title && n.title.toLowerCase().includes(searchQ));
                const nType = (n.type === 'Free' || n.status === 'Free') ? 'Free' : 'Paid';
                const matchesType = typeQ === 'All' || nType === typeQ;
                return matchesCat && matchesSearch && matchesType;
            });'''
notes_new = '''            let filtered = allNotesCached.filter(n => {
                const matchesCat = !activeCategory || n.category === activeCategory;
                const matchesSearch = !searchQ || (n.title && n.title.toLowerCase().includes(searchQ));
                const nType = (n.type === 'Free' || n.status === 'Free') ? 'Free' : 'Paid';
                const matchesType = typeQ === 'All' || nType === typeQ;
                
                const isLinked = isItemLinkedToAnyCourse(n, 'note');
                const hasAccess = checkItemAccess(n, 'note');
                if (isLinked && !hasAccess) return false;
                
                return matchesCat && matchesSearch && matchesType;
            });'''
text = text.replace(notes_old, notes_new)

# Tests filter
tests_old = '''            let filtered = allTestsCached.filter(t => {
                const matchesTab = (t.status === activeTestTab) || (!t.status && activeTestTab === 'Free') || (activeTestTab === 'All');
                const matchesCat = !activeCategory || t.category === activeCategory;
                return matchesTab && matchesCat;
            });'''
tests_new = '''            let filtered = allTestsCached.filter(t => {
                const matchesTab = (t.status === activeTestTab) || (!t.status && activeTestTab === 'Free') || (activeTestTab === 'All');
                const matchesCat = !activeCategory || t.category === activeCategory;
                
                const isLinked = isItemLinkedToAnyCourse(t, 'test');
                const hasAccess = checkItemAccess(t, 'test');
                if (isLinked && !hasAccess) return false;
                
                return matchesTab && matchesCat;
            });'''
text = text.replace(tests_old, tests_new)

# Live filter
live_old = '''            const filtered = allLiveCached.filter(l => !activeCategory || l.category === activeCategory);'''
live_new = '''            const filtered = allLiveCached.filter(l => {
                const matchesCat = !activeCategory || l.category === activeCategory;
                const isLinked = isItemLinkedToAnyCourse(l, 'live');
                const hasAccess = checkItemAccess(l, 'live');
                if (isLinked && !hasAccess) return false;
                return matchesCat;
            });'''
text = text.replace(live_old, live_new)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print('Done injecting visibility logic.')
