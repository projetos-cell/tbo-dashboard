"use client";

import { IconBeach } from "@tabler/icons-react";
import { SectionCard } from "./section-card";

export function AbsencesWidget() {
  // TODO: conectar a dados reais de ausencias (ferias, licencas, etc.)
  return (
    <SectionCard>
      <div className="flex items-center gap-2 mb-3">
        <IconBeach className="size-4 text-sky-500" />
        <h3 className="text-sm font-semibold text-foreground">
          Ausencias Hoje
        </h3>
      </div>
      <div className="text-center py-4">
        <IconBeach className="size-5 mx-auto mb-1 text-muted-foreground opacity-30" />
        <p className="text-[11px] text-muted-foreground">
          Ninguem ausente hoje
        </p>
      </div>
    </SectionCard>
  );
}
