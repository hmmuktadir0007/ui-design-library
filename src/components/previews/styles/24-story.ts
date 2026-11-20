/**
 * Scroll position of the chapter column -> story state. Every chapter is exactly one scroller viewport tall,
 * so chapter i starts at i * viewH; the chapter whose top is nearest the viewport top is active.
 */
export function storyState(scrollTop: number, scrollHeight: number, viewH: number, chapters: number) {
  const max = scrollHeight - viewH;
  const progress = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;
  const active = viewH > 0 ? Math.min(chapters - 1, Math.max(0, Math.round(scrollTop / viewH))) : 0;
  return { active, progress };
}
