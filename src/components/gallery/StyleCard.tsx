import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import type { Style } from "../../types/style";
import { PreviewStage } from "../previews/PreviewStage";
import { PreviewToggle, type PreviewMode } from "../previews/PreviewToggle";
import { hasPreview } from "../previews/previewRegistry";
import { Palette } from "./Palette";
import { StyleImage } from "./StyleImage";

interface Props {
  style: Style;
  eager: boolean;
  onOpen: (id: number) => void;
}

export function StyleCard({ style, eager, onOpen }: Props) {
  const open = () => onOpen(style.id);
  const live = hasPreview(style.id);
  const [mode, setMode] = useState<PreviewMode>("slide");
  return (
    <article
      aria-labelledby={`style-${style.id}-name`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-[box-shadow,border-color,translate] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card-hover"
    >
      {mode === "live" ? (
        <div className="border-b border-line">
          <PreviewStage id={style.id} name={style.name} interactive={false} />
        </div>
      ) : (
        <button type="button" onClick={open} aria-label={`Enlarge ${style.name}`} className="block overflow-hidden border-b border-line">
          <StyleImage style={style} eager={eager} className="transition-transform duration-300 group-hover:scale-[1.015]" />
        </button>
      )}
      {live && (
        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2">
          {/* Card previews are display-only; the detail view is the interactive one. */}
          <span className="text-xs font-medium text-muted">{mode === "live" ? "Display only" : "Preview"}</span>
          <PreviewToggle mode={mode} onChange={setMode} name={style.name} />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-xs text-muted">#{String(style.id).padStart(2, "0")}</p>
            <h2 id={`style-${style.id}-name`} className="text-base leading-snug font-semibold tracking-tight text-fg">
              {style.name}
            </h2>
            {style.subtitle && <p className="mt-0.5 line-clamp-1 text-sm text-muted">{style.subtitle}</p>}
          </div>
        </div>
        <span className="w-fit rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">{style.categoryTab}</span>

        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted uppercase">Where to use</dt>
            <dd className="line-clamp-2 text-fg">{style.whereToUse}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted uppercase">How to use</dt>
            <dd className="line-clamp-2 text-fg">{style.howToUse}</dd>
          </div>
        </dl>

        <div className="mt-auto space-y-3 border-t border-line pt-3">
          <Palette colors={style.palette} names={style.paletteNames} compact />
          <button
            type="button"
            onClick={open}
            className="inline-flex min-h-10 w-full items-center justify-center gap-1 rounded-xl border border-line text-sm font-medium text-fg transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
          >
            View details
            <ArrowUpRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}
