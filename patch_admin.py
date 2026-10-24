import re

with open('admin.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. showNoteModal
text = text.replace(
    "populateCategoriesSelect('nCat', '', allSubjectsCached);",
    "populateCategoriesSelect('nCat', '');\n            populateCategoriesSelect('nSubject', '', allSubjectsCached);"
)

# 2. editNote
text = text.replace(
    "populateCategoriesSelect('nCat', n.category || '', allSubjectsCached);",
    "populateCategoriesSelect('nCat', n.category || '');\n                    populateCategoriesSelect('nSubject', n.subject || '', allSubjectsCached);"
)

# 3. saveNote
text = text.replace(
    "const catEl = document.getElementById('nCat');\n            const cat = catEl ? catEl.value : (window.adminUIState && window.adminUIState.categories ? window.adminUIState.categories['nCat'] : '');\n            const typeEl = document.getElementById('nType');",
    "const catEl = document.getElementById('nCat');\n            const cat = catEl ? catEl.value : (window.adminUIState && window.adminUIState.categories ? window.adminUIState.categories['nCat'] : '');\n            const subEl = document.getElementById('nSubject');\n            const sub = subEl ? subEl.value : '';\n            const typeEl = document.getElementById('nType');"
)
text = text.replace(
    "category: cat,\n                subject: cat,\n                type,",
    "category: cat,\n                subject: sub,\n                type,"
)

# 4. showLiveModal
text = text.replace(
    "function populateLiveModalSelects(catVal, courseVal) {\n            populateCategoriesSelect('lCat', catVal, allSubjectsCached);\n            populateCoursesSelect('lCourse', courseVal);\n        }",
    "function populateLiveModalSelects(catVal, subVal, courseVal) {\n            populateCategoriesSelect('lCat', catVal);\n            populateCategoriesSelect('lSubject', subVal, allSubjectsCached);\n            populateCoursesSelect('lCourse', courseVal);\n        }"
)
text = text.replace(
    "populateLiveModalSelects();\n            document.getElementById('lType').value = 'Free';",
    "populateLiveModalSelects('', '', '');\n            document.getElementById('lType').value = 'Free';"
)
text = text.replace(
    "populateLiveModalSelects();\n                    document.getElementById('lCourse').value = l.courseId || '';\n                    document.getElementById('lCat').value = l.category || '';",
    "populateLiveModalSelects(l.category || '', l.subject || '', l.courseId || '');\n                    document.getElementById('lCourse').value = l.courseId || '';\n                    document.getElementById('lCat').value = l.category || '';"
)

# 5. saveLive
text = text.replace(
    "const cat = document.getElementById('lCat').value;",
    "const cat = document.getElementById('lCat').value;\n            const sub = document.getElementById('lSubject') ? document.getElementById('lSubject').value : '';"
)
text = text.replace(
    "category: cat,\n                subject: cat,\n                subject: cat,\n                courseName: courseName,",
    "category: cat,\n                subject: sub,\n                courseName: courseName,"
)
text = text.replace(
    "category: cat,\n                subject: cat,\n                courseName: courseName,",
    "category: cat,\n                subject: sub,\n                courseName: courseName,"
)

# 6. showTestModal
text = text.replace(
    "populateCategoriesSelect('tCat', '', allSubjectsCached);\n            populateCoursesSelect('tCourse', '');",
    "populateCategoriesSelect('tCat', '');\n            populateCategoriesSelect('tSubject', '', allSubjectsCached);\n            populateCoursesSelect('tCourse', '');"
)

# 7. editTest
text = text.replace(
    "populateCategoriesSelect('tCat', t.category || '', allSubjectsCached);\n                    populateCoursesSelect('tCourse', t.courseId || '');",
    "populateCategoriesSelect('tCat', t.category || '');\n                    populateCategoriesSelect('tSubject', t.subject || '', allSubjectsCached);\n                    populateCoursesSelect('tCourse', t.courseId || '');"
)

# 8. saveTest
text = text.replace(
    "const catEl = document.getElementById('tCat');\n            const cat = catEl ? catEl.value : (window.adminUIState && window.adminUIState.categories ? window.adminUIState.categories['tCat'] : '');\n            const courseSelect = document.getElementById('tCourse');",
    "const catEl = document.getElementById('tCat');\n            const cat = catEl ? catEl.value : (window.adminUIState && window.adminUIState.categories ? window.adminUIState.categories['tCat'] : '');\n            const subEl = document.getElementById('tSubject');\n            const sub = subEl ? subEl.value : '';\n            const courseSelect = document.getElementById('tCourse');"
)
text = text.replace(
    "category: cat,\n                subject: cat,\n                subject: cat,\n                courseId,",
    "category: cat,\n                subject: sub,\n                courseId,"
)
text = text.replace(
    "category: cat,\n                subject: cat,\n                courseId,",
    "category: cat,\n                subject: sub,\n                courseId,"
)

# 9. finishTestCreation (Advanced Tests)
text = text.replace(
    "populateCategoriesSelect('advTCat', '', allSubjectsCached);\n            document.getElementById('advTStatus').value = 'Free';",
    "populateCategoriesSelect('advTCat', '');\n            populateCategoriesSelect('advTSubject', '', allSubjectsCached);\n            document.getElementById('advTStatus').value = 'Free';"
)
text = text.replace(
    "const catEl = document.getElementById('advTCat');\n            const category = catEl ? catEl.value : (window.adminUIState && window.adminUIState.categories ? window.adminUIState.categories['advTCat'] : '');\n            const statusEl = document.getElementById('advTStatus');",
    "const catEl = document.getElementById('advTCat');\n            const category = catEl ? catEl.value : (window.adminUIState && window.adminUIState.categories ? window.adminUIState.categories['advTCat'] : '');\n            const subEl = document.getElementById('advTSubject');\n            const subject = subEl ? subEl.value : '';\n            const statusEl = document.getElementById('advTStatus');"
)
text = text.replace(
    "const testData = {\n                title,\n                category,",
    "const testData = {\n                title,\n                category,\n                subject,\n"
)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Patch applied")
