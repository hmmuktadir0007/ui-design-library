import { useEffect, useState } from "react";
import { onRadioGroupKeyDown } from "../shared/radioGroup";
import s from "./41-zen.module.css";

const SESSIONS = [
  { name: "Usucha", kind: "Thin tea", mins: 3 },
  { name: "Koicha", kind: "Thick tea", mins: 5 },
  { name: "Zazen", kind: "Seated stillness", mins: 10 },
];
const R = 58;
const C = 2 * Math.PI * R;
const clock = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

export default function Zen() {
  const [sel, setSel] = useState(0);
  const [left, setLeft] = useState(SESSIONS[0].mins * 60);
  const [running, setRunning] = useState(false);
  const total = SESSIONS[sel].mins * 60;
  const pct = Math.round(((total - left) / total) * 100);
  const done = left === 0;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);
  useEffect(() => {
    if (done) setRunning(false);
  }, [done]);

  const choose = (i: number) => {
    setSel(i);
    setLeft(SESSIONS[i].mins * 60);
    setRunning(false);
  };
  const reset = () => choose(sel);

  return (
    <div className={s.root}>
      <header className={s.top}>
        <span className={s.brand}>
          茶道 CHADO <span className={s.muted}>// KYOTO</span>
        </span>
        <span className={s.muted}>COLLECTION · RITUAL · TEA ROOM</span>
      </header>

      <div className={s.body}>
        <section className={s.left} aria-label="Session">
          <p className={s.kicker}>MA (間) // AESTHETIC OF SILENCE</p>
          <h3 className={s.title}>
            QUIET
            <br />
            EARTHEN
            <br />
            <span className={s.stone}>FORMS</span>
          </h3>
          <div className={s.sessions} role="radiogroup" aria-label="Session type" onKeyDown={onRadioGroupKeyDown}>
            {SESSIONS.map((x, i) => (
              <button key={x.name} type="button" role="radio" aria-checked={sel === i} tabIndex={sel === i ? 0 : -1} className={s.session} onClick={() => choose(i)}>
                {x.name} <span className={s.mins}>{x.mins}′</span>
              </button>
            ))}
          </div>
          <div className={s.actions}>
            <button type="button" className={s.primary} onClick={() => (done ? reset() : setRunning(!running))}>
              {running ? "PAUSE" : done ? "AGAIN" : left < total ? "RESUME" : "BEGIN RITUAL →"}
            </button>
            <button type="button" className={s.quiet} onClick={reset}>
              Reset
            </button>
          </div>
        </section>

        <section className={s.right} aria-label="Timer">
          <div className={s.bowl} role="progressbar" aria-label="Session progress" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-valuetext={`${pct}%, ${clock(left)} remaining`}>
          <svg viewBox="0 0 150 150" aria-hidden>
            <circle cx="75" cy="75" r="72" className={s.plate} />
            <circle cx="75" cy="75" r={R} className={s.track} />
            <circle cx="75" cy="75" r={R} className={s.ring} strokeDasharray={`${(C * pct) / 100} ${C}`} transform="rotate(-90 75 75)" />
            <circle cx="75" cy="75" r="40" className={s.glaze} />
            <circle cx="75" cy="75" r="30" className={s.tea} />
            <circle cx="100" cy="52" r="12" className={s.moon} />
          </svg>
          </div>
          <div className={s.card}>
            <p className={s.cardHead}>
              {SESSIONS[sel].name.toUpperCase()} // {SESSIONS[sel].kind}
            </p>
            <p className={s.time}>{done ? "Session complete" : `${clock(left)} remaining`}</p>
            <p className={s.cardNote} role="status">
              {running ? "Breathe. The kettle is singing." : done ? "Bow, and rinse the bowl." : left < total ? "Paused" : "Ready when you are"}
            </p>
          </div>
        </section>
      </div>

      <footer className={s.foot}>
        <span>WABI-SABI (侘寂) // 5 PIGMENT TONES</span>
        <span>MA RATIO 1:1.618 // ORGANIC</span>
      </footer>
    </div>
  );
}
