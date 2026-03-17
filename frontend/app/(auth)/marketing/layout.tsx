"use client";

// Feature #78 — Breadcrumb dinâmico no layout do marketing

import { TabErrorBoundary } from "@/components/shared";
import { MarketingBreadcrumb } from "@/features/marketing/components/marketing-breadcrumb";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TabErrorBoundary fallbackLabel="Marketing">
      <div className="space-y-0">
        <MarketingBreadcrumb />
        {children}
      </div>
    </TabErrorBoundary>
  );
}
