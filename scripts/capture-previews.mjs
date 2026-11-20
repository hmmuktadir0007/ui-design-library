// Regenerates docs/screenshots/phase-2b/*: one Live CSS shot per registered preview, a Slide Visual vs Live CSS
// comparison sheet (JPEG), and gallery + detail shots at 1440 and 375 px.
// Usage: npm run capture:previews   (builds first, then serves dist/ itself on port 4174)
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
import { preview } from "vite";

const PORT = 4174; // not 4173, so it never reuses a stale server left over from the e2e run
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = "docs/screenshots/phase-2b";
const IDS = [...readFileSync("src/components/previews/previewRegistry.ts", "utf8").matchAll(/^\s*(\d+): \(\) => import/gm)].map((m) => Number(m[1]));
const styles = JSON.parse(readFileSync("src/data/styles.json", "utf8"));
const nameOf = (id) => (styles.styles ?? styles).find((s) => s.id === id).name;
const nn = (id) => String(id).padStart(2, "0");
const esc = (s) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
// By the card's own heading, not article.nth(id - 1): a live preview containing <article> (e.g. 48) shifts nth indexes.
const card = (page, id) => page.locator(`article[aria-labelledby="style-${id}-name"]`);
let step = "start"; // named in the failure message, so a timeout says which style and which phase stalled
mkdirSync(OUT, { recursive: true });

const server = await preview({ preview: { host: "127.0.0.1", port: PORT, strictPort: true } });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  const openDetail = async (id) => {
    await card(page, id).getByRole("button", { name: "View details" }).click();
    const stage = page.locator(`dialog [data-preview-id="${id}"]`);
    await stage.waitFor();
    // ready = lazy chunk mounted (Suspense pulse placeholder gone, real content present) and web fonts settled
    await page.waitForFunction(
      (el) => el.querySelector("[style*='scale(']")?.children.length && !el.querySelector(".animate-pulse"),
      await stage.elementHandle(),
    );
    await page.evaluate(() => document.fonts.ready);
    return stage;
  };

  // 1. Live preview of each style at the detail-view stage width (1440 px viewport, 2x density).
  const live = {};
  for (const id of IDS) {
    // one retry: on this machine a lazy chunk occasionally misses the first 30s window
    for (let attempt = 1; ; attempt++) {
      try {
        step = `live ${nn(id)} (attempt ${attempt})`;
        await page.goto(BASE);
        live[id] = (await (await openDetail(id)).screenshot({ path: `${OUT}/live-${nn(id)}.png` })).toString("base64");
        break;
      } catch (e) {
        if (attempt === 2) throw e;
        console.warn(`style ${id}: retrying after ${e.name}`);
      }
    }
  }

  step = "comparison sheet";
  // 2. Side-by-side sheet: Slide Visual (source PNG) | Live CSS.
  const rows = IDS.map(
    (id) =>
      `<tr><th>${nn(id)}<br>${esc(nameOf(id))}</th><td><img src="${BASE}/images/style-${nn(id)}.png"></td><td><img src="data:image/png;base64,${live[id]}"></td></tr>`,
  ).join("");
  await page.goto(BASE); // same origin so /images resolve
  await page.setContent(
    `<style>body{font:14px system-ui;margin:16px}table{border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px;vertical-align:top}th{width:140px;text-align:left}img{width:600px;display:block}</style>
<table><tr><th>Style</th><th>Slide Visual (source)</th><th>Live CSS preview</th></tr>${rows}</table>`,
    { waitUntil: "load" },
  );
  // JPEG: the 2x full-page sheet of 50 PNG pairs is ~11 MB as PNG, ~2-3 MB as JPEG and still readable.
  await page.screenshot({ path: `${OUT}/comparison-sheet.jpg`, type: "jpeg", quality: 82, fullPage: true });

  // 3. Gallery with every live card switched to Live CSS, and one detail view per batch, per viewport.
  for (const [label, width, height] of [["desktop-1440", 1440, 900], ["mobile-375", 375, 812]]) {
    step = `gallery ${label}`;
    await page.setViewportSize({ width, height });
    await page.goto(BASE);
    for (const id of IDS) await card(page, id).getByRole("button", { name: "Live CSS" }).click();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction((n) => document.querySelectorAll("article [data-preview-id] [style*='scale(']").length === n && !document.querySelector("article [data-preview-id] .animate-pulse"), IDS.length);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `${OUT}/gallery-${label}.png` });
    for (const id of [6, 38, 30, 43, 24, 19]) {
      step = `detail ${nn(id)} ${label}`;
      await page.goto(BASE);
      await openDetail(id);
      await page.screenshot({ path: `${OUT}/detail-${nn(id)}-${label}.png` });
    }
  }
  console.log(`captured ${IDS.length} previews to ${OUT}`);
} catch (e) {
  console.error(`capture failed during: ${step}`);
  await browser.contexts()[0]?.pages()[0]?.screenshot({ path: ".tmp/capture-failure.png" }).catch(() => {});
  console.error("page state saved to .tmp/capture-failure.png (gitignored)");
  process.exitCode = 1;
  throw e;
} finally {
  await browser.close();
  await server.close();
}
