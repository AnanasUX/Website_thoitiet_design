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

    // Verify TC-031 (Nationwide Weather)
    const tc031Row = page.locator('#matrixTableBody tr:has-text("TC-031")');
    const tc031Status = await tc031Row.locator('.badge-status.PASS').isVisible().catch(() => false);
    console.log('TC-031 Status is PASS:', tc031Status);

    // Verify TC-036 (Stress & Memory Guard)
    const tc036Row = page.locator('#matrixTableBody tr:has-text("TC-036")');
    const tc036Status = await tc036Row.locator('.badge-status.PASS').isVisible().catch(() => false);
    console.log('TC-036 Status is PASS:', tc036Status);

    // Verify TC-038 (Anti-SSRF Defense)
    const tc038Row = page.locator('#matrixTableBody tr:has-text("TC-038")');
    const tc038Status = await tc038Row.locator('.badge-status.PASS').isVisible().catch(() => false);
    console.log('TC-038 Status is PASS:', tc038Status);

    // Verify TC-040 (Deep Injection Defense)
    const tc040Row = page.locator('#matrixTableBody tr:has-text("TC-040")');
    const tc040Status = await tc040Row.locator('.badge-status.PASS').isVisible().catch(() => false);
    console.log('TC-040 Status is PASS:', tc040Status);

    // Verify TC-042 (Request Integrity & Headers)
    const tc042Row = page.locator('#matrixTableBody tr:has-text("TC-042")');
    const tc042Status = await tc042Row.locator('.badge-status.PASS').isVisible().catch(() => false);
    console.log('TC-042 Status is PASS:', tc042Status);

    // Verify TC-043 (AES-256-GCM Envelope Encryption)
    const tc043Row = page.locator('#matrixTableBody tr:has-text("TC-043")');
    const tc043Status = await tc043Row.locator('.badge-status.PASS').isVisible().catch(() => false);
    console.log('TC-043 Status is PASS:', tc043Status);

    // Verify TC-044 (Zero-Knowledge In-Memory Decryption Gate)
    const tc044Row = page.locator('#matrixTableBody tr:has-text("TC-044")');
    const tc044Status = await tc044Row.locator('.badge-status.PASS').isVisible().catch(() => false);
    console.log('TC-044 Status is PASS:', tc044Status);

    // Verify TC-045 (Data Masking & Secret Leak Scanner)
    const tc045Row = page.locator('#matrixTableBody tr:has-text("TC-045")');
    const tc045Status = await tc045Row.locator('.badge-status.PASS').isVisible().catch(() => false);
    console.log('TC-045 Status is PASS:', tc045Status);

    // Verify TC-046 (Article Video Engine)
    const tc046Row = page.locator('#matrixTableBody tr:has-text("TC-046")');
    const tc046Status = await tc046Row.locator('.badge-status.PASS').isVisible().catch(() => false);
    console.log('TC-046 Status is PASS:', tc046Status);

    // Verify TC-047 (VieNeu-TTS AI Audio Engine)
    const tc047Row = page.locator('#matrixTableBody tr:has-text("TC-047")');
    const tc047Status = await tc047Row.locator('.badge-status.PASS').isVisible().catch(() => false);
    console.log('TC-047 Status is PASS:', tc047Status);

    // -------------------------------------------------------------------------
    // PHASE 2: Testing Cryptographic Vault Interactive Panel & Auto-Unlock
    // -------------------------------------------------------------------------
    console.log('\n--- PHASE 2: Testing Cryptographic Vault Auto-Unlock & Interactive Panel ---');
    // 1. Kiểm tra tính năng Tự động điền & Tự động mở khóa (Auto-fill & Auto-unlock) cho tài khoản Quản trị viên
    const initialGemini = await page.locator('#vaultValGemini').textContent();
    const initialPpt = await page.locator('#vaultValDrivePpt').textContent();
    const initialBadge = await page.locator('#vaultStatusBadge').textContent();
    const initialKey = await page.locator('#vaultMasterKey').inputValue();
    console.log('1. Auto-unlocked secret value in RAM (Gemini):', initialGemini);
    console.log('2. Auto-unlocked status badge:', initialBadge);
    console.log('3. Auto-filled Master Key length:', initialKey.length);

    const isAutoUnlockedForAdmin = initialGemini.includes('AIzaSy') && initialPpt.includes('ppt-folder') && initialKey === 'AnanasMaster@2026!Key';

    // 2. Click lock & scrub RAM
    await page.locator('#vaultLockBtn').click();
    await page.waitForTimeout(300);

    const relockedBadge = await page.locator('#vaultStatusBadge').textContent();
    const relockedGemini = await page.locator('#vaultValGemini').textContent();
    const relockedKey = await page.locator('#vaultMasterKey').inputValue();
    console.log('4. Relocked status badge:', relockedBadge);
    console.log('5. Relocked secret value:', relockedGemini);
    const isSuccessfullyScrubbed = relockedGemini.includes('ENCRYPTED_DATA_LOCKED') && relockedKey === '';

    // 3. Click demo fill & auto-unlock button
    await page.locator('#vaultFillDemoBtn').click();
    await page.waitForTimeout(500);

    const reunlockedBadge = await page.locator('#vaultStatusBadge').textContent();
    const reunlockedGemini = await page.locator('#vaultValGemini').textContent();
    const reunlockedPpt = await page.locator('#vaultValDrivePpt').textContent();
    console.log('6. Re-unlocked status badge:', reunlockedBadge);
    console.log('7. Re-unlocked secret value in RAM:', reunlockedGemini);
    const isSuccessfullyUnlocked = reunlockedGemini.includes('AIzaSy') && reunlockedPpt.includes('ppt-folder');

    // -------------------------------------------------------------------------
    // PHASE 3: Testing Antigravity Copilot Bug Simulation & Auto-Dispatch
    // -------------------------------------------------------------------------
    console.log('\n--- PHASE 3: Testing Antigravity Copilot Bug Simulation & Auto-Dispatch ---');
    // Open Copilot Modal from Toolbar
    await page.locator('#copilotBtn').click();
    await page.waitForTimeout(400);

    await page.locator('#copilotSimulateBugBtn').click();
    await page.waitForTimeout(600);

    const isBlocked = await page.locator('#releaseGateBanner.blocked').isVisible();
    const isGateBtnVisible = await page.locator('#gateCopilotBtn').isVisible();
    const isModalOpen = await page.locator('#copilotModal').isVisible();
    const activeTask = await page.evaluate(() => localStorage.getItem('antigravity_active_task'));

    console.log('8. Release Gate Banner turned BLOCKED:', isBlocked);
    console.log('9. Gate Copilot Button on Banner is visible:', isGateBtnVisible);
    console.log('10. Copilot Modal opened automatically:', isModalOpen);
    console.log('11. localStorage.antigravity_active_task auto-dispatched:', Boolean(activeTask));

    // PHASE 4: Restoring back to 100% PASS
    console.log('Restoring back to 100% PASS...');
    await page.locator('#copilotSimulateBugBtn').click();
    await page.waitForTimeout(600);

    const isPassedAgain = await page.locator('#releaseGateBanner.passed').isVisible();
    console.log('12. Release Gate Banner restored to PASSED:', isPassedAgain);

    if (passCount === 47 && failCount === 0 && tc046Status && tc047Status && isAutoUnlockedForAdmin && isSuccessfullyUnlocked && isSuccessfullyScrubbed && isBlocked && isGateBtnVisible && isModalOpen && Boolean(activeTask) && isPassedAgain) {
      console.log('🎉 SUCCESS: All 47 tests ran, Article Video, VieNeu-TTS AI Audio, Cryptographic Vault Auto-Unlock & Antigravity Copilot Auto-Dispatch verified 100%!');
      process.exitCode = 0;
    } else {
      console.error(`❌ FAILURE in verification: pass=${passCount}, fail=${failCount}, tc046=${tc046Status}, tc047=${tc047Status}, isAutoUnlockedForAdmin=${isAutoUnlockedForAdmin}, isSuccessfullyUnlocked=${isSuccessfullyUnlocked}, isSuccessfullyScrubbed=${isSuccessfullyScrubbed}, isBlocked=${isBlocked}, isGateBtnVisible=${isGateBtnVisible}, activeTask=${Boolean(activeTask)}`);
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
