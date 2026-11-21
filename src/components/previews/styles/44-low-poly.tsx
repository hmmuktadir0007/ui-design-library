import { useState } from "react";
import { onRadioGroupKeyDown } from "../shared/radioGroup";
import s from "./44-low-poly.module.css";
import { facets, H, W } from "./44-mesh";

const DENSITIES = [
  { cols: 4, rows: 3 },
  { cols: 6, rows: 3 },
  { cols: 9, rows: 3 },
];
const PALETTES = {
  Indigo: ["#100e33", "#1e1b4b", "#4338ca"],
  Cyan: ["#0a1f2c", "#0e5a73", "#06b6d4"],
} as const;
type Palette = keyof typeof PALETTES;
export default function LowPoly() {
  const [density, setDensity] = useState(1);
  const [light, setLight] = useState(135);
  const [palette, setPalette] = useState<Palette>("Indigo");
  const { cols, rows } = DENSITIES[density];
  const mesh = facets(cols, rows, light, PALETTES[palette]);

  return (
    <div className={s.root}>
      <svg className={s.mesh} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
        {mesh.map((f, i) => (
          <path key={i} d={f.d} fill={f.fill} />
        ))}
      </svg>
      <section className={s.panel} aria-label="Crystalline UI">
        <div className={s.head}>
          <span className={s.chip}>POLY // V2.4</span>
          <span className={s.dim}>MESH ENGINE ACTIVE</span>
        </div>
        <h3 className={s.title}>CRYSTALLINE UI</h3>
        <p className={s.sub}>Stepped polygon lighting &amp; sharp directional planes.</p>
        <div className={s.row}>
          <div className={s.group} role="radiogroup" aria-label="Planes" onKeyDown={onRadioGroupKeyDown}>
            {DENSITIES.map((d, i) => (
              <button key={i} type="button" role="radio" aria-checked={density === i} tabIndex={density === i ? 0 : -1} className={s.btn} onClick={() => setDensity(i)}>
                {d.cols * d.rows * 2}
              </button>
            ))}
          </div>
          <div className={s.group} role="radiogroup" aria-label="Facet palette" onKeyDown={onRadioGroupKeyDown}>
            {(Object.keys(PALETTES) as Palette[]).map((p) => (
              <button key={p} type="button" role="radio" aria-checked={palette === p} tabIndex={palette === p ? 0 : -1} className={s.btn} onClick={() => setPalette(p)}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <label className={s.slider}>
          <span className={s.dim}>LIGHT</span>
          <input type="range" min={0} max={355} value={light} aria-label="Light angle" className={s.range} onChange={(e) => setLight(+e.target.value)} />
          <span className={s.val}>{light}°</span>
        </label>
        <div className={s.foot}>
          <span>SHADING: FLAT STEPPED</span>
          <span>{mesh.length} PLANES</span>
        </div>
      </section>
    </div>
  );
}
