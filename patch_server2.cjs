const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
    "const baseUrl = new URL(originUrl).origin;",
    "const appBaseUrl = new URL(originUrl).origin;"
).replace(
    "const secureBaseUrl = baseUrl.startsWith('http://localhost') ? baseUrl.replace('http://', 'https://') : (baseUrl.startsWith('http://') ? baseUrl.replace('http://', 'https://') : baseUrl);",
    "const secureBaseUrl = appBaseUrl.startsWith('http://localhost') ? appBaseUrl.replace('http://', 'https://') : (appBaseUrl.startsWith('http://') ? appBaseUrl.replace('http://', 'https://') : appBaseUrl);"
);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts correctly");
