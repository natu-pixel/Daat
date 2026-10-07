import { expect, test } from "@playwright/test";
import { localServices } from "../../lib/local-content";

test("About explains services, deliverables, project fit, and a scope-dependent working process", async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator(".about-heading")).toContainText("recognizable identity");
  const capabilities = page.getByRole("region", { name: "Creative work. Clear deliverables." });
  await expect(capabilities.locator("article")).toHaveCount(localServices.length);
  for (const [index, service] of localServices.entries()) {
    const card = capabilities.locator("article").nth(index);
    await expect(card.getByRole("heading", { name: service.title, exact: true })).toBeVisible();
    await expect(card.locator("p")).toHaveText(service.description);
    await expect(card.getByRole("listitem")).toHaveText(service.items);
    await expect(card.getByRole("link", { name: "Explore this service" })).toHaveAttribute("href", `/services#service-${index + 1}`);
  }
  await expect(capabilities).toContainText("not a fixed package");
  await expect(page.locator(".about-fit").getByRole("listitem")).toHaveCount(4);
  const process = page.getByRole("region", { name: "From the first question to a clear handover." });
  await expect(process.locator("ol > li")).toHaveCount(4);
  await expect(process.getByRole("heading", { level: 3 })).toHaveText([
    "Understand the brief.", "Agree the scope.", "Design, build, and refine.", "Prepare the handover.",
  ]);
  await process.getByRole("link", { name: "Discuss your project" }).click();
  await expect(page).toHaveURL(/\/contact$/);
});

test("Contact pairs a brand-colored ringing phone with the unchanged inquiry form", async ({ page }, testInfo) => {
  await page.goto("/contact");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("a conversation.");
  const phone = page.locator(".contact-phone-art");
  await expect(phone).toBeVisible();
  await expect(phone).toHaveAttribute("aria-hidden", "true");
  const fills = await phone.evaluate(svg => [...svg.querySelectorAll("stop, [fill], [stroke]")].flatMap(element => [element.getAttribute("stop-color"), element.getAttribute("fill"), element.getAttribute("stroke")]).filter((value): value is string => !!value && value.startsWith("#")));
  const allowed = ["#050926", "#2a41f1", "#3c7eff", "#1b2bb5", "#99bcff", "#a2e8f9", "#f2f3f4", "#000"];
  expect(fills.length).toBeGreaterThan(5);
  expect(fills.filter(color => !allowed.includes(color.toLowerCase()))).toEqual([]);
  const panel = page.locator(".contact-phone-panel");
  await expect(panel).toContainText("Pick up the line.");
  const handset = phone.locator(".phone-handset");
  const lift = () => handset.evaluate(element => new DOMMatrix(getComputedStyle(element).transform).m42);
  await expect.poll(lift).toBeLessThan(-4);
  await expect.poll(lift, { timeout: 6000 }).toBe(0);
  const animations = () => handset.evaluate(element => element.getAnimations().filter(animation => animation.playState === "running").length);
  await expect.poll(animations).toBe(0);
  await panel.hover();
  await expect.poll(lift).toBeLessThan(-4);
  await expect.poll(() => phone.locator(".phone-dial").evaluate(element => new DOMMatrix(getComputedStyle(element).transform).b)).toBeLessThan(-.5);
  await page.screenshot({ path: testInfo.outputPath("contact-phone-ringing.png") });
  await page.mouse.move(0, 0);
  await expect.poll(animations).toBe(0);
  await expect(page.locator(".contact-note")).toContainText("don't include sensitive personal information");
  await expect(page.getByLabel("Your name")).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByLabel("A little about your project")).toBeVisible();
  await expect(page.getByRole("checkbox")).not.toBeChecked();
  await page.getByLabel("Your name").fill("Test Person");
  await page.getByLabel("Email address").fill("person@example.com");
  await page.getByLabel("What are you thinking about?").selectOption("Web development");
  await page.getByLabel("A little about your project").fill("We would like to discuss a website for our studio.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Start the conversation" }).click();
  await expect(page.locator(".contact-form").getByRole("alert")).toContainText("isn't connected yet");
  await expect(page.getByRole("button", { name: "Start the conversation" })).toBeEnabled();
});

test("About and Contact remain readable without overflow at desktop, tablet, and mobile widths", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1440, 768, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ["/about", "/contact"]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      if (route === "/contact") {
        await expect(page.locator(".contact-phone-art")).toBeVisible();
        await expect.poll(() => page.locator(".contact-phone-art .phone-handset").evaluate(element => element.getAnimations().length)).toBe(0);
        if (width === 1440) {
          const placement = await page.locator(".contact-card").evaluate(element => {
            const artwork = element.querySelector(".contact-phone-panel")!.getBoundingClientRect();
            const form = element.querySelector(".contact-form")!.getBoundingClientRect();
            return artwork.right <= form.left;
          });
          expect(placement).toBe(true);
        }
      } else {
        await expect(page.locator(".about-service-card")).toHaveCount(3);
      }
      await page.screenshot({ path: testInfo.outputPath(`${route.slice(1)}-${width}.png`), fullPage: true });
    }
  }
});

test("service lists and contact artwork are available without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce" });
  try {
    const page = await context.newPage();
    await page.goto("/about");
    await expect(page.locator(".about-service-card ul")).toHaveCount(localServices.length);
    await expect(page.locator(".about-process ol > li")).toHaveCount(4);
    await page.goto("/contact");
    await expect(page.locator(".contact-phone-art")).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.locator(".contact-note")).toBeVisible();
  } finally {
    await context.close();
  }
});
