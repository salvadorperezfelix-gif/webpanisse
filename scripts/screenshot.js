const puppeteer = require('puppeteer');

(async () => {
    const url = process.argv[2] || `file://${__dirname}/index.html`;
    const outputPath = 'screenshot.png';
    
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport({width: 1280, height: 800});
        console.log(`Cargando ${url}...`);
        await page.goto(url, {waitUntil: 'networkidle2'});
        await page.screenshot({path: outputPath, fullPage: true});
        console.log(`¡Captura de pantalla guardada en ${outputPath}!`);
        await browser.close();
    } catch (error) {
        console.error("Error al tomar la captura:", error);
    }
})();
