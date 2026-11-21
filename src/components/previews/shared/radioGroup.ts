import type { KeyboardEvent } from "react";

/**
 * WAI-ARIA Radio Group keyboard handler for a `role="radiogroup"` container.
 * Pair with `tabIndex={checked ? 0 : -1}` on each `role="radio"` button so the
 * group takes a single Tab stop and Arrow keys move focus + selection (wrapping).
 */
export function onRadioGroupKeyDown(e: KeyboardEvent<HTMLElement>) {
  const dir =
    e.key === "ArrowRight" || e.key === "ArrowDown"
      ? 1
      : e.key === "ArrowLeft" || e.key === "ArrowUp"
        ? -1
        : 0;
  if (!dir) return;
  const radios = [...e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]:not([disabled]):not([aria-disabled="true"])')];
  if (radios.length < 2) return;
  const current = (e.target as HTMLElement).closest<HTMLElement>('[role="radio"]');
  const idx = current ? radios.indexOf(current) : -1;
  if (idx < 0) return;
  e.preventDefault();
  const next = radios[(idx + dir + radios.length) % radios.length];
  next.focus();
  next.click();
}
