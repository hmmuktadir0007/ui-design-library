import { useState } from "react";
import s from "./07-neo-brutalism.module.css";

const NAV = ["Home", "Analytics", "Wallet", "Projects", "Settings"];
const STATS = [
  { key: "revenue", label: "Total revenue", value: "+$48,290", delta: "↑ 24.5%", tone: s.acid, bars: [3, 5, 4, 7, 6, 9] },
  { key: "users", label: "Active users", value: "12,408", delta: "↑ 12%", tone: s.blue, bars: [5, 4, 6, 6, 8, 7] },
  { key: "bounce", label: "Bounce rate", value: "34.1%", delta: "↓ 5.4%", tone: s.pink, bars: [8, 7, 7, 5, 4, 3] },
];

export default function NeoBrutalism() {
  const [nav, setNav] = useState("Analytics");
  const [stat, setStat] = useState(0);
  const [loggedIn, setLoggedIn] = useState(true);
  const [refreshes, setRefreshes] = useState(0);
  const cur = STATS[stat];
  // Refresh rotates the series so the chart visibly changes.
  const bars = cur.bars.map((_, i) => cur.bars[(i + refreshes) % cur.bars.length]);

  return (
    <div className={s.root}>
      <div className={s.board}>
        <nav className={s.side} aria-label="Dashboard">
          {NAV.map((n) => (
            <button key={n} type="button" className={s.navBtn} aria-current={nav === n ? "page" : undefined} onClick={() => setNav(n)}>
              {n}
            </button>
          ))}
        </nav>

        <section className={s.main} aria-label={`${nav} dashboard`}>
          <header className={s.head}>
            <h3 className={s.title}>DA$H_BOARD</h3>
            <div className={s.user}>
              <span>{loggedIn ? "ALEX_0x" : "GUEST"}</span>
              <button type="button" className={`${s.btn} ${s.pinkBtn}`} onClick={() => setLoggedIn((v) => !v)}>
                {loggedIn ? "Log out" : "Log in"}
              </button>
            </div>
          </header>

          <div className={s.stats} role="radiogroup" aria-label="Metric">
            {STATS.map((m, i) => (
              <button
                key={m.key}
                type="button"
                role="radio"
                aria-checked={i === stat}
                className={`${s.stat} ${m.tone}`}
                onClick={() => setStat(i)}
              >
                <span className={s.statLabel}>{m.label}</span>
                <span className={s.delta}>{m.delta}</span>
                <span className={s.statValue}>{m.value}</span>
              </button>
            ))}
          </div>

          <div className={s.perf}>
            <div className={s.perfHead}>
              <span>Performance</span>
              <button type="button" className={s.btn} onClick={() => setRefreshes((r) => r + 1)}>
                ↻ Refresh
              </button>
            </div>
            <div className={s.chart} role="img" aria-label={`${cur.label} chart, refresh ${refreshes}`}>
              {bars.map((h, i) => (
                <span key={i} className={`${s.bar} ${i % 2 ? s.barAlt : ""}`} style={{ height: `${h * 10}%` }} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
