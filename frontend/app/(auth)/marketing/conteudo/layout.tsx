// Feature #73 — Error boundary isolado para sub-rota conteudo

import { TabErrorBoundary } from "@/components/shared";

export default function ConteudoLayout({ children }: { children: React.ReactNode }) {
  return <TabErrorBoundary fallbackLabel="Conteúdo">{children}</TabErrorBoundary>;
}
