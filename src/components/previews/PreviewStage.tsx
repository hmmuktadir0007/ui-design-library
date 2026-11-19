import { useLayoutEffect, useRef, useState } from "react";
import { StylePreview } from "./StylePreview";

/** Every preview is authored on a fixed artboard with the reference image's aspect ratio (969×777)... */
export const ARTBOARD_WIDTH = 420;

/** Touch target goal in screen px (WCAG 2.5.5). */
const MIN_TARGET = 44;
const CONTROLS = 'button, input, [role="slider"], [role="radio"], [role="switch"]';
const INPUT_PROPS = ["height", "border-block", "margin-block", "background-clip"];

/**
 * Grows each control's hit area toward MIN_TARGET screen px without changing how it looks.
 * Each side grows by at most half the gap to the nearest control on that axis, so hit areas never overlap;
 * controls packed tighter than 44px (as on the slides) keep a smaller area and are reported in PROGRESS.md.
 * Buttons/ARIA widgets get a transparent ::after (see index.css); range inputs, which have no ::after,
 * get a transparent border offset by a negative margin.
 */
function extendHitAreas(root: HTMLElement, scale: number) {
  const els = [...root.querySelectorAll<HTMLElement>(CONTROLS)];
  for (const el of els) {
    if (el instanceof HTMLInputElement) INPUT_PROPS.forEach((p) => el.style.removeProperty(p));
  }
  const boxes = els.map((el) => el.getBoundingClientRect());
  els.forEach((el, i) => {
    const b = boxes[i];
    // Each pair stays apart along the axis where it is furthest apart (both controls pick the same axis).
    let roomX = Infinity;
    let roomY = Infinity;
    boxes.forEach((o, j) => {
      if (j === i) return;
      const dx = Math.max(o.left - b.right, b.left - o.right);
      const dy = Math.max(o.top - b.bottom, b.top - o.bottom);
      if (dx < -1 && dy < -1) roomX = roomY = 0; // already overlapping (nested): leave as is; -1 tolerates touching segments
      else if (dx >= dy) roomX = Math.min(roomX, Math.max(0, dx));
      else roomY = Math.min(roomY, Math.max(0, dy));
    });
    const grow = (size: number, room: number) => Math.min(room / 2, Math.max(0, (MIN_TARGET - size) / 2)) / scale; // artboard px
    const hx = grow(b.width, roomX);
    const hy = grow(b.height, roomY);
    if (el instanceof HTMLInputElement) {
      if (hy === 0) return;
      const c = getComputedStyle(el);
      el.style.height = `${el.offsetHeight + 2 * hy}px`;
      el.style.borderBlock = `${hy}px solid transparent`;
      el.style.marginBlock = `${parseFloat(c.marginTop) - hy}px ${parseFloat(c.marginBottom) - hy}px`;
      el.style.backgroundClip = "padding-box";
      return;
    }
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.style.setProperty("--hx", `${hx}px`);
    el.style.setProperty("--hy", `${hy}px`);
    el.dataset.hit = "";
  });
}

/**
 * ...and scaled to the available width, so card, dialog and mobile all show the same composition
 * and toggling Slide Visual <-> Live CSS causes no layout shift.
 * `interactive={false}` (gallery cards) renders the preview as a picture: inert, no tab stops, no touch targets.
 */
export function PreviewStage({ id, name, interactive = true }: { id: number; name: string; interactive?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / ARTBOARD_WIDTH));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Recompute after the lazy preview mounts and after anything that can move controls (state changes, transitions).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !interactive || scale === 0) return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => extendHitAreas(el, scale));
    };
    schedule();
    const mo = new MutationObserver(schedule);
    mo.observe(el, { childList: true, subtree: true });
    const events = ["click", "keyup", "pointerup", "transitionend"] as const;
    events.forEach((e) => el.addEventListener(e, schedule));
    return () => {
      cancelAnimationFrame(frame);
      mo.disconnect();
      events.forEach((e) => el.removeEventListener(e, schedule));
    };
  }, [interactive, scale]);

  return (
    <div
      ref={ref}
      role="group"
      aria-label={`${interactive ? "Live CSS preview" : "Live CSS preview, display only"}: ${name}`}
      data-preview-id={id}
      className="relative aspect-[969/777] w-full overflow-hidden bg-surface-2"
    >
      {scale > 0 && (
        <div
          inert={!interactive}
          className="absolute top-0 left-0 aspect-[969/777] origin-top-left"
          style={{ width: ARTBOARD_WIDTH, transform: `scale(${scale})` }}
        >
          <StylePreview id={id} />
        </div>
      )}
    </div>
  );
}
