        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
        import { getDatabase, ref, onValue, get, set, push, update, remove, child } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
        import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

        const firebaseConfig = {
            apiKey: "AIzaSyB4tJouk9J21av3_5nSSIlJ24y9QUjSDw4",
            authDomain: "eos-classes-ff351.firebaseapp.com",
            databaseURL: "https://eos-classes-ff351-default-rtdb.firebaseio.com",
            projectId: "eos-classes-ff351",
            storageBucket: "eos-classes-ff351.firebasestorage.app",
            messagingSenderId: "355661444126",
            appId: "1:355661444126:web:8d525a914a2bf645aaaa0f"
        };

        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);
        const auth = getAuth(app);
        window.db = db;
        window.auth = auth;
        const fb = { ref, onValue, get, set, push, update, remove, child, signInWithEmailAndPassword, signOut, onAuthStateChanged };
        window.fb = fb;

        // --- Expose functions to window (CRITICAL for onclick handlers in script type="module") ---
        // Hoisting allows this even before definition
        window.adminLogin = adminLogin;
        window.adminLogout = adminLogout;
        window.showToast = showToast;
        window.switchTab = switchTab;
        window.showCourseModal = showCourseModal;
        window.showLiveModal = showLiveModal;
        window.showNoteModal = showNoteModal;
        window.showUpcomingModal = showUpcomingModal;
        window.editUpcoming = editUpcoming;
        window.showTestModal = showTestModal;
        window.editTest = editTest;
        window.showQuestionModal = showQuestionModal;
        window.showAdvancedTestModal = showAdvancedTestModal;
        window.setTestMethod = setTestMethod;
        window.backToStep1 = backToStep1;
        window.addManualQuestion = addManualQuestion;
        window.handleJSONFile = handleJSONFile;
        window.parseAndFinishText = parseAndFinishText;
        window.finishTestCreation = finishTestCreation;
        window.editLive = editLive;
        window.editCourse = editCourse;
        window.editCategory = editCategory;
        window.closeModal = closeModal;
        window.showCategoryModal = showCategoryModal;
        window.saveCategory = saveCategory;
        window.saveCourse = saveCourse;
        window.saveUpcoming = saveUpcoming;
        window.saveLive = saveLive;
        window.saveNote = saveNote;
        window.saveTest = saveTest;
        window.saveQuestion = saveQuestion;
        window.addSlider = addSlider;
        window.deleteSlider = deleteSlider;
        window.editSlider = editSlider;
        window.showDemoModal = showDemoModal;
        window.editDemo = editDemo;
        window.saveDemo = saveDemo;
        window.approvePayment = approvePayment;
        window.deleteItem = deleteItem;
        window.sendAlert = sendAlert;
        window.savePaymentSettings = savePaymentSettings;
        window.saveBannerSettings = saveBannerSettings;
        window.saveSocialSettings = saveSocialSettings;
        window.saveContactSettings = saveContactSettings;
        window.togglePrice = togglePrice;
        window.previewAdminYoutube = previewAdminYoutube;
        window.toggleTestStatus = toggleTestStatus;
        window.showStaffModal = showStaffModal;
        window.editStaffAdmin = editStaffAdmin;
        window.saveStaffAdmin = saveStaffAdmin;
        window.deleteStaffAdmin = deleteStaffAdmin;
        window.toggleStaffStatus = toggleStaffStatus;

        function showToast(msg) {
            const t = document.getElementById('toast');
            document.getElementById('toastMsg').innerText = msg;
            t.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-10');
            t.classList.add('opacity-100', 'translate-y-0');
            setTimeout(() => {
                t.classList.add('opacity-0', 'pointer-events-none', 'translate-y-10');
                t.classList.remove('opacity-100', 'translate-y-0');
            }, 3000);
        }
        
        // --- Auth Check ---
        async function adminLogin() {
            const user = document.getElementById('adminUser').value.trim();
            const pass = document.getElementById('adminPass').value.trim();
            if(!user || !pass) {
                alert("Please enter both username/email and password");
                return;
            }

            const errorEl = document.getElementById('loginError');
            if(errorEl) errorEl.innerText = 'Authenticating...';

            const proceed = () => {
                sessionStorage.setItem('isAdmin', 'true');
                document.getElementById('loginOverlay').style.display = 'none';
                
                const adminSide = document.getElementById('adminSide');
                const adminMain = document.getElementById('adminMain');
                
                if(adminSide) adminSide.classList.remove('hidden', 'opacity-0');
                if(adminMain) adminMain.classList.remove('hidden', 'opacity-0');
                
                loadAdminData();
                if(typeof showToast === 'function') showToast("Authenticated Successfully");
            };

            if (user.includes('@')) {
                try {
                    const userCred = await fb.signInWithEmailAndPassword(window.auth, user, pass);
                    const email = userCred.user.email;
                    const sanitizedEmail = email.replace(/\./g, ',');
                    
                    if (email !== 'xanasrahmani@gmail.com') {
                        const adminSnap = await fb.get(fb.ref(db, 'admins/' + sanitizedEmail));
                        if (!adminSnap.exists()) {
                            await fb.signOut(window.auth);
                            if(errorEl) errorEl.innerText = 'Access Denied: Not an authorized admin account.';
                            return;
                        }
                    }
                    proceed();
                } catch (e) {
                    console.error("Login Error:", e);
                    let msg = "Invalid email or password.";
                    if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
                        msg = "Incorrect email or password.";
                    } else if (e.code === 'auth/invalid-email') {
                        msg = "Invalid email address format.";
                    }
                    if(errorEl) errorEl.innerText = msg;
                }
            } else {
                try {
                    const adminSnap = await fb.get(fb.ref(db, 'admins/' + user));
                    if (adminSnap.exists() && String(adminSnap.val()) === String(pass)) {
                        proceed();
                    } else if (user === 'admin' && pass === 'admin123') {
                        proceed();
                    } else {
                        if(errorEl) errorEl.innerText = 'Incorrect username or password.';
                    }
                } catch(e) {
                    if (user === 'admin' && pass === 'admin123') {
                        proceed();
                    } else {
                        if(errorEl) errorEl.innerText = 'Authentication error: ' + e.message;
                    }
                }
            }
        }
        
        function adminLogout() {
            if (confirm('Logout from admin?')) {
                sessionStorage.removeItem('isAdmin');
                window.location.reload();
            }
        }

        // --- Tab Switching ---
        function switchTab(tab) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            const tabEl = document.getElementById('tab-' + tab);
            if (tabEl) tabEl.classList.add('active');
            
            document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
            const navEl = document.getElementById('nav-' + tab);
            if (navEl) navEl.classList.add('active');
            
            closeModal();
        }

        // --- Load Functionality ---
        let coursesList = [];
        function loadAdminData() {
            // Stats & Students
            fb.onValue(fb.ref(db, 'users'), snap => {
                const countEl = document.getElementById('stat-students');
                if (countEl) countEl.innerText = snap.exists() ? Object.keys(snap.val()).length : 0;
                
                const table = document.getElementById('studentsTableBody');
                const latest = document.getElementById('latestStudents');
                if (!table || !latest) return;
                
                table.innerHTML = '';
                latest.innerHTML = '';
                let count = 0;
                snap.forEach(child => {
                    const s = child.val();
                    table.innerHTML += `
                        <tr>
                            <td><div class="flex items-center gap-3"><div class="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white">${s.name.charAt(0)}</div> ${s.name}</div></td>
                            <td>${s.phone}</td>
                            <td>${s.gender} / ${s.age}</td>
                            <td>${Object.keys(s.purchased || {}).length} Courses</td>
                        </tr>
                    `;
                    if (count < 5) {
                        latest.innerHTML += `
                            <div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black">${s.name.charAt(0)}</div>
                                    <div>
                                        <p class="text-sm font-black text-slate-800">${s.name}</p>
                                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">${s.gender || 'Student'}</p>
                                    </div>
                                </div>
                                <span class="text-[10px] font-black text-slate-400">${s.phone}</span>
                            </div>
                        `;
                        count++;
                    }
                });
            });

            // Settings
            fb.get(fb.ref(db, 'settings/global')).then(snap => {
                if(snap.exists()) {
                    const c = snap.val().contacts || [];
                    if(c[0]) document.getElementById('setContact1').value = c[0];
                    if(c[1]) document.getElementById('setContact2').value = c[1];
                    if(c[2]) document.getElementById('setContact3').value = c[2];
                }
            });
            fb.get(fb.ref(db, 'settings/social')).then(snap => {
                if(snap.exists()){
                    const s = snap.val();
                    document.getElementById('setTelegram').value = s.telegram || '';
                    document.getElementById('setWhatsapp').value = s.whatsapp || '';
                    document.getElementById('setWhatsappChannel').value = s.whatsappChannel || '';
                    document.getElementById('setWhatsappGroup').value = s.whatsappGroup || '';
                    document.getElementById('setYoutube').value = s.youtube || '';
                    document.getElementById('setThirdApp').value = s.thirdApp || '';
                    document.getElementById('setInstagram').value = s.instagram || '';
                    document.getElementById('setWebsite').value = s.website || '';
                    document.getElementById('setEmail').value = s.email || '';
                }
            });

            // Courses
            fb.onValue(fb.ref(db, 'courses'), snap => {
                const countEl = document.getElementById('stat-courses');
                if (countEl) countEl.innerText = snap.exists() ? Object.keys(snap.val()).length : 0;
                
                const grid = document.getElementById('coursesGrid');
                const lCourse = document.getElementById('lCourse');
                const nCourse = document.getElementById('nCourse');
                if (!grid) return;
                
                grid.innerHTML = '';
                if (lCourse) lCourse.innerHTML = '<option value="">Linked Course</option>';
                if (nCourse) nCourse.innerHTML = '<option value="">None</option>';
                
                coursesList = [];
                snap.forEach(child => {
                    const c = child.val();
                    const id = child.key;
                    coursesList.push({id, title: c.title});
                    if (lCourse) lCourse.innerHTML += `<option value="${id}">${c.title}</option>`;
                    if (nCourse) nCourse.innerHTML += `<option value="${id}">${c.title}</option>`;
                    grid.innerHTML += `
                        <div class="card-admin relative">
                            <img src="${c.thumbnail}" class="w-full h-32 object-cover rounded-lg mb-4">
                            <h3 class="font-bold truncate text-slate-800">${c.title}</h3>
                            <p class="text-xs text-slate-500 mt-1">${c.category} • ${c.type}</p>
                            <div class="flex justify-between items-center mt-4">
                                <div class="flex flex-col">
                                    ${c.discount > 0 ? `
                                        <span class="text-[10px] text-slate-300 line-through">₹${c.price}</span>
                                        <span class="font-bold text-indigo-600">₹${Math.round(c.price * (1 - c.discount/100))}</span>
                                    ` : `
                                        <span class="font-bold text-indigo-600">₹${c.price}</span>
                                    `}
                                </div>
                                <div class="flex gap-2">
                                    <button onclick="editCourse('${id}')" class="text-indigo-600 hover:text-indigo-800 transition-colors"><i class="fa-solid fa-pen-to-square"></i></button>
                                    <button onclick="deleteItem('courses', '${id}')" class="text-rose-500 hover:text-rose-700 transition-colors"><i class="fa-solid fa-trash"></i></button>
                                </div>
                            </div>
                        </div>
                    `;
                });
            });

            // Slider
            fb.onValue(fb.ref(db, 'sliders'), snap => {
                const grid = document.getElementById('sliderGrid');
                if (!grid) return;
                grid.innerHTML = '';
                snap.forEach(child => {
                    const s = child.val();
                    const id = child.key;
                    // Support legacy string format and new object format
                    const url = typeof s === 'string' ? s : s.url;
                    
                    grid.innerHTML += `
                        <div class="card-admin relative group overflow-hidden">
                            <img src="${url}" class="w-full h-40 object-cover rounded-xl shadow-lg">
                            <div class="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    Action: <span class="text-indigo-600">${s.action || 'None'}</span>
                                </div>
                                <div class="flex gap-2">
                                    <button onclick="deleteSlider('${id}')" class="text-rose-500 hover:text-rose-700"><i class="fa-solid fa-trash"></i></button>
                                    <button onclick="editSlider('${id}')" class="text-indigo-600 hover:text-indigo-800"><i class="fa-solid fa-pen"></i></button>
                                </div>
                            </div>
                        </div>
                    `;
                });
            });

            // Demo Classes
            fb.onValue(fb.ref(db, 'demo'), snap => {
                const grid = document.getElementById('demoGrid');
                if (!grid) return;
                grid.innerHTML = '';
                snap.forEach(child => {
                    const d = child.val();
                    const id = child.key;
                    grid.innerHTML += `
                        <div class="card-admin overflow-hidden flex flex-col">
                            <div class="relative">
                                <img src="${d.thumbnail}" class="w-full h-40 object-cover rounded-lg">
                                <span class="absolute top-2 right-2 px-2 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-lg shadow-xl">${d.playMode}</span>
                            </div>
                            <div class="p-2 flex-1 mt-2">
                                <h3 class="font-black text-slate-800 tracking-tight leading-tight">${d.title}</h3>
                                <p class="text-[10px] text-slate-400 mt-1 line-clamp-2 font-medium">${d.description || 'No description provided.'}</p>
                            </div>
                            <div class="flex gap-2 p-2 border-t border-slate-50 mt-4">
                                <button onclick="editDemo('${id}')" class="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Edit</button>
                                <button onclick="deleteItem('demo', '${id}')" class="w-12 h-12 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                });
            });
            // Live Classes
            fb.onValue(fb.ref(db, 'live'), snap => {
                const countEl = document.getElementById('stat-live');
                if (countEl) countEl.innerText = snap.exists() ? Object.keys(snap.val()).length : 0;

                const table = document.getElementById('liveTableBody');
                if (!table) return;
                table.innerHTML = '';
                snap.forEach(child => {
                    const l = child.val();
                    const id = child.key;
                    table.innerHTML += `
                        <tr class="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td class="py-4">
                                <div class="font-black text-slate-800">${l.title}</div>
                                <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">${l.courseName || 'General'}</div>
                            </td>
                            <td><span class="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">${l.mode}</span></td>
                            <td><span class="px-3 py-1 ${l.type === 'Free' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} rounded-lg text-[10px] font-black uppercase">${l.type}</span></td>
                            <td class="text-right">
                                <div class="flex justify-end gap-3">
                                    <button onclick="editLive('${id}')" class="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center gap-1">
                                        <i class="fa-solid fa-pen-to-square"></i> Edit
                                    </button>
                                    <button onclick="deleteItem('live', '${id}')" class="text-rose-500 hover:text-rose-700 font-bold text-xs flex items-center gap-1">
                                        <i class="fa-solid fa-trash"></i> Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
            });

            // Notes
            fb.onValue(fb.ref(db, 'notes'), snap => {
                const table = document.getElementById('notesTableBody');
                if (!table) return;
                table.innerHTML = '';
                snap.forEach(child => {
                    const n = child.val();
                    const id = child.key;
                    table.innerHTML += `
                        <tr class="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td class="py-4 font-black text-slate-800">${n.title}</td>
                            <td><span class="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">${n.type}</span></td>
                            <td><span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">${n.courseName || 'General'}</span></td>
                            <td class="text-right">
                                <div class="flex justify-end gap-3">
                                    <button onclick="editNote('${id}')" class="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center gap-1">
                                        <i class="fa-solid fa-pen-to-square"></i> Edit
                                    </button>
                                    <button onclick="deleteItem('notes', '${id}')" class="text-rose-500 hover:text-rose-700 font-bold text-xs flex items-center gap-1">
                                        <i class="fa-solid fa-trash"></i> Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
            });

            // Payments
            fb.onValue(fb.ref(db, 'payment_requests'), snap => {
                let pending = 0;
                const table = document.getElementById('paymentsTableBody');
                const latest = document.getElementById('latestPayments');
                if (!table || !latest) return;
                
                table.innerHTML = '';
                latest.innerHTML = '';
                let count = 0;
                snap.forEach(child => {
                    const p = child.val();
                    const id = child.key;
                    if (p.status === 'Pending') pending++;
                    
                    table.innerHTML += `
                        <tr>
                            <td><div><p class="font-bold text-slate-800">${p.userName}</p><p class="text-[10px] text-slate-500">${p.userPhone}</p></div></td>
                            <td>${p.courseName}</td>
                            <td><span class="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-mono border border-indigo-100">${p.txnId}</span></td>
                            <td><span class="${p.status === 'Approved' ? 'text-emerald-600' : 'text-amber-600'} font-bold">${p.status}</span></td>
                            <td>
                                ${p.status === 'Pending' ? `
                                    <button onclick="approvePayment('${id}', '${p.userId}', '${p.courseId}')" class="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs font-bold mr-2 shadow-sm hover:bg-emerald-700">Approve</button>
                                    <button onclick="deleteItem('payment_requests', '${id}')" class="bg-rose-600 text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm hover:bg-rose-700">Reject</button>
                                ` : '<span class="text-slate-400 font-bold text-xs uppercase tracking-widest">Processed</span>'}
                            </td>
                        </tr>
                    `;
                    if (count < 5) {
                        latest.innerHTML += `
                            <div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div>
                                    <p class="text-sm font-black text-slate-800">${p.userName}</p>
                                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">${p.courseName}</p>
                                </div>
                                <span class="text-[10px] font-black ${p.status === 'Pending' ? 'text-rose-500' : 'text-emerald-500'} uppercase tracking-widest">${p.status}</span>
                            </div>
                        `;
                        count++;
                    }
                });
                
                const statPending = document.getElementById('stat-pending');
                if (statPending) statPending.innerText = pending;
                
                const pb = document.getElementById('pendingBadge');
                if (pb) {
                    if (pending > 0) { 
                        pb.innerText = pending; 
                        pb.classList.remove('hidden'); 
                    } else { 
                        pb.classList.add('hidden'); 
                    }
                }
            });

            // Categories
            fb.onValue(fb.ref(db, 'categories'), snap => {
                const table = document.getElementById('categoriesTableBody');
                if (!table) return;
                table.innerHTML = '';
                
                const cCatSelect = document.getElementById('cCat');
                const lCatSelect = document.getElementById('lCat');
                const nCatSelect = document.getElementById('nCat');
                const tCatSelect = document.getElementById('tCat');
                const uCatSelect = document.getElementById('uCat');
                const notifCatSelect = document.getElementById('notifCat');
                const advTCatSelect = document.getElementById('advTCat');
                const staffCatSelect = document.getElementById('staffCat');
                
                const selects = [cCatSelect, lCatSelect, nCatSelect, tCatSelect, uCatSelect, advTCatSelect, staffCatSelect];
                selects.forEach(sel => {
                   if(sel) sel.innerHTML = '<option value="">Select Category</option>';
                });
                if(notifCatSelect) notifCatSelect.innerHTML = '<option value="All">All Students</option>';

                snap.forEach(child => {
                    const cat = child.val();
                    const id = child.key;
                    
                    selects.forEach(sel => {
                        if(sel) sel.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
                    });
                    if(notifCatSelect) notifCatSelect.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
                    
                    table.innerHTML += `
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="px-6 py-4"><span class="font-bold text-slate-800">${cat.name}</span></td>
                            <td class="px-6 py-4"><code class="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">${id}</code></td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex justify-end gap-4">
                                    <button onclick="editCategory('${id}')" class="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center gap-1">
                                        <i class="fa-solid fa-pen-to-square"></i> Edit
                                    </button>
                                    <button onclick="deleteItem('categories', '${id}')" class="text-rose-500 hover:text-rose-700 font-bold text-xs flex items-center gap-1">
                                        <i class="fa-solid fa-trash"></i> Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
            });

            // Staff Admins
            fb.onValue(fb.ref(db, 'admins'), snap => {
                const grid = document.getElementById('staffGrid');
                if (!grid) return;
                grid.innerHTML = '';
                snap.forEach(child => {
                    const id = child.key;
                    const val = child.val();
                    // Handle both old string format and new object format
                    const isObj = typeof val === 'object' && val !== null;
                    const pass = isObj ? val.password : val;
                    const enabled = isObj ? (val.enabled !== false) : true;
                    
                    grid.innerHTML += `
                        <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-indigo-100 transition-all">
                            <div class="flex justify-between items-start mb-4">
                                <div class="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                    <i class="fa-solid fa-user-gear text-xl"></i>
                                </div>
                                <div class="flex gap-2">
                                    ${id !== 'admin' ? `
                                        <button onclick="toggleStaffStatus('${id}', ${enabled})" class="w-8 h-8 rounded-lg flex items-center justify-center ${enabled ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}">
                                            <i class="fa-solid ${enabled ? 'fa-user-slash' : 'fa-user-check'} text-[10px]"></i>
                                        </button>
                                        <button onclick="deleteStaffAdmin('${id}')" class="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                                            <i class="fa-solid fa-trash text-[10px]"></i>
                                        </button>
                                    ` : `
                                        <span class="px-2 py-1 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase rounded-lg">Master</span>
                                    `}
                                </div>
                            </div>
                            <div>
                                <h4 class="font-black text-slate-800">${id}</h4>
                                <div class="mt-1 flex items-center gap-2">
                                    <span class="w-1.5 h-1.5 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-rose-500'}"></span>
                                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${enabled ? 'Active Account' : 'Account Disabled'}</span>
                                </div>
                                <div class="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <p class="text-[11px] font-mono text-slate-400">PW: <span class="bg-slate-100 px-2 py-0.5 rounded text-slate-800">${pass}</span></p>
                                    <button onclick="editStaffAdmin('${id}', '${pass}')" class="text-indigo-600 font-bold text-[10px] uppercase tracking-widest">Update</button>
                                </div>
                            </div>
                        </div>
                    `;
                });
            });

            // Notifications history in Admin
            fb.onValue(fb.ref(db, 'notifications'), snap => {
                const list = document.getElementById('adminNotificationsList');
                if(!list) return;
                list.innerHTML = '';
                if(!snap.exists()) {
                    list.innerHTML = '<div class="text-center py-10 text-slate-300 font-bold">No history available.</div>';
                    return;
                }
                snap.forEach(child => {
                    const id = child.key;
                    const n = child.val();
                    list.insertAdjacentHTML('afterbegin', `
                        <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative group">
                            <button onclick="deleteItem('notifications', '${id}')" class="absolute top-2 right-2 text-rose-300 hover:text-rose-500 transition-colors">
                                <i class="fa-solid fa-trash text-[10px]"></i>
                            </button>
                            <div class="flex flex-col mb-1">
                                <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">${n.category || 'Global'} • ${new Date(n.time || Date.now()).toLocaleDateString()}</span>
                                <h4 class="font-black text-xs text-slate-800 truncate">${n.title}</h4>
                            </div>
                            <p class="text-[10px] text-slate-500 line-clamp-2">${n.message}</p>
                        </div>
                    `);
                });
            });

            // Upcoming Courses
            fb.onValue(fb.ref(db, 'upcoming_courses'), snap => {
                const grid = document.getElementById('upcomingGrid');
                if (!grid) return;
                grid.innerHTML = '';
                snap.forEach(child => {
                    const u = child.val();
                    const id = child.key;
                    grid.innerHTML += `
                        <div class="card-admin relative">
                            <img src="${u.thumbnail}" class="w-full h-32 object-cover rounded-lg mb-4">
                            <h3 class="font-bold truncate text-slate-800">${u.title}</h3>
                            <p class="text-xs text-indigo-500 font-black uppercase mt-1">🚀 ${u.launchDate || 'TBA'}</p>
                            <div class="mt-4 flex justify-end gap-2">
                                <button onclick="editUpcoming('${id}')" class="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center gap-1">
                                    <i class="fa-solid fa-pen-to-square"></i> Edit
                                </button>
                                <button onclick="deleteItem('upcoming_courses', '${id}')" class="text-rose-500 hover:text-rose-700 transition-colors p-1"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    `;
                });
            });

            // Settings 
            fb.onValue(fb.ref(db, 'settings/logo'), snapshot => {
                if(snapshot.exists() && snapshot.val().url) {
                    const url = snapshot.val().url;
                    const el = document.getElementById('adminLogo');
                    if(el) {
                        el.innerHTML = `<img src="${url}" class="w-full h-full object-contain rounded-lg">`;
                        el.style.background = 'transparent';
                    }
                }
            });
            fb.get(fb.ref(db, 'settings/payment')).then(s => { if(s.exists()) document.getElementById('setPayLink').value = s.val().link; });
            fb.get(fb.ref(db, 'settings/logo')).then(s => { if(s.exists()) document.getElementById('setLogoUrl').value = s.val().url; });
            fb.get(fb.ref(db, 'settings/notification')).then(s => { if(s.exists()) document.getElementById('setBanner').value = s.val(); });
            fb.get(fb.ref(db, 'settings/social')).then(s => { 
                if(s.exists()){
                    const v = s.val();
                    document.getElementById('setTelegram').value = v.telegram || '';
                    document.getElementById('setWhatsapp').value = v.whatsapp || '';
                    document.getElementById('setWhatsappChannel').value = v.whatsappChannel || '';
                    document.getElementById('setWhatsappGroup').value = v.whatsappGroup || '';
                    document.getElementById('setYoutube').value = v.youtube || '';
                    document.getElementById('setThirdApp').value = v.thirdApp || '';
                    document.getElementById('setInstagram').value = v.instagram || '';
                    document.getElementById('setWebsite').value = v.website || '';
                    document.getElementById('setEmail').value = v.email || '';
                }
            });
        }

            // Tests
            fb.onValue(fb.ref(db, 'tests'), snap => {
                const list = document.getElementById('testsTableBody');
                if (!list) return;
                list.innerHTML = '';
                snap.forEach(child => {
                    const id = child.key;
                    const t = child.val();
                    const isEnabled = t.enabled !== false; 
                    list.innerHTML += `
                        <tr class="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2 mb-1">
                                    <h4 class="font-black text-slate-800">${t.title}</h4>
                                    <span class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${isEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}">
                                        ${isEnabled ? 'Active' : 'Disabled'}
                                    </span>
                                </div>
                                <p class="text-[10px] text-slate-400 font-medium">${t.courseName} • ${t.type}</p>
                            </td>
                            <td class="px-6 py-4" id="qList-${id}">
                                <span class="text-[10px] text-slate-300">Loading...</span>
                            </td>
                            <td class="px-6 py-4">
                                <span class="text-xs font-bold text-slate-600">${t.timePerQuestion}s</span>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex justify-end gap-2">
                                    <button onclick="toggleTestStatus('${id}', ${isEnabled})" class="w-8 h-8 rounded-lg flex items-center justify-center ${isEnabled ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}" title="${isEnabled ? 'Disable' : 'Enable'}">
                                        <i class="fa-solid fa-power-off text-[10px]"></i>
                                    </button>
                                    <button onclick="editTest('${id}')" class="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                                        <i class="fa-solid fa-pen text-[10px]"></i>
                                    </button>
                                    <button onclick="viewSubmissions('${id}', '${t.title}')" class="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm hover:translate-y-[-1px] transition-all">Results</button>
                                    <button onclick="showQuestionModal('${id}')" class="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm hover:translate-y-[-1px] transition-all">Add Q</button>
                                    <button onclick="deleteItem('tests', '${id}')" class="w-8 h-8 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                                        <i class="fa-solid fa-trash text-[10px]"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                    // Brief count update
                    fb.onValue(fb.ref(db, `questions/${id}`), qSnap => {
                        const target = document.getElementById(`qList-${id}`);
                        const qCount = qSnap.exists() ? Object.keys(qSnap.val()).length : 0;
                        if(target) target.innerHTML = `<span class="text-xs font-bold text-indigo-500 font-black flex items-center gap-1">
                            <i class="fa-solid fa-layer-group text-[10px]"></i> ${qCount} Qs
                        </span>`;
                    });
                });
            });

            // Submissions Logic
            function viewSubmissions(testId, title) {
                document.getElementById('modalOverlay').style.display = 'flex';
                document.getElementById('submissionsModal').classList.remove('hidden');
                document.getElementById('subTitle').innerText = title;
                
                fb.onValue(fb.ref(db, `test_submissions/${testId}`), snap => {
                    const list = document.getElementById('subList');
                    list.innerHTML = '';
                    if(!snap.exists()) {
                        list.innerHTML = '<div class="text-center py-20 text-slate-400 font-bold">No students have taken this test yet.</div>';
                        return;
                    }

                    snap.forEach(child => {
                        const s = child.val();
                        const userId = child.key;
                        const name = s.studentName || 'Student: ' + userId.substring(0,6);
                        
                        list.innerHTML += `
                            <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                                <div class="flex justify-between items-start mb-6">
                                    <div>
                                        <h4 class="font-black text-lg text-slate-800">${name}</h4>
                                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Attempted: ${new Date(s.submittedAt).toLocaleString()}</p>
                                    </div>
                                    <div class="bg-indigo-600 text-white px-4 py-2 rounded-xl font-black shadow-lg">
                                        Score: ${s.score !== undefined ? s.score : 'NA'}
                                    </div>
                                </div>
                                
                                <div class="space-y-4">
                                    ${Object.keys(s.answers || {}).map((qId, i) => `
                                        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div class="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                                <span>Question ${i+1}</span>
                                            </div>
                                            <p class="text-xs font-bold text-slate-700 mb-3 underline decoration-indigo-200">${s.answers[qId]}</p>
                                            <div class="flex flex-col gap-2 mt-4 bg-white p-3 rounded-xl border border-slate-200">
                                                <label class="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Faculty Feedback</label>
                                                <div class="flex gap-2">
                                                    <input type="text" id="feedback-${testId}-${userId}-${qId}" 
 value="${(s.feedback && s.feedback[qId]) ? s.feedback[qId] : ''}" 
 placeholder="Write expert guidance here..." 
 class="bg-white border border-slate-200 text-slate-900 flex-1 bg-transparent text-xs py-1 outline-none">
                                                    <button onclick="saveFeedback('${testId}', '${userId}', '${qId}')" class="text-indigo-600 hover:text-indigo-800 p-2"><i class="fa-solid fa-paper-plane"></i></button>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `;
                    });
                });
            }

            function saveFeedback(testId, userId, qId) {
                const fbText = document.getElementById(`feedback-${testId}-${userId}-${qId}`).value;
                fb.set(fb.ref(db, `test_submissions/${testId}/${userId}/feedback/${qId}`), fbText).then(() => {
                    alert("Feedback Saved!");
                });
            }

            function closeSubmissions() {
                document.getElementById('submissionsModal').classList.add('hidden');
                document.getElementById('modalOverlay').style.display = 'none';
            }

            window.viewSubmissions = viewSubmissions;
            window.saveFeedback = saveFeedback;
            window.closeSubmissions = closeSubmissions;

        // --- Actions ---
        function showAdvancedTestModal() {
            editingTestId = null;
            questionsArr = [];
            currentMethod = 'manual';
            document.getElementById('advTTitle').value = '';
            document.getElementById('advTTimer').value = '20';
            document.getElementById('advTStatus').value = 'Free';
            document.getElementById('advTPrice').value = '';
            document.getElementById('advTDiscount').value = '';
            document.getElementById('advTPayLink').value = '';
            document.getElementById('advTDesc').value = '';
            document.getElementById('advTPaidDetails').classList.add('hidden');
            
            document.getElementById('manualQuestionsList').innerHTML = '';
            document.getElementById('textParserInput').value = '';
            document.getElementById('jsonPreview').classList.add('hidden');
            document.getElementById('btnSaveJSON').classList.add('opacity-50', 'pointer-events-none');
            
            backToStep1();
            
            document.getElementById('modalOverlay').style.display = 'flex';
            document.getElementById('advancedTestModal').classList.remove('hidden');
        }

        function toggleTestPaidFields() {
            const status = document.getElementById('advTStatus').value;
            const details = document.getElementById('advTPaidDetails');
            if(status === 'Paid') {
                details.classList.remove('hidden');
            } else {
                details.classList.add('hidden');
            }
        }
        window.toggleTestPaidFields = toggleTestPaidFields;


        function backToStep1() {
            document.getElementById('testStep1').classList.remove('hidden');
            document.getElementById('testStepManual').classList.add('hidden');
            document.getElementById('testStepJSON').classList.add('hidden');
            document.getElementById('testStepText').classList.add('hidden');
        }

        function setTestMethod(method) {
            currentMethod = method;
            document.getElementById('testStep1').classList.add('hidden');
            if(method === 'manual') {
                if(questionsArr.length === 0) addManualQuestion();
                document.getElementById('testStepManual').classList.remove('hidden');
            } else if(method === 'json') {
                document.getElementById('testStepJSON').classList.remove('hidden');
            } else if(method === 'text') {
                document.getElementById('testStepText').classList.remove('hidden');
            }
        }

        function addManualQuestion() {
            const list = document.getElementById('manualQuestionsList');
            const qDiv = document.createElement('div');
            qDiv.className = 'p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm relative';
            const index = list.children.length;
            qDiv.innerHTML = `
                <div class="flex justify-between items-center mb-3">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question ${index + 1}</span>
                    <button onclick="this.parentElement.parentElement.remove()" class="text-rose-400 hover:text-rose-600"><i class="fa-solid fa-trash-can"></i></button>
                </div>
                <input type="text" placeholder="Question Text" class="bg-white border border-slate-200 text-slate-900 q-text mb-3 text-xs w-full p-3 rounded-lg border ">
                <div class="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Option A" class="bg-white border border-slate-200 text-slate-900 q-a text-[11px] p-2 rounded-lg border ">
                    <input type="text" placeholder="Option B" class="bg-white border border-slate-200 text-slate-900 q-b text-[11px] p-2 rounded-lg border ">
                    <input type="text" placeholder="Option C" class="bg-white border border-slate-200 text-slate-900 q-c text-[11px] p-2 rounded-lg border ">
                    <input type="text" placeholder="Option D" class="bg-white border border-slate-200 text-slate-900 q-d text-[11px] p-2 rounded-lg border ">
                </div>
                <div class="mt-3">
                    <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Correct Answer</label>
                    <select class="bg-white border border-slate-200 text-slate-900 q-ans text-xs py-2 w-full p-2 rounded-lg border ">
                        <option value="a">Option A</option>
                        <option value="b">Option B</option>
                        <option value="c">Option C</option>
                        <option value="d">Option D</option>
                    </select>
                </div>
            `;
            list.appendChild(qDiv);
        }

        function handleJSONFile(input) {
            const file = input.files[0];
            if(!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target.result);
                    if(!Array.isArray(json)) throw new Error("Format must be an array of questions");
                    questionsArr = json;
                    document.getElementById('jsonPreview').innerText = JSON.stringify(json.slice(0, 2), null, 2) + "\n...";
                    document.getElementById('jsonPreview').classList.remove('hidden');
                    document.getElementById('btnSaveJSON').classList.remove('opacity-50', 'pointer-events-none');
                    showToast("JSON Parsed Successfully: " + json.length + " questions");
                } catch(err) {
                    alert("Error parsing JSON: " + err.message);
                }
            };
            reader.readAsText(file);
        }

        function parseAndFinishText() {
            const text = document.getElementById('textParserInput').value;
            if(!text) return alert("Pasted text required");

            const questions = [];
            const blocks = text.split(/Q\d+\./g).filter(b => b.trim());
            
            blocks.forEach(block => {
                const lines = block.split('\n').filter(l => l.trim());
                if(lines.length < 6) return;

                const q = lines[0].trim();
                let a='', b='', c='', d='', ans='';

                lines.forEach(line => {
                    const l = line.trim();
                    if(l.toUpperCase().startsWith('A.')) a = l.substring(2).trim();
                    if(l.toUpperCase().startsWith('B.')) b = l.substring(2).trim();
                    if(l.toUpperCase().startsWith('C.')) c = l.substring(2).trim();
                    if(l.toUpperCase().startsWith('D.')) d = l.substring(2).trim();
                    if(l.toUpperCase().replace(/\s/g, '').startsWith('ANSWER:')) ans = l.split(':')[1].trim().toLowerCase();
                });

                if(q && a && b && c && d && ans) {
                    questions.push({ q, a, b, c, d, ans });
                }
            });

            if(questions.length === 0) return alert("Could not parse any questions. Check format.");
            questionsArr = questions;
            finishTestCreation();
        }

        function finishTestCreation() {
            const title = document.getElementById('advTTitle').value.trim();
            const timer = document.getElementById('advTTimer').value || 20;
            const category = document.getElementById('advTCat').value;
            const status = document.getElementById('advTStatus').value;

            if(!title) return alert("Test title required");

            if(currentMethod === 'manual') {
                questionsArr = [];
                const list = document.getElementById('manualQuestionsList');
                for(let row of list.children) {
                    const qInput = row.querySelector('.q-text');
                    const aInput = row.querySelector('.q-a');
                    const bInput = row.querySelector('.q-b');
                    const cInput = row.querySelector('.q-c');
                    const dInput = row.querySelector('.q-d');
                    const ansInput = row.querySelector('.q-ans');
                    if(qInput.value && aInput.value && bInput.value && cInput.value && dInput.value) {
                         questionsArr.push({ 
                            q: qInput.value, 
                            a: aInput.value, 
                            b: bInput.value, 
                            c: cInput.value, 
                            d: dInput.value, 
                            ans: ansInput.value 
                        });
                    }
                }
            }

            if(questionsArr.length === 0) return alert("At least one question required");

            const testData = {
                title,
                category,
                status,
                enabled: true, // NEW
                timer: parseInt(timer),
                questions: questionsArr,
                createdAt: Date.now()
            };

            if(status === 'Paid') {
                testData.price = parseFloat(document.getElementById('advTPrice').value) || 0;
                testData.discount = parseFloat(document.getElementById('advTDiscount').value) || 0;
                testData.paymentLink = document.getElementById('advTPayLink').value;
                testData.description = document.getElementById('advTDesc').value;
            }

            fb.push(fb.ref(db, 'tests'), testData).then(() => {
                showToast("Test Created Successfully!");
                closeModal();
            });
        }


        let questionsArr = [];
        let currentMethod = 'manual';
        let editingTestId = null;
        function showTestModal() {
            editingTestId = null;
            const select = document.getElementById('tCourse');
            if(select) {
                select.innerHTML = '<option value="">General (No Course)</option>';
                coursesList.forEach(c => {
                    select.innerHTML += `<option value="${c.id}">${c.title}</option>`;
                });
            }
            document.getElementById('tTitle').value = '';
            document.getElementById('tDesc').value = '';
            document.getElementById('tCat').value = '';
            document.getElementById('tTime').value = '15';
            document.getElementById('tType').value = 'Objective';
            
            document.querySelector('#testModal h2').innerText = 'Create Test';
            document.querySelector('#testModal button[onclick="saveTest()"]').innerText = 'Create Test';

            document.getElementById('modalOverlay').style.display = 'flex';
            document.getElementById('testModal').classList.remove('hidden');
        }

        function editTest(id) {
            fb.get(fb.ref(db, 'tests/' + id)).then(snap => {
                if(snap.exists()){
                    const t = snap.val();
                    editingTestId = id;
                    
                    const select = document.getElementById('tCourse');
                    select.innerHTML = '<option value="">General (No Course)</option>';
                    coursesList.forEach(c => {
                        select.innerHTML += `<option value="${c.id}">${c.title}</option>`;
                    });

                    document.getElementById('tTitle').value = t.title || '';
                    document.getElementById('tDesc').value = t.description || '';
                    document.getElementById('tCat').value = t.category || '';
                    document.getElementById('tCourse').value = t.courseId || '';
                    document.getElementById('tType').value = t.type || 'Objective';
                    document.getElementById('tTime').value = t.timePerQuestion || '15';
                    
                    document.querySelector('#testModal h2').innerText = 'Edit Test Series';
                    document.querySelector('#testModal button[onclick="saveTest()"]').innerText = 'Update Test Series';
                    
                    document.getElementById('modalOverlay').style.display = 'flex';
                    document.getElementById('testModal').classList.remove('hidden');
                }
            });
        }

        let activeTestId = null;
        function showQuestionModal(testId) {
            activeTestId = testId;
            document.getElementById('modalOverlay').style.display = 'flex';
            document.getElementById('questionModal').classList.remove('hidden');
        }

        function saveTest() {
            const title = document.getElementById('tTitle').value;
            const desc = document.getElementById('tDesc').value;
            const cat = document.getElementById('tCat').value;
            const courseId = document.getElementById('tCourse').value;
            const courseName = document.getElementById('tCourse').options[document.getElementById('tCourse').selectedIndex].text;
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
                type, 
                timePerQuestion: time,
                updatedAt: Date.now()
            };

            if(editingTestId) {
                fb.update(fb.ref(db, 'tests/' + editingTestId), data).then(() => {
                    closeModal();
                    alert("Test Updated!");
                });
            } else {
                data.createdAt = Date.now();
                data.enabled = true; // NEW
                fb.push(fb.ref(db, 'tests'), data).then(() => { 
                    closeModal(); 
                    document.getElementById('tTitle').value = '';
                    document.getElementById('tDesc').value = '';
                });
            }
        }

        function saveQuestion() {
            const text = document.getElementById('qText').value;
            const optA = document.getElementById('optA').value;
            const optB = document.getElementById('optB').value;
            const optC = document.getElementById('optC').value;
            const optD = document.getElementById('optD').value;
            const correct = document.getElementById('correctOpt').value;

            if(!text) return alert("Question text required");

            const qData = {
                text,
                options: { A: optA, B: optB, C: optC, D: optD },
                correct,
                createdAt: Date.now()
            };

            fb.push(fb.ref(db, `questions/${activeTestId}`), qData).then(() => {
                alert("Question Added Successfully!");
                document.getElementById('qText').value = '';
            }).catch(e => alert(e.message));
        }

        function showCourseModal() {
            editingCourseId = null;
            document.getElementById('cTitle').value = '';
            document.getElementById('cDesc').value = '';
            document.getElementById('cCat').value = '';
            document.getElementById('cTag').value = '';
            document.getElementById('cDifficulty').value = 'Beginner';
            document.getElementById('cType').value = 'Paid';
            document.getElementById('cPrice').value = '';
            document.getElementById('cDiscount').value = '';
            document.getElementById('cPayLink').value = '';
            document.getElementById('cyoutubeIntro').value = '';
            document.getElementById('cyoutubePlayMode').value = 'In-App';
            document.getElementById('cThumb').value = '';
            document.getElementById('cInstructions').value = '';
            document.getElementById('clinkedNoteId').value = '';
            document.getElementById('clinkedTestId').value = '';
            
            document.getElementById('adminYoutubePreview').classList.add('hidden');
            document.getElementById('adminYoutubeIframe').src = '';
            
            document.querySelector('#courseModal h2').innerText = 'Advanced Course Details';
            document.querySelector('#courseModal button[onclick="saveCourse()"]').innerText = 'Save Course';

            // Populate linked attachments
            const noteSelect = document.getElementById('clinkedNoteId');
            const testSelect = document.getElementById('clinkedTestId');
            
            fb.get(fb.ref(db, 'notes')).then(snap => {
                noteSelect.innerHTML = '<option value="">No Note Linked</option>';
                snap.forEach(child => {
                    noteSelect.innerHTML += `<option value="${child.key}">${child.val().title}</option>`;
                });
            });

            fb.get(fb.ref(db, 'tests')).then(snap => {
                testSelect.innerHTML = '<option value="">No Test Linked</option>';
                snap.forEach(child => {
                    testSelect.innerHTML += `<option value="${child.key}">${child.val().title}</option>`;
                });
            });

            document.getElementById('modalOverlay').style.display = 'flex';
            document.getElementById('courseModal').classList.remove('hidden');
        }
        function editCourse(id) {
            fb.get(fb.ref(db, 'courses/' + id)).then(snap => {
                if(snap.exists()){
                    const c = snap.val();
                    editingCourseId = id;
                    document.getElementById('cTitle').value = c.title || '';
                    document.getElementById('cDesc').value = c.description || '';
                    document.getElementById('cCat').value = c.category || '';
                    document.getElementById('cTag').value = c.tag || '';
                    document.getElementById('cDifficulty').value = c.difficulty || 'Beginner';
                    document.getElementById('cType').value = c.type || 'Paid';
                    document.getElementById('cInstructor').value = c.instructor || '';
                    document.getElementById('cRating').value = c.rating || '';
                    document.getElementById('cPrice').value = c.price || '';
                    document.getElementById('cDiscount').value = c.discount || '';
                    document.getElementById('cPayLink').value = c.paymentLink || '';
                    document.getElementById('cyoutubeIntro').value = c.youtubeIntro || '';
                    document.getElementById('cyoutubePlayMode').value = c.youtubePlayMode || 'In-App';
                    document.getElementById('cThumb').value = c.thumbnail || '';
                    document.getElementById('cInstructions').value = c.instructions || '';
                    
                    previewAdminYoutube(); // Initialize preview if editing

                    document.querySelector('#courseModal h2').innerText = 'Edit Course';
                    document.querySelector('#courseModal button[onclick="saveCourse()"]').innerText = 'Update Course';
                    
                    // Trigger price toggle if needed
                    togglePrice();

                    // Load attachments before showing modal to ensure selects are ready
                    fb.get(fb.ref(db, 'notes')).then(notesSnap => {
                        const noteSelect = document.getElementById('clinkedNoteId');
                        noteSelect.innerHTML = '<option value="">No Note Linked</option>';
                        notesSnap.forEach(child => {
                            noteSelect.innerHTML += `<option value="${child.key}">${child.val().title}</option>`;
                        });
                        noteSelect.value = c.linkedNoteId || '';
                    });

                    fb.get(fb.ref(db, 'tests')).then(testsSnap => {
                        const testSelect = document.getElementById('clinkedTestId');
                        testSelect.innerHTML = '<option value="">No Test Linked</option>';
                        testsSnap.forEach(child => {
                            testSelect.innerHTML += `<option value="${child.key}">${child.val().title}</option>`;
                        });
                        testSelect.value = c.linkedTestId || '';
                    });

                    document.getElementById('modalOverlay').style.display = 'flex';
                    document.getElementById('courseModal').classList.remove('hidden');
                }
            });
        }
        function showLiveModal() {
            editingLiveId = null;
            document.getElementById('lTitle').value = '';
            document.getElementById('lDesc').value = '';
            document.getElementById('lCourse').value = '';
            document.getElementById('lCat').value = '';
            document.getElementById('lType').value = 'Free';
            document.getElementById('lDirect').value = '';
            document.getElementById('lEmbed').value = '';
            document.getElementById('lThumb').value = '';
            document.getElementById('lTime').value = '';
            document.getElementById('lMode').value = 'In-App';
            document.querySelector('#liveModal h2').innerText = 'Schedule Live Class';
            document.querySelector('#liveModal button[onclick="saveLive()"]').innerText = 'Schedule Now';

            document.getElementById('modalOverlay').style.display = 'flex';
            document.getElementById('liveModal').classList.remove('hidden');
        }
        function editLive(id) {
            fb.get(fb.ref(db, 'live/' + id)).then(snap => {
                if(snap.exists()){
                    const l = snap.val();
                    editingLiveId = id;
                    document.getElementById('lTitle').value = l.title || '';
                    document.getElementById('lDesc').value = l.description || '';
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

                    document.getElementById('modalOverlay').style.display = 'flex';
                    document.getElementById('liveModal').classList.remove('hidden');
                }
            });
        }
        let editingNoteId = null;
        function showNoteModal() {
            editingNoteId = null;
            document.getElementById('nTitle').value = '';
            document.getElementById('nCourse').value = '';
            document.getElementById('nCat').value = '';
            document.getElementById('nUrl').value = '';
            document.querySelector('#noteModal h2').innerText = 'Add PDF Notes';
            document.querySelector('#noteModal button[onclick="saveNote()"]').innerText = 'Save Notes';
            document.getElementById('modalOverlay').style.display = 'flex';
            document.getElementById('noteModal').classList.remove('hidden');
        }

        function editNote(id) {
            fb.get(fb.ref(db, 'notes/' + id)).then(snap => {
                if(snap.exists()){
                    const n = snap.val();
                    editingNoteId = id;
                    document.getElementById('nTitle').value = n.title || '';
                    document.getElementById('nCourse').value = n.courseId || '';
                    document.getElementById('nCat').value = n.category || '';
                    document.getElementById('nUrl').value = n.pdfUrl || '';
                    document.querySelector('#noteModal h2').innerText = 'Edit PDF Notes';
                    document.querySelector('#noteModal button[onclick="saveNote()"]').innerText = 'Update Notes';
                    document.getElementById('modalOverlay').style.display = 'flex';
                    document.getElementById('noteModal').classList.remove('hidden');
                }
            });
        }
        let editingCategoryId = null;
        function showCategoryModal() {
            editingCategoryId = null;
            document.getElementById('catName').value = '';
            document.querySelector('#categoryModal h2').innerText = 'Add New Category';
            document.querySelector('#categoryModal button[onclick="saveCategory()"]').innerText = 'Save Category';
            document.getElementById('modalOverlay').style.display = 'flex';
            document.getElementById('categoryModal').classList.remove('hidden');
        }

        function editCategory(id) {
            fb.get(fb.ref(db, 'categories/' + id)).then(snap => {
                if(snap.exists()){
                    const cat = snap.val();
                    editingCategoryId = id;
                    document.getElementById('catName').value = cat.name || '';
                    document.querySelector('#categoryModal h2').innerText = 'Edit Category';
                    document.querySelector('#categoryModal button[onclick="saveCategory()"]').innerText = 'Update Category';
                    document.getElementById('modalOverlay').style.display = 'flex';
                    document.getElementById('categoryModal').classList.remove('hidden');
                }
            });
        }

        function saveCategory() {
            const name = document.getElementById('catName').value.trim();
            if(!name) return alert("Category name required");
            
            if(editingCategoryId) {
                fb.update(fb.ref(db, 'categories/' + editingCategoryId), { name }).then(() => {
                    alert("Category Updated!");
                    closeModal();
                });
            } else {
                fb.push(fb.ref(db, 'categories'), { name }).then(() => {
                    alert("Category Saved!");
                    closeModal();
                });
            }
        }
        function showUpcomingModal() {
            editingUpcomingId = null;
            document.getElementById('uTitle').value = '';
            document.getElementById('uDesc').value = '';
            document.getElementById('uCat').value = '';
            document.getElementById('uThumb').value = '';
            document.getElementById('uDate').value = '';
            document.querySelector('#upcomingModal h2').innerText = 'Add Upcoming Course';
            document.querySelector('#upcomingModal button[onclick="saveUpcoming()"]').innerText = 'Add Course';
            document.getElementById('modalOverlay').style.display = 'flex';
            document.getElementById('upcomingModal').classList.remove('hidden');
        }
        function editUpcoming(id) {
            fb.get(fb.ref(db, 'upcoming_courses/' + id)).then(snap => {
                if(snap.exists()){
                    const u = snap.val();
                    editingUpcomingId = id;
                    document.getElementById('uTitle').value = u.title || '';
                    document.getElementById('uDesc').value = u.description || '';
                    document.getElementById('uCat').value = u.category || '';
                    document.getElementById('uThumb').value = u.thumbnail || '';
                    document.getElementById('uDate').value = u.launchDate || '';
                    
                    document.querySelector('#upcomingModal h2').innerText = 'Edit Upcoming Course';
                    document.querySelector('#upcomingModal button[onclick="saveUpcoming()"]').innerText = 'Update Course';
                    
                    document.getElementById('modalOverlay').style.display = 'flex';
                    document.getElementById('upcomingModal').classList.remove('hidden');
                }
            });
        }
        function closeModal() {
            const overlay = document.getElementById('modalOverlay');
            if (overlay) overlay.style.display = 'none';
            
            const modals = [
                'courseModal', 'liveModal', 'noteModal', 'upcomingModal', 
                'advancedTestModal', 'testModal', 'categoryModal', 
                'questionModal', 'demoModal', 'sliderModal', 'submissionsModal', 'staffModal'
            ];
            
            modals.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('hidden');
            });
        }

        let editingCourseId = null;
        function saveCourse() {
            const title = document.getElementById('cTitle').value;
            const desc = document.getElementById('cDesc').value;
            const category = document.getElementById('cCat').value;
            const tag = document.getElementById('cTag').value;
            const diff = document.getElementById('cDifficulty').value;
            const type = document.getElementById('cType').value;
            const instructor = document.getElementById('cInstructor').value;
            const rating = document.getElementById('cRating').value;
            const price = document.getElementById('cPrice').value;
            const discount = document.getElementById('cDiscount').value;
            const payLink = document.getElementById('cPayLink').value;
            const youtubeIntro = document.getElementById('cyoutubeIntro').value;
            const youtubePlayMode = document.getElementById('cyoutubePlayMode').value;
            const linkedNoteId = document.getElementById('clinkedNoteId').value;
            const linkedTestId = document.getElementById('clinkedTestId').value;
            const thumb = document.getElementById('cThumb').value;
            const instruct = document.getElementById('cInstructions').value;

            if (!title || !category || !thumb) return alert("Fill required fields (Title, Category, Thumbnail)");

            const courseData = {
                title,
                description: desc,
                category,
                tag,
                difficulty: diff,
                type,
                instructor: instructor || 'Eos Faculty',
                rating: rating ? Number(rating) : 4.8,
                price: type === 'Free' ? 0 : Number(price),
                discount: discount ? Number(discount) : 0,
                paymentLink: payLink,
                youtubeIntro,
                youtubePlayMode,
                linkedNoteId,
                linkedTestId,
                thumbnail: thumb,
                instructions: instruct,
                updatedAt: Date.now()
            };

            if(editingCourseId) {
                fb.update(fb.ref(db, 'courses/' + editingCourseId), courseData).then(() => {
                    closeModal();
                    alert("Course Updated!");
                }).catch(e => alert(e.message));
            } else {
                courseData.createdAt = Date.now();
                fb.push(fb.ref(db, 'courses'), courseData).then(() => {
                    closeModal();
                    alert("Course Saved!");
                }).catch(e => alert(e.message));
            }
        }

        let editingUpcomingId = null;
        function saveUpcoming() {
            const title = document.getElementById('uTitle').value;
            const desc = document.getElementById('uDesc').value;
            const thumb = document.getElementById('uThumb').value;
            const cat = document.getElementById('uCat').value;
            const date = document.getElementById('uDate').value;
            
            if(!title || !thumb) return alert("Title and Thumbnail are required");
            
            const data = {
                title, 
                description: desc, 
                thumbnail: thumb, 
                category: cat,
                launchDate: date,
                updatedAt: Date.now()
            };

            if(editingUpcomingId) {
                fb.update(fb.ref(db, 'upcoming_courses/' + editingUpcomingId), data).then(() => {
                    closeModal();
                    alert("Upcoming Course Updated!");
                });
            } else {
                data.createdAt = Date.now();
                fb.push(fb.ref(db, 'upcoming_courses'), data).then(() => {
                    closeModal();
                    alert("Upcoming Course Added!");
                });
            }
        }

        let editingLiveId = null;
        function saveLive() {
            const title = document.getElementById('lTitle').value;
            const desc = document.getElementById('lDesc').value;
            const thumb = document.getElementById('lThumb').value;
            const startTime = document.getElementById('lTime').value;
            const courseSel = document.getElementById('lCourse');
            const cat = document.getElementById('lCat').value;
            if(!title) return alert("Title is required");

            const data = {
                title: title,
                description: desc,
                thumbnail: thumb,
                courseId: courseSel.value,
                category: cat,
                courseName: courseSel.options[courseSel.selectedIndex].text,
                type: document.getElementById('lType').value,
                youtubeUrl: document.getElementById('lDirect').value,
                embedUrl: document.getElementById('lEmbed').value,
                mode: document.getElementById('lMode').value,
                startTime: startTime,
                updatedAt: Date.now()
            };

            if(editingLiveId) {
                fb.update(fb.ref(db, 'live/' + editingLiveId), data).then(() => { 
                    alert('Updated Successfully'); 
                    closeModal(); 
                });
            } else {
                data.createdAt = Date.now();
                fb.push(fb.ref(db, 'live'), data).then(() => { 
                    alert('Scheduled Successfully'); 
                    closeModal(); 
                });
            }
        }

        function saveNote() {
            const courseSel = document.getElementById('nCourse');
            const data = {
                title: document.getElementById('nTitle').value,
                courseId: courseSel.value,
                category: document.getElementById('nCat').value,
                courseName: courseSel.options[courseSel.selectedIndex].text,
                type: 'PDF',
                url: document.getElementById('nUrl').value,
                updatedAt: Date.now()
            };
            const ref = editingNoteId ? fb.ref(db, 'notes/' + editingNoteId) : fb.push(fb.ref(db, 'notes'));
            fb.set(ref, data).then(() => { 
                alert('Note Saved Successfully'); 
                closeModal(); 
            });
        }

        function toggleTestStatus(id, currentStatus) {
            fb.update(fb.ref(db, 'tests/' + id), {
                enabled: !currentStatus,
                updatedAt: Date.now()
            }).then(() => {
                showToast(currentStatus ? "Test Disabled" : "Test Enabled");
            });
        }

        function showStaffModal() {
            document.getElementById('staffModalTitle').innerText = 'Add Staff Admin';
            document.getElementById('staffUser').value = '';
            document.getElementById('staffUser').readOnly = false;
            document.getElementById('staffPass').value = '';
            document.getElementById('modalOverlay').style.display = 'flex';
            document.getElementById('staffModal').classList.remove('hidden');
        }

        function editStaffAdmin(user, pass) {
            document.getElementById('staffModalTitle').innerText = 'Update Staff Admin';
            document.getElementById('staffUser').value = user;
            document.getElementById('staffUser').readOnly = true;
            document.getElementById('staffPass').value = pass;
            document.getElementById('modalOverlay').style.display = 'flex';
            document.getElementById('staffModal').classList.remove('hidden');
        }

        function saveStaffAdmin() {
            let user = document.getElementById('staffUser').value.trim();
            const pass = document.getElementById('staffPass').value.trim();
            if(!user || !pass) return alert("All fields required");
            
            // Sanitize email to be used as a Firebase key
            user = user.replace(/\./g, ',');
            
            const data = {
                password: pass,
                enabled: true,
                updatedAt: Date.now()
            };
            
            fb.set(fb.ref(db, 'admins/' + user), data).then(() => {
                showToast("Staff Account Saved");
                closeModal();
            });
        }

        function deleteStaffAdmin(id) {
            if(id === 'admin') return alert("Master Admin cannot be deleted!");
            if(confirm(`Delete admin account "${id}"?`)) {
                fb.remove(fb.ref(db, 'admins/' + id)).then(() => showToast("Account Deleted"));
            }
        }

        function toggleStaffStatus(id, current) {
            if(id === 'admin') return alert("Master Admin cannot be disabled!");
            fb.update(fb.ref(db, 'admins/' + id), {
                enabled: !current
            }).then(() => showToast(current ? "Accound Disabled" : "Account Enabled"));
        }

        let editingSliderId = null;
        function showSliderModal() {
            editingSliderId = null;
            document.getElementById('sUrl').value = '';
            document.getElementById('sAction').value = 'none';
            toggleSliderTarget();
            document.querySelector('#sliderModal h2').innerText = 'Add Interactive Banner';
            document.getElementById('modalOverlay').style.display = 'flex';
            document.getElementById('sliderModal').classList.remove('hidden');
        }

        function toggleSliderTarget() {
            const action = document.getElementById('sAction').value;
            const container = document.getElementById('sTargetContainer');
            const select = document.getElementById('sTargetSelect');
            const input = document.getElementById('sTargetInput');

            if (action === 'none') {
                container.classList.add('hidden');
                return;
            }

            container.classList.remove('hidden');
            select.classList.add('hidden');
            input.classList.add('hidden');

            if (action === 'youtube') {
                input.classList.remove('hidden');
                input.placeholder = "Paste YouTube Video Link or ID";
            } else {
                select.classList.remove('hidden');
                select.innerHTML = '<option value="">Loading content...</option>';
                const path = action === 'course' ? 'courses' : (action === 'note' ? 'notes' : 'tests');
                fb.get(fb.ref(db, path)).then(snap => {
                    select.innerHTML = `<option value="">Select ${action.charAt(0).toUpperCase() + action.slice(1)}</option>`;
                    snap.forEach(c => {
                        select.innerHTML += `<option value="${c.key}">${c.val().title}</option>`;
                    });
                });
            }
        }
        window.toggleSliderTarget = toggleSliderTarget;

        function saveSlider() {
            const url = document.getElementById('sUrl').value;
            const action = document.getElementById('sAction').value;
            let target = '';

            if (action === 'youtube') {
                target = document.getElementById('sTargetInput').value;
            } else if (action !== 'none') {
                target = document.getElementById('sTargetSelect').value;
            }

            if (!url) return alert("Image URL is required");

            const data = { url, action, target, updatedAt: Date.now() };

            if(editingSliderId) {
                fb.update(fb.ref(db, 'sliders/' + editingSliderId), data).then(() => {
                    alert("Slider Updated!");
                    closeModal();
                });
            } else {
                fb.push(fb.ref(db, 'sliders'), data).then(() => {
                    alert("Slider Added!");
                    closeModal();
                });
            }
        }
        window.saveSlider = saveSlider;

        function editSlider(id) {
            fb.get(fb.ref(db, 'sliders/' + id)).then(snap => {
                if(snap.exists()){
                    const s = snap.val();
                    editingSliderId = id;
                    document.getElementById('sUrl').value = typeof s === 'string' ? s : s.url;
                    document.getElementById('sAction').value = s.action || 'none';
                    
                    toggleSliderTarget();
                    
                    // Small timeout to let content load before setting value
                    setTimeout(() => {
                        if(s.action === 'youtube') {
                            document.getElementById('sTargetInput').value = s.target || '';
                        } else if(s.action !== 'none') {
                            document.getElementById('sTargetSelect').value = s.target || '';
                        }
                    }, 500);

                    document.querySelector('#sliderModal h2').innerText = 'Edit Banner';
                    document.getElementById('modalOverlay').style.display = 'flex';
                    document.getElementById('sliderModal').classList.remove('hidden');
                }
            });
        }
        window.editSlider = editSlider;

        function addSlider() {
            showSliderModal();
        }

        function deleteSlider(id) {
            if(confirm('Delete this slider image?')) fb.remove(fb.ref(db, 'sliders/' + id));
        }

        let editingDemoId = null;
        function showDemoModal() {
            editingDemoId = null;
            document.getElementById('demoId').value = '';
            document.getElementById('dTitle').value = '';
            document.getElementById('dDesc').value = '';
            document.getElementById('dThumb').value = '';
            document.getElementById('dVideo').value = '';
            document.getElementById('dPlayMode').value = 'In-App';
            document.getElementById('demoModalTitle').innerText = 'Add Demo Class';
            document.getElementById('modalOverlay').style.display = 'flex';
            document.getElementById('demoModal').classList.remove('hidden');
        }

        function editDemo(id) {
            fb.get(fb.ref(db, 'demo/' + id)).then(snap => {
                if(snap.exists()) {
                    const d = snap.val();
                    editingDemoId = id;
                    document.getElementById('demoId').value = id;
                    document.getElementById('dTitle').value = d.title || '';
                    document.getElementById('dDesc').value = d.description || '';
                    document.getElementById('dThumb').value = d.thumbnail || '';
                    document.getElementById('dVideo').value = d.videoUrl || '';
                    document.getElementById('dPlayMode').value = d.playMode || 'In-App';
                    document.getElementById('demoModalTitle').innerText = 'Edit Demo Class';
                    document.getElementById('modalOverlay').style.display = 'flex';
                    document.getElementById('demoModal').classList.remove('hidden');
                }
            });
        }

        function saveDemo() {
            const title = document.getElementById('dTitle').value.trim();
            const desc = document.getElementById('dDesc').value.trim();
            const thumb = document.getElementById('dThumb').value.trim();
            const video = document.getElementById('dVideo').value.trim();
            const playMode = document.getElementById('dPlayMode').value;

            if(!title || !thumb || !video) return alert("Title, Thumbnail and Video URL are required!");

            const data = {
                title,
                description: desc,
                thumbnail: thumb,
                videoUrl: video,
                playMode,
                updatedAt: Date.now()
            };

            const ref = editingDemoId ? fb.ref(db, 'demo/' + editingDemoId) : fb.push(fb.ref(db, 'demo'));
            fb.set(ref, data).then(() => {
                alert("Demo Class Saved!");
                closeModal();
            });
        }

        function approvePayment(id, uid, courseId) {
            fb.update(fb.ref(db, 'payment_requests/' + id), {status: 'Approved'}).then(() => {
                fb.set(fb.ref(db, `users/${uid}/purchased/${courseId}`), true).then(() => {
                    alert('Student Enrollment Approved!');
                });
            });
        }

        function deleteItem(path, id) {
            if(confirm('Are you sure to delete?')) fb.remove(fb.ref(db, path + '/' + id));
        }

        function sendAlert() {
            const title = document.getElementById('notifTitle').value;
            const message = document.getElementById('notifMsg').value;
            const category = document.getElementById('notifCat').value;
            const webPushCheckbox = document.getElementById('notifWebPush');
            const webPush = webPushCheckbox ? webPushCheckbox.checked : true;
            if(!message) return;
            fb.push(fb.ref(db, 'notifications'), {
                title, 
                message, 
                category,
                webPush, 
                time: Date.now()
            }).then(() => {
                alert('Targeted alert broadcasted!');
                document.getElementById('notifTitle').value = '';
                document.getElementById('notifMsg').value = '';
            });
        }

        function clearAllTests() {
            if(confirm("Are you sure you want to PERMANENTLY delete ALL test series? This action cannot be undone.")) {
                fb.remove(fb.ref(db, 'tests')).then(() => {
                    alert("All tests cleared successfully.");
                });
            }
        }
        function savePaymentSettings() {
            fb.set(fb.ref(db, 'settings/payment'), {link: document.getElementById('setPayLink').value}).then(() => alert('Saved'));
        }
        function saveLogoSettings() {
            fb.set(fb.ref(db, 'settings/logo'), {url: document.getElementById('setLogoUrl').value}).then(() => alert('Logo Saved'));
        }
        window.saveLogoSettings = saveLogoSettings;
        function saveBannerSettings() {
            const val = document.getElementById('setBanner').value;
            fb.set(fb.ref(db, 'settings/notification'), val).then(() => {
                showToast('Live Alert Updated Successfully!');
            });
        }
        function saveSocialSettings() {
            const data = {
                telegram: document.getElementById('setTelegram').value,
                whatsapp: document.getElementById('setWhatsapp').value,
                whatsappChannel: document.getElementById('setWhatsappChannel').value,
                whatsappGroup: document.getElementById('setWhatsappGroup').value,
                youtube: document.getElementById('setYoutube').value,
                thirdApp: document.getElementById('setThirdApp').value,
                instagram: document.getElementById('setInstagram').value,
                website: document.getElementById('setWebsite').value,
                email: document.getElementById('setEmail').value,
            };
            fb.update(fb.ref(db, 'settings/social'), data).then(() => alert('Community Links Updated Globally!'));
        }

        function saveContactSettings() {
            const c1 = document.getElementById('setContact1').value;
            const c2 = document.getElementById('setContact2').value;
            const c3 = document.getElementById('setContact3').value;
            if(!c1) return alert("Primary contact is mandatory");
            
            const contacts = [c1];
            if(c2) contacts.push(c2);
            if(c3) contacts.push(c3);
            
            fb.set(fb.ref(db, 'settings/global'), {contacts}).then(() => alert('Contacts Saved'));
        }

        function togglePrice() {
            const type = document.getElementById('cType').value;
            const priceEl = document.getElementById('cPrice');
            const discountEl = document.getElementById('cDiscount');
            
            if(type === 'Free') {
                priceEl.value = 0;
                discountEl.value = 0;
                priceEl.parentElement.classList.add('hidden');
            } else {
                priceEl.parentElement.classList.remove('hidden');
            }
        }

        function previewAdminYoutube() {
            const val = document.getElementById('cyoutubeIntro').value;
            const preview = document.getElementById('adminYoutubePreview');
            const iframe = document.getElementById('adminYoutubeIframe');
            
            if(!val) {
                preview.classList.add('hidden');
                iframe.src = '';
                return;
            }

            const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
            const match = val.match(regExp);
            const vidId = (match && match[1].length === 11) ? match[1] : val;

            if(vidId.length === 11) {
                preview.classList.remove('hidden');
                iframe.src = `https://www.youtube.com/embed/${vidId}?autoplay=0&mute=1`;
            } else {
                preview.classList.add('hidden');
                iframe.src = '';
            }
        }

        // --- Initialization & Persistent Login ---
        
        // Ensure default admin exists
        fb.get(fb.ref(db, 'admins')).then(snap => {
            if (!snap.exists()) {
                fb.set(fb.ref(db, 'admins/admin'), 'admin123');
            }
        });

        // Check persistent login
        if (sessionStorage.getItem('isAdmin') === 'true') {
            document.getElementById('loginOverlay').style.display = 'none';
            const adminSide = document.getElementById('adminSide');
            const adminMain = document.getElementById('adminMain');
            if (adminSide) adminSide.classList.remove('hidden');
            if (adminMain) adminMain.classList.remove('hidden');
            setTimeout(loadAdminData, 500);
        }
