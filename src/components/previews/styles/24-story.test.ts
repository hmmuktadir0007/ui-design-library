import { describe, expect, it } from "vitest";
import { storyState } from "./24-story";

describe("style 24 scroll -> chapter mapping", () => {
  // 3 chapters, each 100px tall in a 100px viewport: scrollable range 0..200
  it("activates the chapter nearest the viewport top and reports overall progress", () => {
    expect(storyState(0, 300, 100, 3)).toEqual({ active: 0, progress: 0 });
    expect(storyState(49, 300, 100, 3).active).toBe(0);
    expect(storyState(51, 300, 100, 3).active).toBe(1);
    expect(storyState(100, 300, 100, 3)).toEqual({ active: 1, progress: 0.5 });
    expect(storyState(200, 300, 100, 3)).toEqual({ active: 2, progress: 1 });
  });

  it("clamps overscroll and unmeasured layouts", () => {
    expect(storyState(-30, 300, 100, 3)).toEqual({ active: 0, progress: 0 });
    expect(storyState(260, 300, 100, 3)).toEqual({ active: 2, progress: 1 });
    expect(storyState(0, 0, 0, 3)).toEqual({ active: 0, progress: 0 });
  });
});
