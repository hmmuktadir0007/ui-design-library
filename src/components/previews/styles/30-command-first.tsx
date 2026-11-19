import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import s from "./30-command-first.module.css";

interface Ctx {
  issues: number;
  workspace: string;
  light: boolean;
}
interface Command {
  group: string;
  label: string;
  keys: string[];
  run: (c: Ctx) => [Partial<Ctx>, string];
}
const COMMANDS: Command[] = [
  { group: "Suggested", label: "Create New Issue / Task", keys: ["C"], run: (c) => [{ issues: c.issues + 1 }, `Created issue ENG-${142 + c.issues}`] },
  { group: "Suggested", label: "Search Project Documents & Notes", keys: ["⌘", "P"], run: () => [{}, "Opened document search: 38 notes"] },
  {
    group: "Suggested",
    label: "Switch Workspace / Organization",
    keys: ["⌘", "W"],
    run: (c) => {
      const w = c.workspace === "Acme" ? "Globex" : "Acme";
      return [{ workspace: w }, `Switched to ${w} workspace`];
    },
  },
  { group: "Suggested", label: "Toggle Dark Mode / Theme", keys: ["⌘", "T"], run: (c) => [{ light: !c.light }, `Theme set to ${c.light ? "dark" : "light"}`] },
  { group: "Navigation", label: "Go to Inbox", keys: ["G", "I"], run: () => [{}, "Inbox: 4 unread mentions"] },
  { group: "Navigation", label: "Open Settings", keys: ["G", "S"], run: () => [{}, "Settings opened"] },
];

export default function CommandFirst() {
  const [ctx, setCtx] = useState<Ctx>({ issues: 0, workspace: "Acme", light: false });
  const [open, setOpen] = useState(true); // the slide shows the spotlight open
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [result, setResult] = useState("Press ⌘K or Ctrl+K to run a command");
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const moveFocus = useRef(false); // focus moves only after a user action, never on mount
  const id = useId();

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    (open ? input : trigger).current?.focus();
  }, [open]);

  const show = (v: boolean) => {
    moveFocus.current = true;
    setOpen(v);
    setQuery("");
    setActive(0);
  };
  const matches = COMMANDS.filter((c) => c.label.toLowerCase().includes(query.trim().toLowerCase()));
  const cur = Math.min(active, Math.max(0, matches.length - 1));
  const exec = (c: Command) => {
    const [patch, msg] = c.run(ctx);
    setCtx({ ...ctx, ...patch });
    setResult(msg);
    show(false);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (matches.length) setActive((cur + (e.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length);
    } else if (e.key === "Enter" && matches[cur]) {
      e.preventDefault();
      exec(matches[cur]);
    } else if (e.key === "Escape") {
      e.preventDefault(); // close the palette only, not the surrounding detail dialog
      e.stopPropagation();
      show(false);
    }
  };
  // ⌘K / Ctrl+K only while focus is inside this preview.
  const onRootKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      show(!open);
    }
  };

  let lastGroup = "";
  return (
    <div className={`${s.root} ${ctx.light ? s.light : ""}`} onKeyDown={onRootKey}>
      <header className={s.app}>
        <span className={s.logo} aria-hidden />
        <span className={s.ws}>{ctx.workspace} / Engineering</span>
        <span className={s.muted}>{ctx.issues + 12} open issues</span>
      </header>
      <p className={s.result} role="status">
        <span className={s.muted}>Last action</span>
        {result}
      </p>
      {!open && (
        <button ref={trigger} type="button" className={s.trigger} onClick={() => show(true)}>
          Open command palette <kbd className={s.key}>⌘</kbd>
          <kbd className={s.key}>K</kbd>
        </button>
      )}

      {open && (
        <div className={s.palette} role="dialog" aria-label="Command palette">
          <div className={s.search}>
            <span className={s.glass} aria-hidden />
            <input
              ref={input}
              className={s.input}
              role="combobox"
              aria-label="Type a command or search"
              aria-expanded="true"
              aria-controls={`${id}-list`}
              aria-autocomplete="list"
              aria-activedescendant={matches[cur] ? `${id}-${COMMANDS.indexOf(matches[cur])}` : undefined}
              placeholder="Type a command or search…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKey}
            />
            <button type="button" className={s.esc} aria-label="Esc: close command palette" onClick={() => show(false)}>
              ESC
            </button>
          </div>
          <ul className={s.list} id={`${id}-list`} role="listbox" aria-label="Commands">
            {matches.map((c) => {
              const head = c.group !== lastGroup ? (lastGroup = c.group) : null;
              const selected = c === matches[cur];
              return (
                <li key={c.label} role="presentation">
                  {head && (
                    <p className={s.group} aria-hidden>
                      {head === "Suggested" ? "SUGGESTED COMMANDS // SPEED DIAL" : "NAVIGATION"}
                    </p>
                  )}
                  <div
                    id={`${id}-${COMMANDS.indexOf(c)}`}
                    role="option"
                    aria-selected={selected}
                    className={s.row}
                    onMouseMove={() => setActive(matches.indexOf(c))}
                    onClick={() => exec(c)}
                  >
                    <span className={s.dot} aria-hidden />
                    <span className={s.label}>{c.label}</span>
                    {c.keys.map((k) => (
                      <kbd key={k} className={s.key}>
                        {k}
                      </kbd>
                    ))}
                    {selected && (
                      <kbd className={`${s.key} ${s.enter}`} aria-hidden>
                        ↵
                      </kbd>
                    )}
                  </div>
                </li>
              );
            })}
            {matches.length === 0 && <li className={s.none}>No commands match “{query}”</li>}
          </ul>
          <footer className={s.foot} aria-hidden>
            <span>
              <b>↑↓</b> navigate · <b>↵</b> select · <b>esc</b> close
            </span>
            <span>
              <b>⌘ K</b> ACTIVE SPOTLIGHT
            </span>
          </footer>
        </div>
      )}
    </div>
  );
}
