"use client";

import { ModuleSidebar } from "@/components/layout/module-sidebar";
import { TabErrorBoundary } from "@/components/shared";
import { CULTURA_NAV_ITEMS } from "@/lib/constants";

export default function CulturaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full -m-4 md:-m-6">
      <ModuleSidebar title="Cultura" items={CULTURA_NAV_ITEMS} basePath="/cultura" />
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <TabErrorBoundary fallbackLabel="Cultura">
          {children}
        </TabErrorBoundary>
      </div>
    </div>
  );
}
