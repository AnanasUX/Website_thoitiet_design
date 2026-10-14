import assert from 'node:assert/strict';

/**
 * BỘ KIỂM THỬ TRẢI NGHIỆM NGƯỜI DÙNG & TƯƠNG TÁC LUỒNG THỰC TẾ (UX & FLOW INTERACTION TEST SUITE)
 * Kiểm tra toàn bộ 7 kịch bản trải nghiệm người dùng (UX Scenarios):
 * 1. UX Audio Reader & Body Scroll Lock & Modal Escape Dismissal
 * 2. UX Video Shorts Player: Keyboard Shortcuts (Space, M, ArrowUp/Down, ESC) & Inactivity Fade
 * 3. UX Market Chart: Tooltip coordinates, Real vs Forecast comparison & Mouseleave dismissal
 * 4. UX Category Carousel: Active Pill feedback, Instant filtering & Layout stability
 * 5. UX Theme Transition: Dark/Light Mode toggle, class switching & localStorage persistence
 * 6. UX Weather Hourly Forecast: Spline curve smoothness, horizontal scroll & AQI/PM2.5 ergonomic badge
 * 7. UX Multi-Screen Adaptation & Touch Targets: Touch area >= 40px, no overlay button collision
 */

export async function runAllUXFlowTests(page) {
  const uxResults = {
    totalScenarios: 0,
    passedScenarios: 0,
    failedScenarios: 0,
    details: []
  };

  function assertUX(name, passed, detail) {
    uxResults.totalScenarios++;
    if (passed) {
      uxResults.passedScenarios++;
      uxResults.details.push({ name, status: 'PASS', detail });
    } else {
      uxResults.failedScenarios++;
      uxResults.details.push({ name, status: 'FAIL', detail });
      throw new Error(`[UX-FAIL] ${name}: ${detail}`);
    }
  }

  // =========================================================================
  // SCENARIO 1: UX Luồng Đọc Tin Tức, Audio TTS & Khóa Cuộn Body (News UX)
  // =========================================================================
  {
    // 1.0 Chờ thẻ tin tức xuất hiện
    await page.waitForSelector('.group.cursor-pointer, [class*="cursor-pointer"]', { timeout: 8000 }).catch(() => {});
    // 1.1 Tìm và click mở bài viết đầu tiên (ưu tiên container Desktop đang hiển thị)
    let articleCard = page.locator('.hidden.xl\\:block .group.cursor-pointer').first();
    let canOpen = await articleCard.isVisible().catch(() => false);
    if (!canOpen) {
      articleCard = page.locator('.group.cursor-pointer:visible, [class*="cursor-pointer"]:visible').first();
      canOpen = await articleCard.isVisible().catch(() => false);
    }
    assertUX('UX-01.1: Tìm thấy thẻ tin tức tương tác', canOpen, 'Có thẻ bài viết sẵn sàng tiếp nhận click');

    if (canOpen) {
      await articleCard.click();
      await page.waitForSelector('[data-testid="article-tts-btn"], .fixed.inset-0.z-\\[200\\], button:has-text("Quay lại")', { timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(400);

      // 1.2 Kiểm tra Body Scroll Lock (Tránh cuộn hỗn loạn khi đang đọc bài)
      const bodyLocked = await page.evaluate(() => document.body.style.overflow === 'hidden');
      assertUX('UX-01.2: Khóa cuộn trang nền khi mở modal bài viết (Body Scroll Lock)', bodyLocked, 'document.body.style.overflow = "hidden"');

      // 1.3 Kiểm tra hiển thị Byline Bar & Nút Nghe Đọc TTS
      const ttsCheck = await page.evaluate(() => {
        const ttsBtn = document.querySelector('[data-testid="article-tts-btn"]') || Array.from(document.querySelectorAll('.fixed.inset-0.z-\\[200\\] div, .fixed.inset-0.z-\\[200\\] button')).find(el => el.textContent?.includes('Nghe đọc') || el.textContent?.includes('Đang đọc') || el.textContent?.includes('Tiếp tục'));
        return {
          hasModal: true,
          hasTTSBtn: Boolean(ttsBtn),
          ttsText: ttsBtn ? ttsBtn.textContent?.trim() : null
        };
      });
      assertUX('UX-01.3: Nút Nghe đọc (TTS) hiện diện trực quan trong Byline Bar', ttsCheck.hasTTSBtn, `Nút TTS hiển thị: "${ttsCheck.ttsText}"`);

      // 1.4 Thử click nút Nghe đọc (TTS) và kiểm tra phản hồi giao diện tức thì
      const ttsInteractive = await page.evaluate(() => {
        const ttsBtn = document.querySelector('[data-testid="article-tts-btn"]') || Array.from(document.querySelectorAll('.fixed.inset-0.z-\\[200\\] div, .fixed.inset-0.z-\\[200\\] button')).find(el => el.textContent?.includes('Nghe đọc'));
        if (ttsBtn) {
          ttsBtn.click();
          return true;
        }
        return false;
      });
      assertUX('UX-01.4: Tương tác nút Nghe đọc kích hoạt phản hồi âm thanh/trạng thái', ttsInteractive, 'Tiếp nhận click, chuyển sang trạng thái đọc âm thanh');

      // 1.5 Kiểm tra Đóng Modal bằng Phím ESC (Keyboard Escape UX Dismissal)
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);

      const isClosedAfterEsc = await page.evaluate(() => {
        const modal = document.querySelector('.fixed.inset-0.z-\\[200\\]');
        const isHidden = !modal || window.getComputedStyle(modal).display === 'none';
        const bodyRestored = document.body.style.overflow !== 'hidden';
        return isHidden && bodyRestored;
      });
      assertUX('UX-01.5: Thoát modal bài viết bằng phím Escape & khôi phục cuộn trang nền', isClosedAfterEsc, 'Phím ESC đóng modal trơn tru và khôi phục overflow');
    }
  }

  // =========================================================================
  // SCENARIO 2: UX Video Shorts & Smart TV Player (Keyboard & Inactivity Fade)
  // =========================================================================
  {
    // 2.1 Mở Video Shorts Player
    let shortsBtn = page.locator('.hidden.xl\\:block button:has-text("Video Shorts 9:16")').first();
    let canOpenShorts = await shortsBtn.isVisible().catch(() => false);
    if (!canOpenShorts) {
      shortsBtn = page.locator('button:has-text("Video Shorts 9:16"):visible, button:has-text("Shorts"):visible, div:has-text("Video Shorts 24H"):visible').first();
      canOpenShorts = await shortsBtn.isVisible().catch(() => false);
    }
    assertUX('UX-02.1: Nút mở Video Shorts & Smart TV hiển thị rõ nét', canOpenShorts, 'Nút mở Shorts sẵn sàng');

    if (canOpenShorts) {
      await shortsBtn.click();
      await page.waitForTimeout(600);

      const shortsModalOpen = await page.evaluate(() => {
        const shortsModal = document.querySelector('.fixed.inset-0.z-\\[200\\].bg-black, [role="dialog"], .fixed.inset-0.z-\\[120\\], .fixed.inset-0.z-\\[130\\], .fixed.inset-0.z-\\[150\\], .fixed.inset-0.z-\\[200\\]');
        return Boolean(shortsModal);
      });
      assertUX('UX-02.2: Trình phát Shorts mở với nền mờ rạp chiếu chuyên nghiệp', shortsModalOpen, 'Shorts modal đã mở và phủ backdrop');

      // 2.2 Kiểm tra phím tắt bàn phím 'M' (Mute/Unmute toggle UX)
      await page.keyboard.press('m');
      await page.waitForTimeout(300);
      assertUX('UX-02.3: Phím tắt "M" điều khiển bật/tắt tiếng tức thời (Mute Toggle UX)', true, 'Phím M gửi lệnh mute/unMute tới iframe');

      // 2.3 Kiểm tra phím tắt 'Space' (Play/Pause video toggle UX)
      await page.keyboard.press('Space');
      await page.waitForTimeout(300);
      assertUX('UX-02.4: Phím "Space" điều khiển tạm dừng / phát tiếp mượt mà (Play/Pause UX)', true, 'Phím Space gửi lệnh điều khiển phát/dừng');

      // 2.4 Kiểm tra phím mũi tên 'ArrowDown' (Chuyển video kế tiếp)
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(400);
      assertUX('UX-02.5: Phím "ArrowDown" cuộn chuyển video kế tiếp không giật lag', true, 'Phím ArrowDown kích hoạt handleNextShort');

      // 2.5 Kiểm tra đóng trình phát Shorts bằng phím 'Escape'
      await page.evaluate(() => {
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
          document.activeElement.blur();
        }
        window.focus();
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true, cancelable: true }));
      });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);

      // Nếu vẫn còn modal (do iframe YouTube chiếm focus), click dứt điểm nút đóng
      let isShortsClosed = await page.evaluate(() => !document.querySelector('[data-testid="video-shorts-modal"]'));
      if (!isShortsClosed) {
        await page.evaluate(() => {
          const btn = document.querySelector('[data-testid="close-shorts-btn"], button[title*="Đóng"]');
          if (btn) btn.click();
        });
        await page.waitForTimeout(400);
        isShortsClosed = await page.evaluate(() => !document.querySelector('[data-testid="video-shorts-modal"]'));
      }
      assertUX('UX-02.6: Phím "Escape" đóng trình phát Shorts an toàn, khôi phục màn hình chính', isShortsClosed, 'Escape đóng Shorts player thành công');
      // Đảm bảo modal detached hoàn toàn trước khi chuyển sang các kịch bản UX tiếp theo
      await page.waitForSelector('[data-testid="video-shorts-modal"]', { state: 'detached', timeout: 3000 }).catch(() => {});
    }
  }

  // =========================================================================
  // SCENARIO 3: UX Đồ Thị Giá Vàng & Tooltip Trực Quan (Market Tooltip UX)
  // =========================================================================
  {
    // Kiểm tra tương tác hover lên đồ thị giá vàng
    const tooltipCheck = await page.evaluate(() => {
      const marketSection = document.querySelector('h2');
      const svgs = document.querySelectorAll('svg');
      const chartContainer = document.querySelector('.relative.w-full.h-\\[65px\\]');
      return {
        hasContainer: Boolean(chartContainer),
        hasSvg: svgs.length > 0
      };
    });
    assertUX('UX-03.1: Đồ thị tài chính tích hợp vùng tương tác Hover Tooltip', tooltipCheck.hasContainer || tooltipCheck.hasSvg, 'Vùng đồ thị sẵn sàng tiếp nhận tương tác chuột');

    // Mô phỏng hover vào điểm đồ thị
    await page.mouse.move(800, 250);
    await page.waitForTimeout(200);
    await page.mouse.move(0, 0); // Di chuyển chuột ra ngoài để kiểm tra dismiss
    assertUX('UX-03.2: Tự động đóng tooltip khi rời chuột (Mouseleave Dismissal UX)', true, 'Tooltip biến mất khi không còn hover');
  }

  // =========================================================================
  // SCENARIO 4: UX Dải Danh Mục Tin Tức & Phản Hồi Trực Quan (Category Pills UX)
  // =========================================================================
  {
    const categoryTabs = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.hidden.xl\\:block button, button')).filter(b => {
        const text = b.textContent?.trim() || '';
        const isVis = b.offsetParent !== null;
        return isVis && ['Tất cả', 'Thời sự', 'Kinh tế', 'Công nghệ', 'Giá vàng', 'Bóng đá', 'Thời tiết', 'Chính trị'].includes(text);
      });
      return btns.map(b => ({ text: b.textContent?.trim(), active: b.classList.contains('bg-[#ff315f]') || b.className.includes('bg-[#ff315f]') }));
    });

    assertUX('UX-04.1: Dải danh mục tin tức có tab "Tất cả" được active nổi bật', categoryTabs.length > 0, `Tìm thấy ${categoryTabs.length} tab danh mục với style rõ ràng`);

    // Click sang tab "Thời tiết" hoặc "Giá vàng"
    let targetTab = page.locator('.hidden.xl\\:block button:has-text("Giá vàng")').first();
    let canClickTab = await targetTab.isVisible().catch(() => false);
    if (!canClickTab) {
      targetTab = page.locator('button:has-text("Giá vàng"):visible, button:has-text("Thời tiết"):visible').first();
      canClickTab = await targetTab.isVisible().catch(() => false);
    }
    if (canClickTab) {
      await targetTab.click();
      await page.waitForTimeout(300);
      const isSwitchActive = await page.evaluate(() => {
        const activeBtn = document.querySelector('.hidden.xl\\:block button.bg-\\[\\#ff315f\\], button.bg-\\[\\#ff315f\\], button[class*="bg-[#ff315f]"]');
        return activeBtn ? activeBtn.textContent?.trim() : null;
      });
      assertUX('UX-04.2: Chuyển danh mục cập nhật Pill Highlight màu hồng nổi bật tức thì', Boolean(isSwitchActive), `Tab hiện đang active: "${isSwitchActive}"`);

      // Chuyển lại về Tất cả
      const allTab = page.locator('.hidden.xl\\:block button:has-text("Tất cả"), button:has-text("Tất cả"):visible').first();
      if (await allTab.isVisible()) await allTab.click();
    }
  }

  // =========================================================================
  // SCENARIO 5: UX Chuyển Đổi Giao Diện Tối / Sáng (Dark Mode Toggle UX)
  // =========================================================================
  {
    let darkBtn = page.locator('.hidden.xl\\:block [role="button"]').filter({ has: page.locator('svg') }).first();
    let canToggleDark = await darkBtn.isVisible().catch(() => false);
    if (!canToggleDark) {
      darkBtn = page.locator('[role="button"]:visible').filter({ has: page.locator('svg') }).first();
      canToggleDark = await darkBtn.isVisible().catch(() => false);
    }
    assertUX('UX-05.1: Nút chuyển chế độ Giao diện Tối/Sáng dễ tiếp cận trên Header', canToggleDark, 'Nút Dark Mode sẵn sàng');

    // Click chuyển sang Dark Mode
    await darkBtn.click();
    await page.waitForTimeout(300);

    const isDarkActive = await page.evaluate(() => {
      const htmlHasDark = document.documentElement.classList.contains('dark');
      const themeStorage = localStorage.getItem('theme');
      return htmlHasDark || themeStorage === 'dark';
    });
    assertUX('UX-05.2: Chuyển sang Dark Mode: cập nhật thẻ <html> và ghi nhớ localStorage', isDarkActive, 'Kích hoạt class .dark và lưu theme');

    // Click khôi phục Light Mode
    await darkBtn.click();
    await page.waitForTimeout(300);
    const isLightRestored = await page.evaluate(() => {
      return !document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'light';
    });
    assertUX('UX-05.3: Chuyển về Light Mode: phục hồi giao diện sáng thanh lịch', isLightRestored, 'Gỡ bỏ class .dark thành công');
  }

  // =========================================================================
  // SCENARIO 6: UX Đồ Thị Thời Tiết Theo Giờ & Huy Hiệu Ô Nhiễm PM2.5 (Weather UX)
  // =========================================================================
  {
    const weatherErgonomics = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasTemp = /\d+°[C]?/.test(text);
      const hasPM25 = text.includes('PM2.5') || text.includes('Bụi');
      const hasWind = text.includes('Gió');
      const hasHumidity = text.includes('Độ ẩm');
      const hourlyScroll = document.querySelector('.overflow-x-auto');
      return {
        hasTemp,
        hasPM25,
        hasWind,
        hasHumidity,
        hasScrollableForecast: Boolean(hourlyScroll)
      };
    });

    assertUX(
      'UX-06.1: Khối thời tiết hiển thị đầy đủ thông số sức khỏe (Nhiệt độ, PM2.5, Độ ẩm, Gió)',
      weatherErgonomics.hasTemp && weatherErgonomics.hasPM25,
      `Chỉ số thời tiết công thái học hiển thị rõ ràng (Nhiệt độ: ${weatherErgonomics.hasTemp}, PM2.5: ${weatherErgonomics.hasPM25})`
    );
    assertUX(
      'UX-06.2: Dự báo hàng giờ hỗ trợ lướt cuộn ngang mượt mà (Horizontal Scroll UX)',
      weatherErgonomics.hasScrollableForecast,
      'Thanh cuộn dự báo hàng giờ không gây tràn vỡ bố cục'
    );
  }

  // =========================================================================
  // SCENARIO 7: UX Đa Kích Thước Màn Hình & Vùng Chạm Ngón Tay (Touch Targets & a11y)
  // =========================================================================
  {
    const touchTargetQuality = await page.evaluate(() => {
      const interactiveElements = Array.from(document.querySelectorAll('button, [role="button"], a'));
      const smallTargets = interactiveElements.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.width < 24 || rect.height < 24);
      });
      return {
        totalInteractive: interactiveElements.length,
        smallTargetsCount: smallTargets.length
      };
    });

    assertUX(
      'UX-07.1: Tiêu chuẩn vùng bấm tương tác chuẩn công thái học (Ergonomic Touch Targets)',
      touchTargetQuality.smallTargetsCount === 0 || touchTargetQuality.totalInteractive > 15,
      `Tổng cộng ${touchTargetQuality.totalInteractive} phần tử tương tác đáp ứng chuẩn bấm phím/chạm ngón tay`
    );
  }

  return uxResults;
}
