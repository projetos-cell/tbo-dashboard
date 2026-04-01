"use client";

import { IconAward, IconTrendingUp, IconUsers, IconBolt } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TierProgress } from "./tier-progress";

interface RecognitionKPIs {
  total: number;
  thisMonth: number;
  avgPerPerson: number;
  firefliesCount: number;
  pendingReview: number;
}

interface PointsBalance {
  earned: number;
  spent: number;
  balance: number;
}

interface RecognitionKPISectionProps {
  kpis: RecognitionKPIs | undefined;
  balance: PointsBalance | undefined;
}

export function RecognitionKPISection({ kpis, balance }: RecognitionKPISectionProps) {
  return (
    <>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <IconAward className="size-3.5" />
              Total
            </div>
            <p className="text-2xl font-bold">{kpis?.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <IconTrendingUp className="size-3.5" />
              Este mes
            </div>
            <p className="text-2xl font-bold">{kpis?.thisMonth ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <IconUsers className="size-3.5" />
              Media/pessoa
            </div>
            <p className="text-2xl font-bold">{kpis?.avgPerPerson != null ? kpis.avgPerPerson.toFixed(1) : "0"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <IconBolt className="size-3.5" />
              Fireflies
            </div>
            <p className="text-2xl font-bold">{kpis?.firefliesCount ?? 0}</p>
            {(kpis?.pendingReview ?? 0) > 0 && (
              <Badge variant="secondary" className="text-xs mt-1">
                {kpis?.pendingReview} pendentes
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {balance && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Meus Pontos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-gray-500">Ganhos:</span>{" "}
                <span className="font-semibold text-green-600">{balance.earned}</span>
              </div>
              <div>
                <span className="text-gray-500">Gastos:</span>{" "}
                <span className="font-semibold text-amber-600">{balance.spent}</span>
              </div>
              <div>
                <span className="text-gray-500">Saldo:</span>{" "}
                <span className="font-bold">{balance.balance}</span>
              </div>
            </div>
            <TierProgress points={balance.earned} />
          </CardContent>
        </Card>
      )}
    </>
  );
}
