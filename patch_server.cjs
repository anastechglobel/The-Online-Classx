const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:3000';
        const returnUrl = \`\${protocol}://\${host}/?order_id=\${orderId}&course_id=\${courseId}&cf_status={param_placeholder_from_cashfree}\`;
        const notifyUrl = \`\${protocol}://\${host}/api/cashfree/webhook\`;`;

const replacementStr = `        const originUrl = req.body.origin || req.headers.origin || req.headers.referer || ('https://' + (req.headers['x-forwarded-host'] || req.get('host') || 'localhost:3000'));
        const baseUrl = new URL(originUrl).origin;
        // Cashfree strict requirement: URL MUST be https
        const secureBaseUrl = baseUrl.startsWith('http://localhost') ? baseUrl.replace('http://', 'https://') : (baseUrl.startsWith('http://') ? baseUrl.replace('http://', 'https://') : baseUrl);

        const returnUrl = \`\${secureBaseUrl}/?order_id=\${orderId}&course_id=\${courseId}&cf_status={order_id}\`;
        const notifyUrl = \`\${secureBaseUrl}/api/cashfree/webhook\`;`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts returnUrl logic");
