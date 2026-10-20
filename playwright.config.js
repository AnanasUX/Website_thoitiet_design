const { defineConfig, devices } = require("@playwright/test");

const rawBaseUrl = process.env.QA_BASE_URL ? process.env.QA_BASE_URL.trim() : "";
const baseURL = rawBaseUrl || "http://127.0.0.1:4173";

module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "qa-results.json" }]
  ],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    ignoreHTTPSErrors: true
  },
  webServer: rawBaseUrl ? undefined : {
    command: "npx vite preview --port 4173 --host 127.0.0.1",
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 60000
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile-chromium", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } }
  ]
});
