import { useState } from "react";
import s from "./29-data-dense.module.css";

const RANGES = ["1H", "24H", "7D"] as const;
type Range = (typeof RANGES)[number];
// Deterministic demo data: no randomness, so screenshots and tests are stable.
const KPIS = [
  { key: "uptime", label: "UPTIME SLA", value: ["99.99%", "99.98%", "99.95%"], delta: ["+0.01%", "+0.04%", "−0.02%"], good: [true, true, false], series: [96, 97, 97, 98, 98, 98, 99, 99, 99, 99, 99, 100] },
  { key: "conv", label: "CONVERSION", value: ["+9.8%", "+14.2%", "+11.6%"], delta: ["+2.1%", "+14.2%", "+3.4%"], good: [true, true, true], series: [40, 44, 42, 50, 54, 52, 60, 58, 66, 70, 68, 74] },
  { key: "p99", label: "AVG P99 LATENCY", value: ["38ms", "42ms", "47ms"], delta: ["−2.0ms", "+8.4ms", "+12.1ms"], good: [true, false, false], series: [60, 52, 48, 50, 44, 46, 40, 42, 38, 44, 48, 52] },
  { key: "arr", label: "GROSS RUN-RATE ARR", value: ["$1.38M", "$1.40M", "$1.42M"], delta: ["+1%", "+28%", "+31%"], good: [true, true, true], series: [30, 34, 33, 40, 44, 42, 50, 56, 54, 62, 66, 72] },
];
const ROWS = [
  { service: "auth.service.v2.verify", reqs: 8421, p99: 18.2, load: 82 },
  { service: "edge.proxy.stream.pipe", reqs: 24910, p99: 3.4, load: 94 },
  { service: "db.replica.wal.sync", reqs: 1180, p99: 104.5, load: 41 },
  { service: "queue.ingest.batch", reqs: 5302, p99: 27.9, load: 63 },
];
const COLS = [
  { key: "service", label: "SERVICE" },
  { key: "reqs", label: "REQ/S" },
  { key: "p99", label: "P99" },
  { key: "load", label: "LOAD" },
] as const;
type Col = (typeof COLS)[number]["key"];
const SCALE = [0.04, 1, 7.2]; // traffic per range relative to 24H, so the table follows the range too

/** Each range shifts the shared series a little, deterministically. */
const shift = (series: number[], r: number) => series.map((v, i) => Math.max(2, Math.min(100, v + (((i * 7 + r * 5) % 9) - 4) * r)));
/** Polyline points scaled to the series' own min..max, with 10% headroom, so small moves stay visible. */
const line = (pts: number[], w: number, h: number) => {
  const lo = Math.min(...pts);
  const span = Math.max(1, Math.max(...pts) - lo);
  return pts.map((p, i) => `${(i * w) / (pts.length - 1)},${(h * 0.9 - ((p - lo) / span) * h * 0.8).toFixed(1)}`).join(" ");
};

export default function DataDense() {
  const [range, setRange] = useState<Range>("24H");
  const [metric, setMetric] = useState(0);
  const [sort, setSort] = useState<{ col: Col; asc: boolean } | null>(null);
  const r = RANGES.indexOf(range);
  const m = KPIS[metric];
  const pts = shift(m.series, r);

  const rows = ROWS.map((row) => ({ ...row, reqs: Math.round(row.reqs * SCALE[r]) }));
  if (sort) {
    rows.sort((a, b) => {
      const d = sort.col === "service" ? a.service.localeCompare(b.service) : a[sort.col] - b[sort.col];
      return sort.asc ? d : -d;
    });
  }
  const sortBy = (col: Col) => setSort((cur) => ({ col, asc: cur?.col === col ? !cur.asc : col === "service" }));

  return (
    <div className={s.root}>
      <header className={s.head}>
        <h3 className={s.title}>METRIC TELEMETRY ENGINE // CLUSTER-01</h3>
        <div className={s.seg} role="radiogroup" aria-label="Date range">
          {RANGES.map((x) => (
            <button key={x} type="button" role="radio" aria-checked={x === range} className={s.segBtn} onClick={() => setRange(x)}>
              {x}
            </button>
          ))}
        </div>
      </header>

      <div className={s.kpis} role="radiogroup" aria-label="Metric">
        {KPIS.map((k, i) => (
          <button key={k.key} type="button" role="radio" aria-checked={i === metric} className={s.kpi} onClick={() => setMetric(i)}>
            <span className={s.kLabel}>{k.label}</span>
            <span className={s.kValue}>{k.value[r]}</span>
            <span className={`${s.badge} ${k.good[r] ? s.up : s.down}`}>
              {k.good[r] ? "▲" : "▼"} {k.delta[r]}
            </span>
            <svg className={s.spark} viewBox="0 0 60 16" aria-hidden>
              <polyline points={line(shift(k.series, r), 60, 16)} className={k.good[r] ? s.sUp : s.sDown} />
            </svg>
          </button>
        ))}
      </div>

      <section className={s.panel} aria-label={`${m.label} detail`}>
        <div className={s.panelHead}>
          <span>
            {m.label} // {range}
          </span>
          <span>
            MIN {Math.min(...pts)} · MAX {Math.max(...pts)} · LAST <b className={m.good[r] ? s.tUp : s.tDown}>{m.value[r]}</b>
          </span>
        </div>
        <svg className={s.chart} viewBox="0 0 300 50" preserveAspectRatio="none" role="img" aria-label={`${m.label} trend over ${range}, now ${m.value[r]} (${m.delta[r]})`}>
          {[12.5, 25, 37.5].map((y) => (
            <line key={y} x1="0" x2="300" y1={y} y2={y} className={s.grid} />
          ))}
          <polyline points={line(pts, 300, 50)} className={m.good[r] ? s.sUp : s.sDown} />
        </svg>
      </section>

      <table className={s.table}>
        <caption className={s.caption}>TELEMETRY TRACE LOG // {range}</caption>
        <thead>
          <tr>
            {COLS.map((c) => (
              <th key={c.key} scope="col" aria-sort={sort?.col === c.key ? (sort.asc ? "ascending" : "descending") : undefined}>
                <button type="button" className={s.sortBtn} onClick={() => sortBy(c.key)}>
                  {c.label}
                  <span aria-hidden className={s.arrow}>
                    {sort?.col === c.key ? (sort.asc ? "↑" : "↓") : "↕"}
                  </span>
                </button>
              </th>
            ))}
            <th scope="col" className={s.status}>
              STATUS
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.service}>
              <td className={s.svc}>{row.service}</td>
              <td>{row.reqs.toLocaleString("en-US")}</td>
              <td className={row.p99 > 50 ? s.tDown : s.blue}>{row.p99}ms</td>
              <td>
                <span className={s.load}>
                  <span className={row.p99 > 50 ? s.loadBad : ""} style={{ width: `${row.load}%` }} />
                </span>
                {row.load}%
              </td>
              <td className={`${s.statusCell} ${row.p99 > 50 ? s.tDown : s.tUp}`}>{row.p99 > 50 ? "DEGRADED" : "PASS 200"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
