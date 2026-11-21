import type { Style } from "../../types/style";

export type ViewportPresetId = "desktop" | "tablet" | "mobile";
export type BackdropId = "auto" | "light" | "dark" | "neutral";

export interface ViewportPreset {
  id: ViewportPresetId;
  label: string;
  caption: string;
  /** CSS width value applied to the resizable preview frame so Desktop > Tablet > Mobile on every screen size. */
  frameWidth: string;
}

export const VIEWPORT_PRESETS: readonly ViewportPreset[] = [
  { id: "desktop", label: "Desktop", caption: "1280px", frameWidth: "100%" },
  { id: "tablet", label: "Tablet", caption: "768px · 4:3", frameWidth: "min(86%, 390px)" },
  { id: "mobile", label: "Mobile", caption: "375px · 9:16", frameWidth: "min(76%, 336px)" },
] as const;

export interface BackdropOption {
  id: BackdropId;
  label: string;
  className: string;
}

export const BACKDROP_OPTIONS: readonly BackdropOption[] = [
  { id: "auto", label: "Auto", className: "bg-surface-2" },
  { id: "light", label: "Light", className: "bg-[#f8fafc]" },
  { id: "dark", label: "Dark", className: "bg-[#09090b]" },
  { id: "neutral", label: "Neutral", className: "bg-[#d4d4d8]" },
] as const;

export interface AccentControlSpec {
  varName: "--pg-accent";
  cssProp: "--accent";
  defaultValue: string;
  swatches: string[];
}

export interface RangeControlSpec<V extends `--pg-${string}` = `--pg-${string}`> {
  varName: V;
  cssProp: string;
  label: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  unit: string;
}

export interface StylePlaygroundConfig {
  accent?: AccentControlSpec;
  radius?: RangeControlSpec<"--pg-radius">;
  scale?: RangeControlSpec<"--pg-scale">;
  shadow?: RangeControlSpec<"--pg-shadow-strength">;
}

export interface PlaygroundState {
  viewport: ViewportPresetId;
  backdrop: BackdropId;
  accent?: string;
  radius?: number;
  scale?: number;
  shadow?: number;
}

interface RawStyleSpec {
  /** Default primary accent hex (seeded from the style's palette). Omit on pure monochrome styles. */
  accent?: string;
  /** Default border radius in px. Omit on styles where sharp 0px corners are essential. */
  radius?: { defaultValue: number; min?: number; max?: number };
  /** Enable surface padding/density scale (--pg-scale). */
  scale?: boolean;
  /** Enable shadow/depth intensity (--pg-shadow-strength, 0..1.5). */
  shadow?: boolean;
}

/**
 * Per-style CSS-variable registry for styles whose CSS Modules consume --pg-* custom properties.
 * Every declared entry is verified by playgroundConfig.test.ts against the matching *.module.css file
 * so no style ever exposes a dead control.
 */
const STYLE_SPECS: Partial<Record<number, RawStyleSpec>> = {
  // Morphism & Depth (10/10)
  1: { accent: "#C97A3E", radius: { defaultValue: 18, min: 4, max: 28 }, scale: true, shadow: true },
  4: { accent: "#3B82F6", radius: { defaultValue: 20, min: 4, max: 32 }, scale: true, shadow: true },
  5: { accent: "#7C3AED", radius: { defaultValue: 20, min: 4, max: 32 }, scale: true, shadow: true },
  6: { accent: "#A7F3D0", radius: { defaultValue: 34, min: 12, max: 44 }, scale: true, shadow: true },
  10: { accent: "#38BDF8", radius: { defaultValue: 26, min: 8, max: 36 }, scale: true, shadow: true },
  18: { accent: "#4F46E5", radius: { defaultValue: 10, min: 0, max: 24 }, shadow: true },
  31: { accent: "#38BDF8", radius: { defaultValue: 28, min: 8, max: 38 }, scale: true, shadow: true },
  34: { accent: "#0284C7", shadow: true },
  45: { accent: "#38BDF8", radius: { defaultValue: 18, min: 4, max: 30 }, scale: true, shadow: true },
  46: { accent: "#FF4F00", radius: { defaultValue: 10, min: 0, max: 22 }, scale: true, shadow: true },
  // Modern SaaS & Dashboards (6)
  3: { accent: "#6750A4", radius: { defaultValue: 16, min: 0, max: 28 }, scale: true, shadow: true },
  8: { accent: "#3B82F6", radius: { defaultValue: 18, min: 4, max: 28 }, scale: true, shadow: true },
  30: { accent: "#3B82F6", radius: { defaultValue: 12, min: 0, max: 24 }, scale: true, shadow: true },
  32: { accent: "#2563EB", radius: { defaultValue: 12, min: 0, max: 24 }, scale: true, shadow: true },
  47: { accent: "#059669", radius: { defaultValue: 4, min: 0, max: 14 }, scale: true },
  48: { accent: "#E11D48", radius: { defaultValue: 14, min: 0, max: 24 }, scale: true, shadow: true },
  // Bold, Retro & Expressive (5 — 07, 21, 38 omit radius for sharp corners)
  7: { accent: "#E2FF00", scale: true, shadow: true },
  21: { accent: "#38B764", scale: true },
  38: { accent: "#000080" },
  39: { accent: "#58CC02", radius: { defaultValue: 22, min: 4, max: 32 }, scale: true, shadow: true },
  49: { accent: "#FFB7C5", radius: { defaultValue: 28, min: 8, max: 38 }, scale: true, shadow: true },
  // Minimal & Typographic (3 — 11 & 25 omit radius for sharp corners; 25 stays pure monochrome)
  2: { accent: "#14B8A6", radius: { defaultValue: 6, min: 0, max: 18 } },
  11: { accent: "#E11D48", scale: true },
  25: { scale: true },
  // Atmospheric & Futuristic (2)
  9: { accent: "#2DD4BF", radius: { defaultValue: 14, min: 0, max: 28 }, scale: true },
  28: { accent: "#8B5CF6", radius: { defaultValue: 10, min: 0, max: 24 }, shadow: true },
  // Art & Heritage Movements (2 — 13 omits radius for sharp Bauhaus geometry)
  13: { accent: "#D92B2B", scale: true },
  20: { accent: "#FFDE59", radius: { defaultValue: 12, min: 0, max: 24 }, shadow: true },
};

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/** Extracts valid 6-digit hex swatches from a style's palette, ensuring the default accent is always present. */
function hexSwatches(palette: string[], fallback: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of [fallback, ...palette]) {
    const trimmed = raw.trim();
    if (!HEX_RE.test(trimmed)) continue;
    const upper = trimmed.toUpperCase();
    if (seen.has(upper)) continue;
    seen.add(upper);
    out.push(upper);
  }
  return out;
}

export function getPlaygroundConfig(style: Style): StylePlaygroundConfig {
  const spec = STYLE_SPECS[style.id];
  if (!spec) return {};
  const config: StylePlaygroundConfig = {};
  if (spec.accent) {
    const def = spec.accent.toUpperCase();
    config.accent = {
      varName: "--pg-accent",
      cssProp: "--accent",
      defaultValue: def,
      swatches: hexSwatches(style.palette, def),
    };
  }
  if (spec.radius) {
    config.radius = {
      varName: "--pg-radius",
      cssProp: "--radius",
      label: "Border radius",
      defaultValue: spec.radius.defaultValue,
      min: spec.radius.min ?? 0,
      max: spec.radius.max ?? 28,
      step: 1,
      unit: "px",
    };
  }
  if (spec.scale) {
    config.scale = {
      varName: "--pg-scale",
      cssProp: "--density",
      label: "Surface padding",
      defaultValue: 1,
      min: 0.75,
      max: 1.35,
      step: 0.05,
      unit: "×",
    };
  }
  if (spec.shadow) {
    config.shadow = {
      varName: "--pg-shadow-strength",
      cssProp: "--shadow-strength",
      label: "Shadow depth",
      defaultValue: 1,
      min: 0,
      max: 1.5,
      step: 0.1,
      unit: "×",
    };
  }
  return config;
}

export function hasCssCustomizations(config: StylePlaygroundConfig): boolean {
  return Boolean(config.accent || config.radius || config.scale || config.shadow);
}

export function getDefaultPlaygroundState(style: Style): PlaygroundState {
  const config = getPlaygroundConfig(style);
  return {
    viewport: "desktop",
    backdrop: "auto",
    accent: config.accent?.defaultValue,
    radius: config.radius?.defaultValue,
    scale: config.scale?.defaultValue,
    shadow: config.shadow?.defaultValue,
  };
}

export function isPlaygroundDefault(state: PlaygroundState, defaults: PlaygroundState): boolean {
  return (
    state.viewport === defaults.viewport &&
    state.backdrop === defaults.backdrop &&
    state.accent?.toUpperCase() === defaults.accent?.toUpperCase() &&
    state.radius === defaults.radius &&
    state.scale === defaults.scale &&
    state.shadow === defaults.shadow
  );
}

/** Builds the live --pg-* CSS custom property map passed to PreviewStage / PreviewProps.vars. */
export function buildPreviewVars(
  config: StylePlaygroundConfig,
  state: PlaygroundState,
): Record<`--${string}`, string> {
  const vars: Record<`--${string}`, string> = {};
  if (config.accent && state.accent) {
    vars[config.accent.varName] = state.accent;
  }
  if (config.radius && state.radius !== undefined) {
    vars[config.radius.varName] = `${state.radius}px`;
  }
  if (config.scale && state.scale !== undefined) {
    vars[config.scale.varName] = String(Number(state.scale.toFixed(2)));
  }
  if (config.shadow && state.shadow !== undefined) {
    vars[config.shadow.varName] = String(Number(state.shadow.toFixed(2)));
  }
  return vars;
}

/**
 * Formats copy-ready CSS custom properties reflecting the active Playground customizations.
 * Lists only variables supported by the current style; returns empty string if none are supported.
 */
export function formatGeneratedCss(
  style: Style,
  config: StylePlaygroundConfig,
  state: PlaygroundState,
): string {
  const lines: string[] = [];
  if (config.accent && state.accent) {
    lines.push(`  ${config.accent.cssProp}: ${state.accent.toUpperCase()};`);
  }
  if (config.radius && state.radius !== undefined) {
    lines.push(`  ${config.radius.cssProp}: ${state.radius}px;`);
  }
  if (config.scale && state.scale !== undefined) {
    lines.push(`  ${config.scale.cssProp}: ${Number(state.scale.toFixed(2))};`);
  }
  if (config.shadow && state.shadow !== undefined) {
    lines.push(`  ${config.shadow.cssProp}: ${Number(state.shadow.toFixed(2))};`);
  }
  if (lines.length === 0) return "";
  return `/* ${style.name} — Playground custom properties */\n:root {\n${lines.join("\n")}\n}`;
}

export const CONFIGURED_STYLE_IDS = Object.keys(STYLE_SPECS)
  .map(Number)
  .sort((a, b) => a - b);
