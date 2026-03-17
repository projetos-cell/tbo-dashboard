"use client";

import {
  IconFilter,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useFunnelData } from "@/features/marketing/hooks/use-marketing-analytics";

function FunilContent() {
  const { data: funnel, isLoading, error, refetch } = useFunnelData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Funil de Marketing</h1>
        <p className="text-sm text-muted-foreground">
          Conversao por etapa: RD Station ate Comercial.
        </p>
      </div>

      {error ? (
        <ErrorState message="Erro ao carregar funil." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : !funnel || funnel.length === 0 ? (
        <EmptyState icon={IconFilter} title="Sem dados de funil" description="Conecte o RD Station para visualizar o funil de marketing." />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Etapas do Funil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {funnel.map((stage, idx) => {
                const widthPct = funnel[0].count > 0 ? (stage.count / funnel[0].count) * 100 : 0;
                return (
                  <div key={stage.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{stage.stage}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{stage.count.toLocaleString("pt-BR")}</span>
                        {idx > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {stage.conversion_rate.toFixed(1)}% conv.
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-8 bg-muted/30 rounded-md overflow-hidden">
                      <div
                        className="h-full bg-purple-500/20 rounded-md transition-all"
                        style={{ width: `${Math.max(widthPct, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function FunilPage() {
  return (
    <RequireRole module="marketing" minRole="diretoria">
      <FunilContent />
    </RequireRole>
  );
}
