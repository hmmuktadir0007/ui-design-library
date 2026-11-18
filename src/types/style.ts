export const CATEGORIES = [
  "Morphism & Depth",
  "Minimal & Typographic",
  "Modern SaaS & Dashboards",
  "Bold, Retro & Expressive",
  "Atmospheric & Futuristic",
  "Art & Heritage Movements",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** One record of src/data/styles.json (schema enforced by scripts/validate_styles.py). */
export interface Style {
  id: number;
  name: string;
  subtitle?: string;
  era?: string;
  categoryTab: Category;
  originalCategory?: string;
  whereToUse: string;
  howToUse: string;
  palette: string[];
  /** Aligned 1:1 with palette; null where the slide prints no name. */
  paletteNames?: (string | null)[];
  aiPrompt: string;
  /** Original slide CSS: documentation only, never injected into the page. */
  cssSnippet: string;
  imagePath: string;
  sourcePage: number;
}
