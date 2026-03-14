"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RequireRole } from "@/features/auth/components/require-role";
import { CulturaOverviewStats } from "@/features/cultura/components/cultura-overview-stats";
import { ErrorState } from "@/components/shared";
import { useCulturaItems } from "@/features/cultura/hooks/use-cultura";
import {
  useRecognitionKPIs,
  useRecognitionMonthlyTrend,
} from "@/features/cultura/hooks/use-reconhecimentos";
import { useRitualTypes } from "@/features/cultura/hooks/use-ritual-types";
import { useRewardsKPIs } from "@/features/cultura/hooks/use-rewards";
import {
  CULTURA_CATEGORIES,
  CULTURA_STATUS,
  TBO_VALUES,
  type CulturaCategoryKey,
  type CulturaStatusKey,
} from "@/lib/constants";

export default function CulturaAnalyticsPage() {
  return (
    <RequireRole minRole="diretoria">
      <AnalyticsContent />
    </RequireRole>
  );
}

function AnalyticsContent() {
  const { data: items, isLoading, error, refetch } = useCulturaItems();
  const { data: recKPIs } = useRecognitionKPIs();
  const { data: trend, isLoading: trendLoading } = useRecognitionMonthlyTrend(6);
  const { data: rituals } = useRitualTypes(true);
  const { data: rewardKPIs } = useRewardsKPIs();

  const totalItems = items?.length || 0;
  const publishedItems =
    items?.filter((i) => i.status === "published").length || 0;
  const draftItems = items?.filter((i) => i.status === "draft").length || 0;
  const archivedItems =
    items?.filter((i) => i.status === "archived").length || 0;

  // Items per category
  const categoryBreakdown = (items || []).reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    },
    {}
  );

  // Items with versions > 1 (actively edited)
  const editedItems = items?.filter((i) => i.version > 1).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">
          Analytics de Cultura
        </h1>
        <p className="text-sm text-gray-500">
          Metricas e insights sobre o conteudo de cultura. Visivel apenas para
          fundadores e administradores.
        </p>
      </div>

      {error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : null}

      <CulturaOverviewStats
        items={items}
        isLoading={isLoading}
        recognitionCount={recKPIs?.total}
        ritualCount={rituals?.length}
        rewardsCount={rewardKPIs?.activeRewards}
      />

      {/* Summary metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total de itens" value={totalItems} isLoading={isLoading} />
        <MetricCard
          label="Publicados"
          value={publishedItems}
          color="text-green-600"
          isLoading={isLoading}
        />
        <MetricCard
          label="Rascunhos"
          value={draftItems}
          color="text-amber-600"
          isLoading={isLoading}
        />
        <MetricCard
          label="Com edicoes"
          value={editedItems}
          color="text-blue-600"
          isLoading={isLoading}
        />
      </div>

      {/* Recognition KPIs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Reconhecimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-2xl font-bold">{recKPIs?.total ?? 0}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{recKPIs?.thisMonth ?? 0}</p>
              <p className="text-xs text-gray-500">Este mes</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{recKPIs?.avgPerPerson?.toFixed(1) ?? "0"}</p>
              <p className="text-xs text-gray-500">Media por pessoa</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{recKPIs?.firefliesCount ?? 0}</p>
              <p className="text-xs text-gray-500">Via Fireflies</p>
            </div>
          </div>

          {/* Top values — bar chart */}
          {recKPIs?.byValue && recKPIs.byValue.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs font-medium text-gray-500 mb-3">Valores mais reconhecidos</p>
              <div className="space-y-2">
                {recKPIs.byValue.map((v: { value_id: string; value_name?: string; value_emoji?: string; count: number }) => {
                  const valDef = TBO_VALUES.find((tv) => tv.id === v.value_id);
                  const maxCount = recKPIs.byValue[0]?.count ?? 1;
                  const pct = Math.round((v.count / maxCount) * 100);
                  return (
                    <div key={v.value_id} className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1">
                          <span>{valDef?.emoji ?? v.value_emoji ?? ""}</span>
                          <span>{valDef?.name ?? v.value_name ?? v.value_id}</span>
                        </span>
                        <span className="text-gray-500 font-medium">{v.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-400 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly trend chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Tendência de reconhecimentos (últimos 6 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trendLoading ? (
            <Skeleton className="h-48 w-full rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trend ?? []} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(value, name) =>
                    [value ?? 0, name === "manual" ? "Manual" : "Fireflies"] as [number, string]
                  }
                />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value) => (value === "manual" ? "Manual" : "Fireflies")}
                />
                <Bar dataKey="manual" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} name="manual" />
                <Bar dataKey="fireflies" stackId="a" fill="#6366f1" radius={[4, 4, 0, 0]} name="fireflies" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Rewards KPIs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            TBO Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-2xl font-bold">{rewardKPIs?.activeRewards ?? 0}</p>
              <p className="text-xs text-gray-500">Recompensas ativas</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{rewardKPIs?.totalRedemptions ?? 0}</p>
              <p className="text-xs text-gray-500">Resgates totais</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{rewardKPIs?.pendingRedemptions ?? 0}</p>
              <p className="text-xs text-gray-500">Pendentes</p>
            </div>
            <div>
              <p className="text-2xl font-bold">R$ {rewardKPIs?.totalCostBrl?.toFixed(0) ?? "0"}</p>
              <p className="text-xs text-gray-500">Custo total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ritual types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Rituais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-2xl font-bold">{rituals?.length ?? 0}</p>
              <p className="text-xs text-gray-500">Total de rituais</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{rituals?.filter((r) => r.is_active).length ?? 0}</p>
              <p className="text-xs text-gray-500">Ativos</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{rituals?.filter((r) => r.is_system).length ?? 0}</p>
              <p className="text-xs text-gray-500">Sistema</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Distribuicao por status (itens genericos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(
              Object.entries(CULTURA_STATUS) as [
                CulturaStatusKey,
                (typeof CULTURA_STATUS)[CulturaStatusKey],
              ][]
            ).map(([key, def]) => {
              const count =
                key === "published"
                  ? publishedItems
                  : key === "draft"
                    ? draftItems
                    : archivedItems;
              const pct =
                totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{def.label}</span>
                    <span className="text-gray-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: def.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Category breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Itens por categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(
              Object.entries(CULTURA_CATEGORIES) as [
                CulturaCategoryKey,
                (typeof CULTURA_CATEGORIES)[CulturaCategoryKey],
              ][]
            ).map(([key, def]) => {
              const count = categoryBreakdown[key] || 0;
              return (
                <div
                  key={key}
                  className="flex items-center justify-between py-1.5 border-b last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="size-3 rounded-full"
                      style={{ backgroundColor: def.color }}
                    />
                    <span className="text-sm">{def.label}</span>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
  isLoading,
}: {
  label: string;
  value: number;
  color?: string;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
          </>
        ) : (
          <>
            <p className={`text-2xl font-bold ${color || ""}`}>{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
