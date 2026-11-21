import { useState } from "react";
import { onRadioGroupKeyDown } from "../shared/radioGroup";
import s from "./26-organic.module.css";

const SECTIONS = [
  { label: "Rituals", a: "Mindful", b: "Living", text: "Designing spaces and digital rituals in quiet rhythm with nature, grounded in tactile earth tones.", badge: "RAW 100%" },
  { label: "Nature", a: "Rooted", b: "Forms", text: "Moss, clay and river stone: every surface takes its curve from something that grew.", badge: "MOSS 72%" },
  { label: "Journal", a: "Slow", b: "Seasons", text: "Field notes on light, soil and patience, written one season at a time.", badge: "ISSUE 04" },
];
// Organic border-radius presets (the source's 8-value blob syntax).
const BLOBS = ["42% 58% 48% 52% / 46% 42% 58% 54%", "58% 42% 62% 38% / 40% 56% 44% 60%", "48% 52% 38% 62% / 58% 38% 62% 42%"];

export default function Organic() {
  const [section, setSection] = useState(0);
  const [blob, setBlob] = useState(0);
  const [leaves, setLeaves] = useState(true);
  const [clay, setClay] = useState(true);
  const x = SECTIONS[section];

  return (
    <div className={`${s.root} ${clay ? "" : s.noClay}`}>
      <header className={s.top}>
        <span className={s.brand}>
          <span className={s.logo} aria-hidden /> AURA // BOTANICS
        </span>
        <div className={s.nav} role="radiogroup" aria-label="Section" onKeyDown={onRadioGroupKeyDown}>
          {SECTIONS.map((y, i) => (
            <button key={y.label} type="button" role="radio" aria-checked={section === i} tabIndex={section === i ? 0 : -1} className={s.navBtn} onClick={() => setSection(i)}>
              {y.label}
            </button>
          ))}
        </div>
      </header>

      <div className={s.hero}>
        <div className={s.art} aria-hidden>
          <span className={s.blob} style={{ borderRadius: BLOBS[blob] }} />
          <span className={s.blob2} style={{ borderRadius: BLOBS[(blob + 1) % 3] }} />
          <span className={s.badge}>{x.badge}</span>
          {leaves && (
            <span className={s.plant}>
              <i />
              <i />
              <i />
            </span>
          )}
        </div>
        <span className={s.pill}>• BIOPHILIC LIVING</span>
        <h3 className={s.title}>
          {x.a} <em className={s.em}>{x.b}</em>
        </h3>
        <p className={s.text}>{x.text}</p>
        <div className={s.ctas}>
          <button type="button" className={s.primary} onClick={() => setBlob((blob + 1) % BLOBS.length)}>
            Reshape →
          </button>
          <button type="button" role="switch" aria-checked={leaves} className={s.ghost} onClick={() => setLeaves(!leaves)}>
            Our Flora
          </button>
          <button type="button" role="switch" aria-checked={clay} className={s.ghost} onClick={() => setClay(!clay)}>
            Clay accents
          </button>
        </div>
        <div className={s.features}>
          <span className={s.feature}>
            <i className={s.fDot} aria-hidden />
            <b>88% ORGANIC SHAPES</b>
            <small>Soft tactile contouring</small>
          </span>
          <span className={s.feature}>
            <i className={`${s.fDot} ${s.fClay}`} aria-hidden />
            <b>{clay ? "TERRACOTTA ACCENTS" : "MOSS ACCENTS"}</b>
            <small className={s.clayText}>Natural grounding focus</small>
          </span>
        </div>
      </div>

      <footer className={s.foot}>
        <span>EARTH PALETTE // SAGE • SAND • {clay ? "CLAY" : "MOSS"}</span>
        <span>CURVE PRESET {blob + 1}/3</span>
      </footer>
    </div>
  );
}
