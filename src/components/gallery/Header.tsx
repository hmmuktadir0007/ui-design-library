import { Moon, Search, Sun, X } from "lucide-react";
import type { Theme } from "../../hooks/useTheme";

interface Props {
  total: number;
  query: string;
  onQuery: (q: string) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function Header({ total, query, onQuery, theme, onToggleTheme }: Props) {
  return (
    <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6 lg:px-8">
      <a href="#gallery" className="flex shrink-0 items-center gap-2.5 rounded-lg">
        <span aria-hidden className="grid size-8 grid-cols-2 gap-0.5 rounded-lg bg-accent p-1.5">
          <span className="rounded-[2px] bg-accent-fg" />
          <span className="row-span-2 rounded-[2px] bg-accent-fg/70" />
          <span className="rounded-[2px] bg-accent-fg/85" />
        </span>
        <span className="hidden leading-tight sm:block">
          <span className="block text-[15px] font-semibold tracking-tight text-fg">UI Design Library</span>
          <span className="block text-xs text-muted">{total} design styles</span>
        </span>
      </a>

      <div className="relative min-w-0 flex-1 sm:max-w-xl">
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search styles, categories, use cases…"
          aria-label={`Search ${total} design styles`}
          className="h-10 w-full rounded-xl border border-line bg-surface pr-10 pl-9 text-sm text-fg placeholder:text-muted focus:border-accent focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQuery("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-1 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onToggleTheme}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className="ml-auto grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-fg hover:bg-surface-2"
      >
        {theme === "dark" ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
      </button>
    </div>
  );
}
