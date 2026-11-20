import { useState, type CSSProperties } from "react";
import s from "./23-editorial.module.css";

const ARTICLES = [
  {
    kicker: "ESSAY // SPOTLIGHT",
    title: "The Design Issue",
    deck: "The quiet authority of high-contrast serif typography and deliberate white space.",
    by: "ELENA V. CHEN",
    mins: 8,
    body: [
      "In an age of interchangeable rounded cards and generic canvases, editorial design returns with unmistakable gravitas.",
      "By treating the browser as a printed page, content regains architectural permanence.",
    ],
    quote: "Serif type restores editorial rhythm and thoughtful cadence.",
    fig: "Form & Fidelity",
    figSub: "Anatomy of asymmetric print grids",
  },
  {
    kicker: "CRITIQUE // TYPE",
    title: "Ink Over Pixels",
    deck: "Why the best screens still borrow their manners from paper.",
    by: "MARCUS OYELARAN",
    mins: 6,
    body: [
      "Readers trust a page that holds still: generous margins, a steady measure and a single column of thought.",
      "Animation can follow the text, but it should never interrupt it.",
    ],
    quote: "A margin is a promise that nothing will shout.",
    fig: "Measure & Margin",
    figSub: "Sixty-five characters, give or take",
  },
  {
    kicker: "INTERVIEW // STUDIO",
    title: "Rules of the Grid",
    deck: "A conversation on hairlines, columns and the courage to leave space empty.",
    by: "SOFIA LINDQVIST",
    mins: 11,
    body: [
      "Every hairline is a decision: it separates, it connects, and it tells the eye where to rest.",
      "We start each issue with the grid and let the stories argue with it.",
    ],
    quote: "Empty space is the loudest thing on the page.",
    fig: "Column & Gutter",
    figSub: "A 60:40 split, held for forty pages",
  },
];
const SIZES = [9, 10, 11];

export default function Editorial() {
  const [cur, setCur] = useState(0);
  const [size, setSize] = useState(1);
  const [focus, setFocus] = useState(false);
  const [saved, setSaved] = useState<number[]>([]);
  const a = ARTICLES[cur];
  const isSaved = saved.includes(cur);

  return (
    <div className={s.root} style={{ "--body": `${SIZES[size]}px` } as CSSProperties}>
      <header className={s.mast}>
        <span>VOL. 24 — ISSUE 08 • ESSAYS &amp; CRITIQUE</span>
        <span className={s.red}>SEPTEMBER 2025</span>
      </header>

      <div className={s.tools}>
        <span className={s.kicker}>{a.kicker}</span>
        <div className={s.group} role="group" aria-label="Text size">
          <button type="button" className={s.tool} aria-label="A− smaller text" onClick={() => setSize(Math.max(0, size - 1))}>
            A−
          </button>
          <button type="button" className={s.tool} aria-label="A+ larger text" onClick={() => setSize(Math.min(SIZES.length - 1, size + 1))}>
            A+
          </button>
        </div>
        <div className={s.group} role="radiogroup" aria-label="Reading mode">
          {(["Columns", "Focus"] as const).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={focus === (m === "Focus")} className={s.tool} onClick={() => setFocus(m === "Focus")}>
              {m}
            </button>
          ))}
        </div>
        <button type="button" className={`${s.tool} ${s.save}`} aria-pressed={isSaved} onClick={() => setSaved(isSaved ? saved.filter((x) => x !== cur) : [...saved, cur])}>
          {isSaved ? "Saved ✓" : "Save"}
        </button>
      </div>

      <h3 className={s.title}>{a.title}</h3>
      <p className={s.deck}>{a.deck}</p>

      <div className={`${s.body} ${focus ? s.focus : ""}`}>
        <div className={s.colA}>
          <p className={s.byline}>
            WORDS: {a.by}
            <br />
            READ TIME: {a.mins} MIN · {SIZES[size]}PX
          </p>
          <p className={`${s.text} ${s.lead}`}>{a.body[0]}</p>
          <p className={s.text}>{a.body[1]}</p>
          {!focus && <blockquote className={s.quote}>“{a.quote}”</blockquote>}
        </div>
        {!focus && (
          <figure className={s.colB}>
            <div className={s.fig} role="img" aria-label={`Illustration: ${a.fig}`}>
              <span className={s.square} aria-hidden />
              <span className={s.figTitle}>{a.fig}</span>
              <span className={s.figSub}>{a.figSub}</span>
            </div>
            <figcaption className={s.caption}>FIG. 0{cur + 1} — COLUMN RATIO 60:40</figcaption>
            <p className={s.text}>Dynamic pacing relies on varied column spans and asymmetric gutters, establishing intentional hierarchical contrast.</p>
          </figure>
        )}
      </div>

      <footer className={s.foot}>
        <div className={s.issues} role="radiogroup" aria-label="Article">
          {ARTICLES.map((x, i) => (
            <button key={x.title} type="button" role="radio" aria-checked={cur === i} aria-label={`${String(i + 1).padStart(2, "0")} ${x.title}`} className={s.issue} onClick={() => setCur(i)}>
              {String(i + 1).padStart(2, "0")}
            </button>
          ))}
        </div>
        <span className={s.count}>{saved.length} SAVED</span>
        <button type="button" className={s.next} onClick={() => setCur((cur + 1) % ARTICLES.length)}>
          NEXT: {ARTICLES[(cur + 1) % ARTICLES.length].title.toUpperCase()} →
        </button>
      </footer>
    </div>
  );
}
