import { useState } from "react";
import s from "./13-bauhaus.module.css";

const PRIMITIVES = [
  { label: "Circle", code: "CRC", ratio: "1:1" },
  { label: "Triangle", code: "TRI", ratio: "1:1.15" },
  { label: "Square", code: "SQR", ratio: "1:1" },
];
const LAYOUTS = [
  { label: "2:1:1", cls: s.wide, scale: "1:1.6" },
  { label: "1:1:2", cls: s.flip, scale: "1:2" },
];
// Rotating the primaries: which colour fills the hero shape, the system block and the geometry block.
const ROTATIONS = [
  ["ROT", "BLAU", "GELB"],
  ["BLAU", "GELB", "ROT"],
  ["GELB", "ROT", "BLAU"],
] as const;

export default function Bauhaus() {
  const [shape, setShape] = useState(0);
  const [layout, setLayout] = useState(0);
  const [rot, setRot] = useState(0);
  const [a, b, c] = ROTATIONS[rot];
  const p = PRIMITIVES[shape];

  return (
    <div className={`${s.root} ${LAYOUTS[layout].cls}`}>
      <section className={s.hero}>
        <span className={s.kicker}>
          <span className={s.mark} aria-hidden />
          STAATLICHES BAUHAUS
        </span>
        <h3 className={s.title}>
          FORM +<br />
          <span className={s.red}>GRID.</span>
        </h3>
        <span className={`${s.shape} ${s[p.label.toLowerCase()]}`} data-color={a} aria-hidden />
      </section>
      <section className={s.system} data-color={b}>
        <span className={s.tri} aria-hidden />
        <span className={s.dot} aria-hidden />
        <span className={s.sysText}>
          SYSTEM 0{rot + 1} // BLK
          <small>DESSAU 1925</small>
        </span>
      </section>
      <section className={s.geo} data-color={c}>
        <span className={s.geoMark} aria-hidden>
          <span className={s.geoTri} />
        </span>
        <span className={s.geoText}>GEOMETRIE • 03</span>
      </section>
      <section className={s.ordnung}>
        <h4 className={s.h4}>TYPOGRAFISCHE ORDNUNG</h4>
        <div className={s.tiles}>
          <span className={s.tile}>
            SCALE<b className={s.redText}>{LAYOUTS[layout].scale}</b>
          </span>
          <span className={`${s.tile} ${s.blueTile}`}>
            RATIO<b>{p.ratio}</b>
          </span>
          <span className={`${s.tile} ${s.redTile}`}>
            PRIMITIV<b className={s.primText}>{p.code}</b>
          </span>
        </div>
      </section>
      <footer className={s.foot}>
        <div className={s.group} role="radiogroup" aria-label="Primitive">
          {PRIMITIVES.map((x, i) => (
            <button key={x.label} type="button" role="radio" aria-checked={shape === i} aria-label={x.label} className={s.prim} onClick={() => setShape(i)}>
              <span className={`${s.icon} ${s[`i${x.label}`]}`} aria-hidden />
            </button>
          ))}
        </div>
        <div className={s.group} role="radiogroup" aria-label="Grid">
          {LAYOUTS.map((x, i) => (
            <button key={x.label} type="button" role="radio" aria-checked={layout === i} className={s.btn} onClick={() => setLayout(i)}>
              {x.label}
            </button>
          ))}
        </div>
        <button type="button" className={s.btn} onClick={() => setRot((rot + 1) % 3)}>
          Rotate
        </button>
        <span className={s.codes}>
          {a} • {b} • {c}
        </span>
      </footer>
    </div>
  );
}
