import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import { previewRegistry, type PreviewProps } from "./previewRegistry";

const LAZY_PREVIEWS: Partial<Record<number, LazyExoticComponent<ComponentType<PreviewProps>>>> = Object.fromEntries(
  Object.entries(previewRegistry)
    .filter((entry): entry is [string, NonNullable<(typeof entry)[1]>] => Boolean(entry[1]))
    .map(([id, load]) => [Number(id), lazy(load)]),
);

/** Renders the registered live preview for a style, code-split per style. Returns null when none is registered. */
export function StylePreview({ id, ...props }: PreviewProps & { id: number }) {
  const Preview = LAZY_PREVIEWS[id];
  if (!Preview) return null;
  return (
    <Suspense fallback={<div className="aspect-[969/777] w-full animate-pulse rounded-xl bg-surface-2" />}>
      <Preview {...props} />
    </Suspense>
  );
}
