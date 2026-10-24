import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

match = re.search(r'// Attachments \(Notes/Tests/Live\).*?if\(hasAttachments\)', text, re.DOTALL)

if not match:
    print('Not found')
    exit(1)

old_text = match.group(0)

new_text = '''// Attachments (Notes/Tests/Live)
                const attachSec = document.getElementById('attachmentSec');
                const attachList = document.getElementById('detAttachments');
                attachList.innerHTML = "";
                let hasAttachments = false;
                
                const noteIds = c.linkedNoteIds || (c.linkedNoteId ? [c.linkedNoteId] : []);
                for (let nid of noteIds) {
                    const noteSnap = await fb.get(fb.ref(db, 'notes/' + nid));
                    if(noteSnap.exists()) {
                        hasAttachments = true;
                        const n = noteSnap.val();
                        attachList.innerHTML += \`
                            <div onclick="\${hasAccess ? \`viewPdf('\${n.url}', '\${n.title}')\` : 'showToast(\\'Purchase course to unlock this material\\')'}" class="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 active:scale-95 transition-all cursor-pointer">
                                <div class="w-10 h-10 \${hasAccess ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'} rounded-xl flex items-center justify-center shrink-0"><i class="fa-solid fa-file-pdf"></i></div>
                                <div class="flex-1">
                                    <h4 class="text-xs font-black text-slate-800">Study Notes: \${n.title}</h4>
                                    <p class="text-[9px] \${hasAccess ? 'text-slate-400' : 'text-amber-500'} font-bold uppercase tracking-widest mt-0.5">\${hasAccess ? 'Click to view material' : '<i class="fa-solid fa-lock"></i> Locked'}</p>
                                </div>
                                <i class="fa-solid \${hasAccess ? 'fa-chevron-right' : 'fa-lock'} text-slate-300 text-xs"></i>
                            </div>
                        \`;
                    }
                }

                const testIds = c.linkedTestIds || (c.linkedTestId ? [c.linkedTestId] : []);
                for (let tid of testIds) {
                    const testSnap = await fb.get(fb.ref(db, 'tests/' + tid));
                    if(testSnap.exists()) {
                        hasAttachments = true;
                        const t = testSnap.val();
                        attachList.innerHTML += \`
                            <div onclick="\${hasAccess ? \`startQuiz('\${tid}')\` : 'showToast(\\'Purchase course to unlock this test\\')'}" class="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 active:scale-95 transition-all cursor-pointer">
                                <div class="w-10 h-10 \${hasAccess ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'} rounded-xl flex items-center justify-center shrink-0"><i class="fa-solid fa-vial"></i></div>
                                <div class="flex-1">
                                    <h4 class="text-xs font-black text-slate-800">Test Series: \${t.title}</h4>
                                    <p class="text-[9px] \${hasAccess ? 'text-slate-400' : 'text-amber-500'} font-bold uppercase tracking-widest mt-0.5">\${hasAccess ? 'Assessment Ready' : '<i class="fa-solid fa-lock"></i> Locked'}</p>
                                </div>
                                <i class="fa-solid \${hasAccess ? 'fa-chevron-right' : 'fa-lock'} text-slate-300 text-xs"></i>
                            </div>
                        \`;
                    }
                }

                const liveIds = c.linkedLiveIds || (c.linkedLiveId ? [c.linkedLiveId] : []);
                for (let lid of liveIds) {
                    const liveSnap = await fb.get(fb.ref(db, 'live/' + lid));
                    if(liveSnap.exists()) {
                        hasAttachments = true;
                        const l = liveSnap.val();
                        attachList.innerHTML += \`
                            <div onclick="\${hasAccess ? \`openLive('\${lid}')\` : 'showToast(\\'Purchase course to unlock live class\\')'}" class="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 active:scale-95 transition-all cursor-pointer">
                                <div class="w-10 h-10 \${hasAccess ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-400'} rounded-xl flex items-center justify-center shrink-0"><i class="fa-solid fa-video"></i></div>
                                <div class="flex-1">
                                    <h4 class="text-xs font-black text-slate-800">Video Class: \${l.title}</h4>
                                    <p class="text-[9px] \${hasAccess ? 'text-slate-400' : 'text-amber-500'} font-bold uppercase tracking-widest mt-0.5">\${hasAccess ? l.mode : '<i class="fa-solid fa-lock"></i> Locked'}</p>
                                </div>
                                <i class="fa-solid \${hasAccess ? 'fa-chevron-right' : 'fa-lock'} text-slate-300 text-xs"></i>
                            </div>
                        \`;
                    }
                }
                
                if(hasAttachments)'''

text = text.replace(old_text, new_text)
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print('Done fixing attachments visibility.')
