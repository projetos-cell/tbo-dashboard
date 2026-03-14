"use client";

import { IconColumns3 } from "@tabler/icons-react";
import { CulturaItemsPage } from "@/features/cultura/components/cultura-items-page";

export default function PilaresPage() {
  return (
    <CulturaItemsPage
      category="pilar"
      icon={IconColumns3}
      title="Pilares"
      description="Os pilares fundamentais da cultura organizacional."
      buttonLabel="Novo pilar"
      searchPlaceholder="Buscar pilares..."
      emptyTitle="Nenhum pilar cadastrado"
      emptyDescription="Defina os pilares fundamentais da cultura organizacional."
      hasStatusFilter
    />
  );
}
