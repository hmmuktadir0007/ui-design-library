import { useState, type CSSProperties } from "react";
import s from "./09-aurora.module.css";

const MESHES = ["Borealis", "Dusk", "Lagoon"] as const;
const FEATURES = [
  { label: "Generate", chip: "AURORA ENGINE", title: "Aurora Hero", text: "Ethereal chromatic illumination with radiant colour bands behind balanced typography." },
  { label: "Analyze", chip: "SIGNAL LENS", title: "Signal Lens", text: "Every model run streams into one calm surface: latency, cost and drift at a glance." },
  { label: "Deploy", chip: "EDGE LAUNCH", title: "Edge Launch", text: "Ship to 300 regions in one step. Rollbacks are instant and every release is logged." },
];
const DEFAULTS = { mesh: 0, glow: 70, feature: 0, ambient: false };

export default function Aurora() {
  const [mesh, setMesh] = useState(DEFAULTS.mesh);
  const [glow, setGlow] = useState(DEFAULTS.glow);
  const [feature, setFeature] = useState(DEFAULTS.feature);
  const [ambient, setAmbient] = useState(DEFAULTS.ambient);
  const f = FEATURES[feature];
  const reset = () => {
    setMesh(DEFAULTS.mesh);
    setGlow(DEFAULTS.glow);
    setFeature(DEFAULTS.feature);
    setAmbient(DEFAULTS.ambient);
  };

  return (
    <div className={`${s.root} ${s[MESHES[mesh].toLowerCase()]} ${ambient ? s.ambient : ""}`} style={{ "--glow": glow / 100 } as CSSProperties}>
      <div className={s.sky} aria-hidden>
        {[1, 2, 3, 4].map((n) => (
          <span key={n} data-blob={n} className={`${s.blob} ${s[`b${n}`]}`} />
        ))}
      </div>

      <section className={s.panel} aria-label="Aurora hero">
        <span className={s.chip}>✦ {f.chip}</span>
        <h3 className={s.title}>{f.title}</h3>
        <p className={s.text}>{f.text}</p>
        <div className={s.features} role="radiogroup" aria-label="Product feature">
          {FEATURES.map((x, i) => (
            <button key={x.label} type="button" role="radio" aria-checked={feature === i} className={s.feature} onClick={() => setFeature(i)}>
              {x.label}
            </button>
          ))}
        </div>
      </section>

      <div className={s.controls}>
        <div className={s.row}>
          <div className={s.meshes} role="radiogroup" aria-label="Aurora arrangement">
            {MESHES.map((m, i) => (
              <button key={m} type="button" role="radio" aria-checked={mesh === i} className={s.mesh} onClick={() => setMesh(i)}>
                {m}
              </button>
            ))}
          </div>
          <button type="button" role="switch" aria-checked={ambient} className={s.toggle} onClick={() => setAmbient(!ambient)}>
            Ambient
          </button>
          <button type="button" className={s.reset} onClick={reset}>
            Reset
          </button>
        </div>
        <label className={s.slider}>
          <span className={s.name}>Glow</span>
          <input type="range" min={20} max={100} value={glow} aria-label="Glow" className={s.range} onChange={(e) => setGlow(+e.target.value)} />
          <span className={s.val}>
            MESH // {MESHES[mesh].toUpperCase()} · GLOW {glow}%
          </span>
        </label>
      </div>
      <span className={s.rm}>Reduced motion: ambient drift off</span>
    </div>
  );
}
