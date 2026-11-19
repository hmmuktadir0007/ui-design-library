import { useState } from "react";
import s from "./47-heatmap.module.css";

// Deterministic demo data (labelled "Demo data" in the UI): daily active sessions over 4 weeks.
const CURRENT = [
  180, 820, 1450, 2380, 1560, 960, 2710, 890, 1420, 2350, 2760, 1510, 1380, 210, 1490, 2290, 2640, 2840, 920, 2180, 2690, 870, 240, 1530, 2420, 2930, 1470, 860,
];
const DATASETS = [
  { label: "Last 28d", days: CURRENT, funnel: [48200, 20300, 8700, 3100] },
  { label: "Prior 28d", days: CURRENT.map((_, i) => Math.round(CURRENT[(i + 3) % 28] * 0.82)), funnel: [44100, 17900, 8100, 2600] },
];
const STAGES = ["Visitors", "Sign-ups", "Activated", "Paid Conv."];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LEVELS = [
  { max: 500, name: "<500" },
  { max: 1000, name: "<1k" },
  { max: 2000, name: "<2k" },
  { max: 2500, name: "<2.5k" },
  { max: Infinity, name: "2.5k+" },
];
const level = (v: number) => LEVELS.findIndex((l) => v < l.max);
const k = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
const pct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

export default function Heatmap() {
  const [set, setSet] = useState(0);
  const [day, setDay] = useState(17);
  const [stage, setStage] = useState(2);
  const d = DATASETS[set];
  const avg = d.days.reduce((a, b) => a + b, 0) / d.days.length;
  const v = d.days[day];
  const drops = d.funnel.map((n, i) => (i ? (n / d.funnel[i - 1] - 1) * 100 : 0));
  const worst = drops.indexOf(Math.min(...drops));

  return (
    <div className={s.root}>
      <header className={s.head}>
        <h3 className={s.title}>TELEMETRY &amp; CONVERSION FUNNEL</h3>
        <span className={s.demo}>DEMO DATA</span>
        <div className={s.seg} role="radiogroup" aria-label="Dataset">
          {DATASETS.map((x, i) => (
            <button key={x.label} type="button" role="radio" aria-checked={i === set} className={s.segBtn} onClick={() => setSet(i)}>
              {x.label}
            </button>
          ))}
        </div>
      </header>

      <div className={s.cols}>
        <section className={s.left} aria-label="Activity heatmap">
          <p className={s.label}>ACTIVITY HEATMAP // 28-DAY ENGAGEMENT</p>
          <div className={s.grid}>
            {[0, 1, 2, 3].map((w) => (
              <div key={w} className={s.week}>
                <span className={s.wk} aria-hidden>
                  W{w + 1}
                </span>
                {DAYS.map((name, j) => {
                  const i = w * 7 + j;
                  const L = level(d.days[i]);
                  return (
                    <button
                      key={name}
                      type="button"
                      aria-pressed={i === day}
                      aria-label={`${name} week ${w + 1}, day ${i + 1}: ${d.days[i].toLocaleString("en-US")} sessions, level ${L}`}
                      className={`${s.cell} ${s[`l${L}`]}`}
                      onClick={() => setDay(i)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <p className={s.days} aria-hidden>
            {DAYS.map((x) => (
              <span key={x}>{x[0]}</span>
            ))}
          </p>
          <div className={s.tip} aria-live="polite">
            <p className={s.tipHead}>
              DAY {day + 1} // {DAYS[day % 7].toUpperCase()} W{Math.floor(day / 7) + 1} · L{level(v)}
            </p>
            <p className={s.tipValue}>{v.toLocaleString("en-US")} Active Sessions</p>
            <p className={v >= avg ? s.tipUp : s.tipDown}>{pct((v / avg - 1) * 100)} vs 28-day avg</p>
          </div>
          <p className={s.legend}>
            Less
            {LEVELS.map((l, i) => (
              <span key={l.name} className={s.key}>
                <span className={`${s.swatch} ${s[`l${i}`]}`} aria-hidden />
                {l.name}
              </span>
            ))}
          </p>
        </section>

        <section className={s.right} aria-label="Conversion funnel">
          <p className={s.label}>PIPELINE FUNNEL // STAGES</p>
          {d.funnel.map((n, i) => (
            <button key={STAGES[i]} type="button" aria-pressed={i === stage} className={s.stage} onClick={() => setStage(i)}>
              <span className={s.stageHead}>
                <span>
                  {i + 1}. {STAGES[i]}
                </span>
                <b>{k(n)}</b>
              </span>
              <span className={s.track}>
                <span className={s.fill} style={{ width: `${(n / d.funnel[0]) * 100}%` }} />
                {i > 0 && <span className={s.drop}>{drops[i].toFixed(0)}%</span>}
              </span>
            </button>
          ))}
        </section>
      </div>

      <footer className={s.foot}>
        <p>
          <span className={s.muted}>Stage {stage + 1} · </span>
          <b>
            {k(d.funnel[stage])} ({((d.funnel[stage] / d.funnel[0]) * 100).toFixed(stage === 3 ? 2 : 0)}% of visitors)
          </b>
          {stage > 0 && <span className={s.red}> {drops[stage].toFixed(0)}% vs step {stage}</span>}
        </p>
        <p>
          <span className={s.muted}>Bottleneck </span>
          <b className={s.red}>
            Step {worst} → {worst + 1}
          </b>
        </p>
      </footer>
    </div>
  );
}
