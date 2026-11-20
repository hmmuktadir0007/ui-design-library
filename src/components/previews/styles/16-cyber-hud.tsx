import { useState } from "react";
import s from "./16-cyber-hud.module.css";

// Deterministic demo telemetry: no randomness, so every state is reproducible (and testable).
const MODULES = [
  { key: "thrust", label: "THRUST VECTORING", base: 88.4, over: 99.1, tone: s.cyan },
  { key: "shield", label: "SHIELD MATRIX", base: 94.2, over: 71.5, tone: s.magenta },
  { key: "warp", label: "WARP FLUX INTEGRITY", base: 64.0, over: 97.3, tone: s.yellow },
] as const;
const CHANNELS = [
  { label: "CH-A", freq: "142.85 MHz", rate: "48.0 kS/s", seed: 3 },
  { label: "CH-B", freq: "311.20 MHz", rate: "96.0 kS/s", seed: 7 },
  { label: "CH-C", freq: "88.04 MHz", rate: "24.0 kS/s", seed: 11 },
];
const RANGES = [5, 10, 20];
// Contacts as [bearing deg, distance km]; a contact shows when it is inside the selected range.
const CONTACTS: [number, number][] = [
  [48, 3.2],
  [212, 7.5],
  [130, 16],
];
const bars = (seed: number, gain: number) =>
  Array.from({ length: 28 }, (_, i) => Math.round((((i * 37 + seed * 53) % 89) + 11) * gain));

export default function CyberHud() {
  const [on, setOn] = useState<Record<string, boolean>>({ thrust: true, shield: true, warp: true });
  const [channel, setChannel] = useState(0);
  const [range, setRange] = useState(1);
  const [overdrive, setOverdrive] = useState(false);
  const ch = CHANNELS[channel];
  const online = MODULES.filter((m) => on[m.key]).length;
  const power = (online * (overdrive ? 2.1 : 1.62)).toFixed(2);
  const km = RANGES[range];
  const visible = CONTACTS.filter(([, d]) => d <= km);

  return (
    <div className={`${s.root} ${overdrive ? s.over : ""}`}>
      <header className={s.top}>
        <span className={s.sys} role="status">
          SYS // {overdrive ? "OVERDRIVE" : online === 3 ? "ONLINE" : `DEGRADED ${online}/3`}
        </span>
        <span className={s.loc}>HUD_LOC: [34.72° N, 135.50° E] // CORE_SYNC: {overdrive ? "100.0" : "99.8"}%</span>
        <button type="button" role="switch" aria-checked={overdrive} className={s.overBtn} onClick={() => setOverdrive(!overdrive)}>
          OVERDRIVE
        </button>
      </header>

      <div className={s.main}>
        <section className={s.radarPanel} aria-label="Tactical radar">
          <svg className={s.radar} viewBox="-50 -50 100 100" role="img" aria-label={`Radar ${km} km range, ${visible.length} contacts`}>
            <circle r="46" className={s.ring} />
            <circle r="30" className={s.ringDash} />
            <circle r="14" className={s.ring} />
            <path d="M-46 0H46M0 -46V46" className={s.ring} />
            <g className={s.sweep}>
              <path d="M0 0 L0 -46 A46 46 0 0 1 32.5 -32.5 Z" className={s.wedge} />
              <path d="M0 0 L32.5 -32.5" className={s.beam} />
            </g>
            {visible.map(([b, d]) => {
              const r = (d / km) * 44;
              const a = ((b - 90) * Math.PI) / 180;
              return <circle key={b} cx={r * Math.cos(a)} cy={r * Math.sin(a)} r="3" className={d > 10 ? s.blipFar : s.blip} />;
            })}
          </svg>
          <div className={s.ranges} role="radiogroup" aria-label="Radar range">
            {RANGES.map((r, i) => (
              <button key={r} type="button" role="radio" aria-checked={range === i} className={s.rangeBtn} onClick={() => setRange(i)}>
                {r} KM
              </button>
            ))}
          </div>
          <span className={s.caption}>
            RADAR // {visible.length} CONTACT{visible.length === 1 ? "" : "S"}
          </span>
        </section>

        <section className={s.modules} aria-label="System modules">
          {MODULES.map((m) => {
            const v = on[m.key] ? (overdrive ? m.over : m.base) : 0;
            return (
              <button
                key={m.key}
                type="button"
                role="switch"
                aria-checked={on[m.key]}
                className={`${s.module} ${m.tone}`}
                onClick={() => setOn({ ...on, [m.key]: !on[m.key] })}
              >
                <span className={s.modLabel}>
                  {m.label} // {on[m.key] ? `${v.toFixed(1)}%` : "OFFLINE"}
                </span>
                <span className={s.track} aria-hidden>
                  <span className={s.fill} style={{ width: `${v}%` }} />
                </span>
              </button>
            );
          })}
          <div className={s.readouts}>
            <span className={s.box}>
              FREQ: {ch.freq}
              <b className={s.cyanText}>PWR: {power} GW</b>
            </span>
            <span className={s.box}>
              NODE: 0x7F_SEC
              <b className={s.pink}>PING: {overdrive ? "0.4" : "1.2"} MS</b>
            </span>
          </div>
        </section>
      </div>

      <section className={s.spectrum} aria-label="Spectrum telemetry">
        <div className={s.specHead}>
          <span className={s.specTitle}>SPECTRUM HARMONICS // {ch.label}</span>
          <div className={s.channels} role="radiogroup" aria-label="Telemetry channel">
            {CHANNELS.map((c, i) => (
              <button key={c.label} type="button" role="radio" aria-checked={channel === i} className={s.chBtn} onClick={() => setChannel(i)}>
                {c.label}
              </button>
            ))}
          </div>
          <span className={s.rate}>SAMPLING: {ch.rate}</span>
        </div>
        <div className={s.bars} aria-hidden>
          {bars(ch.seed, overdrive ? 1 : 0.85).map((h, i) => (
            <span key={i} className={s.bar} style={{ height: `${Math.min(h, 100)}%` }} data-tone={i % 7 === 3 ? "m" : i % 11 === 5 ? "y" : "c"} />
          ))}
        </div>
        <span className={s.log}>&gt; ENCRYPTED DATASTREAM // LINK: {online ? "ACTIVE" : "LOST"} // {online} OF 3 MODULES</span>
      </section>
    </div>
  );
}
