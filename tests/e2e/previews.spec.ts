import type { Locator } from "@playwright/test";
import { card, expect, LIVE_IDS, look, openLive, test } from "./fixtures";

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
  // ── Batch 2: Bold, Retro & Expressive ──
  {
    id: 7,
    identity: "DA$H_BOARD",
    mouse: async (p) => {
      const users = p.getByRole("radio", { name: /Active users/ });
      const before = await look(users);
      await users.click();
      await expect(users).toHaveAttribute("aria-checked", "true");
      await expect(p.getByRole("img", { name: /Active users chart/ })).toBeVisible();
      await expect.poll(() => look(users)).not.toBe(before);
    },
    keyboard: async (p) => {
      await p.getByRole("button", { name: "Log out" }).focus();
      await p.page().keyboard.press("Enter");
      await expect(p.getByRole("button", { name: "Log in" })).toBeVisible();
      await expect(p.getByText("GUEST")).toBeVisible();
    },
  },
  {
    id: 12,
    identity: "SONIC REVOLT",
    mouse: async (p) => {
      const vip = p.getByRole("radio", { name: /VIP wristband/ });
      const before = await look(vip);
      await vip.click();
      await expect(vip).toHaveAttribute("aria-checked", "true");
      await expect(p.getByText("VIBRANCY: 98%")).toBeVisible();
      await expect.poll(() => look(vip)).not.toBe(before);
    },
    keyboard: async (p) => {
      await p.getByRole("button", { name: /Get passes/ }).focus();
      await p.page().keyboard.press("Enter");
      await expect(p.getByText("1 × VIP WRISTBAND IN CART")).toBeVisible();
      await p.getByRole("button", { name: /STAGE_A/ }).focus();
      await p.page().keyboard.press("Enter");
      await expect(p.getByRole("button", { name: /STAGE_B \/\/ 128 BPM/ })).toBeVisible();
    },
  },
  {
    id: 15,
    identity: "CYBER_BEAT 2000",
    mouse: async (p) => {
      await p.getByRole("button", { name: "Next track" }).click();
      await expect(p.getByText("02. NEON_MALL.MP3")).toBeVisible();
      const play = p.getByRole("button", { name: /Play/ });
      const before = await look(play);
      await play.click();
      await expect(play).toHaveAttribute("aria-pressed", "true");
      await expect.poll(() => look(play)).not.toBe(before);
      await expect(p.getByRole("slider", { name: "Track position" })).not.toHaveValue("0", { timeout: 3000 }); // silent clock advances
      await p.getByRole("button", { name: "Pause" }).click();
      await expect(play).toHaveAttribute("aria-pressed", "false");
    },
    keyboard: async (p) => {
      const vol = p.getByRole("slider", { name: "Volume" });
      await vol.focus();
      await p.page().keyboard.press("ArrowDown");
      await expect(vol).toHaveValue("84");
      await expect(p.getByText("VOL: 84%")).toBeVisible();
    },
  },
  {
    id: 21,
    identity: "HERO_UNIT // KNIGHT",
    mouse: async (p) => {
      const def = p.getByRole("radio", { name: /DEF\+12/ });
      const before = await look(def);
      await def.click();
      await expect(def).toHaveAttribute("aria-checked", "true");
      await expect(p.getByText(/DEF 42/)).toBeVisible();
      await expect.poll(() => look(def)).not.toBe(before);
    },
    keyboard: async (p) => {
      await p.getByRole("button", { name: /START/ }).focus();
      await p.page().keyboard.press("Enter");
      await expect(p.getByText("RUN 1 COMPLETE")).toBeVisible();
      await expect(p.getByRole("meter", { name: "Mana" })).toHaveAttribute("aria-valuenow", "420");
    },
  },
  {
    id: 33,
    identity: "Welcome Aboard!",
    mouse: async (p) => {
      await p.getByRole("button", { name: "Get Started →" }).click();
      await expect(p.getByRole("heading", { name: "Invite your team" })).toBeVisible();
      await expect(p.getByText("Step 2 of 3")).toBeVisible();
      await expect(p.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "33");
    },
    keyboard: async (p) => {
      await p.getByRole("button", { name: "Back" }).focus();
      await p.page().keyboard.press("Enter");
      await expect(p.getByRole("heading", { name: "Welcome Aboard!" })).toBeVisible();
      await expect(p.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    },
  },
  {
    id: 36,
    identity: "ANTI_CORP",
    mouse: async (p) => {
      const rave = p.getByRole("button", { name: "Rave" });
      const before = await look(rave);
      await rave.click();
      await expect(rave).toHaveAttribute("aria-pressed", "true");
      await expect(p.getByText("AFTERBURN")).toBeVisible();
      await expect.poll(() => look(rave)).not.toBe(before);
    },
    keyboard: async (p) => {
      await p.getByRole("button", { name: /RGB OFFSET/ }).focus();
      await p.page().keyboard.press("Enter");
      await expect(p.getByText("RGB OFFSET // OFF")).toBeVisible();
    },
  },
  {
    id: 38,
    identity: "Microsoft Windows 95",
    mouse: async (p) => {
      const hw = p.getByRole("tab", { name: "Hardware" });
      await hw.click();
      await expect(hw).toHaveAttribute("aria-selected", "true");
      await expect(p.getByText("[OK] Sound Blaster 16 detected")).toBeVisible();
      await p.getByRole("button", { name: "Minimize" }).click();
      await expect(p.getByRole("tab", { name: "Hardware" })).toHaveCount(0);
      const task = p.getByRole("button", { name: "System.exe", exact: true });
      await expect(task).toHaveAttribute("aria-pressed", "false");
      await task.click();
      await expect(task).toHaveAttribute("aria-pressed", "true");
      await expect(p.getByRole("tab", { name: "Hardware" })).toBeVisible();
    },
    keyboard: async (p) => {
      const win = p.locator('section[aria-label="System.exe"]');
      await p.getByRole("button", { name: /Move window/ }).focus();
      await p.page().keyboard.press("ArrowRight");
      await p.page().keyboard.press("ArrowDown");
      await expect(win).toHaveAttribute("style", /translate\(10px, 10px\)/);
      await p.getByRole("button", { name: "Close" }).focus();
      await p.page().keyboard.press("Enter");
      await expect(win).toHaveCount(0);
    },
  },
  {
    id: 39,
    identity: "Daily Habit Mastery",
    mouse: async (p) => {
      const cta = p.getByRole("button", { name: /Continue quest/ });
      const before = await look(cta);
      await cta.hover();
      await p.page().mouse.down();
      await expect.poll(() => look(cta)).not.toBe(before); // chunky button sinks while pressed
      await p.page().mouse.up();
      await expect(p.getByRole("status")).toHaveText("LEVEL 15! +100 XP · streak 8");
      await expect(p.getByText("8 DAY STREAK!")).toBeVisible();
      await expect(p.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
    },
    keyboard: async (p) => {
      await p.getByRole("radio", { name: /2x Gems/ }).focus();
      await p.page().keyboard.press("Space");
      await p.getByRole("button", { name: /Continue quest/ }).focus();
      await p.page().keyboard.press("Enter");
      await expect(p.getByText("100 / 500 XP")).toBeVisible();
      await p.getByRole("button", { name: "Reset" }).focus();
      await p.page().keyboard.press("Enter");
      await expect(p.getByText("450 / 500 XP")).toBeVisible();
      await expect(p.getByText("7 DAY STREAK!")).toBeVisible();
    },
  },
  {
    id: 42,
    identity: "SPECIAL COMIC DROP",
    mouse: async (p) => {
      const col = p.getByRole("radio", { name: /Collector/ });
      const before = await look(col);
      await col.click();
      await expect(col).toHaveAttribute("aria-checked", "true");
      await expect.poll(() => look(col)).not.toBe(before);
      await p.getByRole("button", { name: "BOOM!" }).click();
      await expect(p.getByRole("button", { name: "POW!" })).toBeVisible();
    },
    keyboard: async (p) => {
      await p.getByRole("button", { name: /BUY NOW/ }).focus();
      await p.page().keyboard.press("Enter");
      await expect(p.getByText("★ 1 × COLLECTOR IN CART ★")).toBeVisible();
    },
  },
  {
    id: 49,
    identity: "Mochi the Bunny",
    mouse: async (p) => {
      await p.getByRole("button", { name: /Log Habit/ }).click();
      await expect(p.getByRole("progressbar", { name: "Hydration" })).toHaveAttribute("aria-valuenow", "90");
      const cta = p.getByRole("button", { name: /Adopt Pet/ });
      await cta.click();
      await expect(p.getByRole("button", { name: /Routine running/ })).toHaveAttribute("aria-pressed", "true");
    },
    keyboard: async (p) => {
      await p.getByRole("button", { name: "Pet Mochi" }).focus();
      await p.page().keyboard.press("Enter");
      await expect(p.getByRole("progressbar", { name: "Happiness" })).toHaveAttribute("aria-valuenow", "90");
      await p.getByRole("button", { name: /Feed Snack/ }).focus();
      await p.page().keyboard.press("Enter");
      await p.getByRole("button", { name: /Log Habit/ }).focus();
      await p.page().keyboard.press("Enter");
      // both bars full -> level up, bars restart at half
      await expect(p.getByText("LVL 05")).toBeVisible();
      await expect(p.getByRole("progressbar", { name: "Happiness" })).toHaveAttribute("aria-valuenow", "50");
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

test("style 38: window drags with the pointer and stays on the desktop", async ({ page }) => {
  const stage = await openLive(page, 38);
  const win = stage.locator('section[aria-label="System.exe"]');
  const handle = stage.getByRole("button", { name: /Move window/ });
  const before = (await win.boundingBox())!;
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + 20, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x - 400, box.y + box.height / 2 + 30, { steps: 5 });
  await page.mouse.up();
  const after = (await win.boundingBox())!;
  expect(after.x).toBeLessThan(before.x);
  expect(after.y).toBeGreaterThan(before.y);
  expect(after.x).toBeGreaterThanOrEqual((await stage.boundingBox())!.x); // clamped to the desktop
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

test("the other 30 styles stay image-only", async ({ page }) => {
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
  // inert: the preview's controls cannot take focus (checked on the DOM, not via the role heuristics)
  const focusable = await c
    .locator('button[aria-label="Increase temperature"]')
    .evaluate((el: HTMLElement) => (el.focus(), document.activeElement === el));
  expect(focusable).toBe(false);
});
