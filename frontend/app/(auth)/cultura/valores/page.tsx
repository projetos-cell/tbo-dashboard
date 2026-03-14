"use client";

import { IconHeart } from "@tabler/icons-react";
import { CulturaItemsPage } from "@/features/cultura/components/cultura-items-page";

export default function ValoresPage() {
  return (
    <CulturaItemsPage
      category="valor"
      icon={IconHeart}
      title="Valores"
      description="Os valores que guiam a cultura e as decisoes da empresa."
      buttonLabel="Novo valor"
      searchPlaceholder="Buscar valores..."
      emptyTitle="Nenhum valor cadastrado"
      emptyDescription="Defina os valores que orientam a cultura e as decisoes da empresa."
      hasStatusFilter
    />
  );
}
