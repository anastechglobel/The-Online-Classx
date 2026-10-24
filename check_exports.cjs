const fs = require('fs');
const html = fs.readFileSync('admin.html', 'utf8');

const onclicks = html.match(/onclick="([^"]+)"/g)
    .map(x => x.match(/onclick="([^"(]+)/)[1]);

const uniqueOnclicks = [...new Set(onclicks)].filter(x => !x.includes('.')); // ignore this.parent...

let missing = [];
for (let fn of uniqueOnclicks) {
    if (!html.includes('window.' + fn) && !html.includes('window["' + fn + '"]')) {
        missing.push(fn);
    }
}
console.log("Missing exports:");
console.log(missing.join('\n'));
