import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  const html = await page.evaluate(() => {
    // Find the Broadcast Health panel parent
    const panels = document.querySelectorAll('.depth-layer-3');
    if (panels.length >= 2) {
      return panels[1].outerHTML;
    }
    return "Not found";
  });
  
  console.log(html);
  await browser.close();
})();
