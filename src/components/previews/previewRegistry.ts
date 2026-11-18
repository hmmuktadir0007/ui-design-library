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
export const previewRegistry: Partial<Record<number, () => Promise<PreviewModule>>> = {};

export const hasPreview = (id: number) => previewRegistry[id] !== undefined;
