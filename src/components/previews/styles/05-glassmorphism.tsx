import { useState } from "react";
import s from "./05-glassmorphism.module.css";

const DAYS = [
  { d: "Mon", t: 74, icon: "☀", sky: "Sunny" },
  { d: "Tue", t: 68, icon: "☂", sky: "Showers" },
  { d: "Wed", t: 68, icon: "⛅", sky: "Partly cloudy" },
  { d: "Fri", t: 68, icon: "☁", sky: "Overcast" },
  { d: "Sun", t: 74, icon: "☀", sky: "Clear" },
];

export default function Glassmorphism() {
  const [day, setDay] = useState(0);
  const [alerts, setAlerts] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const cur = DAYS[day];

  return (
    <div className={s.root}>
      <span className={`${s.blob} ${s.violet}`} aria-hidden />
      <span className={`${s.blob} ${s.cyan}`} aria-hidden />
      <span className={`${s.blob} ${s.violetLow}`} aria-hidden />

      <button
        type="button"
        className={`${s.cardScene} ${flipped ? s.isFlipped : ""}`}
        aria-pressed={flipped}
        aria-label={flipped ? "Show card front" : "Flip card to show back"}
        onClick={() => setFlipped((f) => !f)}
      >
        <span className={s.cardInner}>
          <span className={`${s.glass} ${s.face}`}>
            <span className={s.chip} aria-hidden />
            <span className={s.number}>•••• •••• •••• 4892</span>
            <span className={s.cardMeta}>
              <span>ALEX JOHNSON</span>
              <span>09/31</span>
            </span>
          </span>
          <span className={`${s.glass} ${s.face} ${s.back}`}>
            <span className={s.stripe} aria-hidden />
            <span className={s.cardMeta}>
              <span>CVV •••</span>
              <span>Tap to flip</span>
            </span>
          </span>
        </span>
      </button>

      <section className={`${s.glass} ${s.weather}`} aria-label="Weather">
        <header className={s.wHead}>
          <span>⌖ San Francisco</span>
          <button type="button" role="switch" aria-checked={alerts} aria-label="Weather alerts" className={s.switch} onClick={() => setAlerts((a) => !a)}>
            <span />
          </button>
        </header>
        <p className={s.big} aria-live="polite">
          {cur.t}°<span className={s.sun}>{cur.icon}</span>
        </p>
        <p className={s.sky}>
          {cur.d} · {cur.sky}
          {alerts ? " · Alerts on" : ""}
        </p>
        <div className={s.days} role="radiogroup" aria-label="Forecast day">
          {DAYS.map((x, i) => (
            <button key={x.d} type="button" role="radio" aria-checked={i === day} className={s.day} onClick={() => setDay(i)}>
              <span>{x.d}</span>
              <span aria-hidden>{x.icon}</span>
              <span>{x.t}°</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
