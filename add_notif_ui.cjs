const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const rightSideRegex = /<div class="flex items-center gap-4">\s*<\/div>\s*<\/header>/;
if (rightSideRegex.test(html)) {
    html = html.replace(rightSideRegex, `
            <div class="flex items-center gap-4">
                <button onclick="toggleNotifications()" class="relative text-slate-400 hover:text-slate-700 transition-colors">
                    <i class="fa-solid fa-bell text-xl"></i>
                    <span id="unreadNotifBadge" class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full hidden"></span>
                </button>
            </div>
        </header>
`);
}

// Ensure the modal for notifications exists
if (!html.includes('id="notifDropdown"')) {
    html = html.replace('</main>', `
            <!-- Notifications Dropdown -->
            <div id="notifDropdown" class="fixed top-20 right-6 w-80 bg-white rounded-2xl shadow-xl shadow-indigo-100/20 border border-slate-100 z-50 hidden flex-col max-h-[70vh] overflow-hidden">
                <div class="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 class="font-bold text-slate-800">Notifications</h3>
                    <button onclick="markAllRead()" class="text-xs text-indigo-600 font-medium">Mark all read</button>
                </div>
                <div id="notifList" class="overflow-y-auto flex-1 p-2 space-y-1">
                    <div class="text-center p-4 text-slate-400 text-sm">No new notifications</div>
                </div>
            </div>
        </main>
`);
}

const jsInjection = `
        let notificationsData = [];
        let readNotifications = JSON.parse(localStorage.getItem('readNotifs') || '[]');

        function toggleNotifications() {
            const dropdown = document.getElementById('notifDropdown');
            if(dropdown) {
                dropdown.classList.toggle('hidden');
                dropdown.classList.toggle('flex');
            }
        }
        window.toggleNotifications = toggleNotifications;

        function markAllRead() {
            notificationsData.forEach(n => {
                if(!readNotifications.includes(n.id)) {
                    readNotifications.push(n.id);
                }
            });
            localStorage.setItem('readNotifs', JSON.stringify(readNotifications));
            updateNotifBadge();
            renderNotifications();
        }
        window.markAllRead = markAllRead;

        function updateNotifBadge() {
            const unread = notificationsData.filter(n => !readNotifications.includes(n.id)).length;
            const badge = document.getElementById('unreadNotifBadge');
            if(badge) {
                if(unread > 0) badge.classList.remove('hidden');
                else badge.classList.add('hidden');
            }
        }

        function renderNotifications() {
            const list = document.getElementById('notifList');
            if(!list) return;
            list.innerHTML = '';
            if(notificationsData.length === 0) {
                list.innerHTML = '<div class="text-center p-4 text-slate-400 text-sm">No new notifications</div>';
                return;
            }
            notificationsData.forEach(n => {
                const isRead = readNotifications.includes(n.id);
                const div = document.createElement('div');
                div.className = \`p-3 rounded-xl cursor-pointer transition-colors \${isRead ? 'opacity-70 hover:bg-slate-50' : 'bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/50'}\`;
                div.onclick = () => {
                    if(!isRead) {
                        readNotifications.push(n.id);
                        localStorage.setItem('readNotifs', JSON.stringify(readNotifications));
                        updateNotifBadge();
                        renderNotifications();
                    }
                    if(n.linkId) {
                        toggleNotifications();
                        // Depending on type, could navigate, here we just show details
                        if(n.type === 'course') showCourseDetail(n.linkId);
                        else if(n.type === 'notes') openNotesPDF(n.linkId);
                        else if(n.type === 'test') { document.getElementById('bottomNav').classList.remove('hidden'); loadTestData(); switchPage('testSeries', document.getElementById('nav-test')); }
                        else if(n.type === 'live') { document.getElementById('bottomNav').classList.remove('hidden'); switchPage('live', document.getElementById('nav-live')); }
                    }
                };
                div.innerHTML = \`
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 \${n.type==='course'?'bg-emerald-100 text-emerald-600':n.type==='test'?'bg-rose-100 text-rose-600':n.type==='notes'?'bg-amber-100 text-amber-600':'bg-indigo-100 text-indigo-600'}">
                            <i class="fa-solid \${n.type==='course'?'fa-graduation-cap':n.type==='test'?'fa-vial':n.type==='notes'?'fa-file-pdf':n.type==='live'?'fa-video':'fa-bell'} text-xs"></i>
                        </div>
                        <div>
                            <h4 class="text-sm font-bold \${isRead ? 'text-slate-700' : 'text-slate-900'}">\${n.title}</h4>
                            <p class="text-xs text-slate-500 mt-0.5 line-clamp-2">\${n.message}</p>
                            <span class="text-[10px] text-slate-400 mt-1 block">\${new Date(n.timestamp).toLocaleString()}</span>
                        </div>
                    </div>
                \`;
                list.appendChild(div);
            });
        }

        // Hook up to Firebase on load
        function initNotifications() {
            setTimeout(() => {
                const db = window.fbDb;
                if(!db) return;
                const q = window.fbQuery(window.fbRef(db, 'notifications'), window.fbOrderByChild('timestamp'), window.fbLimitToLast(20));
                window.fbOnValue(q, (snapshot) => {
                    notificationsData = [];
                    if(snapshot.exists()) {
                        snapshot.forEach(c => {
                            notificationsData.push({ id: c.key, ...c.val() });
                        });
                        notificationsData.reverse();
                    }
                    updateNotifBadge();
                    renderNotifications();
                });
            }, 3000);
        }
        document.addEventListener('DOMContentLoaded', initNotifications);
`;

if (!html.includes('toggleNotifications')) {
    html = html.replace('</script>', jsInjection + '\n</script>');
}

fs.writeFileSync('index.html', html);
console.log("index.html modified for UI notifications");
