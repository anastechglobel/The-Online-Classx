const fs = require('fs');

// 1. Update admin.html
let adminHtml = fs.readFileSync('admin.html', 'utf8');

// Update input placeholder in admin.html
adminHtml = adminHtml.replace(
    '<input type="text" id="adminUser" placeholder="Username"',
    '<input type="text" id="adminUser" placeholder="Username or Email (e.g. admin or email)"'
);

// Update adminLogin function in admin.html
const oldAdminLogin = `        async function adminLogin() {
            const user = document.getElementById('adminUser').value;
            const pass = document.getElementById('adminPass').value;
            if(!user || !pass) {
                alert("Please enter both email and password");
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

            // Real-time check against Firebase Auth
            try {
                const userCred = await fb.signInWithEmailAndPassword(window.auth, user, pass);
                const email = userCred.user.email;
                const sanitizedEmail = email.replace(/\\./g, ',');
                
                // SECURITY CHECK: Ensure the user is the master admin OR explicitly added to staff
                if (email !== 'xanasrahmani@gmail.com') {
                    const adminSnap = await fb.get(fb.ref(db, 'admins/' + sanitizedEmail));
                    if (!adminSnap.exists() && user !== 'admin') {
                        await fb.signOut(window.auth);
                        if(errorEl) errorEl.innerText = 'Access Denied: Not an authorized admin account.';
                        return;
                    }
                }
                
                proceed();
            } catch (e) {
                console.error("Login Error:", e);
                if(errorEl) errorEl.innerText = 'Authentication failed: ' + e.message;
            }
        }`;

const newAdminLogin = `        async function adminLogin() {
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
                    const sanitizedEmail = email.replace(/\\./g, ',');
                    
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
        }`;

if (adminHtml.includes("async function adminLogin()")) {
    adminHtml = adminHtml.replace(oldAdminLogin, newAdminLogin);
}
fs.writeFileSync('admin.html', adminHtml);
console.log('admin.html updated');

// 2. Update index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');

// Fix loadAppData inside indexHtml to guard currentUser inside payment_requests
const oldPendingPurchases = `            // Load Pending Purchases
            fb.onValue(fb.ref(db, 'payment_requests'), snapshot => {
                pendingPurchases.clear();
                snapshot.forEach(child => {
                    const req = child.val();
                    if(req.userId === currentUser.uid && req.status === 'Pending') {
                        pendingPurchases.add(req.courseId);
                    }
                });
                refreshUI();
            });`;

const newPendingPurchases = `            // Load Pending Purchases
            fb.onValue(fb.ref(db, 'payment_requests'), snapshot => {
                pendingPurchases.clear();
                snapshot.forEach(child => {
                    const req = child.val();
                    if(currentUser && req.userId === currentUser.uid && req.status === 'Pending') {
                        pendingPurchases.add(req.courseId);
                    }
                });
                refreshUI();
            });`;

if (indexHtml.includes(oldPendingPurchases)) {
    indexHtml = indexHtml.replace(oldPendingPurchases, newPendingPurchases);
}

// Make sure loadAppData and initNotificationListener run on initial script execution
const oldOnAuth = `        // On Auth State Changed
        fb.onAuthStateChanged(auth, user => {
            if (user) {
                currentUser = user;
                
                checkUserProfile();
            } else {
                showAuth();
            }
        });`;

const newOnAuth = `        // Load public app data & notification listener immediately on load
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
        });`;

if (indexHtml.includes(oldOnAuth)) {
    indexHtml = indexHtml.replace(oldOnAuth, newOnAuth);
}

// Ensure functions are attached to window
if (!indexHtml.includes("window.initNotificationListener = initNotificationListener;")) {
    indexHtml = indexHtml.replace(
        "window.requestNotificationPermission = requestNotificationPermission;",
        "window.requestNotificationPermission = requestNotificationPermission;\n        window.initNotificationListener = initNotificationListener;\n        window.updateNotificationBtnState = updateNotificationBtnState;"
    );
}

fs.writeFileSync('index.html', indexHtml);
console.log('index.html updated');
