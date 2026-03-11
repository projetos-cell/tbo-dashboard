"use client";

import { IconPackage, IconClock } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

export function FreeMaterialsSection() {
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <div className="mb-6 flex items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold">Materiais TBO</h2>
          <p className="text-muted-foreground">
            Templates, guias e frameworks exclusivos.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1 text-xs">
          <IconClock className="h-3 w-3" />
          Em breve
        </Badge>
      </div>

      <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/50 bg-secondary/10 p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/30">
          <IconPackage className="h-7 w-7 text-muted-foreground/60" />
        </div>
        <div className="text-center">
          <p className="font-medium text-muted-foreground">
            Estamos preparando materiais exclusivos
          </p>
          <p className="mt-1 text-sm text-muted-foreground/60">
            Templates de branding, guias de mercado imobiliário, checklists de produção e mais.
          </p>
        </div>
      </div>
    </div>
  );
}
