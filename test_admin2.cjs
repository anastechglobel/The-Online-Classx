const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    page.on('console', (msg) => {
        if (msg.type() === 'error') console.log('ERROR:', msg.text(), msg.location());
    });
    await page.goto('http://localhost:3000/admin.html', { waitUntil: 'networkidle0' });
    await browser.close();
    console.log("Admin check complete");
})();
