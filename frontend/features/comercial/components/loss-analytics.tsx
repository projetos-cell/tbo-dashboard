"use client";

import { formatCurrency } from "@/features/comercial/lib/format-currency";
import type { LossReasonData } from "@/features/comercial/services/commercial-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconAlertTriangle } from "@tabler/icons-react";

interface LossAnalyticsProps {
  data: LossReasonData[];
  insight: string | null;
}

export function LossAnalytics({ data, insight }: LossAnalyticsProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">Nenhum deal perdido com motivo registrado.</p>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((s, d) => s + d.count, 0);
  const totalValue = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-4">
      {/* Insight */}
      {insight && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 flex items-start gap-2">
          <IconAlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">{insight}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Donut-like horizontal bars */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Motivos de Perda</CardTitle>
            <p className="text-xs text-muted-foreground">{total} deals perdidos · {formatCurrency(totalValue)}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.map((item) => (
                <div key={item.reason} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{item.reason}</span>
                    <span className="text-xs text-gray-500 tabular-nums">{item.count} ({item.pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Value by reason */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Valor Perdido por Motivo</CardTitle>
            <p className="text-xs text-muted-foreground">Quanto dinheiro foi perdido em cada categoria</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {data.map((item) => (
                <div key={item.reason} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-700">{item.reason}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
