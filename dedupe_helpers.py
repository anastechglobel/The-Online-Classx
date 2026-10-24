with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()

import re

for fn in ["safeSetValue", "safeSetText", "safeClassAdd", "safeClassRemove", "isItemFree"]:
    matches = list(re.finditer(r'function\s+' + fn + r'\s*\(', text))
    if len(matches) > 1:
        print(f"Found {len(matches)} declarations of {fn}, removing extra ones...")
        # Keep the first, remove subsequent ones up to the closing brace
        for m in reversed(matches[1:]):
            start = m.start()
            end = text.find('}', start) + 1
            text = text[:start] + text[end:]

with open("index.html", "w", encoding="utf-8") as f:
    f.write(text)

print("Deduplicated helpers in index.html")
