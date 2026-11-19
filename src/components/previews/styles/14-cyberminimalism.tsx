import { useId, useRef, useState, type KeyboardEvent } from "react";
import s from "./14-cyberminimalism.module.css";

interface State {
  version: number;
  paused: boolean;
  secrets: string;
  streaming: boolean;
}
interface Action {
  key: string;
  title: string;
  sub: (st: State) => string;
  kbd: string;
  run: (st: State) => [Partial<State>, string];
}
const ACTIONS: Action[] = [
  {
    key: "deploy",
    title: "Deploy to Edge Production",
    sub: () => "TARGET // SFO-REGION-CLUSTER-01",
    kbd: "⇧⏎",
    run: (st) => (st.paused ? [{}, "Blocked: cluster paused"] : [{ version: st.version + 1 }, `Deployed v1.4.${st.version + 1}`]),
  },
  { key: "rotate", title: "Rotate Environment Secrets & Keys", sub: (st) => `VAULT // LAST UPDATED ${st.secrets}`, kbd: "⌘S", run: () => [{ secrets: "JUST NOW" }, "Secrets rotated"] },
  {
    key: "stream",
    title: "Stream Telemetry & Trace Inspector",
    sub: (st) => (st.streaming ? "STATUS // STREAMING LIVE" : "STATUS // P99 LATENCY 14MS"),
    kbd: "⌘T",
    run: (st) => [{ streaming: !st.streaming }, st.streaming ? "Trace stream stopped" : "Trace stream started"],
  },
  { key: "rollback", title: "Roll Back Last Deploy", sub: (st) => `RELEASE // V1.4.${st.version}`, kbd: "⌘Z", run: (st) => [{ version: Math.max(0, st.version - 1) }, `Rolled back to v1.4.${Math.max(0, st.version - 1)}`] },
  { key: "purge", title: "Purge Edge Cache", sub: () => "CDN // 312 POPS", kbd: "⌘P", run: () => [{}, "Cache purged on 312 POPs"] },
];

export default function Cyberminimalism() {
  const [st, setSt] = useState<State>({ version: 2, paused: false, secrets: "2D AGO", streaming: false });
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [last, setLast] = useState("Idle // awaiting command");
  const [runs, setRuns] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();

  const matches = ACTIONS.filter((a) => `${a.title} ${a.sub(st)}`.toLowerCase().includes(query.trim().toLowerCase()));
  const cur = Math.min(active, Math.max(0, matches.length - 1));
  const start = Math.max(0, Math.min(cur - 2, matches.length - 3)); // three rows visible; the window follows the active row

  const run = (a: Action) => {
    const [patch, msg] = a.run(st);
    setSt({ ...st, ...patch });
    setLast(msg);
    setRuns((n) => n + 1);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (matches.length) setActive((cur + (e.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length);
    } else if (e.key === "Enter" && matches[cur]) {
      e.preventDefault();
      run(matches[cur]);
    } else if (e.key === "Escape" && query) {
      e.preventDefault(); // clear the search instead of closing the surrounding detail dialog
      e.stopPropagation();
      setQuery("");
    }
  };
  // ⌘K / Ctrl+K only while focus is inside this preview, so the app's own shortcuts and inputs are untouched.
  const onRootKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      input.current?.focus();
      input.current?.select();
    }
  };

  return (
    <div className={s.root} onKeyDown={onRootKey}>
      <div className={s.search}>
        <span className={s.glass} aria-hidden />
        <input
          ref={input}
          className={s.input}
          role="combobox"
          aria-label="Search commands"
          aria-expanded="true"
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={matches[cur] ? `${id}-${matches[cur].key}` : undefined}
          placeholder="Search commands, deployments, traces…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKey}
        />
        <kbd className={s.kbd} aria-hidden>
          ⌘ K
        </kbd>
      </div>

      <p className={s.group}>
        ACTIONS &amp; WORKFLOWS <span className={s.dim}>// {matches.length} MATCH{matches.length === 1 ? "" : "ES"}</span>
      </p>
      <ul className={s.list} id={`${id}-list`} role="listbox" aria-label="Actions">
        {matches.slice(start, start + 3).map((a) => (
          <li
            key={a.key}
            id={`${id}-${a.key}`}
            role="option"
            aria-selected={a === matches[cur]}
            className={s.option}
            onMouseMove={() => setActive(matches.indexOf(a))}
            onClick={() => {
              setActive(matches.indexOf(a));
              run(a);
            }}
          >
            <span className={`${s.dot} ${a.key === "stream" ? s.green : ""}`} aria-hidden />
            <span className={s.optText}>
              <span className={s.optTitle}>{a.title}</span>
              <span className={`${s.sub} ${a.key === "stream" ? s.subGreen : ""}`}>{a.sub(st)}</span>
            </span>
            <kbd className={s.kbd}>{a.kbd}</kbd>
          </li>
        ))}
        {matches.length === 0 && <li className={s.none}>No actions match “{query}”</li>}
      </ul>

      <div className={s.cards}>
        <section className={s.card} aria-label="Edge worker cluster">
          <p className={s.cardLabel}>EDGE WORKER CLUSTER</p>
          <p className={s.cardValue}>{st.paused ? "PAUSED (0 RPS)" : "ACTIVE (99.99%)"}</p>
          <div className={s.cardRow}>
            <span className={s.cyan}>V8 ISOLATE // v1.4.{st.version}</span>
            <button type="button" className={s.toggle} onClick={() => setSt({ ...st, paused: !st.paused })}>
              {st.paused ? "Resume" : "Pause"}
            </button>
          </div>
        </section>
        <section className={s.card} aria-label="Status indicator">
          <p className={s.cardLabel}>STATUS INDICATOR</p>
          <p className={`${s.cardValue} ${s.indigo}`} role="status">
            {last}
          </p>
          <p className={s.cardRow}>
            <span className={s.ring} aria-hidden />
            {runs} RUNS // LIVE ACCENT
          </p>
        </section>
      </div>
    </div>
  );
}
