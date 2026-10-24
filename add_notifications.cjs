const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

// 1. Add Notifications tab link
const navRegex = /<a href="javascript:void\(0\)" onclick="switchTab\('settings'\)" class="nav-link" id="nav-settings">/;
if (navRegex.test(html) && !html.includes("nav-notifications")) {
    html = html.replace(navRegex, `<a href="javascript:void(0)" onclick="switchTab('notifications')" class="nav-link" id="nav-notifications"><i class="fa-solid fa-bell"></i> Notifications</a>\n            $&`);
}

// 2. Add tab-notifications section before tab-settings
const tabRegex = /<section id="tab-settings" class="tab-content">/;
if (tabRegex.test(html) && !html.includes('id="tab-notifications"')) {
    html = html.replace(tabRegex, `
        <section id="tab-notifications" class="tab-content">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-2xl font-black text-slate-800">Send Notification</h2>
                    <p class="text-slate-500">Send text notifications to all users' panels</p>
                </div>
            </div>
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-2xl">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Notification Title</label>
                        <input type="text" id="notifTitle" class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. System Update">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Notification Message</label>
                        <textarea id="notifMessage" rows="3" class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Message content"></textarea>
                    </div>
                    <button onclick="sendManualNotification()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-xl transition-colors">Send Notification</button>
                </div>
            </div>
            <div class="mt-8 max-w-2xl">
                <h3 class="text-xl font-bold text-slate-800 mb-4">Recent Sent Notifications</h3>
                <div id="adminNotificationsList" class="space-y-4"></div>
            </div>
        </section>
        $&`);
}

// 3. Inject scripts
const scriptInjection = `
        function sendGlobalNotification(title, message, type, linkId) {
            const db = window.fbDb;
            if(!db) return;
            const nRef = fb.push(fb.ref(db, 'notifications'));
            fb.set(nRef, {
                title,
                message,
                type,
                linkId: linkId || '',
                timestamp: Date.now()
            });
        }
        window.sendGlobalNotification = sendGlobalNotification;

        function sendManualNotification() {
            const title = document.getElementById('notifTitle').value.trim();
            const message = document.getElementById('notifMessage').value.trim();
            if(!title || !message) return alert('Title and message required');
            sendGlobalNotification(title, message, 'manual', '');
            document.getElementById('notifTitle').value = '';
            document.getElementById('notifMessage').value = '';
            if (typeof showToast === 'function') showToast('Notification Sent!');
        }
        window.sendManualNotification = sendManualNotification;

        // Load admin notifications
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                const db = window.fbDb;
                if(db) {
                    const q = fb.query(fb.ref(db, 'notifications'), fb.orderByChild('timestamp'), fb.limitToLast(20));
                    fb.onValue(q, (snapshot) => {
                        const list = document.getElementById('adminNotificationsList');
                        if(!list) return;
                        list.innerHTML = '';
                        if(!snapshot.exists()) {
                            list.innerHTML = '<div class="text-slate-500">No notifications sent yet.</div>';
                            return;
                        }
                        let items = [];
                        snapshot.forEach(c => { items.push(c.val()); });
                        items.reverse().forEach(n => {
                            const div = document.createElement('div');
                            div.className = 'p-4 bg-slate-50 border border-slate-100 rounded-xl';
                            div.innerHTML = \`<div class="font-bold text-slate-800">\${n.title}</div><div class="text-sm text-slate-600 mt-1">\${n.message}</div><div class="text-xs text-slate-400 mt-2">\${new Date(n.timestamp).toLocaleString()} • Type: \${n.type}</div>\`;
                            list.appendChild(div);
                        });
                    });
                }
            }, 2000);
        });
`;

if (!html.includes('sendGlobalNotification')) {
    html = html.replace('</script>', scriptInjection + '\n</script>');
}

// 4. Update the push operations to send notification
html = html.replace(/fb\.push\(fb\.ref\(db, 'courses'\), courseData\)\.then\(\(\) => \{/g, 
    "fb.push(fb.ref(db, 'courses'), courseData).then((ref) => { if(typeof sendGlobalNotification === 'function') sendGlobalNotification(`New Course: ${title}`, `A new course has been published.`, 'course', ref.key);");

html = html.replace(/fb\.push\(fb\.ref\(db, 'notes'\), noteData\)\.then\(\(\) => \{/g, 
    "fb.push(fb.ref(db, 'notes'), noteData).then((ref) => { if(typeof sendGlobalNotification === 'function') sendGlobalNotification(`New Notes Added: ${title}`, `Study material has been added.`, 'notes', ref.key);");

html = html.replace(/fb\.push\(fb\.ref\(db, 'tests'\), testData\)\.then\(\(ref\) => \{/g, 
    "fb.push(fb.ref(db, 'tests'), testData).then((ref) => { if(typeof sendGlobalNotification === 'function') sendGlobalNotification(`New Test Series: ${testData.title}`, `A new test has been published.`, 'test', ref.key);");

// live - there are two, live and upcoming_courses
html = html.replace(/fb\.push\(fb\.ref\(db, 'live'\), data\)\.then\(\(\) => \{/g, 
    "fb.push(fb.ref(db, 'live'), data).then((ref) => { if(typeof sendGlobalNotification === 'function') sendGlobalNotification(`New Live Class: ${data.title}`, `A live session has been scheduled.`, 'live', ref.key);");

html = html.replace(/fb\.push\(fb\.ref\(db, 'tests'\), data\)\.then\(\(\) => \{/g, 
    "fb.push(fb.ref(db, 'tests'), data).then((ref) => { if(typeof sendGlobalNotification === 'function') sendGlobalNotification(`New Test: ${data.title}`, `A test has been added.`, 'test', ref.key);");

fs.writeFileSync('admin.html', html);
console.log("admin.html modified for notifications");
