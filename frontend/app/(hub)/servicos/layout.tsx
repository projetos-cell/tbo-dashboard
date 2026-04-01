import { TabErrorBoundary } from "@/components/shared";

export default function ServicosLayout({ children }: { children: React.ReactNode }) {
  return (
    <TabErrorBoundary fallbackLabel="Hub de Servicos">
      {children}
    </TabErrorBoundary>
  );
}
