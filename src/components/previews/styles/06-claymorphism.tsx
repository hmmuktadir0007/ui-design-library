import { useState } from "react";
import s from "./06-claymorphism.module.css";

const HABITS = [
  { key: "water", label: "Drink water", icon: "💧", tone: s.mint },
  { key: "meditate", label: "Meditate", icon: "🧘", tone: s.lilac },
  { key: "walk", label: "Evening walk", icon: "👟", tone: s.blush },
];

export default function Claymorphism() {
  const [done, setDone] = useState<Record<string, boolean>>({ water: true });
  const count = HABITS.filter((h) => done[h.key]).length;
  const pct = Math.round((count / HABITS.length) * 100);

  return (
    <div className={s.root}>
      <span className={`${s.puff} ${s.p1}`} aria-hidden />
      <span className={`${s.puff} ${s.p2}`} aria-hidden />
      <span className={`${s.star} ${s.s1}`} aria-hidden>★</span>
      <span className={`${s.star} ${s.s2}`} aria-hidden>★</span>

      <section className={s.app} aria-label="Wellness habits">
        <header className={s.head}>
          <div>
            <h3 className={s.title}>Welcome back!</h3>
            <p className={s.sub}>Your gentle routine for today</p>
          </div>
          <span className={s.heart} aria-hidden>❤</span>
        </header>

        <div className={s.habits}>
          {HABITS.map((h) => (
            <button
              key={h.key}
              type="button"
              aria-pressed={!!done[h.key]}
              className={`${s.habit} ${h.tone}`}
              onClick={() => setDone((d) => ({ ...d, [h.key]: !d[h.key] }))}
            >
              <span className={s.icon} aria-hidden>
                {done[h.key] ? "✓" : h.icon}
              </span>
              <span className={s.habitLabel}>{h.label}</span>
            </button>
          ))}
        </div>

        <div className={s.progress}>
          <div className={s.progressHead}>
            <span>Daily progress</span>
            <span aria-live="polite">
              {count}/{HABITS.length} · {pct}%
            </span>
          </div>
          <div className={s.track} role="progressbar" aria-label="Daily progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
            <span className={s.fill} style={{ width: `${Math.max(pct, 8)}%` }} />
          </div>
        </div>

        <button type="button" className={s.reset} onClick={() => setDone({})} disabled={count === 0}>
          Start fresh
        </button>
      </section>
    </div>
  );
}
