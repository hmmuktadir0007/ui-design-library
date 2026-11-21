import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import stylesData from "../../data/styles.json";
import type { Style } from "../../types/style";
import {
  buildPreviewVars,
  CONFIGURED_STYLE_IDS,
  formatGeneratedCss,
  getDefaultPlaygroundState,
  getPlaygroundConfig,
  hasCssCustomizations,
  isPlaygroundDefault,
  VIEWPORT_PRESETS,
} from "./playgroundConfig";

const styles = stylesData as Style[];
const byId = new Map(styles.map((s) => [s.id, s]));
const stylesDir = fileURLToPath(new URL("../previews/styles/", import.meta.url));
const cssByStyleId = new Map<number, string>(
  readdirSync(stylesDir)
    .filter((f) => f.endsWith(".module.css"))
    .map((f) => [Number(f.slice(0, 2)), readFileSync(stylesDir + f, "utf8")]),
);

describe("playgroundConfig contract", () => {
  it("never exposes a dead CSS variable: every declared --pg-* var appears in the style's CSS Module", () => {
    for (const id of CONFIGURED_STYLE_IDS) {
      const style = byId.get(id)!;
      const css = cssByStyleId.get(id)!;
      const config = getPlaygroundConfig(style);
      expect(css, `CSS Module missing for style ${id}`).toBeTruthy();

      if (config.accent) {
        expect(css, `style ${id} declares --pg-accent but CSS does not use it`).toContain("var(--pg-accent");
        expect(config.accent.defaultValue).toMatch(/^#[0-9A-F]{6}$/);
        expect(config.accent.swatches).toContain(config.accent.defaultValue);
      }
      if (config.radius) {
        expect(css, `style ${id} declares --pg-radius but CSS does not use it`).toContain("var(--pg-radius");
      }
      if (config.scale) {
        expect(css, `style ${id} declares --pg-scale but CSS does not use it`).toContain("var(--pg-scale");
      }
      if (config.shadow) {
        expect(css, `style ${id} declares --pg-shadow-strength but CSS does not use it`).toContain(
          "var(--pg-shadow-strength",
        );
      }
    }
  });

  it("omits Border Radius on sharp-corner styles (Neo-Brutalism, Swiss, Bauhaus, Pixel Art, Monochrome, Win95)", () => {
    for (const id of [7, 11, 13, 21, 25, 38]) {
      const config = getPlaygroundConfig(byId.get(id)!);
      expect(config.radius, `style ${id} should not expose border-radius`).toBeUndefined();
    }
  });

  it("supports depth intensity on Morphism & Depth, Material, Bento, and Neo-Brutalism", () => {
    for (const id of [1, 3, 4, 5, 6, 7, 8, 10, 18, 31, 34, 45, 46]) {
      const config = getPlaygroundConfig(byId.get(id)!);
      expect(config.shadow, `style ${id} should expose shadow depth`).toBeDefined();
    }
  });

  it("defines Desktop, Tablet, and Mobile viewport presets", () => {
    expect(VIEWPORT_PRESETS.map((p) => p.id)).toEqual(["desktop", "tablet", "mobile"]);
  });
});

describe("buildPreviewVars & formatGeneratedCss", () => {
  it("builds --pg-* vars and formatted :root CSS only for supported controls", () => {
    const material = byId.get(3)!;
    const config = getPlaygroundConfig(material);
    const defaults = getDefaultPlaygroundState(material);
    const customized = { ...defaults, accent: "#F59E0B", radius: 24, scale: 1.2, shadow: 1.4 };

    expect(buildPreviewVars(config, customized)).toEqual({
      "--pg-accent": "#F59E0B",
      "--pg-radius": "24px",
      "--pg-scale": "1.2",
      "--pg-shadow-strength": "1.4",
    });

    const css = formatGeneratedCss(material, config, customized);
    expect(css).toBe(
      [
        "/* Material Design — Playground custom properties */",
        ":root {",
        "  --accent: #F59E0B;",
        "  --radius: 24px;",
        "  --density: 1.2;",
        "  --shadow-strength: 1.4;",
        "}",
      ].join("\n"),
    );
  });

  it("omits unsupported variables from generated CSS (e.g. Neo-Brutalism omits --radius)", () => {
    const brutal = byId.get(7)!;
    const config = getPlaygroundConfig(brutal);
    const state = { ...getDefaultPlaygroundState(brutal), accent: "#FF4D8D", shadow: 1.3 };
    const css = formatGeneratedCss(brutal, config, state);
    expect(css).toContain("--accent: #FF4D8D;");
    expect(css).toContain("--shadow-strength: 1.3;");
    expect(css).not.toContain("--radius");
  });

  it("returns empty generated CSS for styles without CSS-variable controls", () => {
    const style17 = byId.get(17)!;
    const config = getPlaygroundConfig(style17);
    expect(hasCssCustomizations(config)).toBe(false);
    expect(formatGeneratedCss(style17, config, getDefaultPlaygroundState(style17))).toBe("");
  });

  it("tracks default state accurately for Reset", () => {
    const bento = byId.get(8)!;
    const defaults = getDefaultPlaygroundState(bento);
    expect(isPlaygroundDefault(defaults, defaults)).toBe(true);
    expect(isPlaygroundDefault({ ...defaults, viewport: "mobile" }, defaults)).toBe(false);
    expect(isPlaygroundDefault({ ...defaults, backdrop: "dark" }, defaults)).toBe(false);
    expect(isPlaygroundDefault({ ...defaults, radius: 10 }, defaults)).toBe(false);
  });
});
