"use client";

import { useEffect, useRef, useState } from "react";
import type { SlashCommand } from "./blog-slash-commands";
import { cn } from "@/lib/utils";

interface BlogSlashMenuProps {
  items: SlashCommand[];
  clientRect: (() => DOMRect | null) | null;
  onSelect: (item: SlashCommand) => void;
  onClose: () => void;
}

export function BlogSlashMenu({ items, clientRect, onSelect, onClose }: BlogSlashMenuProps) {
  const [selected, setSelected] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(0);
  }, [items]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((i) => Math.min(i + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (items[selected]) onSelect(items[selected]);
      } else if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [items, selected, onSelect, onClose]);

  if (items.length === 0) return null;

  const rect = clientRect?.();
  const style = rect
    ? {
        position: "fixed" as const,
        top: rect.bottom + 4,
        left: rect.left,
        zIndex: 50,
      }
    : { display: "none" as const };

  return (
    <div ref={ref} style={style} className="w-56 rounded-lg border bg-popover shadow-lg overflow-hidden">
      {items.map((item, i) => (
        <button
          key={item.title}
          type="button"
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-colors",
            i === selected && "bg-accent",
          )}
          onMouseDown={(e) => { e.preventDefault(); onSelect(item); }}
          onMouseEnter={() => setSelected(i)}
        >
          <span className="w-7 h-7 flex items-center justify-center rounded border bg-background text-xs font-mono font-bold shrink-0">
            {item.icon}
          </span>
          <div>
            <p className="text-xs font-medium">{item.title}</p>
            <p className="text-[10px] text-muted-foreground">{item.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
