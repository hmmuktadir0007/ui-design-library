import { useRef, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  valueText?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Headless rotary control (ARIA slider). Drag vertically, use arrow/Page/Home/End keys, or touch.
 * Exposes --turn (0..1) so each preview styles its own knob, e.g. rotate(calc(-135deg + var(--turn) * 270deg)).
 * Pointer capture keeps the drag on this element; no global listeners to clean up.
 */
export function Knob({ label, value, min, max, step = 1, onChange, valueText, className, children }: Props) {
  const drag = useRef<{ y: number; v: number } | null>(null);
  const set = (v: number) => onChange(Math.min(max, Math.max(min, Math.round(v / step) * step)));

  const onKeyDown = (e: KeyboardEvent) => {
    const big = step * 10;
    const next: Record<string, number> = {
      ArrowUp: value + step, ArrowRight: value + step, ArrowDown: value - step, ArrowLeft: value - step,
      PageUp: value + big, PageDown: value - big, Home: min, End: max,
    };
    if (e.key in next) {
      e.preventDefault();
      set(next[e.key]);
    }
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus();
    drag.current = { y: e.clientY, v: value };
  };
  const onPointerMove = (e: PointerEvent) => {
    if (drag.current) set(drag.current.v + ((drag.current.y - e.clientY) * (max - min)) / 160);
  };
  const end = () => {
    drag.current = null;
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
      className={className}
      style={{ "--turn": (value - min) / (max - min), touchAction: "none" } as CSSProperties}
    >
      {children}
    </div>
  );
}
