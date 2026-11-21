import { useState } from "react";
import { onRadioGroupKeyDown } from "../shared/radioGroup";
import s from "./02-flat.module.css";

type Section = "Activity" | "Tasks" | "Inbox";
type Filter = "All" | "Open" | "Done";
interface Task {
  title: string;
  done: boolean;
}
const SAMPLES = ["Send weekly report", "Book design review", "Update roadmap"];
const BARS = { Week: [40, 65, 50, 80, 55, 90, 70], Month: [55, 70, 60, 85, 75, 95] };

export default function Flat() {
  const [section, setSection] = useState<Section>("Activity");
  const [range, setRange] = useState<keyof typeof BARS>("Week");
  const [filter, setFilter] = useState<Filter>("All");
  const [tasks, setTasks] = useState<Task[]>([
    { title: "Review wireframes", done: true },
    { title: "Plan sprint goals", done: true },
    { title: "Call the client", done: false },
  ]);
  const [added, setAdded] = useState(0);
  const [note, setNote] = useState("");
  const [unread, setUnread] = useState(2);

  const done = tasks.filter((t) => t.done).length;
  const pct = Math.round((done / tasks.length) * 100);
  const shown = tasks.filter((t) => filter === "All" || t.done === (filter === "Done"));
  const add = () => {
    if (tasks.length >= 4) return setNote("List full: complete a task first");
    setTasks([...tasks, { title: SAMPLES[added % SAMPLES.length], done: false }]);
    setAdded(added + 1);
    setNote(`Added “${SAMPLES[added % SAMPLES.length]}”`);
  };
  const toggle = (t: Task) => setTasks(tasks.map((x) => (x === t ? { ...x, done: !x.done } : x)));

  return (
    <div className={s.root}>
      <span className={`${s.shape} ${s.c1}`} aria-hidden />
      <span className={`${s.shape} ${s.c2}`} aria-hidden />
      <span className={`${s.shape} ${s.c3}`} aria-hidden />
      <span className={`${s.shape} ${s.t1}`} aria-hidden />
      <span className={`${s.shape} ${s.t2}`} aria-hidden />
      <span className={`${s.shape} ${s.t3}`} aria-hidden />

      <div className={s.phone}>
        <header className={s.top}>
          <span className={s.burger} aria-hidden />
          <span className={s.app}>App name</span>
          <span className={s.bell} aria-hidden />
        </header>
        <p className={s.hello}>
          Hello, Alex <span className={s.flag} aria-hidden />
        </p>

        <div className={s.content}>
          {section === "Activity" && (
            <>
              <section className={s.activity} aria-label="Daily activity">
                <div className={s.row}>
                  <h3 className={s.h}>Daily Activity</h3>
                  <div className={s.seg} role="radiogroup" aria-label="Activity range" onKeyDown={onRadioGroupKeyDown}>
                    {(Object.keys(BARS) as (keyof typeof BARS)[]).map((r) => (
                      <button key={r} type="button" role="radio" aria-checked={range === r} tabIndex={range === r ? 0 : -1} className={s.segBtn} onClick={() => setRange(r)}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={s.bars} role="img" aria-label={`${range} activity, peak ${Math.max(...BARS[range])} minutes`}>
                  {BARS[range].map((v, i) => (
                    <span key={`${range}${i}`} style={{ height: `${v}%` }} />
                  ))}
                </div>
              </section>
              <div className={s.tiles}>
                <div className={`${s.tile} ${s.teal}`}>
                  <span className={s.tileLabel}>Tasks</span>
                  <span className={s.tick} aria-hidden>
                    ✓
                  </span>
                  <span className={s.tileValue}>
                    {done}/{tasks.length} done
                  </span>
                </div>
                <div className={`${s.tile} ${s.blue}`}>
                  <span className={s.tileLabel}>Progress:</span>
                  <span className={s.tileBig}>{pct}%</span>
                  <span className={s.meter} aria-hidden>
                    <span style={{ width: `${pct}%` }} />
                  </span>
                </div>
              </div>
            </>
          )}

          {section === "Tasks" && (
            <section aria-label="Tasks">
              <div className={s.progress} role="progressbar" aria-label="Tasks completed" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                <span style={{ width: `${pct}%` }} />
              </div>
              <div className={s.row}>
                <div className={s.filters} role="radiogroup" aria-label="Task filter" onKeyDown={onRadioGroupKeyDown}>
                  {(["All", "Open", "Done"] as Filter[]).map((f) => (
                    <button key={f} type="button" role="radio" aria-checked={filter === f} tabIndex={filter === f ? 0 : -1} className={s.chip} onClick={() => setFilter(f)}>
                      {f}
                    </button>
                  ))}
                </div>
                <button type="button" className={s.add} aria-label="Add task" onClick={add}>
                  +
                </button>
              </div>
              <ul className={s.list}>
                {shown.map((t) => (
                  <li key={t.title}>
                    <button type="button" role="checkbox" aria-checked={t.done} className={s.task} onClick={() => toggle(t)}>
                      <span className={s.box} aria-hidden>
                        {t.done ? "✓" : ""}
                      </span>
                      {t.title}
                    </button>
                  </li>
                ))}
                {shown.length === 0 && <li className={s.empty}>Nothing here yet.</li>}
              </ul>
              <p className={s.note} role="status">
                {note || `${pct}% complete`}
              </p>
            </section>
          )}

          {section === "Inbox" && (
            <section aria-label="Inbox">
              <ul className={s.msgs}>
                {["Maya: Wireframes approved", "Leo: Sprint starts Monday", "Ops: Invoice paid"].map((m, i) => (
                  <li key={m} className={s.msg}>
                    <span className={`${s.dot} ${i < unread ? s.unread : ""}`} aria-hidden />
                    {m}
                    {i < unread && <span className={s.srOnly}> (unread)</span>}
                  </li>
                ))}
              </ul>
              <button type="button" className={s.primary} onClick={() => setUnread(0)}>
                {unread ? `Mark ${unread} as read` : "All caught up"}
              </button>
            </section>
          )}
        </div>

        <nav className={s.nav} aria-label="Sections">
          {(["Activity", "Tasks", "Inbox"] as Section[]).map((x) => (
            <button key={x} type="button" className={s.navBtn} aria-current={section === x ? "page" : undefined} onClick={() => setSection(x)}>
              <span className={`${s.icon} ${s[`i${x}`] ?? ""}`} aria-hidden />
              {x}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
