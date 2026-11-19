import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import s from "./18-spatial-3d.module.css";

const PRESETS = [
  { y: 36, x: -14 },
  { y: -30, x: -22 },
  { y: 0, x: -6 },
];
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** CSS 3D transforms only (perspective + preserve-3d); not WebGL, no lighting model. */
export default function Spatial3D() {
  const [rotY, setRotY] = useState(36);
  const [tiltX, setTiltX] = useState(-14);
  const [preset, setPreset] = useState(0);
  const drag = useRef<{ x: number; y: number; ry: number; tx: number } | null>(null);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ry: rotY, tx: tiltX };
  };
  const onMove = (e: PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    setRotY(Math.round(clamp(d.ry + (e.clientX - d.x) * 0.5, -60, 60)));
    setTiltX(Math.round(clamp(d.tx - (e.clientY - d.y) * 0.3, -35, 5)));
  };
  const end = () => {
    drag.current = null;
  };
  const explore = () => {
    const next = (preset + 1) % PRESETS.length;
    setPreset(next);
    setRotY(PRESETS[next].y);
    setTiltX(PRESETS[next].x);
  };

  return (
    <div className={s.root}>
      <div
        className={s.stage}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={end}
        onPointerCancel={end}
        aria-hidden
      >
        <div className={s.scene} style={{ "--ry": `${rotY}deg`, "--rx": `${tiltX}deg` } as CSSProperties}>
          <div className={s.floor} />
          <div className={s.cube}>
            {["front", "back", "right", "left", "top", "bottom"].map((f) => (
              <span key={f} className={`${s.face} ${s[f]}`} />
            ))}
          </div>
          <span className={s.sphere} />
          <div className={`${s.card} ${s.cardA}`}>
            <span className={s.bar} />
            <svg viewBox="0 0 100 30" className={s.spark}>
              <polyline points="0,26 22,18 40,22 62,10 80,14 100,4" />
            </svg>
            <span className={s.mono}>DEPTH: Z -40PX</span>
          </div>
          <div className={`${s.card} ${s.cardB}`}>
            <span className={s.dot} />
            <span className={s.bar} />
            <span className={s.mono}>ROTATION: {rotY}° Y</span>
          </div>
        </div>
      </div>

      <div className={s.controls}>
        <label className={s.slider}>
          <span>Rotate Y</span>
          <input type="range" min={-60} max={60} value={rotY} onChange={(e) => setRotY(+e.target.value)} style={{ "--fill": `${((rotY + 60) / 120) * 100}%` } as CSSProperties} aria-valuetext={`${rotY} degrees`} />
        </label>
        <button type="button" className={s.explore} onClick={explore}>
          ▶ Explore 3D
        </button>
        <label className={s.slider}>
          <span>Tilt X</span>
          <input type="range" min={-35} max={5} value={tiltX} onChange={(e) => setTiltX(+e.target.value)} style={{ "--fill": `${((tiltX + 35) / 40) * 100}%` } as CSSProperties} aria-valuetext={`${tiltX} degrees`} />
        </label>
      </div>
    </div>
  );
}
