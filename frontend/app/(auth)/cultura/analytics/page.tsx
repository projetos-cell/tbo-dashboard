"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequireRole } from "@/components/auth/require-role";
import { CulturaOverviewStats } from "@/components/cultura/cultura-overview-stats";
import { useCulturaItems } from "@/hooks/use-cultura";
import {
  CULTURA_CATEGORIES,
  CULTURA_STATUS,
  type CulturaCategoryKey,
  type CulturaStatusKey,
} from "@/lib/constants";

export default function CulturaAnalyticsPage() {
  return (
    <RequireRole allowed={["admin", "po"]}>
      <AnalyticsContent />
    </RequireRole>
  );
}

function AnalyticsContent() {
  const { data: items, isLoading } = useCulturaItems();

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
        <p className="text-sm text-muted-foreground">
          Metricas e insights sobre o conteudo de cultura. Visivel apenas para
          fundadores e administradores.
        </p>
      </div>

      <CulturaOverviewStats items={items} isLoading={isLoading} />

      {/* Summary metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total de itens" value={totalItems} />
        <MetricCard
          label="Publicados"
          value={publishedItems}
          color="text-green-600"
        />
        <MetricCard
          label="Rascunhos"
          value={draftItems}
          color="text-amber-600"
        />
        <MetricCard
          label="Com edicoes"
          value={editedItems}
          color="text-blue-600"
        />
      </div>

      {/* Status breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Distribuicao por status
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
                    <span className="text-muted-foreground">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
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
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <p className={`text-2xl font-bold ${color || ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
