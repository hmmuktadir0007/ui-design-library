import { useState } from "react";
import s from "./40-neoclassical.module.css";

const WINGS = [
  { title: "I. Heritage Archive", text: "Masterpieces preserved within marble vault sanctuaries under classical proportion." },
  { title: "II. Private Atelier", text: "Bespoke commissions and horological patrimony by confidential appointment." },
];
const PIECES = [
  { no: "I", name: "Régulateur Perpétuel", year: "MCMXXIV", note: "Perpetual calendar · enamel dial" },
  { no: "II", name: "Tourbillon Souverain", year: "MCMLVII", note: "Flying tourbillon · gold bridges" },
  { no: "III", name: "Lune d'Ivoire", year: "MMXII", note: "Moon phase · ivory guilloché" },
];

export default function Neoclassical() {
  const [wing, setWing] = useState(0);
  const [salon, setSalon] = useState(false);
  const [piece, setPiece] = useState(0);
  const p = PIECES[piece];

  return (
    <div className={s.root}>
      <div className={s.page}>
        <header className={s.top}>
          <span className={s.gold}>HAUTE HORLOGERIE</span>
          <span className={s.muted}>{salon ? `${wing ? "ATELIER" : "ARCHIVE"} • PIECE ${p.no}` : "SALON • ARCHIVE"}</span>
        </header>
        <span className={s.emblem} aria-hidden />
        <span className={s.est}>EST. MCMXXIV</span>
        <h3 className={s.title}>MAISON AURELIA</h3>
        <span className={s.tag}>PERPETUAL ELEGANCE &amp; SOVEREIGN CRAFT</span>
        <span className={s.rule} aria-hidden>
          <i />
        </span>

        {salon ? (
          <section className={s.salon} aria-label="Salon">
            <span className={s.numeral} aria-hidden>
              {p.no}
            </span>
            <span className={s.pieceName}>{p.name}</span>
            <span className={s.muted}>
              {p.year} · {p.note}
            </span>
            <div className={s.pieces} role="radiogroup" aria-label="Piece">
              {PIECES.map((x, i) => (
                <button key={x.no} type="button" role="radio" aria-checked={piece === i} aria-label={`${x.no}. ${x.name}`} className={s.num} onClick={() => setPiece(i)}>
                  {x.no}
                </button>
              ))}
            </div>
          </section>
        ) : (
          <div className={s.wings} role="radiogroup" aria-label="Wing">
            {WINGS.map((w, i) => (
              <button key={w.title} type="button" role="radio" aria-checked={wing === i} className={s.wing} onClick={() => setWing(i)}>
                <span className={s.wingTitle}>{w.title.toUpperCase()}</span>
                <span className={s.wingText}>{w.text}</span>
              </button>
            ))}
          </div>
        )}

        <button type="button" aria-expanded={salon} className={s.enter} onClick={() => setSalon(!salon)}>
          {salon ? "← RETURN TO HALL" : `ENTER ${wing ? "ATELIER" : "SALON"} →`}
        </button>
        <span className={s.cities}>GENÈVE • PLACE VENDÔME • MILANO</span>
      </div>
    </div>
  );
}
