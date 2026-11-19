import { describe, expect, it } from "vitest";
import { runCommand } from "./37-terminal-commands";

describe("style 37 terminal interpreter", () => {
  it("answers the fixed commands", () => {
    expect(runCommand("help", "green", []).lines[0].text).toMatch(/help · about · status/);
    expect(runCommand("  STATUS ", "amber", ["a", "b"]).lines[0].text).toBe("STATUS: [ONLINE] 9600 BAUD // phosphor P3-AMBER // 2 cmds");
    expect(runCommand("clear", "green", [])).toEqual({ lines: [], clear: true });
    expect(runCommand("history", "green", ["help", "status"]).lines.map((l) => l.text)).toEqual(["  1  help", "  2  status"]);
  });

  it("switches or toggles the phosphor theme and rejects unknown ones", () => {
    expect(runCommand("theme", "green", []).theme).toBe("amber");
    expect(runCommand("theme amber", "amber", []).theme).toBe("amber");
    const bad = runCommand("theme red", "green", []);
    expect(bad.theme).toBeUndefined();
    expect(bad.lines[0].kind).toBe("err");
  });

  it("never runs anything: unknown input is reported, echo returns plain text", () => {
    for (const evil of ["rm -rf /", "alert(1)", "eval document.cookie", "$(whoami)", "constructor"]) {
      const r = runCommand(evil, "green", []);
      expect(r.lines).toHaveLength(1);
      expect(r.lines[0].kind).toBe("err");
      expect(r.theme).toBeUndefined();
    }
    expect(runCommand("echo <b>hi</b>", "green", []).lines[0]).toEqual({ kind: "out", text: "<b>hi</b>" });
  });
});
