import { useState, type CSSProperties } from "react";
import { onRadioGroupKeyDown } from "../shared/radioGroup";
import s from "./28-motion-first.module.css";

const CARDS = ["Inbox", "Deploy", "Insights"];
const MODES = [
  { label: "Spring", curve: "cubic-bezier(0.34, 1.56, 0.64, 1)", ms: 450, physics: "TENSION: 180 // DAMP: 12" },
  { label: "Smooth", curve: "cubic-bezier(0.16, 1, 0.3, 1)", ms: 600, physics: "TENSION: 90 // DAMP: 26" },
  { label: "Snappy", curve: "cubic-bezier(0.2, 0, 0, 1)", ms: 220, physics: "TENSION: 400 // DAMP: 40" },
];
const DEFAULTS = { selected: 1, mode: 0, intensity: 60, wave: 0 };

export default function MotionFirst() {
  const [selected, setSelected] = useState(DEFAULTS.selected);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [intensity, setIntensity] = useState(DEFAULTS.intensity);
  const [wave, setWave] = useState(DEFAULTS.wave);
  const m = MODES[mode];
  const k = intensity / 100;
  const lift = Math.round(10 * k);
  const scale = (1 + 0.04 * k).toFixed(2);
  const vars = { "--curve": m.curve, "--ms": `${m.ms}ms`, "--lift": `${-lift}px`, "--scale": scale } as CSSProperties;
  const reset = () => {
    setSelected(DEFAULTS.selected);
    setMode(DEFAULTS.mode);
    setIntensity(DEFAULTS.intensity);
    setWave(DEFAULTS.wave);
  };

  return (
    <div className={s.root} style={vars}>
      <header className={s.top}>
        <span className={s.dim}>SPRING TRAJECTORY ({m.label.toUpperCase()})</span>
        <span className={s.blue}>{m.physics}</span>
      </header>

      <div className={s.stage}>
        <svg className={s.path} viewBox="0 0 400 120" aria-hidden>
          <path d="M20 110 C120 110 140 20 200 30 S260 60 300 40 S360 34 390 34" />
        </svg>
        <div className={s.cards} role="radiogroup" aria-label="Cards" onKeyDown={onRadioGroupKeyDown}>
          {CARDS.map((c, i) => (
            <button
              // the key changes on each trigger, so the pop animation replays (wave 0 = never triggered, no animation)
              key={`${c}-${wave}`}
              type="button"
              role="radio"
              aria-checked={selected === i}
              tabIndex={selected === i ? 0 : -1}
              className={`${s.card} ${wave ? s.pop : ""}`}
              style={{ "--i": i } as CSSProperties}
              onClick={() => setSelected(i)}
            >
              <span className={s.lines} aria-hidden>
                <span />
                <span />
              </span>
              <span className={s.name}>{c}</span>
              <span className={s.state}>{selected === i ? `ACTIVE: -${lift}PX (${scale}x)` : "REST: SCALE 1.00"}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={s.controls}>
        <div className={s.row}>
          <div className={s.modes} role="radiogroup" aria-label="Animation mode" onKeyDown={onRadioGroupKeyDown}>
            {MODES.map((x, i) => (
              <button key={x.label} type="button" role="radio" aria-checked={mode === i} tabIndex={mode === i ? 0 : -1} className={s.mode} onClick={() => setMode(i)}>
                {x.label}
              </button>
            ))}
          </div>
          <button type="button" className={s.trigger} onClick={() => setWave(wave + 1)}>
            Trigger Motion
          </button>
          <button type="button" className={s.reset} onClick={reset}>
            Reset
          </button>
        </div>
        <label className={s.slider}>
          <span className={s.label}>Intensity</span>
          <input type="range" min={0} max={100} value={intensity} aria-label="Intensity" className={s.range} onChange={(e) => setIntensity(+e.target.value)} />
          <span className={s.val} role="status">
            {intensity}% · TRIGGERED ×{wave}
          </span>
        </label>
      </div>

      <footer className={s.foot}>
        <span>PHYSICS: {m.curve.toUpperCase()}</span>
        <span className={s.motionOk}>PREFERS-REDUCED-MOTION: READY</span>
        <span className={s.motionOff}>REDUCED MOTION: INSTANT STATE CHANGES</span>
      </footer>
    </div>
  );
}
