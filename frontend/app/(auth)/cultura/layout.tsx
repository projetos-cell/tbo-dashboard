"use client";

import { TabErrorBoundary } from "@/components/shared";

export default function CulturaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TabErrorBoundary fallbackLabel="Cultura">
      {children}
    </TabErrorBoundary>
  );
}
