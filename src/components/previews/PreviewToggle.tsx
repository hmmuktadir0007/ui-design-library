export type PreviewMode = "slide" | "live";

interface Props {
  mode: PreviewMode;
  onChange: (m: PreviewMode) => void;
  name: string;
}

const OPTIONS: { key: PreviewMode; label: string }[] = [
  { key: "slide", label: "Slide Visual" },
  { key: "live", label: "Live CSS" },
];

/** Only rendered for styles registered in previewRegistry. */
export function PreviewToggle({ mode, onChange, name }: Props) {
  return (
    <div role="group" aria-label={`${name} preview mode`} className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5">
      {OPTIONS.map((o) => (
        <button
          key={o.key}
          type="button"
          aria-pressed={mode === o.key}
          onClick={() => onChange(o.key)}
          // after: grows the 32px pill to a 44px touch target without changing its look
          className={`relative min-h-8 rounded-md px-2.5 text-xs font-medium transition-colors after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-[''] ${
            mode === o.key ? "bg-fg text-bg" : "text-muted hover:text-fg"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
