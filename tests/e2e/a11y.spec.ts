import AxeBuilder from "@axe-core/playwright";
import type { Locator } from "@playwright/test";
import { expect, LIVE_IDS, openLive, test } from "./fixtures";
const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const CONTROLS = 'button, input, [role="slider"], [role="radio"], [role="switch"]';
const TABBABLE = [
  'button:not([tabindex="-1"]):not([disabled])',
  'input:not([tabindex="-1"]):not([disabled])',
  '[role="slider"]:not([tabindex="-1"])',
  '[role="radio"]:not([tabindex="-1"]):not([disabled])',
  '[role="switch"]:not([tabindex="-1"]):not([disabled])',
].join(", ");

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

    // Tab through the preview: every tabbable control is reachable and shows an outline while focused.
    // Roving-tabindex groups (radiogroups, heatmap grid) expose a single Tab stop and arrow keys inside.
    const controls = stage.locator(TABBABLE);
    const ring = (l: Locator) =>
      l.evaluate((el) => {
        const c = getComputedStyle(el);
        return [c.outlineStyle, c.outlineWidth, c.outlineColor].join(" ");
      });
    await page.getByRole("button", { name: "Close details" }).focus();
    const seen = new Set<number>();
    const tabbableCount = await controls.count();
    for (let n = 0; n < 40 && seen.size < tabbableCount; n++) {
      await page.keyboard.press("Tab");
      const i = await controls.evaluateAll((els) => els.indexOf(document.activeElement as HTMLElement));
      if (i < 0) continue;
      seen.add(i);
      expect(await ring(controls.nth(i)), `focus outline on control ${i}`).not.toMatch(/^none|^\S+ 0px/);
    }
    expect(seen.size, "every tabbable control is reachable with Tab").toBe(tabbableCount);

    // Every radiogroup uses roving tabindex: exactly one checked radio at tabindex=0.
    const groups = stage.locator('[role="radiogroup"]');
    for (let g = 0; g < (await groups.count()); g++) {
      const grp = groups.nth(g);
      await expect(grp.locator('[role="radio"][aria-checked="true"]')).toHaveCount(1);
      await expect(grp.locator('[role="radio"][tabindex="0"]')).toHaveCount(1);
      await expect(grp.locator('[role="radio"][aria-checked="true"]')).toHaveAttribute("tabindex", "0");
    }

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
  [43, "Weight"],
  [43, "Width"],
  [9, "Glow"],
  [22, "Seek"],
  [22, "Volume"],
  [28, "Intensity"],
  [44, "Light angle"],
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
  test.slow(); // opens all 50 previews in turn: ~14s alone, past the 30s default under full parallel load
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

test("style 35: touch swipe over card scrolls dialog at 375px; keyboard tilt/flip and mouse hover work", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile-375", "mobile touch scroll check");
  await page.goto("/");
  const stage = await openLive(page, 35);
  await settle(stage);

  const scene = stage.locator('[class*="scene"]').first();
  expect(await scene.evaluate((el) => getComputedStyle(el).touchAction)).toBe("pan-y");

  const scroller = page.locator("dialog .overflow-y-auto");
  const beforeScroll = await scroller.evaluate((el) => el.scrollTop);
  const box = (await scene.boundingBox())!;
  const x = Math.round(box.x + box.width / 2);
  const startY = Math.round(box.y + box.height * 0.7);

  // Real vertical touch swipe starting on the holographic card scrolls the dialog instead of trapping scroll.
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: startY }] });
  for (let step = 1; step <= 6; step++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: startY - step * 35 }] });
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();

  await expect.poll(() => scroller.evaluate((el) => el.scrollTop)).toBeGreaterThan(beforeScroll);
  await expect(stage.getByText("TILT X 0° · Y 0° // SHEEN 135°")).toBeVisible();

  // Scroll back to top and verify keyboard tilt/flip and mouse hover still work.
  await scroller.evaluate((el) => el.scrollTo(0, 0));
  await stage.getByRole("button", { name: "Tilt right" }).focus();
  await page.keyboard.press("Enter");
  await expect(stage.getByText("TILT X 0° · Y 6° // SHEEN 153°")).toBeVisible();
  await stage.getByRole("button", { name: "Flip" }).focus();
  await page.keyboard.press("Space");
  await expect(stage.getByRole("button", { name: "Flip" })).toHaveAttribute("aria-pressed", "true");
  await stage.getByRole("button", { name: "Reset" }).click();
  await expect(stage.getByText("TILT X 0° · Y 0° // SHEEN 135°")).toBeVisible();

  const cardBox = (await scene.boundingBox())!;
  await page.mouse.move(cardBox.x + cardBox.width * 0.85, cardBox.y + cardBox.height * 0.25);
  await expect(stage.getByText("TILT X 0° · Y 0° // SHEEN 135°")).toHaveCount(0);
});

test("style 47: heatmap grid is one Tab stop with Arrow/Home/End navigation and Enter/Space selection", async ({ page }) => {
  await page.goto("/");
  const stage = await openLive(page, 47);
  await settle(stage);

  // Only one heatmap cell is tabbable at a time.
  const gridCells = stage.locator('section[aria-label="Activity heatmap"] button');
  await expect(gridCells).toHaveCount(28);
  await expect(stage.locator('section[aria-label="Activity heatmap"] button[tabindex="0"]')).toHaveCount(1);

  // Tab from Dataset radio enters the heatmap grid on the active cell (day 18), next Tab exits to the funnel.
  await stage.getByRole("radio", { name: "Last 28d" }).focus();
  await page.keyboard.press("Tab");
  await expect(stage.getByRole("button", { name: /day 18:/ })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(stage.getByRole("button", { name: /1\. Visitors/ })).toBeFocused();

  // Shift+Tab returns to the grid, then Arrow / Home / End move focus predictably.
  await page.keyboard.press("Shift+Tab");
  await expect(stage.getByRole("button", { name: /day 18:/ })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(stage.getByRole("button", { name: /day 19:/ })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(stage.getByRole("button", { name: /day 26:/ })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(stage.getByRole("button", { name: /day 25:/ })).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(stage.getByRole("button", { name: /day 18:/ })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(stage.getByRole("button", { name: /day 15:/ })).toBeFocused();
  await page.keyboard.press("End");
  await expect(stage.getByRole("button", { name: /day 21:/ })).toBeFocused();

  // Enter/Space selects the focused cell and updates the detail readout.
  await page.keyboard.press("Enter");
  await expect(stage.getByRole("button", { name: /day 21:/ })).toHaveAttribute("aria-pressed", "true");
  await expect(stage.getByText("DAY 21 // SUN W3")).toBeVisible();
});

test("radiogroup previews support roving tabindex and arrow-key navigation with wrap", async ({ page }) => {
  await page.goto("/");
  for (const [id, groupName, first, second, last] of [
    [4, "Mode", "AUTO", "ECO", "ECO"],
    [29, "Date range", "24H", "7D", "1H"],
    [35, "Pass", "VIP", "Creator", "Creator"],
    [44, "Planes", "36", "54", "24"],
    [48, "Category", "All (7)", "Lookbooks (2)", "Saved (0)"],
  ] as const) {
    const stage = await openLive(page, id);
    await settle(stage);
    const group = stage.getByRole("radiogroup", { name: groupName });
    const start = group.getByRole("radio", { name: first });
    await expect(start).toHaveAttribute("aria-checked", "true");
    await expect(start).toHaveAttribute("tabindex", "0");

    await start.focus();
    await page.keyboard.press("ArrowRight");
    const next = group.getByRole("radio", { name: second });
    await expect(next).toBeFocused();
    await expect(next).toHaveAttribute("aria-checked", "true");
    await expect(next).toHaveAttribute("tabindex", "0");
    await expect(start).toHaveAttribute("tabindex", "-1");

    // ArrowLeft returns to first, and another ArrowLeft wraps to last.
    await page.keyboard.press("ArrowLeft");
    await expect(start).toBeFocused();
    await expect(start).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("ArrowLeft");
    const wrapped = group.getByRole("radio", { name: last });
    await expect(wrapped).toBeFocused();
    await expect(wrapped).toHaveAttribute("aria-checked", "true");

    await page.keyboard.press("Escape");
    await expect(page.locator("dialog")).not.toBeVisible();
  }
});

test("StyleDetail dialog traps focus and restores focus to trigger on Escape", async ({ page }) => {
  await page.goto("/");
  const trigger = page.locator('article[aria-labelledby="style-4-name"]').getByRole("button", { name: "View details" });
  await trigger.focus();
  await page.keyboard.press("Enter");

  const dialog = page.locator("dialog");
  await expect(dialog).toBeVisible();
  await expect.poll(() => dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);

  // Tabbing forward and backward never escapes the open modal dialog.
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Shift+Tab");
  expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);

  // Escape closes the dialog and restores focus to the triggering button.
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
