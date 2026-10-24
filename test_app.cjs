const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    let hasError = false;
    
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            console.log('CONSOLE ERROR:', msg.text());
            hasError = true;
        }
    });

    page.on('pageerror', (err) => {
        console.log('PAGE ERROR:', err.toString());
        hasError = true;
    });

    console.log("Checking index.html...");
    await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0' });
    
    console.log("Checking admin.html...");
    await page.goto('http://localhost:3000/admin.html', { waitUntil: 'networkidle0' });
    
    await browser.close();
    console.log("Check complete. Has errors:", hasError);
})();
