import { Check, Copy, X } from "lucide-react";
import { useCopy } from "../../hooks/useCopy";

interface Props {
  text: string;
  label: string;
  className?: string;
}

export function CopyButton({ text, label, className = "" }: Props) {
  const { state, copy } = useCopy();
  const Icon = state === "copied" ? Check : state === "failed" ? X : Copy;
  return (
    <button
      type="button"
      onClick={() => copy(text)}
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-sm font-medium text-fg transition-colors hover:border-line-strong hover:bg-surface-2 ${className}`}
    >
      <Icon className={`size-4 ${state === "copied" ? "text-emerald-600 dark:text-emerald-400" : state === "failed" ? "text-red-600" : "text-muted"}`} aria-hidden />
      {state === "copied" ? "Copied!" : state === "failed" ? "Copy failed" : label}
      <span className="sr-only" role="status">
        {state === "copied" ? `${label}: copied to clipboard` : state === "failed" ? `${label}: copy failed` : ""}
      </span>
    </button>
  );
}
