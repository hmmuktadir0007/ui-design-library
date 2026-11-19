import { useState, type KeyboardEvent } from "react";
import s from "./37-terminal.module.css";
import { runCommand, type Line, type Theme } from "./37-terminal-commands";

const PROMPT = "operator@mainframe:~$";
const START: Line[] = [
  { kind: "cmd", text: "whoami" },
  { kind: "out", text: "sysadmin & digital architect [uid: 001] [gid: dev]" },
  { kind: "cmd", text: "cat spec_profile.json" },
  { kind: "out", text: '{ "paradigm": "CLI_Retro_Phosphor", "palette": "P1-Green", "scanlines": true }' },
  { kind: "cmd", text: "execute --theme phosphor" },
  { kind: "ok", text: "[OK] CRT EMISSION 520NM ACTIVE // PROMPT STANDBY" },
  { kind: "out", text: 'type "help" for commands' },
];
const VISIBLE = 12; // lines that fit above the prompt; older ones scroll off the top like a real tty

export default function Terminal() {
  const [lines, setLines] = useState(START);
  const [theme, setTheme] = useState<Theme>("green");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(0); // index into history while recalling; history.length = fresh line
  const [value, setValue] = useState("");

  const submit = () => {
    const cmd = value.trim();
    const hist = cmd ? [...history, cmd] : history;
    const r = runCommand(cmd, theme, hist);
    if (r.theme) setTheme(r.theme);
    setLines(r.clear ? [] : [...lines, { kind: "cmd", text: cmd }, ...r.lines]);
    setHistory(hist);
    setCursor(hist.length);
    setValue("");
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(0, Math.min(history.length, cursor + (e.key === "ArrowUp" ? -1 : 1)));
      setCursor(next);
      setValue(history[next] ?? "");
    }
  };

  return (
    <div className={`${s.root} ${theme === "amber" ? s.amber : ""}`}>
      <header className={s.bar}>
        <span>DEV-PTS/0 • BASH 5.2 • {theme === "green" ? "PHOSPHOR" : "AMBER"}</span>
        <span className={s.warn}>STATUS: [ONLINE] 9600 BAUD</span>
      </header>
      <div className={s.box} aria-hidden>
        <p>┌── SYSTEM REPOSITORY : CORE-ARCH v3.7 ──────────┐</p>
        <p>└── INITIALIZED PHOSPHOR PROTOCOL // ALL BUFFERS READY ┘</p>
      </div>

      <div className={s.screen} role="log" aria-label="Terminal output">
        {lines.slice(-VISIBLE).map((l, i) => (
          <p key={lines.length - VISIBLE + i} className={s[l.kind]}>
            {l.kind === "cmd" ? (
              <>
                <span className={s.prompt}>{PROMPT}</span> {l.text}
              </>
            ) : (
              <>
                {l.kind === "out" ? "> " : ""}
                {l.text}
              </>
            )}
          </p>
        ))}
      </div>

      <label className={s.inputRow}>
        <span className={s.prompt}>{PROMPT}</span>
        <input
          className={s.input}
          aria-label="Terminal command"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
        />
      </label>
      <footer className={s.foot}>
        <span>BUFFER: 1024 KB // {history.length} CMDS</span>
        <span className={s.fg}>PURE TERMINAL ARCHITECTURE</span>
      </footer>
    </div>
  );
}
