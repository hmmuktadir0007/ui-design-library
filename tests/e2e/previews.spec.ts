import type { Locator } from "@playwright/test";
import { card, expect, look, openLive, test } from "./fixtures";

const LIVE_IDS = [1, 4, 5, 6, 10, 18, 31, 34, 45, 46];

interface Case {
  id: number;
  identity: string; // text unique to this preview, proves the right component loaded
  mouse: (p: Locator) => Promise<void>;
  keyboard: (p: Locator) => Promise<void>;
}

/** Each case: pointer interaction with visible state change, then a keyboard-only interaction (starting from the pointer step's state). */
const CASES: Case[] = [
  {
    id: 1,
    identity: "THE RETRO BEAT",
    mouse: async (p) => {
      const play = p.getByRole("button", { name: "Play" });
      const before = await look(play);
      await play.click();
      await expect(p.getByRole("button", { name: "Pause" })).toHaveAttribute("aria-pressed", "true");
      await expect(p.getByText(/^PLAYING:/)).toBeVisible();
      expect(await look(p.getByRole("button", { name: "Pause" }))).not.toBe(before);
    },
    keyboard: async (p) => {
      const vol = p.getByRole("slider", { name: "Volume" });
      await vol.focus();
      await vol.press("ArrowUp");
      await expect(vol).toHaveAttribute("aria-valuenow", "7");
      await expect(p.getByText("VOL 7")).toBeVisible();
    },
  },
  {
    id: 4,
    identity: "Smart Home Thermostat",
    mouse: async (p) => {
      await p.getByRole("button", { name: "Increase temperature" }).click();
      await expect(p.getByLabel("Target 73 degrees Fahrenheit")).toBeVisible();
      const eco = p.getByRole("radio", { name: "ECO" });
      const before = await look(eco);
      await eco.click();
      await expect(eco).toHaveAttribute("aria-checked", "true");
      await expect.poll(() => look(eco)).not.toBe(before);
    },
    keyboard: async (p) => {
      await p.getByRole("button", { name: "Decrease temperature" }).focus();
      await p.page().keyboard.press("Enter");
      await p.page().keyboard.press("Enter");
      await expect(p.getByLabel("Target 71 degrees Fahrenheit")).toBeVisible();
    },
  },
  {
    id: 5,
    identity: "ALEX JOHNSON",
    mouse: async (p) => {
      const tue = p.getByRole("radio").nth(1);
      const before = await look(tue);
      await tue.click();
      await expect(tue).toHaveAttribute("aria-checked", "true");
      await expect(p.getByText("Tue · Showers", { exact: false })).toBeVisible();
      await expect.poll(() => look(tue)).not.toBe(before);
      await p.getByRole("button", { name: /4892/ }).click();
      await expect(p.getByRole("button", { name: /Tap to flip/ })).toHaveAttribute("aria-pressed", "true");
    },
    keyboard: async (p) => {
      const sw = p.getByRole("switch", { name: "Weather alerts" });
      await sw.focus();
      await p.page().keyboard.press("Space");
      await expect(sw).toHaveAttribute("aria-checked", "false");
    },
  },
  {
    id: 6,
    identity: "Welcome back!",
    mouse: async (p) => {
      const med = p.getByRole("button", { name: "Meditate" });
      const before = await look(med);
      await med.click();
      await expect(med).toHaveAttribute("aria-pressed", "true");
      await expect(p.getByText("2/3 · 67%")).toBeVisible();
      await expect.poll(() => look(med)).not.toBe(before);
    },
    keyboard: async (p) => {
      await p.getByRole("button", { name: "Evening walk" }).focus();
      await p.page().keyboard.press("Enter");
      await expect(p.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
      await expect(p.getByText("3/3 · 100%")).toBeVisible();
    },
  },
  {
    id: 10,
    identity: "Refractive Glass Deck",
    mouse: async (p) => {
      const c = p.getByRole("button", { name: "Caustics" });
      const before = await look(c);
      await c.click();
      await expect(c).toHaveAttribute("aria-pressed", "true");
      await expect(p.getByText(/64% depth · Caustics/)).toBeVisible();
      await expect.poll(() => look(c)).not.toBe(before);
    },
    keyboard: async (p) => {
      const scrub = p.getByRole("slider", { name: "Playback position" });
      await scrub.focus();
      await p.page().keyboard.press("ArrowRight");
      await expect(scrub).toHaveValue("166");
      await expect(p.getByText("02:46 // REFRACT")).toBeVisible();
    },
  },
  {
    id: 18,
    identity: "DEPTH: Z -40PX",
    mouse: async (p) => {
      await p.getByRole("button", { name: /Explore 3D/ }).click();
      await expect(p.getByText("ROTATION: -30° Y")).toBeVisible();
    },
    keyboard: async (p) => {
      const ry = p.getByRole("slider", { name: "Rotate Y" });
      await ry.focus();
      await p.page().keyboard.press("ArrowRight");
      await expect(p.getByText("ROTATION: -29° Y")).toBeVisible();
    },
  },
  {
    id: 31,
    identity: "Passthrough Mode: 75%",
    mouse: async (p) => {
      const lib = p.getByRole("button", { name: "Library" });
      const before = await look(lib);
      await lib.click();
      await expect(lib).toHaveAttribute("aria-pressed", "true");
      await expect(p.getByRole("heading", { name: "Glacier Drift" })).toBeVisible();
      await expect.poll(() => look(lib)).not.toBe(before);
    },
    keyboard: async (p) => {
      const ex = p.getByRole("button", { name: /Expand to room/ });
      await ex.focus();
      await p.page().keyboard.press("Enter");
      await expect(p.getByRole("button", { name: /Return to window/ })).toHaveAttribute("aria-pressed", "true");
    },
  },
  {
    id: 34,
    identity: "L2: SERVICES",
    mouse: async (p) => {
      const l1 = p.getByRole("radio", { name: "L1: STORAGE" });
      const before = await look(l1);
      await l1.click();
      await expect(l1).toHaveAttribute("aria-checked", "true");
      await expect(p.getByText(/SELECTED \/\/ STORAGE/)).toBeVisible();
      await expect.poll(() => look(l1)).not.toBe(before);
    },
    keyboard: async (p) => {
      const ex = p.getByRole("button", { name: "Explode" });
      await ex.focus();
      await p.page().keyboard.press("Enter");
      await expect(p.getByRole("button", { name: "Collapse" })).toHaveAttribute("aria-pressed", "true");
    },
  },
  {
    id: 45,
    identity: "OBSIDIAN VAULT // PRO",
    mouse: async (p) => {
      const y = p.getByRole("radio", { name: "1Y" });
      const before = await look(y);
      await y.click();
      await expect(y).toHaveAttribute("aria-checked", "true");
      await expect(p.getByText("● +24.8%")).toBeVisible();
      await expect.poll(() => look(y)).not.toBe(before);
    },
    keyboard: async (p) => {
      await p.getByRole("button", { name: "Hide" }).focus();
      await p.page().keyboard.press("Enter");
      await expect(p.getByText("$•••,•••")).toBeVisible();
    },
  },
  {
    id: 46,
    identity: "OP-FIELD // SYNTHESIZER TE-01",
    mouse: async (p) => {
      const hold = p.getByRole("button", { name: "HOLD" });
      const before = await look(hold);
      await hold.click();
      await expect(hold).toHaveAttribute("aria-pressed", "true");
      await expect.poll(() => look(hold)).not.toBe(before);
      await p.getByRole("button", { name: /WAVE: SAW/ }).click();
      await expect(p.getByText("WAVE: SINE")).toBeVisible();
    },
    keyboard: async (p) => {
      const f = p.getByRole("slider", { name: "Frequency" });
      await f.focus();
      await p.page().keyboard.press("ArrowUp");
      await expect(f).toHaveAttribute("aria-valuenow", "45");
      await expect(p.getByText("447.50 Hz")).toBeVisible();
    },
  },
];

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

for (const c of CASES) {
  test(`style ${c.id}: live preview loads and responds to pointer + keyboard`, async ({ page }) => {
    const stage = await openLive(page, c.id);
    await expect(stage.getByText(c.identity, { exact: false }).first()).toBeVisible();
    await c.mouse(stage);
    await c.keyboard(stage);
  });
}

test("rotary knob responds to vertical drag", async ({ page }) => {
  const stage = await openLive(page, 46);
  const knob = stage.getByRole("slider", { name: "Resonance" });
  const box = (await knob.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 40, { steps: 4 });
  await page.mouse.up();
  await expect.poll(async () => Number(await knob.getAttribute("aria-valuenow"))).toBeLessThan(82);
});

test("registered styles get a working Slide Visual / Live CSS toggle in cards and detail", async ({ page }) => {
  await expect(page.getByRole("group", { name: /preview mode$/ })).toHaveCount(LIVE_IDS.length);
  for (const id of LIVE_IDS) {
    const c = card(page, id);
    await c.getByRole("button", { name: "Live CSS" }).click();
    await expect(c.locator(`[data-preview-id="${id}"]`)).toBeVisible();
    await expect(c.locator("img")).toHaveCount(0);
    await c.getByRole("button", { name: "Slide Visual" }).click();
    await expect(c.locator("img")).toHaveAttribute("src", `/images/style-${String(id).padStart(2, "0")}.png`);
  }
  // detail defaults to Live CSS and switches without reload
  const stage = await openLive(page, 1);
  const dialog = page.locator("dialog");
  await dialog.getByRole("button", { name: "Slide Visual" }).click();
  await expect(stage).toHaveCount(0);
  await expect(dialog.locator("img")).toHaveAttribute("src", "/images/style-01.png");
  await dialog.getByRole("button", { name: "Live CSS" }).click();
  await expect(dialog.locator('[data-preview-id="1"]')).toBeVisible();
});

test("the other 40 styles stay image-only", async ({ page }) => {
  for (let id = 1; id <= 50; id++) {
    if (LIVE_IDS.includes(id)) continue;
    const c = card(page, id);
    await expect(c.getByRole("button", { name: "Live CSS" })).toHaveCount(0);
    await expect(c.locator("img")).toHaveAttribute("src", `/images/style-${String(id).padStart(2, "0")}.png`);
  }
  await card(page, 2).getByRole("button", { name: "View details" }).click();
  const dialog = page.locator("dialog");
  await expect(dialog.getByText("Live interactive CSS preview: planned")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Live CSS" })).toHaveCount(0);
});

test("preview CSS does not leak into the gallery", async ({ page }) => {
  const probe = () =>
    page.evaluate(() => {
      const pick = (sel: string) => {
        const el = document.querySelector(sel)!;
        const c = getComputedStyle(el);
        return [c.fontFamily, c.fontSize, c.color, c.backgroundColor, c.borderRadius, c.boxShadow, c.padding].join("|");
      };
      // Card 2 is image-only, so its controls never change state when the live cards toggle.
      return ["body", "header", "input[type=search]", "article", "article h2", "nav button", "article:nth-of-type(2) button", "article:nth-of-type(2) h2"].map(pick);
    });
  const before = await probe();
  for (const id of LIVE_IDS) await card(page, id).getByRole("button", { name: "Live CSS" }).click();
  await expect(page.locator("article [data-preview-id]")).toHaveCount(LIVE_IDS.length);
  await page.waitForTimeout(400); // let lazy chunks + their CSS attach
  expect(await probe()).toEqual(before);
});

test("card previews are display-only", async ({ page }) => {
  const c = card(page, 4);
  await c.getByRole("button", { name: "Live CSS" }).click();
  await expect(c.getByText("Display only")).toBeVisible();
  await expect(c.getByText("Smart Home Thermostat")).toBeVisible(); // lazy preview chunk loaded (slow under parallel load)
  await expect(c.locator("[inert]")).toHaveCount(1);
  await expect(c.getByRole("button", { name: "Increase temperature" })).toHaveCount(0); // inert hides it from the a11y tree
});
