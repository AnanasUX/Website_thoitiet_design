import { test, expect } from "@playwright/test";

test.describe("Google OAuth Authentication Flow & State Persistence", () => {
  test("AUTH-001: Login button is visible and generates valid Google OAuth URL", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const loginBtn = page.locator('div[title="Đăng nhập Google"]:visible');
    await expect(loginBtn).toBeVisible({ timeout: 10000 });

    // Intercept window.open to verify OAuth parameters
    const popupPromise = page.evaluate(() => {
      return new Promise((resolve) => {
        window.open = (url, name, specs) => {
          resolve({ url, name, specs });
          return null;
        };
      });
    });

    await loginBtn.click();
    const popupData = await popupPromise;

    expect(popupData.url).toContain("accounts.google.com/o/oauth2/v2/auth");
    expect(popupData.url).toContain("client_id=");
    expect(popupData.url).toContain("response_type=token");
    expect(popupData.url).toContain("scope=openid");
  });

  test("AUTH-002: OAuth redirect with access_token completes login and displays user profile", async ({ page }) => {
    // Mock Google Userinfo API
    await page.route("https://www.googleapis.com/oauth2/v3/userinfo", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          sub: "109876543210987654321",
          name: "Ngọc AnX Test",
          given_name: "Ngọc",
          family_name: "AnX",
          picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
          email: "test.anx.user@gmail.com",
          email_verified: true,
          locale: "vi"
        })
      });
    });

    // Mock YouTube API so YouTube sync won't block
    await page.route("https://www.googleapis.com/youtube/v3/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [] })
      });
    });

    // Simulate Google redirecting back to website with access_token in URL hash
    await page.goto("/#access_token=test_ya29_token_123456&token_type=Bearer&expires_in=3599", { waitUntil: "domcontentloaded" });

    // Verify user avatar is rendered instead of login button
    const userAvatar = page.locator('img[alt="Ngọc AnX Test"]:visible');
    await expect(userAvatar).toBeVisible({ timeout: 15000 });

    // Verify user session stored in localStorage
    const savedAuth = await page.evaluate(() => localStorage.getItem("user_auth"));
    expect(savedAuth).not.toBeNull();
    const parsed = JSON.parse(savedAuth);
    expect(parsed.email).toBe("test.anx.user@gmail.com");
    expect(parsed.name).toBe("Ngọc AnX Test");

    // Verify URL hash was cleaned (replaceState removes #access_token)
    const currentUrl = page.url();
    expect(currentUrl).not.toContain("access_token=");
  });

  test("AUTH-003: BroadcastChannel token sync logs in main window", async ({ page }) => {
    // Mock Google Userinfo API
    await page.route("https://www.googleapis.com/oauth2/v3/userinfo", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          sub: "1234567890",
          name: "Multi Tab User",
          picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
          email: "multitab@gmail.com",
          email_verified: true
        })
      });
    });

    await page.route("https://www.googleapis.com/youtube/v3/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [] })
      });
    });

    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Simulate clicking login to open BroadcastChannel listener
    const loginBtn = page.locator('div[title="Đăng nhập Google"]:visible');
    await expect(loginBtn).toBeVisible({ timeout: 10000 });

    // Trigger login to initialize listeners
    await page.evaluate(() => {
      window.open = () => null; // Prevent real popup
    });
    await loginBtn.click();

    // Now simulate popup posting message via BroadcastChannel
    await page.evaluate(() => {
      const bc = new BroadcastChannel("google_oauth_channel");
      bc.postMessage({
        type: "GOOGLE_LOGIN_SUCCESS",
        hash: "access_token=ya29_bcast_token_999&token_type=Bearer"
      });
      bc.close();
    });

    // Verify avatar appears in main window
    const userAvatar = page.locator('img[alt="Multi Tab User"]:visible');
    await expect(userAvatar).toBeVisible({ timeout: 15000 });

    const savedAuth = await page.evaluate(() => localStorage.getItem("user_auth"));
    expect(savedAuth).toContain("multitab@gmail.com");
  });

  test("AUTH-004: User can open profile menu and logout successfully", async ({ page }) => {
    // Mock Google Userinfo API
    await page.route("https://www.googleapis.com/oauth2/v3/userinfo", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          sub: "109876543210987654321",
          name: "Phiên Người Dùng",
          picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
          email: "phiennguoidung@gmail.com",
          email_verified: true
        })
      });
    });

    await page.route("https://www.googleapis.com/youtube/v3/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [] })
      });
    });

    // Log in with access token
    await page.goto("/#access_token=test_ya29_token_for_logout&token_type=Bearer&expires_in=3599", { waitUntil: "domcontentloaded" });

    // User avatar container should be visible
    const avatarContainer = page.locator('div.rounded-full:has(img[alt="Phiên Người Dùng"]):visible');
    await expect(avatarContainer).toBeVisible({ timeout: 15000 });

    // Click avatar container to open dropdown menu
    await avatarContainer.click();

    // Verify user profile details inside dropdown
    const userNameLabel = page.locator('span:has-text("Phiên Người Dùng"):visible').first();
    await expect(userNameLabel).toBeVisible({ timeout: 5000 });

    // Click Logout
    const logoutBtn = page.locator('button:has-text("Đăng xuất"):visible').first();
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // Verify localStorage cleared and login button reappears
    const savedAuth = await page.evaluate(() => localStorage.getItem("user_auth"));
    expect(savedAuth).toBeNull();

    const loginBtn = page.locator('div[title="Đăng nhập Google"]:visible');
    await expect(loginBtn).toBeVisible({ timeout: 5000 });
  });
});
