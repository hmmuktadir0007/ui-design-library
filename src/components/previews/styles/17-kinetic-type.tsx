import { useState } from "react";
import { onRadioGroupKeyDown } from "../shared/radioGroup";
import s from "./17-kinetic-type.module.css";

const COMPOSITIONS = [
  { no: "04", tag: "[EXP. DISRUPT]", lines: ["MAKE", "NOISE", "NOW"], rooms: ["Room A — Letterpress Riot", "Room B — 1:1 Billboards", "Room C — Sound of Type"] },
  { no: "07", tag: "[TYPE LAB]", lines: ["TYPE", "IS", "LOUD"], rooms: ["Room A — Grotesk Archive", "Room B — Live Kerning", "Room C — Ink & Steel"] },
  { no: "11", tag: "[MANIFESTO]", lines: ["READ", "THE", "ROOM"], rooms: ["Room A — Wall Texts", "Room B — Reading Room", "Room C — Last Word"] },
];

export default function KineticType() {
  const [comp, setComp] = useState(0);
  const [focus, setFocus] = useState(1); // emphasised line
  const [stagger, setStagger] = useState(false);
  const [entered, setEntered] = useState(false);
  const c = COMPOSITIONS[comp];

  return (
    <div className={s.root}>
      <header className={s.top}>
        <span className={s.brand}>ARCHIVE // STUDIO</span>
        <div className={s.comps} role="radiogroup" aria-label="Headline composition" onKeyDown={onRadioGroupKeyDown}>
          {COMPOSITIONS.map((x, i) => (
            <button
              key={x.no}
              type="button"
              role="radio"
              aria-checked={comp === i}
              tabIndex={comp === i ? 0 : -1}
              aria-label={`Composition ${x.no}: ${x.lines.join(" ")}`}
              className={s.comp}
              onClick={() => {
                setComp(i);
                setEntered(false);
              }}
            >
              {x.no}
            </button>
          ))}
        </div>
      </header>

      <div className={s.stage}>
        {entered ? (
          <section className={s.show} aria-label={`Exhibition ${c.no}`}>
            <p className={s.small}>EXHIBITION {c.no} — NOW SHOWING</p>
            <p className={s.open}>
              NOW
              <br />
              OPEN
            </p>
            <ul className={s.rooms}>
              {c.rooms.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>
        ) : (
          <h3 className={`${s.headline} ${stagger ? s.stagger : ""}`} aria-label={c.lines.join(" ")}>
            {c.lines.map((w, i) => (
              <button
                key={`${comp}-${w}`}
                type="button"
                className={`${s.line} ${focus === i ? s.hot : ""}`}
                aria-pressed={focus === i}
                aria-label={`Emphasize ${w}`}
                onClick={() => setFocus(i)}
              >
                {w}
              </button>
            ))}
          </h3>
        )}

        <aside className={s.side}>
          <p className={s.pillRow}>
            <span className={s.pill}>{c.no}</span>
            <span className={s.tag}>• {c.tag}</span>
          </p>
          <div className={s.arrange} role="radiogroup" aria-label="Arrangement" onKeyDown={onRadioGroupKeyDown}>
            {(["Stack", "Stagger"] as const).map((a) => (
              <button key={a} type="button" role="radio" aria-checked={stagger === (a === "Stagger")} tabIndex={stagger === (a === "Stagger") ? 0 : -1} className={s.arr} onClick={() => setStagger(a === "Stagger")}>
                {a}
              </button>
            ))}
          </div>
          <button type="button" className={s.enter} onClick={() => setEntered(!entered)}>
            <span className={s.small}>INTERACTIVE ACTION</span>
            <span className={s.enterText}>{entered ? "← BACK TO COVER" : "ENTER EXHIBITION →"}</span>
          </button>
        </aside>
      </div>

      <footer className={s.foot}>
        <span>{entered ? `${c.rooms.length} ROOMS // OPEN DAILY` : `EMPHASIS // ${c.lines[focus]}`}</span>
        <span>PURE KINETIC TYPE ARCHITECTURE</span>
      </footer>
    </div>
  );
}
