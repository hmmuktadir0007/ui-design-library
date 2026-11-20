import type { ComponentType } from "react";

/**
 * Contract for a live CSS preview (Phase 2B+).
 * Each preview is its own module `previews/styles/NN-name.tsx` with a sibling `NN-name.module.css`,
 * so its CSS is scoped and cannot leak into the gallery or other previews.
 * `vars` carries future Playground customizations as CSS custom properties on the preview root.
 */
export interface PreviewProps {
  vars?: Record<`--${string}`, string>;
}

export interface PreviewModule {
  default: ComponentType<PreviewProps>;
}

/**
 * Style id -> lazy loader. Register a style only once its preview is finished:
 *   7: () => import("./styles/07-neo-brutalism"),
 * Unregistered styles show the reference image only; no Live CSS control is rendered for them.
 */
export const previewRegistry: Partial<Record<number, () => Promise<PreviewModule>>> = {
  // Phase 2B batch 1: Morphism & Depth
  1: () => import("./styles/01-skeuomorphism"),
  4: () => import("./styles/04-neumorphism"),
  5: () => import("./styles/05-glassmorphism"),
  6: () => import("./styles/06-claymorphism"),
  10: () => import("./styles/10-liquid-glass"),
  18: () => import("./styles/18-spatial-3d"),
  31: () => import("./styles/31-visionos"),
  34: () => import("./styles/34-isometric"),
  45: () => import("./styles/45-obsidian-glass"),
  46: () => import("./styles/46-tactile-hardware"),
  // Phase 2B batch 2: Bold, Retro & Expressive
  7: () => import("./styles/07-neo-brutalism"),
  12: () => import("./styles/12-maximalism"),
  15: () => import("./styles/15-y2k"),
  21: () => import("./styles/21-pixel-art"),
  33: () => import("./styles/33-corporate-memphis"),
  36: () => import("./styles/36-acid-graphics"),
  38: () => import("./styles/38-windows-95"),
  39: () => import("./styles/39-gamified"),
  42: () => import("./styles/42-pop-art"),
  49: () => import("./styles/49-kawaii"),
  // Phase 2B batch 3: Modern SaaS & Dashboards
  3: () => import("./styles/03-material"),
  8: () => import("./styles/08-bento"),
  14: () => import("./styles/14-cyberminimalism"),
  29: () => import("./styles/29-data-dense"),
  30: () => import("./styles/30-command-first"),
  32: () => import("./styles/32-flat-2"),
  37: () => import("./styles/37-terminal"),
  47: () => import("./styles/47-heatmap"),
  48: () => import("./styles/48-masonry"),
  // Phase 2B batch 4: Minimal & Typographic
  2: () => import("./styles/02-flat"),
  11: () => import("./styles/11-swiss"),
  17: () => import("./styles/17-kinetic-type"),
  23: () => import("./styles/23-editorial"),
  25: () => import("./styles/25-noir"),
  41: () => import("./styles/41-zen"),
  43: () => import("./styles/43-variable-font"),
  // Phase 2B batch 5: Atmospheric & Futuristic
  9: () => import("./styles/09-aurora"),
  16: () => import("./styles/16-cyber-hud"),
  22: () => import("./styles/22-synthwave"),
  24: () => import("./styles/24-scrollytelling"),
  28: () => import("./styles/28-motion-first"),
  35: () => import("./styles/35-holographic"),
  // Phase 2B batch 6: Art & Heritage Movements
  13: () => import("./styles/13-bauhaus"),
  19: () => import("./styles/19-art-deco"),
  20: () => import("./styles/20-memphis"),
  26: () => import("./styles/26-organic"),
  27: () => import("./styles/27-paper-collage"),
  40: () => import("./styles/40-neoclassical"),
  44: () => import("./styles/44-low-poly"),
  50: () => import("./styles/50-sketchbook"),
};

export const hasPreview = (id: number) => previewRegistry[id] !== undefined;
