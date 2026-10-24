import re

new_config = """const firebaseConfig = {
            apiKey: "AIzaSyC878o1n0SvLsoRwWgDzhE5iwJ6jEClKD8",
            authDomain: "asu-classes-d11fc.firebaseapp.com",
            databaseURL: "https://asu-classes-d11fc-default-rtdb.firebaseio.com",
            projectId: "asu-classes-d11fc",
            storageBucket: "asu-classes-d11fc.firebasestorage.app",
            messagingSenderId: "56899266681",
            appId: "1:56899266681:web:251913bc0e4d5ab535cca8"
        };"""

for filename in ['index.html', 'admin.html']:
    with open(filename, 'r', encoding='utf-8') as f:
        text = f.read()
    
    # Replace using regex to match the old block
    text = re.sub(r'const firebaseConfig\s*=\s*\{[^\}]+\};', new_config, text)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f"Updated {filename}")
