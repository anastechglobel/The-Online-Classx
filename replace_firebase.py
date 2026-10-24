import re

new_config = '''const firebaseConfig = {
            apiKey: "AIzaSyAFtiPuioc9DLmoG9ZjKiD1hnpVNeyXmWw",
            authDomain: "su-testes.firebaseapp.com",
            databaseURL: "https://su-testes-default-rtdb.firebaseio.com",
            projectId: "su-testes",
            storageBucket: "su-testes.firebasestorage.app",
            messagingSenderId: "715775903090",
            appId: "1:715775903090:web:e998c0339e851d1981c9eb"
        };'''

for filename in ['index.html', 'admin.html']:
    with open(filename, 'r') as f:
        content = f.read()

    pattern = r'const firebaseConfig = \{.*?\};'
    
    new_content = re.sub(pattern, new_config, content, flags=re.DOTALL)

    with open(filename, 'w') as f:
        f.write(new_content)
    
    print(f"Updated {filename}")
