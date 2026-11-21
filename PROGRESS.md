# Progress

**Current phase:** Phase 2D complete — interactive Style Playground (viewport presets, Compare mode, Preview Backdrop, live `--pg-*` CSS-variable customization across 28 styles, immutable Original CSS vs. Generated CSS export, and Reset) verified across all 7 checks. Ready for Phase 4 deployment when approved.

| Scope | Status |
|---|---|
| Phase 1 — extraction + validation | complete |
| Phase 2A — application foundation | complete |
| Phase 2B batch 1 — 10 Morphism & Depth live previews | complete, verified 2026-11-19 |
| Phase 2B batch 2 — 10 Bold, Retro & Expressive live previews | complete, verified 2026-11-19 |
| Phase 2B batch 3 — 9 Modern SaaS & Dashboards live previews | complete, verified 2026-11-19 |
| Phase 2B batch 4 — 7 Minimal & Typographic live previews | complete, verified 2026-11-20 |
| Phase 2B batch 5 — 6 Atmospheric & Futuristic live previews | complete, verified 2026-11-20 |
| Phase 2B batch 6 — 8 Art & Heritage Movements live previews | complete, verified 2026-11-20 |
| All 50 previews | complete (50 live, 0 image-only) |
| Phase 2C-1 — P1 interaction & accessibility fixes | complete, verified 2026-11-21 |
| Phase 2C-2 — cross-browser & simulated mobile touch compatibility | complete, verified 2026-11-21 |
| Phase 2C-3 — targeted visual fidelity improvements (9 styles) | complete, verified 2026-11-21 |
| Phase 2C-4 — image thumbnails, ESLint & Lighthouse baseline | complete, verified 2026-11-21 |
| Phase 2D — Full Playground customization (viewport frame, variable controls, generated CSS) | complete, verified 2026-11-21 |

## Completed

- [x] Project inspected: only `data/ui-styles.pptx` (8.3 MB, 53 slides) and `data/ui-styles.pdf` (2.8 MB, 53 pages); no prior code, no Git.
- [x] Slide/page mapping verified: style N is on slide/page N+2 for N = 1..50 (title number checked in both PPTX and PDF).
- [x] `scripts/extract_styles.py` — idempotent (identical `styles.json` hash on re-run).
- [x] `src/data/styles.json` — 50 records.
- [x] `public/images/style-01.png` … `style-50.png` — 50 PNGs, ~969×777 px, 7 MB total.
- [x] `data/contact-sheet.png` — all 50 crops reviewed visually.
- [x] `data/extraction-report.json`.
- [x] `scripts/validate_styles.py` — 0 errors, 1 warning.
- [x] Git initialized; PPTX/PDF git-ignored.

## Test results

`python scripts/validate_styles.py` → `50 styles, 0 errors, 1 warnings` (exit 0; the warning is the style 5 Glass swatch).
`python -m unittest scripts/test_validate_styles.py` → 11 tests OK.
Re-extraction is reproducible: identical `styles.json` hash across runs; PNGs unchanged byte-for-byte.
Every whereToUse/howToUse/aiPrompt/cssSnippet field matches ≥95% of the PDF page text; CSS matches PPTX byte-for-byte.

Category counts: Morphism & Depth 10 · Bold, Retro & Expressive 10 · Modern SaaS & Dashboards 9 · Art & Heritage Movements 8 · Minimal & Typographic 7 · Atmospheric & Futuristic 6.

## Extraction warnings / source ambiguities

1. **Style 5 Glassmorphism palette:** slide shows 4 swatches; one is labelled "Glass / 15% Fill" with no colour value. Left out rather than invented. Palette = 3 colours. (Slide CSS uses `rgba(255, 255, 255, 0.14)` — 14%, not 15%, so it was not used as a substitute.)
2. **Style 47 Heatmap palette** has 6 colours — slide header says "6-TONE", so this is correct, not an error.
3. **PDF text layer is lossy** (drops `(`, `–`, `×`; renders `*/` as `//`). PPTX text used as the source; PDF only for cross-checks.
4. **Category labels vary** (25 styles): e.g. "Art & Heritage", "Bold & Retro", "Modern SaaS", "MORPHISM & DEPTH", "Morphism & Depth// 3D CLAY SPEC". All mapped to the six approved categories; full list in `categoryNormalization` in the report.
5. **Liquid Glass (10) mockup** has decorative blobs overflowing its window; the crop keeps the window contents only.
6. Some prose fields keep a source lead-in (`Method:` on style 1, `Optimal Scenarios:` on style 2) because it's printed on the slide.

## Manual corrections

| Style | Field | From | To | Basis |
|---|---|---|---|---|
| 10 Liquid Glass | palette | `rgba/0.22` | `rgba(255,255,255,0.22)` | identical value in slide CSS |
| 31 Spatial / VisionOS | palette | `rgba(128..)` | `rgba(120, 120, 128, 0.28)` | slide CSS background value |

## Phase 1 housekeeping (optional metadata)

Added from the PPTX, never invented; the original 10 fields are byte-identical to the Phase 1 commit (diffed).

| Field | Present on | Rule |
|---|---|---|
| `subtitle` | 50 | title text after the first colon, minus a trailing era parenthetical |
| `era` | 10 (styles 1–10) | trailing title parenthetical containing a digit, verbatim. Style 3 is `"Google, 2014+"` (kept as printed, ambiguous). Style 5's separate "HISTORICAL ERA" box (`2020+ // Apple macOS, Windows`) is not used. |
| `originalCategory` | 50 | label exactly as printed, incl. sub-headings (style 2 `… // PURE 2D CLARITY`, style 6 `…// 3D CLAY SPEC`) |
| `paletteNames` | 45 | aligned 1:1 with `palette`; omitted on 6, 7, 12, 13, 16 (slides print no names). Style 5 has 3 names for its 3 colours; the unvalued "Glass 15% Fill" swatch gets no mapping. |

Validation: `validate_styles.py` now re-parses the PPTX and requires every record (all fields) to equal the fresh parse; `scripts/test_validate_styles.py` holds 11 negative tests on in-memory copies (duplicate/missing ids, bad category, bad colour, missing image ref/file, wrong metadata types, palette-name length, duplicate image ref, edited source text).

## Phase 2A — application foundation

Stack: React 19.3, Vite 8.3, TypeScript 7.0, Tailwind 4.3 (`@tailwindcss/vite`), lucide-react 1.75, Vitest 5.1. No backend, no state library.

| Check | Result |
|---|---|
| `npm install` | ok, 0 vulnerabilities |
| `npm run typecheck` | 0 errors |
| `npm run build` | ok — JS 290.6 kB (91.8 kB gzip), CSS 27.6 kB (6.4 kB gzip) |
| `npm test` (Vitest) | 4/4 pass (counts, case/whitespace, subtitle/originalCategory/use-case search, query+category) |
| `npm run validate:data` | 0 errors, 1 warning (style 5); 11/11 negative tests |
| Lint | not configured (Phase 3) |

Browser verification (Playwright/Chromium against `vite preview` of the production build):
- 50 cards; 50/50 images loaded with correct `style-NN.png` mapping.
- 7 tabs: counts 50/10/7/9/10/6/8, each tab shows exactly that many cards and only matching badges; counts follow the active search.
- Search: case + whitespace insensitive; "glass" → 5, + Morphism & Depth → 4; empty state + "Clear search and filters"; clear (×) button.
- Theme: toggle works, persists after reload (`localStorage.theme`), system preference used when unset.
- Detail: all 50 open with matching title, close via Esc (focus returns to trigger), close button, backdrop click; Tab stays inside the dialog (page inert).
- Clipboard (granted permission): palette, single rgba swatch, AI prompt, original CSS, card swatch — exact values read back. Visible "Copied!" + `role=status` text.
- Style 5 shows 3 swatches, style 47 shows 6. No Live CSS control rendered anywhere (0 buttons matching /live/).
- No console errors or warnings. No horizontal overflow at 375/768/1440 (gallery and dialog).

Screenshots: `docs/screenshots/phase-2a/` (gallery light/dark 1440, light 768, light/dark 375; detail light 1440/768/375, dark 1440 style 47; empty state 375).

Fixed during review: card palette wrapping into two rows (moved View details below palette), category tabs wrapping at 1440 (tighter pills), double scrollbar in dialog at 768 (`html:has(dialog[open])` + dialog overflow hidden), low-contrast active tab in dark mode.

## Phase 2B batch 1 — Morphism & Depth live previews

Verified 2026-11-19. Architecture (artboard scaling, CSS isolation, touch targets): see IMPLEMENTATION_PLAN.md "Style preview architecture".

| # | Style | Main interactions (all also keyboard-operable) |
|---|---|---|
| 01 | Skeuomorphism | play/pause, previous/next track, Volume/Bass/Tone rotary knobs (drag, arrows, Page/Home/End), power switch, VU meter |
| 04 | Neumorphism | thermostat −/+, AUTO/ECO mode radios, volume slider, play |
| 05 | Glassmorphism | forecast day radios, weather-alerts switch, credit card flip |
| 06 | Claymorphism | three habit toggles drive the progress bar, Start fresh reset |
| 10 | Liquid Glass | material chips (Specular/Caustics/Diffusion/Prism/Flow), playback scrubber, play |
| 18 | 3D / Spatial UI | Rotate Y / Tilt X sliders, Explore 3D animation |
| 31 | Spatial / visionOS | sidebar tabs, play, scrubber, Expand to room / Return to window, transport buttons |
| 34 | Isometric UI | L1–L3 layer radios, Explode / Collapse |
| 45 | Obsidian Glass | 1D/1W/1M/1Y chart range, Hide balance, rim-light toggle, backdrop-blur cycle |
| 46 | Tactile Hardware | power, TRIG/HOLD, waveform cycle, Frequency/Resonance/Modulation knobs, output fader |

Gallery cards: Slide Visual / Live CSS toggle; Live CSS in a card is display only (`inert`, labelled "Display only"). Detail dialog opens in Live CSS and is fully interactive.

### Verification (2026-11-19, after accessibility stabilization)

| Check | Result |
|---|---|
| `npm run typecheck` | 0 errors |
| `npm run build` | ok — JS 298.1 kB (94.5 kB gzip), CSS 29.3 kB (6.6 kB gzip); each preview its own chunk (2–4 kB) |
| `npm test` (Vitest) | 20/20 pass (3 files: search, CSS scoping, touch-target split) |
| `npm run validate:data` | 50 styles, 0 errors, 1 warning (style 5 swatch); 11/11 negative tests |
| `npm run test:e2e` (Playwright, Chromium, 375/768/1440) | 106 pass, 2 skipped (36 tests × 3 viewports; the 375-only layout test is skipped at 768/1440). Full suite run twice, stable. |

Playwright coverage (`tests/e2e/`): gallery basics; per preview, pointer interaction with a visible state change plus a keyboard-only interaction; knob drag; Slide Visual / Live CSS toggle in cards and detail; the other 40 styles stay image-only; no CSS leak into the shell; card previews inert. Any browser console error or warning fails a test.

Accessibility suite (`tests/e2e/a11y.spec.ts`, all three viewports unless noted):
- per preview: effective target ≥ 24×24 for every control, measured by real hit testing (`elementFromPoint`, so the scale transform and invisible extenders count, not bounding boxes); no point of a control's visible box is hit-tested as another control (no overlap); every control reachable with Tab and showing a non-zero outline while focused; axe-core (`@axe-core/playwright`, tags wcag2a/aa, wcag21a/aa, wcag22aa) on the open dialog, 0 violations;
- 04/10/31/46 sliders: a click inside the enlarged area but outside the visible track moves the value, then ArrowLeft changes it by one step;
- 46 Power: a click just outside the visible switch toggles it, Space toggles it back;
- 375 px only: preview fully on screen, no horizontal overflow in page or dialog;
- gallery page: axe WCAG 2.2 AA, 0 violations.

### Accessibility findings

Stabilization pass 2026-11-19. Automated results (hit-testing measurements, axe) first, then what still needs a person.

**Corrected**
- Hit-area algorithm (`PreviewStage`): each side grows independently (a control next to empty space now grows fully on that side), the stage edge counts as a boundary, and growth starts from the visible border edge (borders were previously lost). Range inputs keep their transparent border equal on both sides because Chrome centres the track in the border box.
- Sliders: all five range inputs (04, 10, 18, 31, 46) now draw their track on `::-webkit-slider-runnable-track` / `::-moz-range-track`; the input box is transparent. 18 and 31 were native (`accent-color`) sliders and are now custom-styled in the same colours.
- Spacing added so sliders have room (artboard px): 04 volume `margin-bottom: 10px`; 10 scrubber `margin-top` 10 → 19; 31 play button `margin-bottom` 2 → 12 and scrubber `margin-top: 12px`; 46 fader `margin-top: 12px` and pad/fader column gap 8 → 14.
- Contrast (axe): 04 AUTO/ECO text (#5a6475, active #1d4ed8); 05 cyan glow moved top-centre (as on the slide) away from the weather header, darker card back; 34 Explode button #0369a1; 46 TRIG label dark on orange.
- Label in name (axe, WCAG 2.5.3): 05 card button is named by its visible text; 45 blur tile and 46 waveform button names contain their visible text. App shell: the header logo link had no name at 375 px (text is now `sr-only` below `sm`); detail palette swatches use their visible text as name, with the copy action in `title`.

**Measured effective targets (screen px, real hit testing)**
- 768 px: every control in all 10 previews ≥ 44×44.
- 1440 px: all ≥ 44×44 except 05 Tue/Wed/Fri radios (41×76).
- 375 px (preview scale ≈ 0.78): all ≥ 24×24 (WCAG 2.5.8 AA). Still under 44 because controls sit closer than 44 px on the slide layout:
  - sliders (full width): 04 volume 28 tall, 10 scrubber 27, 31 scrubber 28, 46 fader 28
  - 05 Tue/Wed/Fri radios 25×46 · 10 chips 40–41×45 · 31 sidebar tabs 45×33, transport play 35×45 · 45 1W/1M radios 27×45 · 46 HOLD 64×33
  - 46 Power is now 60×43 (was 60×20).
- WCAG 2.5.5 (AAA, 44×44) is met at 768 px but not fully at 375 px; reaching it would need the slide compositions spaced out further.

**Automated-check caveat**
- One verified axe false positive, filtered in the test by element: style 10's "Slide Visual" toggle is reported as low contrast against the preview's blue glow; the stage clips that glow (confirmed with `elementsFromPoint` and a screenshot).

**Needs manual testing (not done)**
- Screen reader pass (NVDA / VoiceOver) through the dialog and each preview.
- Real touch devices (automated checks click with a mouse in desktop Chromium at mobile width).
- Firefox / Safari: tests run in Chromium only; the `::-moz-range-*` styles are unverified.
- Text contrast over blurred glass is only as good as axe's background detection.

### Glassmorphism colour

Preview blobs use `#7c3aed` (source palette "Violet") and `#06b6d4` ("Cyan"); the unsupported magenta `#D946EF` is gone. Source data unchanged. Visually checked against `public/images/style-05.png`: the slide image itself shows a magenta/pink glow top-right that the extracted palette does not list, so the preview is less pink than the slide by design.

### Visual deviations from the slides (see comparison sheet)

- 01: slide shows a music player and a calculator; preview builds the music player only.
- 04: close match; volume slider moved into the player card.
- 05: no magenta glow, no Weekly Rainfall card, no reflections, no extra sliders; 74° instead of 72°.
- 06: slide is a 3D phone mockup; preview is a flat clay card with the same content.
- 10: slide has three tab pills; preview has five material chips with a caption.
- 18: close; adds Rotate Y / Tilt X sliders.
- 31: slide sidebar has 5 icons, preview 4; no "detached capsule window handle" caption.
- 34: footer shows selection status and an Explode button instead of the slide's angle/affordance captions.
- 45: no "Interact with frosted container" button; adds chart-range radios and Hide; APY figure differs.
- 46: close; no footer spec line.

### Screenshots

`docs/screenshots/phase-2b/`: `comparison-sheet.jpg` (Slide Visual vs Live CSS, all registered previews — 29 after batch 3; JPEG since batch 3, 6.1 MB instead of 15.7 MB as PNG), `live-NN.png` (one per preview), `gallery-desktop-1440.png`, `gallery-mobile-375.png` (all live cards switched on), `detail-06-*.png`, `detail-38-*.png` and `detail-30-*.png` (one per batch; desktop 1440 / mobile 375).
Regenerate: `npm run capture:previews` (builds, serves `dist/` on port 4174 itself, writes the files; script `scripts/capture-previews.mjs`).

## Phase 2B batch 2 — Bold, Retro & Expressive live previews

Verified 2026-11-19. Same architecture and rules as batch 1 (CSS Module per preview, scaled artboard, hit-area extender, track pseudo-elements for sliders). Total live previews: **20**; image-only: **30**.

| # | Style | Main interactions (all keyboard-operable) |
|---|---|---|
| 07 | Neo-Brutalism | sidebar navigation (`aria-current`), metric cards as radios driving the chart, Refresh, Log out / Log in; hard shadows collapse on press |
| 12 | Maximalism | pass-tier radios (Day / Weekend / VIP) driving the vibrancy meter, Get passes (cart count), stage cycle (A/B/C + BPM) driving layer depth and the spectrum line; scrolling ticker |
| 15 | Y2K / Retro Web | previous / next track, Play and Pause (silent simulation: the clock advances, no audio), seek slider, volume slider, EQ preset cycle, Bass Boost toggle; EQ bars animate while playing |
| 21 | Pixel Art / 8-Bit | equipped-item radios changing ATK/DEF, START spends (or with the mana gem refills) MP shown on a segmented meter, CRT scanline toggle |
| 33 | Corporate Memphis | 3-step onboarding: Get Started / Next / Finish, Back, progress bar + "Step n of 3", Start over; illustration changes per step |
| 36 | Acid Graphics | section switch (System / Disrupt / Rave) swapping the headline, BPM cycle, distortion level (skew), RGB-offset level (chromatic text shadow) |
| 38 | Windows 95 | tabs (General / Hardware / Performance), Minimize and restore from the taskbar, Close / Cancel and reopen from "My PC", OK, active vs inactive title bar, window drag by title bar with arrow-key alternative (10px steps, clamped to the desktop) |
| 39 | Playful / Gamified | boost radios, Continue quest adds XP (Sprint doubles it), level-up raises level + streak with a bump animation and a status message, Reset |
| 42 | Pop Art / Comic | edition radios, sound-effect starburst (BOOM! / POW! / ZAP! / WHAM!), Buy now updates the speech bubble |
| 49 | Kawaii / Pastel | Pet Mochi (hop + happiness), Feed snack, Log habit (hydration), level-up when both bars fill, Cozy mode toggle, routine start/pause |

### Verification (2026-11-19)

| Check | Result |
|---|---|
| `npm run typecheck` | 0 errors |
| `npm run build` | ok — JS 299.6 kB (95.0 kB gzip), CSS 29.3 kB (6.6 kB gzip); each preview its own chunk (2–5 kB) |
| `npm test` (Vitest) | 30/30 pass (3 files; the CSS-scoping test now covers 20 stylesheets) |
| `npm run validate:data` | 50 styles, 0 errors, 1 warning (style 5 swatch); 11/11 negative tests |
| `npm run test:e2e` (Playwright, Chromium, 375/768/1440) | 172 pass, 2 skipped (58 tests × 3 viewports; the 375-only layout test is skipped at 768/1440) |

Test changes: `LIVE_IDS` moved to `tests/e2e/fixtures.ts` (20 ids, shared); 10 new pointer + keyboard cases; a Win95 pointer-drag test (moves, stays clamped); the a11y suite (target size by hit testing, no overlap, Tab + visible focus, axe WCAG 2.2 AA) now runs for all 20 previews; the slider test also covers 15's seek bar; "the other 30 styles stay image-only". Unchanged and still passing: gallery search, categories, theme persistence, clipboard, CSS-leak probe, console-error guard.
Stability: Playwright now runs with 4 workers and a 10 s expect timeout. With the default 6 workers the heavier suite starved the preview server on this machine (lazy chunks took > 5 s; failures disappeared when run alone). The per-preview a11y test is marked `test.slow()`. No assertion was loosened.

### Accessibility (automated, real hit testing)

- 768 px: every control in all 10 new previews ≥ 44×44, except 12's tilted "Weekend" pass (42 tall, rotated −3°).
- 1440 px: all ≥ 44×44 except 12 "Weekend" (39 tall) and 15 seek bar (41 tall).
- 375 px: all ≥ 24×24 (WCAG 2.5.8 AA). Under 44 at this width: 07 nav items 66×29; 12 "Weekend" 74×42; 15 seek bar 26 tall, volume 28 tall, Pause 43×45; 36 "System" tab 41 wide; 38 Minimize 27 wide; 42 "Collector" 37 tall.
- axe-core WCAG 2.2 AA: 0 violations on all 10 new detail views; no new exclusions (the single batch-1 exclusion for style 10 is unchanged).
- Built in from the start: visible `:focus-visible` outline on every control, accessible names that contain the visible text, no drag-only action (38 has arrow keys), no initially-disabled controls hiding from Tab, motion limited to CSS animations/transitions that the app's global `prefers-reduced-motion` rule turns off.
- Not done: screen reader pass, real touch devices, Firefox/Safari (see batch 1 list).

### Visual deviations from the slides (see comparison sheet)

- 07: flat, not the slide's perspective tilt; transactions table and sticker icons left out; chart is bars only.
- 12: pass-tier chips replace the Collage Zone bullet list; title box shortened; hero copy on dark plates for contrast.
- 15: window buttons (– □ ✕) are decorative; Play and Pause are separate keys as on the slide; no surround chip.
- 21: no Unicode emoji item icons (⚔ ⛨ ◆ glyphs instead); stats line replaces "CLASS: PALADIN • RANK S".
- 33: figures are simplified CSS shapes (no arms/hair), illustration varies per step; secondary button is "Back" instead of "Take Tour".
- 36: sphere is three CSS ellipses; the chrome orb is replaced by the acid star; nav labels are buttons.
- 38: title bar shortened to "System.exe — Device Manager"; inactive title bar #707070 (not #808080) so white text keeps 4.5:1; title-bar buttons 30 px wide (Win95: 16 px) for touch.
- 39: CTA text is dark green on green (white on #58CC02 is 2.1:1); boosts are selectable; Reset added.
- 42: headline fill is ink black with pink/white offsets (the slide uses pink/white fills, which fail contrast on yellow); edition chips added.
- 49: bunny drawn with CSS shapes; Cozy mode is a toggle; routine button toggles.

## Phase 2B batch 3 — Modern SaaS & Dashboards live previews

Verified 2026-11-19. Same architecture and rules as batches 1–2 (CSS Module per preview, scaled artboard, hit-area extender, lazy chunk per preview, local React state only, deterministic data, no new dependencies; charts are inline SVG or CSS). Total live previews: **29**; image-only: **21**.

| # | Style | Main interactions (all keyboard-operable) |
|---|---|---|
| 03 | Material Design | FAB adds sample tasks (real local action, stops at six rows with a status message), tasks toggle done/undone (`role=checkbox`), filter chips All / Active / Done, ring + linear progress and the daily-goal bars follow the done count |
| 08 | Bento UI | four KPI tiles are selectable compartments that drive the 2×2 hero (value, delta, SVG area chart), 7D / 30D range, Share / Export add entries to the Recent Activity tile |
| 14 | Cyberminimalism | inline command bar (`combobox` + `listbox`, `aria-activedescendant`): search filters 5 actions, ↑/↓ moves the active row (three-row window follows it), Enter runs it, Esc clears the query; ⌘K / Ctrl+K focuses the bar only while focus is inside the preview; actions change state (deploy / roll back version, secrets age, telemetry stream); cluster Pause / Resume; result in a `status` card |
| 29 | Data-Dense Analytics | 1H / 24H / 7D range, four KPI cards (radios) with delta badges and sparklines, selected metric drives the detail chart (min / max / last), sortable table (`aria-sort` on the column header, toggles descending/ascending) whose req/s follow the range |
| 30 | Command-First | spotlight palette (`role=dialog`, combobox + grouped listbox): opens from the trigger or ⌘K / Ctrl+K inside the preview, search, ↑/↓, Enter runs and closes, Esc closes; focus moves to the input on open and back to the trigger on close; commands change state (new issue number, workspace switch, light/dark theme) and the result shows behind the palette |
| 32 | Flat 2.0 | Monthly / Annual billing, Starter / Pro / Team, seat stepper, order summary with discount and total recomputed live, Upgrade → local confirmation ("Demo only — no payment was taken.") → Change plan |
| 37 | Terminal / CLI | command input with fixed whitelist interpreter (`help`, `about`, `status`, `whoami`, `theme [green|amber]`, `history`, `echo`, `clear`; anything else is "command not found"), ↑/↓ history, output in a `role=log`; nothing typed is evaluated or executed (unit-tested) |
| 47 | Heatmap / Telemetry | 28 heatmap cells (buttons, `aria-pressed`, label with date, value and level) select a day → detail panel with value and % vs average; Last / Prior 28-day dataset; 4 funnel stages selectable → footer shows stage share and drop-off; bottleneck computed from the data; "DEMO DATA" badge; numeric legend for the five levels |
| 48 | Modular Masonry | CSS multi-column wall of 7 gradient cards, category filters incl. Saved (n), caption buttons select a card (artwork click selects too), ♥ Save toggles per card, footer shows the selected card's details and save count |

### Verification (2026-11-19)

| Check | Result |
|---|---|
| `npm run typecheck` | 0 errors |
| `npm run build` | ok — JS 300.9 kB (95.6 kB gzip), CSS 29.3 kB (6.6 kB gzip); each preview its own chunk (largest 29 at 5.3 kB) |
| `npm test` (Vitest) | 42/42 pass (4 files; new: the terminal interpreter; the CSS-scoping test now covers 29 stylesheets) |
| `npm run validate:data` | 50 styles, 0 errors, 1 warning (style 5 swatch); 11/11 negative tests |
| `npm run test:e2e` (Playwright, Chromium, 375/768/1440) | 226 pass, 2 skipped (76 tests × 3 viewports; the 375-only layout test is skipped at 768/1440) |

Test changes: 9 new pointer + keyboard cases (state changes asserted on ARIA state and visible text; 30 also checks focus moves to the input and back to the trigger, and that Esc closes the palette but not the detail dialog; 14 checks the scoped Ctrl+K; 29 checks `aria-sort` and row order; 37 checks history recall and an unknown command); `LIVE_IDS` has 29 ids, so the a11y suite (hit-tested target size, no overlap, Tab reach + visible focus, axe WCAG 2.2 AA), the 375 px no-overflow test, the Live CSS toggle test, the CSS-leak probe and "the other 21 styles stay image-only" all cover the new previews. Vitest: `37-terminal-commands.test.ts` (fixed commands, theme switch, shell/JS-looking input is reported, never run).
Stability: workers unchanged (4). The 375 px loop test (opens all 29 previews) is now `test.slow()`: 14 s alone, it passed the 30 s default under full parallel load once. `capture:previews` retries a preview once if its lazy chunk misses the 30 s window (happened intermittently on this machine).
App change: `PreviewStage` now also marks inputs it measured with `data-hit` (inputs render no `::after`), so the a11y suite's settle check works for a preview whose only control is a text input (37).

### Accessibility (automated, real hit testing)

- 768 px: every control in all 9 new previews ≥ 44×44 effective.
- 1440 px: all ≥ 44×44 except the 47 heatmap cells in weeks 2–4 (44×40: 4 px gaps between rows).
- 375 px: all ≥ 24×24 (WCAG 2.5.8 AA). Under 44 at this width: 03 task rows 33–42 tall; 08 range buttons 37×45; 29 range buttons 29–44 wide × 35 tall, sort headers 44 tall but 41 wide; 47 heatmap cells 27×25 to 27×44 and dataset buttons 40 tall; 48 filter chips 36–37 tall, Save pills 44×29–33, captions 30–34 tall.
- axe-core WCAG 2.2 AA: 0 violations on all 9 new detail views; no new exclusions. Fixed during the batch: palette close button name now contains its visible "Esc"; masonry artwork kept ≥ 34 px tall so each Save pill keeps 24 px spacing from its caption (axe `target-size`).
- Command palettes: combobox with `aria-expanded`, `aria-controls`, `aria-activedescendant`; options are not Tab stops (one Tab stop per palette, arrow keys inside); hover selects only on real mouse movement, so a palette opening under a resting pointer keeps its keyboard selection. Esc is handled inside the preview and does not close the app's detail dialog. Shortcuts are bound on the preview root, so the gallery search and other app inputs are unaffected.
- Heatmap: every cell is a Tab stop (28), each with a full text alternative; the a11y Tab loop reaches all 34 controls. Arrow-key grid navigation is not implemented (documented limitation).
- Not done: screen reader pass, real touch devices, Firefox/Safari (see batch 1 list).

### Visual deviations from the slides (see comparison sheet)

- 03: flat, not the slide's tilted phone mock-up; two-column task dashboard; no bottom navigation bar.
- 08: flat 4×3 grid instead of the slide's isometric scatter; map, integrations and second KPI card left out; activity rows are generic avatars.
- 14: five actions behind a three-row window (the slide shows three); status card shows the last command result instead of the static "ELECTRIC INDIGO" text.
- 29: KPIs in one row of four (slide: 2×2) to make room for the selectable detail chart and a fourth table row; load column shows bar + percent.
- 30: palette starts open as on the slide; two command groups (slide: one); light theme is an added state.
- 32: plan tabs, seat stepper and order summary replace the slide's static revenue / conversion / "pillars" cards; Docs / Log in buttons left out.
- 37: banner box and session lines follow the slide; the JSON block is one output line; cursor is the native caret, not a blinking block.
- 47: heatmap and funnel side by side (slide: stacked) so cells and stages keep 24 px targets at 375 px; bottleneck is computed (step 3 → 4 with this data, the slide says 2 → 3).
- 48: light shell from the palette (#FAFAFA / #FFFFFF / #18181B) instead of the slide's dark frame; gradients stand in for photos; 7 cards.

## Phase 2B batch 4 — Minimal & Typographic live previews

Verified 2026-11-20. Same architecture and rules as batches 1–3. Total live previews: **36**; image-only: **14**.
Built 2026-11-19; that session was interrupted during screenshot capture, before verification, docs and commit. Recovered and finished 2026-11-20 without re-implementing the previews.

| # | Style | Main interactions (all keyboard-operable) |
|---|---|---|
| 02 | Flat Design | Week / Month radios redraw the activity bar chart (labelled `img`); bottom nav Activity / Tasks / Inbox; task checkboxes drive the Tasks count and the Progress bar (`progressbar`); Add task; All / Active / Done filter; Inbox "Mark n as read" → "All caught up" |
| 11 | Minimalism (Swiss) | Next project cycles four projects; "+ Project info" expands (`aria-expanded`); Index / Read radios switch to a numbered project index whose entries open that project; nested `<article>` replaced by `<section>` (the gallery card is the only `article`) |
| 17 | Bold / Kinetic Typography | compositions 04 / 07 / 11 (radios) swap the three-line headline; each word is a button that emphasizes it (red, tracked); Stack / Stagger arrangement; Enter exhibition → room list → back to cover |
| 23 | Editorial / Magazine | A− / A+ text size (four steps), Columns / Focus reading mode, Save toggle (`aria-pressed`) with saved count, issue radios 01–03 and the "Next:" link change the article |
| 25 | Monochrome / Noir | four frames (buttons) select the focused frame; View frame → focused `img` view with Next frame; Image info expands (`aria-expanded`); INVERT `switch` inverts the whole page |
| 41 | Japanese Zen / Wabi-Sabi | Usucha 3′ / Koicha 5′ / Zazen 10′ radios; Begin ritual starts a real countdown; Pause / Resume; Reset; ring is a `progressbar` with `aria-valuetext`; state announced in a `status` region |
| 43 | Kinetic / Variable Font | Weight (300–900) and Width (100–125 %) sliders drive real `font-variation-settings`; Heavy / Kinetic / Glyphs specimens; Animate `switch` (breathing wght/wdth loop; off under reduced motion, with a visible note); Reset; footer shows the live `font-variation-settings` value |

### Fonts

- 43 ships its own font: `src/components/previews/styles/fonts/axis-sans-var.woff` (25 kB), a Latin subset of Encode Sans [wdth 75–125, wght 100–900] v3.002 made with fontTools. Renamed "Axis Sans Subset" because "Encode Sans" is an OFL Reserved Font Name; the license sits next to it (`fonts/OFL.txt`). WOFF, not WOFF2 (no brotli module in the build environment). Loaded by `@font-face` only inside the 43 lazy chunk. The e2e test "weight and width axes are real" measures glyph width at different wght/wdth values, so a fallback font fails it.
- All other batch 4 previews use system stacks; no web fonts are fetched. On Windows: "Helvetica Neue" (11, 17, 25) falls back to Arial, "Inter" to Segoe UI / Arial, "Playfair Display" (23 headline) to Georgia, "JetBrains Mono" to Consolas.

### Verification (2026-11-20, final code)

| Check | Result |
|---|---|
| `npm run typecheck` | exit 0, 0 errors |
| `npm run build` | exit 0 — JS 301.9 kB (95.9 kB gzip); each preview its own chunk (largest 02 at 6.2 kB) |
| `npm test` (Vitest) | exit 0 — 49/49 pass (4 files; the CSS-scoping test covers 36 stylesheets) |
| `npm run validate:data` | exit 0 — 50 styles, 0 errors, 1 warning (style 5 swatch); 11/11 negative tests |
| `npm run test:e2e` (Playwright, Chromium, 375/768/1440) | exit 0 — 280 pass, 2 skipped (94 tests × 3 viewports; the 375-only layout test is skipped at 768/1440) |

Test changes: 7 new pointer + keyboard cases (state asserted on ARIA state and visible text), the style 43 axis test, 43 Weight / Width slider use from the enlarged area; `LIVE_IDS` has 36 ids, so the a11y suite, the 375 px no-overflow test, the Live CSS toggle test, the CSS-leak probe and "the other 14 styles stay image-only" cover the new previews.
Stability (measured, not contention): the CSS-leak test and the Live CSS toggle test click every live card in turn and are linear in preview count; with 36 previews both exceed the 30 s default even alone at one worker (toggle test ~33–39 s), so both are `test.slow()`. `card(id)` in `tests/e2e/fixtures.ts` now finds the card by its `aria-labelledby` heading instead of `article.nth(id - 1)`, which a live preview containing `<article>` (48) silently shifts.

### Capture script recovery (`scripts/capture-previews.mjs`)

- 2026-11-19: two runs ended in `TimeoutError` (the first after all 36 live shots, before the comparison sheet; the second in the style 23 detail step, also on its retry). The sheet, gallery and detail shots were left at batch 3.
- 2026-11-20 diagnosis: style 23 opens, mounts and screenshots in 0.2–0.5 s (three runs), and the unchanged script then completed (exit 0, 59 s). The 2026-11-19 failures did not reproduce and the transcript shows no concurrent job, so the exact stall is not established. One real defect of the same shape was found: the card locator `article.nth(id - 1)` (script and test fixture) points at the wrong card once a live card contains `<article>`; that is what made the timing probe stall at "article nth(22)" on 2026-11-19 before 11's nested `<article>` was removed.
- Changes: cards located by `aria-labelledby`; the fixed 500 ms waits replaced by explicit readiness (preview artboard has mounted children, no Suspense placeholder, `document.fonts.ready`; in the gallery, all 36 card previews mounted); each phase is named, so a failure prints e.g. `capture failed during: live 23 (attempt 2)`, saves `.tmp/capture-failure.png` (git-ignored) and exits non-zero. The one retry per preview stays; the script still serves `dist/` itself on port 4174 (`strictPort`, closed in `finally`). Two runs in a row: exit 0 both (56 s, 59 s), all 47 files rewritten.

### Accessibility (automated, real hit testing)

- 768 px: every control in all 7 previews ≥ 44×44 effective.
- 1440 px: all ≥ 44×44 except 23 issue radio "02" (42×44).
- 375 px: all ≥ 24×24 (WCAG 2.5.8 AA), no overlap. Under 44 at this width: 17 composition chips 29×45; 23 A+ 28×44, Focus 36×44, issue radios 25–41×44; 25 INVERT switch 63×33; 43 Weight / Width sliders 120×31 / 120×28. 02, 11 and 41 are all ≥ 44.
- axe-core WCAG 2.2 AA: 0 violations on all 7 detail views; no new exclusions. Fixed during the batch: 23 issue-radio contrast and the A− / A+ accessible names (now contain the visible text).
- Reduced motion: the app's global `prefers-reduced-motion` rule cuts all transitions and animations; 43 also stops its Animate loop and says so. 41's timer is a countdown, not motion.
- Not done: screen reader pass, real touch devices, Firefox/Safari (see batch 1 list).

### Visual deviations from the slides (see comparison sheet)

- 02: palette teal / rose / blue from the source data (slide: softer teal and coral); one bar chart with Week / Month instead of line + bar icons; Quick Actions card replaced by a bottom nav (Activity / Tasks / Inbox); fewer confetti shapes; no phone side buttons.
- 11: Arial fallback for Helvetica Neue gives a heavier headline; accent rose `#E11D48` (palette) where the slide uses blue; Index / Read tabs added; "Read document" became Next project + Project info; body copy shortened.
- 17: the slide is dark with cyan accents, the source palette is light (`#FAF8F5` / `#0A0A0A` / `#EF4444`); the preview follows the palette. Nav replaced by composition chips 04 / 07 / 11; Stack / Stagger added.
- 23: tool row (text size, reading mode, Save) added under the masthead; the deck is one line with an ellipsis; both columns fade out at the bottom (copy continues, like a page), which cuts the pull quote; footer is issue tabs + saved count + next link; the dark figure card has no red square / rule.
- 25: the slide's wireframe placeholders are CSS-drawn monochrome "photos"; four frames (slide: three); Specification PDF → Image info; INVERT switch in the footer.
- 41: body copy replaced by tea chips; metrics card replaced by the timer status card; the ring shows progress; no orange stroke in the bowl.
- 43: LIGHT and MEDIUM share one row (slide: stacked) to fit two real sliders (slide: one); preset chips, Animate and Reset added; footer shows the live `font-variation-settings`.

### Screenshots

`docs/screenshots/phase-2b/`: `comparison-sheet.jpg` (all 36, Slide Visual | Live CSS, 2880×36050 JPEG), `live-NN.png` × 36, `gallery-desktop-1440.png`, `gallery-mobile-375.png`, `detail-{06,30,38,43}-{desktop-1440,mobile-375}.png`. All regenerated 2026-11-20 from the final code.

## Phase 2B batch 5 — Atmospheric & Futuristic live previews

Verified 2026-11-20. Same architecture and rules as batches 1–4 (CSS Module per preview, scaled artboard, hit-area extender, lazy chunk, local state, deterministic data, no new dependencies). Total live previews: **42**; image-only: **8**.

| # | Style | Main interactions (all keyboard-operable) |
|---|---|---|
| 09 | Aurora UI (Mesh Gradient) | Borealis / Dusk / Lagoon arrangements move and recolour four colour bands; Glow slider (20–100 %) sets their opacity; Generate / Analyze / Deploy radios switch the hero copy; Ambient `switch` starts a slow drift; Reset |
| 16 | Cyberpunk / Sci-Fi HUD | three module rows are `switch`es (THRUST / SHIELD / WARP: bar and value go OFFLINE, header turns DEGRADED n/3, power and link status follow); 5 / 10 / 20 KM radar range shows the contacts inside it (radar is a labelled `img`); CH-A / B / C channels swap the spectrum, frequency and sampling rate; OVERDRIVE `switch` changes every value, the accent colour and sweep speed. All values are fixed tables, no randomness |
| 22 | Vaporwave / Synthwave | Play / Pause (silent simulation, clock advances once a second, continues with the next track at the end), Previous / Next track, Seek slider (`aria-valuetext` "m:ss of m:ss"), visualizer Bars / Sun / Grid (each animates only while playing), Neon `switch` (all glow off), Volume slider scales the visualizer; status says ON AIR / PAUSED |
| 24 | Scrollytelling / Narrative | the chapter column is its own scroll container (wheel, touch, or arrow / Page keys once focused; `role=region`, `tabindex=0`); scroll position → active chapter and overall progress (`24-story.ts`, unit-tested); the stage beside it stays pinned and follows: frame number, KPI, progress readout, chart line drawn to the progress, scrub line, highlighted chapter point; ↑ / 01 / 02 / 03 / ↓ buttons scroll to a chapter (`aria-current="step"`) |
| 28 | Kinetic / Motion-First | three cards (radios) — the selected one lifts and scales with the current curve; Spring / Smooth / Snappy change curve and duration (header shows tension / damping); Intensity slider sets lift and scale; Trigger Motion replays a staggered pop (count shown); Reset |
| 35 | Holographic / Iridescent | pointer move or drag over the card tilts it (rotateX / rotateY written to custom properties, no React re-render); ← ↑ ↓ → buttons tilt it by 6° from the keyboard; Flip (`aria-pressed`) shows the back; Foil `switch`; VIP / Creator variants; Reset returns it flat, front side, foil on; tilt and sheen angle shown in the footer |

### CSS effects

- 09: colour bands are radial gradients fading to transparent (no `filter: blur`); arrangements move them with `transform` (0.9 s ease), Ambient drifts them with the separate `translate` property, Glow is the opacity of the band layer.
- 16: the source's 45° `clip-path` corner on panels; neon is `box-shadow`; radar sweep is a rotating SVG group.
- 22: sun = gradient with stripe overlay; perspective floor = two repeating gradients on a plane tilted `rotateX(62deg)`; visualizers are `transform: scaleY`, `background-position` loops.
- 24: `overflow-y: auto` + `overscroll-behavior: contain` + `scroll-behavior: smooth` + `scroll-snap-type: y proximity` on the chapter column; chart line uses `pathLength` + `stroke-dasharray`.
- 28: the source spring curve `cubic-bezier(0.34, 1.56, 0.64, 1)`; selection animates `transform`, Trigger animates `translate`, so they never fight; curve, duration, lift and scale are custom properties.
- 35: the source pastel gradient as a 1.5 px gradient border (`padding-box` / `border-box`) plus a soft band whose angle follows the tilt; `preserve-3d` + `backface-visibility` for the flip. A stylised effect, not a light simulation (said on the card's back).

### Reduced motion

The app's global rule shortens every transition and animation to ~0 ms. It does not stop infinite loops (they would flicker), so 09 (Ambient drift), 16 (radar sweep) and 22 (visualizers) remove their loops under `prefers-reduced-motion: reduce`; 09 says so on screen. 28 keeps every state change (selected card still lifted, Trigger still counted) but instantly, and its footer says "REDUCED MOTION: INSTANT STATE CHANGES". 24 scrolls to a chapter without smooth scrolling. 35's tilt still follows the pointer or keys, without easing. Tested in "batch 5: reduced motion removes looping animation and keeps every state change".

### Verification (2026-11-20, final code)

| Check | Result |
|---|---|
| `npm run typecheck` | exit 0, 0 errors |
| `npm run build` | exit 0 — JS 302.8 kB (96.3 kB gzip); each preview its own chunk |
| `npm test` (Vitest) | exit 0 — 57/57 pass (5 files) (new: `24-story.test.ts`, scroll position → chapter / progress; the CSS-scoping test covers 42 stylesheets) |
| `npm run validate:data` | exit 0 — 50 styles, 0 errors, 1 warning (style 5 swatch); 11/11 negative tests |
| `npm run test:e2e` (Playwright, Chromium, 375/768/1440) | exit 0 — 337 pass, 2 skipped (113 tests × 3 viewports; the 375-only layout test is skipped at 768/1440). First full run: 3 failures of the CSS-leak test — not a leak: its probe read the first button of card 9 by `article:nth-of-type(9)`, assumed image-only; now 9 is live, so the probe hit the Aurora feature button. Probe now picks the first image-only card by id. |

Test changes: 6 new pointer + keyboard cases (state asserted on ARIA state, visible text and computed style: 09 band colour/position, 16 module offline / overdrive values / radar contacts, 22 clock advancing, track change, seek by keyboard, 24 chapter by button / Page Down / arrow, 28 lift and pop animation, 35 pointer tilt, flip, variant, keyboard tilt); "style 24: scrolling the chapter column (wheel) advances the story; the dialog does not scroll"; "style 35: dragging over the card tilts it; Reset returns it flat and to the front"; the reduced-motion test above; slider-from-enlarged-area tests for 09 Glow, 22 Seek, 22 Volume, 28 Intensity. `LIVE_IDS` has 42 ids, so the a11y suite, 375 px no-overflow, Live CSS toggle, CSS-leak probe and "the other 8 styles stay image-only" (now opens the first image-only style instead of a hard-coded 9) cover them. Workers unchanged (4).

### Accessibility (automated, real hit testing)

- 768 px: every control in all 6 previews ≥ 44×44 effective.
- 1440 px: all ≥ 44×44 except 09 Glow and 28 Intensity sliders (40 tall), 22 Seek (43 tall), 24 chapter buttons 01–03 (43 wide).
- 375 px: all ≥ 24×24 (WCAG 2.5.8 AA), no overlap. Under 44 at this width: 09 arrangement buttons 41–48×41–42, Glow slider 25 tall; 16 OVERDRIVE 57×37, range buttons 33–39 wide, module rows 29–32 tall, channel buttons 29–45×39; 22 Seek 26 tall, Volume 31 tall, transport and mode buttons 31–36 wide; 24 Previous 35 wide, chapter buttons 26 wide; 28 Intensity 25 tall; 35 tilt / Flip / Foil / VIP buttons 27–39 wide.
- axe-core WCAG 2.2 AA: 0 violations on all 6 detail views; no new exclusions.
- Fixed during the batch: 22 Seek too thin at 375 px (slider box and spacing enlarged); 16 OVERDRIVE's `clip-path` also clipped its enlarged hit area (removed from that button); 24 chapter buttons too narrow (column widened); 24's disabled ↑ / ↓ would have left the Tab order, so they use `aria-disabled` and clamp instead.
- 24: the chapter column is a focusable `region` (axe `scrollable-region-focusable`); the chapter buttons sit outside the scroll container, so every control is always visible and hit-testable. 35: every pointer action has a button; the tilt readout is not a live region (it would announce every pointer move).
- Not done: screen reader pass, real touch devices, Firefox/Safari (see batch 1 list).

### Visual deviations from the slides (see comparison sheet)

- 09: bands are softer and move with arrangement presets; the slide's two CTA buttons are the feature radios; controls bar added under the panel.
- 16: corner brackets around the frame left out; OVERDRIVE switch added in the header; radar range and channel buttons added; the spectrum has 28 bars (slide ~38).
- 22: player gains a second row (visualizer, Neon, volume); EQ bars over the horizon in Bars mode; "SILENT DEMO" label; mountains are flat silhouettes (no outline glow).
- 24: three chapters scroll one at a time (slide shows all three stacked, one active); nav row added under the column; ACTIVE badge left out; at 375 px the artboard scales as a whole, so the side-by-side layout is kept (no stacking needed).
- 28: cards sit in one row (slide: staggered on the trajectory); mode, intensity and Reset controls added; "Trigger Motion" lost its status dot.
- 35: the background bands and circle behind the card are left out; tilt pad, Flip, Foil, variants and Reset replace the single "Interact Foil Card" button; a back face added.

### Screenshots

`docs/screenshots/phase-2b/`: `comparison-sheet.jpg` (all 42, Slide Visual | Live CSS, 2880×42034 JPEG), `live-NN.png` × 42, `gallery-desktop-1440.png`, `gallery-mobile-375.png`, `detail-{06,30,38,43,24}-{desktop-1440,mobile-375}.png`. All regenerated 2026-11-20 from the final code (`npm run capture:previews`, exit 0, 67 s).

## Phase 2B batch 6 — Art & Heritage Movements live previews

Verified 2026-11-20. Same architecture and rules as batches 1–5. Total live previews: **50 of 50**; image-only: **0**. All six categories complete. This completes the previews only; the Style Playground customization is still future work.

| # | Style (exact name) | Main interactions (all keyboard-operable) |
|---|---|---|
| 13 | Bauhaus UI | Circle / Triangle / Square primitive radios reshape the hero form and the PRIMITIV / RATIO tiles; 2:1:1 / 1:1:2 grid radios mirror the composition (`grid-template-areas`) and change SCALE; Rotate cycles the three primaries across hero shape, system block and geometry block (ROT • BLAU • GELB readout) |
| 19 | Art Deco UI | two suites (radios), − / + nights (1–7), Reserve Suite (`aria-pressed`) with a confirmation line; changing suite or nights clears the confirmation; Emerald / Obsidian finish radios |
| 20 | Memphis Design UI | Explore UI cycles three headlines; Shuffle moves the confetti to another fixed layout (spring transition); Banana / Coral / Sky / Lilac accent radios recolour the card's hard shadow and the CTA |
| 26 | Organic / Biophilic UI | Rituals / Nature / Journal radios change headline, copy and badge; Reshape morphs both blobs between three 8-value organic radii; Our Flora `switch` shows / hides the plant; Clay accents `switch` swaps terracotta for moss across badge, buttons, feature card and footer |
| 27 | Paper / Craft Collage UI | Collect / Collected (`aria-pressed`) per card adds a stamp and updates the header count; "Edition / Coffee on top" radios bring a card forward; Straighten `switch` removes the tilt |
| 40 | Neoclassical / Luxury Heritage | I. Heritage Archive / II. Private Atelier radios; Enter Salon / Atelier (`aria-expanded`) opens a salon view of three pieces chosen by Roman numerals I–III; Return to hall |
| 44 | Low-Poly / Faceted Geometric UI | 24 / 36 / 54 planes radios rebuild the triangle mesh; Indigo / Cyan facet palette; Light angle slider (0–355°) re-shades every facet; readout of the plane count |
| 50 | Hand-Drawn / Sketchbook UI | stage radios (Raw Ideation → Wireframing → Ship It!) with the stage in the footer; three sticky-note checkboxes; Ship draft stays `aria-disabled` until all three are ticked, then reports "Draft shipped for review"; Highlighter `switch` |

### Architecture, CSS and typography

- One `.tsx` + `.module.css` per style, lazy registry entry, local state, deterministic data, no new dependencies, no timers in this batch.
- 13: the 4 px black structural rules are the grid gap over a black root (source: `border: 4px solid #111`, `2fr 1fr 1fr`); shapes are `border-radius` / `clip-path`.
- 19: the source's border + inset `outline-offset: -8px` double hairline, stepped corner brackets, a conic-gradient sunburst, diamond rules.
- 20: 3 px outlines and hard offset shadows (`box-shadow: 8px 8px 0 var(--accent)`); confetti dots, zig-zags (repeating gradient), chevrons and bars in CSS.
- 26: the source's 8-value organic `border-radius`, transitioned between presets; leaves are rotated ellipses.
- 27: cards tilted with `transform: rotate()`, masking tape, a dashed rubber stamp; the two cards overlap only in a strip without controls so the card underneath stays usable.
- 40: centred serif on alabaster with a double antique-gold frame.
- 44: SVG triangle mesh with stepped flat shading from a light angle, in `44-mesh.ts` (pure, unit-tested); the hero panel uses the source's skewed `clip-path` quad with a cyan edge, controls kept well inside it because `clip-path` also clips their enlarged hit areas.
- 50: the source's wobbly `255px 15px 225px 15px / 15px 225px 15px 255px` radii, graph-paper gradients, highlighter strokes.
- Fonts: nothing new bundled. Fallbacks on Windows: "Futura" → Century Gothic / Segoe UI (13); "Cinzel" (19) → Georgia; "Times New Roman" (40) as the source says; handwriting (50) "Segoe Print" → "Bradley Hand" → "Comic Sans MS" → cursive. Other systems will show their own fallbacks.
- Contrast fixes against the slide palette (text ≥ 4.5:1): 13 PRIMITIV value white instead of yellow on red; 40 gold text uses a darker gold (#7A6230); 26 terracotta text #964A33.

### Reduced motion

No preview in this batch loops. Its transitions (Memphis confetti spring, blob morph, card lift, Deco finish) become instant under the global reduced-motion rule; every state change still happens.

### Verification (2026-11-20, final code)

| Check | Result |
|---|---|
| `npm run typecheck` | exit 0, 0 errors |
| `npm run build` | exit 0 — JS 303.9 kB (96.7 kB gzip); each preview its own chunk |
| `npm test` (Vitest) | exit 0 — 68/68 pass (6 files) (new: "registers exactly the 50 source style ids" against `styles.json`; `44-mesh.test.ts`; CSS-scoping covers 50 stylesheets) |
| `npm run validate:data` | exit 0 — 50 styles, 0 errors, 1 warning (style 5 swatch); 11/11 negative tests |
| `npm run test:e2e` (Playwright, Chromium, 375/768/1440) | exit 0 — 388 pass, 2 skipped (130 tests × 3 viewports; the 375-only layout test is skipped at 768/1440); passed on the first full run |

Test changes: 8 new pointer + keyboard cases (state asserted on ARIA state, visible text and computed style); 44 Light angle slider from its enlarged area; "the other N styles stay image-only" replaced by "all 50 styles are live; every reference image still loads" (50 Live CSS toggles, every card image `src`, and an HTTP 200 `image/png` for each of the 50 reference images); the CSS-leak probe reads card 1's heading and View details button (no image-only card left). `LIVE_IDS` has 50 ids, so the a11y suite, 375 px no-overflow, Live CSS toggle and CSS-leak tests cover every style. Workers unchanged (4).

### Accessibility (automated, real hit testing)

- 768 px: every control in all 8 previews ≥ 44×44 effective.
- 1440 px: all ≥ 44×44 except 27 Collect buttons (79×38–43), 44 Light angle slider (42 tall), 50 one checklist row (42 tall).
- 375 px: all ≥ 24×24 (WCAG 2.5.8 AA), no overlap. Under 44 at this width: 13 primitive and grid buttons 27–43 wide; 20 accent swatches 27–33 wide; 26 Nature 39 wide; 27 Collect 41 tall; 44 plane buttons 27–31 wide, Light angle 26 tall; 50 stage 43 tall, checklist rows 25–40 tall.
- axe-core WCAG 2.2 AA: 0 violations on all 8 detail views; no new exclusions (three contrast failures found and fixed, listed above).
- 50: the disabled Ship button uses `aria-disabled` so it stays in the Tab order and announces why (status line).

### Visual deviations from the slides (see comparison sheet)

- 13: a control strip replaces the slide's "Primary form codes" footer row (the codes stay as a readout); the hero circle is the switchable primitive.
- 19: nights stepper and finish radios added in the middle row; the footer palette line is left out.
- 20: accent swatches and Shuffle added; "RETRO" tag left out; dark stage behind the card as on the slide.
- 26: Reshape / Our Flora / Clay accents replace "Explore Rituals" / "Our Flora"; nav links are radios; feature cards kept.
- 27: both cards are product cards with Collect (slide: one "Read dispatch" link, one Collect); stamp appears on collect instead of always.
- 40: the salon view (pieces I–III) is added behind Enter Salon.
- 44: the mesh is a regular 3-row grid with jitter (taller facets than the slide's free mesh); plane / palette / light controls replace "Explore facets" / "36 planes".
- 50: checklist and Ship flow replace the static sticky note and "100% Organic" badge; arrows are text glyphs; handwriting font depends on the OS.

### Screenshots

`docs/screenshots/phase-2b/`: `comparison-sheet.jpg` (all 50, Slide Visual | Live CSS, 2880×50014 JPEG, 8.9 MB), `live-NN.png` × 50, `gallery-desktop-1440.png`, `gallery-mobile-375.png`, `detail-{06,30,38,43,24,19}-{desktop-1440,mobile-375}.png`. All regenerated 2026-11-20 from the final code (`npm run capture:previews`, exit 0, 80 s). The gallery with every card on Live CSS reads as one coherent grid.

## Phase 2C-1 — Interaction & Accessibility Fixes

Verified 2026-11-21. Resolved all P1 interaction and accessibility findings from the Phase 2C audit without altering visual designs:

- **Style 35 (Holographic UI) mobile scrolling:** Switched `.scene` from `touch-action: none` to `touch-action: pan-y` and ignored touch pointer events in `onPointer` so vertical touch swipes over the card scroll the dialog naturally on mobile (`375px`), while mouse-move/hover/drag tilt on fine-pointer devices and keyboard tilt + Flip/Foil/Reset controls continue to work.
- **Style 47 (Heatmap Dashboard) keyboard navigation:** Replaced 28 separate Tab stops with a single roving-tabindex Tab stop (`tabIndex={0}` on the focused cell, `-1` on the other 27) and extracted `47-heatmap-nav.ts` (unit-tested in `47-heatmap-nav.test.ts`) supporting `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`, `Home`/`End` (row ends; `Ctrl+Home`/`Ctrl+End` grid ends), and `Enter`/`Space` to select a cell.
- **Radio-group keyboard semantics (34 previews, 46 `radiogroup` controls):** Audited all 50 previews; all 46 `role="radiogroup"` controls across 34 previews are genuine mutually-exclusive single-select groups. Added shared lightweight helper `src/components/previews/shared/radioGroup.ts` (`0.41 kB` chunk, `0.27 kB` gzip) and wired `onKeyDown={onRadioGroupKeyDown}` + roving `tabIndex={checked ? 0 : -1}` on every `role="radio"` button across all 34 previews. Verified via static + unit tests in `radioGroup.test.ts` and Playwright roving-tabindex assertions across all 50 previews.
- **Regression tests (`tests/e2e/a11y.spec.ts`):** Updated the per-preview Tab reachability check to respect roving tabindex and enforce single-`tabindex="0"` invariants on every `role="radiogroup"`. Added dedicated tests for Style 35 real CDP touch scroll at `375px` + keyboard tilt/flip/hover, Style 47 single-Tab-stop + Arrow/Home/End + Enter selection, representative radiogroup arrow-key wrapping across 5 previews, and `StyleDetail` native `<dialog>` focus trap + focus restoration on `Escape`.

### Verification (2026-11-21, final code)

| Check | Result |
|---|---|
| `npm run typecheck` | exit 0, 0 errors |
| `npm run build` | exit 0 — JS 304.0 kB (96.8 kB gzip), shared `radioGroup` chunk 0.41 kB (0.27 kB gzip) |
| `npm test` (Vitest) | exit 0 — 109/109 pass (8 files; new: `radioGroup.test.ts` [37 tests], `47-heatmap-nav.test.ts` [4 tests]) |
| `npm run validate:data` | exit 0 — 50 styles, 0 errors, 1 warning (style 5 swatch); 11/11 negative tests |
| `npm run test:e2e` (Playwright, Chromium, 375/768/1440) | exit 0 — 398 pass, 4 skipped (134 tests × 3 viewports; 2 mobile-375-only tests skipped at 768/1440); 0 axe WCAG 2.2 AA violations, no new exclusions |

## Phase 2C-2 — Cross-Browser & Simulated Mobile Touch Compatibility

Verified 2026-11-21. Installed Playwright Firefox and WebKit browsers and added a focused cross-browser + touch compatibility suite (`tests/e2e/cross-browser.spec.ts`, `npm run test:e2e:compat`) covering `firefox`, `webkit`, and `mobile-touch` (`375×812`, `hasTouch: true`, `isMobile: true`).

### Defects found & fixed
- **LightningCSS stripped standard `backdrop-filter` in production CSS (Styles 05, 10, 31, 45):** All four glassmorphism stylesheets declared `backdrop-filter` *before* `-webkit-backdrop-filter`. Vite 8's LightningCSS minifier treated the prefixed property as overriding the unprefixed one and dropped standard `backdrop-filter` from the production bundle, breaking frosted-glass blur in Firefox and Chromium while passing in WebKit. Reordered `-webkit-backdrop-filter` before `backdrop-filter` in `05-glassmorphism.module.css`, `10-liquid-glass.module.css`, `31-visionos.module.css`, and `45-obsidian-glass.module.css`; verified both declarations are emitted in `dist/assets/*.css` and computed `backdropFilter` resolves to `blur(...)` across Firefox, WebKit, and Chromium.
- **Playwright clipboard permissions scoping (`playwright.config.ts`):** Moved `permissions: ["clipboard-read", "clipboard-write"]` from global `use` to the three Chromium projects so Firefox and WebKit contexts initialize cleanly without unsupported-permission errors.

### Verified clean across Firefox, WebKit, and mobile-touch
- Custom range sliders (`::-moz-range-track` / `::-moz-range-thumb` and `::-webkit-slider-*`) on Styles 04, 10, 18, 31, 46 render with `appearance: none` and respond to keyboard/pointer updates.
- 3D transforms & perspective (Styles 18, 34, 35), variable font `wght`/`wdth` axes (Style 43) and typography (Styles 17, 23), and complex interactive controls (Styles 24, 30, 37, 38, 47) work with 0 console/page errors.
- Simulated mobile touch (`375px`, `hasTouch: true`): tap interactions on `StyleDetail` and previews (Styles 04, 47), vertical touch swipe over Style 35 card scrolls the dialog without trapping scroll, and zero horizontal overflow.

### Verification (2026-11-21, final code)

| Check | Result |
|---|---|
| `npm run typecheck` | exit 0, 0 errors |
| `npm run build` | exit 0 — JS 304.03 kB (96.76 kB gzip); all 4 glassmorphism CSS bundles emit both `-webkit-backdrop-filter` and `backdrop-filter` |
| `npm test` (Vitest) | exit 0 — 109/109 pass (8 files) |
| `npm run validate:data` | exit 0 — 50 styles, 0 errors, 1 warning (style 5 swatch); 11/11 negative tests |
| `npm run test:e2e` (Chromium 375/768/1440) | exit 0 — 398 pass, 4 skipped |
| `npm run test:e2e:compat` (Firefox + WebKit + mobile-touch) | exit 0 — 19 pass, 2 skipped (mobile-touch-only test skipped on Firefox/WebKit) |

## Phase 2C-3 — Targeted Visual Fidelity Improvements (9 Styles)

Verified 2026-11-21. Upgraded visual fidelity for the 2 major deviations (Styles 03, 08) and 7 "needs improvement" styles (01, 06, 17, 32, 37, 44, 48) while keeping all interactions, roving-tabindex keyboard nav, WCAG 2.2 AA contrast, hit targets, and CSS isolation intact:

- **Style 03 (Material Design):** Elevated `#F3EDF7` canvas, indigo gradient app bar, layered Material z-axis card elevation shadows, dual-tone indigo/amber progress ring and Daily Goals bar highlight, and a true circular amber Material FAB (`border-radius: 50%`).
- **Style 08 (Bento UI):** Fixed the overflowing `Project completion` gauge by converting it into a clean semi-circular arc gauge inside the dark tile; upgraded the 2×2 dark hero card with subtle horizontal gridlines and a dual-wave cyan/violet trend chart plus deeper tile elevation shadows.
- **Style 01 (Skeuomorphism):** Added pebbled dark leather texture with stitched dashed collar around the faceplate, richer specular brushed-aluminum sheen, knurled metallic rotary knob collars (`repeating-conic-gradient`), and a glass-glared backlit VU meter with a red peak arc.
- **Style 06 (Claymorphism):** Deepened dual opposing inset highlights/shadows and outer drop shadows across the main card, pastel gradient habit tiles, floating icon medallions, and lavender-trough coral-fill progress bar for stronger inflated 3D clay volume.
- **Style 17 (Bold / Kinetic Typography):** Tighter, heavier monumental display stack (`70px`, `line-height: 0.84`, `font-weight: 900`) and slimmer architectural composition chips and `Stack / Stagger` pill control.
- **Style 32 (Flat 2.0):** Tinted `#EFF6FF` blue active pills, green `#DCFCE7` savings pill badge, and an `INCLUDED CAPACITY` progress card filling the Order Summary hierarchy.
- **Style 37 (Terminal / CLI Retro UI):** Eliminated dead vertical gap below the banner box, added dual-tone green/amber banner text, framed JSON output in a dashed phosphor border, and replaced the grey input box with a transparent CRT prompt line.
- **Style 44 (Low-Poly / Faceted Geometric):** Alternated triangle diagonals and perimeter vertex jitter in `44-mesh.ts` for a genuine irregular crystalline mesh (same 24/36/54 plane counts), made the skewed panel semi-translucent with `-webkit-backdrop-filter` + `backdrop-filter` and a cyan-indigo edge gradient so facets show through cleanly.
- **Style 48 (Modular Masonry / Waterfall UI):** Added staggered artwork heights (`34–58px`), high-contrast dark slate (`#18181B`) + crisp light/indigo card mix, and crimson `#BE123C` `♥ Save` pill badges.
- **Test stability (`tests/e2e/cross-browser.spec.ts`):** Replaced fixed 150ms post-swipe wait with a deterministic `scrollTop` stability poll before tapping `Close details` in `mobile-touch`.
- **Screenshots:** Regenerated all 50 live screenshots and `docs/screenshots/phase-2b/comparison-sheet.jpg` (`npm run capture:previews`, exit 0); visually inspected all 9 updated live PNGs.

### Verification (2026-11-21, final code)

| Check | Result |
|---|---|
| `npm run typecheck` | exit 0, 0 errors |
| `npm run build` | exit 0 — JS 304.03 kB (96.77 kB gzip) |
| `npm test` (Vitest) | exit 0 — 109/109 pass (8 files) |
| `npm run validate:data` | exit 0 — 50 styles, 0 errors, 1 warning (style 5 swatch); 11/11 negative tests |
| `npm run test:e2e` (Chromium 375/768/1440) | exit 0 — 398 pass, 4 skipped (0 axe WCAG 2.2 AA violations) |
| `npm run test:e2e:compat` (Firefox + WebKit + mobile-touch) | exit 0 — 19 pass, 2 skipped |

## Phase 2C-4 — Image Thumbnails, ESLint & Lighthouse Performance Pass

Verified 2026-11-21. Completes Phase 2C quality hardening:

- **WebP gallery thumbnails (`scripts/generate-thumbnails.py`, `npm run generate:thumbs`):** Generated 50 responsive `480×385` WebP thumbnails (`public/images/thumbs/style-01.webp` … `style-50.webp`, Pillow Lanczos, quality 82) without modifying the 50 original full-res PNGs (`969×777`). Total gallery image payload dropped from **7,034.6 kB** (140.7 kB avg PNG) to **711.1 kB** (14.2 kB avg WebP) — **89.9% smaller**.
- **Card image delivery (`StyleImage.tsx`, `StyleCard.tsx`):** Gallery cards render `<picture><source srcSet="/images/thumbs/style-NN.webp" type="image/webp" /><img src="/images/style-NN.png" ... /></picture>` with `loading="lazy"`, `decoding="async"`, explicit `width`/`height` + `aspect-[969/777]` (CLS = 0), and `fetchPriority="high"` + eager loading on the top 4 above-the-fold cards. `StyleDetail` continues rendering the full-res PNG.
- **ESLint (`eslint.config.js`, `npm run lint`):** Configured ESLint 10 with `@eslint/js`, `@babel/eslint-parser` (`@babel/preset-typescript` + `@babel/preset-react`, avoiding `typescript-eslint`'s TS 7.0 incompatibility), and `eslint-plugin-react-hooks` recommended rules. Fixed all 5 genuine lint errors uncovered (`StylePreview.tsx` static `LAZY_PREVIEWS` lookup outside render, `22-synthwave.tsx` track advance inside interval callback instead of `setState` in effect, `30-command-first.tsx` pure group-header comparison instead of mutating `lastGroup` in `.map()`, `41-zen.tsx` derived `active` state instead of `setState` in effect, `useCopy.ts` useless initial `ok = false` assignment).
- **SEO (`public/robots.txt`):** Added `User-agent: * / Allow: /`, lifting Lighthouse SEO from 92 to 100 on both mobile and desktop.

### Lighthouse baseline (2026-11-21, production build on `vite preview`, headless Chromium)

| Preset | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| Mobile | **96** | **100** | **100** | **100** | 0.8 s | 2.0 s | 200 ms | 0 |
| Desktop | **100** | **100** | **100** | **100** | 0.4 s | 0.6 s | 0 ms | 0 |

### Verification (2026-11-21, final code)

| Check | Result |
|---|---|
| `npm run lint` | exit 0 — 0 errors, 0 warnings |
| `npm run typecheck` | exit 0, 0 errors |
| `npm run build` | exit 0 — JS 304.31 kB (96.88 kB gzip) |
| `npm test` (Vitest) | exit 0 — 109/109 pass (8 files) |
| `npm run validate:data` | exit 0 — 50 styles, 0 errors, 1 warning (style 5 swatch); 11/11 negative tests |
| `npm run test:e2e` (Chromium 375/768/1440) | exit 0 — 398 pass, 4 skipped |
| `npm run test:e2e:compat` (Firefox + WebKit + mobile-touch) | exit 0 — 19 pass, 2 skipped |

## Phase 2D — Interactive Style Playground

Verified 2026-11-21. Upgraded `StyleDetail` into a full interactive Style Playground without breaking CSS isolation, accessibility, or Original CSS immutability:

- **Viewport presets & Compare mode (`StyleDetail.tsx`, `PreviewToggle.tsx`):** Added Desktop / Tablet / Mobile viewport framing that resizes the live preview container in real time across all 50 styles, plus a **Compare** mode (side-by-side on wide screens, stacked on mobile) showing the original slide visual next to the customized live preview.
- **Preview Backdrop (`PlaygroundControls.tsx`):** Auto / Light / Dark / Neutral stage surround for contrast testing across all 50 styles.
- **Incremental CSS-variable customization (`playgroundConfig.ts`, `PreviewStage.tsx`, 28 CSS Modules):** Wired `--pg-*` custom properties across 28 representative styles covering all 6 categories (zero dead controls, enforced by `playgroundConfig.test.ts` against each style's `.module.css`):
  - **Accent Color (`--pg-accent` → `--accent`):** 27 styles (seeded from `styles.json` with palette swatch quick-picks + native color picker; omitted on pure Monochrome/Noir 25).
  - **Border Radius (`--pg-radius` → `--radius`):** 21 rounded-corner styles (explicitly omitted on sharp-corner styles 07, 11, 13, 21, 25, 38 and axonometric 34).
  - **Surface Padding / Scale (`--pg-scale` → `--density`):** 24 styles.
  - **Shadow / Depth Intensity (`--pg-shadow-strength` → `--shadow-strength`):** 20 depth-based styles (all 10 Morphism & Depth + Material 03, Neo-Brutalism 07, Bento 08, Memphis 20, Motion-First 28, Command-First 30, Flat 2.0 32, Gamified 39, Masonry 48, Kawaii 49).
- **Separate Original CSS vs. Generated CSS (`SourceTabs.tsx`):** Original CSS tab stays 100% verbatim; new **Generated CSS** tab outputs live `:root { ... }` custom properties listing only supported variables for the current style, with **Copy Generated CSS** (`CopyButton` + `role="status"`). Single **Reset** button restores all controls, viewport preset, and backdrop to defaults.
- **Contrast fix (`src/index.css`):** Darkened `--code-comment` (`#5d606b` light / `#9ea3b0` dark) so comment lines in `CssCode` pass WCAG 2.2 AA contrast.

### Verification (2026-11-21, final code)

| Check | Result |
|---|---|
| `npm run lint` | exit 0 — 0 errors, 0 warnings |
| `npm run typecheck` | exit 0, 0 errors |
| `npm run build` | exit 0 — JS 316.69 kB (99.86 kB gzip) |
| `npm test` (Vitest) | exit 0 — 117/117 pass (9 files; new: `playgroundConfig.test.ts` [8 tests]) |
| `npm run validate:data` | exit 0 — 50 styles, 0 errors, 1 warning (style 5 swatch); 11/11 negative tests |
| `npm run test:e2e` (Chromium 375/768/1440) | exit 0 — 407 pass, 4 skipped (new: `tests/e2e/playground.spec.ts` [9 tests]) |
| `npm run test:e2e:compat` (Firefox + WebKit + mobile-touch) | exit 0 — 19 pass, 2 skipped |

## Remaining backlog (post-Phase 2D)

- **Manual device/AT checks (non-automated):** Screen-reader pass (NVDA / VoiceOver) and physical touch devices.
- **Optional AAA target sizing:** At 375 px some controls sit between 24 and 44 px (WCAG 2.5.8 AA met, AAA 44×44 not).
- **Phase 4 — Deployment:** GitHub push + Cloudflare Pages deployment (after explicit approval).

## Known defects

None blocking.
- Clipboard on Windows turns `\n` in copied CSS into `\r\n` (OS behaviour); the dataset keeps `\n`.
- At 375 px some preview controls are between 24 and 44 px (WCAG AA met, AAA not); see Phase 2B accessibility findings.
- Stop hook: the global `~/.claude/settings.json` runs `bash .claude/hooks/stop-path-guard.sh` and `bash .claude/hooks/stop-session-snapshot.sh` on Stop in every project; this repo has no `.claude/hooks/`, so the hook errors here. The original scripts are in the TYMINO-Finances repo. Deliberately not copied and settings not changed; resolve separately.

## Unresolved decisions

- Style 5 fourth swatch: leave out (current) or accept a value you supply.
- Approval for the next phase: full-library quality review, Playground customization, or performance / deployment preparation.
- Whether to space slide compositions further to reach 44 px targets at 375 px (AAA).

## Git checkpoints

- `06fd15d` Phase 1: source extraction and asset validation
- `cea3fec` Phase 1 housekeeping: source metadata and negative validation tests
- `497e9da` Phase 2A: application foundation
- `1f3fbee` Phase 2B batch 1: Morphism & Depth live previews
- `b9c5460` Phase 2B batch 1: accessibility stabilization
- `d009f86` Phase 2B batch 2: Bold Retro Expressive live previews
- `5bfa84c` Phase 2B batch 3: Modern SaaS Dashboard live previews
- `bccf72d` Phase 2B batch 4: Minimal Typographic live previews
- `8c34adc` Phase 2B batch 5: Atmospheric Futuristic live previews
- `116c8ac` Phase 2B batch 6: Art Heritage live previews
- `16be99e` Phase 2C-1: Accessibility and interaction fixes
- `ffa24af` Phase 2C-2: Cross-browser and mobile touch compatibility
- Phase 2C-3: Visual fidelity improvements for 9 styles (`b946afb`)
- `8cfa7f6` Phase 2C-4: Image thumbnails, ESLint, and Lighthouse performance pass
- Phase 2D: Interactive Style Playground with viewport and CSS customization (hash in `git log`)

## Next recommended action

Proceed to Phase 4 (GitHub repository creation and Cloudflare Pages deployment) when approved.
