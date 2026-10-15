import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

// Start a local static server serving the built site
function startServer(port = 4174) {
  return new Promise((resolve, reject) => {
    const root = process.cwd();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.mjs': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.svg': 'image/svg+xml'
    };

    const server = http.createServer((req, res) => {
      let rawPath = req.url.split('?')[0];
      if (rawPath === '/') rawPath = '/index.html';
      
      // Look in dist or root
      let filePath = path.join(root, rawPath.replace(/^\//, ''));
      if (!fs.existsSync(filePath)) {
        filePath = path.join(root, 'dist', rawPath.replace(/^\//, ''));
      }

      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found: ' + req.url);
        return;
      }

      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*' });
      fs.createReadStream(filePath).pipe(res);
    });

    server.listen(port, '127.0.0.1', () => {
      console.log(`Test server running at http://127.0.0.1:${port}`);
      resolve(server);
    });
    server.on('error', reject);
  });
}

async function runDashboardTest() {
  const server = await startServer(4174);
  let browser;

  try {
    try {
      browser = await chromium.launch({ channel: 'chrome', headless: true });
    } catch {
      browser = await chromium.launch({ channel: 'msedge', headless: true });
    }

    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    console.log('Navigating to http://127.0.0.1:4174/dashboard.html...');
    await page.goto('http://127.0.0.1:4174/dashboard.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const runBtn = page.locator('#runAllTestsBtn');
    const isVisible = await runBtn.isVisible();
    console.log('Button #runAllTestsBtn is visible:', isVisible);

    console.log('Clicking "Chạy Kiểm Thử Toàn Hệ Thống"...');
    await runBtn.click();

    let lastProgress = '';
    const startTime = Date.now();

    while (Date.now() - startTime < 45000) {
      const progressText = await page.locator('#progressPercent').textContent().catch(() => '');
      const currentTitle = await page.locator('#progressTitle').textContent().catch(() => '');
      const btnText = await page.locator('#runBtnText').textContent().catch(() => '');

      if (progressText !== lastProgress) {
        lastProgress = progressText;
        console.log(`  >>> Progress: ${progressText} | ${currentTitle}`);
      }

      if (progressText.includes('100%') && btnText === 'Chạy Kiểm Thử Toàn Hệ Thống') {
        console.log('✅ In-browser test runner finished 100% successfully!');
        break;
      }

      await page.waitForTimeout(500);
    }

    // Verify all test cases passed in table
    const passCount = await page.locator('#matrixTableBody .badge-status.PASS').count();
    const failCount = await page.locator('#matrixTableBody .badge-status.FAIL').count();
    console.log(`Final Matrix Results: ${passCount} PASS, ${failCount} FAIL`);

    // Verify TC-023 specifically
    const tc023Row = page.locator('#matrixTableBody tr:has-text("TC-023")');
    const tc023Status = await tc023Row.locator('.badge-status.PASS').isVisible().catch(() => false);
    console.log('TC-023 Status is PASS:', tc023Status);

    // Verify TC-024 specifically
    const tc024Row = page.locator('#matrixTableBody tr:has-text("TC-024")');
    const tc024Status = await tc024Row.locator('.badge-status.PASS').isVisible().catch(() => false);
    console.log('TC-024 Status is PASS:', tc024Status);

    // Verify TC-020 specifically (last test in runner)
    const tc020Row = page.locator('#matrixTableBody tr:has-text("TC-020")');
    const tc020Status = await tc020Row.locator('.badge-status.PASS').isVisible().catch(() => false);
    console.log('TC-020 Status is PASS:', tc020Status);

    if (passCount === 30 && failCount === 0) {
      console.log('🎉 SUCCESS: All 30 tests ran and PASSED without stopping or errors!');
      process.exitCode = 0;
    } else {
      console.error(`❌ FAILURE: pass=${passCount}, fail=${failCount}`);
      process.exitCode = 1;
    }
  } finally {
    if (browser) await browser.close();
    server.close();
  }
}

runDashboardTest().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
