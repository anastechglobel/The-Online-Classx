import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

slider_old = '''                case 'note':
                    fb.get(fb.ref(db, `notes/${s.target}`)).then(snapNote => {
                        if (snapNote.exists()) {
                            const n = snapNote.val();
                            n.id = s.target;
                            const hasAccess = checkItemAccess(n, 'note');
                            if ((n.type === 'Free' || n.status === 'Free') || hasAccess) {'''
slider_new = '''                case 'note':
                    fb.get(fb.ref(db, `notes/${s.target}`)).then(snapNote => {
                        if (snapNote.exists()) {
                            const n = snapNote.val();
                            n.id = s.target;
                            const hasAccess = checkItemAccess(n, 'note');
                            const isFree = n.type === 'Free' || n.status === 'Free' || n.accessType === 'Free' || n.isFree;
                            if (isFree || hasAccess) {'''
text = text.replace(slider_old, slider_new)

slider_old_test = '''                case 'test':
                    fb.get(fb.ref(db, `tests/${s.target}`)).then(snapTest => {
                        if (snapTest.exists()) {
                            const t = snapTest.val();
                            t.id = s.target;
                            const hasAccess = checkItemAccess(t, 'test');
                            if (t.status === 'Free' || hasAccess) {'''
slider_new_test = '''                case 'test':
                    fb.get(fb.ref(db, `tests/${s.target}`)).then(snapTest => {
                        if (snapTest.exists()) {
                            const t = snapTest.val();
                            t.id = s.target;
                            const hasAccess = checkItemAccess(t, 'test');
                            const isFree = t.status === 'Free' || t.accessType === 'Free' || t.isFree;
                            if (isFree || hasAccess) {'''
text = text.replace(slider_old_test, slider_new_test)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done fixing slider logic")
