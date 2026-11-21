import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { KeyboardEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { onRadioGroupKeyDown } from "./radioGroup";

const stylesDir = fileURLToPath(new URL("../styles/", import.meta.url));
const previewFiles = readdirSync(stylesDir).filter((f) => f.endsWith(".tsx")).sort();

function fakeRadio(id: string) {
  return {
    id,
    focus: vi.fn(),
    click: vi.fn(),
    closest() {
      return this;
    },
  };
}

function fakeEvent(key: string, radios: ReturnType<typeof fakeRadio>[], targetIndex: number) {
  const preventDefault = vi.fn();
  const event = {
    key,
    preventDefault,
    target: radios[targetIndex],
    currentTarget: {
      querySelectorAll: () => radios,
    },
  } as unknown as KeyboardEvent<HTMLElement>;
  return { event, preventDefault };
}

describe("onRadioGroupKeyDown", () => {
  it("moves forward and wraps on ArrowRight / ArrowDown", () => {
    const radios = [fakeRadio("a"), fakeRadio("b"), fakeRadio("c")];
    const r1 = fakeEvent("ArrowRight", radios, 0);
    onRadioGroupKeyDown(r1.event);
    expect(r1.preventDefault).toHaveBeenCalledOnce();
    expect(radios[1].focus).toHaveBeenCalledOnce();
    expect(radios[1].click).toHaveBeenCalledOnce();

    const r2 = fakeEvent("ArrowDown", radios, 2);
    onRadioGroupKeyDown(r2.event);
    expect(r2.preventDefault).toHaveBeenCalledOnce();
    expect(radios[0].focus).toHaveBeenCalledOnce();
    expect(radios[0].click).toHaveBeenCalledOnce();
  });

  it("moves backward and wraps on ArrowLeft / ArrowUp", () => {
    const radios = [fakeRadio("a"), fakeRadio("b"), fakeRadio("c")];
    const l1 = fakeEvent("ArrowLeft", radios, 0);
    onRadioGroupKeyDown(l1.event);
    expect(l1.preventDefault).toHaveBeenCalledOnce();
    expect(radios[2].focus).toHaveBeenCalledOnce();
    expect(radios[2].click).toHaveBeenCalledOnce();

    const u1 = fakeEvent("ArrowUp", radios, 2);
    onRadioGroupKeyDown(u1.event);
    expect(u1.preventDefault).toHaveBeenCalledOnce();
    expect(radios[1].focus).toHaveBeenCalledOnce();
    expect(radios[1].click).toHaveBeenCalledOnce();
  });

  it("ignores non-arrow keys", () => {
    const radios = [fakeRadio("a"), fakeRadio("b")];
    const e = fakeEvent("Tab", radios, 0);
    onRadioGroupKeyDown(e.event);
    expect(e.preventDefault).not.toHaveBeenCalled();
    expect(radios[1].focus).not.toHaveBeenCalled();
  });
});

describe("preview radiogroup contract", () => {
  const withRadios = previewFiles.filter((f) => readFileSync(stylesDir + f, "utf8").includes('role="radiogroup"'));

  it.each(withRadios)("%s wires onRadioGroupKeyDown and roving tabIndex on every radio", (file) => {
    const src = readFileSync(stylesDir + file, "utf8");
    const groupCount = (src.match(/role="radiogroup"/g) ?? []).length;
    const handlerCount = (src.match(/onKeyDown=\{onRadioGroupKeyDown\}/g) ?? []).length;
    expect(handlerCount, `${file}: every radiogroup needs onKeyDown={onRadioGroupKeyDown}`).toBe(groupCount);

    const radioTags = src.match(/<button\b[\s\S]*?role="radio"[\s\S]*?>/g) ?? [];
    expect(radioTags.length).toBeGreaterThan(0);
    for (const tag of radioTags) {
      expect(tag, `${file}: every role="radio" needs roving tabIndex`).toMatch(/tabIndex=\{[^}]+\?\s*0\s*:\s*-1\}/);
    }
  });
});
