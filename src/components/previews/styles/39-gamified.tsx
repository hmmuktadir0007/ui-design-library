import { useState } from "react";
import { onRadioGroupKeyDown } from "../shared/radioGroup";
import s from "./39-gamified.module.css";

const BOOSTS = [
  { key: "sprint", top: "+50 XP", sub: "Sprint", tone: s.sky },
  { key: "gems", top: "2x Gems", sub: "Bonus", tone: s.gold },
  { key: "shield", top: "100%", sub: "Shield", tone: s.green },
];
const GOAL = 500;
const START = { xp: 450, level: 14, streak: 7 };

export default function Gamified() {
  const [xp, setXp] = useState(START.xp);
  const [level, setLevel] = useState(START.level);
  const [streak, setStreak] = useState(START.streak);
  const [boost, setBoost] = useState(0);
  const [reward, setReward] = useState("");

  const play = () => {
    const gain = boost === 0 ? 100 : 50; // the Sprint boost doubles lesson XP
    const total = xp + gain;
    if (total >= GOAL) {
      setLevel((l) => l + 1);
      setStreak((n) => n + 1);
      setReward(`LEVEL ${level + 1}! +${gain} XP · streak ${streak + 1}`);
      setXp(total - GOAL);
    } else {
      setReward(`+${gain} XP`);
      setXp(total);
    }
  };
  const reset = () => {
    setXp(START.xp);
    setLevel(START.level);
    setStreak(START.streak);
    setReward("");
  };

  return (
    <div className={s.root}>
      <section className={s.card} aria-label="Daily quest">
        <div className={s.top}>
          <span className={s.quest}>QUEST #14</span>
          <span className={`${s.streak} ${reward.startsWith("LEVEL") ? s.bump : ""}`}>🔥 {streak} DAY STREAK!</span>
        </div>
        <h3 className={s.title}>Daily Habit Mastery</h3>
        <p className={s.sub}>Complete lessons to level up your XP bar</p>

        <div className={s.xpHead}>
          <span>LEVEL {level} PROGRESS</span>
          <span className={s.xpNum}>
            {xp} / {GOAL} XP
          </span>
        </div>
        <div className={s.xpTrack} role="progressbar" aria-label={`Level ${level} XP`} aria-valuemin={0} aria-valuemax={GOAL} aria-valuenow={xp}>
          <span className={s.xpFill} style={{ width: `${Math.max(8, (xp / GOAL) * 100)}%` }}>
            <span className={s.star} aria-hidden>★</span>
          </span>
        </div>

        <div className={s.boosts} role="radiogroup" aria-label="Boost" onKeyDown={onRadioGroupKeyDown}>
          {BOOSTS.map((b, i) => (
            <button key={b.key} type="button" role="radio" aria-checked={i === boost} tabIndex={i === boost ? 0 : -1} className={s.boost} onClick={() => setBoost(i)}>
              <span className={`${s.dot} ${b.tone}`} aria-hidden />
              <span className={s.boostText}>
                <strong>{b.top}</strong>
                {b.sub}
              </span>
            </button>
          ))}
        </div>

        <div className={s.actions}>
          <button type="button" className={s.cta} onClick={play}>
            Continue quest →
          </button>
          <button type="button" className={s.reset} onClick={reset}>
            Reset
          </button>
        </div>
        <p className={s.reward} role="status">
          {reward}
        </p>
      </section>
    </div>
  );
}
