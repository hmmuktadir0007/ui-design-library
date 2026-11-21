import { useState } from "react";
import { onRadioGroupKeyDown } from "../shared/radioGroup";
import s from "./27-paper-collage.module.css";

const CARDS = [
  { label: "The Paper Edition", kicker: "VOL. 04 • QUARTERLY CRAFT ZINE", head: "Tactile Micro-Publications", text: "Handcrafted typography meets physical textures, woodcut prints and warm archival card stocks.", price: "$12.00" },
  { label: "Coffee & Solitude", kicker: "EST. 1984 // KYOTO", head: "Ex Libris Curation", text: "A seasonal blend of washed heirloom beans and risograph essay collections.", price: "$24.00" },
];

export default function PaperCollage() {
  const [front, setFront] = useState(1);
  const [collected, setCollected] = useState<boolean[]>([false, false]);
  const [tidy, setTidy] = useState(false);
  const count = collected.filter(Boolean).length;
  const toggle = (i: number) => setCollected(collected.map((c, j) => (j === i ? !c : c)));

  return (
    <div className={`${s.root} ${tidy ? s.tidy : ""}`}>
      <header className={s.top}>
        <span className={s.brand}>ATELIER &amp; PRESS // FOLIO</span>
        <span className={s.dim}>CATALOG • {count} COLLECTED</span>
      </header>

      <div className={s.desk}>
        {CARDS.map((c, i) => (
          <section key={c.label} className={`${s.card} ${s[`c${i}`]} ${front === i ? s.front : ""}`} aria-label={c.label}>
            <span className={s.tape} aria-hidden />
            <div className={s.label}>
              <b className={i ? s.mono : s.serif}>{c.label}</b>
              <span className={s.kicker}>{c.kicker}</span>
            </div>
            <span className={s.head}>{c.head}</span>
            <p className={s.text}>{c.text}</p>
            <div className={s.row}>
              <span className={s.price}>{c.price}</span>
              <button type="button" aria-pressed={collected[i]} className={s.collect} onClick={() => toggle(i)}>
                {collected[i] ? "COLLECTED" : "COLLECT"}
              </button>
            </div>
            {collected[i] && (
              <span className={s.stamp} aria-hidden>
                AUTHENTIC
                <br />
                CRAFT ARCHIVE
                <br />★ 2025 ★
              </span>
            )}
          </section>
        ))}
      </div>

      <footer className={s.foot}>
        <div className={s.group} role="radiogroup" aria-label="Card on top" onKeyDown={onRadioGroupKeyDown}>
          {CARDS.map((c, i) => (
            <button key={c.label} type="button" role="radio" aria-checked={front === i} tabIndex={front === i ? 0 : -1} className={s.pick} onClick={() => setFront(i)}>
              {i ? "Coffee" : "Edition"} on top
            </button>
          ))}
        </div>
        <button type="button" role="switch" aria-checked={tidy} className={s.pick} onClick={() => setTidy(!tidy)}>
          Straighten
        </button>
      </footer>
    </div>
  );
}
