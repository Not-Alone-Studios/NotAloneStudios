const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }, // Standard Desktop
    deviceScaleFactor: 2,
    hasTouch: false,
    isMobile: false
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:8080...');
  await page.goto('http://localhost:8080');

  // Smooth scroll to bottom to trigger all reveals
  console.log('Scrolling to trigger animations...');
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 50);
    });
  });

  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000); // let things settle
  
  await page.screenshot({ path: 'screenshots/desktop-full.png', fullPage: true });
  console.log('Full page screenshot saved: screenshots/desktop-full.png');

  // 1. Hero Segment Switch
  const segmentSwitch = await page.$('.segment-switch');
  if (segmentSwitch) {
    await segmentSwitch.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await segmentSwitch.screenshot({ path: 'screenshots/desktop-segment-switch.png' });
    console.log('Captured Segment Switch');
  }

  // 4. Proof Ladder
  const ladder = await page.$('.proof-ladder');
  if (ladder) {
    await ladder.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await ladder.screenshot({ path: 'screenshots/desktop-proof-ladder.png' });
    console.log('Captured Proof Ladder');
  }

  // 6. Seal Band
  const seal = await page.$('.seal-band');
  if (seal) {
    await seal.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await seal.screenshot({ path: 'screenshots/desktop-seal-band.png' });
    console.log('Captured Seal Band');
  }

  // 7. System Map (on Maulya products page)
  console.log('Navigating to Maulya product page...');
  await page.goto('http://localhost:8080/products/maulya/');
  
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 150;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 50);
    });
  });

  const sysMap = await page.$('.system-map');
  if (sysMap) {
    await sysMap.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await sysMap.screenshot({ path: 'screenshots/desktop-system-map.png' });
    console.log('Captured System Map');
  }

  await browser.close();
  console.log('Done!');
})();
