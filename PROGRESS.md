# Progress

**Current phase:** Phase 1 complete — awaiting approval for Phase 2.

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

`python scripts/validate_styles.py` → `50 styles, 0 errors, 1 warnings` (exit 0).
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

## Not kept (schema fixed by spec)

Swatch names ("Dark Slate"…), title subtitles/eras ("Real-World Metaphors… (1980s–2012)"). Recoverable from the PPTX if Phase 2 wants them.

## Known defects

None blocking.

## Unresolved decisions

- Style 5 fourth swatch: leave out (current) or accept a value you supply.
- Phase 2 batching proposal (see IMPLEMENTATION_PLAN.md).

## Git checkpoints

- Phase 1: see `git log` (commit "Phase 1: source extraction and asset validation").

## Next recommended action

Review `data/contact-sheet.png` and `src/data/styles.json`, then approve Phase 2.
