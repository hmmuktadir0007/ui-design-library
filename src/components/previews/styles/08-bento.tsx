import { useState, type CSSProperties } from "react";
import { onRadioGroupKeyDown } from "../shared/radioGroup";
import s from "./08-bento.module.css";

const RANGES = ["7D", "30D"] as const;
type Range = (typeof RANGES)[number];
// Deterministic demo series per metric and range (chart points, 0-100).
const METRICS = [
  { key: "users", label: "Monthly users", value: { "7D": "21,480", "30D": "84,920" }, delta: { "7D": "+4%", "30D": "+12%" }, pts: { "7D": [30, 42, 38, 55, 50, 64, 70], "30D": [20, 34, 30, 48, 58, 52, 78] } },
  { key: "revenue", label: "Revenue", value: { "7D": "$36.2K", "30D": "$148.5K" }, delta: { "7D": "+6%", "30D": "+11%" }, pts: { "7D": [40, 36, 50, 46, 62, 58, 74], "30D": [25, 45, 35, 60, 50, 72, 82] } },
  { key: "conversion", label: "Conversion", value: { "7D": "3.1%", "30D": "3.4%" }, delta: { "7D": "−0.2%", "30D": "+0.3%" }, pts: { "7D": [60, 58, 54, 56, 50, 52, 48], "30D": [38, 44, 40, 52, 48, 56, 60] } },
  { key: "completion", label: "Project completion", value: { "7D": "68%", "30D": "74%" }, delta: { "7D": "+3%", "30D": "+9%" }, pts: { "7D": [50, 54, 55, 60, 62, 65, 68], "30D": [30, 38, 45, 52, 60, 68, 74] } },
];
const path = (pts: number[]) => pts.map((p, i) => `${i ? "L" : "M"}${(i * 200) / (pts.length - 1)},${100 - p}`).join(" ");

export default function Bento() {
  const [metric, setMetric] = useState(0);
  const [range, setRange] = useState<Range>("30D");
  const [log, setLog] = useState(["Jolny opened Analytics", "Mary exported KPIs"]);
  const m = METRICS[metric];
  const push = (line: string) => setLog((l) => [line, ...l].slice(0, 3));

  return (
    <div className={s.root}>
      <section className={`${s.tile} ${s.hero}`} aria-label="Analytics overview">
        <div className={s.heroHead}>
          <p className={s.kicker}>Analytics Overview · {m.label}</p>
          <div className={s.seg} role="radiogroup" aria-label="Range" onKeyDown={onRadioGroupKeyDown}>
            {RANGES.map((r) => (
              <button key={r} type="button" role="radio" aria-checked={range === r} tabIndex={range === r ? 0 : -1} className={s.segBtn} onClick={() => setRange(r)}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <p className={s.heroValue}>
          {m.value[range]} <span className={s.up}>{m.delta[range]}</span>
        </p>
        <svg className={s.chart} viewBox="0 0 200 100" preserveAspectRatio="none" role="img" aria-label={`${m.label}, last ${range}: ${m.value[range]}`}>
          {[25, 50, 75].map((y) => (
            <line key={y} x1="0" x2="200" y1={y} y2={y} className={s.gridLine} />
          ))}
          <path d={`${path(m.pts[range])} L200,100 L0,100 Z`} className={s.area} />
          <path d={path(m.pts[range].map((p, i) => Math.max(12, Math.min(92, p - 14 + (i % 2 ? 10 : -4)))))} className={s.lineAlt} />
          <path d={path(m.pts[range])} className={s.line} />
        </svg>
      </section>

      {METRICS.map((x, i) => (
        <button
          key={x.key}
          type="button"
          aria-pressed={i === metric}
          className={`${s.tile} ${s.kpi} ${s[x.key] ?? ""}`}
          onClick={() => {
            setMetric(i);
            push(`You opened ${x.label}`);
          }}
        >
          <span className={s.kpiLabel}>{x.label}</span>
          <span className={s.kpiValue}>{x.value[range]}</span>
          {x.key === "completion" ? (
            <span className={s.gauge} style={{ "--p": parseFloat(x.value[range]) } as CSSProperties} aria-hidden />
          ) : (
            <span className={s.bars} aria-hidden>
              {x.pts[range].slice(-5).map((p, j) => (
                <span key={j} style={{ height: `${p}%` }} />
              ))}
            </span>
          )}
        </button>
      ))}

      <section className={`${s.tile} ${s.activity}`} aria-label="Recent activity">
        <p className={s.kicker}>Recent Activity</p>
        <ul className={s.log} aria-live="polite">
          {log.map((l, i) => (
            <li key={log.length - i}>
              <span className={s.avatar} aria-hidden />
              {l}
              <span className={s.status}>{i === 0 ? "now" : `${i * 3}h ago`}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${s.tile} ${s.actions}`} aria-label="Quick actions">
        <p className={s.kicker}>Quick Actions</p>
        <div className={s.actionRow}>
          <button type="button" className={s.action} onClick={() => push(`Shared ${m.label} (${range})`)}>
            ↗ Share
          </button>
          <button type="button" className={s.action} onClick={() => push(`Exported ${m.key}_${range.toLowerCase()}.csv`)}>
            ⤓ Export
          </button>
        </div>
      </section>
    </div>
  );
}
