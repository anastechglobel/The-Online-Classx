with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()
import sys

idx = text.find('<div onclick="${hasAccess ?')
if idx != -1:
    print(text[idx-50:idx+200])
else:
    print('Not found')
