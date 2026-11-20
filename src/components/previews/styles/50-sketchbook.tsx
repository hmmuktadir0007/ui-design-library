import { useState } from "react";
import s from "./50-sketchbook.module.css";

const STEPS = [
  { title: "1. Raw Ideation", note: "Spontaneous flow & loose strokes" },
  { title: "2. Wireframing", note: "Excalidraw rhythm" },
  { title: "Ship It!", note: "" },
];
const NOTES = ["Wobbly & organic borders feel human", "Invites early user collaboration", "Reduces fear of imperfect UX draft"];

export default function Sketchbook() {
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState([true, false, false]);
  const [marker, setMarker] = useState(true);
  const done = checked.filter(Boolean).length;
  const ready = done === NOTES.length;
  const [shipped, setShipped] = useState(false);

  return (
    <div className={`${s.root} ${marker ? s.marker : ""}`}>
      <div className={s.sheet}>
        <header className={s.top}>
          <span className={s.idea}>IDEA #50</span>
          <span className={s.hand}>Hand-Drawn Sketch Canvas ~</span>
        </header>

        <div className={s.flow} role="radiogroup" aria-label="Stage">
          {STEPS.map((x, i) => (
            <button key={x.title} type="button" role="radio" aria-checked={step === i} className={`${s.step} ${i === 2 ? s.ship : ""}`} onClick={() => setStep(i)}>
              <span className={s.stepTitle}>{x.title}</span>
              {x.note && <span className={s.stepNote}>{x.note}</span>}
            </button>
          ))}
        </div>

        <div className={s.lower}>
          <div className={s.sticky}>
            <span className={s.stickyHead}>Sticky Note: Rough Affordances</span>
            {NOTES.map((n, i) => (
              <button
                key={n}
                type="button"
                role="checkbox"
                aria-checked={checked[i]}
                className={s.item}
                onClick={() => {
                  setChecked(checked.map((c, j) => (j === i ? !c : c)));
                  setShipped(false);
                }}
              >
                <span className={s.box} aria-hidden>
                  {checked[i] ? "✓" : ""}
                </span>
                {n}
              </button>
            ))}
          </div>
          <div className={s.score}>
            <span className={`${s.ring} ${ready ? s.ringDone : ""}`} aria-hidden>
              {ready ? "✓" : `${done}/3`}
            </span>
            <button type="button" aria-disabled={!ready} className={s.shipBtn} onClick={() => ready && setShipped(true)}>
              {shipped ? "Shipped!" : "Ship draft"}
            </button>
            <span className={s.small} role="status">
              {shipped ? "Draft shipped for review" : ready ? "Ready to ship" : `${3 - done} note${3 - done === 1 ? "" : "s"} to tick`}
            </span>
          </div>
        </div>

        <footer className={s.foot}>
          <span className={s.code}>Stage: {STEPS[step].title.replace(/^\d\. /, "")}</span>
          <button type="button" role="switch" aria-checked={marker} className={s.markerBtn} onClick={() => setMarker(!marker)}>
            Highlighter
          </button>
        </footer>
      </div>
    </div>
  );
}
