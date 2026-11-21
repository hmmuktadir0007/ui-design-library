import { useState } from "react";
import { onRadioGroupKeyDown } from "../shared/radioGroup";
import s from "./20-memphis.module.css";

const HEADLINES = [
  ["PLAYFUL SHAPES", "& CONFETTI GRID"],
  ["ZIG-ZAG LAYOUTS", "& BOLD OUTLINES"],
  ["CLASHING COLOUR", "& HARD SHADOWS"],
];
const ACCENTS = ["Banana", "Coral", "Sky", "Lilac"];
// Three fixed confetti layouts: [x%, y%, kind, colour index]
const CONFETTI: [number, number, string, number][][] = [
  [[6, 10, "dot", 1], [4, 30, "zig", 0], [8, 52, "chev", 3], [5, 72, "zig", 2], [90, 12, "dot", 0], [92, 40, "bar", 1], [93, 62, "dot", 3], [86, 88, "dot", 2], [12, 90, "dot", 1]],
  [[10, 8, "zig", 2], [3, 40, "dot", 0], [7, 80, "bar", 3], [88, 8, "chev", 1], [94, 30, "dot", 2], [90, 70, "zig", 0], [50, 94, "dot", 3], [30, 4, "dot", 1], [70, 95, "bar", 2]],
  [[4, 18, "bar", 0], [9, 64, "dot", 2], [3, 88, "chev", 1], [91, 20, "zig", 3], [86, 50, "dot", 1], [94, 84, "chev", 0], [60, 4, "dot", 2], [20, 95, "zig", 3], [40, 3, "dot", 0]],
];

export default function Memphis() {
  const [line, setLine] = useState(0);
  const [accent, setAccent] = useState(0);
  const [layout, setLayout] = useState(0);
  const [h1, h2] = HEADLINES[line];

  return (
    <div className={`${s.root} ${s[`a${accent}`]}`}>
      <div className={s.confetti} aria-hidden>
        {CONFETTI[layout].map(([x, y, kind, c], i) => (
          <span key={i} className={`${s[kind]} ${s[`c${c}`]}`} style={{ left: `${x}%`, top: `${y}%` }} />
        ))}
      </div>
      <div className={s.card}>
        <header className={s.top}>
          <span className={s.era}>'80s</span>
          <span className={s.lab}>MEMPHIS_LABS // v2.0</span>
          <span className={s.tag}>#RADICAL</span>
        </header>
        <div className={s.body}>
          <div className={s.copy}>
            <span className={s.studio}>POP STUDIO</span>
            <h3 className={s.h}>{h1}</h3>
            <p className={s.h2}>{h2}</p>
            <div className={s.ctas}>
              <button type="button" className={s.explore} onClick={() => setLine((line + 1) % HEADLINES.length)}>
                EXPLORE UI →
              </button>
              <button type="button" className={s.shuffle} onClick={() => setLayout((layout + 1) % CONFETTI.length)}>
                SHUFFLE
              </button>
            </div>
          </div>
          <div className={s.shapes} aria-hidden>
            <span className={s.disc}>
              <span className={s.discTri} />
            </span>
            <span className={s.bigTri} />
            <span className={s.ball} />
          </div>
        </div>
        <footer className={s.foot}>
          <div className={s.accents} role="radiogroup" aria-label="Accent" onKeyDown={onRadioGroupKeyDown}>
            {ACCENTS.map((a, i) => (
              <button key={a} type="button" role="radio" aria-checked={accent === i} tabIndex={accent === i ? 0 : -1} className={`${s.swatch} ${s[`c${i}`]}`} onClick={() => setAccent(i)}>
                {a}
              </button>
            ))}
          </div>
          <span className={s.meta} role="status">
            IDEA {line + 1}/3 · CONFETTI {String.fromCharCode(65 + layout)}
          </span>
        </footer>
      </div>
    </div>
  );
}
