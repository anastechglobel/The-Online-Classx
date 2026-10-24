require('dotenv').config();
async function test() {
    const appId = process.env.CASHFREE_CLIENT_ID;
    const secretKey = process.env.CASHFREE_CLIENT_SECRET;
    const payload = {
        order_id: "order_12345678",
        order_amount: 10,
        order_currency: "INR",
        customer_details: {
            customer_id: "test1",
            customer_name: "Student",
            customer_email: "test@example.com",
            customer_phone: "919999999999"
        },
        order_meta: {
            return_url: "http://localhost:3000/?order_id=123&course_id=456&cf_status={param_placeholder_from_cashfree}",
            notify_url: "http://localhost:3000/api/cashfree/webhook"
        }
    };
    
    const response = await fetch("https://api.cashfree.com/pg/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-client-id": appId,
            "x-client-secret": secretKey,
            "x-api-version": "2023-08-01"
        },
        body: JSON.stringify(payload)
    });
    
    console.log(response.status);
    console.log(await response.text());
}
test();
