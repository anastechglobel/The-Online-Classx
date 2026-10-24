const fs = require('fs');

let adminHtml = fs.readFileSync('admin.html', 'utf8');

// Replace SECTION 4: Linked Resources in admin.html
const section4Regex = /<!-- SECTION 4: Linked Resources -->[\s\S]*?<!-- SECTION 5: Instructions & Description -->/;
const newSection4 = `<!-- SECTION 4: Linked Resources -->
                <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                    <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <span class="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-black">4</span>
                        <h3 class="text-xs font-black uppercase tracking-wider text-slate-700">Linked Resources (Multiple)</h3>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="space-y-1">
                            <label class="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 mb-2">
                                <i class="fa-solid fa-file-pdf text-rose-500"></i> Linked Study Notes
                            </label>
                            <div id="clinkedNotesList" class="bg-slate-50 border border-slate-200 rounded-xl max-h-40 overflow-y-auto p-2 space-y-1 shadow-inner">
                                <p class="text-[10px] text-slate-400 p-2 text-center">Loading...</p>
                            </div>
                        </div>

                        <div class="space-y-1">
                            <label class="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 mb-2">
                                <i class="fa-solid fa-square-check text-emerald-500"></i> Linked Test Series
                            </label>
                            <div id="clinkedTestsList" class="bg-slate-50 border border-slate-200 rounded-xl max-h-40 overflow-y-auto p-2 space-y-1 shadow-inner">
                                <p class="text-[10px] text-slate-400 p-2 text-center">Loading...</p>
                            </div>
                        </div>
                        
                        <div class="space-y-1">
                            <label class="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 mb-2">
                                <i class="fa-solid fa-video text-blue-500"></i> Linked Video Classes
                            </label>
                            <div id="clinkedLivesList" class="bg-slate-50 border border-slate-200 rounded-xl max-h-40 overflow-y-auto p-2 space-y-1 shadow-inner">
                                <p class="text-[10px] text-slate-400 p-2 text-center">Loading...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SECTION 5: Instructions & Description -->`;

adminHtml = adminHtml.replace(section4Regex, newSection4);

// Replace JS logic for populating custom selects in admin.html
const jsRegex = /window\.populateNotesCustomSelect\s*=\s*function\(selectedValue\s*=\s*''\)\s*{[\s\S]*?};[\s\S]*?window\.populateTestsCustomSelect\s*=\s*function\(selectedValue\s*=\s*''\)\s*{[\s\S]*?};/;

const newJsLogic = `
        window.populateNotesMultiSelect = function(selectedIds = []) {
            if (!fb || !db) return Promise.resolve();
            return fb.get(fb.ref(db, 'notes')).then(snap => {
                const list = document.getElementById('clinkedNotesList');
                if (!list) return;
                list.innerHTML = '';
                let hasItems = false;
                if (snap.exists()) {
                    snap.forEach(child => {
                        hasItems = true;
                        const key = child.key;
                        const title = child.val().title || 'Untitled Note';
                        const isChecked = selectedIds.includes(key) ? 'checked' : '';
                        list.innerHTML += \`
                            <label class="flex items-center gap-2 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                                <input type="checkbox" name="linkedNoteIds" value="\${key}" \${isChecked} class="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500">
                                <span class="text-xs font-semibold text-slate-700 truncate" title="\${title}">\${title}</span>
                            </label>
                        \`;
                    });
                }
                if (!hasItems) list.innerHTML = '<p class="text-[10px] text-slate-400 p-2 text-center">No notes available</p>';
            }).catch(err => console.error("Error fetching notes:", err));
        };

        window.populateTestsMultiSelect = function(selectedIds = []) {
            if (!fb || !db) return Promise.resolve();
            return fb.get(fb.ref(db, 'tests')).then(snap => {
                const list = document.getElementById('clinkedTestsList');
                if (!list) return;
                list.innerHTML = '';
                let hasItems = false;
                if (snap.exists()) {
                    snap.forEach(child => {
                        hasItems = true;
                        const key = child.key;
                        const title = child.val().title || 'Untitled Test';
                        const isChecked = selectedIds.includes(key) ? 'checked' : '';
                        list.innerHTML += \`
                            <label class="flex items-center gap-2 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                                <input type="checkbox" name="linkedTestIds" value="\${key}" \${isChecked} class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500">
                                <span class="text-xs font-semibold text-slate-700 truncate" title="\${title}">\${title}</span>
                            </label>
                        \`;
                    });
                }
                if (!hasItems) list.innerHTML = '<p class="text-[10px] text-slate-400 p-2 text-center">No tests available</p>';
            }).catch(err => console.error("Error fetching tests:", err));
        };

        window.populateLivesMultiSelect = function(selectedIds = []) {
            if (!fb || !db) return Promise.resolve();
            return fb.get(fb.ref(db, 'live')).then(snap => {
                const list = document.getElementById('clinkedLivesList');
                if (!list) return;
                list.innerHTML = '';
                let hasItems = false;
                if (snap.exists()) {
                    snap.forEach(child => {
                        hasItems = true;
                        const key = child.key;
                        const title = child.val().title || 'Untitled Class';
                        const isChecked = selectedIds.includes(key) ? 'checked' : '';
                        list.innerHTML += \`
                            <label class="flex items-center gap-2 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                                <input type="checkbox" name="linkedLiveIds" value="\${key}" \${isChecked} class="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500">
                                <span class="text-xs font-semibold text-slate-700 truncate" title="\${title}">\${title}</span>
                            </label>
                        \`;
                    });
                }
                if (!hasItems) list.innerHTML = '<p class="text-[10px] text-slate-400 p-2 text-center">No live classes available</p>';
            }).catch(err => console.error("Error fetching live classes:", err));
        };
`;

adminHtml = adminHtml.replace(jsRegex, newJsLogic);

// Replace references to save/edit course
adminHtml = adminHtml.replace(
    /const linkedNoteId = document\.getElementById\('clinkedNoteId'\) \? document\.getElementById\('clinkedNoteId'\)\.value : '';\s*const linkedTestId = document\.getElementById\('clinkedTestId'\) \? document\.getElementById\('clinkedTestId'\)\.value : '';/g,
    `const linkedNoteIds = Array.from(document.querySelectorAll('input[name="linkedNoteIds"]:checked')).map(cb => cb.value);
            const linkedTestIds = Array.from(document.querySelectorAll('input[name="linkedTestIds"]:checked')).map(cb => cb.value);
            const linkedLiveIds = Array.from(document.querySelectorAll('input[name="linkedLiveIds"]:checked')).map(cb => cb.value);`
);

adminHtml = adminHtml.replace(
    /linkedNoteId,\s*linkedTestId,/g,
    `linkedNoteIds,
                linkedTestIds,
                linkedLiveIds,
                linkedNoteId: linkedNoteIds.length > 0 ? linkedNoteIds[0] : '', // Fallback for legacy compatibility
                linkedTestId: linkedTestIds.length > 0 ? linkedTestIds[0] : '', // Fallback for legacy compatibility`
);

// editCourse population
adminHtml = adminHtml.replace(
    /populateNotesCustomSelect\(c\.linkedNoteId \|\| ''\);\s*populateTestsCustomSelect\(c\.linkedTestId \|\| ''\);/g,
    `populateNotesMultiSelect(c.linkedNoteIds || (c.linkedNoteId ? [c.linkedNoteId] : []));
                    populateTestsMultiSelect(c.linkedTestIds || (c.linkedTestId ? [c.linkedTestId] : []));
                    populateLivesMultiSelect(c.linkedLiveIds || []);`
);

// showCourseModal resets
adminHtml = adminHtml.replace(
    /selectCustomOption\('clinkedNoteId', '', 'No Note Linked', false\);\s*selectCustomOption\('clinkedTestId', '', 'No Test Linked', false\);/g,
    `populateNotesMultiSelect([]);
            populateTestsMultiSelect([]);
            populateLivesMultiSelect([]);`
);

fs.writeFileSync('admin.html', adminHtml);


// Now update index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');

// The rendering of linked resources in course details modal:
// Look for `if(c.linkedNoteId) { ... } if(c.linkedTestId) { ... }`
const renderResRegex = /if\(c\.linkedNoteId\)\s*\{\s*const noteSnap = await fb\.get\(fb\.ref\(db,\s*'notes\/'\s*\+\s*c\.linkedNoteId\)\);\s*if\(noteSnap\.exists\(\)\)\s*\{\s*hasAttachments = true;\s*const n = noteSnap\.val\(\);\s*const safeNoteTitle = \(n\.title \|\| 'Study Note'\)\.replace\(\/"\/g, '&quot;'\);\s*attachList\.innerHTML \+= `[\s\S]*?`;\s*\}\s*\}\s*if\(c\.linkedTestId\)\s*\{\s*const testSnap = await fb\.get\(fb\.ref\(db,\s*'tests\/'\s*\+\s*c\.linkedTestId\)\);\s*if\(testSnap\.exists\(\)\)\s*\{\s*hasAttachments = true;\s*const t = testSnap\.val\(\);\s*attachList\.innerHTML \+= `[\s\S]*?`;\s*\}\s*\}/;

const newRenderRes = `
                    // Handle Multiple Linked Notes
                    const noteIds = c.linkedNoteIds || (c.linkedNoteId ? [c.linkedNoteId] : []);
                    for (const nid of noteIds) {
                        const noteSnap = await fb.get(fb.ref(db, 'notes/' + nid));
                        if(noteSnap.exists()) {
                            hasAttachments = true;
                            const n = noteSnap.val();
                            const safeNoteTitle = (n.title || 'Study Note').replace(/"/g, '&quot;');
                            attachList.innerHTML += \`
                                <div onclick="openNote('\${nid}')" class="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-indigo-50/50 hover:border-indigo-100 active:scale-95 transition-all cursor-pointer">
                                    <div class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0"><i class="fa-solid fa-file-pdf"></i></div>
                                    <div class="flex-1 min-w-0">
                                        <h4 class="text-xs font-black text-slate-800 truncate">Study Notes: \${safeNoteTitle}</h4>
                                        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Click to view material</p>
                                    </div>
                                    <i class="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
                                </div>
                            \`;
                        }
                    }

                    // Handle Multiple Linked Tests
                    const testIds = c.linkedTestIds || (c.linkedTestId ? [c.linkedTestId] : []);
                    for (const tid of testIds) {
                        const testSnap = await fb.get(fb.ref(db, 'tests/' + tid));
                        if(testSnap.exists()) {
                            hasAttachments = true;
                            const t = testSnap.val();
                            const safeTestTitle = (t.title || 'Test Series').replace(/"/g, '&quot;');
                            attachList.innerHTML += \`
                                <div onclick="startQuiz('\${tid}')" class="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-indigo-50/50 hover:border-indigo-100 active:scale-95 transition-all cursor-pointer">
                                    <div class="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0"><i class="fa-solid fa-vial"></i></div>
                                    <div class="flex-1 min-w-0">
                                        <h4 class="text-xs font-black text-slate-800 truncate">Test Series: \${safeTestTitle}</h4>
                                        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Assessment Ready</p>
                                    </div>
                                    <i class="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
                                </div>
                            \`;
                        }
                    }
                    
                    // Handle Multiple Linked Video (Live) Classes
                    const liveIds = c.linkedLiveIds || [];
                    for (const lid of liveIds) {
                        const liveSnap = await fb.get(fb.ref(db, 'live/' + lid));
                        if(liveSnap.exists()) {
                            hasAttachments = true;
                            const l = liveSnap.val();
                            const safeLiveTitle = (l.title || 'Video Class').replace(/"/g, '&quot;');
                            attachList.innerHTML += \`
                                <div onclick="navigateTo('live')" class="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-blue-50/50 hover:border-blue-100 active:scale-95 transition-all cursor-pointer">
                                    <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0"><i class="fa-solid fa-video"></i></div>
                                    <div class="flex-1 min-w-0">
                                        <h4 class="text-xs font-black text-slate-800 truncate">Video Class: \${safeLiveTitle}</h4>
                                        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Go to Live Classes tab</p>
                                    </div>
                                    <i class="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
                                </div>
                            \`;
                        }
                    }
`;

indexHtml = indexHtml.replace(renderResRegex, newRenderRes);

fs.writeFileSync('index.html', indexHtml);
console.log('Update complete!');
