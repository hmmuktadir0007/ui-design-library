/** Low-poly mesh for style 44 (pure, deterministic). */
export const W = 420;
export const H = 337;

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const [x, y] = [hex(a), hex(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(",")})`;
};
// Deterministic jitter in [-1, 1] from an index (no randomness: the same mesh every render).
const jit = (n: number) => (((n * 9301 + 49297) % 233280) / 233280) * 2 - 1;

/** Triangle mesh over the artboard; each facet gets a fixed "normal" angle, shaded flat against the light direction. */
export function facets(cols: number, rows: number, light: number, pal: readonly string[]) {
  const pt = (c: number, r: number) => {
    const edge = c === 0 || c === cols || r === 0 || r === rows;
    const k = r * (cols + 1) + c;
    return [(c / cols) * W + (edge ? 0 : jit(k) * (W / cols) * 0.42), (r / rows) * H + (edge ? 0 : jit(k + 97) * (H / rows) * 0.42)];
  };
  const out: { d: string; fill: string }[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const [a, b, d, e] = [pt(c, r), pt(c + 1, r), pt(c, r + 1), pt(c + 1, r + 1)];
      [
        [a, b, e],
        [a, e, d],
      ].forEach((tri, j) => {
        const i = (r * cols + c) * 2 + j;
        const normal = (jit(i * 7 + 3) + 1) * 180; // degrees
        const lit = 0.5 + 0.5 * Math.cos(((normal - light) * Math.PI) / 180); // flat Lambert-style step
        const t = Math.round(lit * 4) / 4; // stepped shading: 5 tones
        out.push({ d: `M${tri.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join("L")}Z`, fill: t < 0.5 ? mix(pal[0], pal[1], t * 2) : mix(pal[1], pal[2], (t - 0.5) * 2) });
      });
    }
  return out;
}

