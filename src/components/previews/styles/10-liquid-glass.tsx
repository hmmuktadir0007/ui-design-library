import { useEffect, useState, type CSSProperties } from "react";
import s from "./10-liquid-glass.module.css";

const MODES = [
  { key: "specular", label: "Specular", glyph: "▲", depth: 82 },
  { key: "caustics", label: "Caustics", glyph: "◎", depth: 64 },
  { key: "diffusion", label: "Diffusion", glyph: "●", depth: 48 },
  { key: "prism", label: "Prism", glyph: "■", depth: 91 },
  { key: "flow", label: "Flow", glyph: "◒", depth: 73 },
];
const LENGTH = 240;
const fmt = (t: number) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.round(t % 60)).padStart(2, "0")}`;

export default function LiquidGlass() {
  const [mode, setMode] = useState(0);
  const [pos, setPos] = useState(165);
  const [playing, setPlaying] = useState(false);
  const m = MODES[mode];

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setPos((p) => (p + 1) % (LENGTH + 1)), 1000);
    return () => window.clearInterval(id);
  }, [playing]);

  return (
    <div className={s.root}>
      <span className={`${s.orb} ${s.o1}`} aria-hidden />
      <span className={`${s.orb} ${s.o2}`} aria-hidden />
      <span className={`${s.orb} ${s.o3}`} aria-hidden />

      <section className={`${s.liquid} ${s.deck}`} aria-label="Refractive glass deck">
        <span className={s.chip}>
          <i /> FLUID SPATIAL
        </span>
        <h3 className={s.title}>Refractive Glass Deck</h3>
        <p className={s.sub} aria-live="polite">
          Adaptive backdrop luminance • {m.depth}% depth · {m.label}
        </p>
        <button type="button" className={s.play} aria-pressed={playing} aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying((p) => !p)}>
          {playing ? "❚❚" : "▶"}
        </button>
        <input
          type="range"
          min={0}
          max={LENGTH}
          value={pos}
          onChange={(e) => setPos(+e.target.value)}
          aria-label="Playback position"
          aria-valuetext={fmt(pos)}
          className={s.scrub}
          style={{ "--fill": `${(pos / LENGTH) * 100}%` } as CSSProperties}
        />
        <div className={s.times}>
          <span>{fmt(pos)} // REFRACT</span>
          <span>-{fmt(LENGTH - pos)}</span>
        </div>
      </section>

      <nav className={`${s.liquid} ${s.dock}`} aria-label="Glass optics">
        {MODES.map((x, i) => (
          <button key={x.key} type="button" aria-pressed={i === mode} aria-label={x.label} className={s.dockBtn} onClick={() => setMode(i)}>
            <span aria-hidden>{x.glyph}</span>
          </button>
        ))}
      </nav>
      <p className={s.dockLabel}>{m.label}</p>
    </div>
  );
}
