"use client";

import { IconFileText } from "@tabler/icons-react";
import { CulturaItemsPage } from "@/features/cultura/components/cultura-items-page";

export default function DocumentosPage() {
  return (
    <CulturaItemsPage
      category="documento"
      icon={IconFileText}
      title="Documentos"
      description="Documentos e referencias importantes da cultura da empresa."
      buttonLabel="Novo documento"
      searchPlaceholder="Buscar documentos..."
      emptyTitle="Nenhum documento cadastrado"
      emptyDescription="Adicione documentos e referencias importantes da cultura da empresa."
    />
  );
}
