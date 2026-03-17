// Feature #73 — Error boundary isolado para sub-rota rsm

import { TabErrorBoundary } from "@/components/shared";

export default function RsmLayout({ children }: { children: React.ReactNode }) {
  return <TabErrorBoundary fallbackLabel="RSM">{children}</TabErrorBoundary>;
}
