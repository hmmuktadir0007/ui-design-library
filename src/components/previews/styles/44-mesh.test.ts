import { describe, expect, it } from "vitest";
import { facets } from "./44-mesh";

const PAL = ["#1e1b4b", "#4338ca", "#6366f1"];

describe("style 44 low-poly mesh", () => {
  it("has two triangles per cell and is the same on every call", () => {
    expect(facets(6, 3, 135, PAL)).toHaveLength(36);
    expect(facets(9, 3, 135, PAL)).toHaveLength(54);
    expect(facets(6, 3, 135, PAL)).toEqual(facets(6, 3, 135, PAL));
  });

  it("uses stepped shading from the palette and re-shades when the light turns", () => {
    const fills = new Set(facets(9, 3, 135, PAL).map((f) => f.fill));
    expect(fills.size).toBeGreaterThan(1);
    expect(fills.size).toBeLessThanOrEqual(5); // five tones
    expect(facets(9, 3, 315, PAL).map((f) => f.fill)).not.toEqual(facets(9, 3, 135, PAL).map((f) => f.fill));
    expect(facets(4, 3, 0, PAL)[0].d).toMatch(/^M0\.0 0\.0L/); // corner vertices stay pinned to the artboard
  });
});
