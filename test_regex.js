const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const notifBtnRegex = /<button onclick="navigateTo\('notifications'\)"[^>]*>[\s\S]*?<\/button>/;
const profileNotifRegex = /<div class="flex justify-between items-center[^>]*mt-6"[^>]*>[\s\S]*?<span class="font-bold[^>]*>Push Notifications<\/span>[\s\S]*?<\/div>/;
const pageNotifRegex = /<div id="page-notifications" class="page px-5">[\s\S]*?<\/div>\s*<\/main>/;

console.log("Header Button match:", !!html.match(notifBtnRegex));
console.log("Profile Notif match:", !!html.match(profileNotifRegex));
console.log("Page Notif match:", !!html.match(pageNotifRegex));

