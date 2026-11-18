import { CATEGORIES } from "../../types/style";
import type { CategoryFilter } from "../../lib/search";

interface Props {
  active: CategoryFilter;
  counts: Record<CategoryFilter, number>;
  onChange: (c: CategoryFilter) => void;
}

const FILTERS: CategoryFilter[] = ["All", ...CATEGORIES];

export function CategoryTabs({ active, counts, onChange }: Props) {
  return (
    <nav aria-label="Filter by category" className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
      <ul className="scrollbar-none -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-3 sm:mx-0 sm:flex-wrap sm:px-0">
        {FILTERS.map((c) => {
          const on = c === active;
          return (
            <li key={c} className="shrink-0">
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onChange(c)}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium whitespace-nowrap transition-colors ${
                  on ? "border-fg bg-fg text-bg" : "border-line bg-surface text-muted hover:border-line-strong hover:text-fg"
                }`}
              >
                {c}
                <span className={`rounded-full px-1.5 text-xs tabular-nums ${on ? "bg-bg/20" : "bg-surface-2"}`}>{counts[c]}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
