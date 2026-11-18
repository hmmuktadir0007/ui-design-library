# Progress

**Current phase:** Phase 2A complete — awaiting approval for Phase 2B (live previews).

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

## Known defects

None blocking.
- Clipboard on Windows turns `
` in copied CSS into `

` (OS behaviour); the dataset keeps `
`.
- Card images use the full 969 px PNGs (~140 kB avg); thumbnails are a Phase 3 performance item.
- Browser checks were run as Playwright MCP scripts; a committed Playwright suite is Phase 3 work.

## Unresolved decisions

- Style 5 fourth swatch: leave out (current) or accept a value you supply.
- Phase 2B batching proposal (see IMPLEMENTATION_PLAN.md).

## Git checkpoints

- `06fd15d` Phase 1: source extraction and asset validation
- `cea3fec` Phase 1 housekeeping: source metadata and negative validation tests
- Phase 2A: commit "Phase 2A: application foundation" (hash in `git log`)

## Next recommended action

Review the Phase 2A screenshots / `npm run dev`, then approve Phase 2B (first batch).
