import { useState } from "react";
import s from "./11-swiss.module.css";

const PROJECTS = [
  {
    title: "Quiet Form",
    kind: "Essay",
    year: 2026,
    cols: [
      ["Grid Integrity", "Form follows absolute clarity through calculated geometric proportion, stripping away decorative excess."],
      ["Active Space", "Generous negative margins create typographic tension, guiding the gaze without ornament."],
    ],
    info: "12 columns · 8 pt baseline · Akzidenz-style sans · 48 pages",
    ref: "DIN 1451 / GRID",
  },
  {
    title: "Concrete Index",
    kind: "Architecture",
    year: 2025,
    cols: [
      ["Raw Module", "A housing block measured in 600 mm units, each façade panel drawn from one repeating grid."],
      ["Shared Light", "Courtyards cut into the plan bring daylight to every stair core and landing."],
    ],
    info: "Basel · 34 units · exposed concrete · completed 2025",
    ref: "SIA 112 / PLAN",
  },
  {
    title: "Signal System",
    kind: "Wayfinding",
    year: 2024,
    cols: [
      ["One Typeface", "A single grotesk in three sizes carries every sign, from platform to exit."],
      ["Fixed Positions", "Signs hang on one datum line, so travellers learn where to look once."],
    ],
    info: "Zürich HB · 220 signs · pictograms after Aicher · 2024",
    ref: "SBB / SIGNAGE",
  },
  {
    title: "Paper Archive",
    kind: "Exhibition",
    year: 2023,
    cols: [
      ["Folded Sheets", "Posters from 1950–1975 hung unframed on a steel rail at reading height."],
      ["Plain Labels", "Captions set flush left, ragged right, in one size beneath every work."],
    ],
    info: "Museum für Gestaltung · 64 posters · 4 rooms",
    ref: "MFG / 1950–75",
  },
];
const nn = (i: number) => String(i + 1).padStart(2, "0");

export default function Swiss() {
  const [view, setView] = useState<"Index" | "Read">("Read");
  const [cur, setCur] = useState(0);
  const [more, setMore] = useState(false);
  const p = PROJECTS[cur];
  const open = (i: number) => {
    setCur(i);
    setMore(false);
    setView("Read");
  };

  return (
    <div className={s.root}>
      <header className={s.top}>
        <p className={s.edition}>
          <b>EDITION 08 // ARCHIVE</b> ZÜRICH, CH
        </p>
        <div className={s.views} role="radiogroup" aria-label="View">
          {(["Index", "Read"] as const).map((v) => (
            <button key={v} type="button" role="radio" aria-checked={view === v} className={s.view} onClick={() => setView(v)}>
              {v}
            </button>
          ))}
        </div>
      </header>

      {view === "Index" ? (
        <section className={s.index} aria-label="Project index">
          <p className={s.kicker}>INDEX / 04 PROJECTS</p>
          <ol className={s.rows}>
            {PROJECTS.map((x, i) => (
              <li key={x.title}>
                <button type="button" className={s.row} aria-current={i === cur ? "true" : undefined} onClick={() => open(i)}>
                  <span className={s.num}>{nn(i)}</span>
                  <span className={s.rowTitle}>{x.title}</span>
                  <span className={s.meta}>{x.kind}</span>
                  <span className={s.meta}>{x.year}</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <section className={s.read} aria-label={p.title}>
          <p className={s.kicker}>SYSTEMATIC DESIGN / {p.kind.toUpperCase()}</p>
          <h3 className={s.title}>
            {nn(cur)} / {p.title}
          </h3>
          {more ? (
            <p className={s.info}>
              {p.info}
            </p>
          ) : (
            <div className={s.cols}>
              {p.cols.map(([h, t]) => (
                <div key={h}>
                  <h4 className={s.colHead}>{h}</h4>
                  <p className={s.colText}>{t}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <footer className={s.foot}>
        {view === "Read" ? (
          <>
            <button type="button" className={s.primary} onClick={() => open((cur + 1) % PROJECTS.length)}>
              NEXT PROJECT →
            </button>
            <button type="button" className={s.more} aria-expanded={more} onClick={() => setMore(!more)}>
              {more ? "− Less" : "+ Project info"}
            </button>
          </>
        ) : (
          <span className={s.meta}>Select a number to read</span>
        )}
        <span className={s.ref}>REF: {p.ref}</span>
      </footer>
    </div>
  );
}
