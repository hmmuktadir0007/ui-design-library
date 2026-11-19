import { describe, expect, it } from "vitest";
import { split } from "./PreviewStage";

describe("split (touch-target growth per side)", () => {
  it("grows evenly to 44 when both sides have room", () => {
    expect(split(20, 100, 100)).toEqual([12, 12]);
  });
  it("hands the shortfall of a cramped side to the free side", () => {
    expect(split(20, 100, 8)).toEqual([20, 4]); // side B capped at half its 8px gap
  });
  it("never takes more than half the room on either side", () => {
    expect(split(10, 6, 10)).toEqual([3, 5]);
  });
  it("leaves controls that are already big enough alone", () => {
    expect(split(50, 100, 100)).toEqual([0, 0]);
  });
});
