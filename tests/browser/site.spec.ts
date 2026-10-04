import { expect, test } from "@playwright/test";
import artwork from "../../public/works/manifest.json";

test("all main pages load, and missing projects return 404", async ({ page, request }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of ["/", "/work", "/work/aerograin", "/work/pulsedock", "/work/solvanta-labs", "/work/apex", "/work/posters-and-campaigns", "/work/daat-brand-system", "/about", "/services", "/contact", "/privacy"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator(".header")).toBeVisible();
  }
  expect((await request.get("/work/not-a-project")).status()).toBe(404);
  expect((await request.get("/sitemap.xml")).status()).toBe(200);
  expect((await request.get("/opengraph-image")).status()).toBe(200);
  expect(errors).toEqual([]);
});

test("desktop gallery travels exactly from the first to the last panel", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
  await expect(page.locator(".scroll-gallery")).toHaveClass(/is-pinned/);
  const track = page.locator(".gallery-track");
  const panels = page.locator(".gallery-panels");
  const measurements = await track.evaluate((element) => ({
    top: element.getBoundingClientRect().top + window.scrollY,
    distance: element.getBoundingClientRect().height - window.innerHeight,
    width: element.querySelector(".gallery-sticky")!.getBoundingClientRect().width,
  }));
  const translation = () => panels.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m41);
  await page.evaluate((top) => window.scrollTo(0, top), measurements.top);
  await expect.poll(translation).toBeCloseTo(0, 0);
  await page.evaluate((top) => window.scrollTo(0, top), measurements.top + measurements.distance / 2);
  await expect.poll(translation).toBeCloseTo(-measurements.width * 2, 0);
  const progress = page.locator(".gallery-progress > div");
  await expect.poll(() => progress.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m11)).toBeCloseTo(.5, 2);
  await page.evaluate((top) => window.scrollTo(0, top), measurements.top + measurements.distance);
  await expect.poll(translation).toBeCloseTo(-measurements.width * 4, 0);
  await expect.poll(() => page.locator(".gallery-panel").last().evaluate((element) => element.getBoundingClientRect().left)).toBeCloseTo(0, 0);
  await page.setViewportSize({ width: 1280, height: 900 });
  const resized = await track.evaluate((element) => ({
    top: element.getBoundingClientRect().top + window.scrollY,
    distance: element.getBoundingClientRect().height - window.innerHeight,
    width: element.querySelector(".gallery-sticky")!.getBoundingClientRect().width,
  }));
  await page.evaluate((top) => window.scrollTo(0, top), resized.top + resized.distance);
  await expect.poll(translation).toBeCloseTo(-resized.width * 4, 0);
  await page.screenshot({ path: testInfo.outputPath("gallery-last.png") });
});

test("gallery image frames fit the full artwork without colored letterboxing", async ({ page }, testInfo) => {
  for (const layout of [
    { width: 1440, height: 900, reducedMotion: "no-preference" as const },
    { width: 375, height: 812, reducedMotion: "no-preference" as const },
    { width: 1440, height: 900, reducedMotion: "reduce" as const },
  ]) {
    await page.setViewportSize({ width: layout.width, height: layout.height });
    await page.emulateMedia({ reducedMotion: layout.reducedMotion });
    await page.goto("/work/solvanta-labs");
    const frames = page.locator(".gallery-panel-art.is-image");
    expect(await frames.count()).toBeGreaterThan(0);
    for (const frame of await frames.all()) {
      const image = frame.locator("img");
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
      const bounds = await frame.evaluate((element) => {
        const image = element.querySelector("img")!;
        const artwork = image.getBoundingClientRect();
        const box = element.getBoundingClientRect();
        return {
          widthDifference: Math.abs(box.width - artwork.width),
          heightDifference: Math.abs(box.height - artwork.height),
          ratioDifference: Math.abs(artwork.width / artwork.height - image.naturalWidth / image.naturalHeight),
          overflow: document.documentElement.scrollWidth > window.innerWidth,
        };
      });
      expect(bounds.widthDifference).toBeLessThan(1);
      expect(bounds.heightDifference).toBeLessThan(1);
      expect(bounds.ratioDifference).toBeLessThan(.01);
      expect(bounds.overflow).toBe(false);
    }
    if (layout.width === 375) await frames.nth(2).screenshot({ path: testInfo.outputPath("gallery-fitted-mobile.png") });
  }
});

test("desktop and tablet layouts have no horizontal overflow", async ({ page }, testInfo) => {
  for (const size of [{ width: 1440, height: 900 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(size);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    for (const line of await page.locator(".hero-line-text").all()) await expect(line).toHaveCSS("opacity", "1");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.locator(".hero h1")).toBeVisible();
    if (size.width === 1440) await page.screenshot({ path: testInfo.outputPath("desktop.png") });
  }
});

test("mobile navigation and gallery remain usable", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.locator(".hero-video .hero-topline .eyebrow")).toBeVisible();
  await expect(page.locator(".gallery-sticky")).toHaveCSS("position", "relative");
  await expect(page.locator(".gallery-panels")).toHaveCSS("display", "block");
  await page.getByRole("button", { name: "Menu +" }).click();
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Menu +" })).toBeFocused();
  await page.getByRole("button", { name: "Menu +" }).click();
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Work", exact: true }).click();
  await expect(page).toHaveURL(/\/work$/);
  await expect(page.getByRole("button", { name: "Menu +" })).toHaveAttribute("aria-expanded", "false");
  await page.goto("/");
  for (const line of await page.locator(".hero-line-text").all()) await expect(line).toHaveCSS("opacity", "1");
  await page.screenshot({ path: testInfo.outputPath("mobile.png") });
});

test("reduced motion removes pinned gallery scrolling", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".scroll-gallery")).not.toHaveClass(/is-pinned/);
  await expect(page.locator(".gallery-sticky")).toHaveCSS("position", "relative");
  await expect(page.locator(".gallery-panels")).toHaveCSS("transform", "none");
  await expect(page.locator(".gallery-panels")).toHaveCSS("display", "block");
  await expect(page.locator(".gallery-panel")).toHaveCount(5);
  await expect(page.locator(".gallery-progress")).toHaveCount(0);
  await expect(page.locator(".hero-background-video")).not.toHaveAttribute("src");
  expect(await page.locator(".hero-background-video").evaluate((video: HTMLVideoElement) => video.paused)).toBe(true);
});

test("skip link and keyboard navigation work", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
  await page.getByRole("link", { name: "Skip gallery" }).click();
  await expect(page).toHaveURL(/#gallery-end$/);
});

test("unconfigured contact delivery displays an honest error", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Your name").fill("Test Person");
  await page.getByLabel("Email address").fill("person@example.com");
  await page.getByLabel("A little about your project").fill("We would like to discuss a brand identity project.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Start the conversation" }).click();
  await expect(page.locator(".contact-form").getByRole("alert")).toContainText("isn't connected yet");
  await expect(page.getByRole("button", { name: "Start the conversation" })).toBeEnabled();
});

test("supplied portfolio images, categories, and poster grid are available", async ({ page, request }, testInfo) => {
  expect(await (await request.get("/works/manifest.json")).json()).toEqual(artwork);
  const assets = Object.values(artwork).flat();
  expect(assets).toHaveLength(52);
  for (const asset of assets) {
    const response = await request.get(asset.url);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/webp");
  }
  await page.goto("/");
  await expect(page.locator(".portfolio-stage-tile")).toHaveCount(3);
  await expect(page.locator(".selected-work .project-card")).toHaveCount(5);
  await expect(page.locator(".poster-preview-image")).toHaveCount(8);
  await page.locator(".portfolio-stage").scrollIntoViewIfNeeded();
  await expect(page.locator(".portfolio-stage-image").first()).toHaveCSS("opacity", "1");
  await page.locator(".portfolio-stage").screenshot({ path: testInfo.outputPath("portfolio-wall.png") });
  await page.goto("/work");
  await page.getByRole("button", { name: "Campaign design" }).click();
  await expect(page.locator(".project-card")).toHaveCount(1);
  await page.getByRole("button", { name: "All work" }).click();
  await expect(page.locator(".project-card")).toHaveCount(6);
  for (const image of await page.locator(".project-card img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  }
  await page.goto("/work/posters-and-campaigns");
  await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
  await expect(page.locator(".masonry-gallery figure")).toHaveCount(26);
  await expect(page.locator(".scroll-gallery")).toHaveCount(0);
  for (const image of await page.locator(".masonry-gallery img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  }
  await page.locator(".masonry-gallery figure").first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath("posters.png"), animations: "disabled" });
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("all brand galleries have the correct project artwork", async ({ page }) => {
  for (const [slug, count] of [["aerograin", 8], ["pulsedock", 5], ["solvanta-labs", 9], ["apex", 4]] as const) {
    await page.goto(`/work/${slug}`);
    await expect(page.locator(".gallery-panel")).toHaveCount(count);
    const image = page.locator(".gallery-panel img").first();
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  }
});

test("headlines and artwork remain visible without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator(".hero h1")).toContainText("Clarity in thought.");
    await expect(page.locator(".portfolio-stage-tile")).toHaveCount(3);
    await expect(page.locator(".scroll-gallery")).not.toHaveClass(/is-pinned/);
    await expect(page.locator(".gallery-panels")).toHaveCSS("display", "block");
    await expect(page.locator(".hero-background-video")).toHaveAttribute("poster", "/hero/poster.webp");
    await expect(page.locator(".hero-background-video")).not.toHaveAttribute("src");
  } finally {
    await context.close();
  }
});

test("hero uses the supplied reel, shaded copy, rounded corners, and playback controls", async ({ page, request }) => {
  const response = await request.get("/hero/studio-reel.mp4", { headers: { Range: "bytes=0-1023" } });
  expect(response.status()).toBe(206);
  expect(response.headers()["content-type"]).toContain("video/mp4");
  expect((await request.get("/hero/poster.webp")).status()).toBe(200);
  await page.goto("/");
  const video = page.locator(".hero-background-video");
  await expect(video).toHaveAttribute("src", "/hero/studio-reel.mp4");
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState >= 2 && !element.paused)).toBe(true);
  expect(await video.evaluate((element: HTMLVideoElement) => element.muted && element.loop && element.playsInline)).toBe(true);
  await expect(page.locator(".hero-shade")).toHaveCSS("background-image", /linear-gradient/);
  expect(await page.locator(".hero").evaluate((element) => parseFloat(getComputedStyle(element).borderTopLeftRadius))).toBeGreaterThanOrEqual(22);
  await page.getByRole("button", { name: "Pause hero video" }).click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await page.getByRole("button", { name: "Play hero video" }).click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused)).toBe(true);
  await page.locator(".selected-work .project-visual").first().scrollIntoViewIfNeeded();
  expect(await page.locator(".selected-work .project-visual").first().evaluate((element) => parseFloat(getComputedStyle(element).borderTopLeftRadius))).toBe(20);
});

test("reduced motion shows the poster until playback is explicitly requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const videoRequests: string[] = [];
  page.on("request", (request) => { if (request.url().includes("studio-reel.mp4")) videoRequests.push(request.url()); });
  await page.goto("/");
  const video = page.locator(".hero-background-video");
  await expect(video).not.toHaveAttribute("src");
  await expect(page.getByRole("button", { name: "Play hero video" })).toBeVisible();
  expect(videoRequests).toEqual([]);
  await page.getByRole("button", { name: "Play hero video" }).click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused && element.readyState >= 2)).toBe(true);
  await page.getByRole("button", { name: "Pause hero video" }).click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
});

test("video failures leave the hero copy and poster visible with an explicit message", async ({ page }) => {
  await page.route("**/hero/studio-reel.mp4", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(".hero-video-status")).toContainText(/couldn't/);
  await expect(page.locator(".hero h1")).toBeVisible();
  await expect(page.locator(".hero-background-video")).toHaveAttribute("poster", "/hero/poster.webp");
  await expect(page.getByRole("link", { name: "Explore our work" })).toBeVisible();
});

test("changing the motion preference pauses automatic video and unpins the gallery", async ({ page }) => {
  await page.goto("/");
  const video = page.locator(".hero-background-video");
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused)).toBe(true);
  await expect(page.locator(".scroll-gallery")).toHaveClass(/is-pinned/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(video).not.toHaveAttribute("src");
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await expect(page.locator(".scroll-gallery")).not.toHaveClass(/is-pinned/);
});

test("homepage gradients soften section boundaries and respond to hover and focus", async ({ page }, testInfo) => {
  await page.goto("/");
  const transitions = page.locator(".section-transition");
  await expect(transitions).toHaveCount(2);
  for (const transition of await transitions.all()) {
    await expect(transition).toHaveAttribute("aria-hidden", "true");
    await expect(transition.locator("svg")).toHaveAttribute("preserveAspectRatio", "none");
    await expect(transition.locator("linearGradient stop")).toHaveCount(3);
    await expect(transition.locator("path")).toHaveAttribute("d", /C/);
    await expect(transition).toHaveCSS("pointer-events", "none");
    expect(await transition.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(96);
  }
  for (const selector of [".portfolio-stage", ".selected-work", ".poster-preview", ".services-section", ".brand-strip"]) {
    await expect(page.locator(selector)).toHaveCSS("background-image", /gradient/);
  }
  const project = page.locator(".selected-work .project-card").first();
  await project.hover();
  await expect(project.locator(".project-open")).toHaveCSS("background-image", /linear-gradient/);
  await expect.poll(() => project.locator(".project-visual").evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe("none");
  const service = page.locator(".service-row").first();
  await page.keyboard.press("Tab");
  await service.focus();
  await expect.poll(() => service.evaluate((element) => getComputedStyle(element, "::before").opacity)).toBe("1");
  await expect(service).toHaveCSS("outline-style", "solid");
  await transitions.first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath("gradient-transition.png") });
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await service.focus();
  await expect.poll(() => service.evaluate((element) => getComputedStyle(element, "::before").opacity)).toBe("1");
  expect(await service.evaluate((element) => parseFloat(getComputedStyle(element, "::before").transitionDuration))).toBeLessThan(.001);
});

test("text and project photos visibly pop into place during scrolling", async ({ page }) => {
  for (const size of [{ width: 1440, height: 900 }, { width: 375, height: 812 }]) {
    await page.setViewportSize(size);
    await page.goto("/");
    await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
    for (const selector of [".selected-work > [data-reveal=text]", ".selected-work .project-card [data-reveal=image]"]) {
      await page.goto("/");
      await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
      const samples = await page.locator(selector).first().evaluate(async (element) => {
        const results: { y: number; scale: number; opacity: number }[] = [];
        const start = performance.now();
        window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - window.innerHeight * .35, behavior: "instant" });
        await new Promise<void>((resolve) => {
          function sample() {
            const style = getComputedStyle(element);
            const matrix = new DOMMatrix(style.transform);
            results.push({ y: matrix.m42, scale: matrix.m11, opacity: Number(style.opacity) });
            if (performance.now() - start < 1400) requestAnimationFrame(sample);
            else resolve();
          }
          requestAnimationFrame(sample);
        });
        return results;
      });
      expect(Math.max(...samples.map((sample) => sample.y))).toBeGreaterThan(20);
      expect(Math.min(...samples.map((sample) => sample.opacity))).toBeLessThan(.5);
      if (selector.includes("image")) expect(Math.min(...samples.map((sample) => sample.scale))).toBeLessThan(.97);
      expect(samples.at(-1)?.y).toBeCloseTo(0, 0);
      expect(samples.at(-1)?.scale).toBeCloseTo(1, 2);
      expect(samples.at(-1)?.opacity).toBe(1);
    }
  }
});

test("logo-only ticker moves, pauses, and becomes static for reduced motion", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator(".hero + .hero-interlude")).toBeVisible();
  const ticker = page.getByRole("region", { name: "Selected project logos" });
  await ticker.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(ticker.locator(".logo-ticker-group").first().getByRole("img")).toHaveCount(4);
  await expect(ticker.getByRole("img", { name: "AeroGrain", exact: true })).toBeVisible();
  await expect(ticker.locator(".logo-ticker-group").last()).toHaveAttribute("aria-hidden", "true");
  const track = ticker.locator(".logo-ticker-track");
  await expect(track).toHaveCSS("animation-name", "logo-ticker-scroll");
  const position = () => track.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m41);
  const start = await position();
  await expect.poll(position).toBeLessThan(start - 2);
  await page.getByRole("button", { name: "Pause logo ticker" }).click();
  await page.mouse.move(0, 0);
  await page.getByRole("button", { name: "Resume logo ticker" }).evaluate((button) => button.blur());
  await expect(track).toHaveCSS("animation-play-state", "paused");
  const paused = await position();
  await expect.poll(position).toBeCloseTo(paused, 2);
  await ticker.screenshot({ path: testInfo.outputPath("logo-ticker.png") });
  await expect(page.locator(".hero-interlude [data-reveal=text]")).toHaveCSS("opacity", "1");
  await page.locator(".hero-interlude").screenshot({ path: testInfo.outputPath("interlude.png") });
  await page.getByRole("button", { name: "Resume logo ticker" }).click();
  await page.mouse.move(0, 0);
  await page.getByRole("button", { name: "Pause logo ticker" }).evaluate((button) => button.blur());
  await expect(track).toHaveCSS("animation-play-state", "running");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(track).toHaveCSS("animation-name", "none");
  await expect(ticker.getByRole("button")).toHaveCount(0);
  await page.locator(".selected-work .project-card [data-reveal=image]").first().scrollIntoViewIfNeeded();
  const still = page.locator(".selected-work .project-card [data-reveal=image]").first();
  await expect(still).toHaveCSS("opacity", "1");
  expect(await still.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m42)).toBe(0);
});

test("keyboard focus immediately settles a project reveal", async ({ page }) => {
  await page.goto("/");
  const project = page.locator(".selected-work .project-card").last();
  await project.focus();
  const reveal = project.locator("[data-reveal=image]");
  await expect(reveal).toHaveCSS("opacity", "1");
  const positions = await reveal.evaluate(async (element) => {
    const positions: number[] = [];
    const start = performance.now();
    await new Promise<void>((resolve) => {
      function frame() {
        positions.push(new DOMMatrix(getComputedStyle(element).transform).m42);
        if (performance.now() - start < 500) requestAnimationFrame(frame);
        else resolve();
      }
      requestAnimationFrame(frame);
    });
    return positions;
  });
  expect(positions.every((position) => Math.abs(position) < 1)).toBe(true);
});
