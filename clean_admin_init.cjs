const fs = require('fs');
let content = fs.readFileSync('admin.html', 'utf8');

const oldBlock = `        // Ensure default admin exists
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
            fb.signInAnonymously(window.auth).catch(e => console.log("Persist auth note:", e));
            setTimeout(loadAdminData, 500);
        }`;

const newBlock = `        // Check persistent login using Firebase Auth
        fb.onAuthStateChanged(window.auth, (user) => {
            if (user && !user.isAnonymous) {
                sessionStorage.setItem('isAdmin', 'true');
                document.getElementById('loginOverlay').style.display = 'none';
                const adminSide = document.getElementById('adminSide');
                const adminMain = document.getElementById('adminMain');
                if (adminSide) adminSide.classList.remove('hidden');
                if (adminMain) adminMain.classList.remove('hidden');
                setTimeout(loadAdminData, 500);
            } else if (sessionStorage.getItem('isAdmin') === 'true') {
                // Fallback for current session if firebase auth is still initializing
                document.getElementById('loginOverlay').style.display = 'none';
                const adminSide = document.getElementById('adminSide');
                const adminMain = document.getElementById('adminMain');
                if (adminSide) adminSide.classList.remove('hidden');
                if (adminMain) adminMain.classList.remove('hidden');
                setTimeout(loadAdminData, 500);
            } else {
                document.getElementById('loginOverlay').style.display = 'flex';
                const adminSide = document.getElementById('adminSide');
                const adminMain = document.getElementById('adminMain');
                if (adminSide) adminSide.classList.add('hidden');
                if (adminMain) adminMain.classList.add('hidden');
            }
        });`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync('admin.html', content);
console.log("Init block cleaned");
