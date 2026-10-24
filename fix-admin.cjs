const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

const focusStyle = `        input:focus, select:focus, textarea:focus {
            background: #ffffff;
            border-color: #4f46e5;
            box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }
        .dark input:focus, .dark select:focus, .dark textarea:focus {
            background: #1e293b;
            border-color: #4f46e5;
            box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.2);
        }`;

html = html.replace(/        input:focus, select:focus, textarea:focus \{\n            background: #ffffff;\n            border-color: #4f46e5;\n            box-shadow: 0 0 0 4px rgba\(79, 70, 229, 0\.1\);\n        \}/, focusStyle);

fs.writeFileSync('admin.html', html);
