import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace checkItemAccess
old_check = '''        function checkItemAccess(item, itemType) {
            if (item.type === 'Free' || item.status === 'Free') return true;
            let hasPurchased = userData && userData.purchased && (userData.purchased[item.id] || (item.courseId && userData.purchased[item.courseId]));
            if (hasPurchased) return true;
            
            if (userData && userData.purchased && allCoursesCached) {
                for (let cid of Object.keys(userData.purchased)) {
                    const course = allCoursesCached.find(c => c.id === cid);
                    if (course) {
                        if (itemType === 'test') {
                            if (course.linkedTestId === item.id) return true;
                            if (course.linkedTestIds && course.linkedTestIds.includes(item.id)) return true;
                        } else if (itemType === 'note') {
                            if (course.linkedNoteId === item.id) return true;
                            if (course.linkedNoteIds && course.linkedNoteIds.includes(item.id)) return true;
                        } else if (itemType === 'live') {
                            if (course.linkedLiveId === item.id) return true;
                            if (course.linkedLiveIds && course.linkedLiveIds.includes(item.id)) return true;
                        }
                    }
                }
            }
            return false;
        }'''
new_check = '''        function checkItemAccess(item, itemType) {
            const isFree = item.type === 'Free' || item.status === 'Free' || item.accessType === 'Free' || item.isFree;
            if (isFree) return true;
            let hasPurchased = userData && userData.purchased && (userData.purchased[item.id] || (item.courseId && userData.purchased[item.courseId]));
            if (hasPurchased) return true;
            
            if (userData && userData.purchased && allCoursesCached) {
                for (let cid of Object.keys(userData.purchased)) {
                    const course = allCoursesCached.find(c => c.id === cid);
                    if (course) {
                        if (itemType === 'test') {
                            if (course.linkedTestId === item.id) return true;
                            if (course.linkedTestIds && course.linkedTestIds.includes(item.id)) return true;
                        } else if (itemType === 'note') {
                            if (course.linkedNoteId === item.id) return true;
                            if (course.linkedNoteIds && course.linkedNoteIds.includes(item.id)) return true;
                        } else if (itemType === 'live') {
                            if (course.linkedLiveId === item.id) return true;
                            if (course.linkedLiveIds && course.linkedLiveIds.includes(item.id)) return true;
                        }
                    }
                }
            }
            return false;
        }'''
text = text.replace(old_check, new_check)

# Update Tests Filter
old_tests_filter = '''            let filtered = allTestsCached.filter(t => {
                const matchesTab = (t.status === activeTestTab) || (!t.status && activeTestTab === 'Free') || (activeTestTab === 'All');
                const matchesCat = !activeCategory || t.category === activeCategory;
                
                const hasAccess = checkItemAccess(t, 'test');
                if (t.status === 'Paid' && !hasAccess) return false;
                
                return matchesTab && matchesCat;
            });
            
            if(filtered.length === 0) {
                noTests.classList.remove('hidden');
                return;
            }
            noTests.classList.add('hidden');
            
            filtered.forEach(t => {
                const isPaid = (t.status === 'Paid');'''
new_tests_filter = '''            let filtered = allTestsCached.filter(t => {
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
text = text.replace(old_tests_filter, new_tests_filter)

# Update Live Filter
old_live_filter = '''            const filtered = allLiveCached.filter(l => {
                const matchesCat = !activeCategory || l.category === activeCategory;
                const hasAccess = checkItemAccess(l, 'live');
                if (l.type === 'Paid' && !hasAccess) return false;
                return matchesCat;
            });'''
new_live_filter = '''            const filtered = allLiveCached.filter(l => {
                const matchesCat = !activeCategory || l.category === activeCategory;
                const isFree = l.type === 'Free' || l.status === 'Free' || l.accessType === 'Free' || l.isFree;
                const lType = isFree ? 'Free' : 'Paid';
                const hasAccess = checkItemAccess(l, 'live');
                if (lType === 'Paid' && !hasAccess) return false;
                return matchesCat;
            });'''
text = text.replace(old_live_filter, new_live_filter)

# Update Notes Filter
old_notes_filter = '''                const nType = (n.type === 'Free' || n.status === 'Free') ? 'Free' : 'Paid';
                const matchesType = typeQ === 'All' || nType === typeQ;
                
                const hasAccess = checkItemAccess(n, 'note');
                if (nType === 'Paid' && !hasAccess) return false;'''
new_notes_filter = '''                const nType = (n.type === 'Free' || n.status === 'Free' || n.accessType === 'Free' || n.isFree) ? 'Free' : 'Paid';
                const matchesType = typeQ === 'All' || nType === typeQ;
                
                const hasAccess = checkItemAccess(n, 'note');
                if (nType === 'Paid' && !hasAccess) return false;'''
text = text.replace(old_notes_filter, new_notes_filter)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done fixing checkItemAccess and filters")
