import { useEffect, useState } from "react";
import { Knob } from "../shared/Knob";
import s from "./01-skeuomorphism.module.css";

const TRACKS = [
  { title: "The Retro Beat", length: 252 },
  { title: "Brass Horizon", length: 198 },
  { title: "Velvet Tape", length: 231 },
];
const fmt = (t: number) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;

export default function Skeuomorphism() {
  const [power, setPower] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [track, setTrack] = useState(0);
  const [time, setTime] = useState(165);
  const [vol, setVol] = useState(6);
  const [bass, setBass] = useState(4);
  const [tone, setTone] = useState(7);
  const t = TRACKS[track];

  useEffect(() => {
    if (!playing || !power) return;
    const id = window.setInterval(() => setTime((x) => (x + 1) % t.length), 1000);
    return () => window.clearInterval(id);
  }, [playing, power, t.length]);

  const skip = (d: number) => {
    setTrack((i) => (i + d + TRACKS.length) % TRACKS.length);
    setTime(0);
  };
  const level = power && playing ? vol / 10 : 0;

  return (
    <div className={s.root}>
      <div className={s.plate}>
        {[s.tl, s.tr, s.bl, s.br].map((c) => (
          <span key={c} className={`${s.screw} ${c}`} aria-hidden />
        ))}

        <div className={`${s.lcd} ${power ? "" : s.lcdOff}`} aria-live="polite">
          <span className={s.lcdLabel}>{playing ? "PLAYING" : "PAUSED"}: {t.title.toUpperCase()}</span>
          <span className={s.lcdTime}>
            {fmt(time)} / {fmt(t.length)}
          </span>
          <span className={s.lcdBar}>
            <span style={{ width: `${(time / t.length) * 100}%` }} />
          </span>
        </div>

        <div className={s.row}>
          {[
            { label: "Volume", short: "VOL", v: vol, set: setVol },
            { label: "Bass", short: "BASS", v: bass, set: setBass },
            { label: "Tone", short: "TONE", v: tone, set: setTone },
          ].map((k) => (
            <div key={k.short} className={s.knobWrap}>
              <Knob label={k.label} value={k.v} min={0} max={10} onChange={k.set} valueText={`${k.v} of 10`} className={s.knob}>
                <span className={s.knobCap} />
              </Knob>
              <span className={s.engrave}>
                {k.short} {k.v}
              </span>
            </div>
          ))}
          <button type="button" role="switch" aria-checked={power} aria-label="Power" onClick={() => setPower((p) => !p)} className={s.toggle}>
            <span className={s.toggleLever} />
            <span className={s.engrave}>{power ? "ON" : "OFF"}</span>
          </button>
        </div>

        <div className={s.row}>
          <div className={s.transport}>
            <button type="button" aria-label="Previous track" className={s.btn} onClick={() => skip(-1)}>
              ⏮
            </button>
            <button type="button" aria-label={playing ? "Pause" : "Play"} aria-pressed={playing} className={`${s.btn} ${s.btnMain}`} onClick={() => setPlaying((p) => !p)} disabled={!power}>
              {playing ? "❚❚" : "▶"}
            </button>
            <button type="button" aria-label="Next track" className={s.btn} onClick={() => skip(1)}>
              ⏭
            </button>
          </div>
          <div className={s.vu} role="meter" aria-label="VU level" aria-valuemin={0} aria-valuemax={1} aria-valuenow={level}>
            <span className={s.vuScale}>VU</span>
            <span className={s.needle} style={{ transform: `rotate(${-50 + level * 100}deg)` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
