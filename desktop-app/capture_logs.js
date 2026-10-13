const { chromium } = require('playwright');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE ${msg.type()}]`, msg.text());
  });

  page.on('pageerror', error => {
    console.error(`[BROWSER ERROR]`, error.message);
  });

  console.log('Navigating to http://localhost:5180...');
  
  try {
    await page.goto('http://localhost:5180', { timeout: 30000 });
    console.log('Navigation complete. Waiting 10 seconds to collect logs...');
    await page.waitForTimeout(10000);
  } catch (err) {
    console.error('[NAVIGATION TIMEOUT OR ERROR]', err.message);
  }

  await browser.close();
  console.log('Done.');
})();
