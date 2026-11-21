import type { Locator } from "@playwright/test";
import { card, expect, look, openLive, test } from "./fixtures";

const settle = (stage: Locator) => expect.poll(() => stage.locator("[data-hit]").count()).toBeGreaterThan(0);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("gallery load, filtering, search, theme persistence, and dialog Escape focus restore", async ({ page }) => {
  await expect(page.locator("article")).toHaveCount(50);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);

  const nav = page.getByRole("navigation", { name: "Filter by category" });
  await nav.getByRole("button", { name: /^Morphism & Depth/ }).click();
  await expect(page.locator("article")).toHaveCount(10);
  await page.getByRole("searchbox").fill("glass");
  await expect(page.locator("article")).toHaveCount(4);
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await expect(page.locator("article")).toHaveCount(10);
  await nav.getByRole("button", { name: /^All/ }).click();
  await expect(page.locator("article")).toHaveCount(50);

  // Light/dark theme persists across reload.
  const isDark = () => page.evaluate(() => document.documentElement.classList.contains("dark"));
  const startDark = await isDark();
  await page.getByRole("button", { name: /Switch to (dark|light) mode/ }).click();
  expect(await isDark()).toBe(!startDark);
  await page.reload();
  expect(await isDark()).toBe(!startDark);

  // Detail dialog opens, traps focus inside dialog, and restores focus to trigger on Escape.
  const trigger = card(page, 4).getByRole("button", { name: "View details" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.locator("dialog");
  await expect(dialog).toBeVisible();
  await expect.poll(() => dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("custom range sliders render and update across browsers (04, 10, 18, 31, 46)", async ({ page }) => {
  for (const [id, name] of [
    [4, "Volume"],
    [10, "Playback position"],
    [18, "Rotate Y"],
    [31, "Scrub"],
    [46, "Output attenuation"],
  ] as const) {
    const stage = await openLive(page, id);
    await settle(stage);
    const slider = stage.getByRole("slider", { name });
    await expect(slider).toBeVisible();
    const box = (await slider.boundingBox())!;
    expect(box.width, `style ${id} ${name} width`).toBeGreaterThan(20);
    expect(box.height, `style ${id} ${name} height`).toBeGreaterThan(10);
    const appearance = await slider.evaluate((el) => getComputedStyle(el).appearance);
    expect(appearance, `style ${id} ${name} custom appearance`).toBe("none");

    const before = await slider.inputValue();
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(slider).not.toHaveValue(before);

    await page.getByRole("button", { name: "Close details" }).click();
    await expect(page.locator("dialog")).not.toBeVisible();
  }
});

test("backdrop-filter & glass effects render and respond (05, 10, 31, 45)", async ({ page }) => {
  const hasBackdropBlur = (loc: Locator) =>
    loc.evaluate((el) => {
      const c = getComputedStyle(el);
      const val = c.backdropFilter || (c as unknown as { webkitBackdropFilter?: string }).webkitBackdropFilter || "";
      return val.includes("blur(");
    });

  // 05 Glassmorphism
  const s5 = await openLive(page, 5);
  await settle(s5);
  expect(await hasBackdropBlur(s5.locator('[class*="glass"]').first())).toBe(true);
  await s5.getByRole("radio").nth(1).click();
  await expect(s5.getByText("Tue · Showers", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Close details" }).click();

  // 10 Liquid Glass
  const s10 = await openLive(page, 10);
  await settle(s10);
  expect(await hasBackdropBlur(s10.locator('[class*="liquid"]').first())).toBe(true);
  await s10.getByRole("button", { name: "Caustics" }).click();
  await expect(s10.getByText(/64% depth · Caustics/)).toBeVisible();
  await page.getByRole("button", { name: "Close details" }).click();

  // 31 visionOS
  const s31 = await openLive(page, 31);
  await settle(s31);
  expect(await hasBackdropBlur(s31.locator('[class*="glass"]').first())).toBe(true);
  await s31.getByRole("button", { name: /Expand to room/ }).click();
  await expect(s31.getByRole("button", { name: /Return to window/ })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Close details" }).click();

  // 45 Obsidian Glass
  const s45 = await openLive(page, 45);
  await settle(s45);
  expect(await hasBackdropBlur(s45.locator('[class*="panel"]').first())).toBe(true);
  await s45.getByRole("button", { name: /Backdrop blur/ }).click();
  await expect(s45.getByText("40px Gaussian")).toBeVisible();
  await page.getByRole("button", { name: "Close details" }).click();
});

test("3D transforms & perspective work (18, 34, 35)", async ({ page }, info) => {
  // 18 Spatial 3D
  const s18 = await openLive(page, 18);
  await s18.getByRole("button", { name: /Explore 3D/ }).click();
  await expect(s18.getByText("ROTATION: -30° Y")).toBeVisible();
  await page.getByRole("button", { name: "Close details" }).click();

  // 34 Isometric
  const s34 = await openLive(page, 34);
  await s34.getByRole("radio", { name: "L1: STORAGE" }).click();
  await expect(s34.getByText(/SELECTED \/\/ STORAGE/)).toBeVisible();
  await s34.getByRole("button", { name: "Explode" }).click();
  await expect(s34.getByRole("button", { name: "Collapse" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Close details" }).click();

  // 35 Holographic
  const s35 = await openLive(page, 35);
  if (info.project.name !== "mobile-touch") {
    const scene = s35.locator('[class*="scene"]').first();
    const box = (await scene.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.25);
    await expect(s35.getByText("TILT X 0° · Y 0° // SHEEN 135°")).toHaveCount(0);
    await s35.getByRole("button", { name: "Reset" }).click();
  }
  await s35.getByRole("button", { name: "Tilt right" }).click();
  await expect(s35.getByText("TILT X 0° · Y 6° // SHEEN 153°")).toBeVisible();
  await s35.getByRole("button", { name: "Flip" }).click();
  await expect(s35.getByText("SIDE: BACK")).toBeVisible();
  await page.getByRole("button", { name: "Close details" }).click();
});

test("variable fonts & custom typography work (17, 23, 43)", async ({ page }) => {
  // 17 Kinetic Type
  const s17 = await openLive(page, 17);
  await s17.getByRole("button", { name: "Emphasize MAKE" }).click();
  await expect(s17.getByText("EMPHASIS // MAKE")).toBeVisible();
  await s17.getByRole("radio", { name: "Stagger" }).click();
  await expect(s17.getByRole("radio", { name: "Stagger" })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "Close details" }).click();

  // 23 Editorial
  const s23 = await openLive(page, 23);
  await s23.getByRole("button", { name: "A+ larger text" }).click();
  await expect(s23.getByText(/READ TIME: 8 MIN · 11PX/)).toBeVisible();
  await s23.getByRole("radio", { name: "Focus" }).click();
  await expect(s23.getByRole("radio", { name: "Focus" })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "Close details" }).click();

  // 43 Variable Font (real wght + wdth axes)
  const s43 = await openLive(page, 43);
  await expect.poll(() => page.evaluate(() => document.fonts.check('700 40px "Axis Sans Subset"'))).toBe(true);
  const word = s43.getByText("HEAVY", { exact: true });
  const glyphWidth = () =>
    word.evaluate((el) => {
      const r = document.createRange();
      r.selectNodeContents(el);
      return r.getBoundingClientRect().width;
    });
  const width = s43.getByRole("slider", { name: "Width" });
  const weight = s43.getByRole("slider", { name: "Weight" });
  await width.focus();
  await page.keyboard.press("Home");
  await weight.focus();
  await page.keyboard.press("Home");
  await page.waitForTimeout(400);
  const narrowLight = await glyphWidth();
  await page.keyboard.press("End");
  await expect.poll(glyphWidth).toBeGreaterThan(narrowLight * 1.05);
  const narrowHeavy = await glyphWidth();
  await width.focus();
  await page.keyboard.press("End");
  await expect.poll(glyphWidth).toBeGreaterThan(narrowHeavy * 1.1);
  await page.getByRole("button", { name: "Close details" }).click();
});

test("complex interactive previews work (24, 30, 37, 38, 47)", async ({ page }) => {
  // 24 Scrollytelling
  const s24 = await openLive(page, 24);
  await s24.getByRole("button", { name: "Chapter 03: Global Scaling" }).click();
  await expect(s24.getByText("FRAME 03 / 03")).toBeVisible();
  await expect(s24.getByText("1.00 Y")).toBeVisible();
  await page.getByRole("button", { name: "Close details" }).click();

  // 30 Command-First palette
  const s30 = await openLive(page, 30);
  const combo = s30.getByRole("combobox", { name: "Type a command or search" });
  await combo.fill("settings");
  await page.keyboard.press("Enter");
  await expect(s30.getByRole("status")).toContainText("Settings opened");
  await s30.getByRole("button", { name: /Open command palette/ }).click();
  await expect(combo).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(combo).toHaveCount(0);
  await expect(page.locator("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close details" }).click();

  // 37 Terminal
  const s37 = await openLive(page, 37);
  const input = s37.getByRole("textbox", { name: "Terminal command" });
  await input.fill("help");
  await page.keyboard.press("Enter");
  await expect(s37.getByText(/available: help · about/)).toBeVisible();
  await input.fill("theme amber");
  await page.keyboard.press("Enter");
  await expect(s37.getByText(/BASH 5\.2 • AMBER/)).toBeVisible();
  await page.keyboard.press("ArrowUp");
  await expect(input).toHaveValue("theme amber");
  await page.getByRole("button", { name: "Close details" }).click();

  // 38 Windows 95
  const s38 = await openLive(page, 38);
  await s38.getByRole("tab", { name: "Hardware" }).click();
  await expect(s38.getByText("[OK] Sound Blaster 16 detected")).toBeVisible();
  const win = s38.locator('section[aria-label="System.exe"]');
  await s38.getByRole("button", { name: /Move window/ }).focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await expect(win).toHaveAttribute("style", /translate\(10px, 10px\)/);
  await page.getByRole("button", { name: "Close details" }).click();

  // 47 Heatmap roving tabindex + arrow keys
  const s47 = await openLive(page, 47);
  await expect(s47.locator('section[aria-label="Activity heatmap"] button[tabindex="0"]')).toHaveCount(1);
  await s47.getByRole("button", { name: /day 18:/ }).focus();
  await page.keyboard.press("End");
  await expect(s47.getByRole("button", { name: /day 21:/ })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(s47.getByText("DAY 21 // SUN W3")).toBeVisible();
  await page.getByRole("button", { name: "Close details" }).click();
});

test("mobile touch: taps, Style 35 vertical touch scroll, and zero horizontal overflow", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile-touch", "simulated mobile touch only");

  // Tap controls on Style 04 and StyleDetail chrome.
  await card(page, 4).getByRole("button", { name: "View details" }).tap();
  const dialog = page.locator("dialog");
  const s4 = dialog.locator('[data-preview-id="4"]');
  await expect(s4).toBeVisible();
  await s4.getByRole("button", { name: "Increase temperature" }).tap();
  await expect(s4.getByLabel("Target 73 degrees Fahrenheit")).toBeVisible();
  const eco = s4.getByRole("radio", { name: "ECO" });
  const beforeEco = await look(eco);
  await eco.tap();
  await expect(eco).toHaveAttribute("aria-checked", "true");
  await expect.poll(() => look(eco)).not.toBe(beforeEco);

  await dialog.getByRole("tab", { name: "Original CSS" }).tap();
  await expect(dialog.getByRole("button", { name: "Copy Original CSS" })).toBeVisible();
  await dialog.getByRole("button", { name: "Close details" }).tap();
  await expect(dialog).not.toBeVisible();

  // Style 35: vertical touch swipe starting on the holographic card scrolls the dialog instead of trapping scroll.
  await card(page, 35).getByRole("button", { name: "View details" }).tap();
  const s35 = dialog.locator('[data-preview-id="35"]');
  await expect(s35).toBeVisible();
  const scene = s35.locator('[class*="scene"]').first();
  expect(await scene.evaluate((el) => getComputedStyle(el).touchAction)).toBe("pan-y");

  const scroller = dialog.locator(".overflow-y-auto");
  const beforeScroll = await scroller.evaluate((el) => el.scrollTop);
  const box = (await scene.boundingBox())!;
  const x = Math.round(box.x + box.width / 2);
  const startY = Math.round(box.y + box.height * 0.7);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: startY, id: 1 }] });
  for (let step = 1; step <= 6; step++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: startY - step * 35, id: 1 }] });
    await page.waitForTimeout(25);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();

  await expect.poll(() => scroller.evaluate((el) => el.scrollTop)).toBeGreaterThan(beforeScroll);
  await expect(s35.getByText("TILT X 0° · Y 0° // SHEEN 135°")).toBeVisible();

  // Wait until touch-scroll deceleration settles (two identical scrollTop samples) before tapping Close details.
  await expect
    .poll(async () => {
      const a = await scroller.evaluate((el) => el.scrollTop);
      await page.waitForTimeout(80);
      const b = await scroller.evaluate((el) => el.scrollTop);
      return a === b;
    })
    .toBe(true);

  // Zero horizontal overflow in dialog at 375px.
  const dialogOverflow = await dialog.evaluate((d) => {
    const sc = d.querySelector<HTMLElement>(".overflow-y-auto") ?? d;
    return Math.max(document.documentElement.scrollWidth - innerWidth, sc.scrollWidth - sc.clientWidth);
  });
  expect(dialogOverflow).toBeLessThanOrEqual(0);

  await dialog.getByRole("button", { name: "Close details" }).tap();
  await expect(dialog).not.toBeVisible();

  // Tap heatmap cell on Style 47.
  await card(page, 47).getByRole("button", { name: "View details" }).tap();
  const s47 = dialog.locator('[data-preview-id="47"]');
  await expect(s47).toBeVisible();
  await s47.getByRole("button", { name: /day 4:/ }).tap();
  await expect(s47.getByText("2,380 Active Sessions")).toBeVisible();
});
