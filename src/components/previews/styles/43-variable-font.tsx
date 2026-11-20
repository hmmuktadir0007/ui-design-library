import { useState, type CSSProperties } from "react";
import s from "./43-variable-font.module.css";

const COMPOSITIONS = [
  { label: "Heavy", text: "HEAVY", size: 54 },
  { label: "Kinetic", text: "KINETIC", size: 40 },
  { label: "Glyphs", text: "Aa Gg 09", size: 40 },
];
const DEFAULTS = { wght: 780, wdth: 118, comp: 0, animate: false };

export default function VariableFont() {
  const [wght, setWght] = useState(DEFAULTS.wght);
  const [wdth, setWdth] = useState(DEFAULTS.wdth);
  const [comp, setComp] = useState(DEFAULTS.comp);
  const [animate, setAnimate] = useState(DEFAULTS.animate);
  const c = COMPOSITIONS[comp];
  const fvs = `"wght" ${wght}, "wdth" ${wdth}`;
  // font-weight is the fallback if the variable font fails to load; width has no honest fallback, so none is faked.
  const hero: CSSProperties = { fontVariationSettings: fvs, fontWeight: wght, fontSize: c.size };
  const reset = () => {
    setWght(DEFAULTS.wght);
    setWdth(DEFAULTS.wdth);
    setComp(DEFAULTS.comp);
    setAnimate(DEFAULTS.animate);
  };

  return (
    <div className={s.root}>
      <header className={s.top}>
        <span className={s.brand}>FOUNDRY // KINETIC AXIS</span>
        <span className={s.dim}>WGHT: [300 – 900] • WDTH: [100 – 125%]</span>
      </header>

      <div className={s.refs} aria-hidden>
        <span className={s.light}>LIGHT</span>
        <span className={s.pill}>WGHT 300</span>
        <span className={s.medium}>MEDIUM</span>
        <span className={s.pill}>WGHT 500</span>
      </div>

      <div className={s.card}>
        <p className={`${s.hero} ${animate ? s.anim : ""}`} style={hero}>
          {c.text}
        </p>
        <div className={s.badge}>
          <span className={s.hot}>
            <span className={s.dot} aria-hidden />
            WGHT {wght}
          </span>
          <span className={s.wdth}>WDTH: {wdth}% {wdth > 110 ? "// EXPANDED" : "// NORMAL"}</span>
          <span className={s.rm}>Reduced motion: animation off</span>
        </div>
      </div>

      <div className={s.controls}>
        <label className={s.slider}>
          <span className={s.name}>Weight</span>
          <input type="range" min={300} max={900} value={wght} aria-label="Weight" className={s.range} onChange={(e) => setWght(+e.target.value)} />
          <span className={s.val}>{wght}</span>
        </label>
        <label className={s.slider}>
          <span className={s.name}>Width</span>
          <input type="range" min={100} max={125} value={wdth} aria-label="Width" className={s.range} onChange={(e) => setWdth(+e.target.value)} />
          <span className={s.val}>{wdth}%</span>
        </label>
        <div className={s.row}>
          <div className={s.comps} role="radiogroup" aria-label="Composition">
            {COMPOSITIONS.map((x, i) => (
              <button key={x.label} type="button" role="radio" aria-checked={comp === i} className={s.comp} onClick={() => setComp(i)}>
                {x.label}
              </button>
            ))}
          </div>
          <button type="button" role="switch" aria-checked={animate} className={s.toggle} onClick={() => setAnimate(!animate)}>
            Animate
          </button>
          <button type="button" className={s.reset} onClick={reset}>
            Reset
          </button>
        </div>
      </div>

      <footer className={s.foot}>
        <span>AXIS // CSS FONT-VARIATION-SETTINGS</span>
        <code className={s.code}>{animate ? "ANIMATING 300 ↔ 900" : fvs}</code>
      </footer>
    </div>
  );
}
