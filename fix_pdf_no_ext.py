import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Remove the external button HTML
html_old = '''                <button id="pdfExternalBtn" class="hidden text-[10px] bg-indigo-50 text-indigo-600 font-black px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"><i class="fa-solid fa-external-link-alt mr-1"></i> OPEN</button>
                <div class="tanu-logo-circle bg-indigo-600 border-indigo-200 uppercase text-white font-black text-[7px] leading-tight flex items-center justify-center text-center">ASU<br>CLASSES</div>'''
html_new = '''                <div class="tanu-logo-circle bg-indigo-600 border-indigo-200 uppercase text-white font-black text-[7px] leading-tight flex items-center justify-center text-center">ASU<br>CLASSES</div>'''
if html_old in text:
    text = text.replace(html_old, html_new)

js_old = '''            const extBtn = document.getElementById('pdfExternalBtn');
            if (extBtn) {
                if (!isVideo) {
                    extBtn.classList.remove('hidden');
                    extBtn.onclick = () => window.open(url, '_blank');
                } else {
                    extBtn.classList.add('hidden');
                }
            }'''
if js_old in text:
    text = text.replace(js_old, '')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("Removed external button")
