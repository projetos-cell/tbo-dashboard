"use client";

import { useMemo } from "react";

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

interface BlogTocProps {
  body: string;
}

function extractToc(html: string): TocItem[] {
  if (typeof window === "undefined") return [];
  const div = document.createElement("div");
  div.innerHTML = html;
  const headings = div.querySelectorAll("h2, h3");
  return Array.from(headings).map((h, i) => ({
    id: `toc-${i}`,
    text: h.textContent ?? "",
    level: (parseInt(h.tagName[1]) as 2 | 3),
  })).filter((h) => h.text.trim());
}

export function BlogToc({ body }: BlogTocProps) {
  const items = useMemo(() => extractToc(body), [body]);

  if (items.length < 2) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Indice</p>
      <nav className="space-y-1">
        {items.map((item, i) => (
          <a
            key={i}
            href={`#${item.id}`}
            className={`block text-xs text-muted-foreground hover:text-foreground transition-colors truncate ${
              item.level === 3 ? "pl-3" : ""
            }`}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </div>
  );
}
