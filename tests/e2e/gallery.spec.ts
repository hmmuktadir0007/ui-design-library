import { card, expect, test } from "./fixtures";

// Phase 2A regression checks.
test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("search and category filters combine", async ({ page }) => {
  await expect(page.locator("article")).toHaveCount(50);
  const nav = page.getByRole("navigation", { name: "Filter by category" });
  await expect(nav.getByRole("button", { name: /^Morphism & Depth 10$/ })).toBeVisible();
  await page.getByRole("searchbox").fill("  GLASS ");
  await expect(page.locator("article")).toHaveCount(5);
  await nav.getByRole("button", { name: /^Morphism & Depth/ }).click();
  await expect(page.locator("article")).toHaveCount(4);
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await expect(page.locator("article")).toHaveCount(10);
  await page.getByRole("searchbox").fill("zzzz");
  await expect(page.getByText("No styles match your filters")).toBeVisible();
});

test("copy actions write exact values", async ({ page }) => {
  const read = () => page.evaluate(() => navigator.clipboard.readText());
  await card(page, 10).getByRole("button", { name: "View details" }).click();
  const dialog = page.locator("dialog");
  await dialog.getByRole("button", { name: /rgba.*Liquid Fill/ }).click();
  expect(await read()).toBe("rgba(255,255,255,0.22)");
  await dialog.getByRole("button", { name: "Copy AI Prompt" }).click();
  expect(await read()).toMatch(/^Design a Liquid Glass floating navigation dock/);
  await dialog.getByRole("tab", { name: "Original CSS" }).click();
  await dialog.getByRole("button", { name: "Copy Original CSS" }).click();
  expect((await read()).replace(/\r\n/g, "\n")).toContain("backdrop-filter: blur(24px) saturate(180%);");
  await expect(dialog.getByText("Copied!").first()).toBeVisible();
});

test("theme toggle persists across reload", async ({ page }) => {
  const dark = () => page.evaluate(() => document.documentElement.classList.contains("dark"));
  const start = await dark();
  await page.getByRole("button", { name: /Switch to (dark|light) mode/ }).click();
  expect(await dark()).toBe(!start);
  await page.reload();
  expect(await dark()).toBe(!start);
});

test("no horizontal overflow with live previews open", async ({ page }) => {
  for (const id of [1, 18, 46]) await card(page, id).getByRole("button", { name: "Live CSS" }).click();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
