import { expect, test } from "@playwright/test";
import sharp from "sharp";

test("hero water ripples change pixels locally, pause, and suspend offscreen and when hidden", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
  const host = page.locator(".hero-artwork");
  await expect(host).toHaveAttribute("data-motion", "running");
  const texture = () => host.locator("feImage").getAttribute("href");
  await expect(host).toHaveAttribute("data-water", "idle");
  const bounds = await page.locator(".hero").boundingBox();
  if (!bounds) throw new Error("Hero is not visible.");
  const clip = { x: bounds.x + bounds.width * .8, y: bounds.y + 80, width: bounds.width * .15, height: 220 };
  const farClip = { x: bounds.x + 30, y: bounds.y + bounds.height - 150, width: 150, height: 80 };
  const idle = await page.screenshot({ clip });
  const untouched = await page.screenshot({ clip: farClip });
  await page.waitForTimeout(250);
  expect((await page.screenshot({ clip })).equals(idle)).toBe(true);
  await page.mouse.move(clip.x + clip.width * .5, clip.y + clip.height * .5);
  await expect(host).toHaveAttribute("data-water", "rippling");
  await expect.poll(texture).toMatch(/^data:image\/png/);
  const first = await page.screenshot({ clip });
  expect(first.equals(idle)).toBe(false);
  const farAfter = await page.screenshot({ clip: farClip });
  const beforePixels = await sharp(untouched).removeAlpha().raw().toBuffer();
  const afterPixels = await sharp(farAfter).removeAlpha().raw().toBuffer();
  let totalDifference = 0;
  let maximumDifference = 0;
  for (let index = 0; index < beforePixels.length; index++) {
    const difference = Math.abs(beforePixels[index] - afterPixels[index]);
    totalDifference += difference;
    maximumDifference = Math.max(maximumDifference, difference);
  }
  // SVG compositing can round unchanged color channels by one byte.
  expect(maximumDifference).toBeLessThanOrEqual(1);
  expect(totalDifference / beforePixels.length).toBeLessThan(.01);
  await page.waitForTimeout(500);
  expect((await page.screenshot({ clip })).equals(first)).toBe(false);
  await page.screenshot({ path: testInfo.outputPath("hero-cursor-water.png") });
  await page.getByRole("button", { name: "Pause hero effect" }).click();
  await expect(host).toHaveAttribute("data-motion", "paused");
  const paused = await texture();
  const pausedFrame = await host.getAttribute("data-frame");
  await page.waitForTimeout(200);
  const still = await page.screenshot({ clip });
  await page.waitForTimeout(300);
  expect((await page.screenshot({ clip })).equals(still)).toBe(true);
  expect(await texture()).toBe(paused);
  expect(await host.getAttribute("data-frame")).toBe(pausedFrame);
  await page.getByRole("button", { name: "Play hero effect" }).click();
  await expect(host).toHaveAttribute("data-motion", "running");
  await page.locator(".footer").scrollIntoViewIfNeeded();
  await expect(host).toHaveAttribute("data-motion", "paused");
  const offscreenFrame = await host.getAttribute("data-frame");
  await page.waitForTimeout(250);
  expect(await host.getAttribute("data-frame")).toBe(offscreenFrame);
  await page.locator(".hero").scrollIntoViewIfNeeded();
  await expect(host).toHaveAttribute("data-motion", "running");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(host).toHaveAttribute("data-motion", "paused");
  const hiddenFrame = await host.getAttribute("data-frame");
  await page.waitForTimeout(250);
  expect(await host.getAttribute("data-frame")).toBe(hiddenFrame);
  await page.evaluate(() => {
    Reflect.deleteProperty(document, "hidden");
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(host).toHaveAttribute("data-motion", "running");
});

test("stationary and absent pointers let hero water fade back to a still image", async ({ page }) => {
  await page.goto("/");
  const host = page.locator(".hero-artwork");
  await expect(host).toHaveAttribute("data-water", "idle");
  const bounds = await page.locator(".hero").boundingBox();
  if (!bounds) throw new Error("Hero is not visible.");
  const clip = { x: bounds.x + bounds.width * .65, y: bounds.y + bounds.height * .3, width: bounds.width * .27, height: bounds.height * .35 };
  await page.mouse.move(bounds.x + bounds.width * .8, bounds.y + bounds.height * .5);
  await expect(host).toHaveAttribute("data-water", "rippling");
  const dimensions = await host.locator("feImage").evaluate(async element => {
    const source = element.getAttribute("href");
    if (!source) throw new Error("Water texture has not been generated.");
    const image = new Image();
    image.src = source;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  });
  expect(Math.max(dimensions.width, dimensions.height)).toBeLessThanOrEqual(192);
  await expect(host).toHaveAttribute("data-water", "idle");
  await expect(page.locator(".hero-building-image")).toHaveCSS("filter", "none");
  const texture = await host.locator("feImage").getAttribute("href");
  const still = await page.screenshot({ clip });
  await page.waitForTimeout(300);
  expect((await page.screenshot({ clip })).equals(still)).toBe(true);
  expect(await host.locator("feImage").getAttribute("href")).toBe(texture);
  await page.mouse.move(bounds.x + bounds.width * .65, bounds.y + bounds.height * .4);
  await expect(host).toHaveAttribute("data-water", "rippling");
  await page.mouse.move(0, 0);
  await expect(host).toHaveAttribute("data-water", "idle");
  await expect(page.locator(".hero-building-image")).toHaveCSS("filter", "none");
});

test("footer particles animate within rendering caps and preserve pause intent across visibility", async ({ page }) => {
  await page.goto("/about");
  await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
  const host = page.locator(".footer-flow");
  await expect(host).toHaveAttribute("data-motion", "paused");
  await page.locator(".footer").scrollIntoViewIfNeeded();
  await expect(host).toHaveAttribute("data-motion", "running");
  const canvas = host.locator("canvas");
  const pixels = () => canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  const first = await pixels();
  await expect.poll(pixels).not.toBe(first);
  const count = Number(await host.getAttribute("data-frame"));
  const start = Date.now();
  await page.waitForTimeout(1000);
  const seconds = (Date.now() - start) / 1000;
  expect((Number(await host.getAttribute("data-frame")) - count) / seconds).toBeLessThanOrEqual(31);
  const scale = await canvas.evaluate((element: HTMLCanvasElement) => element.width / element.getBoundingClientRect().width);
  expect(scale).toBeLessThanOrEqual(1.501);
  await page.getByRole("button", { name: "Pause footer effect" }).focus();
  await page.keyboard.press("Enter");
  await expect(host).toHaveAttribute("data-motion", "paused");
  await page.waitForTimeout(100);
  const frozen = await pixels();
  const frame = await host.getAttribute("data-frame");
  await page.waitForTimeout(250);
  expect(await pixels()).toBe(frozen);
  expect(await host.getAttribute("data-frame")).toBe(frame);
  await page.locator("h1").scrollIntoViewIfNeeded();
  await page.locator(".footer").scrollIntoViewIfNeeded();
  await expect(page.getByRole("button", { name: "Play footer effect" })).toHaveAttribute("aria-pressed", "false");
  await expect(host).toHaveAttribute("data-motion", "paused");
  await page.getByRole("button", { name: "Play footer effect" }).click();
  await expect(host).toHaveAttribute("data-motion", "running");
});

test("footer reduced-motion rendering responds to live preferences and explicit opt-in", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator(".footer").scrollIntoViewIfNeeded();
  const host = page.locator(".footer-flow");
  await expect(host).toHaveAttribute("data-motion", "paused");
  await expect(host).not.toHaveAttribute("data-frame");
  await page.getByRole("button", { name: "Play footer effect" }).click();
  await expect(host).toHaveAttribute("data-motion", "running");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(host).toHaveAttribute("data-motion", "running");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(host).toHaveAttribute("data-motion", "paused");
  const frame = await host.getAttribute("data-frame");
  await page.waitForTimeout(250);
  expect(await host.getAttribute("data-frame")).toBe(frame);
});

test("hero and footer fit desktop, tablet, and mobile and retain real destinations", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1440, 768, 375]) {
    await page.setViewportSize({ width, height: width === 375 ? 812 : 1000 });
    await page.goto("/");
    await expect(page.locator(".hero-building-image")).toBeVisible();
    await expect.poll(() => page.locator(".hero-building-image").evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`hero-${width}.png`) });
    await page.locator(".footer").scrollIntoViewIfNeeded();
    await expect(page.locator(".footer-gradient")).toBeVisible();
    await expect.poll(() => page.locator(".footer-gradient").evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    await expect(page.locator(".footer h2")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator(".footer-flow")).toHaveCSS("pointer-events", "none");
    await page.screenshot({ path: testInfo.outputPath(`footer-${width}.png`) });
  }
  await page.locator(".footer .round-cta").click();
  await expect(page).toHaveURL(/\/contact$/);
  await page.locator(".footer").scrollIntoViewIfNeeded();
  await page.locator(".footer").getByRole("link", { name: "Privacy", exact: true }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await page.locator(".footer").scrollIntoViewIfNeeded();
  await page.locator(".footer").getByRole("link", { name: "DAAT home" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("unavailable canvas surfaces show an explicit error and keep the gradient and links", async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = function () { throw new Error("Canvas unavailable for test"); };
  });
  await page.goto("/about");
  await page.locator(".footer").scrollIntoViewIfNeeded();
  await expect(page.locator(".footer-effect-controls").getByRole("status")).toContainText("couldn't start");
  await expect(page.locator(".footer-gradient")).toBeVisible();
  await expect(page.locator(".footer .round-cta")).toBeVisible();
  await expect(page.getByRole("button", { name: /footer effect/ })).toHaveCount(0);
});

test("gradient load failures are reported without losing footer navigation", async ({ page }) => {
  await page.route("**/*gradiant*", route => route.abort());
  await page.goto("/about");
  await page.locator(".footer").scrollIntoViewIfNeeded();
  await expect(page.locator(".footer-effect-controls").getByRole("status")).toContainText("gradient couldn't load");
  await expect(page.locator(".footer h2")).toBeVisible();
  await expect(page.locator(".footer .round-cta")).toBeVisible();
});

test("hero renderer errors stop motion and show the unfiltered building", async ({ page }) => {
  await page.goto("/");
  const host = page.locator(".hero-artwork");
  await expect(host).toHaveAttribute("data-motion", "running");
  await host.locator("feImage").evaluate(element => {
    element.setAttribute = () => { throw new Error("Filter unavailable for test"); };
  });
  const bounds = await page.locator(".hero").boundingBox();
  if (!bounds) throw new Error("Hero is not visible.");
  await page.mouse.move(bounds.x + bounds.width * .7, bounds.y + bounds.height * .5);
  await expect(page.locator(".hero-effect-controls").getByRole("status")).toContainText("couldn't start");
  await expect(page.locator(".hero-building-image")).toHaveCSS("filter", "none");
  await expect(page.locator(".hero h1")).toBeVisible();
  await expect(page.getByRole("button", { name: /hero effect/ })).toHaveCount(0);
});

test("leaving the homepage cleans up its active hero animation", async ({ page }) => {
  await page.goto("/");
  const host = page.locator(".hero-artwork");
  await expect(host).toHaveAttribute("data-motion", "running");
  const detached = await host.elementHandle();
  if (!detached) throw new Error("Hero animation host is unavailable.");
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Studio", exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  expect(await detached.evaluate(element => element.isConnected)).toBe(false);
  const frame = await detached.getAttribute("data-frame");
  await page.waitForTimeout(250);
  expect(await detached.getAttribute("data-frame")).toBe(frame);
});

test("mouse movement ripples the hero and shifts the footer, with pause and reduced-motion support", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
  for (const section of [
    { root: ".hero", host: ".hero-artwork", image: ".hero-building-image", name: "hero" },
    { root: ".footer", host: ".footer-flow", image: ".footer-gradient", name: "footer" },
  ]) {
    const root = page.locator(section.root);
    await root.scrollIntoViewIfNeeded();
    const host = page.locator(section.host);
    const image = page.locator(section.image);
    await expect(host).toHaveAttribute("data-motion", "running");
    const bounds = await root.boundingBox();
    if (!bounds) throw new Error(`${section.name} is not visible.`);
    const translation = () => image.evaluate(element => new DOMMatrix(getComputedStyle(element).transform).m41);
    await page.mouse.move(bounds.x + bounds.width * .2, bounds.y + bounds.height * .35);
    if (section.name === "hero") {
      await expect(host).toHaveAttribute("data-water", "rippling");
      expect(await translation()).toBe(0);
    } else {
      await expect.poll(translation).toBeLessThan(-4);
    }
    await page.mouse.move(bounds.x + bounds.width * .8, bounds.y + bounds.height * .55);
    if (section.name === "hero") {
      await expect(host.locator("feImage")).toHaveAttribute("href", /^data:image\/png/);
      expect(Number(await host.getAttribute("data-ripples"))).toBeLessThanOrEqual(6);
    } else {
      await expect.poll(translation).toBeGreaterThan(4);
    }
    await expect.poll(() => host.getAttribute("data-pointer")).toBe("1.000");
    await page.screenshot({ path: testInfo.outputPath(`${section.name}-hover.png`) });
    await page.getByRole("button", { name: `Pause ${section.name} effect` }).click();
    await expect(host).toHaveAttribute("data-motion", "paused");
    const paused = await translation();
    await page.mouse.move(bounds.x + bounds.width * .2, bounds.y + bounds.height * .4);
    await page.waitForTimeout(200);
    expect(await translation()).toBe(paused);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByRole("button", { name: "Play footer effect" })).toBeVisible();
  await page.mouse.move(1000, 400);
  expect(await page.locator(".footer-gradient").evaluate(element => new DOMMatrix(getComputedStyle(element).transform).m41)).toBe(0);
  expect(await page.locator(".footer").evaluate(element => parseFloat(getComputedStyle(element).paddingTop))).toBeLessThanOrEqual(160);
  await expect(page.locator(".footer-flow")).toHaveCSS("mask-image", /linear-gradient/);
});

test("reference-style footer clouds have dense edges and leave the center clear", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/about");
  await page.locator(".footer").scrollIntoViewIfNeeded();
  const canvas = page.locator(".footer-flow canvas");
  await expect(canvas).toHaveAttribute("data-particles", "14000");
  await expect.poll(() => page.locator(".footer-gradient").evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  const coverage = await canvas.evaluate((element: HTMLCanvasElement) => {
    const context = element.getContext("2d");
    if (!context) throw new Error("Canvas context is unavailable.");
    const { width, height } = element;
    const pixels = context.getImageData(0, 0, width, height).data;
    let edgeSamples = 0;
    let edgePainted = 0;
    let centerSamples = 0;
    let centerPainted = 0;
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const painted = pixels[(y * width + x) * 4 + 3] > 0;
        if (x < width * .2 || x > width * .8 || y < height * .2 || y > height * .8) {
          edgeSamples++;
          if (painted) edgePainted++;
        } else if (x > width * .3 && x < width * .7 && y > height * .3 && y < height * .7) {
          centerSamples++;
          if (painted) centerPainted++;
        }
      }
    }
    return { edges: edgePainted / edgeSamples, center: centerPainted / centerSamples };
  });
  expect(coverage.edges).toBeGreaterThan(.02);
  expect(coverage.center).toBeLessThan(.005);
  await page.screenshot({ path: testInfo.outputPath("footer-reference-clouds.png") });
});
