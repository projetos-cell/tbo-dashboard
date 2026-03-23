"use client";

import { TabErrorBoundary } from "@/components/shared";

export default function ConhecimentoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TabErrorBoundary fallbackLabel="Base de Conhecimento">
      {children}
    </TabErrorBoundary>
  );
}
