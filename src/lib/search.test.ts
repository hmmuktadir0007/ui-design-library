import { describe, expect, it } from "vitest";
import rawStyles from "../data/styles.json";
import type { Style } from "../types/style";
import { categoryCounts, filterStyles } from "./search";

const styles = rawStyles as Style[];

describe("search and category filtering", () => {
  it("counts match the validated dataset", () => {
    expect(categoryCounts(styles, "")).toEqual({
      All: 50,
      "Morphism & Depth": 10,
      "Minimal & Typographic": 7,
      "Modern SaaS & Dashboards": 9,
      "Bold, Retro & Expressive": 10,
      "Atmospheric & Futuristic": 6,
      "Art & Heritage Movements": 8,
    });
  });

  it("is case-insensitive and normalizes whitespace", () => {
    const ids = filterStyles(styles, "  GLASS  ", "All").map((s) => s.id);
    expect(ids).toEqual(expect.arrayContaining([5, 10, 31, 45]));
    expect(filterStyles(styles, "liquid   glass", "All").map((s) => s.id)).toContain(10);
  });

  it("searches subtitle, original category and use cases", () => {
    expect(filterStyles(styles, "tactile realism", "All").map((s) => s.id)).toEqual([1]);
    expect(filterStyles(styles, "3d clay spec", "All").map((s) => s.id)).toEqual([6]);
    expect(filterStyles(styles, "DAW plugins", "All").map((s) => s.id)).toContain(1);
  });

  it("combines query and category", () => {
    const all = filterStyles(styles, "glass", "All");
    const morph = filterStyles(styles, "glass", "Morphism & Depth");
    expect(morph.length).toBeGreaterThan(0);
    expect(morph.every((s) => s.categoryTab === "Morphism & Depth")).toBe(true);
    expect(morph.length).toBeLessThanOrEqual(all.length);
    expect(filterStyles(styles, "zzzz-nothing", "All")).toEqual([]);
  });
});
