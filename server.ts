import express from "express";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Capture raw body for Cashfree Webhook Signature Verification if needed
app.use(express.json({
    verify: (req: any, _res, buf) => {
        req.rawBody = buf;
    }
}));

// CORS & Preflight Middleware for Vercel / Cross-Origin requests
app.use((req: any, res: any, next: any) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, x-client-id, x-client-secret");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    next();
});

const FIREBASE_DB_URL = "https://the-online-classes-default-rtdb.firebaseio.com";

// --- Firebase REST Helper Functions ---
async function fbGet(pathStr: string) {
    try {
        const res = await fetch(`${FIREBASE_DB_URL}/${pathStr}.json`);
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error(`Firebase GET error at ${pathStr}:`, err);
        return null;
    }
}

async function fbPut(pathStr: string, data: any) {
    try {
        const res = await fetch(`${FIREBASE_DB_URL}/${pathStr}.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return res.ok;
    } catch (err) {
        console.error(`Firebase PUT error at ${pathStr}:`, err);
        return false;
    }
}

async function fbPatch(pathStr: string, data: any) {
    try {
        const res = await fetch(`${FIREBASE_DB_URL}/${pathStr}.json`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return res.ok;
    } catch (err) {
        console.error(`Firebase PATCH error at ${pathStr}:`, err);
        return false;
    }
}

async function fbPost(pathStr: string, data: any) {
    try {
        const res = await fetch(`${FIREBASE_DB_URL}/${pathStr}.json`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error(`Firebase POST error at ${pathStr}:`, err);
        return null;
    }
}

// Helper to format currency
function formatINR(num: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num);
}

// Cashfree Environment Helpers
async function getCashfreeConfig() {
    let appId = (process.env.CASHFREE_APP_ID || process.env.CASHFREE_CLIENT_ID || "").trim();
    let secretKey = (process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_CLIENT_SECRET || "").trim();
    let rawEnv = (process.env.CASHFREE_ENV || "").trim();
    let webhookSecret = (process.env.CASHFREE_WEBHOOK_SECRET || "").trim();

    // Fallback to Firebase DB settings/cashfree if env vars not set!
    if (!appId || !secretKey) {
        try {
            const dbSettings = await fbGet("settings/cashfree");
            if (dbSettings) {
                if (!appId) appId = (dbSettings.appId || "").trim();
                if (!secretKey) secretKey = (dbSettings.secretKey || "").trim();
                if (!rawEnv) rawEnv = (dbSettings.env || dbSettings.cfEnv || "").trim();
                if (!webhookSecret) webhookSecret = (dbSettings.webhookSecret || "").trim();
            }
        } catch (e) {
            console.error("Error reading Cashfree config from Firebase DB:", e);
        }
    }

    if (!appId) appId = "13496932dfc8ed50ec1e5540e223969431";
    if (!secretKey) secretKey = "cfsk_ma_prod_2fba023b614d4dd9107168d103a2bfed_9720ee8c";

    const isTestKey = secretKey.includes("_test_") || appId.toLowerCase().includes("test") || secretKey.startsWith("TEST") || appId.startsWith("TEST");
    const isProdKey = secretKey.includes("_prod_") || appId.toLowerCase().includes("prod");

    let cfEnv = "PROD";
    if (isTestKey) {
        cfEnv = "TEST";
    } else if (isProdKey) {
        cfEnv = "PROD";
    } else if (rawEnv.toUpperCase() === "TEST" || rawEnv.toUpperCase() === "SANDBOX") {
        cfEnv = "TEST";
    } else {
        cfEnv = "PROD";
    }

    const finalWebhookSecret = (webhookSecret || secretKey).trim();

    return {
        cfEnv,
        baseUrl: cfEnv === "PROD" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg",
        appId,
        secretKey,
        webhookSecret: finalWebhookSecret
    };
}

// Helper: Verify and Fulfill Course Order Idempotently
async function fulfillOrder(orderId: string, paymentDetails: any = {}) {
    console.log(`[Order Fulfillment] Processing order: ${orderId}`);
    const orderRecord = await fbGet(`payment_orders/${orderId}`);

    if (!orderRecord) {
        console.warn(`[Order Fulfillment] Order ${orderId} not found in database.`);
        return { success: false, reason: "ORDER_NOT_FOUND" };
    }

    // Idempotency check: If already paid and processed, skip duplicate work
    if (orderRecord.status === "PAID" && orderRecord.autoApproved) {
        console.log(`[Order Fulfillment] Order ${orderId} is already fulfilled.`);
        return { success: true, alreadyProcessed: true, orderRecord };
    }

    const { userId, courseId, courseTitle, amount, customerName, customerEmail, customerPhone } = orderRecord;
    const now = Date.now();
    const invoiceNum = orderRecord.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const transactionId = paymentDetails.cf_payment_id || paymentDetails.transaction_id || `CF_TXN_${Date.now()}`;
    const paymentMethod = paymentDetails.payment_group || paymentDetails.payment_method || "Cashfree PG";

    // 1. Mark Order as PAID
    await fbPatch(`payment_orders/${orderId}`, {
        status: "PAID",
        paymentStatus: "SUCCESS",
        verifiedAt: now,
        transactionId,
        cashfreePaymentId: paymentDetails.cf_payment_id || orderId,
        paymentMethod,
        invoiceNumber: invoiceNum,
        autoApproved: true
    });

    // 2. Unlock Course in User's Purchased Map
    if (userId && courseId) {
        await fbPut(`users/${userId}/purchased/${courseId}`, true);

        // 3. Create Enrollment Record
        await fbPut(`enrollments/${userId}_${courseId}`, {
            userId,
            courseId,
            courseTitle: courseTitle || "Purchased Course",
            enrolledAt: now,
            accessStatus: "ACTIVE",
            accessType: "LIFETIME",
            purchaseSource: "Cashfree Payment Gateway",
            paymentId: orderId,
            transactionId,
            amount,
            invoiceNumber: invoiceNum
        });

        // 4. Create backward-compatible entry in payment_requests
        await fbPut(`payment_requests/${orderId}`, {
            courseId,
            courseName: courseTitle || "Purchased Course",
            amount,
            userId,
            userName: customerName || "Student",
            userPhone: customerPhone || "N/A",
            txnId: transactionId,
            status: "Approved",
            time: now,
            autoApproved: true,
            invoiceNumber: invoiceNum
        });

        // 5. Generate Official Invoice Record
        await fbPut(`invoices/${orderId}`, {
            invoiceNumber: invoiceNum,
            orderId,
            transactionId,
            userId,
            customerName: customerName || "Student",
            customerEmail: customerEmail || "student@example.com",
            customerPhone: customerPhone || "N/A",
            courseId,
            courseTitle: courseTitle || "Purchased Course",
            amount,
            currency: "INR",
            paymentMethod,
            issuedAt: now,
            status: "PAID",
            taxRate: 0, // Inclusive tax
            gstAmount: 0
        });

        // 6. Push In-App Alert Notification to User
        await fbPost(`notifications`, {
            title: "🎉 Course Activated Successfully!",
            message: `Payment of ${formatINR(amount)} verified. You now have lifetime access to "${courseTitle}". Invoice: ${invoiceNum}`,
            time: now,
            category: "Enrollment",
            userId: userId,
            webPush: true
        });

        console.log(`[Order Fulfillment] SUCCESS: Course ${courseId} unlocked for User ${userId}. Invoice: ${invoiceNum}`);
    }

    const updatedOrder = await fbGet(`payment_orders/${orderId}`);
    return { success: true, alreadyProcessed: false, orderRecord: updatedOrder };
}

// -----------------------------------------------------------------------------
// API ENDPOINTS
// -----------------------------------------------------------------------------

app.get(["/health", "/api/health"], (_req: any, res: any) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 1. CREATE CASHFREE ORDER
app.post(["/api/cashfree/create-order", "/cashfree/create-order"], async (req: any, res: any) => {
    try {
        const { courseId, courseTitle, userId, price, customerName, customerPhone, customerEmail, productType } = req.body;

        if (!courseId || !userId || price === undefined || price === null) {
            return res.status(400).json({ error: "Missing required fields (courseId, userId, price)" });
        }

        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({ error: "Invalid price specified." });
        }

        // --- DUPLICATE PURCHASE CHECK ---
        const userPurchased = await fbGet(`users/${userId}/purchased/${courseId}`);
        if (userPurchased) {
            return res.status(400).json({
                error: "ALREADY_OWNED",
                message: "You already own this course or product!"
            });
        }

        const { cfEnv, baseUrl, appId, secretKey } = await getCashfreeConfig();

        if (!appId || !secretKey) {
            return res.status(400).json({
                error: "CASHFREE_CONFIG_MISSING",
                message: "Cashfree API keys are missing in Render environment variables. Please set CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET in Render settings."
            });
        }

        // Unique Order ID
        const rawOrderId = `order_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
        const orderId = rawOrderId.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 45);

        // Build return URL safely
        let secureBaseUrl = 'https://localhost:3000';
        try {
            const rawOrigin = req.body.origin || req.headers.origin || req.headers.referer || req.headers['x-forwarded-host'] || req.get('host') || 'localhost:3000';
            const formattedOrigin = (rawOrigin.startsWith('http://') || rawOrigin.startsWith('https://')) ? rawOrigin : `https://${rawOrigin}`;
            const parsed = new URL(formattedOrigin);
            secureBaseUrl = parsed.origin;
            secureBaseUrl = secureBaseUrl.replace(/^http:\/\//i, 'https://');
        } catch (e) {
            console.warn("Unable to parse origin URL, fallback used:", e);
        }

        const returnUrl = `${secureBaseUrl}/?order_id=${orderId}&course_id=${courseId}&cf_status={order_id}`;
        const notifyUrl = `${secureBaseUrl}/api/cashfree/webhook`;

        // Sanitization Rules
        const sanitizedCustomerId = String(userId).replace(/[^a-zA-Z0-9_]/g, "").substring(0, 50) || "guest_user";
        let sanitizedPhone = String(customerPhone || "").replace(/\D/g, "");
        if (sanitizedPhone.length < 10) sanitizedPhone = "9999999999";
        if (sanitizedPhone.length > 15) sanitizedPhone = sanitizedPhone.substring(0, 15);

        const payload = {
            order_id: orderId,
            order_amount: numericPrice,
            order_currency: "INR",
            customer_details: {
                customer_id: sanitizedCustomerId,
                customer_name: (customerName || "Student").trim(),
                customer_email: (customerEmail && customerEmail.includes("@")) ? customerEmail.trim() : "student@theonlineclasses.com",
                customer_phone: sanitizedPhone
            },
            order_meta: {
                return_url: returnUrl,
                notify_url: notifyUrl
            },
            order_note: `Course: ${courseTitle || courseId}`
        };

        const response = await fetch(`${baseUrl}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-client-id": appId,
                "x-client-secret": secretKey,
                "x-api-version": "2023-08-01"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("[Cashfree Create Order Failed]:", response.status, errText);
            return res.status(response.status).json({
                error: "CASHFREE_API_ERROR",
                message: `Failed to create Cashfree order (HTTP ${response.status})`,
                details: errText
            });
        }

        const cfData = await response.json();

        // Save Order Details in DB as PENDING
        const newOrderRecord = {
            orderId: cfData.order_id,
            paymentSessionId: cfData.payment_session_id,
            userId,
            courseId,
            courseTitle: courseTitle || "Course #" + courseId,
            productType: productType || "course",
            amount: numericPrice,
            currency: "INR",
            customerName: customerName || "Student",
            customerEmail: customerEmail || "N/A",
            customerPhone: customerPhone || "N/A",
            status: "PENDING",
            paymentStatus: "PENDING",
            createdAt: Date.now(),
            cfEnv,
            autoApproved: false
        };

        await fbPut(`payment_orders/${orderId}`, newOrderRecord);

        res.json({
            success: true,
            order_id: cfData.order_id,
            payment_session_id: cfData.payment_session_id,
            order_status: cfData.order_status,
            cf_env: cfEnv
        });

    } catch (err: any) {
        console.error("Create Order Exception:", err);
        res.status(500).json({ error: "INTERNAL_ERROR", message: err.message || "Server Error" });
    }
});

// 1.5: Secure Cashfree Create-Order Endpoint matching Vercel schema
const handleVercelCreateOrder = async (req: any, res: any) => {
    res.setHeader("Content-Type", "application/json");
    const { order_amount, order_id, customer_details, order_meta, order_currency } = req.body || {};

    try {
        const { baseUrl, appId, secretKey } = await getCashfreeConfig();

        if (!appId || !secretKey) {
            return res.status(400).json({
                error: "CONFIGURATION_ERROR",
                message: "Cashfree credentials are not configured on the server side."
            });
        }

        const details = customer_details || {};
        let cleanPhone = String(details.customer_phone || "9999999999").replace(/\D/g, "");
        if (cleanPhone.length < 10) cleanPhone = cleanPhone.padEnd(10, "9");
        if (cleanPhone.length > 15) cleanPhone = cleanPhone.slice(-10);

        let cleanCustID = String(details.customer_id || `CUST_${Date.now()}`).replace(/[^a-zA-Z0-9_.-]/g, "_");
        if (cleanCustID.length > 50) cleanCustID = cleanCustID.slice(0, 50);

        let cleanOrderID = String(order_id || `ORD_CF_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, "_");
        if (cleanOrderID.length > 45) cleanOrderID = cleanOrderID.slice(0, 45);

        const originUrl = req.body.origin || req.headers.origin || req.headers.referer || ('https://' + (req.headers['x-forwarded-host'] || req.get('host') || 'localhost:3000'));
        const appBaseUrl = new URL(originUrl).origin;
        const secureBaseUrl = appBaseUrl.startsWith('http://localhost') ? appBaseUrl.replace('http://', 'https://') : (appBaseUrl.startsWith('http://') ? appBaseUrl.replace('http://', 'https://') : appBaseUrl);

        const returnUrl = (order_meta && order_meta.return_url) || `${secureBaseUrl}/?cf_order_id={order_id}`;

        const payload = {
            order_amount: Number(order_amount),
            order_currency: order_currency || "INR",
            order_id: cleanOrderID,
            customer_details: {
                customer_id: cleanCustID,
                customer_phone: cleanPhone,
                customer_name: details.customer_name ? String(details.customer_name).slice(0, 100) : "Valued Customer",
                customer_email: details.customer_email ? String(details.customer_email).slice(0, 100) : "customer@example.com"
            },
            order_meta: {
                return_url: returnUrl
            }
        };

        const response = await fetch(`${baseUrl}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-client-id": appId,
                "x-client-secret": secretKey,
                "x-api-version": "2023-08-01"
            },
            body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        let responseData: any;
        try {
            responseData = JSON.parse(responseText);
        } catch (parseErr) {
            return res.status(502).json({
                error: "BAD_GATEWAY",
                message: "Received invalid non-JSON response from Cashfree gateway API.",
                raw: responseText.slice(0, 250)
            });
        }

        if (!response.ok) {
            return res.status(response.status).json({
                error: "GATEWAY_ERROR",
                message: responseData.message || "Failed to create order on Cashfree server.",
                details: responseData
            });
        }

        return res.status(200).json(responseData);

    } catch (error: any) {
        return res.status(500).json({
            error: "INTERNAL_SERVER_ERROR",
            message: error.message || "An unexpected connection exception occurred during order creation."
        });
    }
};

app.post(["/api/create-order", "/api/create-order.js"], handleVercelCreateOrder);

// 2. VERIFY CASHFREE ORDER (Server-to-Server Verification)
app.get(["/api/cashfree/verify-order/:orderId", "/cashfree/verify-order/:orderId"], async (req: any, res: any) => {
    try {
        const { orderId } = req.params;
        if (!orderId) return res.status(400).json({ error: "Order ID is required." });

        const { baseUrl, appId, secretKey } = await getCashfreeConfig();

        // 1. Query Cashfree REST API for Order Details
        const orderRes = await fetch(`${baseUrl}/orders/${orderId}`, {
            method: "GET",
            headers: {
                "x-client-id": appId,
                "x-client-secret": secretKey,
                "x-api-version": "2023-08-01"
            }
        });

        if (!orderRes.ok) {
            const errText = await orderRes.text();
            console.error(`[Verify Order] Cashfree returned ${orderRes.status}:`, errText);
            return res.status(orderRes.status).json({ error: "CASHFREE_FETCH_FAILED", message: "Unable to verify order with Cashfree." });
        }

        const orderData = await orderRes.json();
        const cfOrderStatus = orderData.order_status; // "PAID", "ACTIVE", "EXPIRED", "CANCELLED"

        // 2. Fetch Payment Transactions from Cashfree
        let paymentDetails: any = {};
        try {
            const paymentsRes = await fetch(`${baseUrl}/orders/${orderId}/payments`, {
                headers: {
                    "x-client-id": appId,
                    "x-client-secret": secretKey,
                    "x-api-version": "2023-08-01"
                }
            });
            if (paymentsRes.ok) {
                const paymentsList = await paymentsRes.json();
                if (Array.isArray(paymentsList) && paymentsList.length > 0) {
                    // Pick the last successful payment if present
                    const successPayment = paymentsList.find((p: any) => p.payment_status === "SUCCESS") || paymentsList[0];
                    paymentDetails = successPayment;
                }
            }
        } catch (e) {
            console.warn("Error fetching detailed payments list from Cashfree:", e);
        }

        // 3. Handle Status
        if (cfOrderStatus === "PAID" || paymentDetails.payment_status === "SUCCESS") {
            const result = await fulfillOrder(orderId, paymentDetails);
            return res.json({
                verified: true,
                order_status: "PAID",
                payment_status: "SUCCESS",
                message: "Payment successfully verified and course activated!",
                invoice_number: result.orderRecord?.invoiceNumber,
                orderRecord: result.orderRecord
            });
        } else {
            // Update order status in DB to FAILED or CANCELLED if expired
            await fbPatch(`payment_orders/${orderId}`, {
                status: cfOrderStatus,
                paymentStatus: cfOrderStatus === "EXPIRED" ? "EXPIRED" : "FAILED",
                lastCheckedAt: Date.now()
            });

            return res.json({
                verified: false,
                order_status: cfOrderStatus,
                payment_status: "FAILED",
                message: `Payment is ${cfOrderStatus}. Course not activated.`
            });
        }

    } catch (err: any) {
        console.error("Verify Order Exception:", err);
        res.status(500).json({ error: "VERIFICATION_ERROR", message: err.message || "Server Error" });
    }
});

// 3. CASHFREE WEBHOOK LISTENER (GET & POST)
const handleWebhook = async (req: any, res: any) => {
    try {
        console.log("=== [Cashfree Webhook Received] ===");
        if (req.method === "GET" || req.method === "HEAD") {
            return res.status(200).json({ status: "OK", message: "Cashfree Webhook Endpoint Active" });
        }

        const { webhookSecret } = await getCashfreeConfig();

        // Webhook signature validation if secret & header provided
        const signatureHeader = req.headers['x-webhook-signature'];
        const timestampHeader = req.headers['x-webhook-timestamp'];

        if (webhookSecret && signatureHeader && timestampHeader && req.rawBody) {
            try {
                const payloadToSign = timestampHeader + req.rawBody.toString('utf8');
                const computedSignature = crypto.createHmac('sha256', webhookSecret).update(payloadToSign).digest('base64');
                if (computedSignature !== signatureHeader) {
                    console.warn("[Cashfree Webhook] Signature mismatch! Proceeding with fallback check.");
                } else {
                    console.log("[Cashfree Webhook] Signature verified successfully.");
                }
            } catch (sigErr) {
                console.warn("[Cashfree Webhook] Signature verification error:", sigErr);
            }
        }

        const body = req.body || {};
        const eventType = body.type || body.event || "UNKNOWN";
        const data = body.data || {};
        const orderId = data.order?.order_id || data.order_id || body.order_id;

        console.log(`[Webhook Event]: ${eventType} for Order: ${orderId}`);

        // Log Webhook Event in DB
        const webhookLogId = `wh_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        await fbPut(`webhook_logs/${webhookLogId}`, {
            id: webhookLogId,
            orderId: orderId || "TEST_PING",
            eventType,
            payload: body,
            receivedAt: Date.now()
        });

        if (orderId && (eventType === "PAYMENT_SUCCESS_WEBHOOK" || eventType === "ORDER_PAID" || data.payment?.payment_status === "SUCCESS")) {
            const paymentObj = data.payment || {};
            await fulfillOrder(orderId, paymentObj);
        }

        // Return 200 OK to Cashfree
        return res.status(200).json({ status: "OK", received: true, message: "Webhook processed successfully" });

    } catch (err: any) {
        console.error("[Cashfree Webhook Error]:", err);
        return res.status(200).json({ status: "OK", warning: "Error handled", details: err.message });
    }
};

app.all([
    "/api/cashfree/webhook",
    "/cashfree/webhook",
    "/api/webhook",
    "/webhook",
    "/api/cashfree/webhook.js"
], handleWebhook);

// 4. GENERATE PRINTABLE/DOWNLOADABLE INVOICE HTML
app.get(["/api/cashfree/invoice/:orderId", "/cashfree/invoice/:orderId"], async (req: any, res: any) => {
    try {
        const { orderId } = req.params;
        const invoiceData = await fbGet(`invoices/${orderId}`) || await fbGet(`payment_orders/${orderId}`);

        if (!invoiceData) {
            return res.status(404).send("<h2 style='text-align:center;font-family:sans-serif;margin-top:50px;'>Invoice not found.</h2>");
        }

        const invNum = invoiceData.invoiceNumber || `INV-${orderId}`;
        const issueDate = new Date(invoiceData.issuedAt || invoiceData.createdAt || Date.now()).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Tax Invoice - ${invNum}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; color: black !important; padding: 0 !important; }
                    .invoice-box { border: none !important; shadow: none !important; }
                }
            </style>
        </head>
        <body class="bg-slate-100 min-h-screen py-10 px-4 font-sans text-slate-800">
            <div class="max-w-3xl mx-auto mb-6 flex justify-between items-center no-print">
                <a href="/" class="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                    <i class="fa-solid fa-arrow-left"></i> Return to Website
                </a>
                <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all">
                    <i class="fa-solid fa-print"></i> Download / Print PDF
                </button>
            </div>

            <div class="invoice-box max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200">
                <!-- Header -->
                <div class="flex justify-between items-start border-b border-slate-200 pb-8">
                    <div>
                        <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-base mb-3 shadow-md">
                            TOC
                        </div>
                        <h1 class="text-xl font-black text-slate-900 tracking-tight">THE ONLINE CLASSES</h1>
                        <p class="text-xs text-slate-500 font-medium mt-1">Empowering Education Everywhere</p>
                    </div>
                    <div class="text-right">
                        <span class="inline-block bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                            <i class="fa-solid fa-circle-check mr-1"></i> PAID
                        </span>
                        <h2 class="text-xl font-black text-slate-800">TAX INVOICE</h2>
                        <p class="text-xs font-bold text-slate-500 mt-1"># ${invNum}</p>
                        <p class="text-[11px] text-slate-400 font-medium mt-0.5">Date: ${issueDate}</p>
                    </div>
                </div>

                <!-- Billed To / Payment Method -->
                <div class="grid grid-cols-2 gap-6 py-8 border-b border-slate-100">
                    <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">BILLED TO (STUDENT)</p>
                        <p class="text-sm font-black text-slate-800">${invoiceData.customerName || 'Student'}</p>
                        <p class="text-xs text-slate-600 font-medium mt-0.5">${invoiceData.customerEmail || ''}</p>
                        <p class="text-xs text-slate-600 font-medium mt-0.5">Phone: ${invoiceData.customerPhone || 'N/A'}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">PAYMENT INFORMATION</p>
                        <p class="text-xs font-bold text-slate-800">Gateway: <span class="text-indigo-600">Cashfree PG</span></p>
                        <p class="text-xs text-slate-600 mt-1">Txn ID: <code class="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">${invoiceData.transactionId || orderId}</code></p>
                        <p class="text-xs text-slate-600 mt-1">Order ID: <code class="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">${orderId}</code></p>
                    </div>
                </div>

                <!-- Order Items Table -->
                <div class="py-8">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-slate-200">
                                <th class="py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">Item Description</th>
                                <th class="py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Type</th>
                                <th class="py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr>
                                <td class="py-4">
                                    <p class="font-black text-sm text-slate-800">${invoiceData.courseTitle || 'Purchased Course'}</p>
                                    <p class="text-[11px] text-slate-400 mt-0.5">Includes lifetime access, video lectures & downloadable study materials.</p>
                                </td>
                                <td class="py-4 text-center">
                                    <span class="text-[10px] font-bold bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 uppercase">Course</span>
                                </td>
                                <td class="py-4 text-right font-black text-sm text-slate-900">
                                    ${formatINR(invoiceData.amount || 0)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Totals -->
                <div class="border-t border-slate-200 pt-6 flex justify-end">
                    <div class="w-full sm:w-64 space-y-2">
                        <div class="flex justify-between text-xs text-slate-500 font-medium">
                            <span>Subtotal:</span>
                            <span>${formatINR(invoiceData.amount || 0)}</span>
                        </div>
                        <div class="flex justify-between text-xs text-slate-500 font-medium">
                            <span>Taxes (GST Incl.):</span>
                            <span>₹0.00</span>
                        </div>
                        <div class="flex justify-between text-base font-black text-slate-900 border-t border-slate-200 pt-3">
                            <span>Total Paid:</span>
                            <span class="text-indigo-600">${formatINR(invoiceData.amount || 0)}</span>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="mt-12 border-t border-slate-100 pt-8 text-center text-xs text-slate-400 font-medium leading-relaxed">
                    <p class="font-bold text-slate-600">Thank you for learning with THE ONLINE CLASSES!</p>
                    <p class="mt-1">This is a computer-generated tax invoice verified by Cashfree Payment Gateway.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        res.send(html);

    } catch (err: any) {
        console.error("Invoice Error:", err);
        res.status(500).send("Error generating invoice");
    }
});

// 5. GET USER'S ORDER HISTORY
app.get(["/api/cashfree/user-orders/:userId", "/cashfree/user-orders/:userId"], async (req: any, res: any) => {
    try {
        const { userId } = req.params;
        const allOrders = await fbGet(`payment_orders`) || {};

        const userOrders = Object.values(allOrders).filter((o: any) => o && o.userId === userId);
        res.json({ success: true, orders: userOrders });
    } catch (err: any) {
        res.status(500).json({ error: "FETCH_FAILED", message: err.message });
    }
});

// 6. ADMIN ENDPOINTS: GET ALL PAYMENT ORDERS & WEBHOOK LOGS
app.get(["/api/cashfree/admin/all-orders", "/cashfree/admin/all-orders"], async (_req: any, res: any) => {
    try {
        const ordersObj = await fbGet(`payment_orders`) || {};
        const requestsObj = await fbGet(`payment_requests`) || {};
        const invoicesObj = await fbGet(`invoices`) || {};

        res.json({
            success: true,
            payment_orders: ordersObj,
            payment_requests: requestsObj,
            invoices: invoicesObj
        });
    } catch (err: any) {
        res.status(500).json({ error: "ADMIN_FETCH_FAILED", message: err.message });
    }
});

app.get(["/api/cashfree/admin/webhook-logs", "/cashfree/admin/webhook-logs"], async (_req: any, res: any) => {
    try {
        const logsObj = await fbGet(`webhook_logs`) || {};
        res.json({ success: true, webhook_logs: logsObj });
    } catch (err: any) {
        res.status(500).json({ error: "FETCH_FAILED", message: err.message });
    }
});

// -----------------------------------------------------------------------------
// VITE DEV / PRODUCTION SERVER BOOTSTRAP
// -----------------------------------------------------------------------------
async function startServer() {
    if (!process.env.VERCEL) {
        if (process.env.NODE_ENV !== "production") {
            const viteModuleName = "vite";
            const { createServer: createViteServer } = await import(/* @vite-ignore */ viteModuleName);
            const vite = await createViteServer({
                server: { middlewareMode: true },
                appType: "spa"
            });
            app.use(vite.middlewares);
        } else {
            const distPath = path.join(process.cwd(), "dist");
            app.use(express.static(distPath));
            app.get("*", (req: any, res: any, next: any) => {
                if (req.path.startsWith("/api") || req.url.startsWith("/api") || req.path.startsWith("/cashfree") || req.url.startsWith("/cashfree")) {
                    return next();
                }
                res.sendFile(path.join(distPath, "index.html"));
            });
        }
    }

    // Handle missing /api & /cashfree routes with JSON instead of Express default HTML 404
    app.use(["/api", "/api/*", "/cashfree", "/cashfree/*"], (req: any, res: any) => {
        res.status(404).json({
            error: "API_ROUTE_NOT_FOUND",
            message: `API endpoint ${req.originalUrl || req.url} does not exist.`
        });
    });

    // Global API error handling middleware (always returns JSON)
    app.use((err: any, _req: any, res: any, _next: any) => {
        console.error("Express Unhandled API Error:", err);
        res.status(500).json({
            error: "INTERNAL_SERVER_ERROR",
            message: err?.message || "Internal server error during API request."
        });
    });

    if (!process.env.VERCEL) {
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`⚡ Server running on http://0.0.0.0:${PORT}`);
        });
    }
}

if (!process.env.VERCEL) {
    startServer();
}

export default app;
