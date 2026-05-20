const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 32, height: 32, deviceScaleFactor: 4 });

  await page.setContent(`<!DOCTYPE html>
<html>
<head>
<link href="https://fonts.googleapis.com/css2?family=Parisienne&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 32px; height: 32px; background: #fff; overflow: hidden; }
  .p {
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Parisienne', cursive;
    font-size: 26px;
    color: #0d0d0d;
    line-height: 1;
    padding-top: 3px;
  }
</style>
</head>
<body><div class="p">P</div></body>
</html>`);

  // Wait for font to load
  await page.waitForFunction(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 800));

  const sizes = [16, 32, 48, 180];
  for (const size of sizes) {
    await page.setViewport({ width: size, height: size, deviceScaleFactor: size <= 32 ? 4 : 2 });
    await page.evaluate((s) => {
      document.querySelector('.p').style.width = s + 'px';
      document.querySelector('.p').style.height = s + 'px';
      document.querySelector('.p').style.fontSize = Math.round(s * 0.82) + 'px';
    }, size);
    const fname = size === 180 ? 'apple-touch-icon.png' : `favicon-${size}.png`;
    await page.screenshot({ path: fname, omitBackground: false, clip: { x: 0, y: 0, width: size, height: size } });
    console.log('Generated', fname);
  }

  await browser.close();
})();
