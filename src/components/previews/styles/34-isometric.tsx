import { useState } from "react";
import s from "./34-isometric.module.css";

const LAYERS = [
  { key: "l3", tag: "L3: APP UI STACK", name: "App UI Stack", detail: "4 micro-frontends · 38 ms TTI", tone: s.top },
  { key: "l2", tag: "L2: SERVICES", name: "Services", detail: "12 nodes · 99.98% uptime", tone: s.mid },
  { key: "l1", tag: "L1: STORAGE", name: "Storage", detail: "3 replicas · 2.4 TB", tone: s.base },
];

export default function Isometric() {
  const [sel, setSel] = useState(1);
  const [exploded, setExploded] = useState(false);
  const cur = LAYERS[sel];

  return (
    <div className={`${s.root} ${exploded ? s.exploded : ""}`}>
      <div className={s.stack} aria-hidden>
        {LAYERS.map((l, i) => (
          <div key={l.key} className={`${s.plane} ${l.tone} ${i === sel ? s.active : ""}`} style={{ zIndex: 3 - i }} onClick={() => setSel(i)}>
            <span className={s.nodes} />
          </div>
        ))}
      </div>

      <div className={s.tags} role="radiogroup" aria-label="Architecture layer">
        {LAYERS.map((l, i) => (
          <button key={l.key} type="button" role="radio" aria-checked={i === sel} className={`${s.tag} ${s[`tag${i}`]}`} onClick={() => setSel(i)}>
            {l.tag}
          </button>
        ))}
      </div>

      <footer className={s.foot}>
        <span aria-live="polite">
          SELECTED // {cur.name.toUpperCase()} — {cur.detail}
        </span>
        <button type="button" className={s.explode} aria-pressed={exploded} onClick={() => setExploded((e) => !e)}>
          {exploded ? "Collapse" : "Explode"}
        </button>
      </footer>
    </div>
  );
}
