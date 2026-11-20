import { useRef, useState } from "react";
import s from "./24-scrollytelling.module.css";
import { storyState } from "./24-story";

const CHAPTERS = [
  { kicker: "PAST", title: "The Origin Phase", text: "Initial telemetry baseline and the first early data points.", note: "BASELINE: 1.0× // STABLE", stat: "+38%", x: 40, y: 72 },
  { kicker: "TRIGGER", title: "Exponential Growth", text: "Adoption compounds: every new region feeds the next launch.", note: "DELTA: +284.6% ACCEL", stat: "+342%", x: 112, y: 46 },
  { kicker: "TARGET", title: "Global Scaling", text: "Autonomous reach across every market on the planet.", note: "FORECAST: 3 CONTINENTS", stat: "+910%", x: 184, y: 15 },
];
const nn = (i: number) => String(i + 1).padStart(2, "0");

export default function Scrollytelling() {
  const scroller = useRef<HTMLDivElement>(null);
  const [{ active, progress }, setStory] = useState({ active: 0, progress: 0 });
  const c = CHAPTERS[active];
  const onScroll = () => {
    const el = scroller.current!;
    setStory(storyState(el.scrollTop, el.scrollHeight, el.clientHeight, CHAPTERS.length));
  };
  // Scrolls the chapter column only (never the page); CSS scroll-behavior makes it smooth unless motion is reduced.
  const goTo = (i: number) => {
    const el = scroller.current!;
    el.scrollTo({ top: Math.max(0, Math.min(CHAPTERS.length - 1, i)) * el.clientHeight });
  };
  const scrubX = 10 + progress * 176;

  return (
    <div className={s.root}>
      <header className={s.top}>
        <span className={s.brand}>SCROLL // DISCOVERY TRACK</span>
        <span className={s.dim}>STAGE: STICKY VIEWPORT</span>
      </header>

      <div className={s.body}>
        <div className={s.story}>
          <div className={s.track}>
            <span className={s.rail} aria-hidden>
              <span className={s.railFill} style={{ height: `${progress * 100}%` }} />
            </span>
            <div ref={scroller} className={s.scroller} tabIndex={0} role="region" aria-label="Story chapters, scroll to advance" onScroll={onScroll}>
              {CHAPTERS.map((x, i) => (
                <div key={x.title} className={`${s.chapter} ${i === active ? s.on : ""}`} aria-current={i === active ? "step" : undefined}>
                  <span className={s.kicker}>
                    CHAPTER {nn(i)} // {x.kicker}
                  </span>
                  <h3 className={s.title}>{x.title}</h3>
                  <p className={s.text}>{x.text}</p>
                  <span className={s.note}>{x.note}</span>
                </div>
              ))}
            </div>
          </div>
          <nav className={s.nav} aria-label="Chapters">
            <button type="button" className={s.step} aria-label="Previous chapter" aria-disabled={active === 0} onClick={() => goTo(active - 1)}>
              ↑
            </button>
            {CHAPTERS.map((x, i) => (
              <button
                key={x.title}
                type="button"
                className={s.dot}
                aria-label={`Chapter ${nn(i)}: ${x.title}`}
                aria-current={i === active ? "step" : undefined}
                onClick={() => goTo(i)}
              >
                {nn(i)}
              </button>
            ))}
            <button type="button" className={s.step} aria-label="Next chapter" aria-disabled={active === CHAPTERS.length - 1} onClick={() => goTo(active + 1)}>
              ↓
            </button>
          </nav>
        </div>

        <section className={s.stage} aria-label="Pinned stage">
          <div className={s.stageHead}>
            <span className={s.pinned}>
              <span className={s.live} aria-hidden /> PINNED STAGE
            </span>
            <span className={s.dim} role="status">
              FRAME {nn(active)} / {nn(CHAPTERS.length - 1)}
            </span>
          </div>
          <div className={s.kpis}>
            <span className={s.kpi}>
              GROWTH VELOCITY<b className={s.big}>{c.stat}</b>
            </span>
            <span className={s.kpi}>
              SCROLL SYNC<b className={`${s.big} ${s.blue}`}>{progress.toFixed(2)} Y</b>
            </span>
          </div>
          <svg className={s.chart} viewBox="0 0 196 90" role="img" aria-label={`Growth chart, chapter ${nn(active)} highlighted at ${c.stat}`}>
            <path d="M0 30H196M0 55H196" className={s.gridline} />
            <path d="M10 80 C40 78 60 62 80 58 S120 48 140 34 S172 16 186 12 V86 H10Z" className={s.area} />
            <path
              d="M10 80 C40 78 60 62 80 58 S120 48 140 34 S172 16 186 12"
              pathLength={100}
              strokeDasharray={`${20 + progress * 80} 100`}
              className={s.line}
            />
            <path d={`M${scrubX} 4V86`} className={s.scrub} />
            {CHAPTERS.map((x, i) => (
              <circle key={x.title} cx={x.x} cy={x.y} r={i === active ? 4 : 2.5} className={i === active ? s.markOn : s.mark} />
            ))}
            <text x={Math.min(c.x, 160)} y={c.y > 30 ? c.y - 9 : c.y + 14} textAnchor="middle" className={s.callout}>
              CH.{nn(active)} SYNC
            </text>
          </svg>
          <p className={s.hint}>Scroll the chapters (wheel, touch, or arrow keys when focused) or use the chapter buttons.</p>
        </section>
      </div>
    </div>
  );
}
