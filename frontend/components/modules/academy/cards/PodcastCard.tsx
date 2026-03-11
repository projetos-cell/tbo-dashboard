"use client";

import { IconMicrophone, IconClock } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

export function PodcastCard() {
  return (
    <div className="group relative col-span-1 row-span-2 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-secondary/20 backdrop-blur-md md:col-span-2">
      <div className="absolute right-4 top-4 text-muted-foreground/40">
        <IconMicrophone className="h-8 w-8" />
      </div>
      <div className="flex h-full flex-col justify-end p-6 md:p-8">
        <span className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Audio
        </span>
        <div className="mb-2 flex items-center gap-3">
          <h3 className="text-3xl font-bold">Podcast</h3>
          <Badge variant="secondary" className="gap-1 text-xs">
            <IconClock className="h-3 w-3" />
            Em breve
          </Badge>
        </div>
        <p className="mb-6 text-muted-foreground">
          Conversas sobre mercado imobiliário, branding e processo criativo.
        </p>
        <span className="inline-flex w-fit cursor-not-allowed items-center gap-2 rounded-full border border-border/30 px-5 py-2.5 text-sm font-medium text-muted-foreground/60">
          <IconMicrophone className="h-4 w-4" />
          Em breve
        </span>
      </div>
    </div>
  );
}
