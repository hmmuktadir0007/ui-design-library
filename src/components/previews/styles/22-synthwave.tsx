import { useEffect, useState, type CSSProperties } from "react";
import s from "./22-synthwave.module.css";

// Fictional tracks; playback is a silent simulation (no audio is loaded or played).
const TRACKS = [
  { title: "Midnight Overdrive", length: 225 },
  { title: "Neon Arcade", length: 252 },
  { title: "Chrome Horizon", length: 188 },
];
const MODES = ["Bars", "Sun", "Grid"] as const;
const fmt = (t: number) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;

export default function Synthwave() {
  const [track, setTrack] = useState(0);
  const [pos, setPos] = useState(137);
  const [playing, setPlaying] = useState(false);
  const [mode, setMode] = useState(0);
  const [glow, setGlow] = useState(true);
  const [volume, setVolume] = useState(70);
  const t = TRACKS[track];

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setPos((p) => p + 1), 1000);
    return () => clearInterval(id);
  }, [playing]);
  // End of track: continue with the next one.
  useEffect(() => {
    if (pos <= t.length) return;
    setTrack((track + 1) % TRACKS.length);
    setPos(0);
  }, [pos, t.length, track]);

  const go = (d: number) => {
    setTrack((track + d + TRACKS.length) % TRACKS.length);
    setPos(0);
  };

  return (
    <div
      className={`${s.root} ${glow ? s.glow : ""} ${playing ? s.playing : ""} ${s[`m${MODES[mode]}`]}`}
      style={{ "--vol": volume / 100 } as CSSProperties}
    >
      <header className={s.top}>
        <span className={s.cyan}>SYNTH FM // 1984 LIVE</span>
        <span className={s.gold} role="status">
          STATUS: 128 BPM • {playing ? "ON AIR" : "PAUSED"}
        </span>
      </header>

      <div className={s.scene} aria-hidden>
        <div className={s.sun} />
        <div className={s.mountains} />
        <div className={s.eq}>
          {Array.from({ length: 16 }, (_, i) => (
            <span key={i} className={s.eqBar} style={{ animationDelay: `${-((i * 7) % 10) / 10}s`, height: `${20 + ((i * 29) % 60)}%` }} />
          ))}
        </div>
        <div className={s.floor}>
          <div className={s.grid} />
        </div>
      </div>

      <section className={s.player} aria-label="Player">
        <div className={s.rowA}>
          <span className={s.art} aria-hidden>
            <span className={s.disc} />
          </span>
          <div className={s.info}>
            <span className={s.title}>{t.title.toUpperCase()}</span>
            <span className={s.sub}>
              TRACK {track + 1}/3 // {fmt(Math.min(pos, t.length))} / {fmt(t.length)}
            </span>
            <input
              type="range"
              min={0}
              max={t.length}
              value={Math.min(pos, t.length)}
              aria-label="Seek"
              aria-valuetext={`${fmt(Math.min(pos, t.length))} of ${fmt(t.length)}`}
              className={s.range}
              onChange={(e) => setPos(+e.target.value)}
            />
          </div>
          <div className={s.transport}>
            <button type="button" className={s.btn} aria-label="Previous track" onClick={() => go(-1)}>
              <svg viewBox="0 0 16 16" aria-hidden>
                <path d="M3 2h2v12H3zM14 2v12L6 8z" />
              </svg>
            </button>
            <button type="button" className={`${s.btn} ${s.play}`} aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying(!playing)}>
              <svg viewBox="0 0 16 16" aria-hidden>
                <path d={playing ? "M3 2h4v12H3zM9 2h4v12H9z" : "M4 2v12l10-6z"} />
              </svg>
            </button>
            <button type="button" className={s.btn} aria-label="Next track" onClick={() => go(1)}>
              <svg viewBox="0 0 16 16" aria-hidden>
                <path d="M11 2h2v12h-2zM2 2v12l8-6z" />
              </svg>
            </button>
          </div>
        </div>
        <div className={s.rowB}>
          <div className={s.modes} role="radiogroup" aria-label="Visualizer">
            {MODES.map((m, i) => (
              <button key={m} type="button" role="radio" aria-checked={mode === i} className={s.mode} onClick={() => setMode(i)}>
                {m}
              </button>
            ))}
          </div>
          <button type="button" role="switch" aria-checked={glow} className={s.mode} onClick={() => setGlow(!glow)}>
            Neon
          </button>
          <label className={s.vol}>
            <span>VOL</span>
            <input type="range" min={0} max={100} value={volume} aria-label="Volume" className={s.range} onChange={(e) => setVolume(+e.target.value)} />
            <span className={s.volVal}>{volume}</span>
          </label>
        </div>
      </section>
      <span className={s.note}>SILENT DEMO</span>
    </div>
  );
}
