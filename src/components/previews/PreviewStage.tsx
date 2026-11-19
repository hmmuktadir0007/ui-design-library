import { useLayoutEffect, useRef, useState } from "react";
import { StylePreview } from "./StylePreview";

/** Every preview is authored on a fixed artboard with the reference image's aspect ratio (969×777)... */
export const ARTBOARD_WIDTH = 420;

/** Touch target goal in screen px (WCAG 2.5.5). */
const MIN_TARGET = 44;
const CONTROLS = 'button, input, [role="slider"], [role="radio"], [role="switch"]';
const INPUT_PROPS = ["height", "border-block", "margin-top", "margin-bottom", "position", "z-index"];

/**
 * Splits the extra size a control needs between its two sides (screen px). Each side may take at most half its free
 * room, so two facing controls never overlap; a side short of room hands the rest to the other side.
 */
export function split(size: number, roomA: number, roomB: number): [number, number] {
  const need = Math.max(0, MIN_TARGET - size);
  const b = Math.min(roomB / 2, need / 2);
  const a = Math.min(roomA / 2, need - b);
  return [a, Math.min(roomB / 2, need - a)];
}

/**
 * Grows each control's hit area toward MIN_TARGET screen px without changing how it looks.
 * Room on each side = gap to the nearest control on that side (pairs are kept apart along the axis where they are
 * furthest apart) or twice the distance to the stage edge, which clips everything outside it.
 * Buttons/ARIA widgets get a transparent ::after (see index.css); range inputs, which have no ::after,
 * get a transparent top/bottom border offset by negative margins; their visible track must be drawn on
 * ::-webkit-slider-runnable-track / ::-moz-range-track, never on the input box itself.
 */
function extendHitAreas(root: HTMLElement, scale: number) {
  const els = [...root.querySelectorAll<HTMLElement>(CONTROLS)];
  for (const el of els) {
    if (el instanceof HTMLInputElement) INPUT_PROPS.forEach((p) => el.style.removeProperty(p));
  }
  const stage = root.getBoundingClientRect();
  const boxes = els.map((el) => el.getBoundingClientRect());
  els.forEach((el, i) => {
    const b = boxes[i];
    const room = { l: 2 * (b.left - stage.left), r: 2 * (stage.right - b.right), t: 2 * (b.top - stage.top), b: 2 * (stage.bottom - b.bottom) };
    boxes.forEach((o, j) => {
      if (j === i) return;
      const dx = Math.max(o.left - b.right, b.left - o.right);
      const dy = Math.max(o.top - b.bottom, b.top - o.bottom);
      if (dx < -1 && dy < -1) room.l = room.r = room.t = room.b = 0; // nested: leave as is; -1 tolerates touching segments
      else if (dx >= dy) {
        const side = o.left >= b.right - 1 ? "r" : "l";
        room[side] = Math.min(room[side], Math.max(0, dx));
      } else {
        const side = o.top >= b.bottom - 1 ? "b" : "t";
        room[side] = Math.min(room[side], Math.max(0, dy));
      }
    });
    const [l, r] = split(b.width, Math.max(0, room.l), Math.max(0, room.r)).map((v) => v / scale); // artboard px
    const [t, btm] = split(b.height, Math.max(0, room.t), Math.max(0, room.b)).map((v) => v / scale);
    if (el instanceof HTMLInputElement) {
      // Chrome centres a range track in the border box, so the border must be equal on both sides.
      const half = Math.max(0, Math.min(room.t, room.b, MIN_TARGET - b.height)) / 2 / scale;
      if (half === 0) return;
      const c = getComputedStyle(el);
      el.style.height = `${el.offsetHeight + 2 * half}px`;
      el.style.borderBlock = `${half}px solid transparent`;
      el.style.marginTop = `${parseFloat(c.marginTop) - half}px`;
      el.style.marginBottom = `${parseFloat(c.marginBottom) - half}px`;
      if (c.position === "static") el.style.position = "relative";
      el.style.zIndex = "1"; // the transparent border must sit above captions painted after the input
      return;
    }
    const c = getComputedStyle(el);
    if (c.position === "static") el.style.position = "relative";
    // ::after is positioned from the padding box, so add the border back to start from the visible edge.
    const px = (v: number, border: string) => `${v + parseFloat(border)}px`;
    el.style.setProperty("--hl", px(l, c.borderLeftWidth));
    el.style.setProperty("--hr", px(r, c.borderRightWidth));
    el.style.setProperty("--ht", px(t, c.borderTopWidth));
    el.style.setProperty("--hb", px(btm, c.borderBottomWidth));
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
