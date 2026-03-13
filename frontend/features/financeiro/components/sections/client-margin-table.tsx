"use client";

import { IconUsers } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FounderDashboardSnapshot } from "@/features/founder-dashboard/services/founder-dashboard";
import { fmt, fmtPct } from "@/features/financeiro/lib/formatters";

type ClientMargin = FounderDashboardSnapshot["clientMargins"][number];

interface Props {
  clientMargins: ClientMargin[];
}

export function ClientMarginTable({ clientMargins }: Props) {
  if (clientMargins.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <IconUsers className="h-4 w-4 text-gray-500" />
          Margem por Cliente (Top 10)
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Receita vs custos diretos atribuídos via projetos no período
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="text-left py-2 font-medium">Cliente</th>
                <th className="text-right py-2 font-medium">Receita</th>
                <th className="text-right py-2 font-medium">Custos</th>
                <th className="text-right py-2 font-medium">Margem</th>
                <th className="text-right py-2 font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {clientMargins.map((cm) => (
                <tr
                  key={cm.client}
                  className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-2 font-medium truncate max-w-[200px]">
                    {cm.client}
                  </td>
                  <td className="py-2 text-right text-emerald-600">
                    {fmt(cm.receita)}
                  </td>
                  <td className="py-2 text-right text-rose-500">
                    {fmt(cm.custos)}
                  </td>
                  <td
                    className={`py-2 text-right font-medium ${
                      cm.margem >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {fmt(cm.margem)}
                  </td>
                  <td
                    className={`py-2 text-right ${
                      cm.margemPct >= 30
                        ? "text-emerald-600"
                        : cm.margemPct >= 15
                          ? "text-amber-600"
                          : "text-red-600"
                    }`}
                  >
                    {fmtPct(cm.margemPct)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
