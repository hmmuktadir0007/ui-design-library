import { Check } from "lucide-react";
import { useCopy } from "../../hooks/useCopy";

const isTranslucent = (c: string) => /^rgba\(/i.test(c) || /^#([0-9a-f]{4}|[0-9a-f]{8})$/i.test(c);

function Swatch({ color, name, compact }: { color: string; name?: string | null; compact: boolean }) {
  const { state, copy } = useCopy(1200);
  const label = `Copy ${name ? `${name} ` : ""}${color}`;
  const chip = (
    <span className={`relative block overflow-hidden ${compact ? "size-7 rounded-full" : "h-12 w-full rounded-lg"} ring-1 ring-black/10 ring-inset dark:ring-white/25 ${isTranslucent(color) ? "checker" : ""}`}>
      <span className="absolute inset-0" style={{ background: color }} />
      {state === "copied" && (
        <span className="absolute inset-0 grid place-items-center bg-black/45 text-white">
          <Check className="size-4" aria-hidden />
        </span>
      )}
    </span>
  );
  return (
    <li className={compact ? "" : "min-w-0"}>
      <button
        type="button"
        onClick={() => copy(color)}
        title={label}
        aria-label={compact ? label : undefined} // with visible text, the text is the name (WCAG 2.5.3) and the title describes it
        className={compact ? "grid min-h-9 min-w-9 place-items-center rounded-full" : "group flex w-full flex-col gap-1.5 rounded-xl p-1 text-left hover:bg-surface-2"}
      >
        {chip}
        {!compact && (
          <span className="min-w-0 px-0.5">
            <span className="block truncate font-mono text-xs text-fg">{state === "copied" ? "Copied!" : state === "failed" ? "Copy failed" : color}</span>
            {name && <span className="block truncate text-xs text-muted">{name}</span>}
          </span>
        )}
      </button>
      <span className="sr-only" role="status">
        {state === "copied" ? `${color} copied` : state === "failed" ? `Could not copy ${color}` : ""}
      </span>
    </li>
  );
}

interface Props {
  colors: string[];
  names?: (string | null)[];
  compact?: boolean;
}

/** Exact source values; rgba stays rgba (no HEX conversion). */
export function Palette({ colors, names, compact = false }: Props) {
  return (
    <ul
      aria-label="Color palette"
      className={compact ? "flex flex-wrap gap-0.5" : "grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-1"}
    >
      {colors.map((c, i) => (
        <Swatch key={`${c}-${i}`} color={c} name={names?.[i]} compact={compact} />
      ))}
    </ul>
  );
}
