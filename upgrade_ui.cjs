const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Upgrade openEditProfile & updateProfile JS functions
const oldEditProfile = `function openEditProfile() { if (!userData) return; document.getElementById('editName').value = userData.name || ''; document.getElementById('editGender').value = userData.gender || 'Male'; document.getElementById('editAge').value = userData.age || ''; document.getElementById('editEmail').value = userData.email || ''; document.getElementById('editPhone').value = userData.phone || ''; const modal = document.getElementById('editProfileModal'); modal.classList.remove('hidden'); modal.classList.add('flex'); } window.openEditProfile = openEditProfile; function closeEditProfile() { const modal = document.getElementById('editProfileModal'); modal.classList.add('hidden'); modal.classList.remove('flex'); } window.closeEditProfile = closeEditProfile; async function updateProfile() { const name = document.getElementById('editName').value.trim(); const gender = document.getElementById('editGender').value; const age = document.getElementById('editAge').value; const email = document.getElementById('editEmail').value.trim(); const phone = document.getElementById('editPhone').value.trim(); if (!name || !gender || !age || !phone) { alert("Please fill all mandatory fields (Name, Gender, Age, Phone)"); return; } const btn = document.getElementById('updateProfileBtn'); const originalText = btn.innerText; btn.innerText = "Saving..."; btn.disabled = true; try { // Keep existing fields like purchased, role, etc. const updatedData = { ...userData, name, gender, age, email, phone, lastModified: Date.now() }; if (currentUser && currentUser.isDemo) { localStorage.setItem('demo_profile', JSON.stringify(updatedData)); } else { await fb.update(fb.ref(db, 'users/' + currentUser.uid), updatedData); } userData = updatedData; // Refresh UI text const safeSetText = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; }; safeSetText('profileName', userData.name); safeSetText('profilePhone', userData.phone || ''); safeSetText('profileGender', userData.gender || 'Not set'); safeSetText('profileAge', userData.age || ''); safeSetText('profileEmail', userData.email || 'Not provided'); const initial = userData.name.charAt(0).toUpperCase(); safeSetText('userAvatar', initial); safeSetText('profileAvatar', initial); safeSetText('sidebarUserName', userData.name); safeSetText('sidebarUserPhone', userData.phone || ''); safeSetText('sidebarAvatar', initial); closeEditProfile(); showToast("Profile Updated Successfully!"); } catch (e) { alert("Error updating profile: " + e.message); } finally { btn.innerText = originalText; btn.disabled = false; } } window.updateProfile = updateProfile;`;

// Let's check how openEditProfile is currently written in index.html and replace it carefully.
const newEditProfileJS = `        function openEditProfile() {
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

                if (currentUser && currentUser.isDemo) {
                    localStorage.setItem('demo_profile', JSON.stringify(updatedData));
                } else if (currentUser && currentUser.uid && window.fb && window.db) {
                    try {
                        await fb.update(fb.ref(db, 'users/' + currentUser.uid), updatedData);
                    } catch (fbErr) {
                        console.warn("Firebase save failed, falling back to local storage:", fbErr);
                        localStorage.setItem('user_profile_' + currentUser.uid, JSON.stringify(updatedData));
                    }
                } else {
                    localStorage.setItem('demo_profile', JSON.stringify(updatedData));
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
        window.updateProfile = updateProfile;`;

// Replace in html
const openEditIdx = html.indexOf('function openEditProfile()');
const updateProfileEndIdx = html.indexOf('window.updateProfile = updateProfile;');

if (openEditIdx !== -1 && updateProfileEndIdx !== -1) {
    html = html.substring(0, openEditIdx) + newEditProfileJS + html.substring(updateProfileEndIdx + 'window.updateProfile = updateProfile;'.length);
}

// 2. Add custom CSS styles for Coursera/Stripe/Google Blue & White theme
const customStyles = `
        /* Professional Blue & White Education Theme */
        .btn-indigo, .btn-blue {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: #ffffff;
            font-weight: 700;
            border-radius: 14px;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-indigo:hover, .btn-blue:hover {
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
            transform: translateY(-1px);
        }
        .btn-indigo:active, .btn-blue:active {
            transform: scale(0.98);
        }
        
        /* Input & Select fields */
        input:not([type="checkbox"]):not([type="radio"]), select, textarea {
            background-color: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            color: #0f172a !important;
            border-radius: 12px !important;
            transition: all 0.2s ease !important;
        }
        input:focus, select:focus, textarea:focus {
            border-color: #2563eb !important;
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12) !important;
            outline: none !important;
        }
        .dark input:not([type="checkbox"]):not([type="radio"]), .dark select, .dark textarea {
            background-color: #1e293b !important;
            border-color: #334155 !important;
            color: #f8fafc !important;
        }
        .dark input:focus, .dark select:focus, .dark textarea:focus {
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2) !important;
        }
`;

if (html.includes('</style>')) {
    html = html.replace('</style>', customStyles + '\n    </style>');
}

fs.writeFileSync('index.html', html);
console.log("Upgrade script completed successfully!");
