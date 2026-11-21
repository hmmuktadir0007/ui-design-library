import AxeBuilder from "@axe-core/playwright";
import { expect, LIVE_IDS, openLive, test } from "./fixtures";

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("viewport presets resize preview frame and Compare mode shows original next to live", async ({ page }) => {
  await openLive(page, 3);
  const dialog = page.locator("dialog");
  const frame = dialog.locator("[data-viewport-frame]");

  const desktopW = (await frame.boundingBox())!.width;
  await dialog.getByRole("button", { name: "Tablet" }).click();
  await expect(frame).toHaveAttribute("data-viewport-frame", "tablet");
  await expect.poll(async () => (await frame.boundingBox())!.width).toBeLessThan(desktopW - 2);
  const tabletW = (await frame.boundingBox())!.width;

  await dialog.getByRole("button", { name: "Mobile" }).click();
  await expect(frame).toHaveAttribute("data-viewport-frame", "mobile");
  await expect.poll(async () => (await frame.boundingBox())!.width).toBeLessThan(tabletW - 2);

  // Switch to Compare mode: both Original slide and Live CSS are visible.
  await dialog.getByRole("button", { name: "Compare" }).click();
  const compare = dialog.locator("[data-playground-compare]");
  await expect(compare).toBeVisible();
  await expect(compare.locator("img")).toBeVisible();
  await expect(compare.locator('[data-preview-id="3"]')).toBeVisible();

  // No horizontal overflow in Compare mode at any viewport.
  const overflow = await dialog.evaluate((d) => {
    const scroller = d.querySelector<HTMLElement>(".overflow-y-auto") ?? d;
    return Math.max(document.documentElement.scrollWidth - innerWidth, scroller.scrollWidth - scroller.clientWidth);
  });
  expect(overflow).toBeLessThanOrEqual(0);
});

test("Playground controls update live preview CSS vars & Generated CSS, keep Original CSS immutable, copy & reset cleanly", async ({ page }) => {
  const stage = await openLive(page, 3);
  const dialog = page.locator("dialog");
  const resetBtn = dialog.getByRole("button", { name: "Reset", exact: true });
  await expect(resetBtn).toBeDisabled();

  // Capture Original CSS before customizing.
  await dialog.getByRole("tab", { name: "Original CSS" }).click();
  const originalPanel = dialog.getByRole("tabpanel", { name: "Original CSS" });
  const originalBefore = await originalPanel.locator("pre").textContent();

  // Switch to Generated CSS tab.
  await dialog.getByRole("tab", { name: "Generated CSS" }).click();
  const genPanel = dialog.getByRole("tabpanel", { name: "Generated CSS" });
  await expect(genPanel.locator("pre")).toContainText("--accent: #6750A4;");
  await expect(genPanel.locator("pre")).toContainText("--radius: 16px;");

  // Change accent swatch, border radius, surface padding, shadow depth, and backdrop.
  await dialog.getByRole("button", { name: "Accent swatch #F59E0B" }).click();
  await dialog.getByLabel("Border radius").fill("24");
  await dialog.getByLabel("Surface padding").fill("1.2");
  await dialog.getByLabel("Shadow depth").fill("1.4");
  await dialog.getByRole("button", { name: "Dark", exact: true }).click();

  await expect(resetBtn).toBeEnabled();

  // Live preview artboard reflects updated --pg-* vars and computed border-radius on a Material card.
  const artboardVars = await stage.locator("> div").evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      accent: cs.getPropertyValue("--pg-accent").trim(),
      radius: cs.getPropertyValue("--pg-radius").trim(),
      scale: cs.getPropertyValue("--pg-scale").trim(),
      shadow: cs.getPropertyValue("--pg-shadow-strength").trim(),
    };
  });
  expect(artboardVars).toEqual({
    accent: "#F59E0B",
    radius: "24px",
    scale: "1.2",
    shadow: "1.4",
  });
  const cardRadius = await stage.locator('[class*="card"]').first().evaluate((el) => getComputedStyle(el).borderRadius);
  expect(cardRadius).toBe("24px");

  // Generated CSS updates dynamically.
  await expect(genPanel.locator("pre")).toContainText("--accent: #F59E0B;");
  await expect(genPanel.locator("pre")).toContainText("--radius: 24px;");
  await expect(genPanel.locator("pre")).toContainText("--density: 1.2;");
  await expect(genPanel.locator("pre")).toContainText("--shadow-strength: 1.4;");

  // Copy Generated CSS writes exact custom properties to clipboard.
  await genPanel.getByRole("button", { name: "Copy Generated CSS" }).click();
  const copied = (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, "\n");
  expect(copied).toContain("--accent: #F59E0B;");
  expect(copied).toContain("--radius: 24px;");
  await expect(genPanel.getByText("Copied!")).toBeVisible();

  // Original CSS remains 100% immutable.
  await dialog.getByRole("tab", { name: "Original CSS" }).click();
  expect(await originalPanel.locator("pre").textContent()).toBe(originalBefore);

  // Reset restores all values, backdrop, and viewport preset to defaults.
  await resetBtn.click();
  await expect(resetBtn).toBeDisabled();
  await expect(dialog.locator("[data-playground-stage]")).toHaveAttribute("data-backdrop", "auto");
  await dialog.getByRole("tab", { name: "Generated CSS" }).click();
  await expect(genPanel.locator("pre")).toContainText("--accent: #6750A4;");
  await expect(genPanel.locator("pre")).toContainText("--radius: 16px;");
  await expect(genPanel.locator("pre")).toContainText("--density: 1;");
  await expect(genPanel.locator("pre")).toContainText("--shadow-strength: 1;");
});

test("sharp-corner style omits Border Radius control and Playground passes axe WCAG 2.2 AA", async ({ page }) => {
  await openLive(page, 7);
  const dialog = page.locator("dialog");

  // Neo-Brutalism has sharp 0px corners: no Border radius slider exposed.
  await expect(dialog.getByLabel("Border radius")).toHaveCount(0);
  await expect(dialog.getByLabel("Shadow depth")).toBeVisible();

  // Generated CSS lists only supported variables.
  await dialog.getByRole("tab", { name: "Generated CSS" }).click();
  const genText = await dialog.getByRole("tabpanel", { name: "Generated CSS" }).locator("pre").textContent();
  expect(genText).toContain("--accent:");
  expect(genText).toContain("--shadow-strength:");
  expect(genText).not.toContain("--radius");

  // Zero axe WCAG 2.2 AA violations on the open Playground dialog.
  const axe = await new AxeBuilder({ page }).include("dialog").withTags(WCAG).analyze();
  expect(axe.violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.html.slice(0, 120)}`))).toEqual([]);
});

test("Mobile 9:16 and Tablet 4:3 device frames render true aspect ratios and reflow multi-column layouts", async ({ page }) => {
  const stage = await openLive(page, 8); // Bento UI (4-col desktop -> 2-col tablet -> 1-col mobile)
  const dialog = page.locator("dialog");
  const frame = dialog.locator("[data-viewport-frame]");

  // Desktop: 4-column bento grid
  const desktopCols = await stage.locator('[class*="root"]').first().evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
  expect(desktopCols).toBe(4);

  // Tablet: 4:3 landscape proportion
  await dialog.getByRole("button", { name: "Tablet" }).click();
  await expect(frame).toHaveAttribute("data-viewport-frame", "tablet");
  await expect(stage).toHaveAttribute("data-viewport", "tablet");
  await expect.poll(async () => {
    const b = (await frame.boundingBox())!;
    return b.width / b.height;
  }).toBeCloseTo(4 / 3, 1);

  // Mobile: 9:16 portrait proportion (height > width) and 1-column reflow
  await dialog.getByRole("button", { name: "Mobile" }).click();
  await expect(frame).toHaveAttribute("data-viewport-frame", "mobile");
  await expect(stage).toHaveAttribute("data-viewport", "mobile");
  await expect.poll(async () => {
    const b = (await frame.boundingBox())!;
    return b.width / b.height;
  }).toBeCloseTo(9 / 16, 1);
  const mobileBox = (await frame.boundingBox())!;
  expect(mobileBox.height).toBeGreaterThan(mobileBox.width);

  // Wait for width transition (200ms) to finish and trigger @container preview-stage (max-width: 350px).
  await expect.poll(async () =>
    stage.locator('[class*="root"]').first().evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length),
  ).toBe(1);

  // Close and verify Style 03 (Material 2-col -> 1-col) and Style 48 (Masonry 3-col -> 1-col)
  await dialog.getByRole("button", { name: "Close details" }).click();
  const stage3 = await openLive(page, 3);
  const matDesktopCols = await stage3.locator('[class*="body"]').first().evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
  expect(matDesktopCols).toBe(2);
  await dialog.getByRole("button", { name: "Mobile" }).click();
  await expect.poll(async () =>
    stage3.locator('[class*="body"]').first().evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length),
  ).toBe(1);

  await dialog.getByRole("button", { name: "Close details" }).click();
  const stage48 = await openLive(page, 48);
  const wallDesktopCols = await stage48.locator('[class*="wall"]').first().evaluate((el) => getComputedStyle(el).columnCount);
  expect(wallDesktopCols).toBe("3");
  await dialog.getByRole("button", { name: "Mobile" }).click();
  await expect.poll(async () =>
    stage48.locator('[class*="wall"]').first().evaluate((el) => getComputedStyle(el).columnCount),
  ).toBe("1");
});

test("all 50 styles have zero horizontal overflow in Tablet and Mobile viewport presets", async ({ page }) => {
  test.slow();
  const dialog = page.locator("dialog");

  for (const id of LIVE_IDS) {
    const stage = await openLive(page, id);
    for (const preset of ["Tablet", "Mobile"] as const) {
      await dialog.getByRole("button", { name: preset, exact: true }).click();
      await expect(stage).toHaveAttribute("data-viewport", preset.toLowerCase());
      // Allow layout settle for container query reflow
      const overflow = await stage.evaluate((el) => ({
        stageOverflow: el.scrollWidth - el.clientWidth,
        pageOverflow: document.documentElement.scrollWidth - window.innerWidth,
      }));
      expect(overflow.stageOverflow, `style ${id} (${preset}) stage horizontal overflow`).toBeLessThanOrEqual(1);
      expect(overflow.pageOverflow, `style ${id} (${preset}) page horizontal overflow`).toBeLessThanOrEqual(0);
    }
    await dialog.getByRole("button", { name: "Close details" }).click();
    await expect(dialog).toBeHidden();
  }
});

test("in-preview Light, Dark, and Neutral theme switching updates internal preview root, Generated CSS, and passes axe WCAG 2.2 AA", async ({
  page,
}) => {
  test.slow();
  const dialog = page.locator("dialog");
  const rootStyle = (stage: ReturnType<typeof page.locator>) =>
    stage.locator('[class*="root"]').first().evaluate((el) => {
      const cs = getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });

  // Naturally dark styles -> Light mode changes internal root to light bg + dark ink and passes axe WCAG 2.2 AA.
  for (const id of [16, 22, 37, 45]) {
    const stage = await openLive(page, id);
    const autoStyle = await rootStyle(stage);
    await dialog.getByRole("button", { name: "Light", exact: true }).click();
    await expect(stage).toHaveAttribute("data-preview-theme", "light");
    const lightStyle = await rootStyle(stage);
    expect(lightStyle.bg, `style ${id} Light bg`).toBe("rgb(248, 250, 252)");
    expect(lightStyle.color, `style ${id} Light text`).toBe("rgb(15, 23, 42)");
    expect(lightStyle.bg).not.toBe(autoStyle.bg);

    const axe = await new AxeBuilder({ page }).include("dialog").withTags(WCAG).analyze();
    expect(
      axe.violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.html.slice(0, 100)}`)),
      `style ${id} axe in Light mode`,
    ).toEqual([]);

    await dialog.getByRole("button", { name: "Close details" }).click();
    await expect(dialog).toBeHidden();
  }

  // Naturally light styles -> Dark mode changes internal root to dark bg + light ink and passes axe WCAG 2.2 AA.
  for (const id of [3, 4, 11, 32, 50]) {
    const stage = await openLive(page, id);
    const autoStyle = await rootStyle(stage);
    await dialog.getByRole("button", { name: "Dark", exact: true }).click();
    await expect(stage).toHaveAttribute("data-preview-theme", "dark");
    const darkStyle = await rootStyle(stage);
    expect(darkStyle.bg, `style ${id} Dark bg`).toBe("rgb(11, 15, 25)");
    expect(darkStyle.color, `style ${id} Dark text`).toBe("rgb(248, 250, 252)");
    expect(darkStyle.bg).not.toBe(autoStyle.bg);

    const axe = await new AxeBuilder({ page }).include("dialog").withTags(WCAG).analyze();
    expect(
      axe.violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.html.slice(0, 100)}`)),
      `style ${id} axe in Dark mode`,
    ).toEqual([]);

    await dialog.getByRole("button", { name: "Close details" }).click();
    await expect(dialog).toBeHidden();
  }

  // Neutral mode updates internal root, emits theme tokens in Generated CSS, keeps Original CSS immutable, and resets cleanly.
  const stage = await openLive(page, 22);
  await dialog.getByRole("tab", { name: "Original CSS" }).click();
  const originalBefore = await dialog.getByRole("tabpanel", { name: "Original CSS" }).locator("pre").textContent();

  await dialog.getByRole("button", { name: "Neutral", exact: true }).click();
  await expect(stage).toHaveAttribute("data-preview-theme", "neutral");
  const neutralStyle = await rootStyle(stage);
  expect(neutralStyle.bg).toBe("rgb(244, 244, 245)");
  expect(neutralStyle.color).toBe("rgb(24, 24, 27)");

  await dialog.getByRole("tab", { name: "Generated CSS" }).click();
  const genText = await dialog.getByRole("tabpanel", { name: "Generated CSS" }).locator("pre").textContent();
  expect(genText).toContain("--pg-bg: #f4f4f5;");
  expect(genText).toContain("--pg-surface: #ffffff;");
  expect(genText).toContain("--pg-text: #18181b;");
  expect(genText).toContain("--pg-border: #a1a1aa;");

  await dialog.getByRole("tab", { name: "Original CSS" }).click();
  expect(await dialog.getByRole("tabpanel", { name: "Original CSS" }).locator("pre").textContent()).toBe(originalBefore);

  const axeNeutral = await new AxeBuilder({ page }).include("dialog").withTags(WCAG).analyze();
  expect(axeNeutral.violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.html.slice(0, 100)}`))).toEqual([]);

  await dialog.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(stage).toHaveAttribute("data-preview-theme", "auto");
});
