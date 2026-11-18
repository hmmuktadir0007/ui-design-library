import { SearchX } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { CategoryTabs } from "./components/gallery/CategoryTabs";
import { Header } from "./components/gallery/Header";
import { StyleCard } from "./components/gallery/StyleCard";
import { StyleDetail } from "./components/playground/StyleDetail";
import rawStyles from "./data/styles.json";
import { useTheme } from "./hooks/useTheme";
import { categoryCounts, filterStyles, type CategoryFilter } from "./lib/search";
import type { Style } from "./types/style";

const STYLES = rawStyles as Style[];

export default function App() {
  const { theme, toggle } = useTheme();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [openId, setOpenId] = useState<number | null>(null);
  const q = useDeferredValue(query);

  const visible = useMemo(() => filterStyles(STYLES, q, category), [q, category]);
  const counts = useMemo(() => categoryCounts(STYLES, q), [q]);
  const open = STYLES.find((s) => s.id === openId) ?? null;

  return (
    <>
      <a href="#gallery" className="sr-only z-50 rounded-lg bg-surface px-3 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Skip to gallery
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-md">
        <Header total={STYLES.length} query={query} onQuery={setQuery} theme={theme} onToggleTheme={toggle} />
        <CategoryTabs active={category} counts={counts} onChange={setCategory} />
      </header>

      <main id="gallery" className="mx-auto max-w-[1440px] px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        <h1 className="sr-only">UI Design Library</h1>
        <p className="mb-4 text-sm text-muted" role="status">
          Showing {visible.length} of {STYLES.length} styles
          {category !== "All" && ` in ${category}`}
          {q.trim() && ` matching “${q.trim()}”`}
        </p>

        {visible.length ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-5 lg:gap-6">
            {visible.map((s, i) => (
              <StyleCard key={s.id} style={s} eager={i < 4} onOpen={setOpenId} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line px-6 py-16 text-center">
            <SearchX className="size-8 text-muted" aria-hidden />
            <p className="font-medium">No styles match your filters</p>
            <p className="max-w-sm text-sm text-muted">Try a different search term or another category.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("All");
              }}
              className="mt-1 min-h-9 rounded-lg border border-line bg-surface px-3 text-sm font-medium hover:bg-surface-2"
            >
              Clear search and filters
            </button>
          </div>
        )}
      </main>

      <StyleDetail style={open} onClose={() => setOpenId(null)} />
    </>
  );
}
