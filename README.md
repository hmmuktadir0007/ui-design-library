# UI Design Library

An interactive reference catalog and live CSS playground featuring **50 UI design styles** across **6 design categories**. Browse visual thumbnails, toggle live interactive CSS previews directly on cards, inspect design metadata and copyable AI prompts/palettes/CSS, and customize styles in real time inside the **Interactive Style Playground**.

## Categories (50 Styles)

| Category | Count | Examples |
| --- | ---: | --- |
| **Morphism & Depth** | 10 | Skeuomorphism, Neumorphism, Glassmorphism, Claymorphism, Liquid Glass, Spatial / visionOS, Obsidian Glass |
| **Bold, Retro & Expressive** | 10 | Neo-Brutalism, Maximalism, Y2K / Retro Web, Pixel Art / 8-Bit, Windows 95, Acid Graphics, Pop Art / Comic |
| **Modern SaaS & Dashboards** | 9 | Material Design, Bento UI, Cyberminimalism, Data-Dense Analytics, Command-First, Terminal / CLI, Heatmap / Telemetry |
| **Art & Heritage Movements** | 8 | Bauhaus, Art Deco, Memphis Design, Organic / Biophilic, Paper / Craft Collage, Neoclassical, Low-Poly, Sketchbook |
| **Minimal & Typographic** | 7 | Flat Design, Minimalism (Swiss), Bold / Kinetic Typography, Editorial / Magazine, Monochrome / Noir, Japanese Zen, Variable Font |
| **Atmospheric & Futuristic** | 6 | Aurora UI, Cyberpunk / Sci-Fi HUD, Vaporwave / Synthwave, Scrollytelling, Kinetic / Motion-First, Holographic |

## Key Features

- **50 Live Interactive Previews:** Every style ships as a lazy-loaded React + CSS Module component with isolated styling (no CSS leaks into the app shell) and deterministic local interactions.
- **Live CSS / Slide Visual / Compare Modes:** Switch any card or detail view between the reference visual and the live interactive CSS preview, or open **Compare** mode to view both side-by-side (stacked on mobile).
- **Interactive Style Playground:**
  - **Viewport Simulator:** Frame any live preview at Desktop, Tablet, or Mobile widths in real time.
  - **Preview Backdrop:** Switch the stage surround (`Auto`, `Light`, `Dark`, `Neutral`) for contrast testing.
  - **Live CSS-Variable Customization:** Customize `--pg-accent`, `--pg-radius`, `--pg-scale`, and `--pg-shadow-strength` across 28 supported styles (only active controls are shown; zero dead sliders).
  - **Original CSS vs. Generated CSS:** Keep the reference CSS snippet verbatim while exporting live `:root { ... }` custom properties with one-click copy and Reset.
- **Copyable Assets:** One-click copy for full palettes, individual swatches (HEX/RGBA), AI prompts, original CSS snippets, and generated playground CSS with accessible status announcements.
- **Search, Category Filtering & Theme:** Instant case- and whitespace-insensitive search across titles, subtitles, categories, and use cases, plus persistent Light/Dark mode.
- **Accessibility & Performance:**
  - Tested against **WCAG 2.2 AA** via `@axe-core/playwright` (0 violations across all 50 detail views and gallery).
  - Full keyboard operability, roving tabindex on radio groups and grids, visible focus indicators, and `prefers-reduced-motion` support.
  - Responsive WebP thumbnails (`480×385`, ~90% smaller than full PNGs) with full-resolution PNGs in detail views.

## Tech Stack

- **UI & Build:** React 19, Vite 8, TypeScript 7, Tailwind CSS 4 (`@tailwindcss/vite`), `lucide-react`
- **Unit & Data Testing:** Vitest 5, Python `unittest` (`scripts/validate_styles.py`)
- **E2E & Accessibility Testing:** Playwright (Chromium, Firefox, WebKit, simulated mobile touch), `@axe-core/playwright`
- **Linting:** ESLint 10 (`@babel/eslint-parser`, `eslint-plugin-react-hooks`)

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Python 3.10+ with Pillow (only required for data validation and thumbnail regeneration)

### Install & Run Locally

```bash
npm install
npm run dev
```

### Available Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check (`tsc --noEmit`) and build production assets to `dist/` |
| `npm run preview` | Serve the production `dist/` build locally |
| `npm run lint` | Run ESLint across the repository |
| `npm run typecheck` | Run TypeScript type checking without emitting files |
| `npm test` | Run Vitest unit tests (search, CSS scoping, playground config, helpers) |
| `npm run validate:data` | Validate `src/data/styles.json` and run Python negative tests |
| `npm run generate:thumbs` | Regenerate `public/images/thumbs/style-NN.webp` thumbnails from full PNGs |
| `npm run test:e2e` | Build and run Playwright E2E + axe-core WCAG 2.2 AA tests (375 / 768 / 1440 px) |
| `npm run test:e2e:compat` | Build and run cross-browser (Firefox, WebKit) and mobile-touch tests |
| `npm run capture:previews` | Build and capture preview screenshots and comparison sheet |

## Deployment (Cloudflare Pages)

This project is a static single-page application that builds to `dist/` with no backend or runtime secrets required.

```bash
# 1. Build production bundle
npm run build

# 2. (First time only) Create the Cloudflare Pages project
npx wrangler pages project create ui-design-library --production-branch=main

# 3. Deploy dist/ to Cloudflare Pages
npx wrangler pages deploy dist --project-name=ui-design-library
```

For Git-connected deployments in the Cloudflare Dashboard, configure:
- **Build command:** `npm run build`
- **Build output directory:** `dist`

## Adding Style #51+

1. **Add the style record** to `src/data/styles.json` matching the existing schema (`id`, `name`, `subtitle`, `categoryTab`, `originalCategory`, `whereToUse`, `howToUse`, `palette`, `paletteNames`, `aiPrompt`, `cssSnippet`, `imagePath`, `sourcePage`).
2. **Add the reference visual** at `public/images/style-51.png` and regenerate WebP thumbnails:
   ```bash
   npm run generate:thumbs
   ```
3. **Create the isolated live preview** under `src/components/previews/styles/`:
   - `51-your-style.tsx` exporting a default `ComponentType<PreviewProps>`
   - `51-your-style.module.css` using only local class names (no global selectors)
4. **Register the lazy loader** in `src/components/previews/previewRegistry.ts`:
   ```ts
   51: () => import("./styles/51-your-style"),
   ```
5. **(Optional) Wire Playground variables** (`--pg-accent`, `--pg-radius`, `--pg-scale`, `--pg-shadow-strength`) in your `.module.css` and register the supported controls in `src/components/playground/playgroundConfig.ts`.
6. **Verify everything passes:**
   ```bash
   npm run lint && npm run typecheck && npm test && npm run build
   ```
