import { useState } from "react";
import s from "./03-material.module.css";

interface Task {
  id: number;
  title: string;
  meta: string;
  done: boolean;
}
const START: Task[] = [
  { id: 1, title: "Review sprint backlog", meta: "Work · 9:00", done: true },
  { id: 2, title: "Ship onboarding flow", meta: "Product · 11:30", done: false },
  { id: 3, title: "Call with design team", meta: "Meetings · 14:00", done: false },
  { id: 4, title: "Update analytics report", meta: "Analytics · 16:00", done: false },
];
// The FAB adds these in order, then stops (the list has room for six rows).
const SAMPLES = ["Draft release notes", "Book usability test"];
const WEEK = [3, 5, 4, 6, 2, 4, 5];
const FILTERS = ["All", "Active", "Done"] as const;
const R = 26;
const C = 2 * Math.PI * R;

export default function Material() {
  const [tasks, setTasks] = useState(START);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [note, setNote] = useState("");
  const done = tasks.filter((t) => t.done).length;
  const pct = Math.round((done / tasks.length) * 100);
  const shown = tasks.filter((t) => filter === "All" || (filter === "Done") === t.done);
  const next = SAMPLES[tasks.length - START.length];

  const add = () => {
    if (!next) return setNote("List is full — complete or filter tasks");
    setTasks((ts) => [...ts, { id: ts.length + 1, title: next, meta: "Inbox · new", done: false }]);
    setFilter((f) => (f === "Done" ? "All" : f));
    setNote(`Added “${next}”`);
  };
  const toggle = (id: number) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  return (
    <div className={s.root}>
      <header className={s.bar}>
        <span className={s.menu} aria-hidden>
          ☰
        </span>
        <h3 className={s.title}>My Tasks</h3>
        <span className={s.count}>{tasks.length - done} open</span>
      </header>

      <div className={s.body}>
        <aside className={s.side}>
          <section className={s.card} aria-label="Daily progress">
            <p className={s.label}>Activity / Progress</p>
            <div className={s.ringRow}>
              <svg className={s.ring} viewBox="0 0 64 64" aria-hidden>
                <circle cx="32" cy="32" r={R} className={s.ringTrack} />
                <circle cx="32" cy="32" r={R} className={s.ringFill} strokeDasharray={`${(C * pct) / 100} ${C}`} />
              </svg>
              <div>
                <p className={s.pct}>{pct}%</p>
                <p className={s.small}>
                  {done} of {tasks.length} done
                </p>
              </div>
            </div>
            <div className={s.linear} role="progressbar" aria-label="Tasks completed" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
              <span style={{ width: `${pct}%` }} />
            </div>
          </section>
          <section className={`${s.card} ${s.tonal}`} aria-label="Daily goal">
            <p className={s.label}>Daily Goals</p>
            <p className={s.small}>{done >= 4 ? "Goal reached ✓" : `${4 - done} more to reach 4`}</p>
            <span className={s.week} aria-hidden>
              {WEEK.map((n, i) => (
                <span key={i} style={{ height: `${(i === 6 ? done : n) * 4 + 2}px` }} />
              ))}
            </span>
          </section>
          <p className={s.note} role="status">
            {note}
          </p>
          <button type="button" className={s.fab} aria-label="Add task" onClick={add}>
            +
          </button>
        </aside>

        <section className={s.main} aria-label="Tasks">
          <div className={s.chips} role="radiogroup" aria-label="Filter tasks">
            {FILTERS.map((f) => (
              <button key={f} type="button" role="radio" aria-checked={filter === f} className={s.chip} onClick={() => setFilter(f)}>
                {filter === f && <span aria-hidden>✓ </span>}
                {f}
              </button>
            ))}
          </div>
          <ul className={s.list}>
            {shown.map((t) => (
              <li key={t.id}>
                <button type="button" role="checkbox" aria-checked={t.done} className={s.task} onClick={() => toggle(t.id)}>
                  <span className={s.check} aria-hidden>
                    {t.done ? "✓" : ""}
                  </span>
                  <span className={s.taskText}>
                    <span className={s.taskTitle}>{t.title}</span>
                    <span className={s.small}>{t.meta}</span>
                  </span>
                </button>
              </li>
            ))}
            {shown.length === 0 && <li className={s.empty}>No {filter.toLowerCase()} tasks</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
