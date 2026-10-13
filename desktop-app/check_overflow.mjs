import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  
  // Wait for React to render
  await new Promise(r => setTimeout(r, 2000));

  const overflowInfo = await page.evaluate(() => {
    // Find Scene Library container
    const sceneHeaders = Array.from(document.querySelectorAll('span')).filter(el => el.textContent === 'LIVE SCENES');
    let sceneContainer = null;
    if (sceneHeaders.length > 0) {
      sceneContainer = sceneHeaders[0].closest('.depth-layer-2') || sceneHeaders[0].parentElement.parentElement.parentElement;
    }
    
    // Find Sources container
    const sourcesHeaders = Array.from(document.querySelectorAll('span')).filter(el => el.textContent === 'SOURCES');
    let sourcesContainer = null;
    if (sourcesHeaders.length > 0) {
      sourcesContainer = sourcesHeaders[0].closest('.depth-layer-2') || sourcesHeaders[0].parentElement.parentElement.parentElement;
    }

    // AI Copilot 
    const copilotHeaders = Array.from(document.querySelectorAll('span')).filter(el => el.textContent === 'AI COPILOT');
    let copilotContainer = null;
    if (copilotHeaders.length > 0) {
      copilotContainer = copilotHeaders[0].closest('.depth-layer-1') || copilotHeaders[0].parentElement.parentElement.parentElement;
    }

    const getMetrics = (el) => {
      if (!el) return 'Not found';
      
      const scrollable = el.querySelector('[style*="overflow-y: auto"], [style*="overflowY: auto"]') || el;
      
      return {
        outerClientHeight: el.clientHeight,
        outerScrollHeight: el.scrollHeight,
        innerClientHeight: scrollable.clientHeight,
        innerScrollHeight: scrollable.scrollHeight,
      };
    };

    return {
      sceneLibrary: getMetrics(sceneContainer),
      sources: getMetrics(sourcesContainer),
      copilot: getMetrics(copilotContainer),
    };
  });

  console.log(JSON.stringify(overflowInfo, null, 2));
  await browser.close();
})();
