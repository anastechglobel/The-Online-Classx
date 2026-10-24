        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
        import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
        import { getDatabase, ref, onValue, get, set, push, update, child, query, orderByChild, equalTo, limitToLast } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

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
        const auth = getAuth(app);
        const db = getDatabase(app);
        window.auth = auth;
        window.db = db;
        
        // Firebase Modular helpers in local scope
        const fb = { ref, onValue, get, set, push, update, child, query, orderByChild, equalTo, limitToLast, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, createUserWithEmailAndPassword, signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber };
        window.fb = fb; // Also expose globally for any edge cases

        let currentUser = null;
        let userData = null;
        let confirmationResult = null;
        let currentCourseId = null;
        let allCoursesCached = [];
        let allTestsCached = [];
        let allLiveCached = [];
        let allNotesCached = [];
        let allUpcomingCached = [];
        let allCategoriesCached = []; 
        let pendingPurchases = new Set();
        
        let activeCategory = localStorage.getItem('user_category') || "";

        function showCategorySelector() {
            const list = document.getElementById('categoryOptionList');
            if(!list) return;
            list.innerHTML = '';
            
            // Add "All Classes" option
            list.innerHTML += `
                <div onclick="selectCategory('')" class="p-5 rounded-[24px] border ${activeCategory === '' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-slate-50 border-slate-100 text-slate-700'} active:scale-95 transition-all cursor-pointer">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-xl ${activeCategory === '' ? 'bg-white/20' : 'bg-white'} flex items-center justify-center text-lg shadow-sm">
                            <i class="fa-solid fa-layer-group"></i>
                        </div>
                        <div>
                            <p class="text-[10px] font-black uppercase tracking-widest ${activeCategory === '' ? 'text-white/60' : 'text-slate-400'}">View</p>
                            <h3 class="font-black tracking-tight">All Classes</h3>
                        </div>
                    </div>
                </div>
            `;

            allCategoriesCached.forEach(cat => {
                const isSelected = activeCategory === cat.name;
                list.innerHTML += `
                    <div onclick="selectCategory('${cat.name}')" class="p-5 rounded-[24px] border ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-slate-50 border-slate-100 text-slate-700'} active:scale-95 transition-all cursor-pointer">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-xl ${isSelected ? 'bg-white/20' : 'bg-white'} flex items-center justify-center text-lg shadow-sm">
                                <i class="fa-solid fa-graduation-cap"></i>
                            </div>
                            <div>
                                <p class="text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white/60' : 'text-slate-400'}">Target</p>
                                <h3 class="font-black tracking-tight font-sans">${cat.name}</h3>
                            </div>
                        </div>
                    </div>
                `;
            });

            document.getElementById('categorySelectorModal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function hideCategorySelector() {
            document.getElementById('categorySelectorModal').classList.add('hidden');
            document.body.style.overflow = '';
        }

        function selectCategory(catName) {
            activeCategory = catName;
            localStorage.setItem('user_category', catName);
            const triggerText = document.getElementById('activeClassName');
            if(triggerText) triggerText.innerText = catName || "All Classes";
            hideCategorySelector();
            
            // Re-render everything with new filter
            refreshUI();
            
            showToast(catName ? `Switched to ${catName}` : "Showing All Classes");
        }

        function renderCategoryFilters() {
            const container = document.getElementById('courseCategories');
            if(!container) return;
            
            container.innerHTML = `
                <button onclick="selectCategory('')" class="${activeCategory === '' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-500 border border-slate-100'} px-5 py-2.5 rounded-full whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm">ALL COURSES</button>
            `;
            
            allCategoriesCached.forEach(cat => {
                const isSelected = activeCategory === cat.name;
                container.innerHTML += `
                    <button onclick="selectCategory('${cat.name}')" class="${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-500 border border-slate-100'} px-5 py-2.5 rounded-full whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm">${cat.name}</button>
                `;
            });
        }

        function refreshUI() {
            renderHomeCourses();
            renderAllCourses();
            renderUpcoming();
            renderTests();
            renderLive();
            renderNotes();
            renderCategoryFilters(); // Sync filters on courses page
            
            // Sync Sidebar
            const sideCat = document.getElementById('sidebarCategory');
            if(sideCat) sideCat.innerText = activeCategory || "General";
        }

        window.showCategorySelector = showCategorySelector;
        window.hideCategorySelector = hideCategorySelector;
        window.selectCategory = selectCategory;

        // Initialize header if exists
        setTimeout(() => {
            const triggerText = document.getElementById('activeClassName');
            if(triggerText) triggerText.innerText = activeCategory || "All Classes";
        }, 100);

        // Expose to window for onclick handlers (used in HTML)
        window.logout = logout;
        window.navigateTo = navigateTo;
        window.toggleSidebar = toggleSidebar;
        window.saveProfile = saveProfile;
        window.openCourse = openCourse;
        window.openLive = openLive;
        window.viewPdf = viewPdf;
        window.closePdf = closePdf;
        window.closePayment = closePayment;
        window.submitPayment = submitPayment;
        window.openSupport = openSupport;
        window.forceOnline = forceOnline;
        
        window.handleCourseFilter = handleCourseFilter;

        window.closeCourseDetail = closeCourseDetail;
        window.playIntro = playIntro;


        function renderAllCourses(filtered) {
            const fullCourses = document.getElementById('fullCoursesList');
            if(!fullCourses) return;
            fullCourses.innerHTML = '';
            
            let data = filtered || allCoursesCached;
            
            // Apply category filter if not searching
            if(!filtered && activeCategory) {
                data = allCoursesCached.filter(c => c.category === activeCategory);
            }

            if(data.length === 0) {
                fullCourses.innerHTML = '<div class="text-center py-20 text-slate-400 font-bold">No courses available for this category.</div>';
                return;
            }

            data.forEach(c => {
                fullCourses.innerHTML += generateCourseCard(c);
            });
        }

        function renderMyCourses() {
            const myCoursesList = document.getElementById('myCoursesList');
            const noMyCoursesMsg = document.getElementById('noMyCoursesMsg');
            if(!myCoursesList) return;
            
            myCoursesList.innerHTML = '';
            
            const purchased = allCoursesCached.filter(c => {
                return (userData && userData.purchased && userData.purchased[c.id]) || c.type === 'Free';
            });

            const pending = allCoursesCached.filter(c => {
                return pendingPurchases.has(c.id) && !(userData && userData.purchased && userData.purchased[c.id]);
            });
            
            if(purchased.length === 0 && pending.length === 0) {
                if(noMyCoursesMsg) noMyCoursesMsg.classList.remove('hidden');
                return;
            } else {
                if(noMyCoursesMsg) noMyCoursesMsg.classList.add('hidden');
            }
            
            // Active Courses
            purchased.forEach(c => {
                const card = `
                    <div onclick="openCourse('${c.id}', '${c.type}')" class="bg-white rounded-[32px] overflow-hidden shadow-2xl shadow-slate-100 border border-slate-100 group hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] transition-all duration-300">
                        <div class="relative aspect-[16/9]">
                            <img src="${c.thumbnail}" class="w-full h-full object-cover transition-transform group-hover:scale-105 duration-1000">
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                            <div class="absolute bottom-4 left-6 flex items-center gap-2">
                                <span class="bg-emerald-500 w-2 h-2 rounded-full animate-pulse"></span>
                                <span class="text-[9px] font-black text-white uppercase tracking-widest">Active Enrollment</span>
                            </div>
                        </div>
                        <div class="p-6">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-[8px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg">${c.category}</span>
                            </div>
                            <h3 class="text-lg font-black text-slate-800 leading-tight mb-4">${c.title}</h3>
                            <button class="w-full bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] group-hover:bg-indigo-600 transition-colors">
                                Resume Learning <i class="fa-solid fa-play ml-2"></i>
                            </button>
                        </div>
                    </div>
                `;
                myCoursesList.innerHTML += card;
            });

            // Pending Courses
            pending.forEach(c => {
                const card = `
                    <div onclick="openCourse('${c.id}', '${c.type}')" class="bg-slate-50 rounded-[32px] overflow-hidden border border-dashed border-slate-200 opacity-80 group hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] transition-all duration-300">
                        <div class="relative aspect-[16/9] grayscale opacity-60">
                            <img src="${c.thumbnail}" class="w-full h-full object-cover">
                            <div class="absolute inset-0 bg-slate-900/20"></div>
                        </div>
                        <div class="p-6">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-[8px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-lg">Wait for Approval</span>
                            </div>
                            <h3 class="text-lg font-black text-slate-500 leading-tight mb-4">${c.title}</h3>
                            <div class="bg-amber-100/50 p-4 rounded-2xl border border-amber-100 flex items-center gap-3">
                                <i class="fa-solid fa-clock-rotate-left text-amber-500 animate-spin-slow"></i>
                                <span class="text-[9px] font-black text-amber-700 uppercase tracking-widest">Admin will approve soon</span>
                            </div>
                        </div>
                    </div>
                `;
                myCoursesList.innerHTML += card;
            });
        }
        window.renderMyCourses = renderMyCourses;

        function handleCourseFilter() {
            const query = document.getElementById('courseSearch').value.toLowerCase();
            const sort = document.getElementById('courseSort').value;
            
            let filtered = allCoursesCached.filter(c => 
                c.title.toLowerCase().includes(query) || 
                (c.description && c.description.toLowerCase().includes(query)) ||
                c.category.toLowerCase().includes(query)
            );

            // Sorting
            if(sort === 'latest') {
                filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            } else if(sort === 'popular') {
                filtered.sort((a, b) => (b.tag ? 1 : 0) - (a.tag ? 1 : 0));
            } else if(sort === 'priceLow') {
                filtered.sort((a, b) => {
                    const pa = a.discount > 0 ? Math.round(a.price * (1 - a.discount/100)) : a.price;
                    const pb = b.discount > 0 ? Math.round(b.price * (1 - b.discount/100)) : b.price;
                    return pa - pb;
                });
            } else if(sort === 'priceHigh') {
                filtered.sort((a, b) => {
                    const pa = a.discount > 0 ? Math.round(a.price * (1 - a.discount/100)) : a.price;
                    const pb = b.discount > 0 ? Math.round(b.price * (1 - b.discount/100)) : b.price;
                    return pb - pa;
                });
            }

            renderAllCourses(filtered);
        }

                function generateCourseCard(c) {
            const id = c.id;
            const hasAccess = (userData && userData.purchased && userData.purchased[id]) || c.type === 'Free';
            const isPending = pendingPurchases.has(id);
            const priceVal = c.discount > 0 ? Math.round(c.price * (1 - c.discount/100)) : c.price;
            return `
                <div onclick="openCourse('${id}', '${c.type}')" class="course-card group flex flex-col md:flex-row gap-5 p-5 cursor-pointer bg-white dark:bg-slate-900 rounded-2xl hover:shadow-xl hover:shadow-blue-500/10 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 transition-all duration-300">
                    <div class="relative w-full md:w-44 h-44 md:h-auto shrink-0 overflow-hidden rounded-xl shadow-sm">
                        <img src="${c.thumbnail}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="${c.title}">
                        <div class="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors"></div>
                        ${c.tag ? `<span class="absolute top-3 left-3 ${c.tag === 'NEW' ? 'bg-emerald-600' : 'bg-blue-600'} text-[9px] font-bold px-2.5 py-1 rounded-md text-white shadow-sm uppercase tracking-wider z-10">${c.tag}</span>` : ''}
                        <div class="absolute bottom-3 right-3 bg-white/95 dark:bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-slate-100 dark:border-slate-800">
                            <i class="fa-solid fa-star text-xs text-amber-400"></i>
                            <span class="text-xs font-bold text-slate-800 dark:text-slate-200">${c.rating || '4.8'}</span>
                        </div>
                    </div>
                    <div class="flex-1 flex flex-col justify-between py-1">
                        <div>
                            <div class="flex justify-between items-start mb-2 gap-2">
                                <div class="flex gap-2 items-center flex-wrap">
                                    <span class="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-semibold px-2.5 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/50">${c.category}</span>
                                    <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">${c.difficulty || 'Beginner'}</span>
                                </div>
                                <div class="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                                    <i class="fa-solid fa-user-tie text-xs"></i>
                                    <span class="text-xs font-medium text-slate-600 dark:text-slate-400 truncate max-w-[120px]">${c.instructor || 'Faculty'}</span>
                                </div>
                            </div>
                            <h3 class="font-bold text-base md:text-lg leading-snug mb-1.5 line-clamp-2 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${c.title}</h3>
                            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal mb-3">${c.description || 'Structured coaching course with comprehensive modules.'}</p>
                            
                            <div class="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                                <span class="flex items-center gap-1.5"><i class="fa-solid fa-play-circle text-blue-500"></i> Video Modules</span>
                                <span class="flex items-center gap-1.5"><i class="fa-solid fa-file-pdf text-rose-500"></i> PDF Notes</span>
                                <span class="flex items-center gap-1.5"><i class="fa-solid fa-circle-check text-emerald-500"></i> Full Access</span>
                            </div>
                        </div>
                        <div class="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <div class="flex flex-col">
                                ${c.discount > 0 ? `
                                    <span class="text-slate-400 line-through text-xs font-normal">₹${c.price}</span>
                                    <div class="flex items-center gap-2">
                                        <span class="text-blue-600 dark:text-blue-400 font-bold text-xl leading-none">₹${priceVal}</span>
                                        <span class="bg-rose-50 text-rose-600 border border-rose-200/60 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-2xs">-${c.discount}%</span>
                                    </div>
                                ` : `
                                    <span class="text-blue-600 dark:text-blue-400 font-bold text-xl leading-none">${c.price > 0 ? '₹' + c.price : 'FREE'}</span>
                                `}
                            </div>
                            <div class="flex items-center gap-2">
                                ${hasAccess ? 
                                    '<span class="text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40"><i class="fa-solid fa-circle-check text-emerald-500"></i> Enrolled</span>' :
                                    (isPending ?
                                        '<span class="text-amber-600 dark:text-amber-400 font-semibold text-xs flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-4 py-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40"><i class="fa-solid fa-clock text-amber-500"></i> Pending</span>' :
                                        '<button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-sm hover:shadow-blue-500/20 transition-all active:scale-[0.98]"><i class="fa-solid fa-bolt text-xs"></i> Enroll Now</button>'
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Handle logout query param cleanly on load
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('logout')) {
            localStorage.clear();
            sessionStorage.clear();
            const currentAuth = typeof auth !== 'undefined' ? auth : (window.auth || (window.fb && window.fb.getAuth && window.fb.getAuth()));
            if (currentAuth && window.fb && window.fb.signOut) {
                fb.signOut(currentAuth).catch(() => {});
            }
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        

        // Load public app data & notification listener immediately on load
        try {
            loadAppData();
            if (typeof initNotificationListener === 'function') {
                initNotificationListener();
            }
        } catch(e) { console.warn("Initial loadAppData error:", e); }

        // On Auth State Changed
        fb.onAuthStateChanged(auth, user => {
            if (user) {
                currentUser = user;
                checkUserProfile();
            } else {
                showAuth();
            }
        });

        // Fail-safe for splash screen - always hide after 8 seconds max
        setTimeout(() => {
            const splash = document.getElementById('splash');
            if (splash && splash.style.display !== 'none') {
                console.warn("Forcing splash hide after timeout");
                splash.style.display = 'none';
                // Show main content if we have a user, else show auth
                if (currentUser) {
                    document.getElementById('mainContent').classList.remove('hidden');
                    document.getElementById('bottomNav').classList.remove('hidden');
                    loadAppData();
                } else {
                    showAuth();
                }
            }
        }, 8000);

        // Switch Auth Mode Logic Removed as it's no longer needed for OTP

        // Dark Mode Logic
        function toggleDarkMode() {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateThemeUI(isDark);
            showToast(isDark ? "Dark Mode Enabled" : "Light Mode Enabled");
        }
        window.toggleDarkMode = toggleDarkMode;

        function updateThemeUI(isDark) {
            const icon = document.getElementById('themeIcon');
            const label = document.getElementById('themeLabel');
            if(icon) icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
            if(label) label.innerText = isDark ? 'Light Mode' : 'Dark Mode';
            
            // Adjust sidebar colors if necessary
            const sidebar = document.getElementById('sidebar');
            if(sidebar) {
                 if(isDark) sidebar.classList.add('dark');
                 else sidebar.classList.remove('dark');
            }
        }

        function initTheme() {
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if(savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                document.documentElement.classList.add('dark');
                updateThemeUI(true);
            } else {
                updateThemeUI(false);
            }
        }
        initTheme();

        // 1. Browser/WebView Check (Optional Info)
        const isWebView = /FBAN|FBAV|Instagram|LinkedInApp|Twitter|MicroMessenger|WhatsApp|Messenger|Applet|WebView|GSA/i.test(navigator.userAgent);
        const isFrame = window.self !== window.top;

        async function saveProfile() {
            const name = document.getElementById('setupName').value.trim();
            const gender = document.getElementById('setupGender').value;
            const age = document.getElementById('setupAge').value;
            const email = document.getElementById('setupEmail').value.trim();
            const phone = document.getElementById('setupPhone').value.trim();

            if (!name || !gender || !age || !phone) {
                alert("Please fill all mandatory fields (Name, Gender, Age, Phone)");
                return;
            }
            
            if (phone.length < 10) {
                alert("Please enter a valid 10-digit phone number");
                return;
            }

            const profile = userData ? { ...userData } : {
                uid: currentUser.uid,
                role: 'user', // Default role
                createdAt: Date.now(),
                purchased: {}
            };
            
            profile.name = name;
            profile.gender = gender;
            profile.age = age;
            profile.email = email;
            profile.phone = phone;
            profile.lastLogin = Date.now();

            try {
                if (currentUser && currentUser.uid) {
                    await fb.set(fb.ref(db, 'users/' + currentUser.uid), profile);
                }
                userData = profile;
                
                const authSection = document.getElementById('authSection');
                if(authSection) authSection.classList.add('hidden');
                
                const profileSetupForm = document.getElementById('profileSetupForm');
                if(profileSetupForm) profileSetupForm.classList.add('hidden');
                
                const mainContent = document.getElementById('mainContent');
                if(mainContent) mainContent.classList.remove('hidden');
                
                const bottomNav = document.getElementById('bottomNav');
                if(bottomNav) bottomNav.classList.remove('hidden');
                
                loadAppData();
                showToast("Account Saved Successfully!");
            } catch (e) {
                alert("Error saving profile: " + e.message);
            }
        }
        window.saveProfile = saveProfile;

                function openEditProfile() {
            if (!userData) {
                const pName = document.getElementById('profileName')?.innerText;
                const pPhone = document.getElementById('profilePhone')?.innerText;
                const pGender = document.getElementById('profileGender')?.innerText;
                const pAge = document.getElementById('profileAge')?.innerText;
                const pEmail = document.getElementById('profileEmail')?.innerText;
                
                userData = {
                    name: (pName && pName !== 'User Name') ? pName : (currentUser?.displayName || 'Student'),
                    gender: (pGender && pGender !== 'Not set') ? pGender : 'Male',
                    age: (pAge && pAge !== 'Not set') ? pAge : '20',
                    email: (pEmail && pEmail !== 'Not provided') ? pEmail : (currentUser?.email || ''),
                    phone: (pPhone && pPhone !== '+91 1234567890') ? pPhone : (currentUser?.phoneNumber || '')
                };
            }

            const setVal = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.value = val || '';
            };

            setVal('editName', userData.name || currentUser?.displayName || '');
            setVal('editGender', userData.gender || 'Male');
            setVal('editAge', userData.age || '20');
            setVal('editEmail', userData.email || currentUser?.email || '');
            setVal('editPhone', userData.phone || currentUser?.phoneNumber || '');

            const modal = document.getElementById('editProfileModal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        }
        window.openEditProfile = openEditProfile;

        function closeEditProfile() {
            const modal = document.getElementById('editProfileModal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        }
        window.closeEditProfile = closeEditProfile;

        async function updateProfile() {
            const name = document.getElementById('editName')?.value.trim();
            const gender = document.getElementById('editGender')?.value;
            const age = document.getElementById('editAge')?.value.trim();
            const email = document.getElementById('editEmail')?.value.trim();
            const phone = document.getElementById('editPhone')?.value.trim();

            if (!name || !gender || !age || !phone) {
                alert("Please fill all mandatory fields (Name, Gender, Age, Phone)");
                return;
            }

            const btn = document.getElementById('updateProfileBtn');
            const originalText = btn ? btn.innerText : "Save Changes";
            if (btn) {
                btn.innerText = "Saving...";
                btn.disabled = true;
            }

            try {
                const updatedData = {
                    ...(userData || {}),
                    name, gender, age, email, phone,
                    lastModified: Date.now()
                };

                if (currentUser && currentUser.uid && window.fb && window.db) {
                    try {
                        await fb.update(fb.ref(db, 'users/' + currentUser.uid), updatedData);
                    } catch (fbErr) {
                        console.warn("Firebase save failed, falling back to local storage:", fbErr);
                        localStorage.setItem('user_profile_' + currentUser.uid, JSON.stringify(updatedData));
                    }
                }

                userData = updatedData;

                const safeSetText = (id, text) => {
                    const el = document.getElementById(id);
                    if (el) el.innerText = text;
                };

                safeSetText('profileName', userData.name);
                safeSetText('profilePhone', userData.phone || '');
                safeSetText('profileGender', userData.gender || 'Not set');
                safeSetText('profileAge', userData.age || '');
                safeSetText('profileEmail', userData.email || 'Not provided');

                const initial = (userData.name && userData.name.length > 0) ? userData.name.charAt(0).toUpperCase() : 'U';
                safeSetText('userAvatar', initial);
                safeSetText('profileAvatar', initial);
                safeSetText('sidebarUserName', userData.name);
                safeSetText('sidebarUserPhone', userData.phone || '');
                safeSetText('sidebarAvatar', initial);

                const uName = document.getElementById('userNameHeader');
                if (uName) uName.innerText = userData.name.split(' ')[0];

                closeEditProfile();
                showToast("Profile Updated Successfully!");
            } catch (e) {
                alert("Error updating profile: " + e.message);
            } finally {
                if (btn) {
                    btn.innerText = originalText;
                    btn.disabled = false;
                }
            }
        }
        window.updateProfile = updateProfile;

        // ----------------- FIREBASE GOOGLE AUTHENTICATION -----------------
        async function signInWithGoogle() {
            const btn = document.getElementById('googleSignInBtn');
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Connecting...';

            try {
                const provider = new fb.GoogleAuthProvider();
                // Optionally add scopes if needed
                const result = await fb.signInWithPopup(auth, provider);
                currentUser = result.user;
                showToast("Signed in successfully!");
                checkUserProfile();
            } catch (err) {
                console.warn("Google Sign-In Error:", err);
                // Handle pop-up blocked or other errors
                if (err.code === 'auth/popup-blocked' || err.code === 'auth/unauthorized-domain') {
                    alert("Sign-in popup was blocked or unauthorized in this preview environment. You can open the app in a new tab, or use the 'Quick Demo Login' button below for testing.");
                } else if (err.code === 'auth/popup-closed-by-user') {
                    // Just reset
                } else {
                    alert("Sign-in failed: " + err.message + "\nIf you are in a preview, you can use 'Quick Demo Login' for testing.");
                }
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }
        window.signInWithGoogle = signInWithGoogle;



        function checkUserProfile() {

            const uid = currentUser.uid;
            console.log("Checking profile for:", uid);
            
            fb.get(fb.ref(db, 'users/' + uid)).then(snapshot => {
                if (snapshot.exists()) {
                    handleProfileData(snapshot.val(), uid);
                } else {
                    // Not found by new UID. Try finding by phone number (if Fast2SMS synthetic login)
                    let userPhone = currentUser.phoneNumber;
                    if (!userPhone && currentUser.email && currentUser.email.includes('@eos-classes.auth.com')) {
                        userPhone = '+' + currentUser.email.split('@')[0];
                    }
                    
                    if (userPhone) {
                        console.log("No profile by UID, searching by phone:", userPhone);
                        fb.get(fb.query(fb.ref(db, 'users'), fb.orderByChild('phone'), fb.equalTo(userPhone)))
                            .then(phoneSnap => {
                                if (phoneSnap.exists()) {
                                    let oldData = null;
                                    phoneSnap.forEach(child => { oldData = child.val(); });
                                    
                                    if (oldData) {
                                        console.log("Found existing profile by phone. Migrating to new UID...");
                                        oldData.uid = uid;
                                        fb.set(fb.ref(db, 'users/' + uid), oldData).then(() => {
                                            handleProfileData(oldData, uid);
                                        }).catch(err => {
                                            console.warn("Migration failed, using old data:", err);
                                            handleProfileData(oldData, uid);
                                        });
                                    } else {
                                        showProfileSetup();
                                    }
                                } else {
                                    console.log("No profile found by phone - showing setup");
                                    showProfileSetup();
                                }
                            }).catch(err => {
                                console.warn("Phone query failed:", err);
                                showProfileSetup();
                            });
                    } else {
                        showProfileSetup();
                    }
                }
            }).catch(e => {
                if (e.message && e.message.includes('Permission denied')) {
                    console.log("Permission denied reading profile, assuming new user.");
                    showProfileSetup();
                } else {
                    console.warn("Profile check error:", e);
                    alert("Database Error: " + (e.message || "Unknown error"));
                    showAuth();
                }
            });
        }

        function handleProfileData(data, currentUid) {
            if (!data || !data.phone) {
                // If profile is incomplete (missing phone), force setup
                userData = data || null;
                showProfileSetup();
                return;
            }

            userData = data;
            console.log("User data loaded:", userData ? userData.name : 'Unknown');
            
            // Admin logic
            const adminPhones = ['+919999999999', '+918000000000']; // Default admin phones
            const adminEmails = ['xanasrahmani@gmail.com'];
            
            if(adminEmails.includes(currentUser.email) || adminPhones.includes(currentUser.phoneNumber) || (userData && userData.role === 'admin')) {
                if (userData) userData.isAdmin = true;
                document.getElementById('adminSidebarBtn').classList.remove('hidden');
            }

            hideAuth();
            loadAppData();
        }

        // App Data Loading (Initialize listeners once)
        function loadAppData() {
            const triggerText = document.getElementById('activeClassName');
            if(triggerText) triggerText.innerText = activeCategory || "All Classes";

            // Load Categories
            fb.onValue(fb.ref(db, 'categories'), snapshot => {
                allCategoriesCached = [];
                snapshot.forEach(child => {
                    allCategoriesCached.push({ id: child.key, ...child.val() });
                });
                renderCategoryFilters();
            });

            // Load Pending Purchases
            fb.onValue(fb.ref(db, 'payment_requests'), snapshot => {
                pendingPurchases.clear();
                snapshot.forEach(child => {
                    const req = child.val();
                    if(currentUser && req.userId === currentUser.uid && req.status === 'Pending') {
                        pendingPurchases.add(req.courseId);
                    }
                });
                refreshUI();
            });

            // Load Upcoming Courses
            fb.onValue(fb.ref(db, 'upcoming_courses'), snapshot => {
                allUpcomingCached = [];
                snapshot.forEach(child => {
                    allUpcomingCached.push({ id: child.key, ...child.val() });
                });
                renderUpcoming();
            });

            // Load Professional LMS Courses
            fb.onValue(fb.ref(db, 'courses'), snapshot => {
                allCoursesCached = [];
                snapshot.forEach(child => {
                    allCoursesCached.push({ id: child.key, ...child.val() });
                });
                renderHomeCourses();
                renderAllCourses();
                renderTests(); // Tests/Notes depend on courses for access
                renderNotes();
            });

            // Load Test Series
            fb.onValue(fb.ref(db, 'tests'), snapshot => {
                allTestsCached = [];
                snapshot.forEach(child => {
                    allTestsCached.push({ id: child.key, ...child.val() });
                });
                renderTests();
            });

            // Load Live Classes
            fb.onValue(fb.ref(db, 'live'), snapshot => {
                allLiveCached = [];
                snapshot.forEach(child => {
                    allLiveCached.push({ id: child.key, ...child.val() });
                });
                renderLive();
            });

            // Load PDF Notes
            fb.onValue(fb.ref(db, 'notes'), snapshot => {
                allNotesCached = [];
                snapshot.forEach(child => {
                    allNotesCached.push({ id: child.key, ...child.val() });
                });
                renderNotes();
            });

            // Load Sliders (Multiple Screens)
            fb.onValue(fb.ref(db, 'sliders'), snapshot => {
                renderSlider(snapshot);
            });

            // Load Demo Classes
            fb.onValue(fb.ref(db, 'demo'), snapshot => {
                renderDemoClasses(snapshot);
            });

            fb.onValue(fb.ref(db, 'settings/logo'), snapshot => {
                if (snapshot.exists() && snapshot.val().url) {
                    const url = snapshot.val().url;
                    const splashImgs = document.querySelectorAll('.splash-logo-img');
                    splashImgs.forEach(img => { img.src = url; img.srcset = ''; });
                    
                    const authLogo = document.getElementById('authLogo');
                    if (authLogo) {
                        authLogo.innerHTML = `<img src="${url}" class="w-full h-full object-contain rounded-full" />`;
                        authLogo.style.background = 'transparent';
                    }
                    
                    const sidebarLogos = document.querySelectorAll('.tanu-logo-circle');
                    sidebarLogos.forEach(logo => {
                        logo.innerHTML = `<img src="${url}" class="w-full h-full object-contain rounded-full" />`;
                        logo.style.background = 'transparent';
                        logo.style.border = 'none';
                    });
                }
            });

            fb.onValue(fb.ref(db, 'settings/notification'), snapshot => {
                if (snapshot.exists()) {
                    const mText = document.getElementById('marqueeText');
                    if (mText) mText.innerText = snapshot.val();
                }
            });

            fb.onValue(fb.ref(db, 'settings/social'), snapshot => {
                if (snapshot.exists()) {
                    const s = snapshot.val();
                    const tg = document.getElementById('social-tg');
                    const wa = document.getElementById('social-wa');
                    const ig = document.getElementById('social-ig');
                    const web = document.getElementById('social-web');
                    if (tg) tg.href = s.telegram || '#';
                    if (wa) wa.href = s.whatsapp ? 'https://wa.me/' + s.whatsapp : '#';
                    if (ig) ig.href = s.instagram || '#';
                    if (web) web.href = s.website || '#';
                }
            });


            // Welcome Toast
            if (!sessionStorage.getItem('greeted')) {
                setTimeout(() => showToast("Welcome back, " + ((userData && userData.name) ? userData.name : 'Student') + "!"), 2000);
                sessionStorage.setItem('greeted', 'true');
            }

            // Set Greeting
            const hour = new Date().getHours();
            let greet = "Welcome Back";
            if (hour < 12) greet = "Good Morning";
            else if (hour < 17) greet = "Good Afternoon";
            else greet = "Good Evening";
            
            const gTime = document.getElementById('greetingTime');
            const uName = document.getElementById('userNameHeader');
            if (gTime) gTime.innerText = greet;
            if (uName && userData && userData.name) uName.innerText = userData.name.split(' ')[0];

            // Update Profile Page & UI elements safely
            if (userData && userData.name) {
                const initial = userData.name.charAt(0).toUpperCase();
                const safeSetText = (id, text) => {
                    const el = document.getElementById(id);
                    if (el) el.innerText = text;
                };
                safeSetText('profileName', userData.name);
                safeSetText('profilePhone', userData.phone || '');
                safeSetText('profileGender', userData.gender || 'Not set');
                safeSetText('profileAge', userData.age || '');
                safeSetText('profileEmail', userData.email || 'Not provided');
                safeSetText('userAvatar', initial);
                safeSetText('profileAvatar', initial);
                
                // New Sidebar Profile elements
                safeSetText('sidebarUserName', userData.name);
                safeSetText('sidebarUserPhone', userData.phone || '');
                safeSetText('sidebarAvatar', initial);
                safeSetText('sidebarCategory', activeCategory || "General");
            }

            // Premium Splash Duration (Min 2 seconds)
            setTimeout(() => {
                const splash = document.getElementById('splash');
                if(splash) {
                    splash.style.opacity = '0';
                    setTimeout(() => {
                        splash.style.display = 'none';
                        document.getElementById('mainContent').classList.remove('hidden');
                        document.getElementById('bottomNav').classList.remove('hidden');
                    }, 1000); // Wait for premium fade transition
                }
            }, 2000);

            // Start listening for notifications on login
            if (typeof initNotificationListener === 'function') {
                initNotificationListener();
            }
        }


        function renderNotifications(input) {
            const nList = document.getElementById('notificationList');
            if (!nList) return;
            nList.innerHTML = '';
            
            let data = [];
            if (Array.isArray(input)) {
                data = [...input];
            } else if (input && typeof input.forEach === 'function') {
                input.forEach(child => {
                    data.push({ id: child.key, ...child.val() });
                });
            }

            // Ensure we have latest first if they are not already (Firebase push IDs are chronological)
            // But if it's already reversed in the array, we don't need to do much.
            // For snapshot.forEach, it's always chronological.
            if (!Array.isArray(input)) data.reverse();

            const hiddenNots = JSON.parse(localStorage.getItem('hidden_notifications') || '[]');
            let visibleCount = 0;

            data.forEach(n => {
                const id = n.id;
                if (hiddenNots.includes(id)) return;
                
                if (n.category && n.category !== 'All' && typeof activeCategory !== 'undefined' && n.category !== activeCategory) {
                    return;
                }

                visibleCount++;
                const timeStr = new Date(n.time || n.timestamp || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                nList.innerHTML += `
                    <div class="bg-white bg-white p-5 rounded-3xl border border-slate-100 border-slate-200 shadow-sm border-l-4 border-l-indigo-600 relative group animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <button onclick="hideNotification('${id}')" class="absolute top-2 right-2 w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 hover:text-rose-500">
                            <i class="fa-solid fa-xmark text-xs"></i>
                        </button>
                        <div class="flex justify-between items-start mb-2">
                            <div class="flex flex-col">
                                <span class="text-[8px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-lg w-fit mb-1">${n.category || 'Global'}</span>
                                <h3 class="font-black text-sm text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">${n.title}</h3>
                            </div>
                            <span class="text-[10px] font-bold text-slate-400">${timeStr}</span>
                        </div>
                        <p class="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">${n.message}</p>
                    </div>
                `;
            });

            if (visibleCount === 0) {
                nList.innerHTML = '<div class="text-center py-20 text-slate-300 font-bold">No new notifications.</div>';
            }
        }

        let notificationsSnapshotCached = null;
        fb.onValue(fb.ref(db, 'notifications'), snapshot => {
            notificationsSnapshotCached = snapshot;
            renderNotifications(snapshot);
        });

        window.hideNotification = (id) => {
            const hiddenNots = JSON.parse(localStorage.getItem('hidden_notifications') || '[]');
            if(!hiddenNots.includes(id)) {
                hiddenNots.push(id);
                localStorage.setItem('hidden_notifications', JSON.stringify(hiddenNots));
                if (notificationsSnapshotCached) renderNotifications(notificationsSnapshotCached);
            }
        };

        window.clearAllNotifications = () => {
            if(confirm("Dismiss all currently visible notifications?")) {
                const hiddenNots = JSON.parse(localStorage.getItem('hidden_notifications') || '[]');
                const list = document.querySelectorAll('#notificationList button[onclick^="hideNotification"]');
                list.forEach(btn => {
                    const idStr = btn.getAttribute('onclick');
                    const match = idStr.match(/'([^']+)'/);
                    if (match) {
                        const id = match[1];
                        if(!hiddenNots.includes(id)) hiddenNots.push(id);
                    }
                });
                localStorage.setItem('hidden_notifications', JSON.stringify(hiddenNots));
                if (notificationsSnapshotCached) renderNotifications(notificationsSnapshotCached);
            }
        };


        // Slider Logic
        let sliderInterval;
        let currentSlide = 0;
        function renderSlider(snapshot) {
            const wrapper = document.getElementById('homeSlider');
            const dots = document.getElementById('sliderDots');
            if(!wrapper || !dots) return;
            
            wrapper.innerHTML = '';
            dots.innerHTML = '';
            let index = 0;
            
            if(!snapshot.exists()) {
                wrapper.innerHTML = `<div class="slider-item bg-slate-900 flex items-center justify-center h-full"><p class="text-white/30 text-[10px] font-bold">NO ACTIVE BANNERS</p></div>`;
                return;
            }

            snapshot.forEach(child => {
                const s = child.val();
                const url = typeof s === 'string' ? s : s.url;
                wrapper.innerHTML += `
                    <div onclick="handleSliderAction('${child.key}')" class="slider-item h-full cursor-pointer overflow-hidden">
                        <img src="${url}" class="w-full h-full object-cover transition-transform hover:scale-105 duration-[3000ms]">
                    </div>
                `;
                dots.innerHTML += `<div class="dot w-1.5 h-1.5 rounded-full bg-white/40 transition-all ${index === 0 ? 'bg-white w-4' : ''}" data-index="${index}"></div>`;
                index++;
            });

            startSlider(index);
        }

        async function handleSliderAction(sliderId) {
            const snap = await fb.get(fb.ref(db, `sliders/${sliderId}`));
            if (!snap.exists()) return;
            const s = snap.val();
            if (typeof s === 'string' || !s.action || s.action === 'none') return;

            switch(s.action) {
                case 'course':
                    openCourse(s.target);
                    break;
                case 'note':
                    fb.get(fb.ref(db, `notes/${s.target}`)).then(snapNote => {
                        if (snapNote.exists()) {
                            const n = snapNote.val();
                            viewPdf(n.url, n.title);
                        }
                    });
                    break;
                case 'test':
                    startQuiz(s.target);
                    break;
                case 'youtube':
                    if (s.target.includes('youtu')) {
                        playDemoVideo(s.target);
                    } else {
                        window.open(s.target, '_blank');
                    }
                    break;
            }
        }
        window.handleSliderAction = handleSliderAction;

        function startSlider(total) {
            clearInterval(sliderInterval);
            if(total <= 1) return;
            currentSlide = 0;
            const wrapper = document.getElementById('homeSlider');
            const dots = document.querySelectorAll('#sliderDots .dot');
            
            sliderInterval = setInterval(() => {
                currentSlide = (currentSlide + 1) % total;
                wrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
                dots.forEach((d, i) => {
                    d.classList.toggle('bg-white', i === currentSlide);
                    d.classList.toggle('w-4', i === currentSlide);
                    d.classList.toggle('bg-white/40', i !== currentSlide);
                    d.classList.toggle('w-1.5', i !== currentSlide);
                });
            }, 4000);
        }

        // Demo Classes Logic
        function renderDemoClasses(snapshot) {
            const list = document.getElementById('homeDemoList');
            if(!list) return;
            list.innerHTML = '';
            
            if(!snapshot.exists()) {
                list.innerHTML = `<div class="min-w-[240px] aspect-video bg-slate-100 rounded-2xl flex items-center justify-center"><p class="text-[10px] text-slate-400 font-bold">No demo lectures available.</p></div>`;
                return;
            }

            snapshot.forEach(child => {
                const d = child.val();
                const id = child.key;
                list.innerHTML += `
                    <div onclick="openDemo('${id}', '${d.playMode}', '${d.videoUrl}')" class="min-w-[240px] bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col hover:scale-[1.03] hover:shadow-md transition-all duration-300 active:scale-95 cursor-pointer">
                        <div class="relative aspect-video">
                            <img src="${d.thumbnail}" class="w-full h-full object-cover">
                            <div class="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <div class="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
                                    <i class="fa-solid fa-play ml-1"></i>
                                </div>
                            </div>
                        </div>
                        <div class="p-3">
                            <h3 class="font-black text-xs text-slate-800 line-clamp-1 leading-tight">${d.title}</h3>
                            <p class="text-[9px] text-slate-400 mt-1 line-clamp-2 font-medium">${d.description || 'Watch regular free classes'}</p>
                        </div>
                    </div>
                `;
            });
        }

        function openDemo(id, playMode, url) {
            if(playMode === 'Redirect') {
                window.open(url, '_blank');
            } else {
                playDemoVideo(url);
            }
        }

        function playDemoVideo(url) {
            let vidId = url;
            const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
            const match = url.match(regExp);
            if (match && match[1].length === 11) {
                vidId = `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
                viewPdf(vidId, "Demo Lecture", true);
            } else {
                // If not youtube, just try to play in viewer
                viewPdf(url, "Demo Lecture", true);
            }
        }

        // Live Tabs Logic
        function switchLiveTab(tab) {
            document.querySelectorAll('.live-tab').forEach(el => {
                el.classList.toggle('active', el.id === 'live-tab-' + tab);
                el.classList.toggle('bg-white', el.id === 'live-tab-' + tab);
                el.classList.toggle('text-indigo-600', el.id === 'live-tab-' + tab);
                el.classList.toggle('shadow-sm', el.id === 'live-tab-' + tab);
                el.classList.toggle('text-slate-400', el.id !== 'live-tab-' + tab);
            });

            document.querySelectorAll('.live-content').forEach(el => {
                el.classList.toggle('active', el.id === 'live-' + tab + '-content');
                el.classList.toggle('hidden', el.id !== 'live-' + tab + '-content');
            });
            
            renderLive();
        }

        window.switchLiveTab = switchLiveTab;
        window.openDemo = openDemo;
        window.playDemoVideo = playDemoVideo;

        function renderHomeCourses() {
            const list = document.getElementById('homeCoursesList');
            if(!list) return;
            list.innerHTML = '';
            
            const filtered = allCoursesCached.filter(c => !activeCategory || c.category === activeCategory);
            if(filtered.length === 0) {
                list.innerHTML = '<div class="text-center py-10 text-slate-400 font-bold text-xs uppercase bg-slate-50 rounded-3xl border border-dashed border-slate-200">No content in this category.</div>';
                return;
            }
            filtered.slice(0, 4).forEach(c => { list.innerHTML += generateCourseCard(c); });
        }

        function renderUpcoming() {
            const list = document.getElementById('homeUpcomingList');
            const section = document.getElementById('upcomingSection');
            if(!list || !section) return;
            list.innerHTML = '';
            
            const filtered = allUpcomingCached.filter(u => !activeCategory || u.category === activeCategory);
            if(filtered.length === 0) {
                // If filtering is on but no upcoming in this category, try showing some of others or hide
                if (activeCategory && allUpcomingCached.length > 0) {
                     // Still hide if specifically requested category but none found
                     section.classList.add('hidden');
                } else if (allUpcomingCached.length === 0) {
                    section.classList.add('hidden');
                }
                return;
            }
            section.classList.remove('hidden');

            filtered.forEach(u => {
                list.innerHTML += `
                    <div class="min-w-[280px] max-w-[280px] bg-white rounded-[32px] overflow-hidden border border-slate-50 shadow-xl shadow-slate-100 flex flex-col group cursor-pointer hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 active:scale-95">
                        <div class="relative h-40 overflow-hidden">
                            <img src="${u.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}" class="w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div class="absolute bottom-4 left-4 flex flex-col">
                                <span class="text-[8px] font-black text-white/70 uppercase tracking-[0.2em] mb-1">Coming Soon</span>
                                <span class="text-xs font-black text-white uppercase tracking-tight">${u.launchDate || 'Stay Tuned'}</span>
                            </div>
                        </div>
                        <div class="p-5">
                            <h3 class="font-black text-sm text-slate-800 line-clamp-1 mb-2">${u.title}</h3>
                            <p class="text-[10px] text-slate-400 line-clamp-2 leading-relaxed font-medium">${u.description || 'New academic batch starting soon with top faculty.'}</p>
                        </div>
                    </div>`;
            });
        }

        // Test Filtering State
        let activeTestTab = 'Free';
        function setTestTab(tab) {
            activeTestTab = tab;
            document.getElementById('tabTestFree').className = tab === 'Free' ? 'text-[9px] font-black uppercase px-4 py-2 rounded-lg bg-white text-indigo-600 shadow-sm transition-all' : 'text-[9px] font-black uppercase px-4 py-2 rounded-lg text-slate-500 transition-all';
            document.getElementById('tabTestPaid').className = tab === 'Paid' ? 'text-[9px] font-black uppercase px-4 py-2 rounded-lg bg-white text-indigo-600 shadow-sm transition-all' : 'text-[9px] font-black uppercase px-4 py-2 rounded-lg text-slate-500 transition-all';
            renderTests();
        }
        window.setTestTab = setTestTab;

        function renderTests() {
            const list = document.getElementById('fullTestsList');
            const noTests = document.getElementById('noTestsMsg');
            const catList = document.getElementById('testCategoryList');
            if(!list) return;
            list.innerHTML = '';

            // Render test categories
            if(catList) {
                catList.innerHTML = `<button onclick="setCategory('')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeCategory === '' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">All</button>`;
                allCategoriesCached.forEach(cat => {
                    catList.innerHTML += `<button onclick="selectCategory('${cat.name}')" class="px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase border mb-2 transition-all ${activeCategory === cat.name ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}">${cat.name}</button>`;
                });
            }

            let filtered = allTestsCached.filter(t => {
                const matchesTab = (t.status === activeTestTab) || (!t.status && activeTestTab === 'Free');
                const matchesCat = !activeCategory || t.category === activeCategory;
                return matchesTab && matchesCat;
            });
            
            if(filtered.length === 0) {
                noTests.classList.remove('hidden');
                return;
            }
            noTests.classList.add('hidden');

            filtered.forEach(t => {
                const isPaid = (t.status === 'Paid');
                const hasPurchased = userData && userData.purchased && (userData.purchased[t.id] || (t.courseId && userData.purchased[t.courseId]));
                const canAccess = !isPaid || hasPurchased;
                
                const qCount = t.questionsCount || (t.questions ? t.questions.length : 0);
                const discountText = t.discount ? `<span class="bg-emerald-50 text-emerald-600 text-[8px] font-black px-1.5 py-0.5 rounded ml-2">${t.discount}% OFF</span>` : '';

                list.innerHTML += `
                    <div class="card-white overflow-hidden group">
                        <div class="p-5 flex items-center gap-4">
                            <div class="w-14 h-14 ${isPaid ? 'bg-amber-50 text-amber-500' : 'bg-indigo-50 text-indigo-500'} rounded-2xl flex flex-shrink-0 items-center justify-center text-2xl transition-transform group-hover:scale-110">
                                <i class="fa-solid ${isPaid ? 'fa-crown' : 'fa-vials'}"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">${t.category || 'General'}</span>
                                    ${isPaid ? '<span class="text-[8px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-widest"><i class="fa-solid fa-star text-[7px] mr-1"></i>PRO</span>' : ''}
                                </div>
                                <h3 class="font-black text-slate-800 truncate">${t.title}</h3>
                                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">${qCount} Questions • ${t.timer || 20}s/Q</p>
                            </div>
                            <div class="text-right">
                                ${isPaid && !hasPurchased ? `
                                    <div class="mb-2">
                                        <p class="text-[9px] font-black text-slate-400 line-through">₹${t.price || 0}</p>
                                        <p class="text-xs font-black text-slate-900">₹${Math.round((t.price || 0) * (1 - (t.discount || 0)/100))}</p>
                                    </div>
                                ` : ''}
                                <button onclick="${canAccess ? `startQuiz('${t.id}')` : `openPurchaseModal('${t.id}', 'test')`}" 
                                    class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${canAccess ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-amber-500 text-white shadow-amber-100'}">
                                    ${canAccess ? 'Attempt' : 'Buy Now'}
                                </button>
                            </div>
                        </div>
                        ${isPaid && !hasPurchased && t.description ? `<p class="px-5 pb-4 text-[10px] text-slate-500 font-medium leading-relaxed italic border-t border-slate-50 pt-3 mt-1">"${t.description}"</p>` : ''}
                    </div>`;
            });
        }
        window.renderTests = renderTests;

        function openPurchaseModal(id, type) {
            const data = type === 'test' ? allTestsCached.find(x => x.id === id) : allCoursesCached.find(x => x.id === id);
            if(!data) return;

            document.getElementById('detTitle').innerText = data.title;
            document.getElementById('detCategory').innerText = data.category || 'Premium';
            document.getElementById('detDesc').innerText = data.description || 'Access this premium content and boost your learning today.';
            
            const finalPrice = Math.round((data.price || 0) * (1 - (data.discount || 0)/100));
            document.getElementById('detPrice').innerText = `₹${finalPrice}`;
            
            const btn = document.getElementById('detMainBtn');
            btn.onclick = () => {
                if(data.paymentLink) {
                    window.open(data.paymentLink, '_blank');
                    showPaymentConfirm(id, data.title);
                } else {
                    showToast("Payment link not set by admin.");
                }
            };
            btn.innerText = "PROCEED TO PAYMENT";
            
            document.getElementById('courseDetail').classList.remove('hidden');
        }
        window.openPurchaseModal = openPurchaseModal;

        function showPaymentConfirm(itemId, title) {
             const confirmDiv = document.createElement('div');
             confirmDiv.className = 'fixed inset-0 z-[6000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6';
             confirmDiv.innerHTML = `
                <div class="card-white w-full max-w-sm p-8 text-center animate-bounce-in">
                    <div class="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[32px] flex items-center justify-center text-3xl mx-auto mb-6">
                        <i class="fa-solid fa-wallet"></i>
                    </div>
                    <h3 class="text-xl font-black text-slate-800 mb-2">Paid for ${title}?</h3>
                    <p class="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-8">Submit your Transaction ID to get instant access after verification.</p>
                    <input type="text" id="txnIdTest" placeholder="Enter TXN ID" class="bg-white border border-slate-200 text-slate-900 w-full p-4 rounded-2xl mb-4 font-bold text-center">
                    <div class="flex gap-4">
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" class="flex-1 py-4 font-black uppercase text-[10px] text-slate-400">Cancel</button>
                        <button onclick="submitTestPayment('${itemId}', this)" class="flex-1 btn-indigo py-4 rounded-xl font-black uppercase text-[10px]">Submit</button>
                    </div>
                </div>
             `;
             document.body.appendChild(confirmDiv);
        }
        window.submitTestPayment = function(id, btn) {
            const txn = document.getElementById('txnIdTest').value;
            if(!txn) return alert("Please enter Transaction ID");
            

            fb.push(fb.ref(db, 'payments'), {
                uid: currentUser.uid,
                userName: userData ? userData.name : 'Unknown',
                courseId: id,
                courseTitle: allTestsCached.find(t => t.id === id).title,
                txnId: txn,
                status: 'Pending',
                timestamp: Date.now()
            }).then(() => {
                alert("Payment submitted! Access will be granted after verification.");
                btn.parentElement.parentElement.parentElement.remove();
            });
        };


        function renderLive() {
            const homeLive = document.getElementById('homeLiveList');
            const fullLive = document.getElementById('fullLiveList');
            const scheduledLive = document.getElementById('scheduledLiveList');
            const recordedLive = document.getElementById('recordedLiveList');
            const noLiveMsg = document.getElementById('noLiveMsg');

            if(homeLive) homeLive.innerHTML = '';
            if(fullLive) fullLive.innerHTML = '';
            if(scheduledLive) scheduledLive.innerHTML = '';
            if(recordedLive) recordedLive.innerHTML = '';

            const filtered = allLiveCached.filter(l => !activeCategory || l.category === activeCategory);
            
            const ongoing = filtered.filter(l => (l.mode === 'Live' || l.mode === 'In-App') && (!l.startTime || new Date(l.startTime) <= new Date()));
            const scheduled = filtered.filter(l => (l.mode === 'Live' || l.mode === 'In-App') && (l.startTime && new Date(l.startTime) > new Date())); 
            const recorded = filtered.filter(l => l.mode === 'Direct' || l.mode === 'Recorded');

            // Ongoing logic
            if(ongoing.length === 0) {
                if(noLiveMsg) noLiveMsg.classList.remove('hidden');
            } else {
                if(noLiveMsg) noLiveMsg.classList.add('hidden');
                ongoing.forEach(l => {
                    const hasAccess = (userData && userData.purchased && userData.purchased[l.courseId]) || l.type === 'Free';
                    const cardHtml = generateLiveCard(l, hasAccess);
                    if(fullLive) fullLive.innerHTML += cardHtml;
                    if(homeLive) homeLive.innerHTML += cardHtml;
                });
            }

            // Recorded logic
            if(recorded.length === 0) {
                if(recordedLive) recordedLive.innerHTML = '<div class="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-[10px]">No recordings found</div>';
            } else {
                recorded.forEach(l => {
                    const hasAccess = (userData && userData.purchased && userData.purchased[l.courseId]) || l.type === 'Free';
                    const cardHtml = generateLiveCard(l, hasAccess);
                    if(recordedLive) recordedLive.innerHTML += cardHtml;
                });
            }

            // Scheduled logic
            if(scheduled.length === 0 && scheduledLive) {
                scheduledLive.innerHTML = '<div class="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-[10px]">No upcoming sessions</div>';
            } else if(scheduledLive) {
                scheduled.forEach(l => {
                    const hasAccess = (userData && userData.purchased && userData.purchased[l.courseId]) || l.type === 'Free';
                    const cardHtml = generateLiveCard(l, hasAccess);
                    scheduledLive.innerHTML += cardHtml;
                });
                startLiveCountdowns();
            }
        }

        let liveCountdownInterval = null;
        function startLiveCountdowns() {
            if(liveCountdownInterval) clearInterval(liveCountdownInterval);
            liveCountdownInterval = setInterval(() => {
                const timers = document.querySelectorAll('.live-countdown');
                timers.forEach(t => {
                    const target = new Date(t.dataset.time).getTime();
                    const now = new Date().getTime();
                    const diff = target - now;
                    
                    if(diff <= 0) {
                        t.innerText = "Starting Soon...";
                        // Optionally refresh the list if needed
                    } else {
                        const h = Math.floor(diff / 3600000);
                        const m = Math.floor((diff % 3600000) / 60000);
                        const s = Math.floor((diff % 60000) / 1000);
                        t.innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
                    }
                });
            }, 1000);
        }

        function generateLiveCard(l, hasAccess) {
            const isScheduled = l.startTime && new Date(l.startTime) > new Date();
            const timeStr = isScheduled ? new Date(l.startTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
            
            return `
                <div onclick="openLive('${l.id}')" class="relative rounded-[32px] overflow-hidden group transition-all active:scale-[0.98] shadow-2xl shadow-indigo-100/50 border-2 border-transparent hover:border-indigo-100 bg-white">
                    <div class="relative aspect-video overflow-hidden">
                        <img src="${l.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}" class="w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000">
                        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
                        
                        ${!hasAccess ? `
                            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-[4px] flex flex-col items-center justify-center text-white z-20">
                                <div class="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 border border-white/20 backdrop-blur-md">
                                    <i class="fa-solid fa-lock text-2xl text-amber-500"></i>
                                </div>
                                <span class="text-[10px] uppercase font-black tracking-[0.2em] text-white">Enroll to Access Session</span>
                            </div>
                        ` : ''}
                        
                        <div class="absolute top-6 left-6 flex flex-col gap-2 z-10">
                            <div class="${isScheduled ? 'bg-indigo-600' : 'bg-rose-600'} px-4 py-2 rounded-2xl text-[9px] font-black tracking-widest flex items-center gap-2 text-white shadow-2xl border border-white/20">
                                <span class="w-2 h-2 bg-white rounded-full ${l.mode === 'Live' && !isScheduled ? 'animate-ping' : ''}"></span> 
                                ${isScheduled ? 'SCHEDULED' : (l.mode === 'Live' ? 'LIVE NOW' : 'VIDEO LESSON')}
                            </div>
                        </div>

                        ${isScheduled ? `
                            <div class="absolute top-6 right-6 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest text-white shadow-xl border border-white/10 flex items-center gap-2 z-10">
                                <i class="fa-solid fa-clock text-indigo-300"></i>
                                <span class="live-countdown" data-time="${l.startTime}">00:00:00</span>
                            </div>
                        ` : ''}
                    </div>

                    <div class="p-8 bg-white">
                        <div class="flex justify-between items-start gap-4">
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-3">
                                    <span class="bg-indigo-50 text-indigo-600 text-[8px] font-black px-2 py-0.5 rounded-lg border border-indigo-100 uppercase tracking-widest">${l.category || 'All Classes'}</span>
                                    <span class="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none">${l.courseName || 'General Module'}</span>
                                </div>
                                <h3 class="text-2xl font-black tracking-tight leading-tight text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">${l.title}</h3>
                                <p class="text-xs text-slate-400 line-clamp-2 font-medium leading-relaxed mb-6">${l.description || 'Join this special session to master your subject with experts.'}</p>
                                
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <div class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border border-slate-200">
                                            <img src="https://cdn-icons-png.flaticon.com/128/3135/3135715.png" class="w-6 h-6">
                                        </div>
                                        <div>
                                            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Mentor</p>
                                            <p class="text-[11px] font-black text-slate-800 mt-1 uppercase tracking-tight">${l.instructor || 'Eos Faculty'}</p>
                                        </div>
                                    </div>
                                    
                                    <button class="flex items-center gap-2 bg-slate-900 px-6 py-3 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest shadow-xl shadow-slate-200 group-hover:bg-indigo-600 transition-all active:scale-95">
                                        ${isScheduled ? 'Remind Me' : (hasAccess ? 'Join Now <i class="fa-solid fa-arrow-right ml-1"></i>' : 'Enroll Now')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        }

        function renderNotes() {
            const list = document.getElementById('fullNotesList');
            if(!list) return;
            list.innerHTML = "";
            
            const filtered = allNotesCached.filter(n => !activeCategory || n.category === activeCategory);
            const coursesMap = {};
            allCoursesCached.forEach(c => coursesMap[c.id] = c);

            filtered.forEach(n => {
                let hasAccess = n.type === 'Free' || !n.courseId;
                if(userData && userData.purchased) {
                    if(n.courseId && userData.purchased[n.courseId]) hasAccess = true;
                    Object.keys(userData.purchased).forEach(cid => {
                        const course = coursesMap[cid];
                        if(course && course.linkedNoteId === n.id) hasAccess = true;
                    });
                }

                list.innerHTML += `
                    <div onclick="${hasAccess ? `viewPdf('${n.url}', '${n.title}')` : 'showToast(\'Unlock Course to View PDF\')'}" class="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-50 active:scale-95 transition-all">
                        <div class="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-red-600"><i class="fa-solid fa-file-pdf text-2xl"></i></div>
                        <div class="flex-1">
                            <h3 class="text-sm font-black text-slate-800">${n.title}</h3>
                            <p class="text-[10px] text-slate-400 font-bold uppercase mt-0.5">PDF DOCUMENT</p>
                        </div>
                        <div class="text-slate-200"><i class="fa-solid fa-chevron-right"></i></div>
                    </div>`;
            });
        }


        // Navigation
        function navigateTo(pageId, pushToHistory = true) {
            const pages = ['home', 'courses', 'live', 'tests', 'notes', 'profile', 'notifications', 'mycourses', 'admin'];
            pages.forEach(p => {
                const el = document.getElementById('page-' + p);
                if(el) el.classList.remove('active');
                const btn = document.getElementById('btn-' + p);
                if (btn) btn.classList.remove('active');
            });
            const targetPage = document.getElementById('page-' + pageId);
            if(targetPage) targetPage.classList.add('active');
            const activeBtn = document.getElementById('btn-' + pageId);
            if (activeBtn) activeBtn.classList.add('active');
            
            if(pageId === 'mycourses') renderMyCourses();
            if(pageId === 'admin') loadUsersInAdmin();
            
            if (pushToHistory) {
                window.history.pushState({pageId: pageId}, '', '');
            }
            
            window.scrollTo(0,0);
        }
        window.navigateTo = navigateTo;

        window.onpopstate = function(event) {
            if (event.state && event.state.pageId) {
                navigateTo(event.state.pageId, false);
            } else {
                navigateTo('home', false);
            }
        };

        // Initialize state
        window.history.replaceState({pageId: 'home'}, '', '');

        async function loadUsersInAdmin() {
            loadAdminSettings(); // Load support settings as well
            const list = document.getElementById('adminUserList');
            if(!list) return;
            list.innerHTML = '<div class="text-center py-20 text-slate-300 font-bold animate-pulse">Fetching latest students...</div>';

            try {
                const snapshot = await fb.get(fb.ref(db, 'users'));
                if(!snapshot.exists()) {
                    list.innerHTML = '<div class="text-center py-20 text-slate-400 font-bold">No registered users found.</div>';
                    return;
                }

                const users = snapshot.val();
                list.innerHTML = '';
                
                Object.values(users).forEach(u => {
                    list.innerHTML += `
                        <div class="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-4">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg shadow-indigo-100">${(u.name || 'U')[0]}</div>
                                <div class="flex-1">
                                    <h4 class="font-black text-slate-800 leading-none">${u.name || 'Anonymous User'}</h4>
                                    <p class="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1.5">${u.email || 'No email'}</p>
                                </div>
                                <div class="text-right">
                                     <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Joined</span>
                                     <span class="text-[10px] font-bold text-slate-600">${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-3 pt-2">
                                <div class="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex flex-col justify-between">
                                    <p class="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-2">Student Contact</p>
                                    <a href="tel:${u.phone}" class="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-indigo-100 active:scale-95 transition-all group/call">
                                        <div class="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-[10px] shadow-lg shadow-emerald-100 group-hover/call:rotate-12 transition-transform">
                                            <i class="fa-solid fa-phone"></i>
                                        </div>
                                        <span class="text-xs font-black text-indigo-600 truncate">${u.phone || 'No Phone'}</span>
                                    </a>
                                </div>
                                <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Details</p>
                                    <p class="text-xs font-black text-slate-700 uppercase">${u.gender || 'N/A'} • ${u.age || '0'} Yrs</p>
                                </div>
                            </div>

                            <div class="flex gap-2">
                                 <button onclick="showToast('Feature coming soon: view detailed report')" class="flex-1 bg-slate-50 text-slate-600 font-black text-[9px] uppercase tracking-widest py-3 rounded-xl border border-slate-100 bg-white dark:text-slate-400 border-slate-200">View Report</button>
                                 <button onclick="deleteStudent('${u.uid}', '${u.name}')" class="flex-1 bg-rose-50 text-rose-600 font-black text-[9px] uppercase tracking-widest py-3 rounded-xl border border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30">Delete Student</button>
                            </div>
                        </div>
                    `;
                });
            } catch (e) {
                console.warn("Admin fetch error:", e);
                list.innerHTML = `<div class="text-center py-20 text-rose-500 font-bold">Error loading users: ${e.message}</div>`;
            }
        }
        window.loadUsersInAdmin = loadUsersInAdmin;

        async function deleteStudent(uid, name) {
            if(!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;
            
            try {
                showToast("Deleting student...");
                await fb.remove(fb.ref(db, 'users/' + uid));
                showToast("Student deleted successfully!");
                loadUsersInAdmin();
            } catch (e) {
                alert("Error deleting student: " + e.message);
            }
        }
        window.deleteStudent = deleteStudent;

        async function clearAllStudents() {
            if(!confirm("DANGER: Are you sure you want to clear ALL registered students? This cannot be undone.")) return;
            const code = prompt("Please type 'DELETE ALL' to confirm (Caps sensitive):");
            if(code !== 'DELETE ALL') return showToast("Operation Cancelled");

            try {
                showToast("Clearing directory...");
                await fb.remove(fb.ref(db, 'users'));
                showToast("All students cleared successfully!");
                loadUsersInAdmin();
            } catch (e) {
                alert("Error clearing students: " + e.message);
            }
        }
        window.clearAllStudents = clearAllStudents;

        function openSocialLinks() {
            fb.get(fb.ref(db, 'settings/social')).then(s => {
                const links = s.val() || {};
                const grid = document.getElementById('socialLinksGrid');
                if(!grid) return;
                grid.innerHTML = '';

                const available = [
                    { icon: 'fa-youtube text-rose-500', name: 'YouTube', link: links.youtube, bg: 'bg-rose-50' },
                    { icon: 'fa-whatsapp text-emerald-500', name: 'WhatsApp', link: links.whatsapp ? `https://wa.me/${links.whatsapp}` : null, bg: 'bg-emerald-50' },
                    { icon: 'fa-bullhorn text-amber-500', name: 'Channel', link: links.whatsappChannel, bg: 'bg-amber-50' },
                    { icon: 'fa-users text-blue-500', name: 'Group', link: links.whatsappGroup, bg: 'bg-blue-50' },
                    { icon: 'fa-telegram text-sky-500', name: 'Telegram', link: links.telegram, bg: 'bg-sky-50' },
                    { icon: 'fa-instagram text-pink-500', name: 'Instagram', link: links.instagram, bg: 'bg-pink-50' },
                    { icon: 'fa-globe text-indigo-500', name: 'Website', link: links.website, bg: 'bg-indigo-50' },
                    { icon: 'fa-mobile-screen text-indigo-600', name: 'Other App', link: links.thirdApp, bg: 'bg-slate-50' }
                ];

                available.forEach(item => {
                    if(item.link) {
                        grid.innerHTML += `
                            <a href="${item.link}" target="_blank" class="flex flex-col items-center justify-center p-5 ${item.bg} rounded-3xl transition-transform active:scale-95">
                                <i class="fa-brands ${item.icon.includes('fa-') ? '' : 'fa-brands'} ${item.icon} text-2xl mb-2"></i>
                                <span class="text-[9px] font-black uppercase tracking-widest text-slate-800">${item.name}</span>
                            </a>
                        `;
                    }
                });

                if(grid.innerHTML === '') grid.innerHTML = '<p class="col-span-2 text-center text-slate-400 font-bold py-10">No links added by admin yet.</p>';

                document.getElementById('socialPopup').classList.remove('hidden');
                document.getElementById('socialPopup').classList.add('flex');
            });
        }
        window.openSocialLinks = openSocialLinks;

        function closeSocialPopup() {
            document.getElementById('socialPopup').classList.add('hidden');
            document.getElementById('socialPopup').classList.remove('flex');
        }
        window.closeSocialPopup = closeSocialPopup;


        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('active');
            const overlay = document.getElementById('sidebarOverlay');
            overlay.style.display = overlay.style.display === 'block' ? 'none' : 'block';
        }

        function showToast(msg) {
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-28 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl text-white px-6 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-2xl z-[10000] border border-white/10 flex items-center gap-3 toast-animate';
            toast.innerHTML = `<div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> ${msg}`;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(10px) translateX(-50%)';
                toast.style.transition = 'all 0.4s ease';
                setTimeout(() => toast.remove(), 400);
            }, 3500);
        }
        // --- Advanced Quiz Engine ---
        let currentQuestions = [];
        let userAnswers = [];
        let currentQuizIndex = 0;
        let quizTimerSeconds = 20;
        let quizTimerInterval;
        let testData = null;
        let currentActiveTestId = null;

        async function startQuiz(testId) {
            currentActiveTestId = testId;
            const snap = await fb.get(fb.ref(db, `tests/${testId}`));
            if (!snap.exists()) return alert("Test data not found!");
            
            testData = snap.val();
            currentQuestions = testData.questions || [];
            
            if (currentQuestions.length === 0) return alert("This test has no questions yet.");

            userAnswers = Array(currentQuestions.length).fill(null);
            currentQuizIndex = 0;
            quizTimerSeconds = testData.timer || 20;
            
            document.getElementById('quizTitle').innerText = testData.title;
            document.getElementById('quizPlayer').classList.remove('hidden');
            renderQuestion();
        }

        function renderQuestion() {
            clearInterval(quizTimerInterval);
            const q = currentQuestions[currentQuizIndex];
            
            // UI Updates
            document.getElementById('quizCounter').innerText = `Question ${currentQuizIndex + 1} of ${currentQuestions.length}`;
            document.getElementById('questionText').innerText = q.q;
            document.getElementById('quizProgress').style.width = `${((currentQuizIndex + 1) / currentQuestions.length) * 100}%`;
            
            const grid = document.getElementById('optionsGrid');
            grid.innerHTML = '';
            
            ['a', 'b', 'c', 'd'].forEach(optKey => {
                const optText = q[optKey];
                grid.innerHTML += `
                    <button id="opt-${optKey}" onclick="selectOption('${optKey}')" 
                        class="quiz-option-btn group p-6 bg-white border border-slate-100 rounded-[24px] text-left transition-all active:scale-[0.98] focus:ring-4 focus:ring-indigo-100 flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="option-marker w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors uppercase">${optKey}</div>
                            <span class="text-sm font-bold text-slate-700">${optText}</span>
                        </div>
                        <div class="circle w-6 h-6 rounded-full border-2 border-slate-100 flex items-center justify-center transition-all">
                             <div class="inner-dot w-2 h-2 bg-indigo-600 rounded-full opacity-0 transition-all"></div>
                        </div>
                    </button>
                `;
            });

            document.getElementById('nextBtn').innerHTML = currentQuizIndex === currentQuestions.length - 1 ? 'Finish Test' : 'Next Question <i class="fa-solid fa-arrow-right text-[10px]"></i>';
            
            startQuizTimer();
        }

        function selectOption(opt) {
            userAnswers[currentQuizIndex] = opt;
            
            // UI Visual Feedback
            document.querySelectorAll('.quiz-option-btn').forEach(btn => {
                btn.classList.remove('ring-4', 'ring-indigo-100', 'border-indigo-500', 'bg-indigo-50');
                btn.querySelector('.circle').classList.remove('border-indigo-500');
                btn.querySelector('.inner-dot').classList.add('opacity-0');
            });
            
            const selectedBtn = document.getElementById(`opt-${opt}`);
            selectedBtn.classList.add('ring-4', 'ring-indigo-100', 'border-indigo-500', 'bg-indigo-50');
            selectedBtn.querySelector('.circle').classList.add('border-indigo-500');
            selectedBtn.querySelector('.inner-dot').classList.remove('opacity-0');
        }

        function startQuizTimer() {
            let timeLeft = testData.timer || 20;
            const timerEl = document.getElementById('quizTimer');
            timerEl.innerText = `00:${timeLeft.toString().padStart(2, '0')}`;
            
            quizTimerInterval = setInterval(() => {
                timeLeft--;
                timerEl.innerText = `00:${timeLeft.toString().padStart(2, '0')}`;
                
                if (timeLeft <= 5) {
                    timerEl.classList.add('text-rose-600');
                } else {
                    timerEl.classList.remove('text-rose-600');
                }

                if (timeLeft <= 0) {
                    clearInterval(quizTimerInterval);
                    nextQuestion(); // Auto-next on timeout
                }
            }, 1000);
        }

        function nextQuestion() {
            clearInterval(quizTimerInterval);
            if (currentQuizIndex === currentQuestions.length - 1) {
                showQuizResults();
            } else {
                currentQuizIndex++;
                renderQuestion();
            }
        }

        function showQuizResults() {
            document.getElementById('quizPlayer').classList.add('hidden');
            document.getElementById('quizResults').classList.remove('hidden');

            let score = 0;
            let correctCount = 0;
            let wrongCount = 0;
            let unattempted = 0;

            currentQuestions.forEach((q, idx) => {
                const userAns = userAnswers[idx];
                if (!userAns) {
                   unattempted++;
                } else if (userAns === q.ans) {
                   score++;
                   correctCount++;
                } else {
                   wrongCount++;
                }
            });

            const accuracy = Math.round((correctCount / (correctCount + wrongCount || 1)) * 100);
            const totalQs = currentQuestions.length;
            const percentage = Math.round((score / totalQs) * 100);

            document.getElementById('resAccuracy').innerText = accuracy + "%";
            document.getElementById('resScoreText').innerText = `${score} / ${totalQs}`;
            
            // Enhanced Result UI Injection
            const extraStats = document.getElementById('resExtraStats') || document.createElement('div');
            extraStats.id = 'resExtraStats';
            extraStats.className = 'grid grid-cols-3 gap-3 mt-8';
            extraStats.innerHTML = `
                <div class="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                    <p class="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Correct</p>
                    <p class="text-lg font-black text-emerald-700">${correctCount}</p>
                </div>
                <div class="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center">
                    <p class="text-[8px] font-black text-rose-600 uppercase tracking-widest mb-1">Wrong</p>
                    <p class="text-lg font-black text-rose-700">${wrongCount}</p>
                </div>
                <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                    <p class="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Skipped</p>
                    <p class="text-lg font-black text-slate-700">${unattempted}</p>
                </div>
            `;
            const statsContainer = document.querySelector('#quizResults .bg-white');
            if(statsContainer && !document.getElementById('resExtraStats')) {
                statsContainer.appendChild(extraStats);
            } else if(document.getElementById('resExtraStats')) {
                document.getElementById('resExtraStats').innerHTML = extraStats.innerHTML;
            }

            // Motivational Feedback
            let feedback = "Good effort! Keep practicing.";
            if(percentage >= 80) feedback = "Excellent! You are a master.";
            else if(percentage >= 60) feedback = "Great job! Almost there.";
            else if(percentage < 40) feedback = "Needs work. Study the concepts again.";
            
            const feedbackEl = document.getElementById('resFeedback') || document.createElement('p');
            feedbackEl.id = 'resFeedback';
            feedbackEl.className = 'text-center text-[10px] font-bold text-slate-400 mt-6 uppercase tracking-wider';
            feedbackEl.innerText = feedback;
            if(statsContainer && !document.getElementById('resFeedback')) statsContainer.appendChild(feedbackEl);

            // Save to Firebase
            if (currentUser) {
                const submission = {
                    testId: currentActiveTestId,
                    testTitle: testData.title,
                    score,
                    total: totalQs,
                    accuracy,
                    percentage,
                    stats: { correctCount, wrongCount, unattempted },
                    userAnswers,
                    submittedAt: Date.now()
                };
                fb.push(fb.ref(db, `users/${currentUser.uid}/test_history`), submission);
            }
        }


        function showReviewInResults() {
            const list = document.getElementById('reviewListMain');
            list.innerHTML = '';
            
            currentQuestions.forEach((q, idx) => {
                const userAns = userAnswers[idx];
                const isCorrect = userAns === q.ans;
                
                list.innerHTML += `
                    <div class="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                        <div class="flex justify-between items-start mb-6">
                             <div class="px-4 py-1.5 rounded-xl ${isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} text-[9px] font-black uppercase tracking-widest border ${isCorrect ? 'border-emerald-100' : 'border-rose-100'}">
                                ${isCorrect ? '<i class="fa-solid fa-check mr-1"></i> Correct' : '<i class="fa-solid fa-xmark mr-1"></i> Mistake'}
                             </div>
                             <span class="text-[10px] font-black text-slate-400">Q${idx + 1}</span>
                        </div>
                        <h4 class="text-lg font-bold text-slate-800 mb-8 leading-relaxed">${q.q}</h4>
                        
                        <div class="grid gap-3">
                            <div class="p-4 rounded-2xl flex items-center justify-between ${userAns === 'a' ? (isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100') : 'bg-slate-50 border-slate-50'} border">
                                <span class="text-xs font-bold ${userAns === 'a' ? (isCorrect ? 'text-emerald-700' : 'text-rose-700') : 'text-slate-500'}">A. ${q.a}</span>
                                ${q.ans === 'a' ? '<i class="fa-solid fa-circle-check text-emerald-500"></i>' : ''}
                            </div>
                            <div class="p-4 rounded-2xl flex items-center justify-between ${userAns === 'b' ? (isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100') : 'bg-slate-50 border-slate-50'} border">
                                <span class="text-xs font-bold ${userAns === 'b' ? (isCorrect ? 'text-emerald-700' : 'text-rose-700') : 'text-slate-500'}">B. ${q.b}</span>
                                ${q.ans === 'b' ? '<i class="fa-solid fa-circle-check text-emerald-500"></i>' : ''}
                            </div>
                            <div class="p-4 rounded-2xl flex items-center justify-between ${userAns === 'c' ? (isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100') : 'bg-slate-50 border-slate-50'} border">
                                <span class="text-xs font-bold ${userAns === 'c' ? (isCorrect ? 'text-emerald-700' : 'text-rose-700') : 'text-slate-500'}">C. ${q.c}</span>
                                ${q.ans === 'c' ? '<i class="fa-solid fa-circle-check text-emerald-500"></i>' : ''}
                            </div>
                            <div class="p-4 rounded-2xl flex items-center justify-between ${userAns === 'd' ? (isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100') : 'bg-slate-50 border-slate-50'} border">
                                <span class="text-xs font-bold ${userAns === 'd' ? (isCorrect ? 'text-emerald-700' : 'text-rose-700') : 'text-slate-500'}">D. ${q.d}</span>
                                ${q.ans === 'd' ? '<i class="fa-solid fa-circle-check text-emerald-500"></i>' : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
            
            document.getElementById('quizReviewView').classList.remove('hidden');
        }

        function closeResults() {
            document.getElementById('quizResults').classList.add('hidden');
            navigateTo('home');
        }

        function confirmExitQuiz() {
            if (confirm("Are you sure you want to end this test? Progress will be lost.")) {
                clearInterval(quizTimerInterval);
                document.getElementById('quizPlayer').classList.add('hidden');
            }
        }

        function showAuth() {
            // Hide all app containers explicitly
            document.getElementById('mainContent').classList.add('hidden');
            document.getElementById('bottomNav').classList.add('hidden');
            document.getElementById('profileSetupForm').classList.add('hidden');
            document.getElementById('authSection').classList.add('hidden'); 

            // Premium Splash Duration (Min 2 seconds)
            setTimeout(() => {
                const splash = document.getElementById('splash');
                if(splash) {
                    splash.style.opacity = '0';
                    setTimeout(() => {
                        splash.style.display = 'none';
                        document.getElementById('authSection').classList.remove('hidden');
                    }, 1000);
                }
            }, 1500);
        }

        function hideAuth() {
            document.getElementById('authSection').classList.add('hidden');
        }



        function showProfileSetup() {
            const loginForm = document.getElementById('loginForm');
            if (loginForm) loginForm.classList.add('hidden');
            const profileSetupForm = document.getElementById('profileSetupForm');
            if (profileSetupForm) profileSetupForm.classList.remove('hidden');
            
            // Auto-fill available data from Google account
            if (currentUser && currentUser.displayName) {
                document.getElementById('setupName').value = currentUser.displayName;
            }
            if (currentUser && currentUser.email) {
                document.getElementById('setupEmail').value = currentUser.email;
            }
        }

        async function logoutFromSetup() {
            try {
                localStorage.clear();
                sessionStorage.clear();
                const currentAuth = typeof auth !== 'undefined' ? auth : (window.auth || (window.fb && window.fb.getAuth && window.fb.getAuth()));
                if (currentAuth && window.fb && window.fb.signOut) {
                    await fb.signOut(currentAuth).catch(() => {});
                }
            } catch (err) {
                console.warn("Logout from setup error:", err);
            }
            window.location.replace(window.location.pathname + "?logout=" + Date.now());
        }
        window.logoutFromSetup = logoutFromSetup;

        async function logout() {
            if (!confirm('Are you sure you want to log out?')) return;
            
            try {
                // Close sidebar if open
                const sidebar = document.getElementById('sidebarNav');
                if (sidebar) {
                    sidebar.classList.add('-left-full');
                    sidebar.classList.remove('left-0');
                }

                const splash = document.getElementById('splash');
                if (splash) {
                    splash.style.display = 'flex';
                    splash.style.opacity = '1';
                    splash.innerHTML = `
                        <div class="flex flex-col items-center bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                            <i class="fa-solid fa-power-off text-rose-500 text-4xl mb-3 animate-pulse"></i>
                            <h2 class="text-slate-900 dark:text-white font-bold text-xl tracking-tight">Logging out...</h2>
                            <p class="text-slate-500 text-xs mt-1 uppercase tracking-wider font-semibold">Cleaning session data</p>
                        </div>
                    `;
                }

                // Hide main app views
                const mainContent = document.getElementById('mainContent');
                if (mainContent) mainContent.classList.add('hidden');
                const bottomNav = document.getElementById('bottomNav');
                if (bottomNav) bottomNav.classList.add('hidden');
                const editProfileModal = document.getElementById('editProfileModal');
                if (editProfileModal) editProfileModal.classList.add('hidden');

                // Clear local state variables
                currentUser = null;
                userData = null;

                // Clear local & session storage
                localStorage.clear();
                sessionStorage.clear();

                // Sign out from Firebase if authenticated
                const currentAuth = typeof auth !== 'undefined' ? auth : (window.auth || (window.fb && window.fb.getAuth && window.fb.getAuth()));
                if (currentAuth && window.fb && window.fb.signOut) {
                    await fb.signOut(currentAuth).catch(err => console.warn("SignOut notice:", err));
                }

                setTimeout(() => {
                    window.location.replace(window.location.pathname + "?logout=" + Date.now());
                }, 300);
            } catch (e) {
                console.warn("Logout error:", e);
                localStorage.clear();
                sessionStorage.clear();
                window.location.replace(window.location.pathname + "?logout=" + Date.now());
            }
        }
        window.logout = logout;

        // Live/Video/PDF Logic
        function openCourse(id, type) {
            fb.get(fb.ref(db, 'courses/' + id)).then(async snap => {
                const c = snap.val();
                const hasAccess = (userData && userData.purchased && userData.purchased[id]) || type === 'Free';
                
                // Set Modal Data
                document.getElementById('detTitle').innerText = c.title;
                document.getElementById('detDesc').innerText = c.description;
                document.getElementById('detCategory').innerText = c.category;
                document.getElementById('detDifficulty').innerText = c.difficulty || 'Intermediate';
                document.getElementById('detTag').innerText = c.tag || 'LMS';
                document.getElementById('detInstructor').innerText = c.instructor || 'Eos Faculty';
                document.getElementById('detRating').innerText = c.rating || '4.8';
                
                const detPriceEl = document.getElementById('detPrice');
                if (c.type === 'Free') {
                    detPriceEl.innerText = 'FREE';
                } else if (c.discount > 0) {
                    const finalPrice = Math.round(c.price * (1 - c.discount/100));
                    detPriceEl.innerHTML = `
                        <div class="flex flex-col items-start gap-1">
                            <span class="text-rose-500 text-[10px] font-black bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 uppercase tracking-widest">Save ${c.discount}%</span>
                            <div class="flex items-center gap-3">
                                <span class="line-through text-slate-400 text-sm">₹${c.price}</span>
                                <span class="text-3xl font-black text-slate-900 tracking-tighter">₹${finalPrice}</span>
                            </div>
                        </div>
                    `;
                } else {
                    detPriceEl.innerText = '₹' + c.price;
                }
                
                document.getElementById('courseDetailThumb').src = c.thumbnail;
                
                // Instructions
                const instructSec = document.getElementById('instructSec');
                if(c.instructions) {
                    instructSec.classList.remove('hidden');
                    document.getElementById('detInstruct').innerText = c.instructions;
                } else {
                    instructSec.classList.add('hidden');
                }

                // Video Intro
                const playOverlay = document.getElementById('playIntroOverlay');
                const thumbOverlay = document.getElementById('courseThumbOverlay');
                const iframe = document.getElementById('courseIframe');
                if(c.youtubeIntro) {
                    playOverlay.classList.remove('hidden');
                    thumbOverlay.classList.remove('hidden');
                    
                    // Robust extraction logic
                    let vidId = c.youtubeIntro;
                    const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
                    const match = vidId.match(regExp);
                    vidId = (match && match[1].length === 11) ? match[1] : vidId;

                    iframe.src = `https://www.youtube.com/embed/${vidId}?autoplay=0`;
                    document.getElementById('courseDetailOverlay').dataset.vidId = vidId;
                    const mode = c.youtubePlayMode || 'In-App';
                    document.getElementById('courseDetailOverlay').dataset.playMode = mode;
                    
                    const playBtnText = document.querySelector('#playIntroOverlay span');
                    if(playBtnText) {
                        playBtnText.innerText = mode === 'Redirect' ? 'Open in YouTube' : 'Play Intro Video';
                    }
                } else {
                    playOverlay.classList.add('hidden');
                    thumbOverlay.classList.add('hidden');
                    iframe.src = "";
                }

                // Attachments (Notes/Tests)
                const attachSec = document.getElementById('attachmentSec');
                const attachList = document.getElementById('detAttachments');
                attachList.innerHTML = "";
                let hasAttachments = false;

                if(hasAccess) {
                    if(c.linkedNoteId) {
                        const noteSnap = await fb.get(fb.ref(db, 'notes/' + c.linkedNoteId));
                        if(noteSnap.exists()) {
                            hasAttachments = true;
                            const n = noteSnap.val();
                            attachList.innerHTML += `
                                <div onclick="viewPdf('${n.url}', '${n.title}')" class="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 active:scale-95 transition-all">
                                    <div class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><i class="fa-solid fa-file-pdf"></i></div>
                                    <div class="flex-1">
                                        <h4 class="text-xs font-black text-slate-800">Study Notes: ${n.title}</h4>
                                        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Click to view material</p>
                                    </div>
                                    <i class="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
                                </div>
                            `;
                        }
                    }
                    if(c.linkedTestId) {
                        const testSnap = await fb.get(fb.ref(db, 'tests/' + c.linkedTestId));
                        if(testSnap.exists()) {
                            hasAttachments = true;
                            const t = testSnap.val();
                            attachList.innerHTML += `
                                <div onclick="startQuiz('${c.linkedTestId}')" class="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 active:scale-95 transition-all">
                                    <div class="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center"><i class="fa-solid fa-vial"></i></div>
                                    <div class="flex-1">
                                        <h4 class="text-xs font-black text-slate-800">Test Series: ${t.title}</h4>
                                        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Assessment Ready</p>
                                    </div>
                                    <i class="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
                                </div>
                            `;
                        }
                    }
                }

                if(hasAttachments) attachSec.classList.remove('hidden');
                else attachSec.classList.add('hidden');

                // Main Button
                const mainBtn = document.getElementById('detMainBtn');
                if(hasAccess) {
                    mainBtn.innerText = "Start Learning Now";
                    mainBtn.className = "w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-200 active:scale-95 transition-all";
                    mainBtn.onclick = () => { showToast("Enjoy your course! Check materials below."); };
                } else if (pendingPurchases.has(id)) {
                    mainBtn.innerText = "Approval Pending";
                    mainBtn.className = "w-full bg-amber-500 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-amber-200 active:scale-95 transition-all";
                    mainBtn.onclick = () => { showToast("Admin is verifying your payment. Please wait."); };
                } else {
                    const finalPrice = c.discount > 0 ? Math.round(c.price * (1 - c.discount/100)) : c.price;
                    mainBtn.innerText = "Enroll Now • " + (c.type === 'Free' ? 'FREE' : '₹' + finalPrice);
                    mainBtn.className = "w-full btn-indigo py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 active:scale-95 transition-all";
                    mainBtn.onclick = () => {
                        currentCourseId = id;
                        document.getElementById('payPrice').innerText = '₹' + finalPrice;
                        document.getElementById('payCourseTitle').innerText = c.title;
                        
                        const strikePriceEl = document.getElementById('payStrikePrice');
                        const discountBadgeEl = document.getElementById('payDiscountBadge');
                        
                        if (c.discount > 0) {
                            strikePriceEl.innerText = '₹' + c.price;
                            strikePriceEl.classList.remove('hidden');
                            discountBadgeEl.innerText = `SAVE ${c.discount}%`;
                            discountBadgeEl.classList.remove('hidden');
                        } else {
                            strikePriceEl.classList.add('hidden');
                            discountBadgeEl.classList.add('hidden');
                        }

                        fb.get(fb.ref(db, 'settings/payment')).then(pSnap => {
                            document.getElementById('paymentLink').href = pSnap.val().link;
                            document.getElementById('paymentPopup').classList.remove('hidden');
                            document.getElementById('paymentPopup').style.display = 'flex';
                        });
                    };
                }

                document.getElementById('courseDetailOverlay').classList.remove('hidden');
            });
        }

        function closeCourseDetail() {
            document.getElementById('courseDetailOverlay').classList.add('hidden');
            document.getElementById('courseVideoPlayer').classList.add('hidden');
            document.getElementById('courseDetailThumb').classList.remove('hidden');
            document.getElementById('courseThumbOverlay').classList.add('hidden');
            document.getElementById('courseIframe').src = "";
        }

        function playIntro() {
            const vidId = document.getElementById('courseDetailOverlay').dataset.vidId;
            const playMode = document.getElementById('courseDetailOverlay').dataset.playMode;
            if(vidId) {
                if(playMode === 'Redirect') {
                    window.open(`https://www.youtube.com/watch?v=${vidId}`, '_blank');
                } else {
                    document.getElementById('courseVideoPlayer').classList.remove('hidden');
                    document.getElementById('courseDetailThumb').classList.add('hidden');
                    document.getElementById('courseThumbOverlay').classList.add('hidden');
                    document.getElementById('playIntroOverlay').classList.add('hidden');
                    document.getElementById('courseIframe').src = `https://www.youtube.com/embed/${vidId}?autoplay=1`;
                }
            }
        }

        function openLive(id) {
            fb.get(fb.ref(db, 'live/' + id)).then(snap => {
                const l = snap.val();
                const hasAccess = (userData && userData.purchased && userData.purchased[l.courseId]) || l.type === 'Free';
                
                if (hasAccess) {
                    if (l.mode === 'In-App') {
                        // Open in iframe (YouTube Embed)
                        viewPdf(l.embedUrl, l.title, true);
                    } else {
                        window.open(l.youtubeUrl, '_blank');
                    }
                } else {
                    showToast('Please purchase the course to join this live session.');
                    setTimeout(() => openCourse(l.courseId, 'Paid'), 800);
                }
            });
        }

        function viewPdf(url, title, isVideo = false) {
            document.getElementById('pdfTitle').innerText = title;
            const viewer = isVideo ? url : `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`;
            document.getElementById('pdfFrame').src = viewer;
            document.getElementById('pdfViewerContainer').style.display = 'block';
        }

        function closePdf() {
            document.getElementById('pdfViewerContainer').style.display = 'none';
            document.getElementById('pdfFrame').src = '';
        }

        function closePayment() {
            document.getElementById('paymentPopup').style.display = 'none';
            document.getElementById('paymentPopup').classList.add('hidden');
            // Reset modal state for next open
            setTimeout(() => {
                document.getElementById('paymentFormBody').classList.remove('hidden');
                document.getElementById('paymentSuccessBody').classList.add('hidden');
            }, 300);
        }

        function submitPayment() {
            const txn = document.getElementById('txnId').value;
            if (!txn) return alert('Enter transaction ID');

            fb.push(fb.ref(db, 'payment_requests'), {
                courseId: currentCourseId,
                courseName: document.getElementById('payCourseTitle').innerText,
                userId: currentUser.uid,
                userName: userData ? userData.name : 'Unknown',
                userPhone: userData ? userData.phone : 'Unknown',
                txnId: txn,
                status: 'Pending',
                time: Date.now()
            }).then(() => {
                document.getElementById('paymentFormBody').classList.add('hidden');
                document.getElementById('paymentSuccessBody').classList.remove('hidden');
                
                fb.get(fb.ref(db, 'settings/global')).then(snap => {
                    const list = document.getElementById('paymentContactsList');
                    list.innerHTML = '';
                    if(snap.exists()) {
                        const contacts = snap.val().contacts || [];
                        contacts.forEach(num => {
                            list.innerHTML += `
                                <a href="tel:${num}" class="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 active:scale-95 transition-all">
                                    <span class="text-white font-black text-xs"><i class="fa-solid fa-phone mr-3 text-indigo-400"></i> ${num}</span>
                                    <i class="fa-solid fa-chevron-right text-white/20 text-[10px]"></i>
                                </a>
                            `;
                        });
                    }
                });
            });
        }

        async function broadcastNotification() {
            const title = document.getElementById('notifTitle').value;
            const body = document.getElementById('notifMsg').value;
            if(!title || !body) return showToast("Please fill all fields");

            try {
                showToast("Pushing alert...");
                await fb.push(fb.ref(db, 'notifications'), {
                    title,
                    message: body,
                    timestamp: Date.now(),
                    type: 'broadcast',
                    webPush: true
                });
                document.getElementById('notifTitle').value = '';
                document.getElementById('notifMsg').value = '';
                showToast("Successfully broadcasted!");
            } catch (e) {
                alert("Error: " + e.message);
            }
        }
        window.broadcastNotification = broadcastNotification;

        // Notification Permission & System Alert Logic
        async function requestNotificationPermission() {
            if (!("Notification" in window)) {
                console.log("This browser does not support desktop notification");
                return;
            }

            if (Notification.permission !== "denied") {
                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                    showToast("System Notifications Enabled!");
                }
            }
        }
        window.requestNotificationPermission = requestNotificationPermission;
        window.initNotificationListener = initNotificationListener;
        window.updateNotificationBtnState = updateNotificationBtnState;

        function sendSystemNotification(title, body) {
            if (Notification.permission === "granted") {
                const n = new Notification(title, {
                    body: body,
                    icon: 'https://cdn-icons-png.flaticon.com/512/3119/3119338.png'
                });
                n.onclick = () => {
                    window.focus();
                    navigateTo('notifications');
                };
            }
        }

        function updateNotificationBtnState() {
            const btn = document.getElementById('btnNotifToggle');
            if (btn) {
                if (Notification.permission === 'granted') {
                    btn.innerText = 'Enabled';
                    btn.classList.add('bg-emerald-50', 'text-emerald-600');
                    btn.classList.remove('bg-indigo-50', 'text-indigo-600');
                } else if (Notification.permission === 'denied') {
                    btn.innerText = 'Blocked';
                    btn.classList.add('bg-rose-50', 'text-rose-600');
                    btn.classList.remove('bg-indigo-50', 'text-indigo-600');
                } else {
                    btn.innerText = 'Enable';
                }
            }
        }

        function initNotificationListener() {
            updateNotificationBtnState();
            
            // Request permission on first load
            if (Notification.permission === "default" && !localStorage.getItem('notif_prompted')) {
                setTimeout(() => {
                    requestNotificationPermission();
                    localStorage.setItem('notif_prompted', 'true');
                }, 3000);
            }

            const notifRef = fb.query(fb.ref(db, 'notifications'), fb.limitToLast(1));
            let isFirstLoad = true;
            let lastNotifId = localStorage.getItem('lastHandledNotifId');
            
            fb.onValue(notifRef, (snap) => {
                if(!snap.exists()) return;
                
                const data = snap.val();
                const currentId = Object.keys(data)[0];
                const notif = data[currentId];

                if (!isFirstLoad && currentId !== lastNotifId) {
                    lastNotifId = currentId;
                    localStorage.setItem('lastHandledNotifId', currentId);
                    
                    
                    // Show in-app toast for all notifications
                    showToast("New Notification: " + (notif.title || 'Update'));
                    
                    // Conditionally fire web push and sound if requested
                    if (notif.webPush !== false) { // default to true if undefined for backward compatibility
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
                        audio.play().catch(e => console.log("Audio blocked"));
                        sendSystemNotification(notif.title || 'New Update', notif.message || notif.body || '');
                    }
                }
                
                isFirstLoad = false;
                loadAllNotifications();
            });
        }

        async function loadAllNotifications() {
            const snap = await fb.get(fb.query(fb.ref(db, 'notifications'), fb.limitToLast(20)));
            if(snap.exists()) {
                const notifs = [];
                snap.forEach(child => {
                    notifs.unshift({ id: child.key, ...child.val() });
                });
                renderNotifications(notifs);
            }
        }



        async function openSupport() {
            try {
                const snap = await fb.get(fb.ref(db, 'settings/support'));
                if(snap.exists()) {
                    const phone = snap.val().whatsapp;
                    if(phone) {
                        window.open(`https://wa.me/${phone.replace(/\+/g, '').replace(/\s/g, '')}`, '_blank');
                    } else {
                        showToast("Support contact not set by admin");
                    }
                } else {
                    showToast("No support info available");
                }
            } catch (e) {
                console.warn("Support error:", e);
                showToast("Cannot connect to support");
            }
        }
        window.openSupport = openSupport;

        async function saveSupportSettings() {
            const whatsapp = document.getElementById('supportWhatsapp').value;
            try {
                showToast("Updating support...");
                await fb.set(fb.ref(db, 'settings/support'), {
                    whatsapp: whatsapp,
                    updatedAt: Date.now()
                });
                showToast("Support Updated!");
            } catch (e) {
                alert("Error: " + e.message);
            }
        }
        window.saveSupportSettings = saveSupportSettings;

        async function loadAdminSettings() {
            try {
                const snap = await fb.get(fb.ref(db, 'settings/support'));
                if(snap.exists()) {
                    const input = document.getElementById('supportWhatsapp');
                    if(input) input.value = snap.val().whatsapp || '';
                }
            } catch (e) {}
        }

        function closeSupport() {
            document.getElementById('supportPopup').style.display = 'none';
            document.getElementById('supportPopup').classList.add('hidden');
        }

        window.closeSupport = closeSupport;
        window.startQuiz = startQuiz;
        window.nextQuestion = nextQuestion;
        window.closeResults = closeResults;
        window.selectOption = selectOption;
        window.showReviewInResults = showReviewInResults;
        window.confirmExitQuiz = confirmExitQuiz;


        // Connection Watcher
        window.addEventListener('online', () => {
            console.log("App is online");
            document.getElementById('noInternet').style.display = 'none';
        });
        window.addEventListener('offline', () => {
            console.log("App is offline");
            document.getElementById('noInternet').style.display = 'flex';
        });
        
        function forceOnline() {
            document.getElementById('noInternet').style.display = 'none';
        }

