import { useState } from "react";
import { onRadioGroupKeyDown } from "../shared/radioGroup";
import s from "./42-pop-art.module.css";

const SFX = ["BOOM!", "POW!", "ZAP!", "WHAM!"];
const EDITIONS = [
  { key: "std", label: "Standard", price: 19 },
  { key: "holo", label: "Holo", price: 29 },
  { key: "collector", label: "Collector", price: 49 },
];

export default function PopArt() {
  const [sfx, setSfx] = useState(0);
  const [ed, setEd] = useState(1);
  const [cart, setCart] = useState(0);
  const e = EDITIONS[ed];

  return (
    <div className={s.root}>
      <section className={s.panel} aria-label="Comic drop">
        <span className={s.bar} aria-hidden />
        <p className={s.bubble} aria-live="polite">
          {cart ? `★ ${cart} × ${e.label.toUpperCase()} IN CART ★` : "★ SPECIAL COMIC DROP ★"}
        </p>

        <h3 className={s.headline}>
          <span className={s.super}>SUPER</span>
          <span className={s.edition}>EDITION!</span>
        </h3>

        <button type="button" className={s.burst} onClick={() => setSfx((i) => (i + 1) % SFX.length)}>
          <span className={s.shape} aria-hidden />
          <span className={s.burstText}>{SFX[sfx]}</span>
        </button>

        <div className={s.editions} role="radiogroup" aria-label="Edition" onKeyDown={onRadioGroupKeyDown}>
          {EDITIONS.map((x, i) => (
            <button key={x.key} type="button" role="radio" aria-checked={i === ed} tabIndex={i === ed ? 0 : -1} className={s.edBtn} onClick={() => setEd(i)}>
              {x.label} ${x.price}
            </button>
          ))}
        </div>

        <div className={s.row}>
          <p className={s.copy}>Includes 48-page Ben-Day print catalog &amp; holographic badges.</p>
          <button type="button" className={s.buy} onClick={() => setCart((c) => c + 1)}>
            BUY NOW ⚡
          </button>
        </div>

        <p className={s.spec}>INK SPEC: 4PX OUTLINES // BEN-DAY HALFTONE // RETRO CMYK</p>
      </section>
    </div>
  );
}
