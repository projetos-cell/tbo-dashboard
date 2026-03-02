"use client";

import { ModuleSidebar } from "@/components/layout/module-sidebar";
import { PROJETOS_NAV_ITEMS } from "@/lib/constants";

export default function ProjetosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full -m-4 md:-m-6">
      <ModuleSidebar
        title="Projetos"
        items={PROJETOS_NAV_ITEMS}
        basePath="/projetos"
      />
      <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
    </div>
  );
}
