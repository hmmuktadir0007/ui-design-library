import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import { previewRegistry, type PreviewProps } from "./previewRegistry";

const cache = new Map<number, LazyExoticComponent<ComponentType<PreviewProps>>>();

/** Renders the registered live preview for a style, code-split per style. Returns null when none is registered. */
export function StylePreview({ id, ...props }: PreviewProps & { id: number }) {
  const load = previewRegistry[id];
  if (!load) return null;
  if (!cache.has(id)) cache.set(id, lazy(load));
  const Preview = cache.get(id)!;
  return (
    <Suspense fallback={<div className="aspect-[969/777] w-full animate-pulse rounded-xl bg-surface-2" />}>
      <Preview {...props} />
    </Suspense>
  );
}
