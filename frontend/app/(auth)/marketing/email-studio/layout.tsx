// Feature #73 — Error boundary isolado para sub-rota email-studio

import { TabErrorBoundary } from "@/components/shared";

export default function EmailStudioLayout({ children }: { children: React.ReactNode }) {
  return <TabErrorBoundary fallbackLabel="Email Studio">{children}</TabErrorBoundary>;
}
