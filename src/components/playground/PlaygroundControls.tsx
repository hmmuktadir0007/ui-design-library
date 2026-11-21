import { Monitor, RotateCcw, Smartphone, Tablet } from "lucide-react";
import { useId } from "react";
import {
  BACKDROP_OPTIONS,
  hasCssCustomizations,
  VIEWPORT_PRESETS,
  type BackdropId,
  type PlaygroundState,
  type StylePlaygroundConfig,
  type ViewportPresetId,
} from "./playgroundConfig";

interface Props {
  config: StylePlaygroundConfig;
  state: PlaygroundState;
  isDefault: boolean;
  onChange: (patch: Partial<PlaygroundState>) => void;
  onReset: () => void;
}

const VIEWPORT_ICONS: Record<ViewportPresetId, typeof Monitor> = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
};

/**
 * Interactive Playground controls for viewport framing, stage backdrop, and style-relevant CSS variables.
 * Only renders CSS-variable controls that the active style genuinely supports (never dead controls).
 */
export function PlaygroundControls({ config, state, isDefault, onChange, onReset }: Props) {
  const baseId = useId();
  const hasVars = hasCssCustomizations(config);

  return (
    <section
      aria-label="Playground controls"
      className="space-y-3 rounded-xl border border-line bg-surface-2/60 p-3 text-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Viewport preset"
            className="inline-flex rounded-lg border border-line bg-surface p-0.5"
          >
            {VIEWPORT_PRESETS.map((preset) => {
              const Icon = VIEWPORT_ICONS[preset.id];
              const active = state.viewport === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ viewport: preset.id })}
                  className={`inline-flex min-h-8 items-center gap-1 rounded-md px-2 text-xs font-medium ${
                    active ? "bg-fg text-bg" : "text-muted hover:text-fg"
                  }`}
                >
                  <Icon className="size-3.5" aria-hidden />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>

          <div
            role="group"
            aria-label="Preview theme"
            className="inline-flex rounded-lg border border-line bg-surface p-0.5"
          >
            {BACKDROP_OPTIONS.map((opt) => {
              const active = state.backdrop === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ backdrop: opt.id as BackdropId })}
                  className={`min-h-8 rounded-md px-2 text-xs font-medium ${
                    active ? "bg-fg text-bg" : "text-muted hover:text-fg"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          disabled={isDefault}
          className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-medium text-fg transition-colors hover:border-line-strong hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Reset
        </button>
      </div>

      {hasVars && (
        <div className="grid gap-3 border-t border-line pt-3 sm:grid-cols-2">
          {config.accent && state.accent && (
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor={`${baseId}-accent`} className="font-medium text-fg">
                  Accent color
                </label>
                <span className="font-mono text-[11px] text-muted">{state.accent.toUpperCase()}</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {config.accent.swatches.map((hex) => {
                  const selected = state.accent?.toUpperCase() === hex;
                  return (
                    <button
                      key={hex}
                      type="button"
                      aria-label={`Accent swatch ${hex}`}
                      aria-pressed={selected}
                      onClick={() => onChange({ accent: hex })}
                      className={`size-7 rounded-md border transition-transform ${
                        selected ? "scale-105 border-fg ring-2 ring-accent ring-offset-1 ring-offset-surface" : "border-line-strong hover:scale-105"
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  );
                })}
                <input
                  id={`${baseId}-accent`}
                  type="color"
                  aria-label="Custom accent color"
                  value={state.accent}
                  onChange={(e) => onChange({ accent: e.target.value.toUpperCase() })}
                  className="h-7 w-9 cursor-pointer rounded-md border border-line bg-surface p-0.5"
                />
              </div>
            </div>
          )}

          {config.radius && state.radius !== undefined && (
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor={`${baseId}-radius`} className="font-medium text-fg">
                  {config.radius.label}
                </label>
                <span className="font-mono text-[11px] text-muted">{state.radius}px</span>
              </div>
              <input
                id={`${baseId}-radius`}
                type="range"
                min={config.radius.min}
                max={config.radius.max}
                step={config.radius.step}
                value={state.radius}
                onChange={(e) => onChange({ radius: Number(e.target.value) })}
                className="h-6 w-full cursor-pointer accent-accent"
              />
            </div>
          )}

          {config.scale && state.scale !== undefined && (
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor={`${baseId}-scale`} className="font-medium text-fg">
                  {config.scale.label}
                </label>
                <span className="font-mono text-[11px] text-muted">{state.scale.toFixed(2)}×</span>
              </div>
              <input
                id={`${baseId}-scale`}
                type="range"
                min={config.scale.min}
                max={config.scale.max}
                step={config.scale.step}
                value={state.scale}
                onChange={(e) => onChange({ scale: Number(e.target.value) })}
                className="h-6 w-full cursor-pointer accent-accent"
              />
            </div>
          )}

          {config.shadow && state.shadow !== undefined && (
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor={`${baseId}-shadow`} className="font-medium text-fg">
                  {config.shadow.label}
                </label>
                <span className="font-mono text-[11px] text-muted">{state.shadow.toFixed(1)}×</span>
              </div>
              <input
                id={`${baseId}-shadow`}
                type="range"
                min={config.shadow.min}
                max={config.shadow.max}
                step={config.shadow.step}
                value={state.shadow}
                onChange={(e) => onChange({ shadow: Number(e.target.value) })}
                className="h-6 w-full cursor-pointer accent-accent"
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
