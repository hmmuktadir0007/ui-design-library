import { useState } from "react";
import s from "./12-maximalism.module.css";

const STAGES = [
  { name: "STAGE_A", bpm: 142 },
  { name: "STAGE_B", bpm: 128 },
  { name: "STAGE_C", bpm: 174 },
];
const PASSES = [
  { key: "day", label: "Day pass", price: 49, vibe: 72 },
  { key: "weekend", label: "Weekend", price: 119, vibe: 88 },
  { key: "vip", label: "VIP wristband", price: 249, vibe: 98 },
];

export default function Maximalism() {
  const [stage, setStage] = useState(0);
  const [pass, setPass] = useState(1);
  const [cart, setCart] = useState(0);
  const p = PASSES[pass];

  return (
    <div className={s.root}>
      <p className={s.ticker} aria-hidden>
        <span>★ HYPER-ENERGY SOUNDSYSTEM // EDITION 2026 // ON SALE NOW ★ HYPER-ENERGY SOUNDSYSTEM // EDITION 2026 //</span>
      </p>

      <section className={s.hero} aria-label="Sonic Revolt 26">
        <span className={`${s.sticker} ${s.live}`} aria-hidden>LIVE 26</span>
        <span className={`${s.sticker} ${s.raw}`} aria-hidden>RAW AUDIO</span>
        <span className={s.sun} aria-hidden />
        <h3 className={s.title}>SONIC REVOLT &rsquo;26</h3>
        <p className={s.copy}>Ultra-dense soundscape: modular synths, laser arrays &amp; digital art.</p>
        <div className={s.actions}>
          <button type="button" className={s.cta} onClick={() => setCart((c) => c + 1)}>
            Get passes →
          </button>
          <button type="button" className={s.stage} onClick={() => setStage((i) => (i + 1) % STAGES.length)}>
            {STAGES[stage].name} // {STAGES[stage].bpm} BPM
          </button>
        </div>
      </section>

      <section className={s.artists} aria-label="Featured artists">
        <span className={`${s.sticker} ${s.new}`} aria-hidden>★ NEW</span>
        <p className={s.kicker}>Featured artists</p>
        <p className={s.names}>KID ACID<br />DJ PROTOCOL<br />VAPORWAVE_99</p>
        <p className={s.kicker}>Spectrum density</p>
        <svg className={s.spectrum} viewBox="0 0 100 30" aria-hidden>
          <polyline points={[0, 22, 16, 8, 30, 20, 46, 6, 60, 18, 76, 4, 92, 16, 100, 10].map((v, i) => (i % 2 ? Math.min(28, v + stage * 3) : v)).join(" ")} />
        </svg>
      </section>

      <section className={s.collage} aria-label="Pass selection">
        <p className={s.collageTitle}>Collage zone</p>
        <div className={s.passes} role="radiogroup" aria-label="Pass type">
          {PASSES.map((x, i) => (
            <button key={x.key} type="button" role="radio" aria-checked={i === pass} className={s.pass} onClick={() => setPass(i)}>
              {x.label} · ${x.price}
            </button>
          ))}
        </div>
      </section>

      <section className={s.attrs} aria-label="System attributes">
        <p className={s.kicker}>System attributes</p>
        <span className={s.meterLabel}>VIBRANCY: {p.vibe}%</span>
        <span className={s.meter} aria-hidden>
          <span style={{ width: `${p.vibe}%` }} />
        </span>
        <span className={s.meterLabel}>LAYER DEPTH: {Math.round(STAGES[stage].bpm / 9)} TILES</span>
        <span className={`${s.meter} ${s.cyan}`} aria-hidden>
          <span style={{ width: `${STAGES[stage].bpm / 2}%` }} />
        </span>
        <p className={s.status} aria-live="polite">
          ⚡ {cart ? `${cart} × ${p.label.toUpperCase()} IN CART` : "STATUS: HIGH OVERLOAD"}
        </p>
      </section>
    </div>
  );
}
