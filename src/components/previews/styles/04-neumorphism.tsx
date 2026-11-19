import { useState, type CSSProperties } from "react";
import s from "./04-neumorphism.module.css";

const MIN = 60;
const MAX = 85;

export default function Neumorphism() {
  const [temp, setTemp] = useState(72);
  const [mode, setMode] = useState<"auto" | "eco">("auto");
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(40);
  const change = (d: number) => setTemp((t) => Math.min(MAX, Math.max(MIN, t + d)));
  const status = temp > 70 ? "Heating" : temp < 68 ? "Cooling" : "Holding";

  return (
    <div className={s.root}>
      <section className={s.panel} aria-label="Smart home thermostat">
        <p className={s.caption}>Smart Home Thermostat</p>
        <div className={s.dial} style={{ "--p": (temp - MIN) / (MAX - MIN) } as CSSProperties}>
          <div className={s.dialInner}>
            <output className={s.temp} aria-live="polite" aria-label={`Target ${temp} degrees Fahrenheit`}>
              {temp}
              <sup>°F</sup>
            </output>
            <span className={s.status}>{status}</span>
          </div>
        </div>
        <div className={s.adjust}>
          <button type="button" className={s.round} aria-label="Decrease temperature" onClick={() => change(-1)} disabled={temp <= MIN}>
            −
          </button>
          <button type="button" className={s.round} aria-label="Increase temperature" onClick={() => change(1)} disabled={temp >= MAX}>
            +
          </button>
        </div>
        <div className={s.segment} role="radiogroup" aria-label="Mode">
          {(["auto", "eco"] as const).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={mode === m} className={s.segBtn} onClick={() => setMode(m)}>
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      <section className={s.panel} aria-label="Now playing">
        <p className={s.caption}>
          Living Room
          <br />
          Now Playing
        </p>
        <div className={s.player}>
          <input type="range" min={0} max={100} value={volume} onChange={(e) => setVolume(+e.target.value)} aria-label="Volume" className={s.range} />
          <div className={s.controls}>
            <span aria-hidden>⏮</span>
            <button type="button" className={s.play} aria-pressed={playing} aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying((p) => !p)}>
              {playing ? "❚❚" : "▶"}
            </button>
            <span aria-hidden>⏭</span>
          </div>
          <span className={s.caption}>Volume {volume}%</span>
        </div>
      </section>
    </div>
  );
}
