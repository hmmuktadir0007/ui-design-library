import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { previewRegistry } from "./previewRegistry";

// Read stylesheets as plain text from disk: Vitest's CSS Module transform does not hand back source strings.
const stylesDir = fileURLToPath(new URL("./styles/", import.meta.url));
const cssFiles = readdirSync(stylesDir).filter((f) => f.endsWith(".module.css")).sort();
const read = (file: string) => readFileSync(stylesDir + file, "utf8");

/** Top-level selectors of a stylesheet, ignoring comments and @keyframes bodies. */
function selectors(css: string): string[] {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
  return [...clean.matchAll(/([^{}]+)\{/g)]
    .map((m) => m[1].trim())
    .filter((s) => !s.startsWith("@"))
    .flatMap((s) => s.split(",").map((x) => x.trim()));
}

describe("selector parser", () => {
  it("finds global selectors it must reject", () => {
    expect(selectors("/* .x{} */ body{a:b} .a:hover,.b{c:d} @keyframes k{from{a:b}to{a:c}} @media (x){:root{a:b}}"))
      .toEqual(["body", ".a:hover", ".b", ":root"]);
  });
});

describe("preview CSS isolation", () => {
  it("every registered preview has exactly one CSS Module", () => {
    const ids = Object.keys(previewRegistry).map(Number).sort((a, b) => a - b);
    expect(cssFiles.map((f) => Number(f.slice(0, 2)))).toEqual(ids);
  });

  it.each(cssFiles)("%s only uses class-rooted selectors (CSS Modules scope them)", (file) => {
    const css = read(file);
    const sels = selectors(css);
    expect(sels.length).toBeGreaterThan(0);
    for (const s of sels) {
      expect(s, `${file}: "${s}" would be global`).toMatch(/^\./);
      expect(s, `${file}: ":global" escapes the module`).not.toContain(":global");
    }
    // Styles that could escape the preview stage or override the app shell.
    expect(css, `${file}: @import pulls in unscoped CSS`).not.toMatch(/@import/);
    expect(css, `${file}: position:fixed escapes the stage`).not.toMatch(/position\s*:\s*fixed/);
    expect(css, `${file}: !important fights app styles`).not.toMatch(/!important/);
  });
});
