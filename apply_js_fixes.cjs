const fs = require('fs');

let html = fs.readFileSync('admin.html', 'utf8');

// Define new helper functions and updated methods
const jsFixes = `
        // Populate modal selects dynamically
        function populateLiveModalSelects() {
            const lCatSelect = document.getElementById('lCat');
            if (lCatSelect) {
                const currentVal = lCatSelect.value;
                lCatSelect.innerHTML = '<option value="">All Categories (General)</option>';
                if (window.categoriesList && Array.isArray(window.categoriesList)) {
                    window.categoriesList.forEach(c => {
                        lCatSelect.innerHTML += \`<option value="\${c.name}">\${c.name}</option>\`;
                    });
                }
                if (currentVal) lCatSelect.value = currentVal;
            }
            const lCourseSelect = document.getElementById('lCourse');
            if (lCourseSelect) {
                const currentVal = lCourseSelect.value;
                lCourseSelect.innerHTML = '<option value="">No Course (Standalone Live)</option>';
                if (window.coursesList && Array.isArray(window.coursesList)) {
                    window.coursesList.forEach(c => {
                        lCourseSelect.innerHTML += \`<option value="\${c.id}">\${c.title}</option>\`;
                    });
                }
                if (currentVal) lCourseSelect.value = currentVal;
            }
        }

        function populateTestModalSelects() {
            const tCatSelect = document.getElementById('tCat');
            if (tCatSelect) {
                const currentVal = tCatSelect.value;
                tCatSelect.innerHTML = '<option value="">All Categories (General)</option>';
                if (window.categoriesList && Array.isArray(window.categoriesList)) {
                    window.categoriesList.forEach(c => {
                        tCatSelect.innerHTML += \`<option value="\${c.name}">\${c.name}</option>\`;
                    });
                }
                if (currentVal) tCatSelect.value = currentVal;
            }
            const tCourseSelect = document.getElementById('tCourse');
            if (tCourseSelect) {
                const currentVal = tCourseSelect.value;
                tCourseSelect.innerHTML = '<option value="">General (No Course Required)</option>';
                if (window.coursesList && Array.isArray(window.coursesList)) {
                    window.coursesList.forEach(c => {
                        tCourseSelect.innerHTML += \`<option value="\${c.id}">\${c.title}</option>\`;
                    });
                }
                if (currentVal) tCourseSelect.value = currentVal;
            }
        }

        function populateUpcomingModalCategories() {
            const uCatSelect = document.getElementById('uCat');
            if (!uCatSelect) return;
            const currentVal = uCatSelect.value;
            uCatSelect.innerHTML = '<option value="">Select Category</option>';
            if (window.categoriesList && Array.isArray(window.categoriesList)) {
                window.categoriesList.forEach(c => {
                    uCatSelect.innerHTML += \`<option value="\${c.name}">\${c.name}</option>\`;
                });
            }
            if (currentVal) uCatSelect.value = currentVal;
        }

        function showLiveModal() {
            editingLiveId = null;
            document.getElementById('lTitle').value = '';
            document.getElementById('lDesc').value = '';
            populateLiveModalSelects();
            document.getElementById('lType').value = 'Free';
            document.getElementById('lDirect').value = '';
            document.getElementById('lEmbed').value = '';
            document.getElementById('lThumb').value = '';
            document.getElementById('lTime').value = '';
            document.getElementById('lMode').value = 'In-App';
            document.querySelector('#liveModal h2').innerText = 'Schedule Live Class';
            document.querySelector('#liveModal button[onclick="saveLive()"]').innerText = 'Schedule Now';

            openModal('liveModal');
        }
        window.showLiveModal = showLiveModal;

        function editLive(id) {
            fb.get(fb.ref(db, 'live/' + id)).then(snap => {
                if(snap.exists()){
                    const l = snap.val();
                    editingLiveId = id;
                    document.getElementById('lTitle').value = l.title || '';
                    document.getElementById('lDesc').value = l.description || '';
                    populateLiveModalSelects();
                    document.getElementById('lCourse').value = l.courseId || '';
                    document.getElementById('lCat').value = l.category || '';
                    document.getElementById('lType').value = l.type || 'Free';
                    document.getElementById('lDirect').value = l.youtubeUrl || '';
                    document.getElementById('lEmbed').value = l.embedUrl || '';
                    document.getElementById('lThumb').value = l.thumbnail || '';
                    document.getElementById('lTime').value = l.startTime || '';
                    document.getElementById('lMode').value = l.mode || 'In-App';
                    
                    document.querySelector('#liveModal h2').innerText = 'Edit Live Class';
                    document.querySelector('#liveModal button[onclick="saveLive()"]').innerText = 'Update Class';

                    openModal('liveModal');
                }
            });
        }
        window.editLive = editLive;

        function saveLive() {
            const title = document.getElementById('lTitle').value.trim();
            const desc = document.getElementById('lDesc').value;
            const thumb = document.getElementById('lThumb').value.trim();
            const startTime = document.getElementById('lTime').value;
            const courseSel = document.getElementById('lCourse');
            const cat = document.getElementById('lCat').value;
            if(!title) return alert("Title is required");

            const courseId = courseSel ? courseSel.value : '';
            const courseName = courseSel && courseSel.selectedIndex >= 0 ? courseSel.options[courseSel.selectedIndex].text : 'General';
            const type = document.getElementById('lType').value;

            const data = {
                title: title,
                description: desc,
                thumbnail: thumb,
                courseId: courseId,
                category: cat,
                courseName: courseName,
                type: type,
                youtubeUrl: document.getElementById('lDirect').value.trim(),
                embedUrl: document.getElementById('lEmbed').value.trim(),
                mode: document.getElementById('lMode').value,
                startTime: startTime,
                updatedAt: Date.now()
            };

            if(editingLiveId) {
                fb.update(fb.ref(db, 'live/' + editingLiveId), data).then(() => { 
                    showToast('Live Class Updated Successfully'); 
                    closeModal(); 
                }).catch(e => {
                    alert('Update failed: ' + e.message);
                });
            } else {
                data.createdAt = Date.now();
                fb.push(fb.ref(db, 'live'), data).then(() => { 
                    showToast('Live Class Scheduled Successfully'); 
                    closeModal(); 
                }).catch(e => {
                    alert('Schedule failed: ' + e.message);
                });
            }
        }
        window.saveLive = saveLive;

        function showTestModal() {
            editingTestId = null;
            document.getElementById('tTitle').value = '';
            document.getElementById('tDesc').value = '';
            populateTestModalSelects();
            const accessEl = document.getElementById('tAccess');
            if (accessEl) accessEl.value = 'Free';
            document.getElementById('tType').value = 'Objective';
            document.getElementById('tTime').value = '15';
            document.querySelector('#testModal h2').innerText = 'Create Test Series';
            document.querySelector('#testModal button[onclick="saveTest()"]').innerText = 'Create Test';
            openModal('testModal');
        }
        window.showTestModal = showTestModal;

        function editTest(id) {
            fb.get(fb.ref(db, 'tests/' + id)).then(snap => {
                if(snap.exists()){
                    const t = snap.val();
                    editingTestId = id;
                    
                    populateTestModalSelects();
                    document.getElementById('tTitle').value = t.title || '';
                    document.getElementById('tDesc').value = t.description || '';
                    document.getElementById('tCourse').value = t.courseId || '';
                    document.getElementById('tCat').value = t.category || '';
                    const accessEl = document.getElementById('tAccess');
                    if (accessEl) accessEl.value = t.accessType || (t.isFree === false ? 'Paid' : 'Free');
                    document.getElementById('tType').value = t.type || 'Objective';
                    document.getElementById('tTime').value = t.timePerQuestion || t.timer || '15';
                    
                    document.querySelector('#testModal h2').innerText = 'Edit Test Series';
                    document.querySelector('#testModal button[onclick="saveTest()"]').innerText = 'Update Test Series';
                    openModal('testModal');
                }
            });
        }
        window.editTest = editTest;

        function saveTest() {
            const title = document.getElementById('tTitle').value.trim();
            const desc = document.getElementById('tDesc').value;
            const cat = document.getElementById('tCat').value;
            const courseSelect = document.getElementById('tCourse');
            const courseId = courseSelect ? courseSelect.value : '';
            const courseName = courseSelect && courseSelect.selectedIndex >= 0 ? courseSelect.options[courseSelect.selectedIndex].text : 'General';
            const accessEl = document.getElementById('tAccess');
            const access = accessEl ? accessEl.value : 'Free';
            const type = document.getElementById('tType').value;
            const time = document.getElementById('tTime').value;

            if(!title || !type || !time) {
                return alert("Required fields missing! Please fill Title, Type and Time per question.");
            }

            const data = {
                title, 
                description: desc, 
                category: cat,
                courseId, 
                courseName, 
                accessType: access,
                isFree: access === 'Free',
                status: access,
                type, 
                timer: parseInt(time),
                timePerQuestion: parseInt(time),
                updatedAt: Date.now()
            };

            if(editingTestId) {
                fb.update(fb.ref(db, 'tests/' + editingTestId), data).then(() => {
                    closeModal();
                    showToast("Test Updated!");
                }).catch(e => {
                    alert("Update failed: " + e.message);
                    console.error(e);
                });
            } else {
                data.createdAt = Date.now();
                fb.push(fb.ref(db, 'tests'), data).then(() => {
                    closeModal();
                    showToast("Test Created!");
                }).catch(e => {
                    alert("Create failed: " + e.message);
                    console.error(e);
                });
            }
        }
        window.saveTest = saveTest;

        function showUpcomingModal() {
            editingUpcomingId = null;
            document.getElementById('uTitle').value = '';
            document.getElementById('uDesc').value = '';
            populateUpcomingModalCategories();
            document.getElementById('uThumb').value = '';
            document.getElementById('uDate').value = '';
            document.getElementById('uPrice').value = '';
            document.getElementById('uInstructor').value = '';
            document.getElementById('uLaunchTime').value = '';
            document.getElementById('uStatus').value = 'published';
            document.querySelector('#upcomingModal h2').innerText = 'Add Upcoming Course';
            document.querySelector('#upcomingModal button[onclick="saveUpcoming()"]').innerText = 'Add Course';
            openModal('upcomingModal');
        }
        window.showUpcomingModal = showUpcomingModal;

        function editUpcoming(id) {
            fb.get(fb.ref(db, 'upcoming_courses/' + id)).then(snap => {
                if(snap.exists()){
                    const u = snap.val();
                    editingUpcomingId = id;
                    document.getElementById('uTitle').value = u.title || '';
                    document.getElementById('uDesc').value = u.description || '';
                    populateUpcomingModalCategories();
                    document.getElementById('uCat').value = u.category || '';
                    document.getElementById('uThumb').value = u.thumbnail || '';
                    document.getElementById('uDate').value = u.launchDate || '';
                    document.getElementById('uPrice').value = u.price || '';
                    document.getElementById('uInstructor').value = u.instructor || '';
                    document.getElementById('uLaunchTime').value = u.launchTime || '';
                    const statusVal = (u.status === 'draft' || u.status === 'unpublished') ? 'unpublished' : 'published';
                    document.getElementById('uStatus').value = statusVal;
                    
                    document.querySelector('#upcomingModal h2').innerText = 'Edit Upcoming Course';
                    document.querySelector('#upcomingModal button[onclick="saveUpcoming()"]').innerText = 'Update Course';
                    
                    openModal('upcomingModal');
                }
            });
        }
        window.editUpcoming = editUpcoming;

        function saveUpcoming() {
            const title = document.getElementById('uTitle').value.trim();
            const desc = document.getElementById('uDesc').value;
            const thumb = document.getElementById('uThumb').value.trim();
            const cat = document.getElementById('uCat').value;
            const date = document.getElementById('uDate').value;
            const price = document.getElementById('uPrice').value;
            const instructor = document.getElementById('uInstructor').value;
            const launchTime = document.getElementById('uLaunchTime').value;
            const status = document.getElementById('uStatus').value;
            
            if(!title || !thumb) return alert("Title and Thumbnail are required");
            
            const data = {
                title, 
                description: desc, 
                thumbnail: thumb, 
                category: cat,
                launchDate: date,
                price: price ? parseFloat(price) : 0,
                instructor: instructor || 'TBA',
                launchTime: launchTime || '',
                status: status || 'published',
                updatedAt: Date.now()
            };

            if(editingUpcomingId) {
                fb.update(fb.ref(db, 'upcoming_courses/' + editingUpcomingId), data).then(() => {
                    closeModal();
                    showToast("Upcoming Course Updated!");
                }).catch(e => {
                    alert("Update failed: " + e.message);
                    console.error(e);
                });
            } else {
                data.createdAt = Date.now();
                fb.push(fb.ref(db, 'upcoming_courses'), data).then(() => {
                    closeModal();
                    showToast("Upcoming Course Added!");
                }).catch(e => {
                    alert("Save failed: " + e.message);
                    console.error(e);
                });
            }
        }
        window.saveUpcoming = saveUpcoming;

        function showSliderModal() {
            editingSliderId = null;
            document.getElementById('sUrl').value = '';
            document.getElementById('sAction').value = 'none';
            toggleSliderTarget();
            document.querySelector('#sliderModal h2').innerText = 'Add Interactive Banner';
            document.querySelector('#sliderModal button[onclick="saveSlider()"]').innerText = 'Save Banner';
            openModal('sliderModal');
        }
        window.showSliderModal = showSliderModal;

        function toggleSliderTarget(presetTarget) {
            const actionEl = document.getElementById('sAction');
            if (!actionEl) return;
            const action = actionEl.value;
            const container = document.getElementById('sTargetContainer');
            const select = document.getElementById('sTargetSelect');
            const input = document.getElementById('sTargetInput');

            if (action === 'none') {
                if (container) container.classList.add('hidden');
                return;
            }

            if (container) container.classList.remove('hidden');
            if (select) select.classList.add('hidden');
            if (input) input.classList.add('hidden');

            if (action === 'youtube') {
                if (input) {
                    input.classList.remove('hidden');
                    input.placeholder = "Paste YouTube Video Link or ID";
                    if (presetTarget !== undefined) input.value = presetTarget;
                }
            } else {
                if (select) {
                    select.classList.remove('hidden');
                    select.innerHTML = '<option value="">Loading content...</option>';
                    const path = action === 'course' ? 'courses' : (action === 'note' ? 'notes' : 'tests');
                    fb.get(fb.ref(db, path)).then(snap => {
                        select.innerHTML = \`<option value="">Select \${action.charAt(0).toUpperCase() + action.slice(1)}</option>\`;
                        if (snap.exists()) {
                            snap.forEach(c => {
                                const item = c.val();
                                select.innerHTML += \`<option value="\${c.key}">\${item.title || item.name || c.key}</option>\`;
                            });
                        } else {
                            select.innerHTML = \`<option value="">No \${action}s available</option>\`;
                        }
                        if (presetTarget !== undefined) {
                            select.value = presetTarget;
                        }
                    }).catch(err => {
                        console.error("Error loading slider targets:", err);
                        select.innerHTML = \`<option value="">Error loading items</option>\`;
                    });
                }
            }
        }
        window.toggleSliderTarget = toggleSliderTarget;

        function editSlider(id) {
            fb.get(fb.ref(db, 'sliders/' + id)).then(snap => {
                if(snap.exists()){
                    const s = snap.val();
                    editingSliderId = id;
                    document.getElementById('sUrl').value = typeof s === 'string' ? s : (s.url || '');
                    document.getElementById('sAction').value = s.action || 'none';
                    toggleSliderTarget(s.target);
                    document.querySelector('#sliderModal h2').innerText = 'Edit Banner';
                    document.querySelector('#sliderModal button[onclick="saveSlider()"]').innerText = 'Update Banner';
                    openModal('sliderModal');
                }
            });
        }
        window.editSlider = editSlider;

        function saveSlider() {
            const url = document.getElementById('sUrl').value.trim();
            const action = document.getElementById('sAction').value;
            let target = '';

            if (action === 'youtube') {
                target = document.getElementById('sTargetInput').value.trim();
            } else if (action !== 'none') {
                target = document.getElementById('sTargetSelect').value;
            }

            if (!url) return alert("Banner Image URL is required");

            const data = { url, action, target, updatedAt: Date.now() };

            if(editingSliderId) {
                fb.update(fb.ref(db, 'sliders/' + editingSliderId), data).then(() => {
                    showToast("Slider Banner Updated!");
                    closeModal();
                }).catch(e => {
                    alert("Update failed: " + e.message);
                    console.error(e);
                });
            } else {
                data.createdAt = Date.now();
                fb.push(fb.ref(db, 'sliders'), data).then(() => {
                    showToast("Slider Banner Created!");
                    closeModal();
                }).catch(e => {
                    alert("Save failed: " + e.message);
                    console.error(e);
                });
            }
        }
        window.saveSlider = saveSlider;
`;

// Insert or replace existing functions
// First let's check if showLiveModal exists and replace from showLiveModal to window.deleteSlider = deleteSlider or similar
const startMarker = 'function showUpcomingModal() {';
const endMarker = 'function showDemoModal() {';

if (html.includes(startMarker) && html.includes(endMarker)) {
    const startIndex = html.indexOf('function showUpcomingModal() {');
    const endIndex = html.indexOf(endMarker);
    html = html.substring(0, startIndex) + jsFixes + '\n        ' + html.substring(endIndex);
} else {
    // Append jsFixes before ending script tag
    html = html.replace('</script>', jsFixes + '\n</script>');
}

fs.writeFileSync('admin.html', html);
console.log("JS functions updated successfully!");
