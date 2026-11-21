import { ExternalLink, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Style } from "../../types/style";
import { Palette } from "../gallery/Palette";
import { SourceTabs } from "../gallery/SourceTabs";
import { StyleImage } from "../gallery/StyleImage";
import { hasPreview } from "../previews/previewRegistry";
import { PreviewStage } from "../previews/PreviewStage";
import { PreviewToggle, type PreviewMode } from "../previews/PreviewToggle";
import { CopyButton } from "../ui/CopyButton";
import { PlaygroundControls } from "./PlaygroundControls";
import {
  BACKDROP_OPTIONS,
  buildPreviewVars,
  formatGeneratedCss,
  getDefaultPlaygroundState,
  getPlaygroundConfig,
  isPlaygroundDefault,
  VIEWPORT_PRESETS,
  type PlaygroundState,
} from "./playgroundConfig";

interface Props {
  style: Style | null;
  onClose: () => void;
}

/**
 * Style detail dialog & interactive Style Playground.
 * Native <dialog>.showModal() provides the focus trap, Esc-to-close, inert background and focus return.
 */
export function StyleDetail({ style, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (style && !d.open) d.showModal();
    if (!style && d.open) d.close();
  }, [style]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="detail-title"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
      className="m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 backdrop:bg-transparent sm:m-auto sm:h-auto sm:max-h-[92dvh] sm:w-[min(1120px,calc(100%-3rem))] sm:rounded-2xl"
    >
      {style && (
        <div className="flex h-full max-h-[inherit] flex-col overflow-hidden border-line bg-surface text-fg sm:rounded-2xl sm:border">
          <header className="flex items-start gap-3 border-b border-line px-4 py-3 sm:px-6 sm:py-4">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-muted">
                #{String(style.id).padStart(2, "0")} · Source page {style.sourcePage}
              </p>
              <h2 id="detail-title" className="text-xl font-semibold tracking-tight sm:text-2xl">
                {style.name}
              </h2>
              {style.subtitle && <p className="text-sm text-muted sm:text-base">{style.subtitle}</p>}
              <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-medium text-accent">{style.categoryTab}</span>
                {style.era && <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-muted">Era: {style.era}</span>}
                {style.originalCategory && style.originalCategory !== style.categoryTab && (
                  <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-muted">Slide label: {style.originalCategory}</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="Close details"
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-line hover:bg-surface-2"
            >
              <X className="size-5" aria-hidden />
            </button>
          </header>

          <StyleDetailBody key={style.id} style={style} />
        </div>
      )}
    </dialog>
  );
}

/** Keyed by style.id so mode and Playground customizations reset cleanly when switching styles. */
function StyleDetailBody({ style }: { style: Style }) {
  const live = hasPreview(style.id);
  const [mode, setMode] = useState<PreviewMode>(live ? "live" : "slide");
  const config = useMemo(() => getPlaygroundConfig(style), [style]);
  const defaults = useMemo(() => getDefaultPlaygroundState(style), [style]);
  const [pgState, setPgState] = useState<PlaygroundState>(defaults);

  const previewVars = useMemo(() => buildPreviewVars(config, pgState), [config, pgState]);
  const generatedCss = useMemo(() => formatGeneratedCss(style, config, pgState), [style, config, pgState]);
  const isDefault = isPlaygroundDefault(pgState, defaults);

  const viewportPreset = VIEWPORT_PRESETS.find((v) => v.id === pgState.viewport) ?? VIEWPORT_PRESETS[0];
  const backdropOption = BACKDROP_OPTIONS.find((b) => b.id === pgState.backdrop) ?? BACKDROP_OPTIONS[0];
  const isFramed = pgState.viewport !== "desktop" || pgState.backdrop !== "auto";

  const updateState = (patch: Partial<PlaygroundState>) => setPgState((prev) => ({ ...prev, ...patch }));
  const resetState = () => setPgState(defaults);

  return (
    <div className="grid flex-1 gap-6 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <section aria-label="Reference visual" className="min-w-0 space-y-3">
        {mode === "compare" && live ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" data-playground-compare="">
            <figure className="space-y-1.5">
              <figcaption className="text-xs font-medium text-muted">Original slide</figcaption>
              <div className="overflow-hidden rounded-xl border border-line">
                <StyleImage style={style} eager />
              </div>
            </figure>
            <figure className="space-y-1.5">
              <figcaption className="text-xs font-medium text-muted">Live CSS ({viewportPreset.label})</figcaption>
              <div
                data-playground-stage=""
                data-backdrop={pgState.backdrop}
                className={`flex justify-center overflow-hidden rounded-xl border border-line transition-colors ${backdropOption.className} ${
                  isFramed ? "p-2.5" : ""
                }`}
              >
                <div
                  data-viewport-frame={pgState.viewport}
                  style={{ width: viewportPreset.frameWidth }}
                  className={`transition-[width] duration-200 ${
                    pgState.viewport !== "desktop" ? "overflow-hidden rounded-lg border border-line-strong shadow-card" : ""
                  }`}
                >
                  <PreviewStage id={style.id} name={style.name} vars={previewVars} />
                </div>
              </div>
            </figure>
          </div>
        ) : mode === "live" && live ? (
          <div
            data-playground-stage=""
            data-backdrop={pgState.backdrop}
            className={`flex justify-center overflow-hidden rounded-xl border border-line transition-colors ${backdropOption.className} ${
              isFramed ? "p-3" : ""
            }`}
          >
            <div
              data-viewport-frame={pgState.viewport}
              style={{ width: viewportPreset.frameWidth }}
              className={`transition-[width] duration-200 ${
                pgState.viewport !== "desktop" ? "overflow-hidden rounded-lg border border-line-strong shadow-card" : ""
              }`}
            >
              <PreviewStage id={style.id} name={style.name} vars={previewVars} />
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line">
            <StyleImage style={style} eager />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          {live ? (
            <PreviewToggle mode={mode} onChange={setMode} name={style.name} allowCompare />
          ) : (
            <span className="text-muted">Original reference image</span>
          )}
          <a
            href={style.imagePath}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 font-medium text-accent hover:bg-accent-soft"
          >
            Open original image <ExternalLink className="size-4" aria-hidden />
          </a>
        </div>

        {live && mode !== "slide" && (
          <PlaygroundControls
            config={config}
            state={pgState}
            isDefault={isDefault}
            onChange={updateState}
            onReset={resetState}
          />
        )}

        {live ? (
          <p className="text-xs text-muted">
            Live CSS is a hand-built interactive interpretation of the slide, not the original artwork. Its CSS is separate from the
            original snippet below.
          </p>
        ) : (
          <p className="rounded-xl border border-dashed border-line px-3 py-2 text-sm text-muted">
            Live interactive CSS preview: planned, not yet available for this style.
          </p>
        )}
      </section>

      <div className="min-w-0 space-y-6">
        <section aria-labelledby="where-h">
          <h3 id="where-h" className="text-xs font-semibold tracking-wide text-muted uppercase">Where to use</h3>
          <p className="mt-1 leading-relaxed">{style.whereToUse}</p>
        </section>
        <section aria-labelledby="how-h">
          <h3 id="how-h" className="text-xs font-semibold tracking-wide text-muted uppercase">How to use</h3>
          <p className="mt-1 leading-relaxed">{style.howToUse}</p>
        </section>
        <section aria-labelledby="palette-h" className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 id="palette-h" className="text-xs font-semibold tracking-wide text-muted uppercase">
              Color palette · {style.palette.length}
            </h3>
            <CopyButton text={style.palette.join(", ")} label="Copy Palette" />
          </div>
          <Palette colors={style.palette} names={style.paletteNames} />
          <p className="text-xs text-muted">Click a swatch to copy its exact value.</p>
        </section>
        <section aria-label="AI prompt and CSS">
          <SourceTabs style={style} generatedCss={generatedCss} />
        </section>
      </div>
    </div>
  );
}
