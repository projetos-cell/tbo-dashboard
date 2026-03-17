"use client";

import {
  IconTargetArrow,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useChannelAttribution } from "@/features/marketing/hooks/use-marketing-analytics";

function AttributionContent() {
  const { data: attribution, isLoading, error, refetch } = useChannelAttribution();

  const fmt = (v: number) => `R$ ${(v / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Atribuicao por Canal</h1>
        <p className="text-sm text-muted-foreground">
          Canal -&gt; Lead -&gt; Venda: atribuicao de receita por canal de marketing.
        </p>
      </div>

      {error ? (
        <ErrorState message="Erro ao carregar atribuicao." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : !attribution || attribution.length === 0 ? (
        <EmptyState icon={IconTargetArrow} title="Sem dados de atribuicao" description="Dados de atribuicao aparecerao aqui quando houver leads e vendas rastreados por canal." />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Atribuicao por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Canal</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Leads</th>
                    <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground md:table-cell">Oportunidades</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Vendas</th>
                    <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground lg:table-cell">Receita</th>
                    <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground lg:table-cell">Custo</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {attribution.map((ch) => (
                    <tr key={ch.channel} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium capitalize">{ch.channel}</td>
                      <td className="px-4 py-3 text-right">{ch.leads}</td>
                      <td className="hidden px-4 py-3 text-right md:table-cell">{ch.opportunities}</td>
                      <td className="px-4 py-3 text-right">{ch.deals_won}</td>
                      <td className="hidden px-4 py-3 text-right lg:table-cell">{fmt(ch.revenue)}</td>
                      <td className="hidden px-4 py-3 text-right lg:table-cell">{fmt(ch.cost)}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={ch.roi > 0 ? "default" : "secondary"} className="text-xs">
                          {ch.roi.toFixed(1)}x
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AttributionPage() {
  return (
    <RequireRole module="marketing" minRole="diretoria">
      <AttributionContent />
    </RequireRole>
  );
}
