import { useState } from "react";
import { onRadioGroupKeyDown } from "../shared/radioGroup";
import s from "./21-pixel-art.module.css";

const ITEMS = [
  { key: "atk", icon: "⚔", label: "ATK+8", name: "Iron sword", tone: s.orange },
  { key: "def", icon: "⛨", label: "DEF+12", name: "Kite shield", tone: s.green },
  { key: "mana", icon: "◆", label: "MANA", name: "Mana gem", tone: s.blue },
];
const SEG = 11;

export default function PixelArt() {
  const [item, setItem] = useState(0);
  const [mp, setMp] = useState(480);
  const [crt, setCrt] = useState(true);
  const [runs, setRuns] = useState(0);
  const atk = 42 + (item === 0 ? 8 : 0);
  const def = 30 + (item === 1 ? 12 : 0);

  const start = () => {
    setRuns((r) => r + 1);
    // the mana gem refills MP, everything else spends it
    setMp((m) => (item === 2 ? Math.min(500, m + 60) : Math.max(0, m - 60)));
  };

  return (
    <div className={`${s.root} ${crt ? s.crt : ""}`}>
      <section className={s.panel} aria-label="Arcade inventory">
        <header className={s.bar}>
          <span>ARCADE_SYS // INVENTORY_v1.0</span>
          <button type="button" className={s.crtBtn} aria-pressed={crt} onClick={() => setCrt((c) => !c)}>
            [ CRT: {crt ? "ON" : "OFF"} ]
          </button>
        </header>

        <div className={s.hero}>
          <span className={s.avatar} aria-hidden>
            <span className={s.sprite} />
          </span>
          <div>
            <p className={s.name}>HERO_UNIT // KNIGHT</p>
            <p className={s.cls}>
              ATK {atk} • DEF {def} • {ITEMS[item].name.toUpperCase()}
            </p>
          </div>
          <span className={s.lvl}>LVL 99</span>
        </div>

        <p className={s.statLabel}>HP [999/999]</p>
        <span className={`${s.meter} ${s.hp}`} aria-hidden>
          {Array.from({ length: SEG }, (_, i) => <span key={i} className={s.on} />)}
        </span>
        <p className={`${s.statLabel} ${s.mpLabel}`} aria-live="polite">MP [{mp}/500]</p>
        <span className={`${s.meter} ${s.mp}`} role="meter" aria-label="Mana" aria-valuemin={0} aria-valuemax={500} aria-valuenow={mp}>
          {Array.from({ length: SEG }, (_, i) => <span key={i} className={i < Math.round((mp / 500) * SEG) ? s.on : ""} />)}
        </span>

        <div className={s.row}>
          <div className={s.items} role="radiogroup" aria-label="Equipped item" onKeyDown={onRadioGroupKeyDown}>
            {ITEMS.map((x, i) => (
              <button
                key={x.key}
                type="button"
                role="radio"
                aria-checked={i === item}
                tabIndex={i === item ? 0 : -1}
                aria-label={`${x.label} ${x.name}`}
                className={`${s.slot} ${x.tone}`}
                onClick={() => setItem(i)}
              >
                <span aria-hidden>{x.icon}</span>
                {x.label}
              </button>
            ))}
          </div>
          <button type="button" className={s.start} onClick={start}>
            LVL 99 // START ▶
          </button>
        </div>

        <footer className={s.foot}>
          <span>GRID: 8x8 PIXEL // STEPPED AFFORDANCE</span>
          <span aria-live="polite">{runs ? `RUN ${runs} COMPLETE` : "PRESS [START] TO RUN"}</span>
        </footer>
      </section>
    </div>
  );
}
