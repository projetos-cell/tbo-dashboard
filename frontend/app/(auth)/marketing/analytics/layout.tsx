// Feature #73 — Error boundary isolado para sub-rota analytics

import { TabErrorBoundary } from "@/components/shared";

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <TabErrorBoundary fallbackLabel="Analytics">{children}</TabErrorBoundary>;
}
