const fs = require('fs');

let adminHtml = fs.readFileSync('admin.html', 'utf8');

// Declare global coursesMap
if (!adminHtml.includes('let coursesMap = {};')) {
    adminHtml = adminHtml.replace('let coursesList = [];', 'let coursesList = [];\n        let coursesMap = {};');
}

// Populate coursesMap in courses listener
const oldCoursesLoop = `coursesList = [];
                snap.forEach(child => {
                    const c = child.val();
                    const id = child.key;
                    coursesList.push({id, title: c.title});`;

const newCoursesLoop = `coursesList = [];
                coursesMap = {};
                snap.forEach(child => {
                    const c = child.val();
                    const id = child.key;
                    coursesList.push({id, title: c.title});
                    coursesMap[id] = c;`;

if (adminHtml.includes(oldCoursesLoop)) {
    adminHtml = adminHtml.replace(oldCoursesLoop, newCoursesLoop);
    console.log("Updated coursesMap population");
}

// Update payment_requests listener logic
const oldPaymentListener = `            // Payments
            fb.onValue(fb.ref(db, 'payment_requests'), snap => {
                let pending = 0;
                const table = document.getElementById('paymentsTableBody');
                const latest = document.getElementById('latestPayments');
                if (!table || !latest) return;
                
                table.innerHTML = '';
                latest.innerHTML = '';
                let count = 0;
                snap.forEach(child => {
                    const p = child.val();
                    const id = child.key;
                    if (p.status === 'Pending') pending++;`;

const newPaymentListener = `            // Payments
            fb.onValue(fb.ref(db, 'payment_requests'), snap => {
                let pending = 0;
                let totalRevenue = 0;
                let successfulEnrollments = 0;

                const table = document.getElementById('paymentsTableBody');
                const latest = document.getElementById('latestPayments');
                if (!table || !latest) return;
                
                table.innerHTML = '';
                latest.innerHTML = '';
                let count = 0;
                snap.forEach(child => {
                    const p = child.val();
                    const id = child.key;

                    if (p.status === 'Approved') {
                        successfulEnrollments++;
                        if (p.amount !== undefined && p.amount !== null && !isNaN(Number(p.amount)) && Number(p.amount) > 0) {
                            totalRevenue += Number(p.amount);
                        } else if (p.courseId && coursesMap[p.courseId]) {
                            const c = coursesMap[p.courseId];
                            const price = (c.discount && c.discount > 0) ? Math.round(c.price * (1 - c.discount / 100)) : (Number(c.price) || 0);
                            totalRevenue += price;
                        }
                    } else if (p.status === 'Pending') {
                        pending++;
                    }`;

if (adminHtml.includes(oldPaymentListener)) {
    adminHtml = adminHtml.replace(oldPaymentListener, newPaymentListener);
    console.log("Updated payment_requests listener start");
}

// Add stats DOM updates at end of payment_requests listener
const oldPaymentEnd = `                const statPending = document.getElementById('stat-pending');
                if (statPending) statPending.innerText = pending;`;

const newPaymentEnd = `                const statRev = document.getElementById('stat-total-revenue');
                if (statRev) statRev.innerText = '₹' + totalRevenue.toLocaleString('en-IN');

                const statEnroll = document.getElementById('stat-successful-enrollments');
                if (statEnroll) statEnroll.innerText = successfulEnrollments;

                const statPending = document.getElementById('stat-pending');
                if (statPending) statPending.innerText = pending;`;

if (adminHtml.includes(oldPaymentEnd)) {
    adminHtml = adminHtml.replace(oldPaymentEnd, newPaymentEnd);
    console.log("Updated payment_requests listener stat DOM updates");
}

fs.writeFileSync('admin.html', adminHtml);
