import { CATEGORIES, type Category, type Style } from "../types/style";

export type CategoryFilter = Category | "All";

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

/** Every whitespace-separated term must appear somewhere in the style's searchable text. */
export function matchesQuery(style: Style, query: string): boolean {
  const terms = normalize(query).split(" ").filter(Boolean);
  if (!terms.length) return true;
  const haystack = normalize(
    [style.name, style.subtitle, style.categoryTab, style.originalCategory, style.whereToUse, style.howToUse].join(" "),
  );
  return terms.every((t) => haystack.includes(t));
}

export function filterStyles(styles: Style[], query: string, category: CategoryFilter): Style[] {
  return styles.filter((s) => (category === "All" || s.categoryTab === category) && matchesQuery(s, query));
}

/** Counts per tab for the styles that match the current query. */
export function categoryCounts(styles: Style[], query: string): Record<CategoryFilter, number> {
  const matching = styles.filter((s) => matchesQuery(s, query));
  const counts = { All: matching.length } as Record<CategoryFilter, number>;
  for (const c of CATEGORIES) counts[c] = matching.filter((s) => s.categoryTab === c).length;
  return counts;
}
