"use client";

import { useMemo } from "react";
import { IconExternalLink, IconWorld } from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UrlFieldPreviewProps {
  url: string;
  className?: string;
}

/**
 * P05 — Renders a URL field with favicon + domain, opens in new tab on click.
 * Uses Google's favicon service for reliable favicon fetching.
 */
export function UrlFieldPreview({ url, className }: UrlFieldPreviewProps) {
  const parsed = useMemo(() => {
    try {
      const u = new URL(url.startsWith("http") ? url : `https://${url}`);
      return {
        href: u.href,
        domain: u.hostname.replace(/^www\./, ""),
        faviconUrl: `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`,
      };
    } catch {
      return null;
    }
  }, [url]);

  if (!parsed) {
    return (
      <span className="text-xs text-muted-foreground truncate">{url}</span>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={parsed.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-xs text-foreground transition-colors hover:bg-accent/50 hover:border-primary/30 ${className ?? ""}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={parsed.faviconUrl}
            alt=""
            className="size-3.5 shrink-0 rounded-sm"
            onError={(e) => {
              // Fallback to generic icon
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <IconWorld className="size-3 shrink-0 text-muted-foreground hidden" />
          <span className="truncate max-w-[180px]">{parsed.domain}</span>
          <IconExternalLink className="size-3 shrink-0 text-muted-foreground" />
        </a>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs max-w-[300px] break-all">
        {parsed.href}
      </TooltipContent>
    </Tooltip>
  );
}
