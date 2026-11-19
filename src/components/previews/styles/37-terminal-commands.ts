/**
 * Fixed-command interpreter for the style 37 terminal demo.
 * Input is only ever compared against this whitelist and echoed back as text: nothing is evaluated or executed.
 */
export type Theme = "green" | "amber";
export interface Line {
  kind: "cmd" | "out" | "ok" | "err";
  text: string;
}
export interface Result {
  lines: Line[];
  clear?: boolean;
  theme?: Theme;
}

export const COMMANDS = ["help", "about", "status", "whoami", "theme", "history", "echo", "clear"];
const out = (...text: string[]): Line[] => text.map((t) => ({ kind: "out", text: t }));

export function runCommand(raw: string, theme: Theme, history: string[]): Result {
  const [name = "", ...args] = raw.trim().split(/\s+/);
  switch (name.toLowerCase()) {
    case "":
      return { lines: [] };
    case "help":
      return { lines: out(`available: ${COMMANDS.join(" · ")}`, "↑/↓ recall history · theme [green|amber]") };
    case "about":
      return { lines: out("UI Design Library // style 37: Terminal / CLI Retro UI", "fixed-command demo: nothing you type is executed") };
    case "status":
      return { lines: out(`STATUS: [ONLINE] 9600 BAUD // phosphor ${theme === "green" ? "P1-GREEN" : "P3-AMBER"} // ${history.length} cmds`) };
    case "whoami":
      return { lines: out("sysadmin & digital architect [uid: 001] [gid: dev]") };
    case "theme": {
      const want = args[0]?.toLowerCase();
      if (want && want !== "green" && want !== "amber") return { lines: [{ kind: "err", text: `theme: unknown phosphor "${args[0]}" (green|amber)` }] };
      const next: Theme = want === "green" || want === "amber" ? want : theme === "green" ? "amber" : "green";
      return { theme: next, lines: [{ kind: "ok", text: `[OK] CRT EMISSION ${next === "green" ? "520NM" : "590NM"} ACTIVE // PROMPT STANDBY` }] };
    }
    case "history":
      return { lines: out(...(history.length ? history.map((h, i) => `${String(i + 1).padStart(3)}  ${h}`) : ["(empty)"])) };
    case "echo":
      return { lines: out(args.join(" ")) };
    case "clear":
      return { lines: [], clear: true };
    default:
      return { lines: [{ kind: "err", text: `${name}: command not found. Type "help".` }] };
  }
}
