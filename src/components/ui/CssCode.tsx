import type { ReactNode } from "react";

// Tiny display-only highlighter: comments, property names, colour literals. Output is text nodes, never HTML.
const TOKEN = /(\/\*[\s\S]*?\*\/)|([a-z-]+)(?=\s*:)|(#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\))/g;

function highlight(css: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of css.matchAll(TOKEN)) {
    if (m.index > last) out.push(css.slice(last, m.index));
    const cls = m[1] ? "text-[var(--code-comment)] italic" : m[2] ? "text-[var(--code-prop)]" : "text-[var(--code-value)]";
    out.push(
      <span key={m.index} className={cls}>
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  out.push(css.slice(last));
  return out;
}

export function CssCode({ css }: { css: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-line bg-code p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-words text-fg">
      <code>{highlight(css)}</code>
    </pre>
  );
}
