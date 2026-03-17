// Feature #73 — Error boundary isolado para sub-rota campanhas

import { TabErrorBoundary } from "@/components/shared";

export default function CampanhasLayout({ children }: { children: React.ReactNode }) {
  return <TabErrorBoundary fallbackLabel="Campanhas">{children}</TabErrorBoundary>;
}
