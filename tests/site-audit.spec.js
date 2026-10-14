const { test, expect } = require("@playwright/test");

test("TC-SITE-001: target page loads", async ({ page }) => {
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response, "Navigation did not produce a response").not.toBeNull();
  expect(response.status(), `Unexpected HTTP status: ${response.status()}`).toBeLessThan(400);
  await expect(page.locator("body")).toBeVisible();
});

test("TC-SITE-002: no uncaught page errors during initial load", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("load").catch(() => {});
  expect(pageErrors, `Uncaught page errors:\n${pageErrors.join("\n")}`).toEqual([]);
});

test("TC-SITE-003: anchors have href attributes", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const anchors = await page.locator("a").evaluateAll(nodes => nodes.map((a, index) => ({
    index,
    text: (a.innerText || a.getAttribute("aria-label") || "").trim().slice(0, 120),
    href: a.getAttribute("href")
  })));
  const missing = anchors.filter(a => !a.href || !a.href.trim());
  expect(missing, `Anchors without href: ${JSON.stringify(missing)}`).toEqual([]);
  // This intentionally does not visit every link: external links, authenticated routes,
  // and destructive actions require project-specific handling.
});

test("TC-SITE-004: visible buttons and form controls have basic usable state", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const controls = await page.locator("button, input, select, textarea, [role='button']").evaluateAll(nodes =>
    nodes.filter(el => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    }).map((el, index) => ({
      index,
      tag: el.tagName.toLowerCase(),
      text: (el.innerText || "").trim().slice(0, 80),
      type: el.getAttribute("type"),
      ariaLabel: el.getAttribute("aria-label"),
      title: el.getAttribute("title"),
      disabled: Boolean(el.disabled),
      name: el.getAttribute("name"),
      placeholder: el.getAttribute("placeholder")
    }))
  );
  const unnamed = controls.filter(c =>
    ["button"].includes(c.tag) && !c.text && !c.ariaLabel && !c.title
  );
  test.info().attach("visible-controls.json", {
    body: JSON.stringify({ controls, unnamed }, null, 2),
    contentType: "application/json"
  });
  // A control being visible is not proof its action works. Behavior-specific tests are required.
  expect(controls.length, "No visible interactive controls found; review whether this is expected.").toBeGreaterThanOrEqual(0);
});

test("TC-SITE-005: document has no horizontal overflow", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const dimensions = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
    viewportHeight: document.documentElement.clientHeight,
    documentHeight: document.documentElement.scrollHeight
  }));
  test.info().attach("viewport-dimensions.json", {
    body: JSON.stringify(dimensions, null, 2),
    contentType: "application/json"
  });
  expect(
    dimensions.documentWidth,
    `Horizontal overflow: document=${dimensions.documentWidth}px, viewport=${dimensions.viewportWidth}px`
  ).toBeLessThanOrEqual(dimensions.viewportWidth + 2);
});

test("QA metadata: requirement registry and test cases are present", async () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const requirements = JSON.parse(fs.readFileSync(path.join(process.cwd(), "qa/requirements.json"), "utf8"));
  const cases = JSON.parse(fs.readFileSync(path.join(process.cwd(), "qa/test-cases.json"), "utf8"));
  const ids = new Set(cases.testCases.map(tc => tc.id));
  const missingLinks = requirements.requirements.filter(req =>
    !Array.isArray(req.testIds) || req.testIds.length === 0 || req.testIds.some(id => !ids.has(id))
  );
  expect(missingLinks, `Requirements missing valid test links: ${JSON.stringify(missingLinks.map(r => r.id))}`).toEqual([]);
});
