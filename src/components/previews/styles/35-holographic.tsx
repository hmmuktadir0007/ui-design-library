import { useRef, useState, type PointerEvent } from "react";
import { onRadioGroupKeyDown } from "../shared/radioGroup";
import s from "./35-holographic.module.css";

const VARIANTS = [
  { label: "VIP", title: "VIP MEMBERSHIP", sub: "UNRESTRICTED ACCESS • TIER 01", pass: "#0042", holder: "0x8F9B...4D2E" },
  { label: "Creator", title: "CREATOR PASS", sub: "STUDIO ACCESS • TIER 02", pass: "#1187", holder: "0x31AC...90F7" },
];
const MAX = 18; // degrees
const STEP = 6;

export default function Holographic() {
  const card = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const tilt = useRef({ x: 0, y: 0 });
  const [flipped, setFlipped] = useState(false);
  const [foil, setFoil] = useState(true);
  const [variant, setVariant] = useState(0);
  const v = VARIANTS[variant];

  // Tilt is written straight to CSS custom properties (and the readout) so pointer moves never re-render React.
  const apply = (x: number, y: number) => {
    const t = { x: Math.max(-MAX, Math.min(MAX, Math.round(x))), y: Math.max(-MAX, Math.min(MAX, Math.round(y))) };
    tilt.current = t;
    card.current!.style.setProperty("--rx", `${t.x}deg`);
    card.current!.style.setProperty("--ry", `${t.y}deg`);
    card.current!.style.setProperty("--sheen", `${135 + t.y * 3 - t.x * 2}deg`);
    readout.current!.textContent = `TILT X ${t.x}° · Y ${t.y}° // SHEEN ${135 + t.y * 3 - t.x * 2}°`;
  };
  const onPointer = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    apply(-((e.clientY - r.top) / r.height - 0.5) * 2 * MAX, ((e.clientX - r.left) / r.width - 0.5) * 2 * MAX);
  };
  const nudge = (dx: number, dy: number) => apply(tilt.current.x + dx, tilt.current.y + dy);
  const reset = () => {
    apply(0, 0);
    setFlipped(false);
    setFoil(true);
    setVariant(0);
  };

  return (
    <div className={`${s.root} ${foil ? s.foil : ""}`}>
      <header className={s.top}>
        <span>HOLO PASS // INTERACTIVE FOIL</span>
        <span>{foil ? "FOIL: ON" : "FOIL: OFF"}</span>
      </header>

      <div className={s.scene} onPointerMove={onPointer} onPointerDown={onPointer}>
        <div ref={card} className={`${s.card} ${flipped ? s.flipped : ""}`}>
          <div className={s.face} aria-hidden={flipped}>
            <div className={s.faceTop}>
              <span className={s.dim}>NEXUS PROTOCOL // PASS</span>
              <span className={s.pass}>✦ PASS {v.pass}</span>
            </div>
            <div className={s.id}>
              <span className={s.emblem} aria-hidden />
              <span>
                <b className={s.title}>{v.title}</b>
                <span className={s.dim}>{v.sub}</span>
              </span>
            </div>
            <div className={s.meta}>
              <span>
                <span className={s.dim}>ISSUED TO / HOLDER</span>
                <b className={s.mono}>{v.holder}</b>
              </span>
              <span>
                <span className={s.dim}>VALIDITY</span>
                <b className={s.mint}>LIFETIME // ACTIVE</b>
              </span>
              <span className={s.chipSlot} aria-hidden />
            </div>
            <span className={s.sheen} aria-hidden />
          </div>
          <div className={`${s.face} ${s.back}`} aria-hidden={!flipped}>
            <span className={s.strip} aria-hidden />
            <span className={s.dim}>MEMBER SINCE 2026 // {v.label.toUpperCase()}</span>
            <span className={s.code} aria-hidden />
            <span className={s.fine}>Demo pass. The foil is a stylised CSS gradient effect, not a simulation of real light.</span>
            <span className={s.sheen} aria-hidden />
          </div>
        </div>
      </div>

      <div className={s.controls}>
        <div className={s.pad} role="group" aria-label="Tilt">
          <button type="button" className={s.btn} aria-label="Tilt left" onClick={() => nudge(0, -STEP)}>
            ←
          </button>
          <button type="button" className={s.btn} aria-label="Tilt up" onClick={() => nudge(STEP, 0)}>
            ↑
          </button>
          <button type="button" className={s.btn} aria-label="Tilt down" onClick={() => nudge(-STEP, 0)}>
            ↓
          </button>
          <button type="button" className={s.btn} aria-label="Tilt right" onClick={() => nudge(0, STEP)}>
            →
          </button>
        </div>
        <button type="button" aria-pressed={flipped} className={s.btn} onClick={() => setFlipped(!flipped)}>
          Flip
        </button>
        <button type="button" role="switch" aria-checked={foil} className={s.btn} onClick={() => setFoil(!foil)}>
          Foil
        </button>
        <div className={s.variants} role="radiogroup" aria-label="Pass" onKeyDown={onRadioGroupKeyDown}>
          {VARIANTS.map((x, i) => (
            <button
              key={x.label}
              type="button"
              role="radio"
              aria-checked={variant === i}
              tabIndex={variant === i ? 0 : -1}
              className={s.btn}
              onClick={() => setVariant(i)}
            >
              {x.label}
            </button>
          ))}
        </div>
        <button type="button" className={`${s.btn} ${s.reset}`} onClick={reset}>
          Reset
        </button>
      </div>

      <footer className={s.foot}>
        <span ref={readout}>
          TILT X 0° · Y 0° // SHEEN 135°
        </span>
        <span>{flipped ? "SIDE: BACK" : "SIDE: FRONT"}</span>
      </footer>
    </div>
  );
}
