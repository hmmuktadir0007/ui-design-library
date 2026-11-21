import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { Style } from "../../types/style";
import { CopyButton } from "../ui/CopyButton";
import { CssCode } from "../ui/CssCode";

type TabKey = "prompt" | "css" | "generated";

interface Props {
  style: Style;
  /** Copy-ready CSS custom properties generated from active Playground controls (empty when style has none). */
  generatedCss?: string;
}

/** Original AI prompt and CSS (immutable from the slide), plus optional Generated CSS for Playground variables. */
export function SourceTabs({ style, generatedCss = "" }: Props) {
  const tabs: { key: TabKey; label: string }[] = generatedCss
    ? [
        { key: "prompt", label: "AI Prompt" },
        { key: "css", label: "Original CSS" },
        { key: "generated", label: "Generated CSS" },
      ]
    : [
        { key: "prompt", label: "AI Prompt" },
        { key: "css", label: "Original CSS" },
      ];

  const [active, setActive] = useState<TabKey>("prompt");
  const current: TabKey = active === "generated" && !generatedCss ? "prompt" : active;
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent, i: number) => {
    const next =
      e.key === "ArrowRight"
        ? i + 1
        : e.key === "ArrowLeft"
          ? i - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? tabs.length - 1
              : null;
    if (next === null) return;
    e.preventDefault();
    const idx = (next + tabs.length) % tabs.length;
    setActive(tabs[idx].key);
    refs.current[idx]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Source content" className="flex gap-1 rounded-xl bg-surface-2 p-1">
        {tabs.map((t, i) => (
          <button
            key={t.key}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            id={`${base}-${t.key}-tab`}
            aria-selected={current === t.key}
            aria-controls={`${base}-${t.key}-panel`}
            tabIndex={current === t.key ? 0 : -1}
            onClick={() => setActive(t.key)}
            onKeyDown={(e) => onKey(e, i)}
            className={`min-h-9 flex-1 rounded-lg px-2.5 text-sm font-medium transition-colors ${
              current === t.key ? "bg-fg text-bg shadow-card" : "text-muted hover:text-fg"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`${base}-prompt-panel`} aria-labelledby={`${base}-prompt-tab`} hidden={current !== "prompt"} className="mt-3 space-y-3">
        <blockquote className="rounded-xl border border-line bg-code p-4 text-[15px] leading-relaxed text-fg">{style.aiPrompt}</blockquote>
        <CopyButton text={style.aiPrompt} label="Copy AI Prompt" />
      </div>

      <div role="tabpanel" id={`${base}-css-panel`} aria-labelledby={`${base}-css-tab`} hidden={current !== "css"} className="mt-3 space-y-3">
        <CssCode css={style.cssSnippet} />
        <p className="text-xs text-muted">
          Original snippet from the source slide. It documents the style and may mix several elements or states; it is not a
          complete component stylesheet.
        </p>
        <CopyButton text={style.cssSnippet} label="Copy Original CSS" />
      </div>

      {generatedCss && (
        <div role="tabpanel" id={`${base}-generated-panel`} aria-labelledby={`${base}-generated-tab`} hidden={current !== "generated"} className="mt-3 space-y-3">
          <CssCode css={generatedCss} />
          <p className="text-xs text-muted">
            Live CSS custom properties generated from your active Playground controls. The Original CSS tab stays unchanged.
          </p>
          <CopyButton text={generatedCss} label="Copy Generated CSS" />
        </div>
      )}
    </div>
  );
}
