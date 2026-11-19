import { useEffect, useState } from "react";
import { Knob } from "../shared/Knob";
import s from "./46-tactile-hardware.module.css";

const WAVES = ["SAW", "SINE", "SQR"] as const;
type Wave = (typeof WAVES)[number];

function wavePath(wave: Wave, cycles: number) {
  const pts: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const x = i / 120;
    const ph = (x * cycles) % 1;
    const y = wave === "SINE" ? Math.sin(ph * 2 * Math.PI) : wave === "SQR" ? (ph < 0.5 ? 1 : -1) : 1 - 2 * ph;
    pts.push(`${(x * 200).toFixed(1)},${(22 - y * 16).toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
}

export default function TactileHardware() {
  const [power, setPower] = useState(true);
  const [wave, setWave] = useState<Wave>("SAW");
  const [freq, setFreq] = useState(44);
  const [res, setRes] = useState(82);
  const [mod, setMod] = useState(48);
  const [hold, setHold] = useState(false);
  const [trig, setTrig] = useState(false);
  const [out, setOut] = useState(-6);

  // momentary TRIG flash; cleared on unmount
  useEffect(() => {
    if (!trig) return;
    const id = window.setTimeout(() => setTrig(false), 220);
    return () => window.clearTimeout(id);
  }, [trig]);

  const hz = (110 + freq * 7.5).toFixed(2);

  return (
    <div className={s.root}>
      <section className={`${s.chassis} ${power ? "" : s.off}`} aria-label="Synthesizer TE-01">
        <header className={s.head}>
          <span>OP-FIELD // SYNTHESIZER TE-01</span>
          <button type="button" role="switch" aria-checked={power} aria-label="Power" className={s.pwr} onClick={() => setPower((p) => !p)}>
            <span className={s.led} /> PWR // {power ? "ON" : "OFF"}
          </button>
        </header>

        <div className={s.top}>
          <div className={s.screen}>
            <div className={s.screenRow}>
              <button type="button" className={s.waveBtn} onClick={() => setWave((w) => WAVES[(WAVES.indexOf(w) + 1) % WAVES.length])} aria-label={`WAVE: ${wave}, next waveform`}>
                WAVE: {wave}
              </button>
              <span className={s.hz} aria-live="polite">
                {hz} Hz
              </span>
            </div>
            <svg viewBox="0 0 200 44" className={s.wave} aria-hidden>
              <path d={wavePath(wave, 1 + freq / 25)} style={{ strokeWidth: 1 + res / 60 }} />
            </svg>
            <div className={s.screenRow}>
              <span>MOD: {(mod / 10).toFixed(1)} Hz</span>
              <span className={s.res}>RES: {res}%</span>
            </div>
          </div>

          <div className={s.side}>
            <div className={s.pads}>
              <button type="button" className={`${s.pad} ${s.trig} ${trig ? s.flash : ""}`} onClick={() => setTrig(true)} disabled={!power}>
                ● TRIG
              </button>
              <button type="button" className={`${s.pad} ${s.hold}`} aria-pressed={hold} onClick={() => setHold((h) => !h)} disabled={!power}>
                HOLD
              </button>
            </div>
            <input type="range" min={-24} max={0} value={out} onChange={(e) => setOut(+e.target.value)} aria-label="Output attenuation" aria-valuetext={`${out} decibels`} className={s.fader} />
            <span className={s.small}>OUTPUT ATTENUATION: {out} dB</span>
          </div>
        </div>

        <div className={s.knobs}>
          {[
            { label: "Frequency", v: freq, set: setFreq, sub: `${(freq / 4 + 1).toFixed(1)} kHz`, orange: true },
            { label: "Resonance", v: res, set: setRes, sub: `Q: ${(res / 58).toFixed(2)}` },
            { label: "Modulation", v: mod, set: setMod, sub: `LFO: ${(mod / 10).toFixed(1)} Hz` },
          ].map((k) => (
            <div key={k.label} className={s.knobCell}>
              <Knob label={k.label} value={k.v} min={0} max={100} onChange={k.set} valueText={k.sub} className={`${s.knob} ${k.orange ? s.orange : ""}`}>
                <span className={s.pointer} />
              </Knob>
              <span className={s.knobLabel}>{k.label.toUpperCase()}</span>
              <span className={s.small}>{k.sub}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
