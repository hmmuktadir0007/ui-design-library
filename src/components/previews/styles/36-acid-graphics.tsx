import { useState } from "react";
import s from "./36-acid-graphics.module.css";

const SECTIONS = [
  { key: "system", label: "System", line1: "ACID // 99", line2: "OVERDRIVE", line3: "WARPED SIGNAL_" },
  { key: "disrupt", label: "Disrupt", line1: "NOISE // 01", line2: "BREAKDOWN", line3: "FEEDBACK LOOP_" },
  { key: "rave", label: "Rave", line1: "RAVE // 24H", line2: "AFTERBURN", line3: "STROBE STATE_" },
];
const DISTORT = ["LOW", "MID", "MAX"];
const RGB = ["OFF", "LOW", "HIGH"];

export default function AcidGraphics() {
  const [sec, setSec] = useState(0);
  const [distort, setDistort] = useState(1);
  const [rgb, setRgb] = useState(2);
  const [bpm, setBpm] = useState(168.4);
  const cur = SECTIONS[sec];

  return (
    <div className={s.root}>
      <header className={s.head}>
        <span className={s.brand}>ANTI_CORP // ISSUE 09</span>
        <nav className={s.nav} aria-label="Section">
          {SECTIONS.map((x, i) => (
            <button key={x.key} type="button" className={s.navBtn} aria-pressed={i === sec} onClick={() => setSec(i)}>
              {x.label}
            </button>
          ))}
        </nav>
      </header>

      <div className={s.chips}>
        <span className={s.live}>LIVE // RDR-9</span>
        <button type="button" className={s.bpm} onClick={() => setBpm((b) => Math.round((b >= 180 ? 120 : b + 12.2) * 10) / 10)}>
          BPM {bpm.toFixed(1)}
        </button>
      </div>

      <div className={`${s.type} ${s[`d${distort}`]} ${s[`rgb${rgb}`] ?? ""}`} aria-live="polite">
        <p className={s.l1}>{cur.line1}</p>
        <p className={s.l2}>{cur.line2}</p>
        <p className={s.l3}>{cur.line3}</p>
      </div>

      <span className={s.orb} aria-hidden>
        <span className={s.ring} />
        <span className={`${s.ring} ${s.ringV}`} />
        <span className={s.spark}>✦</span>
      </span>

      <div className={s.cards}>
        <button type="button" className={s.card} onClick={() => setDistort((d) => (d + 1) % DISTORT.length)}>
          <span className={s.cardKicker}>Audio architecture</span>
          <span className={s.cardValue}>DISTORTION: {DISTORT[distort]} →</span>
        </button>
        <button type="button" className={`${s.card} ${s.neon}`} onClick={() => setRgb((r) => (r + 1) % RGB.length)}>
          <span className={s.cardKicker}>Neon aberration</span>
          <span className={s.cardValue}>RGB OFFSET // {RGB[rgb]}</span>
        </button>
      </div>

      <footer className={s.foot}>
        <span>FREQUENCY // 20HZ - 48KHZ</span>
        <span className={s.acidText}>PURE ANTI-DESIGN SYSTEM</span>
      </footer>
    </div>
  );
}
