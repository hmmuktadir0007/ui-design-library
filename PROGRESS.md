# Progress

**Current phase:** Phase 2B batch 2 complete (Bold, Retro & Expressive) — 20 of 50 live previews; awaiting approval for batch 3.

| Scope | Status |
|---|---|
| Phase 1 — extraction + validation | complete |
| Phase 2A — application foundation | complete |
| Phase 2B batch 1 — 10 Morphism & Depth live previews | complete, verified 2026-11-19 |
| Phase 2B batch 2 — 10 Bold, Retro & Expressive live previews | complete, verified 2026-11-19 |
| Remaining 30 interactive previews (Modern SaaS & Dashboards 9, Art & Heritage Movements 8, Minimal & Typographic 7, Atmospheric & Futuristic 6) | not started |
| Full Playground customization (viewport frame, variable controls, generated CSS) | not started |

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

`docs/screenshots/phase-2b/`: `comparison-sheet.png` (Slide Visual vs Live CSS, all registered previews — 20 after batch 2), `live-NN.png` (one per preview), `gallery-desktop-1440.png`, `gallery-mobile-375.png` (all live cards switched on), `detail-06-*.png` and `detail-38-*.png` (desktop 1440 / mobile 375).
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

## Known defects

None blocking.
- Clipboard on Windows turns `
` in copied CSS into `

` (OS behaviour); the dataset keeps `
`.
- Card images use the full 969 px PNGs (~140 kB avg); thumbnails are a Phase 3 performance item.
- At 375 px some preview controls are between 24 and 44 px (WCAG AA met, AAA not); see Phase 2B accessibility findings.
- Stop hook: the global `~/.claude/settings.json` runs `bash .claude/hooks/stop-path-guard.sh` and `bash .claude/hooks/stop-session-snapshot.sh` on Stop in every project; this repo has no `.claude/hooks/`, so the hook errors here. The original scripts are in the TYMINO-Finances repo. Deliberately not copied and settings not changed; resolve separately.

## Unresolved decisions

- Style 5 fourth swatch: leave out (current) or accept a value you supply.
- Approval for Phase 2B batch 3 (next category).
- Whether to space slide compositions further to reach 44 px targets at 375 px (AAA).

## Git checkpoints

- `06fd15d` Phase 1: source extraction and asset validation
- `cea3fec` Phase 1 housekeeping: source metadata and negative validation tests
- `497e9da` Phase 2A: application foundation
- `1f3fbee` Phase 2B batch 1: Morphism & Depth live previews
- `b9c5460` Phase 2B batch 1: accessibility stabilization
- Phase 2B batch 2: Bold Retro Expressive live previews (hash in `git log`)

## Next recommended action

Review `docs/screenshots/phase-2b/comparison-sheet.png` (rows 07–49), then approve Phase 2B batch 3.
