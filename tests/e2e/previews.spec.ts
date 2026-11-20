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
  // ── Batch 3: Modern SaaS & Dashboards ──
  {
    id: 3,
    identity: "My Tasks",
    mouse: async (p) => {
      await p.getByRole("button", { name: "Add task" }).click();
      await expect(p.getByRole("checkbox", { name: /Draft release notes/ })).toBeVisible();
      await expect(p.getByRole("progressbar", { name: "Tasks completed" })).toHaveAttribute("aria-valuenow", "20");
      const ship = p.getByRole("checkbox", { name: /Ship onboarding flow/ });
      const before = await look(ship.locator("span").first());
      await ship.click();
      await expect(ship).toHaveAttribute("aria-checked", "true");
      await expect.poll(() => look(ship.locator("span").first())).not.toBe(before);
      await expect(p.getByRole("progressbar", { name: "Tasks completed" })).toHaveAttribute("aria-valuenow", "40");
    },
    keyboard: async (p) => {
      await p.getByRole("radio", { name: /Done/ }).focus();
      await p.page().keyboard.press("Space");
      await expect(p.getByRole("checkbox", { name: /Call with design team/ })).toHaveCount(0);
      await p.getByRole("checkbox", { name: /Review sprint backlog/ }).focus();
      await p.page().keyboard.press("Space");
      await expect(p.getByRole("checkbox", { name: /Review sprint backlog/ })).toHaveCount(0); // no longer done
      await expect(p.getByRole("progressbar", { name: "Tasks completed" })).toHaveAttribute("aria-valuenow", "20");
    },
  },
  {
    id: 8,
    identity: "Analytics Overview",
    mouse: async (p) => {
      const revenue = p.getByRole("button", { name: /^Revenue/ });
      const before = await look(revenue);
      await revenue.click();
      await expect(revenue).toHaveAttribute("aria-pressed", "true");
      await expect(p.getByRole("img", { name: "Revenue, last 30D: $148.5K" })).toBeVisible();
      await expect.poll(() => look(revenue)).not.toBe(before);
    },
    keyboard: async (p) => {
      await p.getByRole("radio", { name: "7D" }).focus();
      await p.page().keyboard.press("Space");
      await expect(p.getByRole("img", { name: "Revenue, last 7D: $36.2K" })).toBeVisible();
      await p.getByRole("button", { name: /Export/ }).focus();
      await p.page().keyboard.press("Enter");
      await expect(p.getByText("Exported revenue_7d.csv")).toBeVisible();
    },
  },
  {
    id: 14,
    identity: "ACTIONS & WORKFLOWS",
    mouse: async (p) => {
      await p.getByRole("option", { name: /Rotate Environment Secrets/ }).click();
      await expect(p.getByRole("status")).toHaveText("Secrets rotated");
      await expect(p.getByText("VAULT // LAST UPDATED JUST NOW")).toBeVisible();
      await p.getByRole("button", { name: "Pause" }).click();
      await expect(p.getByText("PAUSED (0 RPS)")).toBeVisible();
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      await p.getByRole("button", { name: "Resume" }).focus();
      await kb.press("Control+k"); // shortcut scoped to the preview
      const box = p.getByRole("combobox", { name: "Search commands" });
      await expect(box).toBeFocused();
      await kb.press("ArrowDown"); // from Rotate, the row last clicked
      await expect(p.getByRole("option", { name: /Stream Telemetry/ })).toHaveAttribute("aria-selected", "true");
      await kb.press("Enter");
      await expect(p.getByRole("status")).toHaveText("Trace stream started");
      await kb.type("roll");
      await expect(p.getByRole("option")).toHaveCount(1);
      await kb.press("Enter");
      await expect(p.getByRole("status")).toHaveText("Rolled back to v1.4.1");
      await kb.press("Escape"); // clears the query, keeps the detail dialog open
      await expect(box).toHaveValue("");
      await expect(p.getByRole("option")).toHaveCount(3);
    },
  },
  {
    id: 29,
    identity: "METRIC TELEMETRY ENGINE",
    mouse: async (p) => {
      const conv = p.getByRole("radio", { name: /^CONVERSION/ });
      const before = await look(conv);
      await conv.click();
      await expect(conv).toHaveAttribute("aria-checked", "true");
      await expect(p.getByRole("img", { name: /^CONVERSION trend over 24H/ })).toBeVisible();
      await expect.poll(() => look(conv)).not.toBe(before);
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      await p.getByRole("radio", { name: "7D" }).focus();
      await kb.press("Space");
      await expect(p.getByRole("img", { name: /^CONVERSION trend over 7D, now \+11\.6%/ })).toBeVisible();
      const reqs = p.getByRole("columnheader", { name: /REQ\/S/ });
      await reqs.getByRole("button").focus();
      await kb.press("Enter");
      await expect(reqs).toHaveAttribute("aria-sort", "descending");
      await expect(p.getByRole("row").nth(1)).toContainText("edge.proxy.stream.pipe");
      await kb.press("Enter");
      await expect(reqs).toHaveAttribute("aria-sort", "ascending");
      await expect(p.getByRole("row").nth(1)).toContainText("db.replica.wal.sync");
    },
  },
  {
    id: 30,
    identity: "SUGGESTED COMMANDS",
    mouse: async (p) => {
      await p.getByRole("option", { name: /Toggle Dark Mode/ }).click();
      await expect(p.getByRole("status")).toContainText("Theme set to light");
      await expect(p.getByRole("combobox")).toHaveCount(0);
      await p.getByRole("button", { name: /Open command palette/ }).click();
      await expect(p.getByRole("combobox", { name: "Type a command or search" })).toBeFocused();
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      await kb.press("ArrowDown");
      await kb.press("ArrowDown");
      await expect(p.getByRole("option", { name: /Switch Workspace/ })).toHaveAttribute("aria-selected", "true");
      await kb.press("Enter");
      await expect(p.getByRole("status")).toContainText("Switched to Globex workspace");
      const trigger = p.getByRole("button", { name: /Open command palette/ });
      await expect(trigger).toBeFocused(); // focus returns to the opener
      await kb.press("Control+k");
      await kb.type("settings");
      await kb.press("Enter");
      await expect(p.getByRole("status")).toContainText("Settings opened");
      await kb.press("Control+k");
      await expect(p.getByRole("combobox")).toBeFocused();
      await kb.press("Escape"); // closes the palette only
      await expect(p.getByRole("combobox")).toHaveCount(0);
      await expect(trigger).toBeFocused();
      await expect(p.page().locator("dialog")).toBeVisible();
    },
  },
  {
    id: 32,
    identity: "SaaSMetrics OS",
    mouse: async (p) => {
      const monthly = p.getByRole("radio", { name: "Monthly" });
      const before = await look(monthly);
      await monthly.click();
      await expect(monthly).toHaveAttribute("aria-checked", "true");
      await expect(p.getByText("Total per month")).toBeVisible();
      await expect(p.getByText("$177", { exact: true })).toHaveCount(2); // 3 seats x $59: subtotal and total
      await expect.poll(() => look(monthly)).not.toBe(before);
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      await p.getByRole("button", { name: "Add seat" }).focus();
      await kb.press("Enter");
      await expect(p.getByText("$236", { exact: true })).toHaveCount(2);
      await p.getByRole("button", { name: /Upgrade Plan/ }).focus();
      await kb.press("Enter");
      await expect(p.getByText("You're on Pro")).toBeVisible();
      await expect(p.getByText("Demo only — no payment was taken.")).toBeVisible();
      await p.getByRole("button", { name: "Change plan" }).focus();
      await kb.press("Enter");
      await expect(p.getByRole("button", { name: /Upgrade Plan/ })).toBeVisible();
    },
  },
  {
    id: 37,
    identity: "BASH 5.2",
    mouse: async (p) => {
      const input = p.getByRole("textbox", { name: "Terminal command" });
      await p.getByText("operator@mainframe:~$").last().click(); // the prompt is the input's label
      await expect(input).toBeFocused();
      await p.page().keyboard.type("help");
      await p.page().keyboard.press("Enter");
      await expect(p.getByText(/available: help · about/)).toBeVisible();
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      const input = p.getByRole("textbox", { name: "Terminal command" });
      await input.focus();
      await kb.type("theme amber");
      await kb.press("Enter");
      await expect(p.getByText("[OK] CRT EMISSION 590NM ACTIVE // PROMPT STANDBY")).toBeVisible();
      await expect(p.getByText(/BASH 5\.2 • AMBER/)).toBeVisible();
      await kb.press("ArrowUp");
      await expect(input).toHaveValue("theme amber");
      await kb.press("ArrowUp");
      await expect(input).toHaveValue("help");
      await kb.press("ArrowDown");
      await expect(input).toHaveValue("theme amber");
      await input.fill("rm -rf /");
      await kb.press("Enter");
      await expect(p.getByText('rm: command not found. Type "help".')).toBeVisible();
      await input.fill("clear");
      await kb.press("Enter");
      await expect(p.getByRole("log")).toBeEmpty();
    },
  },
  {
    id: 47,
    identity: "TELEMETRY & CONVERSION FUNNEL",
    mouse: async (p) => {
      const cell = p.getByRole("button", { name: /day 4: / });
      const before = await look(cell);
      await cell.click();
      await expect(cell).toHaveAttribute("aria-pressed", "true");
      await expect(p.getByText("2,380 Active Sessions")).toBeVisible();
      await expect.poll(() => look(cell)).not.toBe(before);
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      await p.getByRole("radio", { name: "Prior 28d" }).focus();
      await kb.press("Space");
      await expect(p.getByText("2,222 Active Sessions")).toBeVisible(); // same day, prior dataset
      await p.getByRole("button", { name: /4\. Paid Conv/ }).focus();
      await kb.press("Enter");
      await expect(p.getByText(/Stage 4/)).toBeVisible();
      await expect(p.getByText("2.6k (5.90% of visitors)")).toBeVisible();
    },
  },
  {
    id: 48,
    identity: "Masonry Pack",
    mouse: async (p) => {
      const chroma = p.getByRole("button", { name: /^Chromatic Flow LOOKBOOK/ });
      await chroma.click();
      await expect(chroma).toHaveAttribute("aria-pressed", "true");
      await expect(p.getByText(/Lookbooks · 1,240 saves/)).toBeVisible();
      const save = p.getByRole("button", { name: "Save Chromatic Flow" });
      const before = await look(save);
      await save.click();
      await expect(save).toHaveAttribute("aria-pressed", "true");
      await expect.poll(() => look(save)).not.toBe(before);
      await expect(p.getByText("♥ IN YOUR BOARD")).toBeVisible();
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      await p.getByRole("radio", { name: /Saved \(1\)/ }).focus();
      await kb.press("Space");
      await expect(p.getByRole("button", { name: /^Isometric Cyber/ })).toHaveCount(0);
      await p.getByRole("button", { name: "Save Chromatic Flow" }).focus();
      await kb.press("Enter");
      await expect(p.getByText("Nothing saved yet. Tap ♥ Save on a card.")).toBeVisible();
    },
  },
  // ── Batch 4: Minimal & Typographic ──
  {
    id: 2,
    identity: "Hello, Alex",
    mouse: async (p) => {
      const month = p.getByRole("radio", { name: "Month" });
      const before = await look(month);
      await month.click();
      await expect(month).toHaveAttribute("aria-checked", "true");
      await expect(p.getByRole("img", { name: "Month activity, peak 95 minutes" })).toBeVisible();
      await expect.poll(() => look(month)).not.toBe(before);
      const tasks = p.getByRole("button", { name: "Tasks" });
      await tasks.click();
      await expect(tasks).toHaveAttribute("aria-current", "page");
      await p.getByRole("checkbox", { name: /Call the client/ }).click();
      await expect(p.getByRole("progressbar", { name: "Tasks completed" })).toHaveAttribute("aria-valuenow", "100");
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      await p.getByRole("button", { name: "Add task" }).focus();
      await kb.press("Enter");
      await expect(p.getByRole("checkbox", { name: /Send weekly report/ })).toHaveAttribute("aria-checked", "false");
      await expect(p.getByRole("progressbar", { name: "Tasks completed" })).toHaveAttribute("aria-valuenow", "75");
      await p.getByRole("radio", { name: "Done" }).focus();
      await kb.press("Space");
      await expect(p.getByRole("checkbox", { name: /Send weekly report/ })).toHaveCount(0);
      await p.getByRole("button", { name: "Inbox" }).focus();
      await kb.press("Enter");
      await p.getByRole("button", { name: "Mark 2 as read" }).focus();
      await kb.press("Enter");
      await expect(p.getByRole("button", { name: "All caught up" })).toBeVisible();
    },
  },
  {
    id: 11,
    identity: "EDITION 08",
    mouse: async (p) => {
      await p.getByRole("button", { name: "NEXT PROJECT →" }).click();
      await expect(p.getByRole("heading", { name: "02 / Concrete Index" })).toBeVisible();
      const more = p.getByRole("button", { name: "+ Project info" });
      await more.click();
      await expect(p.getByRole("button", { name: "− Less" })).toHaveAttribute("aria-expanded", "true");
      await expect(p.getByText(/Basel · 34 units/)).toBeVisible();
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      await p.getByRole("radio", { name: "Index" }).focus();
      await kb.press("Space");
      await expect(p.getByRole("radio", { name: "Index" })).toHaveAttribute("aria-checked", "true");
      await p.getByRole("button", { name: /Paper Archive/ }).focus();
      await kb.press("Enter");
      await expect(p.getByRole("heading", { name: "04 / Paper Archive" })).toBeVisible();
      await expect(p.getByText("REF: MFG / 1950–75")).toBeVisible();
    },
  },
  {
    id: 17,
    identity: "ARCHIVE // STUDIO",
    mouse: async (p) => {
      const make = p.getByRole("button", { name: "Emphasize MAKE" });
      const before = await look(make);
      await make.click();
      await expect(make).toHaveAttribute("aria-pressed", "true");
      await expect(p.getByText("EMPHASIS // MAKE")).toBeVisible();
      await expect.poll(() => look(make)).not.toBe(before);
      await p.getByRole("radio", { name: "Stagger" }).click();
      await expect(p.getByRole("radio", { name: "Stagger" })).toHaveAttribute("aria-checked", "true");
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      await p.getByRole("radio", { name: /Composition 07/ }).focus();
      await kb.press("Space");
      await expect(p.getByRole("button", { name: "Emphasize LOUD" })).toBeVisible();
      const enter = p.getByRole("button", { name: /ENTER EXHIBITION/ });
      await enter.focus();
      await kb.press("Enter");
      await expect(p.getByText("Room B — Live Kerning")).toBeVisible();
      await kb.press("Enter"); // same button, now "back to cover"
      await expect(p.getByRole("button", { name: "Emphasize TYPE" })).toBeVisible();
    },
  },
  {
    id: 23,
    identity: "VOL. 24",
    mouse: async (p) => {
      const save = p.getByRole("button", { name: "Save" });
      const before = await look(save);
      await save.click();
      await expect(p.getByRole("button", { name: "Saved ✓" })).toHaveAttribute("aria-pressed", "true");
      await expect(p.getByText("1 SAVED")).toBeVisible();
      await expect.poll(() => look(p.getByRole("button", { name: "Saved ✓" }))).not.toBe(before);
      await p.getByRole("radio", { name: "Focus" }).click();
      await expect(p.getByRole("radio", { name: "Focus" })).toHaveAttribute("aria-checked", "true");
      await expect(p.getByText(/Serif type restores/)).toHaveCount(0);
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      await p.getByRole("button", { name: "Larger text" }).focus();
      await kb.press("Enter");
      await expect(p.getByText(/READ TIME: 8 MIN · 11PX/)).toBeVisible();
      await p.getByRole("button", { name: /NEXT: INK OVER PIXELS/ }).focus();
      await kb.press("Enter");
      await expect(p.getByRole("heading", { name: "Ink Over Pixels" })).toBeVisible();
      await expect(p.getByRole("button", { name: "Save" })).toHaveAttribute("aria-pressed", "false");
      await p.getByRole("radio", { name: "01 The Design Issue" }).focus();
      await kb.press("Space");
      await expect(p.getByRole("button", { name: "Saved ✓" })).toHaveAttribute("aria-pressed", "true");
    },
  },
  {
    id: 25,
    identity: "ARCHIVE // MONOCHROME",
    mouse: async (p) => {
      const optic = p.getByRole("button", { name: "Frame 02: Optic Study" });
      const before = await look(optic);
      await optic.click();
      await expect(optic).toHaveAttribute("aria-pressed", "true");
      await expect.poll(() => look(optic)).not.toBe(before);
      await p.getByRole("button", { name: "VIEW FRAME →" }).click();
      await expect(p.getByRole("img", { name: "Frame 02: Optic Study" })).toBeVisible();
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      await p.getByRole("button", { name: "Next frame" }).focus();
      await kb.press("Enter");
      await expect(p.getByRole("img", { name: "Frame 03: Metrics Grid" })).toBeVisible();
      await p.getByRole("button", { name: "IMAGE INFO" }).focus();
      await kb.press("Enter");
      await expect(p.getByRole("button", { name: "HIDE INFO" })).toHaveAttribute("aria-expanded", "true");
      await expect(p.getByText("ISO 200 · 35MM · f/8 · 1/125")).toBeVisible();
      const inv = p.getByRole("switch", { name: "INVERT" });
      const before = await look(inv);
      await inv.focus();
      await kb.press("Space");
      await expect(inv).toHaveAttribute("aria-checked", "true");
      await expect.poll(() => look(inv)).not.toBe(before); // tokens swap: black on white
    },
  },
  {
    id: 41,
    identity: "QUIET",
    mouse: async (p) => {
      const koicha = p.getByRole("radio", { name: /Koicha/ });
      const before = await look(koicha);
      await koicha.click();
      await expect(koicha).toHaveAttribute("aria-checked", "true");
      await expect(p.getByText("05:00 remaining")).toBeVisible();
      await expect.poll(() => look(koicha)).not.toBe(before);
      await p.getByRole("button", { name: "BEGIN RITUAL →" }).click();
      await expect(p.getByRole("button", { name: "PAUSE" })).toBeVisible();
      await expect(p.getByText(/^04:5\d remaining$/)).toBeVisible({ timeout: 5000 }); // the local timer ticks
      await expect(p.getByRole("progressbar", { name: "Session progress" })).not.toHaveAttribute("aria-valuetext", /05:00/);
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      await p.getByRole("button", { name: "PAUSE" }).focus();
      await kb.press("Enter");
      await expect(p.getByRole("button", { name: "RESUME" })).toBeVisible();
      await expect(p.getByRole("status")).toHaveText("Paused");
      await p.getByRole("button", { name: "Reset" }).focus();
      await kb.press("Enter");
      await expect(p.getByText("05:00 remaining")).toBeVisible();
      await expect(p.getByRole("progressbar", { name: "Session progress" })).toHaveAttribute("aria-valuenow", "0");
      await expect(p.getByRole("button", { name: "BEGIN RITUAL →" })).toBeVisible();
    },
  },
  {
    id: 43,
    identity: "FOUNDRY // KINETIC AXIS",
    mouse: async (p) => {
      const kinetic = p.getByRole("radio", { name: "Kinetic" });
      const before = await look(kinetic);
      await kinetic.click();
      await expect(kinetic).toHaveAttribute("aria-checked", "true");
      await expect(p.getByText("KINETIC", { exact: true })).toBeVisible();
      await expect.poll(() => look(kinetic)).not.toBe(before);
      await p.getByRole("switch", { name: "Animate" }).click();
      await expect(p.getByText("ANIMATING 300 ↔ 900")).toBeVisible();
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      await p.getByRole("switch", { name: "Animate" }).focus();
      await kb.press("Space");
      await expect(p.getByRole("switch", { name: "Animate" })).toHaveAttribute("aria-checked", "false");
      const weight = p.getByRole("slider", { name: "Weight" });
      await weight.focus();
      await kb.press("End");
      await expect(weight).toHaveValue("900");
      await expect(p.getByText("WGHT 900", { exact: true })).toBeVisible();
      const width = p.getByRole("slider", { name: "Width" });
      await width.focus();
      await kb.press("Home");
      await expect(p.getByText("WDTH: 100% // NORMAL")).toBeVisible();
      await expect(p.getByText('"wght" 900, "wdth" 100')).toBeVisible();
      await p.getByRole("button", { name: "Reset" }).focus();
      await kb.press("Enter");
      await expect(weight).toHaveValue("780");
      await expect(p.getByRole("radio", { name: "Heavy" })).toHaveAttribute("aria-checked", "true");
    },
  },
  // ── Batch 5: Atmospheric & Futuristic ──
  {
    id: 9,
    identity: "AURORA ENGINE",
    mouse: async (p) => {
      const blob = p.locator('[data-blob="1"]');
      const before = await blob.evaluate((el) => getComputedStyle(el).backgroundImage + getComputedStyle(el).transform);
      await p.getByRole("radio", { name: "Dusk" }).click();
      await expect(p.getByRole("radio", { name: "Dusk" })).toHaveAttribute("aria-checked", "true");
      await expect(p.getByText("MESH // DUSK · GLOW 70%")).toBeVisible();
      // the colour bands really change: colour and position of the first band differ
      await expect.poll(() => blob.evaluate((el) => getComputedStyle(el).backgroundImage + getComputedStyle(el).transform)).not.toBe(before);
      await p.getByRole("radio", { name: "Analyze" }).click();
      await expect(p.getByRole("heading", { name: "Signal Lens" })).toBeVisible();
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      const glow = p.getByRole("slider", { name: "Glow" });
      await glow.focus();
      await kb.press("End");
      await expect(p.getByText("MESH // DUSK · GLOW 100%")).toBeVisible();
      await p.getByRole("switch", { name: "Ambient" }).focus();
      await kb.press("Space");
      await expect(p.getByRole("switch", { name: "Ambient" })).toHaveAttribute("aria-checked", "true");
      await p.getByRole("button", { name: "Reset" }).focus();
      await kb.press("Enter");
      await expect(p.getByText("MESH // BOREALIS · GLOW 70%")).toBeVisible();
      await expect(p.getByRole("heading", { name: "Aurora Hero" })).toBeVisible();
      await expect(p.getByRole("switch", { name: "Ambient" })).toHaveAttribute("aria-checked", "false");
    },
  },
  {
    id: 16,
    identity: "SPECTRUM HARMONICS",
    mouse: async (p) => {
      const shield = p.getByRole("switch", { name: /SHIELD MATRIX/ });
      await shield.click();
      await expect(shield).toHaveAttribute("aria-checked", "false");
      await expect(shield).toHaveText(/OFFLINE/);
      await expect(p.getByText("SYS // DEGRADED 2/3")).toBeVisible();
      await expect(p.getByText("PWR: 3.24 GW")).toBeVisible();
      await p.getByRole("radio", { name: "CH-B" }).click();
      await expect(p.getByText("FREQ: 311.20 MHz")).toBeVisible();
      await p.getByRole("radio", { name: "20 KM" }).click();
      await expect(p.getByRole("img", { name: "Radar 20 km range, 3 contacts" })).toBeVisible();
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      const over = p.getByRole("switch", { name: "OVERDRIVE" });
      await over.focus();
      await kb.press("Space");
      await expect(over).toHaveAttribute("aria-checked", "true");
      await expect(p.getByText("SYS // OVERDRIVE")).toBeVisible();
      await expect(p.getByRole("switch", { name: /THRUST VECTORING \/\/ 99\.1%/ })).toBeVisible();
      const shield = p.getByRole("switch", { name: /SHIELD MATRIX/ });
      await shield.focus();
      await kb.press("Enter");
      await expect(shield).toHaveText(/71\.5%/);
      await p.getByRole("radio", { name: "5 KM" }).focus();
      await kb.press("Space");
      await expect(p.getByRole("img", { name: "Radar 5 km range, 1 contacts" })).toBeVisible();
    },
  },
  {
    id: 22,
    identity: "SYNTH FM // 1984 LIVE",
    mouse: async (p) => {
      await p.getByRole("button", { name: "Play" }).click();
      await expect(p.getByRole("button", { name: "Pause" })).toBeVisible();
      await expect(p.getByText("STATUS: 128 BPM • ON AIR")).toBeVisible();
      await expect(p.getByText("TRACK 1/3 // 2:17 / 3:45")).toHaveCount(0, { timeout: 4000 }); // the clock advances
      await p.getByRole("button", { name: "Pause" }).click();
      await p.getByRole("button", { name: "Next track" }).click();
      await expect(p.getByText("NEON ARCADE")).toBeVisible();
      await expect(p.getByText("TRACK 2/3 // 0:00 / 4:12")).toBeVisible();
      const neon = p.getByRole("switch", { name: "Neon" });
      const player = p.getByRole("region", { name: "Player" });
      const before = await look(player);
      await neon.click();
      await expect(neon).toHaveAttribute("aria-checked", "false");
      await expect.poll(() => look(player)).not.toBe(before); // neon box-shadow off
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      const seek = p.getByRole("slider", { name: "Seek" });
      await seek.focus();
      await kb.press("End");
      await expect(p.getByText("TRACK 2/3 // 4:12 / 4:12")).toBeVisible();
      await kb.press("Home");
      await kb.press("ArrowRight");
      await expect(seek).toHaveAttribute("aria-valuetext", "0:01 of 4:12");
      await p.getByRole("radio", { name: "Grid" }).focus();
      await kb.press("Space");
      await expect(p.getByRole("radio", { name: "Grid" })).toHaveAttribute("aria-checked", "true");
      await p.getByRole("button", { name: "Previous track" }).focus();
      await kb.press("Enter");
      await expect(p.getByText("MIDNIGHT OVERDRIVE")).toBeVisible();
      await p.getByRole("button", { name: "Play" }).focus();
      await kb.press("Space");
      await expect(p.getByRole("button", { name: "Pause" })).toBeFocused();
    },
  },
  {
    id: 24,
    identity: "SCROLL // DISCOVERY TRACK",
    mouse: async (p) => {
      await p.getByRole("button", { name: "Chapter 03: Global Scaling" }).click();
      await expect(p.getByText("FRAME 03 / 03")).toBeVisible();
      await expect(p.getByText("+910%")).toBeVisible();
      await expect(p.getByText("1.00 Y")).toBeVisible();
      await expect(p.getByRole("button", { name: "Chapter 03: Global Scaling" })).toHaveAttribute("aria-current", "step");
      await p.getByRole("button", { name: "Previous chapter" }).click();
      await expect(p.getByText("FRAME 02 / 03")).toBeVisible();
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      await p.getByRole("button", { name: "Previous chapter" }).focus();
      await kb.press("Enter");
      await expect(p.getByText("FRAME 01 / 03")).toBeVisible();
      await expect(p.getByText("0.00 Y")).toBeVisible();
      // the chapter column itself is a focusable scroll region: PageDown scrolls it to the next chapter
      await p.getByRole("region", { name: /Story chapters/ }).focus();
      await kb.press("PageDown");
      await expect(p.getByText("FRAME 02 / 03")).toBeVisible();
      await p.getByRole("button", { name: "Next chapter" }).focus();
      await kb.press("Enter");
      await expect(p.getByText("FRAME 03 / 03")).toBeVisible();
    },
  },
  {
    id: 28,
    identity: "SPRING TRAJECTORY",
    mouse: async (p) => {
      const insights = p.getByRole("radio", { name: /Insights/ });
      const before = await look(insights);
      await insights.click();
      await expect(insights).toHaveAttribute("aria-checked", "true");
      await expect(insights).toContainText("ACTIVE: -6PX (1.02x)");
      await expect.poll(() => look(insights)).not.toBe(before); // lifted: transform + shadow
      await p.getByRole("button", { name: "Trigger Motion" }).click();
      await expect(p.getByText("60% · TRIGGERED ×1")).toBeVisible();
      await expect.poll(() => p.getByRole("radio", { name: /Inbox/ }).evaluate((el) => getComputedStyle(el).animationName)).toMatch(/pop/);
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      await p.getByRole("radio", { name: "Snappy" }).focus();
      await kb.press("Space");
      await expect(p.getByText("TENSION: 400 // DAMP: 40")).toBeVisible();
      const intensity = p.getByRole("slider", { name: "Intensity" });
      await intensity.focus();
      await kb.press("End");
      await expect(p.getByRole("radio", { name: /Insights/ })).toContainText("ACTIVE: -10PX (1.04x)");
      await p.getByRole("radio", { name: /Inbox/ }).focus();
      await kb.press("Space");
      await expect(p.getByRole("radio", { name: /Inbox/ })).toHaveAttribute("aria-checked", "true");
      await p.getByRole("button", { name: "Reset" }).focus();
      await kb.press("Enter");
      await expect(p.getByRole("radio", { name: /Deploy/ })).toHaveAttribute("aria-checked", "true");
      await expect(p.getByText("60% · TRIGGERED ×0")).toBeVisible();
    },
  },
  {
    id: 35,
    identity: "HOLO PASS // INTERACTIVE FOIL",
    mouse: async (p) => {
      const card = p.getByText("VIP MEMBERSHIP");
      const box = (await card.boundingBox())!;
      await p.page().mouse.move(box.x + box.width + 40, box.y - 20); // toward the top-right of the card
      await expect(p.getByText("TILT X 0° · Y 0° // SHEEN 135°")).toHaveCount(0);
      await p.getByRole("button", { name: "Flip" }).click();
      await expect(p.getByText("SIDE: BACK")).toBeVisible();
      await expect(p.getByText(/MEMBER SINCE 2026/)).toBeVisible();
      await p.getByRole("radio", { name: "Creator" }).click();
      await expect(p.getByText("MEMBER SINCE 2026 // CREATOR")).toBeVisible();
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      await p.getByRole("button", { name: "Reset" }).focus();
      await kb.press("Enter");
      await expect(p.getByText("TILT X 0° · Y 0° // SHEEN 135°")).toBeVisible();
      await expect(p.getByText("SIDE: FRONT")).toBeVisible();
      await expect(p.getByText("VIP MEMBERSHIP")).toBeVisible();
      await p.getByRole("button", { name: "Tilt right" }).focus();
      await kb.press("Enter");
      await kb.press("Enter");
      await expect(p.getByText("TILT X 0° · Y 12° // SHEEN 171°")).toBeVisible();
      const foil = p.getByRole("switch", { name: "Foil" });
      await foil.focus();
      await kb.press("Space");
      await expect(foil).toHaveAttribute("aria-checked", "false");
      await expect(p.getByText("FOIL: OFF")).toBeVisible();
      await p.getByRole("button", { name: "Flip" }).focus();
      await kb.press("Space");
      await expect(p.getByRole("button", { name: "Flip" })).toHaveAttribute("aria-pressed", "true");
    },
  },
  // ── Batch 6: Art & Heritage Movements ──
  {
    id: 13,
    identity: "STAATLICHES BAUHAUS",
    mouse: async (p) => {
      await p.getByRole("radio", { name: "Square" }).click();
      await expect(p.getByText("SQR", { exact: true })).toBeVisible();
      const sys = p.getByText(/SYSTEM 0\d \/\/ BLK/);
      const before = await look(sys.locator(".."));
      await p.getByRole("button", { name: "Rotate" }).click();
      await expect(p.getByText("BLAU • GELB • ROT")).toBeVisible();
      await expect(p.getByText(/SYSTEM 02 \/\/ BLK/)).toBeVisible();
      await expect.poll(() => look(p.getByText(/SYSTEM 02/).locator(".."))).not.toBe(before); // block colour changed
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      await p.getByRole("radio", { name: "1:1:2" }).focus();
      await kb.press("Space");
      await expect(p.getByRole("radio", { name: "1:1:2" })).toHaveAttribute("aria-checked", "true");
      await expect(p.getByText("1:2", { exact: true })).toBeVisible();
      await p.getByRole("radio", { name: "Triangle" }).focus();
      await kb.press("Enter");
      await expect(p.getByText("TRI", { exact: true })).toBeVisible();
      await p.getByRole("button", { name: "Rotate" }).focus();
      await kb.press("Enter");
      await expect(p.getByText("GELB • ROT • BLAU")).toBeVisible();
    },
  },
  {
    id: 19,
    identity: "GRAND PALAIS",
    mouse: async (p) => {
      await p.getByRole("radio", { name: /Salon Noir & Gold/ }).click();
      await expect(p.getByText("SALON NOIR & GOLD · ₣ 1,900 PER NIGHT")).toBeVisible();
      await p.getByRole("button", { name: "More nights" }).click();
      await p.getByRole("button", { name: "RESERVE SUITE" }).click();
      await expect(p.getByRole("button", { name: "RESERVED ✓" })).toHaveAttribute("aria-pressed", "true");
      await expect(p.getByText("CONFIRMED · SALON NOIR & GOLD · 3 × ₣ 1,900")).toBeVisible();
      const frame = p.getByRole("heading", { name: "GRAND PALAIS" }).locator("..");
      const before = await look(frame);
      await p.getByRole("radio", { name: "Obsidian" }).click();
      await expect.poll(() => look(frame)).not.toBe(before);
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      // changing the booking clears the confirmation
      await p.getByRole("button", { name: "Fewer nights" }).focus();
      await kb.press("Enter");
      await expect(p.getByRole("button", { name: "RESERVE SUITE" })).toHaveAttribute("aria-pressed", "false");
      await expect(p.getByText("2 NIGHTS")).toBeVisible();
      await p.getByRole("radio", { name: /Suite Belle Époque/ }).focus();
      await kb.press("Space");
      await p.getByRole("button", { name: "RESERVE SUITE" }).focus();
      await kb.press("Enter");
      await expect(p.getByText("CONFIRMED · SUITE BELLE ÉPOQUE · 2 × ₣ 1,250")).toBeVisible();
    },
  },
  {
    id: 20,
    identity: "MEMPHIS_LABS",
    mouse: async (p) => {
      await p.getByRole("button", { name: "EXPLORE UI →" }).click();
      await expect(p.getByRole("heading", { name: "ZIG-ZAG LAYOUTS" })).toBeVisible();
      const explore = p.getByRole("button", { name: "EXPLORE UI →" });
      const before = await look(explore);
      await p.getByRole("radio", { name: "Sky" }).click();
      await expect(p.getByRole("radio", { name: "Sky" })).toHaveAttribute("aria-checked", "true");
      await expect.poll(() => look(explore)).not.toBe(before); // accent fill
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      await p.getByRole("button", { name: "SHUFFLE" }).focus();
      await kb.press("Enter");
      await expect(p.getByText("IDEA 2/3 · CONFETTI B")).toBeVisible();
      await p.getByRole("radio", { name: "Lilac" }).focus();
      await kb.press("Space");
      await expect(p.getByRole("radio", { name: "Lilac" })).toHaveAttribute("aria-checked", "true");
      await p.getByRole("button", { name: "EXPLORE UI →" }).focus();
      await kb.press("Enter");
      await expect(p.getByRole("heading", { name: "CLASHING COLOUR" })).toBeVisible();
    },
  },
  {
    id: 26,
    identity: "AURA // BOTANICS",
    mouse: async (p) => {
      await p.getByRole("radio", { name: "Nature" }).click();
      await expect(p.getByRole("heading", { name: "Rooted Forms" })).toBeVisible();
      await p.getByRole("button", { name: "Reshape →" }).click();
      await expect(p.getByText("CURVE PRESET 2/3")).toBeVisible();
      await p.getByRole("switch", { name: "Clay accents" }).click();
      await expect(p.getByText("MOSS ACCENTS")).toBeVisible();
      await expect(p.getByText("EARTH PALETTE // SAGE • SAND • MOSS")).toBeVisible();
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      await p.getByRole("radio", { name: "Journal" }).focus();
      await kb.press("Space");
      await expect(p.getByRole("heading", { name: "Slow Seasons" })).toBeVisible();
      const flora = p.getByRole("switch", { name: "Our Flora" });
      await flora.focus();
      await kb.press("Enter");
      await expect(flora).toHaveAttribute("aria-checked", "false");
      await p.getByRole("button", { name: "Reshape →" }).focus();
      await kb.press("Enter");
      await expect(p.getByText("CURVE PRESET 3/3")).toBeVisible();
    },
  },
  {
    id: 27,
    identity: "ATELIER & PRESS // FOLIO",
    mouse: async (p) => {
      await p.getByRole("button", { name: "COLLECT" }).first().click();
      await expect(p.getByText("CATALOG • 1 COLLECTED")).toBeVisible();
      await expect(p.getByRole("region", { name: "The Paper Edition" }).getByRole("button", { name: "COLLECTED" })).toHaveAttribute("aria-pressed", "true");
      const card = p.getByRole("region", { name: "The Paper Edition" });
      const before = await look(card);
      await p.getByRole("switch", { name: "Straighten" }).click();
      await expect.poll(() => look(card)).not.toBe(before); // tilt removed
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      await p.getByRole("radio", { name: "Edition on top" }).focus();
      await kb.press("Space");
      await expect(p.getByRole("radio", { name: "Edition on top" })).toHaveAttribute("aria-checked", "true");
      await p.getByRole("region", { name: "Coffee & Solitude" }).getByRole("button", { name: "COLLECT" }).focus();
      await kb.press("Enter");
      await expect(p.getByText("CATALOG • 2 COLLECTED")).toBeVisible();
    },
  },
  {
    id: 40,
    identity: "MAISON AURELIA",
    mouse: async (p) => {
      await p.getByRole("radio", { name: /II\. PRIVATE ATELIER/ }).click();
      await expect(p.getByRole("button", { name: "ENTER ATELIER →" })).toBeVisible();
      await p.getByRole("button", { name: "ENTER ATELIER →" }).click();
      await expect(p.getByRole("button", { name: "← RETURN TO HALL" })).toHaveAttribute("aria-expanded", "true");
      await p.getByRole("radio", { name: "II. Tourbillon Souverain" }).click();
      await expect(p.getByText("Tourbillon Souverain")).toBeVisible();
      await expect(p.getByText("ATELIER • PIECE II")).toBeVisible();
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      await p.getByRole("radio", { name: "III. Lune d'Ivoire" }).focus();
      await kb.press("Space");
      await expect(p.getByText("MMXII · Moon phase · ivory guilloché")).toBeVisible();
      await p.getByRole("button", { name: "← RETURN TO HALL" }).focus();
      await kb.press("Enter");
      await expect(p.getByRole("radio", { name: /I\. HERITAGE ARCHIVE/ })).toBeVisible();
      await p.getByRole("radio", { name: /I\. HERITAGE ARCHIVE/ }).focus();
      await kb.press("Space");
      await expect(p.getByRole("button", { name: "ENTER SALON →" })).toBeVisible();
    },
  },
  {
    id: 44,
    identity: "CRYSTALLINE UI",
    mouse: async (p) => {
      const facet = p.locator("svg path").first();
      const before = await facet.getAttribute("fill");
      await p.getByRole("radio", { name: "54" }).click();
      await expect(p.getByText("54 PLANES")).toBeVisible();
      await expect(p.locator("svg path")).toHaveCount(54);
      await p.getByRole("radio", { name: "Cyan" }).click();
      await expect.poll(() => p.locator("svg path").first().getAttribute("fill")).not.toBe(before);
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      const fills = () => p.locator("svg path").evaluateAll((els) => els.map((e) => e.getAttribute("fill")).join());
      const before = await fills();
      const light = p.getByRole("slider", { name: "Light angle" });
      await light.focus();
      await kb.press("End");
      await expect(light).toHaveValue("355");
      await expect(p.getByText("355°")).toBeVisible();
      expect(await fills()).not.toBe(before); // facets re-shaded for the new light direction
      await p.getByRole("radio", { name: "24" }).focus();
      await kb.press("Space");
      await expect(p.locator("svg path")).toHaveCount(24);
    },
  },
  {
    id: 50,
    identity: "IDEA #50",
    mouse: async (p) => {
      const ship = p.getByRole("button", { name: "Ship draft" });
      await expect(ship).toHaveAttribute("aria-disabled", "true");
      await expect(p.getByText("2 notes to tick")).toBeVisible();
      await p.getByRole("checkbox", { name: /Invites early user collaboration/ }).click();
      await p.getByRole("checkbox", { name: /Reduces fear/ }).click();
      await expect(p.getByText("Ready to ship")).toBeVisible();
      await ship.click();
      await expect(p.getByText("Draft shipped for review")).toBeVisible();
      await p.getByRole("radio", { name: /Wireframing/ }).click();
      await expect(p.getByText("Stage: Wireframing")).toBeVisible();
    },
    keyboard: async (p) => {
      const kb = p.page().keyboard;
      const first = p.getByRole("checkbox", { name: /Wobbly/ });
      await first.focus();
      await kb.press("Space");
      await expect(first).toHaveAttribute("aria-checked", "false");
      await expect(p.getByRole("button", { name: "Ship draft" })).toHaveAttribute("aria-disabled", "true");
      await p.getByRole("radio", { name: "Ship It!" }).focus();
      await kb.press("Enter");
      await expect(p.getByText("Stage: Ship It!")).toBeVisible();
      const marker = p.getByRole("switch", { name: "Highlighter" });
      await marker.focus();
      await kb.press("Space");
      await expect(marker).toHaveAttribute("aria-checked", "false");
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

test("style 43: weight and width axes are real (variable font loaded, glyphs change shape)", async ({ page }) => {
  const stage = await openLive(page, 43);
  await expect.poll(() => page.evaluate(() => document.fonts.check('700 40px "Axis Sans Subset"'))).toBe(true);
  const word = stage.getByText("HEAVY", { exact: true });
  const width = stage.getByRole("slider", { name: "Width" });
  const weight = stage.getByRole("slider", { name: "Weight" });
  // width of the glyphs themselves (the <p> is a flex item, so its own box does not follow the text)
  const w = () => word.evaluate((el) => {
    const r = document.createRange();
    r.selectNodeContents(el);
    return r.getBoundingClientRect().width;
  });
  await width.focus();
  await page.keyboard.press("Home");
  await weight.focus();
  await page.keyboard.press("Home");
  await page.waitForTimeout(400); // 0.3s font-variation-settings transition
  const narrowLight = await w();
  await page.keyboard.press("End"); // wght 900
  await expect.poll(w).toBeGreaterThan(narrowLight * 1.05);
  const narrowHeavy = await w();
  await width.focus();
  await page.keyboard.press("End"); // wdth 125: only a font with a real wdth axis gets wider here
  await expect.poll(w).toBeGreaterThan(narrowHeavy * 1.1);
});

test("styles 43 + 17: reduced motion stops the type animation and transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const stage = await openLive(page, 43);
  await stage.getByRole("switch", { name: "Animate" }).click();
  await expect(stage.getByText("Reduced motion: animation off")).toBeVisible();
  expect(await stage.getByText("HEAVY", { exact: true }).evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  await page.getByRole("button", { name: "Close details" }).click();
  const s17 = await openLive(page, 17);
  const dur = await s17.getByRole("button", { name: "Emphasize NOW" }).evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration));
  expect(dur).toBeLessThan(0.01);
});

test("style 24: scrolling the chapter column (wheel) advances the story; the dialog does not scroll", async ({ page }) => {
  const stage = await openLive(page, 24);
  const region = stage.getByRole("region", { name: /Story chapters/ });
  const dialogScroll = () => page.locator("dialog").evaluate((d) => (d.querySelector<HTMLElement>(".overflow-y-auto") ?? d).scrollTop);
  const before = await dialogScroll();
  const box = (await region.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await expect(stage.getByText("FRAME 01 / 03")).toBeVisible();
  for (let i = 0; i < 12; i++) await page.mouse.wheel(0, 120);
  await expect(stage.getByText("FRAME 03 / 03")).toBeVisible();
  await expect(stage.getByRole("button", { name: "Chapter 03: Global Scaling" })).toHaveAttribute("aria-current", "step");
  await expect(stage.getByText("1.00 Y")).toBeVisible();
  expect(await dialogScroll(), "overscroll-behavior keeps the wheel inside the story").toBe(before);
});

test("style 35: dragging over the card tilts it; Reset returns it flat and to the front", async ({ page }) => {
  const stage = await openLive(page, 35);
  const card = stage.getByText("VIP MEMBERSHIP");
  const box = (await card.boundingBox())!;
  await page.mouse.move(box.x, box.y);
  await page.mouse.down();
  await page.mouse.move(box.x + 120, box.y + 60, { steps: 5 });
  await page.mouse.up();
  await expect(stage.getByText("TILT X 0° · Y 0° // SHEEN 135°")).toHaveCount(0);
  const transform = () => stage.locator("[class*='card']").first().evaluate((el) => getComputedStyle(el).transform);
  expect(await transform()).not.toBe("none");
  await stage.getByRole("button", { name: "Flip" }).click();
  await stage.getByRole("button", { name: "Reset" }).click();
  await expect(stage.getByText("TILT X 0° · Y 0° // SHEEN 135°")).toBeVisible();
  await expect(stage.getByText("SIDE: FRONT")).toBeVisible();
  await expect.poll(transform).toMatch(/^(none|matrix3d\(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1\)|matrix\(1, 0, 0, 1, 0, 0\))$/);
});

test("batch 5: reduced motion removes looping animation and keeps every state change", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const anim = (l: import("@playwright/test").Locator) => l.evaluate((el) => getComputedStyle(el).animationName);
  const s9 = await openLive(page, 9);
  await s9.getByRole("switch", { name: "Ambient" }).click();
  await expect(s9.getByText("Reduced motion: ambient drift off")).toBeVisible();
  expect(await anim(s9.locator('[data-blob="1"]'))).toBe("none");
  await page.getByRole("button", { name: "Close details" }).click();

  const s22 = await openLive(page, 22);
  await s22.getByRole("button", { name: "Play" }).click();
  await expect(s22.getByText("STATUS: 128 BPM • ON AIR")).toBeVisible();
  expect(await anim(s22.locator("[class*='eqBar']").first())).toBe("none");
  await page.getByRole("button", { name: "Close details" }).click();

  const s16 = await openLive(page, 16);
  expect(await anim(s16.locator("[class*='sweep']"))).toBe("none");
  await page.getByRole("button", { name: "Close details" }).click();

  const s28 = await openLive(page, 28);
  await expect(s28.getByText("REDUCED MOTION: INSTANT STATE CHANGES")).toBeVisible();
  const inbox = s28.getByRole("radio", { name: /Inbox/ });
  expect(await inbox.evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration))).toBeLessThan(0.01);
  await inbox.click();
  await expect(inbox).toContainText("ACTIVE: -6PX (1.02x)"); // state still applies, instantly
  expect(await inbox.evaluate((el) => getComputedStyle(el).transform)).not.toBe("none");
});

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
  test.slow(); // 50 x (Live CSS: lazy chunk + mount, Slide Visual: image load): ~33s alone at 1 worker (measured), linear in preview count
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

test("all 50 styles are live; every reference image still loads", async ({ page }) => {
  expect(LIVE_IDS.slice().sort((x, y) => x - y)).toEqual(Array.from({ length: 50 }, (_, i) => i + 1));
  await expect(page.getByRole("button", { name: "Live CSS" })).toHaveCount(50);
  for (let id = 1; id <= 50; id++) {
    const src = `/images/style-${String(id).padStart(2, "0")}.png`;
    await expect(card(page, id).locator("img")).toHaveAttribute("src", src);
    const res = await page.request.get(src);
    expect(res.status(), src).toBe(200);
    expect(res.headers()["content-type"], src).toContain("image/png");
  }
});

test("preview CSS does not leak into the gallery", async ({ page }) => {
  test.slow(); // 50 sequential Live CSS clicks, each scroll + lazy chunk + mount: ~23s alone (measured), linear in preview count
  // Shell parts of a card that the Live CSS toggles never change: the card heading and its View details button.
  const probe = () =>
    page.evaluate(() => {
      const pick = (sel: string) => {
        const el = document.querySelector(sel)!;
        const c = getComputedStyle(el);
        return [c.fontFamily, c.fontSize, c.color, c.backgroundColor, c.borderRadius, c.boxShadow, c.padding].join("|");
      };
      const c = 'article[aria-labelledby="style-1-name"]';
      return ["body", "header", "input[type=search]", "article", "article h2", "nav button", `${c} .mt-auto > button`, `${c} h2`].map(pick);
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
