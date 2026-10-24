import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Add a blocker div to hide the popout button
old_iframe = '<iframe id="pdfFrame" src="" class="w-full flex-1 border-none" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>'
new_iframe = '''<div class="relative w-full flex-1 flex flex-col">
            <!-- Blocker overlay to hide the popout button in Google Docs Viewer -->
            <div id="pdfPopoutBlocker" class="absolute top-0 right-0 w-[60px] h-[60px] bg-transparent z-10"></div>
            <iframe id="pdfFrame" src="" class="w-full h-full border-none" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>'''
text = text.replace(old_iframe, new_iframe)

# Update viewPdf to show/hide the blocker depending on if it's a PDF (not video)
old_js = '''            safeSetSrc('pdfFrame', viewer);
            safeSetStyle('pdfViewerContainer', 'display', 'flex');'''
new_js = '''            safeSetSrc('pdfFrame', viewer);
            safeSetStyle('pdfViewerContainer', 'display', 'flex');
            
            const blocker = document.getElementById('pdfPopoutBlocker');
            if (blocker) {
                if (isVideo) {
                    blocker.style.display = 'none';
                } else {
                    blocker.style.display = 'block';
                }
            }'''
text = text.replace(old_js, new_js)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("Added pdf popout blocker")
