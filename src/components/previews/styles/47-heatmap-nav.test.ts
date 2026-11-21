import { describe, expect, it } from "vitest";
import { nextHeatmapCell } from "./47-heatmap-nav";

describe("nextHeatmapCell (7x4 grid)", () => {
  it("moves left and right and clamps at grid ends", () => {
    expect(nextHeatmapCell(17, "ArrowRight")).toBe(18);
    expect(nextHeatmapCell(17, "ArrowLeft")).toBe(16);
    expect(nextHeatmapCell(0, "ArrowLeft")).toBe(0);
    expect(nextHeatmapCell(27, "ArrowRight")).toBe(27);
  });

  it("moves up and down by 7 and clamps at top/bottom rows", () => {
    expect(nextHeatmapCell(17, "ArrowUp")).toBe(10);
    expect(nextHeatmapCell(17, "ArrowDown")).toBe(24);
    expect(nextHeatmapCell(3, "ArrowUp")).toBe(3);
    expect(nextHeatmapCell(24, "ArrowDown")).toBe(24);
  });

  it("moves to row start/end on Home/End and grid start/end with Ctrl", () => {
    expect(nextHeatmapCell(17, "Home")).toBe(14);
    expect(nextHeatmapCell(17, "End")).toBe(20);
    expect(nextHeatmapCell(17, "Home", true)).toBe(0);
    expect(nextHeatmapCell(17, "End", true)).toBe(27);
  });

  it("returns null for non-navigation keys", () => {
    expect(nextHeatmapCell(17, "Enter")).toBeNull();
    expect(nextHeatmapCell(17, " ")).toBeNull();
    expect(nextHeatmapCell(17, "Tab")).toBeNull();
  });
});
