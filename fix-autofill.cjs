const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const replacement = `        input:focus, select:focus, textarea:focus {
            background: #ffffff;
            border-color: #4f46e5;
            box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }
        
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px #f8fafc inset !important;
            -webkit-text-fill-color: #1e293b !important;
            transition: background-color 5000s ease-in-out 0s;
        }
        .dark input:-webkit-autofill,
        .dark input:-webkit-autofill:hover, 
        .dark input:-webkit-autofill:focus, 
        .dark input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px #1e293b inset !important;
            -webkit-text-fill-color: #f8fafc !important;
            transition: background-color 5000s ease-in-out 0s;
        }`;
html = html.replace(/        input:focus, select:focus, textarea:focus \{\n            background: #ffffff;\n            border-color: #4f46e5;\n            box-shadow: 0 0 0 4px rgba\(79, 70, 229, 0\.1\);\n        \}/, replacement);
fs.writeFileSync('index.html', html);
