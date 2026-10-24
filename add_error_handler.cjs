const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

const errScript = `
<script>
window.addEventListener('error', function(e) {
    alert('JS Error: ' + e.message + ' at ' + e.filename + ':' + e.lineno);
});
window.addEventListener('unhandledrejection', function(e) {
    alert('Promise Error: ' + (e.reason && e.reason.message ? e.reason.message : e.reason));
});
</script>
`;

html = html.replace('<head>', '<head>' + errScript);
fs.writeFileSync('admin.html', html);
