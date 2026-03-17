"use client";

// Features #47 #48 #49 — Performance: KPIs por plataforma + gráfico engajamento + tabela comparativa

import { useState, useMemo } from "react";
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
import {
  IconChartBar,
  IconTrendingUp,
  IconEye,
  IconHeart,
  IconUsers,
  IconRefresh,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import {
  useRsmAccounts,
  useRsmPosts,
  useRsmMetrics,
} from "@/features/marketing/hooks/use-marketing-social";
import type { Database } from "@/lib/supabase/types";

type Account = Database["public"]["Tables"]["rsm_accounts"]["Row"];
type Post = Database["public"]["Tables"]["rsm_posts"]["Row"];

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
  twitter: "X (Twitter)",
  pinterest: "Pinterest",
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#e1306c",
  facebook: "#1877f2",
  linkedin: "#0a66c2",
  tiktok: "#888",
  youtube: "#ff0000",
  twitter: "#1da1f2",
  pinterest: "#e60023",
};

// ── KPI Card ──────────────────────────────────────────────────

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  isLoading?: boolean;
}

function KPICard({ label, value, sub, icon: Icon, color, isLoading }: KPICardProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-4 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    );
  }
  return (
    <div className="rounded-lg border bg-card p-4 space-y-1">
      <div className="flex items-center gap-2">
        <Icon className="size-4" style={{ color }} />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ── Period Selector ────────────────────────────────────────────

const PERIODS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
] as const;
type PeriodKey = "7d" | "30d" | "90d";

// ── Platform Stats computation ─────────────────────────────────

interface PlatformStats {
  platform: string;
  label: string;
  color: string;
  accounts: number;
  followers: number;
  posts: number;
  publishedPosts: number;
  // Derived from metrics JSON field if available
  totalReach: number;
  totalImpressions: number;
  totalEngagement: number;
  engagementRate: number;
}

function computePlatformStats(
  accounts: Account[],
  posts: Post[],
  periodDays: number
): PlatformStats[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - periodDays);

  const statsMap = new Map<string, PlatformStats>();

  for (const acc of accounts) {
    const platform = String(acc.platform ?? "outro");
    if (!statsMap.has(platform)) {
      statsMap.set(platform, {
        platform,
        label: PLATFORM_LABELS[platform] ?? platform,
        color: PLATFORM_COLORS[platform] ?? "#6b7280",
        accounts: 0,
        followers: 0,
        posts: 0,
        publishedPosts: 0,
        totalReach: 0,
        totalImpressions: 0,
        totalEngagement: 0,
        engagementRate: 0,
      });
    }
    const s = statsMap.get(platform)!;
    s.accounts += 1;
    s.followers += acc.followers_count ?? 0;
  }

  for (const post of posts) {
    const acc = accounts.find((a) => a.id === post.account_id);
    const platform = String(acc?.platform ?? "outro");
    const stats = statsMap.get(platform);
    if (!stats) continue;

    // Filter by period
    const postDate = post.published_date ?? post.scheduled_date ?? post.created_at;
    if (postDate && new Date(postDate) < cutoff) continue;

    stats.posts += 1;
    if (post.status === "publicado") {
      stats.publishedPosts += 1;
      const m = post.metrics as Record<string, number> | null;
      if (m) {
        stats.totalReach += m.reach ?? 0;
        stats.totalImpressions += m.impressions ?? 0;
        const eng = (m.likes ?? 0) + (m.comments ?? 0) + (m.shares ?? 0) + (m.saves ?? 0);
        stats.totalEngagement += eng;
      }
    }
  }

  // Calculate engagement rate per platform
  for (const s of statsMap.values()) {
    if (s.followers > 0 && s.publishedPosts > 0) {
      s.engagementRate = (s.totalEngagement / (s.followers * s.publishedPosts)) * 100;
    }
  }

  return Array.from(statsMap.values()).sort((a, b) => b.followers - a.followers);
}

// ── Engagement Chart ───────────────────────────────────────────

function EngagementChart({
  platformStats,
  isLoading,
}: {
  platformStats: PlatformStats[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-lg" />;
  }

  if (platformStats.length === 0) {
    return (
      <EmptyState
        icon={IconChartBar}
        title="Sem dados de engajamento"
        description="Conecte contas e publique posts para ver o gráfico."
      />
    );
  }

  const chartData = platformStats.map((s) => ({
    name: s.label,
    Seguidores: s.followers,
    Engajamento: s.totalEngagement,
    Posts: s.publishedPosts,
    fill: s.color,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid rgba(0,0,0,0.1)",
            fontSize: "12px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "11px" }} />
        <Bar dataKey="Seguidores" fill="#3b82f6" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Engajamento" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Posts" fill="#22c55e" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Comparative Table ──────────────────────────────────────────

function ComparativeTable({
  platformStats,
  isLoading,
}: {
  platformStats: PlatformStats[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded" />
        ))}
      </div>
    );
  }

  if (platformStats.length === 0) {
    return (
      <EmptyState
        icon={IconUsers}
        title="Sem dados comparativos"
        description="Conecte contas para ver comparativo entre plataformas."
      />
    );
  }

  const maxFollowers = Math.max(...platformStats.map((s) => s.followers), 1);

  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plataforma</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Contas</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Seguidores</th>
            <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground md:table-cell">
              Posts
            </th>
            <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground lg:table-cell">
              Engajamento
            </th>
            <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground lg:table-cell">
              Taxa Eng.
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground w-32">
              Alcance relativo
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {platformStats.map((s) => (
            <tr key={s.platform} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="font-medium">{s.label}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right text-muted-foreground">{s.accounts}</td>
              <td className="px-4 py-3 text-right font-medium">
                {s.followers.toLocaleString("pt-BR")}
              </td>
              <td className="hidden px-4 py-3 text-right text-muted-foreground md:table-cell">
                {s.publishedPosts}
              </td>
              <td className="hidden px-4 py-3 text-right text-muted-foreground lg:table-cell">
                {s.totalEngagement.toLocaleString("pt-BR")}
              </td>
              <td className="hidden px-4 py-3 text-right lg:table-cell">
                <span
                  className={`text-xs font-semibold ${
                    s.engagementRate >= 3 ? "text-emerald-600" : s.engagementRate >= 1 ? "text-amber-600" : "text-muted-foreground"
                  }`}
                >
                  {s.engagementRate.toFixed(2)}%
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${(s.followers / maxFollowers) * 100}%`,
                      backgroundColor: s.color,
                    }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────

function PerformanceContent() {
  const [period, setPeriod] = useState<PeriodKey>("30d");

  const { data: accounts, isLoading: la, error, refetch } = useRsmAccounts();
  const { data: posts, isLoading: lp } = useRsmPosts();
  const isLoading = la || lp;

  const periodDays = PERIODS.find((p) => p.label === period)?.days ?? 30;

  const platformStats = useMemo(
    () => computePlatformStats(accounts ?? [], posts ?? [], periodDays),
    [accounts, posts, periodDays]
  );

  // Aggregate KPIs
  const totalFollowers = platformStats.reduce((s, p) => s + p.followers, 0);
  const totalEngagement = platformStats.reduce((s, p) => s + p.totalEngagement, 0);
  const totalPosts = platformStats.reduce((s, p) => s + p.publishedPosts, 0);
  const avgEngRate =
    platformStats.length > 0
      ? platformStats.reduce((s, p) => s + p.engagementRate, 0) / platformStats.length
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Performance por Canal</h1>
          <p className="text-sm text-muted-foreground">
            Métricas consolidadas de todas as redes sociais.
          </p>
        </div>
        {/* #48 — Period selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border overflow-hidden">
            {PERIODS.map((p) => (
              <button
                key={p.label}
                onClick={() => setPeriod(p.label)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  period === p.label
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                } ${p.label !== "7d" ? "border-l" : ""}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg border text-muted-foreground hover:text-foreground transition-colors"
            title="Atualizar"
          >
            <IconRefresh className="size-4" />
          </button>
        </div>
      </div>

      {error ? (
        <ErrorState message="Erro ao carregar performance." onRetry={() => refetch()} />
      ) : (
        <>
          {/* #47 — KPIs por plataforma */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KPICard
              label="Seguidores totais"
              value={totalFollowers.toLocaleString("pt-BR")}
              icon={IconUsers}
              color="#3b82f6"
              isLoading={isLoading}
            />
            <KPICard
              label="Posts publicados"
              value={String(totalPosts)}
              sub={`últimos ${period}`}
              icon={IconChartBar}
              color="#8b5cf6"
              isLoading={isLoading}
            />
            <KPICard
              label="Engajamento total"
              value={totalEngagement.toLocaleString("pt-BR")}
              sub={`últimos ${period}`}
              icon={IconHeart}
              color="#ef4444"
              isLoading={isLoading}
            />
            <KPICard
              label="Taxa média eng."
              value={`${avgEngRate.toFixed(2)}%`}
              sub="por post publicado"
              icon={IconTrendingUp}
              color="#22c55e"
              isLoading={isLoading}
            />
          </div>

          {/* #48 — Engagement chart by period */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <IconEye className="size-4 text-muted-foreground" />
                Engajamento por plataforma — últimos {period}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EngagementChart platformStats={platformStats} isLoading={isLoading} />
            </CardContent>
          </Card>

          {/* #49 — Comparative table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <IconChartBar className="size-4 text-muted-foreground" />
                Comparativo entre plataformas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ComparativeTable platformStats={platformStats} isLoading={isLoading} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default function PerformancePage() {
  return (
    <RequireRole module="marketing">
      <PerformanceContent />
    </RequireRole>
  );
}
