const fs = require('fs');

// 1. Update index.html to store `amount` in payment_requests
let indexHtml = fs.readFileSync('index.html', 'utf8');

const oldCheckPending = `                    fb.push(fb.ref(db, 'payment_requests'), {
                        courseId: pendingCourseId,
                        courseName: pendingCourseName || 'Unknown Course',
                        userId: currentUser.uid,
                        userName: userData ? userData.name : 'Unknown',
                        userPhone: userData ? userData.phone : 'Unknown',
                        txnId: txn,
                        status: 'Approved',
                        time: Date.now(),
                        autoApproved: true,
                        gatewayReturn: true
                    })`;

const newCheckPending = `                    const targetCourse = allCoursesCached.find(c => c.id === pendingCourseId);
                    let finalAmount = 0;
                    if (targetCourse) {
                        finalAmount = targetCourse.discount > 0 ? Math.round(targetCourse.price * (1 - targetCourse.discount / 100)) : (targetCourse.price || 0);
                    }

                    fb.push(fb.ref(db, 'payment_requests'), {
                        courseId: pendingCourseId,
                        courseName: pendingCourseName || 'Unknown Course',
                        amount: finalAmount,
                        userId: currentUser.uid,
                        userName: userData ? userData.name : 'Unknown',
                        userPhone: userData ? userData.phone : 'Unknown',
                        txnId: txn,
                        status: 'Approved',
                        time: Date.now(),
                        autoApproved: true,
                        gatewayReturn: true
                    })`;

if (indexHtml.includes(oldCheckPending)) {
    indexHtml = indexHtml.replace(oldCheckPending, newCheckPending);
    console.log("Updated checkPendingPaymentReturn with amount in index.html");
}

const oldSubmitPay = `            fb.push(fb.ref(db, 'payment_requests'), {
                courseId: currentCourseId,
                courseName: document.getElementById('payCourseTitle').innerText,
                userId: currentUser.uid,
                userName: userData ? userData.name : 'Unknown',
                userPhone: userData ? userData.phone : 'Unknown',
                txnId: txn,
                status: 'Approved',
                time: Date.now(),
                autoApproved: true
            })`;

const newSubmitPay = `            const payPriceText = document.getElementById('payPrice') ? document.getElementById('payPrice').innerText : '0';
            const parsedAmount = parseFloat(payPriceText.replace(/[^0-9.]/g, '')) || 0;

            fb.push(fb.ref(db, 'payment_requests'), {
                courseId: currentCourseId,
                courseName: document.getElementById('payCourseTitle').innerText,
                amount: parsedAmount,
                userId: currentUser.uid,
                userName: userData ? userData.name : 'Unknown',
                userPhone: userData ? userData.phone : 'Unknown',
                txnId: txn,
                status: 'Approved',
                time: Date.now(),
                autoApproved: true
            })`;

if (indexHtml.includes(oldSubmitPay)) {
    indexHtml = indexHtml.replace(oldSubmitPay, newSubmitPay);
    console.log("Updated submitPayment with amount in index.html");
}

fs.writeFileSync('index.html', indexHtml);

// 2. Update admin.html for summary cards at top of Admin Panel
let adminHtml = fs.readFileSync('admin.html', 'utf8');

const oldGridHTML = `<div class="grid grid-cols-4 gap-6 mb-10">
                <div class="stat-card">
                    <p class="text-slate-400 text-[10px] uppercase tracking-widest font-black mb-2">Total Students</p>
                    <h3 class="text-3xl font-black text-slate-900" id="stat-students">0</h3>
                    <div class="mt-2 text-emerald-500 text-[10px] font-bold">+12% Growth</div>
                </div>
                <div class="stat-card">
                    <p class="text-slate-400 text-[10px] uppercase tracking-widest font-black mb-2">Active Revenue</p>
                    <h3 class="text-3xl font-black text-slate-900" id="stat-courses">0</h3>
                    <div class="mt-2 text-indigo-500 text-[10px] font-bold">Courses Live</div>
                </div>
                <div class="stat-card">
                    <p class="text-slate-400 text-[10px] uppercase tracking-widest font-black mb-2">Pending Approvals</p>
                    <h3 class="text-3xl font-black text-rose-500" id="stat-pending">0</h3>
                    <div class="mt-2 text-rose-400 text-[10px] font-bold">Verification Seed</div>
                </div>
                <div class="stat-card">
                    <p class="text-slate-400 text-[10px] uppercase tracking-widest font-black mb-2">Live Sessions</p>
                    <h3 class="text-3xl font-black text-indigo-600" id="stat-live">0</h3>
                    <div class="mt-2 text-slate-400 text-[10px] font-bold">Total Hosted</div>
                </div>
            </div>`;

const newGridHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
                <div class="stat-card bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-emerald-700 font-black text-[10px] uppercase tracking-widest">Total Revenue</p>
                        <div class="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 text-sm">
                            <i class="fa-solid fa-indian-rupee-sign"></i>
                        </div>
                    </div>
                    <h3 class="text-3xl font-black text-slate-900" id="stat-total-revenue">₹0</h3>
                    <div class="mt-2 text-emerald-600 text-[10px] font-bold">Approved Payments</div>
                </div>

                <div class="stat-card bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-indigo-700 font-black text-[10px] uppercase tracking-widest">Successful Enrollments</p>
                        <div class="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-600 text-sm">
                            <i class="fa-solid fa-graduation-cap"></i>
                        </div>
                    </div>
                    <h3 class="text-3xl font-black text-slate-900" id="stat-successful-enrollments">0</h3>
                    <div class="mt-2 text-indigo-600 text-[10px] font-bold">Verified Purchases</div>
                </div>

                <div class="stat-card">
                    <p class="text-slate-400 text-[10px] uppercase tracking-widest font-black mb-2">Total Students</p>
                    <h3 class="text-3xl font-black text-slate-900" id="stat-students">0</h3>
                    <div class="mt-2 text-emerald-500 text-[10px] font-bold">Registered Users</div>
                </div>

                <div class="stat-card">
                    <p class="text-slate-400 text-[10px] uppercase tracking-widest font-black mb-2">Active Courses</p>
                    <h3 class="text-3xl font-black text-slate-900" id="stat-courses">0</h3>
                    <div class="mt-2 text-indigo-500 text-[10px] font-bold">Courses Live</div>
                </div>

                <div class="stat-card">
                    <p class="text-slate-400 text-[10px] uppercase tracking-widest font-black mb-2">Pending Approvals</p>
                    <h3 class="text-3xl font-black text-rose-500" id="stat-pending">0</h3>
                    <div class="mt-2 text-rose-400 text-[10px] font-bold">Action Needed</div>
                </div>
            </div>`;

if (adminHtml.includes(oldGridHTML)) {
    adminHtml = adminHtml.replace(oldGridHTML, newGridHTML);
    console.log("Updated admin grid HTML");
}

fs.writeFileSync('admin.html', adminHtml);
