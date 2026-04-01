"use client";

import Link from "next/link";
import { IconFile, IconFileText } from "@tabler/icons-react";
import { SectionCard } from "./section-card";

export function DocumentsWidget() {
  // TODO: conectar a dados reais de documentos recentes
  return (
    <SectionCard>
      <h3 className="text-sm font-semibold mb-3 text-foreground">
        Documentos
      </h3>

      <div className="text-center py-6">
        <IconFileText className="size-6 mx-auto mb-2 text-muted-foreground opacity-30" />
        <p className="text-xs text-muted-foreground mb-2">
          Nenhum documento recente
        </p>
        <Link
          href="/conhecimento"
          className="inline-flex items-center gap-1 text-xs font-medium text-hub-orange hover:underline"
        >
          <IconFile className="size-3" />
          Explorar base de conhecimento
        </Link>
      </div>
    </SectionCard>
  );
}
