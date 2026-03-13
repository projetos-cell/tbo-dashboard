"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconCircleArrowDown,
  IconCircleArrowUp,
  IconTrendingUp,
} from "@tabler/icons-react";
import { fmt } from "@/features/financeiro/lib/formatters";
import type { FinanceAgingData } from "@/features/financeiro/services/finance-types";

interface ContasSummaryCardsProps {
  aging: FinanceAgingData | undefined;
}

export function ContasSummaryCards({ aging }: ContasSummaryCardsProps) {
  const gap = (aging?.totalAr ?? 0) - (aging?.totalAp ?? 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
            <IconCircleArrowDown className="size-3.5 text-emerald-500" />
            AR Vencido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold text-emerald-600">
            {fmt(aging?.totalAr ?? 0)}
          </p>
          <p className="text-xs text-muted-foreground">
            {aging?.totalArCount ?? 0} títulos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
            <IconCircleArrowUp className="size-3.5 text-red-500" />
            AP Vencido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold text-red-600">
            {fmt(aging?.totalAp ?? 0)}
          </p>
          <p className="text-xs text-muted-foreground">
            {aging?.totalApCount ?? 0} títulos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
            <IconTrendingUp className="size-3.5 text-blue-500" />
            AR Projetado (12m)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold text-blue-600">
            {fmt(aging?.projectedAr ?? 0)}
          </p>
          <p className="text-xs text-muted-foreground">
            {aging?.projectedArCount ?? 0} títulos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
            Gap (AR - AP)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-xl font-bold ${gap >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {fmt(gap)}
          </p>
          <p className="text-xs text-muted-foreground">vencidos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
            Total Vencidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {(aging?.totalArCount ?? 0) + (aging?.totalApCount ?? 0)}
          </p>
          <p className="text-xs text-muted-foreground">títulos em atraso</p>
        </CardContent>
      </Card>
    </div>
  );
}
