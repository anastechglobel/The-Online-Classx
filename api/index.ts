import express from "express";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Capture raw body for Cashfree Webhook Signature Verification if needed
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Ensure string bodies in serverless environments are parsed as JSON if needed
app.use((req: any, _res: any, next: any) => {
  if (typeof req.body === "string" && req.body.trim().length > 0) {
    try {
      req.body = JSON.parse(req.body);
    } catch (_e) {
      // Keep original body if not valid JSON
    }
  }
  next();
});

// CORS & Preflight Middleware for Vercel / Same-Origin & Cross-Origin requests
app.use((req: any, res: any, next: any) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, x-client-id, x-client-secret, x-webhook-signature, x-webhook-timestamp, x-razorpay-signature"
  );

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
      body: JSON.stringify(data),
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
      body: JSON.stringify(data),
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
      body: JSON.stringify(data),
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
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(num);
}

// Helper to resolve public HTTPS base URL on Vercel or local dev
function resolveSecureBaseUrl(req: any): string {
  let secureBaseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://localhost:3000";
  try {
    const forwardedHost = req.headers["x-forwarded-host"]
      ? String(req.headers["x-forwarded-host"]).split(",")[0].trim()
      : "";
    const hostHeader = req.get ? req.get("host") : req.headers["host"];
    const rawOrigin =
      (req.body && req.body.origin) ||
      req.headers.origin ||
      req.headers.referer ||
      forwardedHost ||
      process.env.VERCEL_URL ||
      hostHeader ||
      "localhost:3000";

    const cleanOrigin = String(rawOrigin).split(",")[0].trim();
    const formattedOrigin =
      cleanOrigin.startsWith("http://") || cleanOrigin.startsWith("https://")
        ? cleanOrigin
        : `https://${cleanOrigin}`;
    const parsed = new URL(formattedOrigin);
    secureBaseUrl = parsed.origin.replace(/^http:\/\//i, "https://");
  } catch (e) {
    console.warn("Unable to parse origin URL, fallback used:", e);
  }
  return secureBaseUrl;
}

// Cashfree Environment Helpers
async function getCashfreeConfig() {
  let appId = (process.env.CASHFREE_APP_ID || process.env.CASHFREE_CLIENT_ID || "").trim();
  let secretKey = (
    process.env.CASHFREE_SECRET_KEY ||
    process.env.CASHFREE_CLIENT_SECRET ||
    ""
  ).trim();
  let rawEnv = (process.env.CASHFREE_ENV || "").trim();
  let webhookSecret = (process.env.CASHFREE_WEBHOOK_SECRET || "").trim();
  let enabled = true;

  // Always check Firebase DB settings/cashfree for admin overrides & enabled flag
  try {
    const dbSettings = await fbGet("settings/cashfree");
    if (dbSettings) {
      if (typeof dbSettings.enabled === "boolean") {
        enabled = dbSettings.enabled;
      }
      if (dbSettings.appId && String(dbSettings.appId).trim()) {
        appId = String(dbSettings.appId).trim();
      }
      if (dbSettings.secretKey && String(dbSettings.secretKey).trim()) {
        secretKey = String(dbSettings.secretKey).trim();
      }
      if (dbSettings.env || dbSettings.cfEnv) {
        rawEnv = String(dbSettings.env || dbSettings.cfEnv).trim();
      }
      if (dbSettings.webhookSecret && String(dbSettings.webhookSecret).trim()) {
        webhookSecret = String(dbSettings.webhookSecret).trim();
      }
    }
  } catch (e) {
    console.error("Error reading Cashfree config from Firebase DB:", e);
  }

  if (!appId) appId = "13496932dfc8ed50ec1e5540e223969431";
  if (!secretKey) secretKey = "cfsk_ma_prod_2fba023b614d4dd9107168d103a2bfed_9720ee8c";

  const isTestKey =
    secretKey.includes("_test_") ||
    appId.toLowerCase().includes("test") ||
    secretKey.startsWith("TEST") ||
    appId.startsWith("TEST");
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
    enabled,
    cfEnv,
    baseUrl:
      cfEnv === "PROD"
        ? "https://api.cashfree.com/pg"
        : "https://sandbox.cashfree.com/pg",
    appId,
    secretKey,
    webhookSecret: finalWebhookSecret,
  };
}

// Razorpay Environment Helpers
async function getRazorpayConfig() {
  let keyId = (process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_CLIENT_ID || "").trim();
  let keySecret = (
    process.env.RAZORPAY_KEY_SECRET ||
    process.env.RAZORPAY_CLIENT_SECRET ||
    ""
  ).trim();
  let webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || "").trim();
  let enabled: boolean | undefined = undefined;

  try {
    const dbSettings = await fbGet("settings/razorpay");
    if (dbSettings) {
      if (typeof dbSettings.enabled === "boolean") {
        enabled = dbSettings.enabled;
      }
      if (dbSettings.keyId && String(dbSettings.keyId).trim()) {
        keyId = String(dbSettings.keyId).trim();
      }
      if (dbSettings.keySecret && String(dbSettings.keySecret).trim()) {
        keySecret = String(dbSettings.keySecret).trim();
      }
      if (dbSettings.webhookSecret && String(dbSettings.webhookSecret).trim()) {
        webhookSecret = String(dbSettings.webhookSecret).trim();
      }
    }
  } catch (e) {
    console.error("Error reading Razorpay config from Firebase DB:", e);
  }

  const isConfigured = Boolean(keyId && keySecret);
  const finalEnabled = enabled !== undefined ? enabled : true;

  return {
    enabled: finalEnabled,
    configured: isConfigured,
    keyId,
    keySecret,
    webhookSecret: (webhookSecret || keySecret).trim(),
  };
}

// ZapUPI Environment Helpers (https://zapupi.com)
async function getZapupiConfig() {
  let tokenKey = (
    process.env.ZAPUPI_TOKEN_KEY ||
    process.env.ZAPUPI_API_KEY ||
    process.env.ZAPUPI_ZAP_KEY ||
    ""
  ).trim();
  let secretKey = (process.env.ZAPUPI_SECRET_KEY || "").trim();
  let enabled: boolean | undefined = undefined;
  let recommended = true;

  try {
    const dbSettings = await fbGet("settings/zapupi");
    if (dbSettings) {
      if (typeof dbSettings.enabled === "boolean") {
        enabled = dbSettings.enabled;
      }
      if (typeof dbSettings.recommended === "boolean") {
        recommended = dbSettings.recommended;
      }
      if (dbSettings.tokenKey && String(dbSettings.tokenKey).trim()) {
        tokenKey = String(dbSettings.tokenKey).trim();
      }
      if (dbSettings.secretKey && String(dbSettings.secretKey).trim()) {
        secretKey = String(dbSettings.secretKey).trim();
      }
    }
  } catch (e) {
    console.error("Error reading ZapUPI config from Firebase DB:", e);
  }

  const isConfigured = Boolean(tokenKey);
  const finalEnabled = enabled !== undefined ? enabled : true;

  return {
    enabled: finalEnabled,
    configured: isConfigured,
    recommended,
    tokenKey,
    secretKey,
  };
}

// Helper: Verify and Fulfill Course Order Idempotently (Supports Cashfree, Razorpay & ZapUPI)
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

  const {
    userId,
    courseId,
    courseTitle,
    amount,
    customerName,
    customerEmail,
    customerPhone,
  } = orderRecord;
  const now = Date.now();
  const isZapupi =
    paymentDetails.gateway === "ZapUPI" ||
    paymentDetails.gateway === "ZAPUPI" ||
    orderRecord.gateway === "ZAPUPI" ||
    String(orderId || "").startsWith("ZAP");
  const isRazorpay =
    !isZapupi &&
    (paymentDetails.gateway === "Razorpay" ||
      orderRecord.gateway === "RAZORPAY" ||
      Boolean(paymentDetails.razorpay_payment_id) ||
      Boolean(orderRecord.razorpayOrderId));

  const gatewayCode = isZapupi ? "ZAPUPI" : isRazorpay ? "RAZORPAY" : "CASHFREE";
  const gatewayShortName = isZapupi ? "ZapUPI" : isRazorpay ? "Razorpay" : "Cashfree";

  const invoiceNum =
    orderRecord.invoiceNumber ||
    `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const transactionId =
    paymentDetails.utr ||
    paymentDetails.zapupi_txn_id ||
    paymentDetails.razorpay_payment_id ||
    paymentDetails.cf_payment_id ||
    paymentDetails.transaction_id ||
    (isZapupi
      ? `ZAP_TXN_${Date.now()}`
      : isRazorpay
      ? `RZP_TXN_${Date.now()}`
      : `CF_TXN_${Date.now()}`);
  const paymentMethod =
    paymentDetails.payment_group ||
    paymentDetails.payment_method ||
    (isZapupi ? "ZapUPI PG" : isRazorpay ? "Razorpay PG" : "Cashfree PG");
  const purchaseSource = `${gatewayShortName} Payment Gateway`;

  // 1. Mark Order as PAID
  await fbPatch(`payment_orders/${orderId}`, {
    status: "PAID",
    paymentStatus: "SUCCESS",
    verifiedAt: now,
    transactionId,
    gateway: gatewayCode,
    cashfreePaymentId: paymentDetails.cf_payment_id || orderRecord.cashfreePaymentId || null,
    razorpayPaymentId:
      paymentDetails.razorpay_payment_id || orderRecord.razorpayPaymentId || null,
    zapupiTxnId:
      paymentDetails.utr || paymentDetails.zapupi_txn_id || orderRecord.zapupiTxnId || null,
    paymentMethod,
    invoiceNumber: invoiceNum,
    autoApproved: true,
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
      purchaseSource,
      gateway: gatewayCode,
      paymentId: orderId,
      transactionId,
      amount,
      invoiceNumber: invoiceNum,
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
      gateway: gatewayShortName,
      status: "Approved",
      time: now,
      autoApproved: true,
      invoiceNumber: invoiceNum,
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
      gateway: gatewayCode,
      paymentMethod,
      issuedAt: now,
      status: "PAID",
      taxRate: 0,
      gstAmount: 0,
    });

    // 6. Push In-App Alert Notification to User
    await fbPost(`notifications`, {
      title: "🎉 Course Activated Successfully!",
      message: `Payment of ${formatINR(
        amount
      )} verified via ${gatewayShortName}. You now have lifetime access to "${courseTitle}". Invoice: ${invoiceNum}`,
      time: now,
      category: "Enrollment",
      userId: userId,
      webPush: true,
    });

    console.log(
      `[Order Fulfillment] SUCCESS (${gatewayShortName}): Course ${courseId} unlocked for User ${userId}. Invoice: ${invoiceNum}`
    );
  }

  const updatedOrder = await fbGet(`payment_orders/${orderId}`);
  return { success: true, alreadyProcessed: false, orderRecord: updatedOrder };
}

// -----------------------------------------------------------------------------
// API ENDPOINTS (VERCEL & LOCAL EXPRESS COMPATIBLE)
// -----------------------------------------------------------------------------

app.get(["/health", "/api/health"], (_req: any, res: any) => {
  res.json({
    status: "ok",
    platform: process.env.VERCEL ? "vercel" : "node",
    timestamp: new Date().toISOString(),
  });
});

// 0. GET ACTIVE PAYMENT GATEWAYS STATUS
app.get(["/api/payment/gateways", "/payment/gateways"], async (_req: any, res: any) => {
  try {
    const [cfCfg, rzpCfg, zapCfg] = await Promise.all([
      getCashfreeConfig(),
      getRazorpayConfig(),
      getZapupiConfig(),
    ]);
    res.json({
      success: true,
      cashfree: {
        enabled: cfCfg.enabled,
        configured: Boolean(cfCfg.appId && cfCfg.secretKey),
        env: cfCfg.cfEnv,
      },
      razorpay: {
        enabled: rzpCfg.enabled,
        configured: rzpCfg.configured,
        keyId: rzpCfg.enabled ? rzpCfg.keyId : "",
      },
      zapupi: {
        enabled: zapCfg.enabled,
        configured: zapCfg.configured,
        recommended: zapCfg.recommended,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: "GATEWAY_STATUS_ERROR",
      message: err.message || "Unable to fetch payment gateway status.",
    });
  }
});

// 1. CREATE CASHFREE ORDER
app.post(
  ["/api/cashfree/create-order", "/cashfree/create-order"],
  async (req: any, res: any) => {
    try {
      const {
        courseId,
        courseTitle,
        userId,
        price,
        customerName,
        customerPhone,
        customerEmail,
        productType,
      } = req.body || {};

      if (!courseId || !userId || price === undefined || price === null) {
        return res
          .status(400)
          .json({ error: "Missing required fields (courseId, userId, price)" });
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
          message: "You already own this course or product!",
        });
      }

      const { enabled, cfEnv, baseUrl, appId, secretKey } = await getCashfreeConfig();

      if (!enabled) {
        return res.status(403).json({
          error: "GATEWAY_DISABLED",
          message:
            "Cashfree Payment Gateway is currently disabled by the administrator. Please select another payment method.",
        });
      }

      if (!appId || !secretKey) {
        return res.status(400).json({
          error: "CASHFREE_CONFIG_MISSING",
          message:
            "Cashfree API keys are missing. Please configure CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET in Vercel Environment Variables or Admin Settings.",
        });
      }

      // Unique Order ID
      const rawOrderId = `order_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const orderId = rawOrderId.replace(/[^a-zA-Z0-9_]/g, "").substring(0, 45);

      const secureBaseUrl = resolveSecureBaseUrl(req);
      const returnUrl = `${secureBaseUrl}/?order_id=${orderId}&course_id=${courseId}&cf_status={order_id}`;
      const notifyUrl = `${secureBaseUrl}/api/cashfree/webhook`;

      // Sanitization Rules
      const sanitizedCustomerId =
        String(userId)
          .replace(/[^a-zA-Z0-9_]/g, "")
          .substring(0, 50) || "guest_user";
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
          customer_email:
            customerEmail && customerEmail.includes("@")
              ? customerEmail.trim()
              : "student@theonlineclasses.com",
          customer_phone: sanitizedPhone,
        },
        order_meta: {
          return_url: returnUrl,
          notify_url: notifyUrl,
        },
        order_note: `Course: ${courseTitle || courseId}`,
      };

      const response = await fetch(`${baseUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": appId,
          "x-client-secret": secretKey,
          "x-api-version": "2023-08-01",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("[Cashfree Create Order Failed]:", response.status, errText);
        return res.status(response.status).json({
          error: "CASHFREE_API_ERROR",
          message: `Failed to create Cashfree order (HTTP ${response.status})`,
          details: errText,
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
        autoApproved: false,
      };

      await fbPut(`payment_orders/${orderId}`, newOrderRecord);

      res.json({
        success: true,
        order_id: cfData.order_id,
        payment_session_id: cfData.payment_session_id,
        order_status: cfData.order_status,
        cf_env: cfEnv,
      });
    } catch (err: any) {
      console.error("Create Order Exception:", err);
      res
        .status(500)
        .json({ error: "INTERNAL_ERROR", message: err.message || "Server Error" });
    }
  }
);

// 1.5: Secure Cashfree Create-Order Endpoint matching Vercel schema
const handleVercelCreateOrder = async (req: any, res: any) => {
  res.setHeader("Content-Type", "application/json");
  const { order_amount, order_id, customer_details, order_meta, order_currency } =
    req.body || {};

  try {
    const { baseUrl, appId, secretKey } = await getCashfreeConfig();

    if (!appId || !secretKey) {
      return res.status(400).json({
        error: "CONFIGURATION_ERROR",
        message: "Cashfree credentials are not configured on the server side.",
      });
    }

    const details = customer_details || {};
    let cleanPhone = String(details.customer_phone || "9999999999").replace(/\D/g, "");
    if (cleanPhone.length < 10) cleanPhone = cleanPhone.padEnd(10, "9");
    if (cleanPhone.length > 15) cleanPhone = cleanPhone.slice(-10);

    let cleanCustID = String(details.customer_id || `CUST_${Date.now()}`).replace(
      /[^a-zA-Z0-9_.-]/g,
      "_"
    );
    if (cleanCustID.length > 50) cleanCustID = cleanCustID.slice(0, 50);

    let cleanOrderID = String(order_id || `ORD_CF_${Date.now()}`).replace(
      /[^a-zA-Z0-9_-]/g,
      "_"
    );
    if (cleanOrderID.length > 45) cleanOrderID = cleanOrderID.slice(0, 45);

    const secureBaseUrl = resolveSecureBaseUrl(req);
    const returnUrl =
      (order_meta && order_meta.return_url) ||
      `${secureBaseUrl}/?cf_order_id={order_id}`;

    const payload = {
      order_amount: Number(order_amount),
      order_currency: order_currency || "INR",
      order_id: cleanOrderID,
      customer_details: {
        customer_id: cleanCustID,
        customer_phone: cleanPhone,
        customer_name: details.customer_name
          ? String(details.customer_name).slice(0, 100)
          : "Valued Customer",
        customer_email: details.customer_email
          ? String(details.customer_email).slice(0, 100)
          : "customer@example.com",
      },
      order_meta: {
        return_url: returnUrl,
      },
    };

    const response = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
    } catch (_parseErr) {
      return res.status(502).json({
        error: "BAD_GATEWAY",
        message: "Received invalid non-JSON response from Cashfree gateway API.",
        raw: responseText.slice(0, 250),
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: "GATEWAY_ERROR",
        message: responseData.message || "Failed to create order on Cashfree server.",
        details: responseData,
      });
    }

    return res.status(200).json(responseData);
  } catch (error: any) {
    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message:
        error.message ||
        "An unexpected connection exception occurred during order creation.",
    });
  }
};

app.post(
  ["/api/create-order", "/api/create-order.js", "/create-order", "/create-order.js"],
  handleVercelCreateOrder
);

// 2. VERIFY CASHFREE ORDER (Server-to-Server Verification)
const handleVerifyOrder = async (req: any, res: any) => {
  try {
    const orderId = req.params.orderId || req.query.orderId || req.query.order_id;
    if (!orderId) return res.status(400).json({ error: "Order ID is required." });

    const { baseUrl, appId, secretKey } = await getCashfreeConfig();

    // 1. Query Cashfree REST API for Order Details
    const orderRes = await fetch(`${baseUrl}/orders/${orderId}`, {
      method: "GET",
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
      },
    });

    if (!orderRes.ok) {
      const errText = await orderRes.text();
      console.error(`[Verify Order] Cashfree returned ${orderRes.status}:`, errText);
      return res.status(orderRes.status).json({
        error: "CASHFREE_FETCH_FAILED",
        message: "Unable to verify order with Cashfree.",
      });
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
          "x-api-version": "2023-08-01",
        },
      });
      if (paymentsRes.ok) {
        const paymentsList = await paymentsRes.json();
        if (Array.isArray(paymentsList) && paymentsList.length > 0) {
          const successPayment =
            paymentsList.find((p: any) => p.payment_status === "SUCCESS") ||
            paymentsList[0];
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
        orderRecord: result.orderRecord,
      });
    } else {
      await fbPatch(`payment_orders/${orderId}`, {
        status: cfOrderStatus,
        paymentStatus: cfOrderStatus === "EXPIRED" ? "EXPIRED" : "FAILED",
        lastCheckedAt: Date.now(),
      });

      return res.json({
        verified: false,
        order_status: cfOrderStatus,
        payment_status: "FAILED",
        message: `Payment is ${cfOrderStatus}. Course not activated.`,
      });
    }
  } catch (err: any) {
    console.error("Verify Order Exception:", err);
    res
      .status(500)
      .json({ error: "VERIFICATION_ERROR", message: err.message || "Server Error" });
  }
};

app.get(
  [
    "/api/cashfree/verify-order/:orderId",
    "/cashfree/verify-order/:orderId",
    "/api/cashfree/verify-order",
    "/cashfree/verify-order",
  ],
  handleVerifyOrder
);

// 3. CASHFREE WEBHOOK LISTENER (GET & POST)
const handleWebhook = async (req: any, res: any) => {
  try {
    console.log("=== [Cashfree Webhook Received] ===");
    if (req.method === "GET" || req.method === "HEAD") {
      return res
        .status(200)
        .json({ status: "OK", message: "Cashfree Webhook Endpoint Active" });
    }

    const { webhookSecret } = await getCashfreeConfig();

    const signatureHeader = req.headers["x-webhook-signature"];
    const timestampHeader = req.headers["x-webhook-timestamp"];

    if (webhookSecret && signatureHeader && timestampHeader && req.rawBody) {
      try {
        const payloadToSign = timestampHeader + req.rawBody.toString("utf8");
        const computedSignature = crypto
          .createHmac("sha256", webhookSecret)
          .update(payloadToSign)
          .digest("base64");
        if (computedSignature !== signatureHeader) {
          console.warn(
            "[Cashfree Webhook] Signature mismatch! Proceeding with fallback check."
          );
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

    const webhookLogId = `wh_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await fbPut(`webhook_logs/${webhookLogId}`, {
      id: webhookLogId,
      orderId: orderId || "TEST_PING",
      eventType,
      payload: body,
      receivedAt: Date.now(),
    });

    if (
      orderId &&
      (eventType === "PAYMENT_SUCCESS_WEBHOOK" ||
        eventType === "ORDER_PAID" ||
        data.payment?.payment_status === "SUCCESS")
    ) {
      const paymentObj = data.payment || {};
      await fulfillOrder(orderId, paymentObj);
    }

    return res.status(200).json({
      status: "OK",
      received: true,
      message: "Webhook processed successfully",
    });
  } catch (err: any) {
    console.error("[Cashfree Webhook Error]:", err);
    return res
      .status(200)
      .json({ status: "OK", warning: "Error handled", details: err.message });
  }
};

app.all(
  [
    "/api/cashfree/webhook",
    "/cashfree/webhook",
    "/api/webhook",
    "/webhook",
    "/api/cashfree/webhook.js",
  ],
  handleWebhook
);

// =============================================================================
// RAZORPAY PAYMENT GATEWAY ENDPOINTS
// =============================================================================

// 3.1 CREATE RAZORPAY ORDER
app.post(
  ["/api/razorpay/create-order", "/razorpay/create-order"],
  async (req: any, res: any) => {
    try {
      const {
        courseId,
        courseTitle,
        userId,
        price,
        customerName,
        customerPhone,
        customerEmail,
        productType,
      } = req.body || {};

      if (!courseId || !userId || price === undefined || price === null) {
        return res
          .status(400)
          .json({ error: "Missing required fields (courseId, userId, price)" });
      }

      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({ error: "Invalid price specified." });
      }

      // Duplicate purchase check
      const userPurchased = await fbGet(`users/${userId}/purchased/${courseId}`);
      if (userPurchased) {
        return res.status(400).json({
          error: "ALREADY_OWNED",
          message: "You already own this course or product!",
        });
      }

      const { enabled, keyId, keySecret } = await getRazorpayConfig();

      if (!enabled) {
        return res.status(403).json({
          error: "GATEWAY_DISABLED",
          message:
            "Razorpay Payment Gateway is currently disabled by the administrator. Please select another payment method.",
        });
      }

      if (!keyId || !keySecret) {
        return res.status(400).json({
          error: "RAZORPAY_CONFIG_MISSING",
          message:
            "Razorpay API keys are not configured. Please add your Razorpay Key ID and Key Secret in Admin Panel -> Settings.",
        });
      }

      const rawOrderId = `order_rzp_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const orderId = rawOrderId.replace(/[^a-zA-Z0-9_]/g, "").substring(0, 40);
      const amountInPaise = Math.round(numericPrice * 100);

      let sanitizedPhone = String(customerPhone || "").replace(/\D/g, "");
      if (sanitizedPhone.length < 10) sanitizedPhone = "9999999999";
      if (sanitizedPhone.length > 15) sanitizedPhone = sanitizedPhone.substring(0, 15);

      const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

      const rzpPayload = {
        amount: amountInPaise,
        currency: "INR",
        receipt: orderId,
        notes: {
          order_id: orderId,
          course_id: String(courseId).substring(0, 50),
          course_title: String(courseTitle || courseId).substring(0, 100),
          user_id: String(userId).substring(0, 50),
          customer_name: String(customerName || "Student").substring(0, 100),
          customer_phone: sanitizedPhone,
        },
      };

      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify(rzpPayload),
      });

      const respText = await response.text();
      let rzpData: any = {};
      try {
        rzpData = JSON.parse(respText);
      } catch (_e) {
        return res.status(502).json({
          error: "RAZORPAY_BAD_GATEWAY",
          message: "Received invalid response from Razorpay API.",
        });
      }

      if (!response.ok || !rzpData.id) {
        const rzpErrMsg =
          rzpData?.error?.description ||
          rzpData?.message ||
          `Failed to create Razorpay order (HTTP ${response.status})`;
        console.error("[Razorpay Create Order Failed]:", response.status, respText);
        return res.status(response.status).json({
          error: "RAZORPAY_API_ERROR",
          message: rzpErrMsg,
          details: rzpData,
        });
      }

      const newOrderRecord = {
        orderId,
        razorpayOrderId: rzpData.id,
        gateway: "RAZORPAY",
        userId,
        courseId,
        courseTitle: courseTitle || "Course #" + courseId,
        productType: productType || "course",
        amount: numericPrice,
        amountInPaise,
        currency: rzpData.currency || "INR",
        customerName: customerName || "Student",
        customerEmail:
          customerEmail && customerEmail.includes("@")
            ? customerEmail.trim()
            : "student@theonlineclasses.com",
        customerPhone: sanitizedPhone,
        status: "PENDING",
        paymentStatus: "PENDING",
        createdAt: Date.now(),
        autoApproved: false,
      };

      await Promise.all([
        fbPut(`payment_orders/${orderId}`, newOrderRecord),
        fbPut(`razorpay_order_map/${rzpData.id}`, {
          orderId,
          razorpayOrderId: rzpData.id,
          userId,
          courseId,
          createdAt: Date.now(),
        }),
      ]);

      return res.json({
        success: true,
        order_id: orderId,
        razorpay_order_id: rzpData.id,
        amount: rzpData.amount,
        currency: rzpData.currency || "INR",
        key_id: keyId,
      });
    } catch (err: any) {
      console.error("Create Razorpay Order Exception:", err);
      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: err.message || "Server Error while creating Razorpay order.",
      });
    }
  }
);

// 3.2 VERIFY RAZORPAY PAYMENT (Signature + Server-to-Server Verification)
const handleVerifyRazorpayPayment = async (req: any, res: any) => {
  try {
    const body = req.body || {};
    const query = req.query || {};
    const params = req.params || {};

    let internalOrderId =
      body.orderId ||
      body.order_id ||
      params.orderId ||
      query.orderId ||
      query.order_id ||
      "";
    const razorpayOrderId =
      body.razorpay_order_id || query.razorpay_order_id || "";
    const razorpayPaymentId =
      body.razorpay_payment_id || query.razorpay_payment_id || "";
    const razorpaySignature =
      body.razorpay_signature || query.razorpay_signature || "";

    if (!internalOrderId && razorpayOrderId) {
      const mapped = await fbGet(`razorpay_order_map/${razorpayOrderId}`);
      if (mapped && mapped.orderId) {
        internalOrderId = mapped.orderId;
      }
    }

    if (!internalOrderId) {
      return res.status(400).json({ error: "Order ID is required for verification." });
    }

    const orderRecord = await fbGet(`payment_orders/${internalOrderId}`);
    const resolvedRzpOrderId =
      razorpayOrderId || (orderRecord && orderRecord.razorpayOrderId) || "";

    const { keyId, keySecret } = await getRazorpayConfig();
    if (!keyId || !keySecret) {
      return res.status(400).json({
        error: "RAZORPAY_CONFIG_MISSING",
        message: "Razorpay API keys are not configured on the server.",
      });
    }

    let isVerified = false;
    let verifiedPaymentId = razorpayPaymentId;
    let paymentMethodDetail = "Razorpay PG";

    // Step 1: Cryptographic HMAC-SHA256 signature verification
    if (resolvedRzpOrderId && razorpayPaymentId && razorpaySignature) {
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${resolvedRzpOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (expectedSignature === razorpaySignature) {
        isVerified = true;
      } else {
        console.warn("[Razorpay Verify] Signature mismatch, checking Razorpay API directly...");
      }
    }

    // Step 2: Server-to-Server API check (also auto-captures authorized payments if needed)
    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    if (resolvedRzpOrderId) {
      try {
        const paymentsRes = await fetch(
          `https://api.razorpay.com/v1/orders/${resolvedRzpOrderId}/payments`,
          {
            method: "GET",
            headers: {
              Authorization: `Basic ${basicAuth}`,
            },
          }
        );
        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          const items = Array.isArray(paymentsData.items) ? paymentsData.items : [];
          const capturedOrAuth = items.find(
            (p: any) => p.status === "captured" || p.status === "authorized"
          );
          if (capturedOrAuth) {
            isVerified = true;
            verifiedPaymentId = capturedOrAuth.id || verifiedPaymentId;
            if (capturedOrAuth.method) {
              paymentMethodDetail = `Razorpay (${String(capturedOrAuth.method).toUpperCase()})`;
            }
            // Auto-capture if status is "authorized"
            if (capturedOrAuth.status === "authorized" && capturedOrAuth.id) {
              try {
                await fetch(
                  `https://api.razorpay.com/v1/payments/${capturedOrAuth.id}/capture`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Basic ${basicAuth}`,
                    },
                    body: JSON.stringify({
                      amount: capturedOrAuth.amount,
                      currency: capturedOrAuth.currency || "INR",
                    }),
                  }
                );
              } catch (capErr) {
                console.warn("[Razorpay Auto-Capture Warning]:", capErr);
              }
            }
          }
        }
      } catch (apiErr) {
        console.warn("[Razorpay API Order Payments Check Warning]:", apiErr);
      }
    }

    if (isVerified) {
      const result = await fulfillOrder(internalOrderId, {
        gateway: "Razorpay",
        razorpay_payment_id: verifiedPaymentId,
        razorpay_order_id: resolvedRzpOrderId,
        transaction_id: verifiedPaymentId,
        payment_method: paymentMethodDetail,
      });

      return res.json({
        verified: true,
        order_status: "PAID",
        payment_status: "SUCCESS",
        message: "Razorpay payment verified and course unlocked!",
        invoice_number: result.orderRecord?.invoiceNumber,
        orderRecord: result.orderRecord,
      });
    } else {
      return res.json({
        verified: false,
        order_status: "PENDING",
        payment_status: "PENDING",
        message: "Payment not yet captured or signature invalid.",
      });
    }
  } catch (err: any) {
    console.error("Verify Razorpay Payment Exception:", err);
    return res.status(500).json({
      error: "VERIFICATION_ERROR",
      message: err.message || "Error verifying Razorpay payment.",
    });
  }
};

app.post(
  [
    "/api/razorpay/verify-payment",
    "/razorpay/verify-payment",
    "/api/razorpay/verify-order",
    "/razorpay/verify-order",
  ],
  handleVerifyRazorpayPayment
);

app.get(
  [
    "/api/razorpay/verify-order/:orderId",
    "/razorpay/verify-order/:orderId",
    "/api/razorpay/verify-order",
    "/razorpay/verify-order",
  ],
  handleVerifyRazorpayPayment
);

// 3.3 RAZORPAY WEBHOOK LISTENER
const handleRazorpayWebhook = async (req: any, res: any) => {
  try {
    console.log("=== [Razorpay Webhook Received] ===");
    if (req.method === "GET" || req.method === "HEAD") {
      return res
        .status(200)
        .json({ status: "OK", message: "Razorpay Webhook Endpoint Active" });
    }

    const { webhookSecret } = await getRazorpayConfig();
    const signatureHeader = req.headers["x-razorpay-signature"];

    if (webhookSecret && signatureHeader && req.rawBody) {
      try {
        const expectedSignature = crypto
          .createHmac("sha256", webhookSecret)
          .update(req.rawBody)
          .digest("hex");
        if (expectedSignature !== signatureHeader) {
          console.warn("[Razorpay Webhook] Signature mismatch!");
        } else {
          console.log("[Razorpay Webhook] Signature verified successfully.");
        }
      } catch (sigErr) {
        console.warn("[Razorpay Webhook] Signature check error:", sigErr);
      }
    }

    const body = req.body || {};
    const eventType = body.event || "UNKNOWN";
    const paymentEntity = body.payload?.payment?.entity || {};
    const orderEntity = body.payload?.order?.entity || {};
    const rzpOrderId = paymentEntity.order_id || orderEntity.id || "";

    let internalOrderId =
      paymentEntity.notes?.order_id ||
      orderEntity.notes?.order_id ||
      orderEntity.receipt ||
      "";

    if (!internalOrderId && rzpOrderId) {
      const mapped = await fbGet(`razorpay_order_map/${rzpOrderId}`);
      if (mapped && mapped.orderId) {
        internalOrderId = mapped.orderId;
      }
    }

    const webhookLogId = `wh_rzp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await fbPut(`webhook_logs/${webhookLogId}`, {
      id: webhookLogId,
      gateway: "RAZORPAY",
      orderId: internalOrderId || rzpOrderId || "TEST_PING",
      eventType,
      payload: body,
      receivedAt: Date.now(),
    });

    if (
      internalOrderId &&
      (eventType === "payment.captured" ||
        eventType === "payment.authorized" ||
        eventType === "order.paid" ||
        paymentEntity.status === "captured")
    ) {
      await fulfillOrder(internalOrderId, {
        gateway: "Razorpay",
        razorpay_payment_id: paymentEntity.id,
        razorpay_order_id: rzpOrderId,
        transaction_id: paymentEntity.id,
        payment_method: paymentEntity.method
          ? `Razorpay (${String(paymentEntity.method).toUpperCase()})`
          : "Razorpay PG",
      });
    }

    return res.status(200).json({
      status: "OK",
      received: true,
      message: "Razorpay webhook processed successfully",
    });
  } catch (err: any) {
    console.error("[Razorpay Webhook Error]:", err);
    return res
      .status(200)
      .json({ status: "OK", warning: "Error handled", details: err.message });
  }
};

app.all(
  ["/api/razorpay/webhook", "/razorpay/webhook", "/api/razorpay/webhook.js"],
  handleRazorpayWebhook
);

// =============================================================================
// ZAPUPI PAYMENT GATEWAY ENDPOINTS (https://zapupi.com)
// =============================================================================

// 3.4 CREATE ZAPUPI ORDER
app.post(
  ["/api/zapupi/create-order", "/zapupi/create-order"],
  async (req: any, res: any) => {
    try {
      const {
        courseId,
        courseTitle,
        userId,
        price,
        customerName,
        customerPhone,
        customerEmail,
        productType,
      } = req.body || {};

      if (!courseId || !userId || price === undefined || price === null) {
        return res
          .status(400)
          .json({ error: "Missing required fields (courseId, userId, price)" });
      }

      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({ error: "Invalid price specified." });
      }

      // Duplicate purchase check
      const userPurchased = await fbGet(`users/${userId}/purchased/${courseId}`);
      if (userPurchased) {
        return res.status(400).json({
          error: "ALREADY_OWNED",
          message: "You already own this course or product!",
        });
      }

      const { enabled, tokenKey, secretKey } = await getZapupiConfig();

      if (!enabled) {
        return res.status(403).json({
          error: "GATEWAY_DISABLED",
          message:
            "ZapUPI Payment Gateway is currently disabled by the administrator. Please select another payment method.",
        });
      }

      if (!tokenKey) {
        return res.status(400).json({
          error: "ZAPUPI_CONFIG_MISSING",
          message:
            "ZapUPI API credentials are not configured yet. Please add your ZapUPI Token Key & Secret Key in Admin Panel -> Settings.",
        });
      }

      // Alphanumeric Order ID (compatible with all ZapUPI endpoints)
      const orderId = `ZAP${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
      const secureBaseUrl = resolveSecureBaseUrl(req);
      const redirectUrl = `${secureBaseUrl}/?order_id=${orderId}&course_id=${encodeURIComponent(
        String(courseId)
      )}&gateway=zapupi`;
      const webhookUrl = `${secureBaseUrl}/api/zapupi/webhook`;

      let sanitizedPhone = String(customerPhone || "").replace(/\D/g, "");
      if (sanitizedPhone.length > 10) sanitizedPhone = sanitizedPhone.slice(-10);
      if (sanitizedPhone.length < 10) sanitizedPhone = "9999999999";

      const remarkText = `Course ${String(courseTitle || courseId)
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .substring(0, 40)}`;

      // Attempt 1: Official ZapUPI API (https://api.zapupi.com/api/create-order with form-urlencoded)
      const formParams = new URLSearchParams();
      formParams.append("token_key", tokenKey);
      if (secretKey) formParams.append("secret_key", secretKey);
      formParams.append("zap_key", tokenKey);
      formParams.append("amount", String(Math.round(numericPrice)));
      formParams.append("order_id", orderId);
      formParams.append("custumer_mobile", sanitizedPhone);
      formParams.append("customer_mobile", sanitizedPhone);
      formParams.append("redirect_url", redirectUrl);
      formParams.append("webhook_url", webhookUrl);
      formParams.append("remark", remarkText);

      let zapData: any = null;
      let paymentUrl = "";
      let lastErrorMsg = "";

      try {
        const res1 = await fetch("https://api.zapupi.com/api/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: formParams.toString(),
        });
        const text1 = await res1.text();
        try {
          zapData = JSON.parse(text1);
        } catch (_e) {
          zapData = null;
        }

        if (zapData) {
          paymentUrl =
            zapData.payment_url ||
            zapData.data?.payment_url ||
            zapData.result?.payment_url ||
            zapData.url ||
            "";
          if (!paymentUrl && zapData.message) {
            lastErrorMsg = String(zapData.message);
          }
        }
      } catch (e1: any) {
        console.warn("[ZapUPI Primary Endpoint Warning]:", e1.message);
      }

      // Attempt 2: Fallback to https://pay.zapupi.com/api/create-order (JSON) if paymentUrl not yet received
      if (!paymentUrl) {
        try {
          const res2 = await fetch("https://pay.zapupi.com/api/create-order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              token_key: tokenKey,
              secret_key: secretKey,
              zap_key: tokenKey,
              amount: String(Math.round(numericPrice)),
              order_id: orderId,
              custumer_mobile: sanitizedPhone,
              customer_mobile: sanitizedPhone,
              redirect_url: redirectUrl,
              webhook_url: webhookUrl,
              remark: remarkText,
            }),
          });
          const text2 = await res2.text();
          let zapData2: any = null;
          try {
            zapData2 = JSON.parse(text2);
          } catch (_e) {
            zapData2 = null;
          }
          if (zapData2) {
            paymentUrl =
              zapData2.payment_url ||
              zapData2.data?.payment_url ||
              zapData2.result?.payment_url ||
              zapData2.url ||
              "";
            if (paymentUrl) {
              zapData = zapData2;
            } else if (!lastErrorMsg && zapData2.message) {
              lastErrorMsg = String(zapData2.message);
            }
          }
        } catch (e2: any) {
          console.warn("[ZapUPI Fallback Endpoint Warning]:", e2.message);
        }
      }

      if (!paymentUrl) {
        console.error("[ZapUPI Create Order Error]:", zapData, lastErrorMsg);
        return res.status(400).json({
          error: "ZAPUPI_API_ERROR",
          message:
            lastErrorMsg ||
            "Failed to generate ZapUPI payment link. Please verify your ZapUPI Token Key and Secret Key in Admin Settings.",
          details: zapData,
        });
      }

      const newOrderRecord = {
        orderId,
        gateway: "ZAPUPI",
        paymentUrl,
        userId,
        courseId,
        courseTitle: courseTitle || "Course #" + courseId,
        productType: productType || "course",
        amount: Math.round(numericPrice),
        currency: "INR",
        customerName: customerName || "Student",
        customerEmail:
          customerEmail && customerEmail.includes("@")
            ? customerEmail.trim()
            : "student@theonlineclasses.com",
        customerPhone: sanitizedPhone,
        status: "PENDING",
        paymentStatus: "PENDING",
        createdAt: Date.now(),
        autoApproved: false,
      };

      await fbPut(`payment_orders/${orderId}`, newOrderRecord);

      return res.json({
        success: true,
        order_id: orderId,
        payment_url: paymentUrl,
        amount: Math.round(numericPrice),
        currency: "INR",
      });
    } catch (err: any) {
      console.error("Create ZapUPI Order Exception:", err);
      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: err.message || "Server error while creating ZapUPI order.",
      });
    }
  }
);

// 3.5 VERIFY ZAPUPI ORDER STATUS (Server-to-Server Verification)
const handleVerifyZapupiOrder = async (req: any, res: any) => {
  try {
    const orderId =
      req.params?.orderId ||
      req.query?.orderId ||
      req.query?.order_id ||
      req.body?.orderId ||
      req.body?.order_id ||
      "";

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required." });
    }

    // Check if already marked PAID by webhook
    const existingOrder = await fbGet(`payment_orders/${orderId}`);
    if (existingOrder && existingOrder.status === "PAID") {
      const fulfilled = await fulfillOrder(orderId, {
        gateway: "ZapUPI",
        transaction_id: existingOrder.transactionId || existingOrder.zapupiTxnId,
        payment_method: "ZapUPI (Instant UPI)",
      });
      return res.json({
        verified: true,
        order_status: "PAID",
        payment_status: "SUCCESS",
        message: "ZapUPI payment verified and course unlocked!",
        invoice_number: fulfilled.orderRecord?.invoiceNumber,
        orderRecord: fulfilled.orderRecord,
      });
    }

    const { tokenKey, secretKey } = await getZapupiConfig();
    if (!tokenKey) {
      return res.status(400).json({
        error: "ZAPUPI_CONFIG_MISSING",
        message: "ZapUPI credentials are not configured on the server.",
      });
    }

    const formParams = new URLSearchParams();
    formParams.append("token_key", tokenKey);
    if (secretKey) formParams.append("secret_key", secretKey);
    formParams.append("zap_key", tokenKey);
    formParams.append("order_id", String(orderId));

    let statusData: any = null;

    try {
      const res1 = await fetch("https://api.zapupi.com/api/order-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: formParams.toString(),
      });
      const text1 = await res1.text();
      try {
        statusData = JSON.parse(text1);
      } catch (_e) {
        statusData = null;
      }
    } catch (_e1) {}

    // Fallback check against pay.zapupi.com if primary didn't confirm success
    const extractZapStatus = (payload: any) => {
      if (!payload) return { isPaid: false, txnStatus: "PENDING", utr: "" };
      const inner = payload.data || payload.result || payload.order || payload;
      const rawTxnStatus = String(
        inner.status ||
          inner.txn_status ||
          inner.payment_status ||
          payload.txn_status ||
          payload.payment_status ||
          ""
      )
        .trim()
        .toUpperCase();
      const utr = String(
        inner.utr ||
          inner.bank_utr ||
          inner.txn_id ||
          inner.transaction_id ||
          payload.utr ||
          payload.txn_id ||
          ""
      ).trim();

      const isPaid =
        rawTxnStatus === "SUCCESS" ||
        rawTxnStatus === "PAID" ||
        rawTxnStatus === "COMPLETED" ||
        (String(payload.status).toLowerCase() === "success" &&
          (String(inner.status || "").toLowerCase() === "success" || Boolean(utr)));

      return {
        isPaid,
        txnStatus: rawTxnStatus || "PENDING",
        utr,
      };
    };

    let parsed = extractZapStatus(statusData);

    if (!parsed.isPaid) {
      try {
        const res2 = await fetch("https://pay.zapupi.com/api/order-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            token_key: tokenKey,
            secret_key: secretKey,
            zap_key: tokenKey,
            order_id: String(orderId),
          }),
        });
        const text2 = await res2.text();
        let statusData2: any = null;
        try {
          statusData2 = JSON.parse(text2);
        } catch (_e) {
          statusData2 = null;
        }
        const parsed2 = extractZapStatus(statusData2);
        if (parsed2.isPaid) {
          parsed = parsed2;
          statusData = statusData2;
        }
      } catch (_e2) {}
    }

    if (parsed.isPaid) {
      const result = await fulfillOrder(String(orderId), {
        gateway: "ZapUPI",
        utr: parsed.utr || `ZAP_${orderId}`,
        zapupi_txn_id: parsed.utr || `ZAP_${orderId}`,
        transaction_id: parsed.utr || `ZAP_${orderId}`,
        payment_method: "ZapUPI (Instant UPI)",
      });

      return res.json({
        verified: true,
        order_status: "PAID",
        payment_status: "SUCCESS",
        message: "ZapUPI payment verified and course activated!",
        invoice_number: result.orderRecord?.invoiceNumber,
        orderRecord: result.orderRecord,
      });
    }

    return res.json({
      verified: false,
      order_status:
        parsed.txnStatus === "FAILED" || parsed.txnStatus === "FAILURE"
          ? "FAILED"
          : "PENDING",
      payment_status: parsed.txnStatus || "PENDING",
      message:
        parsed.txnStatus === "FAILED" || parsed.txnStatus === "FAILURE"
          ? "Payment failed or was cancelled."
          : "Payment is still pending confirmation on ZapUPI.",
    });
  } catch (err: any) {
    console.error("Verify ZapUPI Order Exception:", err);
    return res.status(500).json({
      error: "VERIFICATION_ERROR",
      message: err.message || "Error verifying ZapUPI order.",
    });
  }
};

app.all(
  [
    "/api/zapupi/verify-order/:orderId",
    "/zapupi/verify-order/:orderId",
    "/api/zapupi/verify-order",
    "/zapupi/verify-order",
  ],
  handleVerifyZapupiOrder
);

// 3.6 ZAPUPI WEBHOOK LISTENER
const handleZapupiWebhook = async (req: any, res: any) => {
  try {
    console.log("=== [ZapUPI Webhook Received] ===");
    if (req.method === "GET" || req.method === "HEAD") {
      return res
        .status(200)
        .json({ status: "OK", message: "ZapUPI Webhook Endpoint Active" });
    }

    const body = req.body || {};
    const query = req.query || {};
    const payload = Object.keys(body).length > 0 ? body : query;
    const inner = payload.data || payload.result || payload;

    const orderId =
      inner.order_id ||
      inner.orderId ||
      payload.order_id ||
      payload.orderId ||
      "";
    const statusRaw = String(
      inner.status ||
        inner.txn_status ||
        inner.payment_status ||
        payload.status ||
        payload.txn_status ||
        ""
    )
      .trim()
      .toUpperCase();
    const utr = String(
      inner.utr ||
        inner.bank_utr ||
        inner.txn_id ||
        payload.utr ||
        payload.txn_id ||
        ""
    ).trim();

    const webhookLogId = `wh_zap_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await fbPut(`webhook_logs/${webhookLogId}`, {
      id: webhookLogId,
      gateway: "ZAPUPI",
      orderId: orderId || "TEST_PING",
      eventType: statusRaw || "WEBHOOK",
      payload,
      receivedAt: Date.now(),
    });

    if (
      orderId &&
      (statusRaw === "SUCCESS" || statusRaw === "PAID" || statusRaw === "COMPLETED")
    ) {
      await fulfillOrder(String(orderId), {
        gateway: "ZapUPI",
        utr: utr || `ZAP_${orderId}`,
        zapupi_txn_id: utr || `ZAP_${orderId}`,
        transaction_id: utr || `ZAP_${orderId}`,
        payment_method: "ZapUPI (Instant UPI)",
      });
    }

    return res.status(200).json({
      status: "OK",
      received: true,
      message: "ZapUPI webhook processed successfully",
    });
  } catch (err: any) {
    console.error("[ZapUPI Webhook Error]:", err);
    return res
      .status(200)
      .json({ status: "OK", warning: "Error handled", details: err.message });
  }
};

app.all(
  ["/api/zapupi/webhook", "/zapupi/webhook", "/api/zapupi/webhook.js"],
  handleZapupiWebhook
);

// 4. GENERATE PRINTABLE/DOWNLOADABLE INVOICE HTML
app.get(
  [
    "/api/cashfree/invoice/:orderId",
    "/cashfree/invoice/:orderId",
    "/api/cashfree/invoice",
    "/cashfree/invoice",
    "/api/razorpay/invoice/:orderId",
    "/razorpay/invoice/:orderId",
    "/api/zapupi/invoice/:orderId",
    "/zapupi/invoice/:orderId",
    "/api/invoice/:orderId",
  ],
  async (req: any, res: any) => {
    try {
      const orderId = req.params.orderId || req.query.orderId || req.query.order_id;
      const invoiceData =
        (await fbGet(`invoices/${orderId}`)) ||
        (await fbGet(`payment_orders/${orderId}`));

      if (!invoiceData) {
        return res
          .status(404)
          .send(
            "<h2 style='text-align:center;font-family:sans-serif;margin-top:50px;'>Invoice not found.</h2>"
          );
      }

      const invNum = invoiceData.invoiceNumber || `INV-${orderId}`;
      const issueDate = new Date(
        invoiceData.issuedAt || invoiceData.createdAt || Date.now()
      ).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const isZapupi =
        invoiceData.gateway === "ZAPUPI" ||
        String(invoiceData.paymentMethod || "")
          .toLowerCase()
          .includes("zapupi") ||
        String(orderId || "").startsWith("ZAP");
      const isRazorpay =
        !isZapupi &&
        (invoiceData.gateway === "RAZORPAY" ||
          String(invoiceData.paymentMethod || "")
            .toLowerCase()
            .includes("razorpay") ||
          String(orderId || "").includes("rzp"));
      const gatewayLabel =
        invoiceData.paymentMethod ||
        (isZapupi ? "ZapUPI PG" : isRazorpay ? "Razorpay PG" : "Cashfree PG");
      const gatewayFullTitle = isZapupi
        ? "ZapUPI Payment Gateway"
        : isRazorpay
        ? "Razorpay Payment Gateway"
        : "Cashfree Payment Gateway";

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
                        <p class="text-sm font-black text-slate-800">${
                          invoiceData.customerName || "Student"
                        }</p>
                        <p class="text-xs text-slate-600 font-medium mt-0.5">${
                          invoiceData.customerEmail || ""
                        }</p>
                        <p class="text-xs text-slate-600 font-medium mt-0.5">Phone: ${
                          invoiceData.customerPhone || "N/A"
                        }</p>
                    </div>
                    <div class="text-right">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">PAYMENT INFORMATION</p>
                        <p class="text-xs font-bold text-slate-800">Gateway: <span class="text-indigo-600">${gatewayLabel}</span></p>
                        <p class="text-xs text-slate-600 mt-1">Txn ID: <code class="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">${
                          invoiceData.transactionId || orderId
                        }</code></p>
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
                                    <p class="font-black text-sm text-slate-800">${
                                      invoiceData.courseTitle || "Purchased Course"
                                    }</p>
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
                            <span class="text-indigo-600">${formatINR(
                              invoiceData.amount || 0
                            )}</span>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="mt-12 border-t border-slate-100 pt-8 text-center text-xs text-slate-400 font-medium leading-relaxed">
                    <p class="font-bold text-slate-600">Thank you for learning with THE ONLINE CLASSES!</p>
                    <p class="mt-1">This is a computer-generated tax invoice verified by ${gatewayFullTitle}.</p>
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
  }
);

// 5. GET USER'S ORDER HISTORY
app.get(
  ["/api/cashfree/user-orders/:userId", "/cashfree/user-orders/:userId"],
  async (req: any, res: any) => {
    try {
      const { userId } = req.params;
      const allOrders = (await fbGet(`payment_orders`)) || {};

      const userOrders = Object.values(allOrders).filter(
        (o: any) => o && o.userId === userId
      );
      res.json({ success: true, orders: userOrders });
    } catch (err: any) {
      res.status(500).json({ error: "FETCH_FAILED", message: err.message });
    }
  }
);

// 6. ADMIN ENDPOINTS: GET ALL PAYMENT ORDERS & WEBHOOK LOGS
app.get(
  ["/api/cashfree/admin/all-orders", "/cashfree/admin/all-orders"],
  async (_req: any, res: any) => {
    try {
      const ordersObj = (await fbGet(`payment_orders`)) || {};
      const requestsObj = (await fbGet(`payment_requests`)) || {};
      const invoicesObj = (await fbGet(`invoices`)) || {};

      res.json({
        success: true,
        payment_orders: ordersObj,
        payment_requests: requestsObj,
        invoices: invoicesObj,
      });
    } catch (err: any) {
      res.status(500).json({ error: "ADMIN_FETCH_FAILED", message: err.message });
    }
  }
);

app.get(
  ["/api/cashfree/admin/webhook-logs", "/cashfree/admin/webhook-logs"],
  async (_req: any, res: any) => {
    try {
      const logsObj = (await fbGet(`webhook_logs`)) || {};
      res.json({ success: true, webhook_logs: logsObj });
    } catch (err: any) {
      res.status(500).json({ error: "FETCH_FAILED", message: err.message });
    }
  }
);

// Handle missing /api, /cashfree, /razorpay & /zapupi routes with JSON instead of Express default HTML 404
app.use(
  [
    "/api",
    "/api/*",
    "/cashfree",
    "/cashfree/*",
    "/razorpay",
    "/razorpay/*",
    "/zapupi",
    "/zapupi/*",
  ],
  (req: any, res: any) => {
    res.status(404).json({
      error: "API_ROUTE_NOT_FOUND",
      message: `API endpoint ${req.originalUrl || req.url} does not exist.`,
    });
  }
);

// Global API error handling middleware (always returns JSON)
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("Express Unhandled API Error:", err);
  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: err?.message || "Internal server error during API request.",
  });
});

export default app;
