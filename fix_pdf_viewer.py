import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix pdfViewerContainer classes
old_div = '<div id="pdfViewerContainer" class="flex flex-col">'
new_div = '<div id="pdfViewerContainer" class="fixed inset-0 z-[1000] bg-white hidden flex-col">'
text = text.replace(old_div, new_div)

# Fix viewPdf and closePdf
old_js = '''        function viewPdf(url, title, isVideo = false) {
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
            safeSetStyle('pdfViewerContainer', 'display', 'block');'''

new_js = '''        function viewPdf(url, title, isVideo = false) {
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
            safeSetStyle('pdfViewerContainer', 'display', 'flex');'''
text = text.replace(old_js, new_js)

old_close = '''        function closePdf() {
            safeSetStyle('pdfViewerContainer', 'display', 'none');
            safeSetSrc('pdfFrame', '');
        }'''
new_close = '''        function closePdf() {
            safeSetStyle('pdfViewerContainer', 'display', 'none');
            safeSetSrc('pdfFrame', '');
        }'''
text = text.replace(old_close, new_close)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("Fixed pdf viewer container")
