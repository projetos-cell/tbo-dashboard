"use client";

import {
  IconFileText,
  IconPlus,
  IconDownload,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useMarketingReports } from "@/features/marketing/hooks/use-marketing-analytics";

const REPORT_TYPE_LABELS: Record<string, string> = {
  mensal: "Mensal",
  trimestral: "Trimestral",
  campanha: "Campanha",
  canal: "Canal",
  custom: "Customizado",
};

function RelatoriosContent() {
  const { data: reports, isLoading, error, refetch } = useMarketingReports();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatorios de Marketing</h1>
          <p className="text-sm text-muted-foreground">
            Relatorios comparativos e historico de analises.
          </p>
        </div>
        <Button>
          <IconPlus className="mr-1 h-4 w-4" /> Gerar Relatorio
        </Button>
      </div>

      {error ? (
        <ErrorState message="Erro ao carregar relatorios." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
      ) : !reports || reports.length === 0 ? (
        <EmptyState icon={IconFileText} title="Nenhum relatorio gerado" description="Gere seu primeiro relatorio de marketing para acompanhar resultados." />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Relatorio</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Periodo</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">Criado em</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acao</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{report.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{REPORT_TYPE_LABELS[report.type] ?? report.type}</Badge>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {new Date(report.period_start).toLocaleDateString("pt-BR")} - {new Date(report.period_end).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                    {new Date(report.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="h-7">
                      <IconDownload className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
            {reports.length} {reports.length === 1 ? "relatorio" : "relatorios"}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RelatoriosMarketingPage() {
  return (
    <RequireRole module="marketing" minRole="diretoria">
      <RelatoriosContent />
    </RequireRole>
  );
}
