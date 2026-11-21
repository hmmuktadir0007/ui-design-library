import { useState } from "react";
import { onRadioGroupKeyDown } from "../shared/radioGroup";
import s from "./48-masonry.module.css";

// CSS-generated artwork (gradients), so no image assets or third-party requests.
const ITEMS = [
  { id: 1, title: "Chromatic Flow", meta: "LOOKBOOK // 01", cat: "Lookbooks", art: s.chroma, h: 36, saves: 1240 },
  { id: 2, title: "Editorial Grid Guide", meta: "CURATED // TYPE", cat: "Editorial", art: s.type, h: 38, saves: 860 },
  { id: 3, title: "Isometric Cyber", meta: "PROMPT // GEMINI", cat: "3D Art", art: s.teal, h: 44, saves: 2310 },
  { id: 4, title: "Studio Monolith", meta: "ARCHIVE // 3D", cat: "3D Art", art: s.blue, h: 34, saves: 540 },
  { id: 5, title: "Volumetric Mesh", meta: "RENDER // 8K", cat: "3D Art", art: s.sunset, h: 34, saves: 1975 },
  { id: 6, title: "Masonry Pack", meta: "ZERO HORIZONTAL GAPS", cat: "Editorial", art: s.pack, h: 34, saves: 3120 },
  { id: 7, title: "Dune Palette", meta: "LOOKBOOK // 02", cat: "Lookbooks", art: s.dune, h: 34, saves: 690 },
];
const CATS = ["All", "Lookbooks", "3D Art", "Editorial", "Saved"];

export default function Masonry() {
  const [cat, setCat] = useState("All");
  const [saved, setSaved] = useState<number[]>([]);
  const [selected, setSelected] = useState(6);
  const shown = ITEMS.filter((it) => cat === "All" || it.cat === cat || (cat === "Saved" && saved.includes(it.id)));
  const sel = ITEMS.find((it) => it.id === selected)!;
  const toggleSave = (id: number) => setSaved((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  const count = (c: string) => (c === "All" ? ITEMS.length : c === "Saved" ? saved.length : ITEMS.filter((it) => it.cat === c).length);

  return (
    <div className={s.root}>
      <div className={s.filters} role="radiogroup" aria-label="Category" onKeyDown={onRadioGroupKeyDown}>
        {CATS.map((c) => (
          <button key={c} type="button" role="radio" aria-checked={c === cat} tabIndex={c === cat ? 0 : -1} className={s.filter} onClick={() => setCat(c)}>
            {c === "Saved" && "♥ "}
            {c} ({count(c)})
          </button>
        ))}
      </div>

      <div className={s.wall}>
        {shown.map((it) => (
          <article key={it.id} className={`${s.card} ${it.id === selected ? s.selected : ""}`}>
            {/* the artwork also selects on click; the caption button is the keyboard/AT path */}
            <div className={`${s.art} ${it.art}`} style={{ height: it.h }} onClick={() => setSelected(it.id)}>
              {it.id === 2 && (
                <span className={s.typeArt} aria-hidden>
                  MINIMAL
                  <br />
                  <em>TYPE</em>
                </span>
              )}
              <button
                type="button"
                className={s.save}
                aria-pressed={saved.includes(it.id)}
                aria-label={`Save ${it.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSave(it.id);
                }}
              >
                ♥ Save
              </button>
            </div>
            <button type="button" className={s.caption} aria-pressed={it.id === selected} onClick={() => setSelected(it.id)}>
              <strong>
                {it.id === selected && (
                  <span className={s.tick} aria-hidden>
                    ✓{" "}
                  </span>
                )}
                {it.title}
              </strong>
              <span>{it.meta}</span>
            </button>
          </article>
        ))}
        {shown.length === 0 && <p className={s.empty}>Nothing saved yet. Tap ♥ Save on a card.</p>}
      </div>

      <footer className={s.foot} aria-live="polite">
        <span className={`${s.thumb} ${sel.art}`} aria-hidden />
        <p className={s.detail}>
          <strong>{sel.title}</strong> · {sel.cat} · {(sel.saves + (saved.includes(sel.id) ? 1 : 0)).toLocaleString("en-US")} saves
        </p>
        <p className={s.meta}>{saved.includes(sel.id) ? "♥ IN YOUR BOARD" : "BREAK-INSIDE: AVOID // PACKED"}</p>
      </footer>
    </div>
  );
}
