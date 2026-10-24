const fs = require('fs');

let adminHtml = fs.readFileSync('admin.html', 'utf8');

// Update global CSS in admin
const oldCss = `        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f8fafc; }
        .card-admin { background: white; border-radius: 24px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }`;
const newCss = `        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f4f7f9; }
        .card-admin { background: white; border-radius: 24px; padding: 32px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.02); transition: all 0.3s ease; }
        .card-admin:hover { box-shadow: 0 15px 50px -10px rgba(0,0,0,0.06); }
        .admin-header { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(0,0,0,0.05); }`;

if (adminHtml.includes(oldCss)) {
    adminHtml = adminHtml.replace(oldCss, newCss);
    console.log("Updated admin card CSS");
}

// Update table CSS for a cleaner look
const oldTableCss = `        th { background: #f8fafc; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; font-weight: 900; padding: 12px 16px; text-align: left; }
        td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }`;
const newTableCss = `        th { background: #f8fafc; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 800; padding: 16px 20px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        td { padding: 20px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; font-weight: 500; }
        tr:hover td { background: #f8fafc; }`;

if (adminHtml.includes(oldTableCss)) {
    adminHtml = adminHtml.replace(oldTableCss, newTableCss);
    console.log("Updated admin table CSS");
}

fs.writeFileSync('admin.html', adminHtml);
