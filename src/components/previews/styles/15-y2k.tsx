import { useEffect, useState, type CSSProperties } from "react";
import s from "./15-y2k.module.css";

const TRACKS = [
  { title: "COSMIC_DRIFT.MP3", length: 225 },
  { title: "NEON_MALL.MP3", length: 198 },
  { title: "DIALUP_DREAMS.MP3", length: 241 },
];
const EQ = ["DANCE_V2", "BASS_MAX", "VOCAL"];
const BARS = [4, 6, 5, 8, 7, 9, 8, 10, 6, 5, 7, 4];
const mmss = (t: number) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;

/** Silent UI simulation: nothing is played, the clock just advances while "playing". */
export default function Y2K() {
  const [track, setTrack] = useState(0);
  const [pos, setPos] = useState(165);
  const [playing, setPlaying] = useState(false);
  const [vol, setVol] = useState(85);
  const [eq, setEq] = useState(0);
  const [bass, setBass] = useState(true);
  const t = TRACKS[track];

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setPos((p) => (p + 1) % t.length), 1000);
    return () => clearInterval(id);
  }, [playing, t.length]);

  const skip = (d: number) => {
    setTrack((i) => (i + d + TRACKS.length) % TRACKS.length);
    setPos(0);
  };

  return (
    <div className={s.root}>
      <section className={s.win} aria-label="Cyber Beat 2000 media station">
        <header className={s.titleBar}>
          <span className={s.spark} aria-hidden>✦</span>
          <span>CYBER_BEAT 2000 // MEDIA_STATION</span>
          <span className={s.winBtns} aria-hidden>
            <span>–</span>
            <span>□</span>
            <span className={s.x}>✕</span>
          </span>
        </header>

        <div className={`${s.screen} ${playing ? s.on : ""}`}>
          <div className={s.track}>
            <span>✦ {String(track + 1).padStart(2, "0")}. {t.title}</span>
            <span className={s.time} aria-live="off">{mmss(pos)}</span>
          </div>
          <p className={s.meta}>BITRATE: 320 KBPS • STEREO 44.1 KHZ</p>
          <div className={s.eqRow}>
            <span className={s.bars} aria-hidden>
              {BARS.map((h, i) => (
                <span key={i} style={{ "--h": h, "--d": `${(i % 5) * 0.12}s` } as CSSProperties} />
              ))}
            </span>
            <button type="button" className={s.chip} onClick={() => setEq((e) => (e + 1) % EQ.length)}>
              EQ: {EQ[eq]}
            </button>
          </div>
        </div>

        <div className={s.bufferLabel} aria-hidden>
          <span>CANDY_BUFFER // {Math.round((pos / t.length) * 100)}%</span>
          <span>-{mmss(t.length - pos)} REMAINING</span>
        </div>
        <input
          type="range"
          className={s.seek}
          min={0}
          max={t.length}
          value={pos}
          onChange={(e) => setPos(+e.target.value)}
          aria-label="Track position"
          aria-valuetext={`${mmss(pos)} of ${mmss(t.length)}`}
          style={{ "--fill": `${(pos / t.length) * 100}%` } as CSSProperties}
        />

        <div className={s.controls}>
          <button type="button" className={s.key} aria-label="Previous track" onClick={() => skip(-1)}>⏮</button>
          <button type="button" className={s.play} aria-pressed={playing} onClick={() => setPlaying(true)}>
            ▶ Play
          </button>
          <button type="button" className={s.key} aria-label="Pause" onClick={() => setPlaying(false)}>
            ❚❚
          </button>
          <button type="button" className={s.key} aria-label="Next track" onClick={() => skip(1)}>⏭</button>
          <label className={s.vol}>
            <span>VOL: {vol}%</span>
            <input
              type="range"
              min={0}
              max={100}
              value={vol}
              onChange={(e) => setVol(+e.target.value)}
              aria-label="Volume"
              style={{ "--fill": `${vol}%` } as CSSProperties}
            />
          </label>
        </div>

        <div className={s.pills}>
          <span className={s.pill}>✦ RETRO_AUDIO</span>
          <button type="button" className={`${s.pill} ${s.bass}`} aria-pressed={bass} onClick={() => setBass((b) => !b)}>
            BASS BOOST: {bass ? "MAX" : "OFF"}
          </button>
          <span className={`${s.pill} ${s.chrome}`}>HI-FI STEREO</span>
        </div>
      </section>
    </div>
  );
}
