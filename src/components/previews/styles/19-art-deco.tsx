import { useState } from "react";
import s from "./19-art-deco.module.css";

const SUITES = [
  { name: "Suite Belle Époque", detail: "PRIVATE LOGGIA // 95M²", rate: "₣ 1,250" },
  { name: "Salon Noir & Gold", detail: "VIP CONCIERGE ACCESS", rate: "₣ 1,900" },
];
const FINISHES = ["Emerald", "Obsidian"];

export default function ArtDeco() {
  const [suite, setSuite] = useState(0);
  const [finish, setFinish] = useState(0);
  const [nights, setNights] = useState(2);
  const [reserved, setReserved] = useState(false);
  const x = SUITES[suite];
  // Changing the booking clears a confirmation, so the confirmation always matches what is shown.
  const change = (fn: () => void) => () => {
    fn();
    setReserved(false);
  };

  return (
    <div className={`${s.root} ${finish ? s.obsidian : ""}`}>
      <div className={s.frame}>
        <span className={`${s.corner} ${s.tl}`} aria-hidden />
        <span className={`${s.corner} ${s.tr}`} aria-hidden />
        <span className={`${s.corner} ${s.bl}`} aria-hidden />
        <span className={`${s.corner} ${s.br}`} aria-hidden />
        <span className={s.fan} aria-hidden />
        <span className={s.small}>PARIS // ÉTABLI 1925</span>
        <h3 className={s.title}>GRAND PALAIS</h3>
        <span className={s.sub}>HÔTEL &amp; SUITES PRÉCIEUSES</span>
        <span className={s.rule} aria-hidden>
          <i />
        </span>
        <div className={s.suites} role="radiogroup" aria-label="Suite">
          {SUITES.map((y, i) => (
            <button key={y.name} type="button" role="radio" aria-checked={suite === i} className={s.suite} onClick={change(() => setSuite(i))}>
              <span className={s.gem} aria-hidden />
              <span className={s.suiteName}>{y.name}</span>
              <span className={s.detail}>{y.detail}</span>
            </button>
          ))}
        </div>
        <div className={s.row}>
          <div className={s.nights} role="group" aria-label="Nights">
            <button type="button" className={s.step} aria-label="Fewer nights" onClick={change(() => setNights(Math.max(1, nights - 1)))}>
              −
            </button>
            <span className={s.count}>
              {nights} NIGHT{nights > 1 ? "S" : ""}
            </span>
            <button type="button" className={s.step} aria-label="More nights" onClick={change(() => setNights(Math.min(7, nights + 1)))}>
              +
            </button>
          </div>
          <button type="button" aria-pressed={reserved} className={s.reserve} onClick={() => setReserved(!reserved)}>
            {reserved ? "RESERVED ✓" : "RESERVE SUITE"}
          </button>
          <div className={s.finishes} role="radiogroup" aria-label="Finish">
            {FINISHES.map((f, i) => (
              <button key={f} type="button" role="radio" aria-checked={finish === i} className={s.finish} onClick={() => setFinish(i)}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <span className={s.status} role="status">
          {reserved
            ? `CONFIRMED · ${x.name.toUpperCase()} · ${nights} × ${x.rate}`
            : `${x.name.toUpperCase()} · ${x.rate} PER NIGHT`}
        </span>
      </div>
    </div>
  );
}
