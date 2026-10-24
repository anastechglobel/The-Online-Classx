import re

with open('admin.html', 'r') as f:
    content = f.read()

funcs = """
        let editingSubjectId = null;
        function showSubjectModal() {
            editingSubjectId = null;
            document.getElementById('subName').value = '';
            document.querySelector('#subjectModal h2').innerText = 'Add New Subject';
            document.querySelector('#subjectModal button[onclick="saveSubject()"]').innerText = 'Save Subject';
            openModal('subjectModal');
        }

        function editSubject(id) {
            fb.get(fb.ref(db, 'subjects/' + id)).then(snap => {
                if(snap.exists()){
                    const sub = snap.val();
                    editingSubjectId = id;
                    document.getElementById('subName').value = sub.name || '';
                    document.querySelector('#subjectModal h2').innerText = 'Edit Subject';
                    document.querySelector('#subjectModal button[onclick="saveSubject()"]').innerText = 'Update Subject';
                    openModal('subjectModal');
                }
            });
        }

        function saveSubject() {
            const name = document.getElementById('subName').value.trim();
            if(!name) return alert("Subject name required");
            
            if(editingSubjectId) {
                fb.update(fb.ref(db, 'subjects/' + editingSubjectId), { name }).then(() => {
                    alert("Subject Updated!");
                    closeModal();
                }).catch(e => {
                    alert("Update failed: " + e.message);
                    console.error(e);
                });
            } else {
                fb.push(fb.ref(db, 'subjects'), { name }).then(() => {
                    alert("Subject Saved!");
                    closeModal();
                }).catch(e => {
                    alert("Save failed: " + e.message);
                    console.error(e);
                });
            }
        }
        
        function deleteSubject(id) {
            if(confirm("Are you sure you want to delete this subject?")) {
                fb.remove(fb.ref(db, 'subjects/' + id));
            }
        }
"""

if "function showCategoryModal" in content:
    content = content.replace("function showCategoryModal", funcs + "\n        function showCategoryModal")
    
if "window.showCategoryModal = showCategoryModal;" in content:
    content = content.replace("window.showCategoryModal = showCategoryModal;", "window.showSubjectModal = showSubjectModal;\n        window.editSubject = editSubject;\n        window.saveSubject = saveSubject;\n        window.deleteSubject = deleteSubject;\n        window.showCategoryModal = showCategoryModal;")
    
with open('admin.html', 'w') as f:
    f.write(content)

print("Added subject functions")
