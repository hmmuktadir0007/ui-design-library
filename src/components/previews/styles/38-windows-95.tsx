import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import s from "./38-windows-95.module.css";

const TABS = [
  { key: "general", label: "General", lines: ["[OK] 32-bit Architecture Ready", "• Display adapter: 800x600 High Color", "• RAM: 16.0 MB System Memory"] },
  { key: "hardware", label: "Hardware", lines: ["[OK] Sound Blaster 16 detected", "• Modem: 28.8 kbps on COM2", "• Mouse: 2-button serial"] },
  { key: "performance", label: "Performance", lines: ["[OK] File system: 32-bit", "• Virtual memory: 32-bit", "• Disk compression: not installed"] },
];
const BOUNDS = { x: [-70, 34], y: [-26, 50] }; // keeps the window on the desktop, above the taskbar
const clamp = (v: number, [lo, hi]: number[]) => Math.min(hi, Math.max(lo, v));

export default function Windows95() {
  const [tab, setTab] = useState(0);
  const [state, setState] = useState<"open" | "min" | "closed">("open");
  const [active, setActive] = useState(true);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number; scale: number } | null>(null);

  const move = (dx: number, dy: number) => setPos((p) => ({ x: clamp(p.x + dx, BOUNDS.x), y: clamp(p.y + dy, BOUNDS.y) }));

  // Drag the title bar; the artboard is scaled, so screen px are divided by the scale.
  const onDown = (e: PointerEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y, scale: el.getBoundingClientRect().width / el.offsetWidth };
  };
  const onMove = (e: PointerEvent) => {
    const d = drag.current;
    if (d) setPos({ x: clamp(d.px + (e.clientX - d.x) / d.scale, BOUNDS.x), y: clamp(d.py + (e.clientY - d.y) / d.scale, BOUNDS.y) });
  };
  // Keyboard alternative to dragging: arrow keys move the window by 10px.
  const onKey = (e: KeyboardEvent) => {
    const step: Record<string, [number, number]> = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] };
    if (e.key in step) {
      e.preventDefault();
      move(...step[e.key]);
    }
  };

  return (
    <div className={s.root} onPointerDown={() => setActive(false)}>
      <div className={s.icons}>
        <button type="button" className={s.icon} onClick={() => (setState("open"), setActive(true))} onPointerDown={(e) => e.stopPropagation()}>
          <span className={s.pc} aria-hidden />
          My PC
        </button>
        <span className={s.icon} aria-hidden>
          <span className={s.doc} />
          Docs
        </span>
        <span className={s.icon} aria-hidden>
          <span className={s.bin} />
          Recycle
        </span>
      </div>

      {state === "open" && (
        <section
          className={`${s.win} ${active ? "" : s.inactive}`}
          style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
          aria-label="System.exe"
          onPointerDown={(e) => (e.stopPropagation(), setActive(true))}
          onFocus={() => setActive(true)}
        >
          <div className={s.titleBar}>
            <button
              type="button"
              className={s.handle}
              aria-label="System.exe — Device Manager. Move window: drag or use arrow keys"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={() => (drag.current = null)}
              onPointerCancel={() => (drag.current = null)}
              onKeyDown={onKey}
            >
              <span className={s.appIcon} aria-hidden />
              <span aria-hidden>System.exe — Device Manager</span>
            </button>
            <button type="button" className={s.tbBtn} aria-label="Minimize" onClick={() => setState("min")}>
              _
            </button>
            <button type="button" className={s.tbBtn} aria-label="Close" onClick={() => setState("closed")}>
              ✕
            </button>
          </div>

          <div className={s.tabs} role="tablist" aria-label="System properties">
            {TABS.map((t, i) => (
              <button key={t.key} type="button" role="tab" aria-selected={i === tab} className={s.tab} onClick={() => setTab(i)}>
                {t.label}
              </button>
            ))}
          </div>
          <div className={s.pane} role="tabpanel" aria-label={TABS[tab].label}>
            <div className={s.about}>
              <span className={s.info} aria-hidden>i</span>
              <div>
                <p className={s.product}>Microsoft Windows 95</p>
                <p className={s.desc}>Retro OS UI framework. 3D beveled surfaces and legacy type intact.</p>
              </div>
            </div>
            <div className={s.console}>
              {TABS[tab].lines.map((l, i) => (
                <p key={l} className={i === 1 ? s.ok : ""}>{l}</p>
              ))}
            </div>
            <span className={s.progress} aria-hidden>
              {Array.from({ length: 7 + tab * 2 }, (_, i) => <span key={i} />)}
            </span>
          </div>
          <div className={s.buttons}>
            <button type="button" className={s.btn} onClick={() => setState("min")}>OK</button>
            <button type="button" className={s.btn} onClick={() => setState("closed")}>Cancel</button>
          </div>
        </section>
      )}

      <footer className={s.taskbar}>
        <span className={s.start} aria-hidden>
          <span className={s.flag} /> Start
        </span>
        {state !== "closed" && (
          <button
            type="button"
            className={s.task}
            aria-pressed={state === "open" && active}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => {
              setState(state === "min" ? "open" : active ? "min" : "open");
              setActive(true);
            }}
          >
            <span className={s.appIcon} aria-hidden /> System.exe
          </button>
        )}
        <span className={s.clock}>11:42 PM</span>
      </footer>
    </div>
  );
}
