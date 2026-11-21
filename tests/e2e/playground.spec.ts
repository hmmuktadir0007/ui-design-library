import AxeBuilder from "@axe-core/playwright";
import { expect, openLive, test } from "./fixtures";

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
