# Implementation Plan — UI Design Library

Static React site showcasing 50 UI design styles extracted from `data/ui-styles.pptx` / `data/ui-styles.pdf`.
Phases run in order; each ends with validation, a local Git commit, and a stop for approval.

## Architecture overview

- **Data layer (Phase 1, done):** Python pipeline → `src/data/styles.json` + `public/images/style-NN.png`.
- **App (Phase 2):** Vite + React + TypeScript + Tailwind, fully static, no backend. Imports `styles.json` at build time.
- **Hosting (Phase 4):** `dist/` on Cloudflare Pages.

## Source extraction approach

| Concern | Source | Why |
|---|---|---|
| Text (name, category, where/how, palette, prompt, CSS) | PPTX text frames | PDF text layer drops glyphs (`(`, `–`, `×`, `*/` become `//`), PPTX is exact |
| Cross-check | PDF text | every prose/CSS field must match ≥95% of its alphanumerics, in order, on the PDF page |
| Images | PDF render | 14+ mockups are vector shape groups, not bitmaps; rendering gives one uniform, complete method |

Parsing: per slide, skip the top-level group containing `SPEC_MOCKUP_CANVAS`, flatten remaining text lines,
split into fields at label lines (`CATEGORY`, `WHERE TO USE`, `HOW TO USE`, `BEST COLOR PALETTE`, `AI PROMPT`, `CUSTOM CSS`; all case and prefix variants).
Style id = number in the slide title, checked against page position and the PDF page.

Permitted normalization (recorded): NFC Unicode, enclosing quotes stripped from AI prompts, prose lines joined with spaces,
CSS keeps its line breaks, category labels mapped onto the six approved categories.

## Data schema

`src/data/styles.json` — array of 50 objects, fields exactly:
`id, name, categoryTab, whereToUse, howToUse, palette[], aiPrompt, cssSnippet, imagePath, sourcePage`.
`name` is the title text before the first colon.
Optional, source-backed only: `subtitle`, `era`, `originalCategory`, `paletteNames` (aligned with `palette`, `null` allowed per entry).
`src/types/style.ts` mirrors this schema.

## Image processing

Render page at 216 dpi, clip to mockup canvas `(368,103)-(691,362)` pt (window minus its title bar), lossless optimized PNG, ~969×777 px.
All 50 crops inspected on `data/contact-sheet.png`. Liquid Glass (10) has decorative blobs outside the window; they are slide decoration and are excluded.

## UI component architecture (Phase 2A, built)

```
src/types/style.ts              Style interface + CATEGORIES (mirrors styles.json)
src/lib/search.ts               matchesQuery / filterStyles / categoryCounts (+ search.test.ts)
src/hooks/useTheme.ts           class-based dark mode, localStorage; index.html applies it pre-paint
src/hooks/useCopy.ts            clipboard write + idle/copied/failed state
src/components/ui/              CopyButton (visible + role=status feedback), CssCode (display-only highlighter, text nodes only)
src/components/gallery/         Header, CategoryTabs (aria-pressed filters), StyleCard, StyleImage, Palette, SourceTabs (ARIA tabs)
src/components/playground/      StyleDetail: native <dialog>.showModal() (focus trap, Esc, inert page, focus return)
src/components/previews/        previewRegistry.ts, StylePreview.tsx (lazy, per-style code split),
                                PreviewStage.tsx (artboard scaling + touch targets), PreviewToggle.tsx (Slide Visual / Live CSS),
                                shared/Knob.tsx (headless ARIA rotary slider), styles/NN-name.tsx + NN-name.module.css,
                                scoping.test.ts (CSS isolation rules)
```

Shell tokens are CSS custom properties in `src/index.css` (`:root` / `.dark`), exposed to Tailwind via `@theme inline`.
Gallery grid is `repeat(auto-fill, minmax(min(100%,320px),1fr))`: column count follows usable width (1 @375, 2 @768, 4 @1440).

## Style preview architecture (Phase 2B batch 1 built: 10 of 50)

- `previewRegistry: Partial<Record<number, () => Promise<PreviewModule>>>`. A style is registered only when its preview is finished. Registered now (29): 1, 4, 5, 6, 10, 18, 31, 34, 45, 46 (Morphism & Depth); 7, 12, 15, 21, 33, 36, 38, 39, 42, 49 (Bold, Retro & Expressive); 3, 8, 14, 29, 30, 32, 37, 47, 48 (Modern SaaS & Dashboards).
- `hasPreview(id)` gates every Live CSS control: unregistered styles render the reference image plus a "planned" note, no toggle.
- Each preview: `previews/styles/NN-name.tsx` + `NN-name.module.css`. CSS isolation:
  - CSS Modules hash every class name; `scoping.test.ts` fails the build's test run if a preview stylesheet has a selector not rooted in a class, `:global`, `@import`, `position: fixed` or `!important`, or if registry and stylesheets disagree.
  - The source `cssSnippet` is never injected; it is shown as text only.
  - Playwright compares computed styles of shell elements before/after all 10 previews are switched on (leak test).
- `PreviewStage` renders each preview on a fixed 420 px artboard (969:777, the reference image ratio) and scales it to the available width, so card, dialog and mobile show the same composition with no layout shift when toggling.
- Gallery cards: Live CSS is **display only** (`inert`, labelled "Display only"); the detail dialog (default mode Live CSS) is the interactive one.
- Touch targets: `PreviewStage` grows each control's hit area toward 44×44 screen px with a transparent `::after` (buttons, ARIA widgets) or a transparent border offset by negative margins (range inputs). Each side grows independently, up to half the gap to the nearest control on that side (or the stage edge), so hit areas never overlap.
- Preview authoring rules that follow: range inputs draw their visible track on `::-webkit-slider-runnable-track` / `::-moz-range-track` and keep the input box transparent; leave ≥ 24 artboard px between a slider and the nearest control above/below it so it reaches 24 px at 375 px; text must pass axe contrast on the slide background.
- `PreviewProps.vars` (`--radius`, `--accent`, …) is the hook for Playground customization via CSS custom properties (unused so far).

## Style Playground architecture (not started)

`StyleDetail` is the Playground shell. Built so far: only the Slide Visual / Live CSS toggle. Still planned:
a viewport frame that resizes a container (375/768/1280 px), controls built from each preview's declared variables,
generated CSS = those variables with current values, Reset = defaults.

## Testing approach

- Phase 1: `scripts/validate_styles.py` (blocking errors vs warnings, exit 1 on error; full re-parse equality against the PPTX) and `scripts/test_validate_styles.py` (negative fixtures, in memory).
- Phase 2A: `npm run typecheck`, `npm test` (Vitest, search/counts), `npm run validate:data`, browser checks via Playwright MCP (scripted, not yet committed as a suite).
- Phase 2B: Vitest `scoping.test.ts`; committed Playwright suite `tests/e2e/` (`npm run test:e2e`, builds first, runs at 375/768/1440); screenshots via `npm run capture:previews`.
- Accessibility (`tests/e2e/a11y.spec.ts`): hit-tested target size ≥ 24×24 and no overlap, Tab reachability + visible focus, axe-core WCAG 2.2 AA on every preview dialog and the gallery, slider/switch use from the enlarged area. Every new preview batch must pass it.
- Phase 3: ESLint, Playwright over the playground, perf.

## Performance strategy

Lazy-loaded images with width/height set (no CLS), preview components code-split per style via `React.lazy`, Lighthouse measured not assumed.

## Deployment

Phase 4 only after explicit approval: `gh repo create ui-design-library`, `wrangler pages deploy dist`. PPTX/PDF are git-ignored.

## Phase tasks and completion criteria

| Phase | Tasks | Done when |
|---|---|---|
| 1 | extract text + images, contact sheet, report, validator | 50 records, 50 images, validator exit 0, all crops inspected, commit — **complete** |
| 2A | gallery foundation, detail view, preview contract | build + browser checks pass — **complete** |
| 2B batch 1 | 10 Morphism & Depth live previews | pointer + keyboard interaction tested per preview — **complete** |
| 2B batch 1 a11y | target size, focus, axe WCAG 2.2 AA for the 10 previews | a11y suite passes at 375/768/1440 — **complete** |
| 2B batch 2 | 10 Bold, Retro & Expressive live previews, a11y suite from the start | functional + a11y suites pass at 375/768/1440 — **complete** |
| 2B batch 3 | 9 Modern SaaS & Dashboards live previews (command palettes, sortable table, heatmap, masonry, terminal) | functional + a11y suites pass at 375/768/1440 — **complete** |
| 2B remaining | 21 previews (3 category batches) | not started |
| 2B playground | viewport frame, variable controls, generated CSS, reset | not started |
| 3 | tests, browser checks, perf | all checks pass or are reported with measured values |
| 4 | GitHub + Cloudflare | URLs verified live |

## Scope notes for Phase 2B

- Previews are built in category batches with a review gate each (batches 1–3 done). Next batch needs approval.
- Playwright runs with 4 workers (more starves the local preview server); add new preview ids to `LIVE_IDS` in `tests/e2e/fixtures.ts` and a pointer + keyboard case in `previews.spec.ts`.
- Keyboard shortcuts inside a preview are bound on the preview root (never `window`), and Esc handled by a preview must `preventDefault` + `stopPropagation` so the app's detail dialog stays open. Pure logic a preview needs (e.g. the 37 terminal interpreter) lives in a sibling `.ts` file with its own Vitest test.
- Playground "generated CSS" will cover only the CSS variables a preview actually uses; no export is offered for controls without CSS output.
