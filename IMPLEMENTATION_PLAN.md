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

## UI component architecture (Phase 2)

```
src/components/gallery/   Header, CategoryTabs, StyleCard, Palette, CopyButton
src/components/previews/  StylePreview.tsx, previewRegistry.ts, one file per style (01-skeuomorphism.tsx …)
src/components/playground/ Playground (dialog), ViewportFrame, Controls
src/lib/                  filter/search, clipboard
```

## Style preview architecture

- `previewRegistry: Record<number, PreviewComponent>` — one dedicated component per style; build fails type check if an id is missing.
- Isolation: each preview's CSS is a CSS Module (scoped class names). No source CSS is executed; snippets are shown as text only.
- Customization through CSS custom properties on the preview root (`--radius`, `--shadow`, `--accent`, …); each preview declares which it honors.

## Style Playground architecture

Dialog opened from a card. Viewport frame resizes a container (375/768/1280 px) so previews' container queries respond.
Controls list comes from the preview's declared variables; generated CSS = the declared variables with current values. Reset = defaults.

## Testing approach

- Phase 1: `scripts/validate_styles.py` (blocking errors vs warnings, exit 1 on error; full re-parse equality against the PPTX) and `scripts/test_validate_styles.py` (negative fixtures, in memory).
- Phase 3: `tsc --noEmit`, ESLint, Vitest for filter/search logic, Playwright over all 50 cards + playground at 375/768/1440.

## Performance strategy

Lazy-loaded images with width/height set (no CLS), preview components code-split per style via `React.lazy`, Lighthouse measured not assumed.

## Deployment

Phase 4 only after explicit approval: `gh repo create ui-design-library`, `wrangler pages deploy dist`. PPTX/PDF are git-ignored.

## Phase tasks and completion criteria

| Phase | Tasks | Done when |
|---|---|---|
| 1 | extract text + images, contact sheet, report, validator | 50 records, 50 images, validator exit 0, all crops inspected, commit — **complete** |
| 2 | React app, 50 previews, playground | builds; every preview has a working interaction |
| 3 | tests, browser checks, perf | all checks pass or are reported with measured values |
| 4 | GitHub + Cloudflare | URLs verified live |

## Scope questions for Phase 2 (raised, not decided)

- 50 hand-built interactive previews are the bulk of the effort. Proposal: one shared preview shell + per-style component, built in batches of ~10 per category with a review gate each.
- Playground "generated CSS" will cover only the CSS variables a preview actually uses; no export is offered for controls without CSS output.
