import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Add coursesLoaded = false
if 'let coursesLoaded = false;' not in text:
    text = text.replace('let allCoursesCached = [];', 'let allCoursesCached = [];\n        let coursesLoaded = false;')

# Update courses onValue to set coursesLoaded = true
old_courses = '''fb.onValue(fb.ref(db, 'courses'), snapshot => {
                allCoursesCached = [];
                snapshot.forEach(child => {
                    allCoursesCached.push({ id: child.key, ...child.val() });
                });
                renderHomeCourses();
                renderAllCourses();
                renderTests(); // Tests/Notes/Live depend on courses for access
                renderNotes();
                renderLive();
            });'''
new_courses = '''fb.onValue(fb.ref(db, 'courses'), snapshot => {
                allCoursesCached = [];
                snapshot.forEach(child => {
                    allCoursesCached.push({ id: child.key, ...child.val() });
                });
                coursesLoaded = true;
                renderHomeCourses();
                renderAllCourses();
                renderTests();
                renderNotes();
                renderLive();
            });'''
if old_courses in text:
    text = text.replace(old_courses, new_courses)

# Update renderTests
if 'if (!coursesLoaded) return;' not in text:
    text = text.replace('function renderTests() {', 'function renderTests() {\n            if (!coursesLoaded) return;')
    text = text.replace('function renderNotes() {', 'function renderNotes() {\n            if (!coursesLoaded) return;')
    text = text.replace('function renderLive() {', 'function renderLive() {\n            if (!coursesLoaded) return;')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done fixing race condition")
