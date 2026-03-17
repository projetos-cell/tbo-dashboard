"use client";

import { TabErrorBoundary } from "@/components/shared";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TabErrorBoundary fallbackLabel="Marketing">
      {children}
    </TabErrorBoundary>
  );
}
