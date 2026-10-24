const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf8');

// 1. Include canvas-confetti CDN in head if not already there
if (!indexHtml.includes('confetti.browser.min.js')) {
    indexHtml = indexHtml.replace(
        '</head>',
        '    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>\n</head>'
    );
    console.log("Added canvas-confetti CDN script to head");
}

// 2. Add triggerPaymentConfetti function to script
const confettiFunction = `
        function triggerPaymentConfetti() {
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 120,
                    spread: 80,
                    origin: { y: 0.6 }
                });
                setTimeout(() => {
                    confetti({
                        particleCount: 60,
                        angle: 60,
                        spread: 60,
                        origin: { x: 0 }
                    });
                    confetti({
                        particleCount: 60,
                        angle: 120,
                        spread: 60,
                        origin: { x: 1 }
                    });
                }, 200);
            }
        }
`;

if (!indexHtml.includes('triggerPaymentConfetti')) {
    indexHtml = indexHtml.replace(
        'function submitPayment()',
        confettiFunction + '\n        function submitPayment()'
    );
    console.log("Added triggerPaymentConfetti function");
}

// 3. Call triggerPaymentConfetti() inside submitPayment
const submitPaySuccessOld = `showToast("Payment Verified Automatically. Access Granted!");
                document.getElementById('paymentFormBody').classList.add('hidden');
                document.getElementById('paymentSuccessBody').classList.remove('hidden');`;

const submitPaySuccessNew = `showToast("Payment Verified Automatically. Access Granted!");
                document.getElementById('paymentFormBody').classList.add('hidden');
                document.getElementById('paymentSuccessBody').classList.remove('hidden');
                triggerPaymentConfetti();`;

if (indexHtml.includes(submitPaySuccessOld)) {
    indexHtml = indexHtml.replace(submitPaySuccessOld, submitPaySuccessNew);
    console.log("Updated submitPayment to trigger confetti");
}

// 4. Call triggerPaymentConfetti() in checkPendingPaymentReturn
const autoVerifyOld = `showToast("Payment Verified Successfully! Access Granted.");`;
const autoVerifyNew = `showToast("Payment Verified Successfully! Access Granted.");
                        triggerPaymentConfetti();`;

if (indexHtml.includes(autoVerifyOld)) {
    indexHtml = indexHtml.replace(autoVerifyOld, autoVerifyNew);
    console.log("Updated checkPendingPaymentReturn to trigger confetti");
}

// 5. Upgrade paymentSuccessBody visual styling
const oldPaymentSuccessBody = `<div id="paymentSuccessBody" class="hidden text-center py-10">
                <div class="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-3xl text-emerald-500 mx-auto mb-6">
                    <i class="fa-solid fa-clock"></i>
                </div>
                <h3 class="text-2xl font-black text-white mb-2 tracking-tighter">Enrollment Pending</h3>
                <p class="text-slate-400 mb-8 font-medium text-sm">Thank you for submitting your payment. Our admins will verify the transaction and activate your course shortly.</p>`;

const newPaymentSuccessBody = `<div id="paymentSuccessBody" class="hidden text-center py-10">
                <div class="relative w-24 h-24 mx-auto mb-6">
                    <div class="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
                    <div class="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-4xl text-white shadow-2xl shadow-emerald-500/50 transform hover:scale-105 transition-all">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>
                </div>
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest mb-3">
                    <i class="fa-solid fa-sparkles"></i> Payment Success
                </div>
                <h3 class="text-2xl font-black text-white mb-2 tracking-tighter">Enrollment Approved!</h3>
                <p class="text-slate-300 mb-8 font-medium text-sm">Congratulations! Your payment has been processed and course access is active.</p>`;

if (indexHtml.includes(oldPaymentSuccessBody)) {
    indexHtml = indexHtml.replace(oldPaymentSuccessBody, newPaymentSuccessBody);
    console.log("Upgraded paymentSuccessBody UI");
}

fs.writeFileSync('index.html', indexHtml);
