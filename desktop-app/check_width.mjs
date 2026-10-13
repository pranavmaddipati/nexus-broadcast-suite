import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  const widthData = await page.evaluate(() => {
    return {
      windowWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      appWidth: document.querySelector('.app')?.scrollWidth
    };
  });
  
  console.log(JSON.stringify(widthData, null, 2));
  await browser.close();
})();
