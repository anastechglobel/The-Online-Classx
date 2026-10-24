import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Add the external button HTML
html_old = '''<div class="flex items-center gap-3">
                <div class="tanu-logo-circle bg-indigo-600 border-indigo-200 uppercase text-white font-black text-[7px] leading-tight flex items-center justify-center text-center">ASU<br>CLASSES</div>
            </div>'''
html_new = '''<div class="flex items-center gap-3">
                <button id="pdfExternalBtn" class="hidden text-[10px] bg-indigo-50 text-indigo-600 font-black px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"><i class="fa-solid fa-external-link-alt mr-1"></i> OPEN</button>
                <div class="tanu-logo-circle bg-indigo-600 border-indigo-200 uppercase text-white font-black text-[7px] leading-tight flex items-center justify-center text-center">ASU<br>CLASSES</div>
            </div>'''
if html_old in text:
    text = text.replace(html_old, html_new)

# Update viewPdf function
js_old = '''        function viewPdf(url, title, isVideo = false) {
            safeSetText('pdfTitle', title);
            const viewer = isVideo ? url : `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`;
            safeSetSrc('pdfFrame', viewer);
            safeSetStyle('pdfViewerContainer', 'display', 'block');
        }'''
js_new = '''        function viewPdf(url, title, isVideo = false) {
            safeSetText('pdfTitle', title);
            
            let viewer = url;
            if (!isVideo) {
                if (url.includes('drive.google.com')) {
                    viewer = url.replace(/\/view.*$/, '/preview');
                } else {
                    viewer = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
                }
            }
            safeSetSrc('pdfFrame', viewer);
            safeSetStyle('pdfViewerContainer', 'display', 'block');
            
            const extBtn = document.getElementById('pdfExternalBtn');
            if (extBtn) {
                if (!isVideo) {
                    extBtn.classList.remove('hidden');
                    extBtn.onclick = () => window.open(url, '_blank');
                } else {
                    extBtn.classList.add('hidden');
                }
            }
        }'''
if js_old in text:
    text = text.replace(js_old, js_new)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done fixing PDF Viewer")
