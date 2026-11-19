import { useState } from "react";
import s from "./31-visionos.module.css";

const TABS = [
  { key: "cinema", label: "Spatial Cinema", glyph: "◉", title: "Aurora Expanse (8K XR)", meta: "Immersive Spatial Audio • Dolby Atmos" },
  { key: "library", label: "Library", glyph: "▢", title: "Glacier Drift", meta: "Volumetric capture • 42 min" },
  { key: "live", label: "Live", glyph: "▷", title: "Orbit Live Session", meta: "Shared space • 12 viewers" },
  { key: "env", label: "Environments", glyph: "○", title: "Night Lake", meta: "Passthrough blend • 75%" },
];

export default function VisionOS() {
  const [tab, setTab] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(62);
  const [expanded, setExpanded] = useState(false);
  const t = TABS[tab];

  return (
    <div className={s.root}>
      <nav className={`${s.glass} ${s.ornament}`} aria-label="Spaces">
        {TABS.map((x, i) => (
          <button key={x.key} type="button" aria-pressed={i === tab} aria-label={x.label} className={s.tabBtn} onClick={() => setTab(i)}>
            {x.glyph}
          </button>
        ))}
      </nav>

      <div className={s.column}>
        <section className={`${s.glass} ${s.window} ${expanded ? s.expanded : ""}`} aria-label={t.label}>
          <header className={s.winHead}>
            <span className={s.chip}>{t.label.toUpperCase()}</span>
            <span className={s.hint}>Passthrough Mode: 75%</span>
          </header>
          <div className={s.media}>
            <h3 className={s.mediaTitle}>{t.title}</h3>
            <p className={s.mediaMeta}>{t.meta}</p>
            <button type="button" className={s.bigPlay} aria-pressed={playing} aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying((p) => !p)}>
              {playing ? "❚❚" : "▶"}
            </button>
            <input type="range" min={0} max={100} value={progress} onChange={(e) => setProgress(+e.target.value)} aria-label="Scrub" className={s.scrub} />
          </div>
          <footer className={s.winFoot}>
            <span className={s.mono}>
              SPECULAR CORNER RADIUS: 28PX
              <br />
              INNER WHITE REFLECTION HIGHLIGHT
            </span>
            <button type="button" className={s.expand} aria-pressed={expanded} onClick={() => setExpanded((e) => !e)}>
              {expanded ? "Return to window ←" : "Expand to room →"}
            </button>
          </footer>
        </section>

        <div className={`${s.glass} ${s.pill}`} role="group" aria-label="Playback">
          <button type="button" aria-label="Back 10 seconds" onClick={() => setProgress((p) => Math.max(0, p - 10))}>
            ⏮
          </button>
          <button type="button" aria-label={playing ? "Pause" : "Play"} aria-pressed={playing} className={s.pillMain} onClick={() => setPlaying((p) => !p)}>
            {playing ? "❚❚" : "▶"}
          </button>
          <button type="button" aria-label="Forward 10 seconds" onClick={() => setProgress((p) => Math.min(100, p + 10))}>
            ⏭
          </button>
        </div>
        <span className={s.handle} aria-hidden />
      </div>
    </div>
  );
}
