import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

old_text = '''                let hasPurchased = userData && userData.purchased && (userData.purchased[t.id] || (t.courseId && userData.purchased[t.courseId]));
                if (!hasPurchased && userData && userData.purchased) {
                    Object.keys(userData.purchased).forEach(cid => {
                        const course = allCoursesCached.find(c => c.id === cid);
                        if(course) {
                            if (course.linkedTestId === t.id) hasPurchased = true;
                            if (course.linkedTestIds && course.linkedTestIds.includes(t.id)) hasPurchased = true;
                        }
                    });
                }
                const canAccess = !isPaid || hasPurchased;'''

new_text = '''                let hasPurchased = checkItemAccess(t, 'test');
                const canAccess = !isPaid || hasPurchased;'''

if old_text in text:
    text = text.replace(old_text, new_text)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Done modifying renderTests')
else:
    print('Not found')
