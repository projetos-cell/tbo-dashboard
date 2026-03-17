// Feature #73 — Error boundary isolado para sub-rota redes-sociais

import { TabErrorBoundary } from "@/components/shared";

export default function RedesSociaisLayout({ children }: { children: React.ReactNode }) {
  return <TabErrorBoundary fallbackLabel="Redes Sociais">{children}</TabErrorBoundary>;
}
