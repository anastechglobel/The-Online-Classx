const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Remove demo button
html = html.replace(/<button onclick="loginAsDemo\(\)".*?>\s*<i.*?><\/i>.*?<\/button>/g, '');

// Remove loginAsDemo function
const funcMatch = html.match(/function loginAsDemo\(\) \{[\s\S]*?\}/);
if (funcMatch) {
    html = html.replace(funcMatch[0], '');
}
html = html.replace(/window\.loginAsDemo = loginAsDemo;/g, '');

// Clean up demo user persistence checks on load
const demoLoadMatch = html.match(/\/\/ CHECK PERSISTENT DEMO LOGIN ON LOAD[\s\S]*?const savedDemo = localStorage\.getItem\('demo_user'\);[\s\S]*?if \(savedDemo\) \{[\s\S]*?try \{[\s\S]*?currentUser = JSON\.parse\(savedDemo\);[\s\S]*?\} catch\(e\) \{ localStorage\.removeItem\('demo_user'\); \}[\s\S]*?\}/);
if (demoLoadMatch) {
    html = html.replace(demoLoadMatch[0], '');
}

// Clean up onAuthStateChanged demo logic
html = html.replace(/localStorage\.removeItem\('demo_user'\); \/\/ Clear demo if real login found/g, '');

const onAuthDemoBlock = `                // Try restore demo session
                const savedDemo = localStorage.getItem('demo_user');
                if (savedDemo) {
                    try {
                        currentUser = JSON.parse(savedDemo);
                        console.log("Persistence: Demo user restored", currentUser.uid);
                        checkUserProfile();
                    } catch (e) {
                        localStorage.removeItem('demo_user');
                        showAuth();
                    }
                } else {
                    showAuth();
                }`;
if (html.includes(onAuthDemoBlock)) {
    html = html.replace(onAuthDemoBlock, '                showAuth();');
}

// Clean up save profile demo logic
const saveProfileDemoBlock = `                if (currentUser && currentUser.isDemo) {
                    localStorage.setItem('demo_profile', JSON.stringify(profile));
                } else {
                    await fb.set(fb.ref(db, 'users/' + currentUser.uid), profile);
                }`;
if (html.includes(saveProfileDemoBlock)) {
    html = html.replace(saveProfileDemoBlock, `                if (currentUser && currentUser.uid) {
                    await fb.set(fb.ref(db, 'users/' + currentUser.uid), profile);
                }`);
}

// Clean up checkUserProfile demo logic
const checkProfileDemoBlock = `            if (currentUser && currentUser.isDemo) {
                console.log("Demo user detected, using local storage for profile.");
                const saved = localStorage.getItem('demo_profile');
                if (saved) {
                    handleProfileData(JSON.parse(saved), currentUser.uid);
                } else {
                    showProfileSetup();
                }
            } else `;
if (html.includes(checkProfileDemoBlock)) {
    html = html.replace(checkProfileDemoBlock, '');
}

// Clean up handleProfileData update demo logic
const updateDemoBlock = `                if (currentUser && currentUser.isDemo) {
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
                }`;
if (html.includes(updateDemoBlock)) {
    html = html.replace(updateDemoBlock, `                if (currentUser && currentUser.uid && window.fb && window.db) {
                    try {
                        await fb.update(fb.ref(db, 'users/' + currentUser.uid), updatedData);
                    } catch (fbErr) {
                        console.warn("Firebase save failed, falling back to local storage:", fbErr);
                        localStorage.setItem('user_profile_' + currentUser.uid, JSON.stringify(updatedData));
                    }
                }`);
}

fs.writeFileSync('index.html', html);
console.log('Demo login removed');
