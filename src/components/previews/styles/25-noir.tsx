import { useState } from "react";
import s from "./25-noir.module.css";

const FRAMES = [
  { title: "Brutalist Architecture", art: "a1", exif: "ISO 100 · 24MM · f/11 · 1/250" },
  { title: "Optic Study", art: "a2", exif: "ISO 400 · 50MM · f/1.8 · 1/500" },
  { title: "Metrics Grid", art: "a3", exif: "ISO 200 · 35MM · f/8 · 1/125" },
  { title: "Dune Light", art: "a4", exif: "ISO 64 · 85MM · f/5.6 · 1/1000" },
] as const;
const nn = (i: number) => String(i + 1).padStart(2, "0");

export default function Noir() {
  const [sel, setSel] = useState(0);
  const [focus, setFocus] = useState(false);
  const [invert, setInvert] = useState(false);
  const [info, setInfo] = useState(false);
  const f = FRAMES[sel];
  const step = (d: number) => setSel((sel + d + FRAMES.length) % FRAMES.length);

  return (
    <div className={`${s.root} ${invert ? s.inv : ""}`}>
      <header className={s.top}>
        <span className={s.brand}>ARCHIVE // MONOCHROME</span>
        <span className={s.dim}>SERIES 01 • SPATIAL • INQUIRE</span>
      </header>

      <div className={s.body}>
        <section className={s.left} aria-label="Collection">
          <h3 className={s.title}>NOIR</h3>
          <p className={s.edition}>// 2026 EDITION</p>
          {info ? (
            <dl className={s.info}>
              <dt>FRAME {nn(sel)}</dt>
              <dd>{f.title}</dd>
              <dt>EXPOSURE</dt>
              <dd>{f.exif}</dd>
            </dl>
          ) : (
            <p className={s.desc}>High-contrast spatial frames. Pure tonal luminescence, 1px hairlines and absolute black geometry.</p>
          )}
          <button type="button" className={s.primary} onClick={() => setFocus(!focus)}>
            {focus ? "← BACK TO GRID" : "VIEW FRAME →"}
          </button>
          <button type="button" className={s.ghost} aria-expanded={info} onClick={() => setInfo(!info)}>
            {info ? "HIDE INFO" : "IMAGE INFO"}
          </button>
        </section>

        <section className={s.right} aria-label={focus ? `Frame ${nn(sel)} of ${FRAMES.length}` : "Frames"}>
          {focus ? (
            <>
              <div className={`${s.frame} ${s.big} ${s[f.art]}`} role="img" aria-label={`Frame ${nn(sel)}: ${f.title}`}>
                <span className={s.label}>FRAME {nn(sel)}</span>
                <span className={s.caption}>{f.title.toUpperCase()}</span>
              </div>
              <div className={s.pager}>
                <button type="button" className={s.ghost} aria-label="Previous frame" onClick={() => step(-1)}>
                  ←
                </button>
                <span className={s.dim}>
                  {nn(sel)} / {nn(FRAMES.length - 1)}
                </span>
                <button type="button" className={s.ghost} aria-label="Next frame" onClick={() => step(1)}>
                  →
                </button>
              </div>
            </>
          ) : (
            <div className={s.grid}>
              {FRAMES.map((x, i) => (
                <button
                  key={x.title}
                  type="button"
                  className={`${s.frame} ${s.thumb} ${s[x.art]}`}
                  aria-pressed={sel === i}
                  aria-label={`Frame ${nn(i)}: ${x.title}`}
                  onClick={() => setSel(i)}
                  onDoubleClick={() => setFocus(true)}
                >
                  <span className={s.label}>{nn(i)}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <footer className={s.foot}>
        <span className={s.dim}>STARK CONTRAST // RATIO 21:1</span>
        <button type="button" role="switch" aria-checked={invert} className={s.switch} onClick={() => setInvert(!invert)}>
          <span className={s.knob} aria-hidden />
          INVERT
        </button>
      </footer>
    </div>
  );
}
