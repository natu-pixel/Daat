import { expect, test } from "@playwright/test";

test("footer text gathers on entry, reacts to the mouse, and shares the footer pause control", async ({ page }, testInfo) => {
  await page.goto("/about");
  await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
  const host = page.locator(".footer-particle-headline");
  const canvas = host.locator("canvas");
  await expect(host).toHaveAttribute("data-motion", "paused");
  await expect(host).not.toHaveAttribute("data-frame");
  await host.scrollIntoViewIfNeeded();
  await expect(host).toHaveAttribute("data-motion", "running");
  await expect(canvas).toHaveAttribute("data-text-phase", "gathering");
  await expect(canvas).toHaveAttribute("data-text-phase", "formed");
  await expect(page.getByRole("heading", { level: 2, name: "What's your next move?" })).toBeVisible();
  const count = Number(await canvas.getAttribute("data-particles"));
  expect(count).toBeGreaterThan(1000);
  expect(count).toBeLessThanOrEqual(5200);
  await expect(host.locator("h2")).toHaveCSS("color", "rgba(0, 0, 0, 0)");
  await expect(canvas).toHaveAttribute("aria-hidden", "true");
  await expect(canvas).toHaveCSS("pointer-events", "none");
  await page.screenshot({ path: testInfo.outputPath("footer-text-formed.png") });
  const bounds = await host.boundingBox();
  if (!bounds) throw new Error("Footer headline is not visible.");
  await page.mouse.move(bounds.x + 140, bounds.y + 70);
  await expect.poll(async () => Number(await host.getAttribute("data-pointer"))).toBeGreaterThan(.9);
  await page.getByRole("button", { name: "Pause footer effect" }).click();
  await expect(host).toHaveAttribute("data-motion", "paused");
  await expect(page.locator(".footer-flow")).toHaveAttribute("data-motion", "paused");
  await expect(canvas).toHaveCSS("opacity", "0");
  await expect(host.locator("h2")).toHaveCSS("color", "rgb(242, 243, 244)");
  const frame = await host.getAttribute("data-frame");
  await page.waitForTimeout(200);
  expect(await host.getAttribute("data-frame")).toBe(frame);
  await page.getByRole("button", { name: "Play footer effect" }).click();
  await expect(host).toHaveAttribute("data-motion", "running");
  await expect(canvas).toHaveAttribute("data-text-phase", "formed");
  await page.getByRole("link", { name: "Start a project with DAAT" }).click();
  await expect(page).toHaveURL(/\/contact$/);
});

test("footer text remains readable for reduced motion and without JavaScript", async ({ page, browser }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/about");
  await page.locator(".footer").scrollIntoViewIfNeeded();
  const host = page.locator(".footer-particle-headline");
  await expect(host).toHaveAttribute("data-active", "false");
  await expect(host).not.toHaveAttribute("data-frame");
  await expect(host.locator("h2")).toHaveCSS("color", "rgb(242, 243, 244)");
  await page.getByRole("button", { name: "Play footer effect" }).click();
  await expect(host).toHaveAttribute("data-motion", "running");
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const staticPage = await context.newPage();
    await staticPage.goto("/about");
    await staticPage.locator(".footer").scrollIntoViewIfNeeded();
    await expect(staticPage.locator(".footer-particle-headline h2")).toContainText("What's your");
    await expect(staticPage.locator(".particle-text-canvas")).toHaveCSS("opacity", "0");
    await expect(staticPage.locator(".footer-particle-headline h2")).toHaveCSS("color", "rgb(242, 243, 244)");
    await expect(staticPage.locator(".footer .effect-toggle")).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test("resizing resamples the Aspekta headline without restarting its entrance or adding overflow", async ({ page }, testInfo) => {
  await page.goto("/about");
  const host = page.locator(".footer-particle-headline");
  await host.scrollIntoViewIfNeeded();
  await expect(host.locator("canvas")).toHaveAttribute("data-text-phase", "formed");
  for (const width of [1440, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await host.scrollIntoViewIfNeeded();
    await expect(host).toHaveAttribute("data-motion", "running");
    await expect(host.locator("canvas")).toHaveAttribute("data-text-phase", "formed");
    await expect(host.locator("h2")).toHaveCSS("font-family", /Aspekta/i);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(Number(await host.locator("canvas").getAttribute("data-particles"))).toBeLessThanOrEqual(5200);
    await page.waitForTimeout(300);
    await page.screenshot({ path: testInfo.outputPath(`footer-text-${width}.png`) });
  }
});

test("footer text stops while offscreen and when the motion preference changes", async ({ page }) => {
  await page.goto("/about");
  await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
  const host = page.locator(".footer-particle-headline");
  await host.scrollIntoViewIfNeeded();
  await expect(host).toHaveAttribute("data-motion", "running");
  await page.locator("main h1").scrollIntoViewIfNeeded();
  await expect(host).toHaveAttribute("data-motion", "paused");
  const frame = await host.getAttribute("data-frame");
  await page.waitForTimeout(200);
  expect(await host.getAttribute("data-frame")).toBe(frame);
  await host.scrollIntoViewIfNeeded();
  await expect(host).toHaveAttribute("data-motion", "running");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(host).toHaveAttribute("data-active", "false");
  await expect(host).toHaveAttribute("data-motion", "paused");
  await expect(host.locator("h2")).toHaveCSS("color", "rgb(242, 243, 244)");
});

test("font preparation failures keep the semantic headline and show an explicit error", async ({ page }) => {
  await page.addInitScript(() => {
    document.fonts.load = () => Promise.reject(new Error("Font preparation unavailable for test"));
  });
  await page.goto("/about");
  await page.locator(".footer").scrollIntoViewIfNeeded();
  await expect(page.locator(".footer-text-status")).toContainText("couldn't start");
  await expect(page.locator(".footer-particle-headline h2")).toHaveCSS("color", "rgb(242, 243, 244)");
});

test("text drawing failures restore the readable headline without breaking footer links", async ({ page }) => {
  await page.goto("/about");
  const host = page.locator(".footer-particle-headline");
  await host.scrollIntoViewIfNeeded();
  await expect(host).toHaveAttribute("data-motion", "running");
  await host.locator("canvas").evaluate((element: HTMLCanvasElement) => {
    const context = element.getContext("2d");
    if (!context) throw new Error("Text canvas is unavailable.");
    context.fillRect = () => { throw new Error("Text drawing unavailable for test"); };
  });
  await expect(page.locator(".footer-text-status")).toContainText("couldn't start");
  await expect(host).toHaveAttribute("data-motion", "paused");
  await expect(host.locator("h2")).toHaveCSS("color", "rgb(242, 243, 244)");
  await expect(page.getByRole("link", { name: "Start a project with DAAT" })).toBeVisible();
});
