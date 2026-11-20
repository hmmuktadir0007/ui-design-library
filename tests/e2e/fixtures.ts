import { test as base, expect, type Locator, type Page } from "@playwright/test";

/** Fails any test that logs a browser console error/warning or throws an uncaught page error. */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error" || m.type() === "warning") errors.push(m.text());
      });
      page.on("pageerror", (e) => errors.push(String(e)));
      await use(errors);
      expect(errors, "browser console errors").toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };

/** Styles with a registered live preview (batch 1: Morphism & Depth, 2: Bold, Retro & Expressive, 3: Modern SaaS & Dashboards, 4: Minimal & Typographic). */
export const LIVE_IDS = [1, 4, 5, 6, 10, 18, 31, 34, 45, 46, 7, 12, 15, 21, 33, 36, 38, 39, 42, 49, 3, 8, 14, 29, 30, 32, 37, 47, 48, 2, 11, 17, 23, 25, 41, 43];

// By the card's own heading, not article.nth(id - 1): a live preview containing <article> (e.g. 48) shifts nth indexes.
export const card = (page: Page, id: number) => page.locator(`article[aria-labelledby="style-${id}-name"]`);

/** Opens the detail dialog for a style and returns its live preview stage. */
export async function openLive(page: Page, id: number): Promise<Locator> {
  await card(page, id).getByRole("button", { name: "View details" }).click();
  const stage = page.locator(`dialog [data-preview-id="${id}"]`);
  await expect(stage).toBeVisible();
  return stage;
}

/** Visual state of an element, to prove an interaction changed what the user sees. */
export const look = (l: Locator) =>
  l.evaluate((el) => {
    const c = getComputedStyle(el);
    return [c.backgroundColor, c.backgroundImage, c.boxShadow, c.color, c.transform, c.filter, c.borderColor].join("|");
  });
