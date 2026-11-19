import { useState } from "react";
import s from "./49-kawaii.module.css";

const clamp = (v: number) => Math.min(100, Math.max(0, v));

export default function Kawaii() {
  const [happy, setHappy] = useState(85);
  const [water, setWater] = useState(70);
  const [level, setLevel] = useState(4);
  const [cozy, setCozy] = useState(true);
  const [routine, setRoutine] = useState(false);
  const [hop, setHop] = useState(0);

  // When both bars fill up, Mochi levels up and the bars start again from half.
  const bump = (dh: number, dw: number) => {
    const h = clamp(happy + dh);
    const w = clamp(water + dw);
    if (h === 100 && w === 100) {
      setLevel((l) => l + 1);
      setHappy(50);
      setWater(50);
    } else {
      setHappy(h);
      setWater(w);
    }
  };

  return (
    <div className={s.root}>
      <section className={s.card} aria-label="Mochi the Bunny">
        <div className={s.chips}>
          <button type="button" className={`${s.chip} ${s.pink}`} aria-pressed={cozy} onClick={() => setCozy((c) => !c)}>
            Cozy Mode {cozy ? "♥" : "♡"}
          </button>
          <span className={`${s.chip} ${s.yellow}`}>Streak: ★ 7 Days</span>
          <span className={`${s.chip} ${s.blue} ${s.lvl}`} aria-live="polite">
            LVL {String(level).padStart(2, "0")}
          </span>
        </div>

        <div className={s.pet}>
          <button
            type="button"
            className={s.bunny}
            aria-label="Pet Mochi"
            onClick={() => (setHop((n) => n + 1), bump(5, 0))}
          >
            <span className={`${s.body} ${hop % 2 ? s.hopA : hop ? s.hopB : ""}`} aria-hidden>
              <span className={`${s.ear} ${s.earL}`} />
              <span className={`${s.ear} ${s.earR}`} />
              <span className={s.face}>{happy >= 80 ? "◕ ‿ ◕" : "• ᴗ •"}</span>
            </span>
          </button>
          <div className={s.info}>
            <p className={s.name}>Mochi the Bunny</p>
            <p className={s.role}>COZY HABIT COMPANION</p>
            <div className={s.stat}>
              <span>HAPPINESS</span>
              <span className={s.track} role="progressbar" aria-label="Happiness" aria-valuemin={0} aria-valuemax={100} aria-valuenow={happy}>
                <span className={s.fillPink} style={{ width: `${happy}%` }} />
              </span>
            </div>
            <div className={s.stat}>
              <span>HYDRATION</span>
              <span className={s.track} role="progressbar" aria-label="Hydration" aria-valuemin={0} aria-valuemax={100} aria-valuenow={water}>
                <span className={s.fillBlue} style={{ width: `${water}%` }} />
              </span>
            </div>
            <div className={s.actions}>
              <button type="button" className={`${s.pill} ${s.yellow}`} onClick={() => bump(10, 0)}>
                Feed Snack 🍓
              </button>
              <button type="button" className={`${s.pill} ${s.blue}`} onClick={() => bump(0, 20)}>
                Log Habit +20p
              </button>
            </div>
          </div>
        </div>

        <button type="button" className={s.cta} aria-pressed={routine} onClick={() => setRoutine((r) => !r)}>
          {routine ? "Routine running ♥ Tap to pause" : "Adopt Pet & Start Routine ♡"}
        </button>
        <p className={s.note}>STICKER SYSTEM • BUBBLE CORNERS (28PX) • WARM COCOA OUTLINE</p>
      </section>
    </div>
  );
}
