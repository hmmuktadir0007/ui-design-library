import { useId, useState, type CSSProperties } from "react";
import { onRadioGroupKeyDown } from "../shared/radioGroup";
import s from "./45-obsidian-glass.module.css";

const RANGES = {
  "1D": { delta: "+0.6%", pts: [40, 42, 38, 44, 43, 47, 46, 50] },
  "1W": { delta: "+3.1%", pts: [30, 36, 33, 38, 41, 37, 45, 52] },
  "1M": { delta: "+9.4%", pts: [22, 30, 27, 35, 31, 42, 47, 56] },
  "1Y": { delta: "+24.8%", pts: [10, 18, 16, 27, 33, 31, 45, 60] },
} as const;
type Range = keyof typeof RANGES;
const BLURS = [0, 10, 20, 40];

function path(pts: readonly number[]) {
  const step = 300 / (pts.length - 1);
  return pts.map((p, i) => `${i ? "L" : "M"}${(i * step).toFixed(1)},${(64 - p).toFixed(1)}`).join(" ");
}

export default function ObsidianGlass() {
  const [range, setRange] = useState<Range>("1M");
  const [hidden, setHidden] = useState(false);
  const [rim, setRim] = useState(true);
  const [blur, setBlur] = useState(2);
  const line = path(RANGES[range].pts);
  const fillId = useId(); // unique per instance: card and dialog can both render this preview

  return (
    <div className={s.root}>
      <span className={s.ambient} aria-hidden />
      <span className={s.ambient2} aria-hidden />
      <section className={`${s.panel} ${rim ? s.rim : ""}`} style={{ "--blur": `${BLURS[blur]}px` } as CSSProperties} aria-label="Obsidian vault">
        <header className={s.head}>
          <span className={s.brand}>
            <i /> OBSIDIAN VAULT // PRO
          </span>
          <span className={s.apy}>● {RANGES[range].delta}</span>
        </header>

        <p className={s.caption}>Total translucent assets</p>
        <div className={s.balanceRow}>
          <p className={s.balance} aria-live="polite">
            {hidden ? "$•••,•••" : "$184,490"}
            <span>{hidden ? "" : ".25"}</span>
          </p>
          <button type="button" className={s.ghost} aria-pressed={hidden} onClick={() => setHidden((h) => !h)}>
            {hidden ? "Show" : "Hide"}
          </button>
        </div>

        <div className={s.ranges} role="radiogroup" aria-label="Chart range" onKeyDown={onRadioGroupKeyDown}>
          {(Object.keys(RANGES) as Range[]).map((r) => (
            <button key={r} type="button" role="radio" aria-checked={r === range} tabIndex={r === range ? 0 : -1} className={s.range} onClick={() => setRange(r)}>
              {r}
            </button>
          ))}
        </div>
        <svg viewBox="0 0 300 64" className={s.chart} role="img" aria-label={`Balance trend, ${range}, ${RANGES[range].delta}`}>
          <defs>
            <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#38BDF8" stopOpacity="0.35" />
              <stop offset="1" stopColor="#38BDF8" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${line} L300,64 L0,64 Z`} fill={`url(#${fillId})`} />
          <path d={line} className={s.line} />
        </svg>

        <div className={s.tiles}>
          <button type="button" className={s.tile} aria-pressed={rim} onClick={() => setRim((r) => !r)}>
            <span className={s.tileLabel}>Specular reflection</span>
            <span className={s.tileValue}>{rim ? "0.22 Rim Light" : "Rim off"}</span>
          </button>
          <button type="button" className={s.tile} onClick={() => setBlur((b) => (b + 1) % BLURS.length)}>
            <span className={s.tileLabel}>Backdrop blur</span>
            <span className={`${s.tileValue} ${s.accent}`}>{BLURS[blur]}px Gaussian</span>
          </button>
        </div>
      </section>
    </div>
  );
}
