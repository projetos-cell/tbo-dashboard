"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Eye, MousePointerClick, UserSearch, TrendingUp } from "lucide-react";
import {
  fmtNum,
  MONTHS_PT,
  type RsmMetricRow,
  type RsmAccountRow,
} from "./rsm-helpers";

interface Props {
  account: RsmAccountRow;
  metrics: RsmMetricRow[];
}

export function RsmAccountDashboard({ account, metrics }: Props) {
  const latestMetric = metrics[metrics.length - 1];
  const firstMetric = metrics[0];
  const meta = (latestMetric?.metadata ?? {}) as Record<string, unknown>;

  const totalViews = (meta.total_views as number) ?? 0;
  const totalInteractions = (meta.total_interactions as number) ?? 0;
  const profileVisits = latestMetric?.profile_views ?? 0;
  const followers = account?.followers_count ?? 0;
  const firstFollowers = firstMetric?.followers ?? 0;
  const growthPct =
    firstFollowers > 0
      ? (((followers - firstFollowers) / firstFollowers) * 100).toFixed(1)
      : "0";

  // Reach
  const reachData = useMemo(() => {
    const paid = (meta.reach_paid as number) ?? 0;
    const organic = (meta.reach_organic as number) ?? 0;
    const total = paid + organic;
    const paidPct = total > 0 ? ((paid / total) * 100).toFixed(1) : "0";
    const orgPct = total > 0 ? ((organic / total) * 100).toFixed(1) : "0";
    return { paid, organic, total, paidPct, orgPct };
  }, [meta]);

  // Audience
  const audience = (meta.audience as Record<string, unknown>) ?? {};
  const gender = (audience.gender as Record<string, number>) ?? {};
  const topCities = (audience.top_cities as Record<string, number>) ?? {};
  const ageRanges = (audience.age_ranges as Record<string, number>) ?? {};
  const maxCity = Math.max(...Object.values(topCities), 1);
  const maxAge = Math.max(...Object.values(ageRanges), 1);

  // Follower growth
  const maxFollowers = Math.max(...metrics.map((x) => x.followers ?? 0), 1);
  const avgGrowth =
    metrics.length > 1
      ? Math.round(
          (followers - (firstMetric?.followers ?? 0)) /
            Math.max(metrics.length - 1, 1)
        )
      : 0;

  return (
    <div className="space-y-8">
      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<Users className="h-4 w-4" />}
          label="Seguidores"
          value={fmtNum(followers)}
          sub={`de ~${fmtNum(firstFollowers)} em ${MONTHS_PT[new Date(firstMetric?.date ?? "").getMonth() + 1] ?? ""}/${String(new Date(firstMetric?.date ?? "").getFullYear()).slice(2)}`}
          badge={`+${growthPct}%`}
        />
        <KpiCard
          icon={<Eye className="h-4 w-4" />}
          label="Visualizações Totais"
          value={fmtNum(totalViews)}
          sub="orgânicas + pagas"
          accent
        />
        <KpiCard
          icon={<MousePointerClick className="h-4 w-4" />}
          label="Interações Totais"
          value={fmtNum(totalInteractions)}
          sub="curtidas, comentários, saves, shares"
        />
        <KpiCard
          icon={<UserSearch className="h-4 w-4" />}
          label="Visitas ao Perfil"
          value={fmtNum(profileVisits)}
          sub="no período analisado"
        />
      </div>

      {/* Reach */}
      {reachData.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alcance · últimos 30 dias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <MiniKpi label="Alcance Total" value={fmtNum(reachData.total)} />
              <MiniKpi label="Pago" value={fmtNum(reachData.paid)} className="text-orange-500" />
              <MiniKpi label="Orgânico" value={fmtNum(reachData.organic)} className="text-blue-500" />
              <MiniKpi label="% Pago" value={`${reachData.paidPct}%`} />
            </div>
            <div className="flex h-10 overflow-hidden rounded-lg">
              <div
                className="flex items-center justify-center bg-orange-500 text-xs font-semibold text-white"
                style={{ flex: Number(reachData.paidPct) }}
              >
                Pago · {reachData.paidPct}%
              </div>
              <div
                className="flex items-center justify-center bg-blue-600 text-xs text-white"
                style={{ flex: Number(reachData.orgPct) }}
              >
                {Number(reachData.orgPct) > 3 ? `${reachData.orgPct}%` : ""}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Orgânico representa {reachData.orgPct}% do alcance total nos últimos 30 dias.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Follower Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Crescimento de Seguidores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-40">
            {metrics.map((m, i) => {
              const pct = ((m.followers ?? 0) / maxFollowers) * 100;
              const month = MONTHS_PT[new Date(m.date).getMonth() + 1] ?? "";
              return (
                <div key={i} className="flex flex-1 flex-col items-center justify-end h-full gap-1">
                  <span className="text-[11px] font-medium text-primary tabular-nums">
                    {fmtNum(m.followers ?? 0)}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-primary/80"
                    style={{ height: `${Math.max(pct, 4)}%` }}
                  />
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
                    {month}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Crescimento médio de ~{avgGrowth} seguidores/mês
          </p>
        </CardContent>
      </Card>

      {/* Audience: Gender + Cities */}
      {(Object.keys(gender).length > 0 || Object.keys(topCities).length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {Object.keys(gender).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Seguidores por Gênero</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-8">
                  <svg viewBox="0 0 120 120" width={120} height={120}>
                    <circle cx={60} cy={60} r={48} fill="none" className="stroke-muted" strokeWidth={18} />
                    <circle
                      cx={60} cy={60} r={48} fill="none" className="stroke-blue-500" strokeWidth={18}
                      strokeDasharray={`${(gender.male ?? 0) / 100 * 301.6} 301.6`}
                      transform="rotate(-90 60 60)" strokeLinecap="round"
                    />
                    <circle
                      cx={60} cy={60} r={48} fill="none" className="stroke-orange-500" strokeWidth={18}
                      strokeDasharray={`${(gender.female ?? 0) / 100 * 301.6} 301.6`}
                      strokeDashoffset={-((gender.male ?? 0) / 100 * 301.6)}
                      transform="rotate(-90 60 60)" strokeLinecap="round"
                    />
                  </svg>
                  <div className="flex flex-col gap-3">
                    <LegendItem className="text-blue-500" label="Masculino" pct={`${gender.male ?? 0}%`} />
                    <LegendItem className="text-orange-500" label="Feminino" pct={`${gender.female ?? 0}%`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {Object.keys(topCities).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Top Cidades</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(topCities)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([city, count]) => (
                    <div key={city} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 text-right text-sm text-muted-foreground">{city}</span>
                      <div className="flex-1 h-6 rounded bg-muted overflow-hidden">
                        <div
                          className="h-full rounded bg-primary"
                          style={{ width: `${(count / maxCity) * 100}%` }}
                        />
                      </div>
                      <span className="w-14 shrink-0 text-right text-sm font-medium tabular-nums">
                        {fmtNum(count)}
                      </span>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Age Ranges */}
      {Object.keys(ageRanges).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Audiência por Faixa Etária</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-36">
              {Object.entries(ageRanges).map(([range, count]) => {
                const pct = (count / maxAge) * 100;
                const isPeak = pct >= 90;
                return (
                  <div key={range} className="flex flex-1 flex-col items-center justify-end h-full gap-1">
                    <div
                      className={`w-full rounded-t-md ${isPeak ? "bg-primary" : pct > 20 ? "bg-primary/50" : "bg-muted"}`}
                      style={{ height: `${Math.max(pct, 4)}%` }}
                    />
                    <span className="text-[11px] text-muted-foreground">{range}</span>
                    <span className={`text-[10px] tabular-nums ${isPeak ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                      {fmtNum(count)}
                    </span>
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

/* ── Sub-components ── */

function KpiCard({
  icon,
  label,
  value,
  sub,
  badge,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  badge?: string;
  accent?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          {icon}
          <span className="text-xs uppercase tracking-wider">{label}</span>
        </div>
        <div className={`text-3xl font-semibold tracking-tight ${accent ? "text-blue-500" : ""}`}>
          {value}
        </div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        {badge && (
          <Badge variant="secondary" className="mt-2 bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <TrendingUp className="h-3 w-3 mr-1" /> {badge}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

function MiniKpi({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3 text-center">
      <div className={`text-lg font-semibold ${className ?? ""}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function LegendItem({ className, label, pct }: { className: string; label: string; pct: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${className.replace("text-", "bg-")}`} />
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold ml-auto">{pct}</span>
    </div>
  );
}
