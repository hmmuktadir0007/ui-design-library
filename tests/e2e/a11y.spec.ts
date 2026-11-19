import AxeBuilder from "@axe-core/playwright";
import type { Locator } from "@playwright/test";
import { expect, LIVE_IDS, openLive, test } from "./fixtures";
const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const CONTROLS = 'button, input, [role="slider"], [role="radio"], [role="switch"]';

/**
 * Real hit testing, so the stage's scale transform and the invisible ::after / border extenders count:
 * how far from its centre a click still lands on each control, and whether any point of its own
 * visible box is hit-tested as a different control (= overlapping hit areas).
 */
function measureTargets(stage: Locator) {
  return stage.evaluate((root, sel) => {
    const els = [...root.querySelectorAll<HTMLElement>(sel)];
    const owner = (x: number, y: number) => {
      const e = document.elementFromPoint(x, y);
      return els.find((c) => c === e || c.contains(e));
    };
    const reach = (el: HTMLElement, x: number, y: number, dx: number, dy: number) => {
      let d = 0;
      while (d < 60 && owner(x + (d + 0.5) * dx, y + (d + 0.5) * dy) === el) d += 0.5;
      return d;
    };
    const label = (el: Element) => (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().slice(0, 30);
    return els.map((el) => {
      const r = el.getBoundingClientRect();
      const cx = r.x + r.width / 2;
      const cy = r.y + r.height / 2;
      const thief = [0.25, 0.5, 0.75]
        .flatMap((fx) => [0.25, 0.5, 0.75].map((fy) => owner(r.x + r.width * fx, r.y + r.height * fy)))
        .find((o) => o && o !== el);
      return {
        name: label(el),
        width: reach(el, cx, cy, -1, 0) + reach(el, cx, cy, 1, 0),
        height: reach(el, cx, cy, 0, -1) + reach(el, cx, cy, 0, 1),
        stolenBy: thief ? label(thief) : null,
      };
    });
  }, CONTROLS);
}

/** Hit areas are applied a frame after the preview mounts. */
const settle = (stage: Locator) => expect.poll(() => stage.locator("[data-hit]").count()).toBeGreaterThan(0);

for (const id of LIVE_IDS) {
  test(`style ${id}: targets >= 24x24 without overlap, visible keyboard focus, axe WCAG 2.2 AA`, async ({ page }) => {
    test.slow(); // hit-testing walk + Tab loop + axe: ~7s alone, >30s with 8 parallel workers
    await page.goto("/");
    const stage = await openLive(page, id);
    await settle(stage);

    for (const t of await measureTargets(stage)) {
      expect(t.stolenBy, `${t.name}: part of its visible box hits another control`).toBeNull();
      expect(t.width, `${t.name} effective width`).toBeGreaterThanOrEqual(24);
      expect(t.height, `${t.name} effective height`).toBeGreaterThanOrEqual(24);
    }

    // Tab through the preview: every control is reachable and shows an outline while focused.
    const controls = stage.locator(CONTROLS);
    const ring = (l: Locator) =>
      l.evaluate((el) => {
        const c = getComputedStyle(el);
        return [c.outlineStyle, c.outlineWidth, c.outlineColor].join(" ");
      });
    await page.getByRole("button", { name: "Close details" }).focus();
    const seen = new Set<number>();
    for (let n = 0; n < 40 && seen.size < (await controls.count()); n++) {
      await page.keyboard.press("Tab");
      const i = await controls.evaluateAll((els) => els.indexOf(document.activeElement as HTMLElement));
      if (i < 0) continue;
      seen.add(i);
      expect(await ring(controls.nth(i)), `focus outline on control ${i}`).not.toMatch(/^none|^\S+ 0px/);
    }
    expect(seen.size, "every control is reachable with Tab").toBe(await controls.count());

    const axe = await new AxeBuilder({ page }).include("dialog").withTags(WCAG).analyze();
    const violations = axe.violations.flatMap((v) =>
      v.nodes
        // Verified false positive: axe takes style 10's blurred blob as the background of the app's
        // "Slide Visual" toggle under the stage; the stage clips it (elementsFromPoint + screenshot confirm).
        .filter((n) => !(id === 10 && v.id === "color-contrast" && n.html.includes("min-h-8")))
        .map((n) => `${v.id}: ${n.html.slice(0, 100)}`),
    );
    expect(violations).toEqual([]);
  });
}

const SLIDERS: [number, string][] = [
  [4, "Volume"],
  [10, "Playback position"],
  [31, "Scrub"],
  [46, "Output attenuation"],
  [15, "Track position"],
];
for (const [id, name] of SLIDERS) {
  test(`style ${id}: ${name} slider works from its enlarged area, then by keyboard`, async ({ page }) => {
    await page.goto("/");
    const stage = await openLive(page, id);
    await settle(stage);
    const slider = stage.getByRole("slider", { name });
    // The visible track is the input's padding box; the transparent border around it is the added hit area.
    const added = await slider.evaluate((el) => {
      const scale = el.getBoundingClientRect().height / (el as HTMLElement).offsetHeight;
      return parseFloat(getComputedStyle(el).borderTopWidth) * scale;
    });
    expect(added, "hit area extends above the visible track").toBeGreaterThan(2);

    const box = (await slider.boundingBox())!;
    const start = await slider.inputValue();
    await page.mouse.click(box.x + box.width * 0.9, box.y + added / 2); // above the track, inside the hit area
    await expect(slider).not.toHaveValue(start);
    await expect(slider).toBeFocused();

    const v = Number(await slider.inputValue());
    await page.keyboard.press("ArrowLeft");
    await expect(slider).toHaveValue(String(v - 1));
  });
}

test("style 46: Power switch works from its enlarged area, then by keyboard", async ({ page }) => {
  await page.goto("/");
  const stage = await openLive(page, 46);
  await settle(stage);
  const power = stage.getByRole("switch", { name: "Power" });
  await expect(power).toHaveAttribute("aria-checked", "true");
  // Click 5px outside the visible switch, on whichever side the hit area grew more.
  const [top, bottom] = await power.evaluate((el) => ["--ht", "--hb"].map((v) => parseFloat(el.style.getPropertyValue(v))));
  const box = (await power.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, top > bottom ? box.y - 5 : box.y + box.height + 5);
  await expect(power).toHaveAttribute("aria-checked", "false");
  await power.focus();
  await page.keyboard.press("Space");
  await expect(power).toHaveAttribute("aria-checked", "true");
});

test("375px detail view: preview fully on screen, no sideways scrolling", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile-375", "mobile viewport only");
  test.slow(); // opens all 29 previews in turn: ~14s alone, past the 30s default under full parallel load
  for (const id of LIVE_IDS) {
    await page.goto("/");
    const stage = await openLive(page, id);
    const box = (await stage.boundingBox())!;
    expect(box.x, `style ${id}`).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width, `style ${id}`).toBeLessThanOrEqual(375);
    const dialogOverflow = await page.locator("dialog").evaluate((d) => {
      const scroller = d.querySelector<HTMLElement>(".overflow-y-auto") ?? d;
      return Math.max(document.documentElement.scrollWidth - innerWidth, scroller.scrollWidth - scroller.clientWidth);
    });
    expect(dialogOverflow, `style ${id}: horizontal overflow`).toBeLessThanOrEqual(0);
  }
});

test("gallery passes axe WCAG 2.2 AA", async ({ page }) => {
  test.slow(); // a full-page scan of 50 cards took 34s under parallel load (30s default timeout)
  await page.goto("/");
  const axe = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(axe.violations.map((v) => `${v.id} (${v.nodes.length})`)).toEqual([]);
});
