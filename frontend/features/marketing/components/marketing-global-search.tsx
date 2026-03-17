"use client";

// Feature #69 — Busca global dentro do módulo marketing (campanhas + conteúdos + posts sociais)

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconSearch, IconSpeakerphone, IconPencil, IconBrandInstagram, IconX } from "@tabler/icons-react";
import { useMarketingCampaigns } from "../hooks/use-marketing-campaigns";
import { useContentItems } from "../hooks/use-marketing-content";

interface SearchResult {
  id: string;
  label: string;
  sub?: string;
  href: string;
  group: "campanhas" | "conteudo" | "posts";
}

const GROUP_META = {
  campanhas: { label: "Campanhas", Icon: IconSpeakerphone, color: "text-amber-500" },
  conteudo: { label: "Conteúdos", Icon: IconPencil, color: "text-purple-500" },
  posts: { label: "Posts Sociais", Icon: IconBrandInstagram, color: "text-pink-500" },
} as const;

export function MarketingGlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: campaigns } = useMarketingCampaigns();
  const { data: contentItems } = useContentItems();

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const out: SearchResult[] = [];

    (campaigns ?? []).forEach((c) => {
      if (
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        out.push({
          id: `campaign-${c.id}`,
          label: c.name,
          sub: c.status,
          href: "/marketing/campanhas",
          group: "campanhas",
        });
      }
    });

    (contentItems ?? []).forEach((ci) => {
      if (
        ci.title.toLowerCase().includes(q) ||
        ci.channel?.toLowerCase().includes(q) ||
        ci.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        out.push({
          id: `content-${ci.id}`,
          label: ci.title,
          sub: ci.type,
          href: "/marketing/conteudo",
          group: "conteudo",
        });
      }
    });

    return out.slice(0, 12);
  }, [query, campaigns, contentItems]);

  // Group results
  const grouped = useMemo(() => {
    const map = new Map<SearchResult["group"], SearchResult[]>();
    results.forEach((r) => {
      const existing = map.get(r.group) ?? [];
      map.set(r.group, [...existing, r]);
    });
    return map;
  }, [results]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(result: SearchResult) {
    setQuery("");
    setOpen(false);
    router.push(result.href);
  }

  return (
    <div className="relative w-full max-w-md" ref={wrapperRef}>
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar campanhas, conteúdos, posts..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="w-full rounded-md border border-input bg-background pl-9 pr-8 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <IconX className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute z-50 mt-1.5 w-full rounded-md border bg-popover shadow-lg overflow-hidden">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              Nenhum resultado para &ldquo;{query}&rdquo;
            </p>
          ) : (
            Array.from(grouped.entries()).map(([group, items]) => {
              const meta = GROUP_META[group];
              const Icon = meta.Icon;
              return (
                <div key={group}>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 border-b bg-muted/30">
                    <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {meta.label}
                    </span>
                  </div>
                  {items.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent text-left transition-colors"
                      onClick={() => handleSelect(r)}
                    >
                      <span className="flex-1 min-w-0">
                        <span className="font-medium truncate block">{r.label}</span>
                        {r.sub && (
                          <span className="text-xs text-muted-foreground">{r.sub}</span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
