const fs = require('fs');

let adminHtml = fs.readFileSync('admin.html', 'utf8');

adminHtml = adminHtml.replace(
    /\.card-admin \{([^}]+)\}/,
    '.card-admin { background: #ffffff; border-radius: 24px; padding: 32px; border: 1px solid rgba(0,0,0,0.03); box-shadow: 0 10px 40px -10px rgba(0,0,0,0.04); transition: all 0.3s ease; }\n        .card-admin:hover { box-shadow: 0 15px 50px -10px rgba(0,0,0,0.06); }'
);

adminHtml = adminHtml.replace(
    /td \{([^}]+)\}/,
    'td { padding: 20px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 500; color: #334155; }\n        tr:hover td { background: #f8fafc; }'
);

fs.writeFileSync('admin.html', adminHtml);
